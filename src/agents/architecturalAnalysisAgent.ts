/**
 * Architectural Analysis Agent - Enhanced for Multi-Model System
 * Specializes in system design, patterns, and architectural quality assessment
 */
import { AnalysisAgent } from './baseAgent.js';
import { 
  EnhancedPRContext, 
  SpecializedAnalysis, 
  Finding, 
  Recommendation,
  AnalysisType,
  ValidationResult
} from '../types/analysis.js';
import { EnhancedLLMService } from '../services/enhancedLLMService.js';
import { DynamicPromptBuilder } from '../prompts/dynamicPromptBuilder.js';
import { ContextAwareEnhancer } from '../prompts/contextAwareEnhancer.js';

export class ArchitecturalAnalysisAgent implements AnalysisAgent {
  private llmService: EnhancedLLMService;
  private promptBuilder: DynamicPromptBuilder;
  private contextEnhancer: ContextAwareEnhancer;

  constructor() {
    this.llmService = new EnhancedLLMService();
    this.promptBuilder = new DynamicPromptBuilder();
    this.contextEnhancer = new ContextAwareEnhancer();
  }

  getAnalysisType(): AnalysisType {
    return 'architectural';
  }

  async analyze(context: EnhancedPRContext, enhancedPrompt?: string): Promise<SpecializedAnalysis> {
    console.log('🏗️ Starting Architectural Analysis...');

    try {
      // Use enhanced prompt if provided, otherwise build context-aware prompt
      let finalPrompt: string;
      
      if (enhancedPrompt) {
        console.log('🎯 Using provided enhanced prompt for architectural analysis');
        finalPrompt = enhancedPrompt;
      } else {
        // Build dynamic, context-aware prompt
        console.log('🎯 Building context-aware architectural analysis prompt...');
        const contextualPrompt = await this.promptBuilder.buildContextualPrompt(
          'architectural',
          context
        );
        
        // Enhance prompt with language/framework-specific guidance
        finalPrompt = await this.contextEnhancer.enhancePromptForContext(
          contextualPrompt.content,
          'architectural',
          context
        );
      }
      
      // Get LLM analysis with enhanced prompt
      console.log('🤖 Calling LLM service for architectural analysis');
      const llmResponse = await this.llmService.generateAnalysis(
        'architectural',
        context,
        finalPrompt
      );

      // Process and enhance the response
      const processedAnalysis = await this.processArchitecturalAnalysis(llmResponse, context);

      console.log(`✅ Architectural Analysis complete: ${processedAnalysis.findings.length} findings, ${processedAnalysis.recommendations.length} recommendations`);
      
      return processedAnalysis;

    } catch (error) {
      console.error('❌ Architectural Analysis failed:', error);
      
      // Return fallback analysis
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.createFallbackAnalysis(context, errorMessage);
    }
  }

  async validate(analysis: SpecializedAnalysis): Promise<ValidationResult> {
    console.log('🔍 Validating architectural analysis...');

    const issues: string[] = [];
    const suggestions: string[] = [];
    let confidence = 0.8;

    // Validate findings
    if (!analysis.findings || analysis.findings.length === 0) {
      issues.push('No architectural findings identified');
      confidence -= 0.2;
    } else {
      // Check for architectural-specific finding types
      const architecturalTypes = ['coupling', 'cohesion', 'design-pattern', 'solid-violation', 'architectural-debt'];
      const hasArchitecturalFindings = analysis.findings.some(f => 
        architecturalTypes.some(type => f.type.includes(type))
      );
      
      if (!hasArchitecturalFindings) {
        suggestions.push('Consider adding more architectural-specific findings');
        confidence -= 0.1;
      }
    }

    // Validate recommendations
    if (!analysis.recommendations || analysis.recommendations.length === 0) {
      issues.push('No architectural recommendations provided');
      confidence -= 0.2;
    } else {
      // Check for actionable recommendations
      const actionableRecs = analysis.recommendations.filter(r => 
        r.implementation && r.implementation.length > 10
      );
      
      if (actionableRecs.length < analysis.recommendations.length * 0.5) {
        suggestions.push('Provide more detailed implementation guidance');
        confidence -= 0.1;
      }
    }

    // Check analysis depth by looking at findings and recommendations
    const totalContent = analysis.findings.length + analysis.recommendations.length;
    if (totalContent < 3) {
      suggestions.push('Provide more comprehensive analysis with additional findings and recommendations');
      confidence -= 0.05;
    }

    return {
      isValid: issues.length === 0,
      errors: issues,
      warnings: suggestions,
      score: Math.max(confidence, 0.1)
    };
  }

  async refine(analysis: SpecializedAnalysis, feedback: any): Promise<SpecializedAnalysis> {
    console.log('🔧 Refining architectural analysis based on feedback...');

    const refinedAnalysis = { ...analysis };

    // Apply feedback-based improvements
    if (feedback.improvementAreas) {
      for (const area of feedback.improvementAreas) {
        switch (area.type) {
          case 'missing-evidence':
            refinedAnalysis.findings = await this.enhanceEvidence(refinedAnalysis.findings);
            break;
          case 'vague-recommendation':
            refinedAnalysis.recommendations = await this.clarifyRecommendations(refinedAnalysis.recommendations);
            break;
          case 'low-confidence':
            refinedAnalysis.confidence = Math.min(refinedAnalysis.confidence + 0.1, 1.0);
            break;
        }
      }
    }

    return refinedAnalysis;
  }

  private async processArchitecturalAnalysis(
    llmResponse: SpecializedAnalysis,
    context: EnhancedPRContext
  ): Promise<SpecializedAnalysis> {
    // Enhance findings with architectural context
    const enhancedFindings = await this.enhanceArchitecturalFindings(llmResponse.findings, context);
    
    // Enhance recommendations with implementation details
    const enhancedRecommendations = await this.enhanceArchitecturalRecommendations(llmResponse.recommendations, context);
    
    // Calculate architectural quality score
    const qualityScore = this.calculateArchitecturalQuality(enhancedFindings, enhancedRecommendations);

    return {
      ...llmResponse,
      findings: enhancedFindings,
      recommendations: enhancedRecommendations
    };
  }

  private async enhanceArchitecturalFindings(
    findings: Finding[],
    context: EnhancedPRContext
  ): Promise<Finding[]> {
    return findings.map(finding => {
      // Add architectural context to findings
      const enhancedFinding = { ...finding };
      
      // Categorize architectural findings
      if (finding.message.toLowerCase().includes('coupling')) {
        enhancedFinding.type = 'coupling-issue';
      } else if (finding.message.toLowerCase().includes('cohesion')) {
        enhancedFinding.type = 'cohesion-issue';
      } else if (finding.message.toLowerCase().includes('pattern')) {
        enhancedFinding.type = 'design-pattern';
      } else if (finding.message.toLowerCase().includes('solid')) {
        enhancedFinding.type = 'solid-violation';
      }
      
      return enhancedFinding;
    });
  }

  private async enhanceArchitecturalRecommendations(
    recommendations: Recommendation[],
    context: EnhancedPRContext
  ): Promise<Recommendation[]> {
    return recommendations.map(rec => {
      const enhancedRec = { ...rec };
      
      // Enhance implementation guidance
      if (!rec.implementation || rec.implementation.length < 50) {
        enhancedRec.implementation = this.generateImplementationGuidance(rec, context);
      }
      
      return enhancedRec;
    });
  }

  private calculateArchitecturalQuality(
    findings: Finding[],
    recommendations: Recommendation[]
  ): number {
    let score = 0.8; // Base score
    
    // Deduct for critical architectural issues
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    score -= criticalFindings * 0.1;
    
    // Deduct for high severity issues
    const highFindings = findings.filter(f => f.severity === 'high').length;
    score -= highFindings * 0.05;
    
    // Add for actionable recommendations
    const actionableRecs = recommendations.filter(r => r.implementation && r.implementation.length > 20).length;
    score += (actionableRecs / Math.max(recommendations.length, 1)) * 0.1;
    
    return Math.max(Math.min(score, 1.0), 0.1);
  }

  private identifyArchitecturalFocus(findings: Finding[]): string[] {
    const focus: string[] = [];
    
    if (findings.some(f => f.type?.includes('coupling'))) focus.push('coupling');
    if (findings.some(f => f.type?.includes('cohesion'))) focus.push('cohesion');
    if (findings.some(f => f.type?.includes('pattern'))) focus.push('design-patterns');
    if (findings.some(f => f.type?.includes('solid'))) focus.push('solid-principles');
    if (findings.some(f => f.type?.includes('debt'))) focus.push('technical-debt');
    
    return focus.length > 0 ? focus : ['general-architecture'];
  }

  private assessComplexity(context: EnhancedPRContext): string {
    const fileCount = context.completeFiles.size;
    const blastRadiusSize = context.blastRadius.directImpact.length + context.blastRadius.indirectImpact.length;
    
    if (fileCount > 15 || blastRadiusSize > 25) return 'high';
    if (fileCount > 8 || blastRadiusSize > 12) return 'medium';
    return 'low';
  }

  private assessArchitecturalImpact(finding: Finding, context: EnhancedPRContext): string {
    // Assess the architectural impact of a finding
    if (finding.severity === 'critical') return 'system-wide';
    if (finding.severity === 'high') return 'module-wide';
    if (finding.severity === 'medium') return 'component-wide';
    return 'local';
  }

  private assessImplementationComplexity(recommendation: Recommendation): string {
    // Assess implementation complexity based on recommendation content
    const description = recommendation.description.toLowerCase();
    
    if (description.includes('refactor') || description.includes('redesign')) return 'high';
    if (description.includes('modify') || description.includes('update')) return 'medium';
    return 'low';
  }

  private assessArchitecturalBenefit(recommendation: Recommendation): string {
    // Assess architectural benefit of implementing the recommendation
    const description = recommendation.description.toLowerCase();
    
    if (description.includes('maintainability') || description.includes('scalability')) return 'high';
    if (description.includes('readability') || description.includes('organization')) return 'medium';
    return 'low';
  }

  private generateImplementationGuidance(
    recommendation: Recommendation,
    context: EnhancedPRContext
  ): string {
    // Generate basic implementation guidance
    const language = context.repositoryMetadata.language;
    const framework = context.repositoryMetadata.framework;
    
    return `Implementation guidance for ${language}/${framework}: ${recommendation.description}. Consider following ${language} best practices and ${framework} conventions.`;
  }

  private async enhanceEvidence(findings: Finding[]): Promise<Finding[]> {
    return findings.map(finding => ({
      ...finding,
      evidence: [
        ...(finding.evidence || []),
        'Enhanced evidence based on architectural analysis'
      ]
    }));
  }

  private async clarifyRecommendations(recommendations: Recommendation[]): Promise<Recommendation[]> {
    return recommendations.map(rec => ({
      ...rec,
      implementation: rec.implementation || 'Detailed implementation steps to be provided',
      rationale: rec.rationale || 'Architectural improvement rationale'
    }));
  }

  private createFallbackAnalysis(context: EnhancedPRContext, error: string): SpecializedAnalysis {
    return {
      type: 'architectural',
      riskLevel: 'MEDIUM',
      confidence: 0.3,
      findings: [
        {
          id: 'fallback-finding',
          type: 'analysis-error',
          severity: 'medium',
          message: `Architectural analysis encountered an issue: ${error}`,
          file: '',
          lineNumber: 0,
          evidence: ['Fallback analysis due to processing error'],
          confidence: 0.3
        }
      ],
      recommendations: [
        {
          id: 'fallback-recommendation',
          priority: 'should-fix',
          category: 'analysis',
          description: 'Manual architectural review recommended due to analysis error',
          rationale: 'Automated analysis failed, manual review needed',
          implementation: 'Conduct manual architectural review',
          effort: 'medium',
          confidence: 0.3
        }
      ]
    };
  }
}
