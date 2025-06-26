import { 
  EnhancedPRContext, 
  SpecializedAnalysis, 
  Finding, 
  Recommendation,
  AnalysisType,
  ValidationResult
} from '../types/analysis.js';

export interface AnalysisAgent {
  analyze(context: EnhancedPRContext, enhancedPrompt?: string): Promise<SpecializedAnalysis>;
  validate(analysis: SpecializedAnalysis): Promise<ValidationResult>;
  refine(analysis: SpecializedAnalysis, feedback: Feedback): Promise<SpecializedAnalysis>;
  getAnalysisType(): AnalysisType;
}

// Supporting interfaces - ValidationResult is imported from types/analysis.ts

export interface Feedback {
  overallScore: number;
  improvementAreas: ImprovementArea[];
  strengths: string[];
  weaknesses: string[];
}

export interface ImprovementArea {
  type: 'missing-evidence' | 'vague-recommendation' | 'low-confidence' | 'incomplete-analysis';
  targetId: string;
  description: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export abstract class BaseAnalysisAgent implements AnalysisAgent {
  protected agentType: string;
  protected specialization: string;

  constructor(agentType: string, specialization: string) {
    this.agentType = agentType;
    this.specialization = specialization;
  }

  abstract analyze(context: EnhancedPRContext): Promise<SpecializedAnalysis>;
  abstract getAnalysisType(): AnalysisType;

  async validate(analysis: SpecializedAnalysis): Promise<ValidationResult> {
    console.log(`🔍 Validating ${this.agentType} analysis...`);
    
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];
    
    // Basic validation checks
    if (!analysis.findings || analysis.findings.length === 0) {
      validationWarnings.push('No findings generated - analysis may be incomplete');
    }
    
    if (!analysis.recommendations || analysis.recommendations.length === 0) {
      validationWarnings.push('No recommendations generated - analysis may lack actionable insights');
    }
    
    if (analysis.confidence < 0.5) {
      validationWarnings.push('Low confidence score - analysis may need refinement');
    }
    
    // Validate findings
    for (const finding of analysis.findings) {
      if (!finding.evidence || finding.evidence.length === 0) {
        validationWarnings.push(`Finding "${finding.message}" lacks supporting evidence`);
      }
      
      if (!finding.file) {
        validationErrors.push(`Finding "${finding.message}" missing file location`);
      }
    }
    
    // Validate recommendations
    for (const recommendation of analysis.recommendations) {
      if (!recommendation.rationale) {
        validationWarnings.push(`Recommendation "${recommendation.description}" lacks rationale`);
      }
      
      if (!recommendation.implementation) {
        validationWarnings.push(`Recommendation "${recommendation.description}" lacks implementation guidance`);
      }
    }
    
    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings,
      score: this.calculateValidationScore(validationErrors, validationWarnings)
    };
  }

  async refine(analysis: SpecializedAnalysis, feedback: Feedback): Promise<SpecializedAnalysis> {
    console.log(`🔧 Refining ${this.agentType} analysis based on feedback...`);
    
    const refinedAnalysis = { ...analysis };
    
    // Apply feedback to improve analysis
    if (feedback.improvementAreas) {
      for (const area of feedback.improvementAreas) {
        switch (area.type) {
          case 'missing-evidence':
            refinedAnalysis.findings = await this.addEvidence(refinedAnalysis.findings, area);
            break;
          case 'vague-recommendation':
            refinedAnalysis.recommendations = await this.clarifyRecommendations(refinedAnalysis.recommendations, area);
            break;
          case 'low-confidence':
            refinedAnalysis.confidence = await this.improveConfidence(refinedAnalysis, area);
            break;
        }
      }
    }
    
    // Increase confidence if refinements were made
    if (feedback.improvementAreas && feedback.improvementAreas.length > 0) {
      refinedAnalysis.confidence = Math.min(1.0, refinedAnalysis.confidence + 0.1);
    }
    
    return refinedAnalysis;
  }

  protected createFinding(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    file: string,
    lineNumber?: number,
    evidence: string[] = []
  ): Finding {
    return {
      id: this.generateFindingId(),
      type,
      severity,
      message,
      file,
      lineNumber,
      evidence,
      confidence: 0.8
    };
  }

  protected createRecommendation(
    priority: 'must-fix' | 'should-fix' | 'consider',
    category: string,
    description: string,
    rationale: string,
    implementation: string,
    effort: 'low' | 'medium' | 'high' = 'medium'
  ): Recommendation {
    return {
      id: this.generateRecommendationId(),
      priority,
      category,
      description,
      rationale,
      implementation,
      effort,
      confidence: 0.8
    };
  }

  protected calculateRiskLevel(findings: Finding[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (findings.some(f => f.severity === 'critical')) return 'CRITICAL';
    if (findings.some(f => f.severity === 'high')) return 'HIGH';
    if (findings.some(f => f.severity === 'medium')) return 'MEDIUM';
    return 'LOW';
  }

  protected calculateConfidence(
    analysisDepth: number,
    evidenceQuality: number,
    contextCompleteness: number
  ): number {
    // Weighted average of different confidence factors
    const weights = {
      depth: 0.3,
      evidence: 0.4,
      context: 0.3
    };
    
    return (
      analysisDepth * weights.depth +
      evidenceQuality * weights.evidence +
      contextCompleteness * weights.context
    );
  }

  private calculateValidationScore(errors: string[], warnings: string[]): number {
    const errorPenalty = errors.length * 0.3;
    const warningPenalty = warnings.length * 0.1;
    return Math.max(0, 1.0 - errorPenalty - warningPenalty);
  }

  private async addEvidence(findings: Finding[], area: ImprovementArea): Promise<Finding[]> {
    // Implementation would add more evidence to findings
    return findings.map(finding => {
      if (finding.id === area.targetId) {
        return {
          ...finding,
          evidence: [...finding.evidence, area.suggestion]
        };
      }
      return finding;
    });
  }

  private async clarifyRecommendations(recommendations: Recommendation[], area: ImprovementArea): Promise<Recommendation[]> {
    // Implementation would clarify vague recommendations
    return recommendations.map(rec => {
      if (rec.id === area.targetId) {
        return {
          ...rec,
          implementation: rec.implementation + '\n' + area.suggestion
        };
      }
      return rec;
    });
  }

  private async improveConfidence(analysis: SpecializedAnalysis, area: ImprovementArea): Promise<number> {
    // Implementation would improve confidence through additional analysis
    return Math.min(1.0, analysis.confidence + 0.2);
  }

  private generateFindingId(): string {
    return `${this.agentType}-finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecommendationId(): string {
    return `${this.agentType}-rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Supporting interfaces
export interface Feedback {
  overallScore: number;
  improvementAreas: ImprovementArea[];
  strengths: string[];
  weaknesses: string[];
}

export interface ImprovementArea {
  type: 'missing-evidence' | 'vague-recommendation' | 'low-confidence' | 'incomplete-analysis';
  targetId: string;
  description: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}
