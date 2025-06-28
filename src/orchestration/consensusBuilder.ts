/**
 * Consensus Builder - Multi-Model Agreement System
 * Builds consensus from multiple model analyses using various strategies
 */
import { 
  Finding, 
  Recommendation, 
  EnhancedPRContext,
  AnalysisType 
} from '../types/analysis.js';
import { 
  CrossValidationResult, 
  ConsensusResult, 
  AgentResult 
} from './multiModelOrchestrator.js';

export class ConsensusBuilder {
  private consensusStrategies: Map<string, ConsensusStrategy>;
  private weightingSchemes: Map<string, WeightingScheme>;

  constructor() {
    this.consensusStrategies = new Map();
    this.weightingSchemes = new Map();
    this.initializeStrategies();
    this.initializeWeightingSchemes();
  }

  async buildConsensus(
    crossValidation: CrossValidationResult,
    context: EnhancedPRContext
  ): Promise<ConsensusResult> {
    console.log('🤝 Building multi-model consensus...');

    try {
      // Step 1: Select optimal consensus strategy
      const strategy = await this.selectConsensusStrategy(crossValidation, context);
      console.log(`📋 Using consensus strategy: ${strategy.name}`);

      // Step 2: Apply weighting scheme based on model performance
      const weightingScheme = await this.selectWeightingScheme(crossValidation);
      console.log(`⚖️ Using weighting scheme: ${weightingScheme.name}`);

      // Step 3: Build consensus findings
      console.log('🔍 Building consensus findings...');
      const consensusFindings = await this.buildConsensusFindings(
        crossValidation,
        strategy,
        weightingScheme
      );

      // Step 4: Build consensus recommendations
      console.log('💡 Building consensus recommendations...');
      const consensusRecommendations = await this.buildConsensusRecommendations(
        crossValidation,
        strategy,
        weightingScheme
      );

      // Step 5: Calculate overall confidence and agreement
      const overallConfidence = this.calculateOverallConfidence(
        consensusFindings,
        consensusRecommendations
      );
      const modelAgreement = crossValidation.overallAgreement;

      const result: ConsensusResult = {
        findings: consensusFindings,
        recommendations: consensusRecommendations,
        overallConfidence,
        modelAgreement,
        consensusMethod: `${strategy.name} + ${weightingScheme.name}`
      };

      console.log(`✅ Consensus built: ${consensusFindings.length} findings, ${consensusRecommendations.length} recommendations`);
      console.log(`📊 Overall confidence: ${(overallConfidence * 100).toFixed(1)}%`);
      console.log(`🤝 Model agreement: ${(modelAgreement * 100).toFixed(1)}%`);

      return result;

    } catch (error) {
      console.error('❌ Consensus building failed:', error);
      throw new Error(`Consensus building failed: ${(error as Error).message}`);
    }
  }

  private async selectConsensusStrategy(
    crossValidation: CrossValidationResult,
    context: EnhancedPRContext
  ): Promise<ConsensusStrategy> {
    const agreement = crossValidation.overallAgreement;
    const conflictCount = crossValidation.conflictResolutions.length;

    // High agreement - use majority voting
    if (agreement > 0.8 && conflictCount < 3) {
      return this.consensusStrategies.get('majority-voting')!;
    }

    // Medium agreement - use weighted consensus
    if (agreement > 0.6) {
      return this.consensusStrategies.get('weighted-consensus')!;
    }

    // Low agreement - use expert arbitration
    if (agreement > 0.4) {
      return this.consensusStrategies.get('expert-arbitration')!;
    }

    // Very low agreement - use ensemble fusion
    return this.consensusStrategies.get('ensemble-fusion')!;
  }

  private async selectWeightingScheme(
    crossValidation: CrossValidationResult
  ): Promise<WeightingScheme> {
    // Analyze model performance patterns
    const hasHighConfidenceFindings = crossValidation.highConfidenceFindings.length > 5;
    const hasUncertainFindings = crossValidation.uncertainFindings.length > 3;

    if (hasHighConfidenceFindings && !hasUncertainFindings) {
      return this.weightingSchemes.get('confidence-based')!;
    }

    if (hasUncertainFindings) {
      return this.weightingSchemes.get('expertise-based')!;
    }

    return this.weightingSchemes.get('balanced')!;
  }

  private async buildConsensusFindings(
    crossValidation: CrossValidationResult,
    strategy: ConsensusStrategy,
    weightingScheme: WeightingScheme
  ): Promise<Finding[]> {
    const allFindings = this.collectAllFindings(crossValidation);
    const groupedFindings = this.groupSimilarFindings(allFindings);
    const consensusFindings: Finding[] = [];

    for (const group of groupedFindings) {
      const consensusFinding = await this.buildConsensusFromGroup(
        group,
        strategy,
        weightingScheme
      );
      
      if (consensusFinding) {
        consensusFindings.push(consensusFinding);
      }
    }

    // Sort by confidence and severity
    return consensusFindings.sort((a, b) => {
      if (a.severity !== b.severity) {
        const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.confidence - a.confidence;
    });
  }

  private async buildConsensusRecommendations(
    crossValidation: CrossValidationResult,
    strategy: ConsensusStrategy,
    weightingScheme: WeightingScheme
  ): Promise<Recommendation[]> {
    const allRecommendations = this.collectAllRecommendations(crossValidation);
    const groupedRecommendations = this.groupSimilarRecommendations(allRecommendations);
    const consensusRecommendations: Recommendation[] = [];

    for (const group of groupedRecommendations) {
      const consensusRecommendation = await this.buildRecommendationConsensus(
        group,
        strategy,
        weightingScheme
      );
      
      if (consensusRecommendation) {
        consensusRecommendations.push(consensusRecommendation);
      }
    }

    // Sort by priority and confidence
    return consensusRecommendations.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { 'must-fix': 4, 'should-fix': 3, 'consider': 2, 'optional': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    });
  }

  private collectAllFindings(crossValidation: CrossValidationResult): FindingWithSource[] {
    const findings: FindingWithSource[] = [];
    
    // This would be populated from the actual agent results
    // For now, we'll use the high confidence findings as a base
    crossValidation.highConfidenceFindings.forEach(finding => {
      findings.push({
        ...finding,
        sourceModel: 'consensus',
        sourceAgent: 'multiple',
        agreementCount: 1
      });
    });

    return findings;
  }

  private collectAllRecommendations(crossValidation: CrossValidationResult): RecommendationWithSource[] {
    // Similar to findings collection
    return [];
  }

  private groupSimilarFindings(findings: FindingWithSource[]): FindingGroup[] {
    const groups: Map<string, FindingWithSource[]> = new Map();

    for (const finding of findings) {
      // Create a key based on finding characteristics
      const key = this.createFindingKey(finding);
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(finding);
    }

    return Array.from(groups.values()).map(group => ({
      findings: group,
      similarity: this.calculateGroupSimilarity(group),
      representativeFinding: this.selectRepresentativeFinding(group)
    }));
  }

  private groupSimilarRecommendations(recommendations: RecommendationWithSource[]): RecommendationGroup[] {
    const groups: Map<string, RecommendationWithSource[]> = new Map();

    for (const recommendation of recommendations) {
      const key = this.createRecommendationKey(recommendation);
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(recommendation);
    }

    return Array.from(groups.values()).map(group => ({
      recommendations: group,
      similarity: this.calculateGroupSimilarity(group),
      representativeRecommendation: this.selectRepresentativeRecommendation(group)
    }));
  }

  private async buildConsensusFromGroup(
    group: FindingGroup,
    strategy: ConsensusStrategy,
    weightingScheme: WeightingScheme
  ): Promise<Finding | null> {
    if (group.findings.length === 0) return null;

    // Apply consensus strategy
    switch (strategy.name) {
      case 'majority-voting':
        return this.applyMajorityVoting(group, weightingScheme);
      
      case 'weighted-consensus':
        return this.applyWeightedConsensus(group, weightingScheme);
      
      case 'expert-arbitration':
        return this.applyExpertArbitration(group, weightingScheme);
      
      case 'ensemble-fusion':
        return this.applyEnsembleFusion(group, weightingScheme);
      
      default:
        return group.representativeFinding;
    }
  }

  private async buildRecommendationConsensus(
    group: RecommendationGroup,
    strategy: ConsensusStrategy,
    weightingScheme: WeightingScheme
  ): Promise<Recommendation | null> {
    if (group.recommendations.length === 0) return null;

    // Similar logic to findings but for recommendations
    const representative = group.representativeRecommendation;
    
    // Calculate consensus confidence
    const avgConfidence = group.recommendations.reduce((sum, r) => sum + r.confidence, 0) / group.recommendations.length;
    
    return {
      ...representative,
      confidence: avgConfidence
    };
  }

  private applyMajorityVoting(
    group: FindingGroup,
    weightingScheme: WeightingScheme
  ): Finding {
    const representative = group.representativeFinding;
    const supportCount = group.findings.length;
    
    // Boost confidence based on agreement
    const consensusBoost = Math.min(supportCount * 0.1, 0.3);
    const finalConfidence = Math.min(representative.confidence + consensusBoost, 1.0);

    return {
      ...representative,
      confidence: finalConfidence
    };
  }

  private applyWeightedConsensus(
    group: FindingGroup,
    weightingScheme: WeightingScheme
  ): Finding {
    const weights = this.calculateWeights(group.findings, weightingScheme);
    const representative = group.representativeFinding;
    
    // Calculate weighted confidence
    let weightedConfidence = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < group.findings.length; i++) {
      const weight = weights[i];
      weightedConfidence += group.findings[i].confidence * weight;
      totalWeight += weight;
    }
    
    const finalConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : representative.confidence;

    return {
      ...representative,
      confidence: finalConfidence
    };
  }

  private applyExpertArbitration(
    group: FindingGroup,
    weightingScheme: WeightingScheme
  ): Finding {
    // Select the finding from the most expert model for this type
    const expertFinding = this.selectExpertFinding(group.findings);
    
    return {
      ...expertFinding,
      supportingModels: group.findings.map(f => f.sourceModel),
      consensusMethod: 'expert-arbitration'
    };
  }

  private applyEnsembleFusion(
    group: FindingGroup,
    weightingScheme: WeightingScheme
  ): Finding {
    // Combine insights from all findings in the group
    const representative = group.representativeFinding;
    const allEvidence = group.findings.flatMap(f => f.evidence || []);
    const avgConfidence = group.findings.reduce((sum, f) => sum + f.confidence, 0) / group.findings.length;

    return {
      ...representative,
      confidence: avgConfidence,
      evidence: [...new Set(allEvidence)] // Remove duplicates
    };
  }

  private calculateWeights(
    findings: FindingWithSource[],
    weightingScheme: WeightingScheme
  ): number[] {
    switch (weightingScheme.name) {
      case 'confidence-based':
        return findings.map(f => f.confidence);
      
      case 'expertise-based':
        return findings.map(f => this.getModelExpertiseWeight(f.sourceModel, f.type));
      
      case 'balanced':
        return findings.map(() => 1.0); // Equal weights
      
      default:
        return findings.map(() => 1.0);
    }
  }

  private getModelExpertiseWeight(modelName: string, findingType: string): number {
    // Define model expertise for different finding types
    const expertiseMatrix: Record<string, Record<string, number>> = {
      'gemini-2.5-pro': {
        'architectural': 0.9,
        'design-pattern': 0.95,
        'coupling': 0.85,
        'default': 0.8
      },
      'claude-3.5-sonnet': {
        'security': 0.95,
        'vulnerability': 0.9,
        'authentication': 0.85,
        'default': 0.7
      },
      'gpt-4-turbo': {
        'performance': 0.9,
        'optimization': 0.85,
        'scalability': 0.8,
        'default': 0.75
      },
      'deepseek-coder-33b': {
        'code-quality': 0.9,
        'maintainability': 0.85,
        'best-practices': 0.8,
        'default': 0.75
      },
      'qwen2.5-coder-32b': {
        'testing': 0.9,
        'coverage': 0.85,
        'quality-assurance': 0.8,
        'default': 0.7
      }
    };

    const modelExpertise = expertiseMatrix[modelName];
    if (!modelExpertise) return 0.5;

    return modelExpertise[findingType] || modelExpertise['default'] || 0.5;
  }

  private createFindingKey(finding: FindingWithSource): string {
    // Create a key for grouping similar findings
    return `${finding.type}-${finding.file}-${finding.lineNumber || 0}`;
  }

  private createRecommendationKey(recommendation: RecommendationWithSource): string {
    // Create a key for grouping similar recommendations
    return `${recommendation.category}-${recommendation.priority}`;
  }

  private calculateGroupSimilarity(group: any[]): number {
    // Simple similarity calculation - could be enhanced with NLP
    if (group.length <= 1) return 1.0;
    
    // For now, return a fixed similarity score
    return 0.8;
  }

  private selectRepresentativeFinding(findings: FindingWithSource[]): FindingWithSource {
    // Select the finding with highest confidence
    return findings.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  private selectRepresentativeRecommendation(recommendations: RecommendationWithSource[]): RecommendationWithSource {
    // Select the recommendation with highest confidence
    return recommendations.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  private selectExpertFinding(findings: FindingWithSource[]): FindingWithSource {
    // Select finding from the most expert model for this finding type
    let bestFinding = findings[0];
    let bestExpertise = 0;

    for (const finding of findings) {
      const expertise = this.getModelExpertiseWeight(finding.sourceModel, finding.type);
      if (expertise > bestExpertise) {
        bestExpertise = expertise;
        bestFinding = finding;
      }
    }

    return bestFinding;
  }

  private calculateOverallConfidence(
    findings: Finding[],
    recommendations: Recommendation[]
  ): number {
    const allItems: any[] = [...findings, ...recommendations];
    if (allItems.length === 0) return 0.5;

    const avgConfidence = allItems.reduce((sum, item) => sum + item.confidence, 0) / allItems.length;
    return avgConfidence;
  }

  private initializeStrategies(): void {
    this.consensusStrategies.set('majority-voting', {
      name: 'majority-voting',
      description: 'Use majority agreement across models',
      applicability: 'high-agreement',
      strengths: ['simple', 'robust', 'democratic']
    });

    this.consensusStrategies.set('weighted-consensus', {
      name: 'weighted-consensus',
      description: 'Weight model contributions by expertise and confidence',
      applicability: 'medium-agreement',
      strengths: ['expertise-aware', 'nuanced', 'quality-focused']
    });

    this.consensusStrategies.set('expert-arbitration', {
      name: 'expert-arbitration',
      description: 'Defer to most expert model for each finding type',
      applicability: 'low-agreement',
      strengths: ['expertise-driven', 'specialized', 'authoritative']
    });

    this.consensusStrategies.set('ensemble-fusion', {
      name: 'ensemble-fusion',
      description: 'Combine insights from all models',
      applicability: 'very-low-agreement',
      strengths: ['comprehensive', 'inclusive', 'robust']
    });
  }

  private initializeWeightingSchemes(): void {
    this.weightingSchemes.set('confidence-based', {
      name: 'confidence-based',
      description: 'Weight by model confidence in findings',
      factors: ['confidence-score', 'evidence-strength']
    });

    this.weightingSchemes.set('expertise-based', {
      name: 'expertise-based',
      description: 'Weight by model expertise in domain',
      factors: ['domain-expertise', 'model-specialty']
    });

    this.weightingSchemes.set('balanced', {
      name: 'balanced',
      description: 'Equal weight to all models',
      factors: ['equal-treatment']
    });
  }
}

// Supporting interfaces
interface ConsensusStrategy {
  name: string;
  description: string;
  applicability: string;
  strengths: string[];
}

interface WeightingScheme {
  name: string;
  description: string;
  factors: string[];
}

interface FindingWithSource extends Finding {
  sourceModel: string;
  sourceAgent: string;
  agreementCount: number;
  supportingModels?: string[];
  consensusMethod?: string;
  consensusStrength?: number;
}

interface RecommendationWithSource extends Recommendation {
  sourceModel: string;
  sourceAgent: string;
  agreementCount: number;
  supportingModels?: string[];
  consensusMethod?: string;
  consensusStrength?: number;
  implementationFeasibility?: number;
}

interface FindingGroup {
  findings: FindingWithSource[];
  similarity: number;
  representativeFinding: FindingWithSource;
}

interface RecommendationGroup {
  recommendations: RecommendationWithSource[];
  similarity: number;
  representativeRecommendation: RecommendationWithSource;
}
