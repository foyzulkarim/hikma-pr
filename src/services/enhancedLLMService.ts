/**
 * Enhanced LLM Service - Universal Local LLM Integration
 * Leverages locally hosted LLMs for unlimited, cost-free PR analysis
 */
import { 
  AnalysisType,
  EnhancedPRContext,
  SpecializedAnalysis,
  Finding
} from '../types/analysis.js';

import { 
  UniversalLLMClient, 
  createLLMClient, 
  ChatMessage,
  ChatCompletionRequest 
} from './universalLLMClient.js';

import { 
  CURRENT_LLM_CONFIG, 
  MultiModelConfig,
  LLMModelConfig 
} from '../config/llmConfig.js';

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  responseTime: number;
}

export class EnhancedLLMService {
  private llmClients!: Map<AnalysisType, UniversalLLMClient>;
  private modelConfigs: MultiModelConfig;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor(customConfig?: Partial<MultiModelConfig>) {
    this.modelConfigs = { ...CURRENT_LLM_CONFIG, ...customConfig };
    this.initializeLLMClients();
  }

  private initializeLLMClients(): void {
    this.llmClients = new Map();
    
    // Create specialized clients for each analysis type
    for (const [analysisType, modelConfig] of Object.entries(this.modelConfigs)) {
      if (analysisType === 'synthesis') continue; // Handle synthesis separately
      
      const client = createLLMClient(modelConfig.provider, {
        enableRetry: true,
        enableFallback: true,
        fallbackProviders: this.getFallbackProviders(modelConfig),
        defaultParams: {
          temperature: this.getTemperatureForAnalysis(analysisType as AnalysisType),
          max_tokens: this.getMaxTokensForAnalysis(analysisType as AnalysisType)
        }
      });
      
      this.llmClients.set(analysisType as AnalysisType, client);
    }
  }

  private getFallbackProviders(primaryConfig: LLMModelConfig) {
    // Return alternative providers as fallback
    const fallbacks = [];
    
    // If primary is LM Studio, fallback to Ollama
    if (primaryConfig.provider.name === 'LM Studio') {
      fallbacks.push({
        name: 'Ollama',
        baseURL: 'http://localhost:11434',
        defaultModel: 'deepseek-coder:6.7b',
        timeout: 120000
      });
    }
    
    // If primary is Ollama, fallback to LM Studio
    if (primaryConfig.provider.name === 'Ollama') {
      fallbacks.push({
        name: 'LM Studio',
        baseURL: 'http://localhost:1234',
        defaultModel: 'deepseek-coder-6.7b-instruct',
        timeout: 120000
      });
    }
    
    return fallbacks;
  }

  private getTemperatureForAnalysis(analysisType: AnalysisType): number {
    const temperatures: Record<string, number> = {
      architectural: 0.3, // More deterministic for architectural analysis
      security: 0.2,      // Very deterministic for security analysis
      performance: 0.4,   // Slightly more creative for performance suggestions
      testing: 0.5,       // More creative for test case generation
      'code-quality': 0.3 // Focused for code quality analysis
    };
    return temperatures[analysisType] || 0.3;
  }

  private getMaxTokensForAnalysis(analysisType: AnalysisType): number {
    const maxTokens: Record<string, number> = {
      architectural: 3000, // Longer responses for architectural analysis
      security: 2500,      // Detailed security analysis
      performance: 2500,   // Detailed performance analysis
      testing: 2000,      // Concise testing recommendations
      'code-quality': 2000 // Standard length for code quality analysis
    };
    return maxTokens[analysisType] || 2000;
  }

  async generateAnalysis(
    analysisType: AnalysisType,
    context: EnhancedPRContext,
    prompt: string
  ): Promise<SpecializedAnalysis> {
    const startTime = Date.now();
    this.requestCount++;

    try {
      console.log(`🤖 Generating ${analysisType} analysis using local LLM...`);
      
      const client = this.llmClients.get(analysisType);
      if (!client) {
        throw new Error(`No LLM client configured for ${analysisType} analysis`);
      }

      // Build the chat messages
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: this.buildSystemPrompt(analysisType, context)
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      // Make the LLM request
      const validAnalysisTypes: (keyof MultiModelConfig)[] = ['architectural', 'security', 'performance', 'testing'];
      const configKey = validAnalysisTypes.includes(analysisType as keyof MultiModelConfig) 
        ? analysisType as keyof MultiModelConfig 
        : 'architectural';
      const modelConfig = this.modelConfigs[configKey];
      const response = await client.chatCompletion({
        model: modelConfig.provider.defaultModel,
        messages,
        temperature: this.getTemperatureForAnalysis(analysisType),
        max_tokens: this.getMaxTokensForAnalysis(analysisType)
      });

      const responseTime = Date.now() - startTime;
      this.recordPerformanceMetric(analysisType, responseTime);

      // Parse the response into structured analysis
      const analysis = await this.parseAnalysisResponse(
        response.choices[0].message.content,
        analysisType,
        context
      );

      console.log(`✅ ${analysisType} analysis completed in ${responseTime}ms`);
      
      return analysis;

    } catch (error: any) {
      this.errorCount++;
      const responseTime = Date.now() - startTime;
      
      console.error(`❌ ${analysisType} analysis failed after ${responseTime}ms:`, error.message);
      
      // Return fallback analysis
      return this.createFallbackAnalysis(analysisType, error.message);
    }
  }

  private buildSystemPrompt(analysisType: AnalysisType, context: EnhancedPRContext): string {
    const basePrompt = `You are a specialized ${analysisType} analysis expert for code review. 
Your task is to analyze pull request changes and provide detailed, actionable insights.

Repository Context:
- Language: ${context.repositoryMetadata?.language || 'Unknown'}
- Framework: ${context.repositoryMetadata?.framework || 'Unknown'}
- Architecture: ${context.repositoryMetadata?.architecture || 'Unknown'}

Direct Impact: ${context.blastRadius?.directImpact?.length || 0} files
Indirect Impact: ${context.blastRadius?.indirectImpact?.length || 0} files

Focus on providing:
1. Specific findings with evidence
2. Actionable recommendations
3. Risk assessment
4. Implementation guidance

Respond in structured format with clear sections.`;

    return basePrompt;
  }

  private async parseAnalysisResponse(
    content: string,
    analysisType: AnalysisType,
    context: EnhancedPRContext
  ): Promise<SpecializedAnalysis> {
    // Parse the LLM response into structured analysis
    // This is a simplified parser - could be enhanced with more sophisticated parsing
    
    const lines = content.split('\n').filter(line => line.trim());
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    let currentSection = '';
    let currentItem = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('finding') || trimmed.toLowerCase().includes('issue')) {
        if (currentItem) {
          findings.push({
            type: analysisType,
            severity: this.extractSeverity(currentItem),
            description: currentItem,
            evidence: [],
            location: 'multiple files'
          });
        }
        currentItem = trimmed;
        currentSection = 'findings';
      } else if (trimmed.toLowerCase().includes('recommend') || trimmed.toLowerCase().includes('suggest')) {
        if (currentItem && currentSection === 'findings') {
          findings.push({
            type: analysisType,
            severity: this.extractSeverity(currentItem),
            description: currentItem,
            evidence: [],
            location: 'multiple files'
          });
        }
        if (currentItem && currentSection === 'recommendations') {
          recommendations.push({
            type: analysisType,
            priority: this.extractPriority(currentItem),
            description: currentItem,
            implementation: 'See description for details',
            impact: 'medium'
          });
        }
        currentItem = trimmed;
        currentSection = 'recommendations';
      } else if (trimmed && currentItem) {
        currentItem += ' ' + trimmed;
      }
    }
    
    // Add the last item
    if (currentItem) {
      if (currentSection === 'findings') {
        findings.push({
          type: analysisType,
          severity: this.extractSeverity(currentItem),
          description: currentItem,
          evidence: [],
          location: 'multiple files'
        });
      } else if (currentSection === 'recommendations') {
        recommendations.push({
          type: analysisType,
          priority: this.extractPriority(currentItem),
          description: currentItem,
          implementation: 'See description for details',
          impact: 'medium'
        });
      }
    }

    return {
      type: analysisType,
      findings: findings.length > 0 ? findings : this.createDefaultFindings(analysisType),
      recommendations: recommendations.length > 0 ? recommendations : this.createDefaultRecommendations(analysisType),
      confidence: 0.8,
      riskLevel: this.calculateRiskLevel(findings)
    };
  }

  private calculateRiskLevel(findings: Finding[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (findings.some(f => f.severity === 'critical')) return 'CRITICAL';
    if (findings.some(f => f.severity === 'high')) return 'HIGH';
    if (findings.some(f => f.severity === 'medium')) return 'MEDIUM';
    return 'LOW';
  }

  private extractSeverity(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('critical') || lowerText.includes('severe')) return 'critical';
    if (lowerText.includes('high') || lowerText.includes('major')) return 'high';
    if (lowerText.includes('medium') || lowerText.includes('moderate')) return 'medium';
    return 'low';
  }

  private extractPriority(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('must') || lowerText.includes('critical')) return 'critical';
    if (lowerText.includes('should') || lowerText.includes('important')) return 'high';
    if (lowerText.includes('could') || lowerText.includes('consider')) return 'medium';
    return 'low';
  }

  private createDefaultFindings(analysisType: AnalysisType): any[] {
    return [{
      type: analysisType,
      severity: 'low' as const,
      description: `${analysisType} analysis completed - no major issues identified`,
      evidence: [],
      location: 'general'
    }];
  }

  private createDefaultRecommendations(analysisType: AnalysisType): any[] {
    return [{
      type: analysisType,
      priority: 'low' as const,
      description: `Continue following ${analysisType} best practices`,
      implementation: 'No specific action required',
      impact: 'low'
    }];
  }

  private createFallbackAnalysis(analysisType: AnalysisType, error: string): SpecializedAnalysis {
    return {
      type: analysisType,
      findings: [{
        id: `fallback-${analysisType}-${Date.now()}`,
        type: analysisType,
        severity: 'medium' as const,
        message: `${analysisType} analysis could not be completed due to LLM service error`,
        file: 'system',
        lineNumber: 0,
        evidence: [error],
        confidence: 0.3
      }],
      recommendations: [{
        id: `fallback-rec-${analysisType}-${Date.now()}`,
        priority: 'should-fix' as const,
        category: analysisType,
        description: 'Manual review recommended due to automated analysis failure',
        rationale: 'Automated analysis failed, manual review needed',
        implementation: 'Perform manual code review focusing on ' + analysisType + ' aspects',
        effort: 'medium' as const,
        confidence: 0.3
      }],
      confidence: 0.1,
      riskLevel: 'MEDIUM'
    };
  }

  private recordPerformanceMetric(analysisType: string, responseTime: number): void {
    if (!this.performanceMetrics.has(analysisType)) {
      this.performanceMetrics.set(analysisType, []);
    }
    this.performanceMetrics.get(analysisType)!.push(responseTime);
  }

  // Test all configured LLM connections
  async testConnections(): Promise<Record<AnalysisType, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [analysisType, client] of this.llmClients.entries()) {
      try {
        console.log(`🔍 Testing ${analysisType} LLM connection...`);
        const isConnected = await client.testConnection();
        results[analysisType] = isConnected;
        
        if (isConnected) {
          console.log(`✅ ${analysisType} LLM connection successful`);
        } else {
          console.warn(`⚠️ ${analysisType} LLM connection failed`);
        }
      } catch (error: any) {
        console.error(`❌ ${analysisType} LLM connection error:`, error.message);
        results[analysisType] = false;
      }
    }
    
    return results as Record<AnalysisType, boolean>;
  }

  // Get performance statistics
  getPerformanceStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [analysisType, times] of this.performanceMetrics.entries()) {
      if (times.length > 0) {
        stats[analysisType] = {
          requests: times.length,
          avgResponseTime: times.reduce((a, b) => a + b, 0) / times.length,
          minResponseTime: Math.min(...times),
          maxResponseTime: Math.max(...times)
        };
      }
    }
    
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      byAnalysisType: stats
    };
  }

  // Update model configuration
  updateModelConfig(analysisType: AnalysisType, newConfig: LLMModelConfig): void {
    const validAnalysisTypes: (keyof MultiModelConfig)[] = ['architectural', 'security', 'performance', 'testing'];
    if (validAnalysisTypes.includes(analysisType as keyof MultiModelConfig)) {
      this.modelConfigs[analysisType as keyof MultiModelConfig] = newConfig;
    }
    
    // Recreate the client for this analysis type
    const client = createLLMClient(newConfig.provider, {
      enableRetry: true,
      enableFallback: true,
      fallbackProviders: this.getFallbackProviders(newConfig),
      defaultParams: {
        temperature: this.getTemperatureForAnalysis(analysisType),
        max_tokens: this.getMaxTokensForAnalysis(analysisType)
      }
    });
    
    this.llmClients.set(analysisType, client);
    console.log(`🔄 Updated ${analysisType} model configuration`);
  }
}

export default EnhancedLLMService;
