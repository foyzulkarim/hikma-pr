/**
 * Real LLM Service for Comprehensive Analysis
 * Integrates with your existing LM Studio setup
 */
import 'dotenv/config';
import axios from 'axios';
import { ModelConfig } from '../types/analysis.js';

export class RealLLMService {
  private baseUrl: string;
  private defaultModel: string;

  constructor(
    baseUrl: string = process.env.LM_STUDIO_URL || 'http://localhost:1234', 
    defaultModel: string = process.env.LLM_DEFAULT_MODEL || 'gemma-3-1b-it-qat'
  ) {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  /**
   * Generate response using LM Studio API (OpenAI-compatible)
   */
  async generateResponse(prompt: string, modelConfig?: ModelConfig): Promise<string> {
    const model = modelConfig?.name || this.defaultModel;
    const temperature = modelConfig?.temperature || 0.1;
    const maxTokens = modelConfig?.max_tokens || 4000;

    const requestData = {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: temperature,
      max_tokens: maxTokens,
      stream: false
    };

    try {
      console.log(`🤖 Calling LM Studio with model: ${model}`);
      
      const response = await axios.post(`${this.baseUrl}/v1/chat/completions`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutes timeout
      });

      const content = response.data.choices[0]?.message?.content || '';
      
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      console.log(`✅ LLM response received (${content.length} characters)`);
      return content;

    } catch (error: any) {
      console.error(`❌ LLM API call failed:`, error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('LM Studio is not running or not accessible at ' + this.baseUrl);
      }
      
      if (error.response?.status === 404) {
        throw new Error(`Model '${model}' not found in LM Studio. Available models: ${await this.getAvailableModels()}`);
      }
      
      throw new Error(`LLM API call failed: ${error.message}`);
    }
  }

  /**
   * Get available models from LM Studio
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/models`);
      return response.data.data.map((model: any) => model.id);
    } catch (error) {
      console.warn('Could not fetch available models:', error);
      return [this.defaultModel];
    }
  }

  /**
   * Test connection to LM Studio
   */
  async testConnection(): Promise<boolean> {
    try {
      const models = await this.getAvailableModels();
      console.log(`✅ LM Studio connection successful. Available models: ${models.join(', ')}`);
      return true;
    } catch (error) {
      console.error('❌ LM Studio connection failed:', error);
      return false;
    }
  }

  /**
   * Generate analysis with structured prompt
   */
  async generateAnalysis(
    analysisType: string,
    context: any,
    prompt: string,
    modelConfig?: ModelConfig
  ): Promise<{
    analysis: string;
    findings: any[];
    recommendations: any[];
    confidence: number;
  }> {
    const fullPrompt = this.buildStructuredPrompt(analysisType, context, prompt);
    
    try {
      const response = await this.generateResponse(fullPrompt, modelConfig);
      return this.parseStructuredResponse(response, analysisType);
    } catch (error: any) {
      console.error(`❌ ${analysisType} analysis failed:`, error);
      
      // Return a fallback response to keep the system working
      return {
        analysis: `${analysisType} analysis could not be completed due to LLM error: ${error.message}`,
        findings: [],
        recommendations: [{
          id: `fallback-${Date.now()}`,
          priority: 'should-fix',
          category: 'system',
          description: `Review ${analysisType} aspects manually due to analysis failure`,
          rationale: 'Automated analysis was not available',
          implementation: 'Perform manual review of the code changes',
          effort: 'medium'
        }],
        confidence: 0.3
      };
    }
  }

  private buildStructuredPrompt(analysisType: string, context: any, basePrompt: string): string {
    return `
ANALYSIS TYPE: ${analysisType.toUpperCase()}

CONTEXT:
${JSON.stringify(context, null, 2)}

TASK:
${basePrompt}

RESPONSE FORMAT:
Please provide your analysis in the following JSON format:
{
  "analysis": "Your detailed analysis here",
  "findings": [
    {
      "type": "finding-type",
      "severity": "low|medium|high|critical",
      "message": "Description of the finding",
      "file": "filename",
      "evidence": ["supporting evidence"]
    }
  ],
  "recommendations": [
    {
      "priority": "must-fix|should-fix|consider",
      "category": "category-name",
      "description": "What should be done",
      "rationale": "Why this is important",
      "implementation": "How to implement this"
    }
  ],
  "confidence": 0.8
}

Provide only the JSON response, no additional text.
`;
  }

  private parseStructuredResponse(response: string, analysisType: string): {
    analysis: string;
    findings: any[];
    recommendations: any[];
    confidence: number;
  } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          analysis: parsed.analysis || `${analysisType} analysis completed`,
          findings: parsed.findings || [],
          recommendations: parsed.recommendations || [],
          confidence: parsed.confidence || 0.7
        };
      }
    } catch (error) {
      console.warn(`⚠️ Could not parse structured response for ${analysisType}, using fallback parsing`);
    }

    // Fallback: parse unstructured response
    return this.parseUnstructuredResponse(response, analysisType);
  }

  private parseUnstructuredResponse(response: string, analysisType: string): {
    analysis: string;
    findings: any[];
    recommendations: any[];
    confidence: number;
  } {
    const findings: any[] = [];
    const recommendations: any[] = [];

    // Look for common patterns in the response
    const lines = response.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for issues/problems/concerns
      if (trimmed.match(/^[-*•]\s*(issue|problem|concern|warning|error)/i)) {
        findings.push({
          type: analysisType,
          severity: 'medium',
          message: trimmed.replace(/^[-*•]\s*/i, ''),
          file: 'multiple',
          evidence: [trimmed]
        });
      }
      
      // Look for recommendations/suggestions
      if (trimmed.match(/^[-*•]\s*(recommend|suggest|should|consider)/i)) {
        recommendations.push({
          priority: 'should-fix',
          category: analysisType,
          description: trimmed.replace(/^[-*•]\s*/i, ''),
          rationale: `${analysisType} improvement`,
          implementation: 'Review and implement the suggested change'
        });
      }
    }

    return {
      analysis: response,
      findings,
      recommendations,
      confidence: 0.6
    };
  }
}
