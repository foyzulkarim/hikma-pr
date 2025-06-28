/**
 * Cross Validator - Multi-Model Result Validation System
 * Validates and compares results across different models and analysis types
 */
import { 
  Finding, 
  Recommendation, 
  AnalysisType 
} from '../types/analysis.js';
import { AgentResult } from './multiModelOrchestrator.js';

export class CrossValidator {
  private similarityThreshold: number = 0.7;
  private conflictThreshold: number = 0.3;
  private validationMetrics: ValidationMetrics;

  constructor() {
    this.validationMetrics = {
      totalComparisons: 0,
      agreementCount: 0,
      conflictCount: 0,
      averageAgreement: 0
    };
  }

  async compareResults(
    result1: AgentResult,
    result2: AgentResult
  ): Promise<ComparisonResult> {
    console.log(`🔍 Cross-validating ${result1.agentType} vs ${result2.agentType}...`);

    try {
      // Compare findings between the two results
      const findingComparison = await this.compareFindings(
        result1.findings,
        result2.findings,
        result1.agentType,
        result2.agentType
      );

      // Compare recommendations
      const recommendationComparison = await this.compareRecommendations(
        result1.recommendations,
        result2.recommendations,
        result1.agentType,
        result2.agentType
      );

      // Calculate overall agreement score
      const agreementScore = this.calculateAgreementScore(
        findingComparison,
        recommendationComparison
      );

      // Identify conflicts
      const conflicts = this.identifyConflicts(
        findingComparison,
        recommendationComparison,
        result1,
        result2
      );

      // Generate validation insights
      const insights = await this.generateValidationInsights(
        findingComparison,
        recommendationComparison,
        agreementScore,
        conflicts
      );

      const comparisonResult: ComparisonResult = {
        result1Type: result1.agentType,
        result2Type: result2.agentType,
        model1: result1.modelUsed,
        model2: result2.modelUsed,
        agreementScore,
        findingComparison,
        recommendationComparison,
        conflicts,
        insights,
        validationMetadata: {
          comparisonTime: Date.now(),
          similarityThreshold: this.similarityThreshold,
          conflictThreshold: this.conflictThreshold
        }
      };

      // Update validation metrics
      this.updateValidationMetrics(comparisonResult);

      console.log(`  📊 Agreement score: ${(agreementScore * 100).toFixed(1)}%`);
      console.log(`  ⚠️ Conflicts found: ${conflicts.length}`);

      return comparisonResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Cross-validation failed: ${errorMessage}`);
      throw new Error(`Cross-validation failed: ${errorMessage}`);
    }
  }

  private async compareFindings(
    findings1: Finding[],
    findings2: Finding[],
    type1: AnalysisType,
    type2: AnalysisType
  ): Promise<FindingComparison> {
    const matches: FindingMatch[] = [];
    const unique1: Finding[] = [];
    const unique2: Finding[] = [];
    const conflicts: FindingConflict[] = [];

    // Create a map for efficient lookup
    const findings2Map = new Map<string, Finding>();
    findings2.forEach(f => {
      const key = this.createFindingKey(f);
      findings2Map.set(key, f);
    });

    // Compare findings from first result
    for (const finding1 of findings1) {
      const key1 = this.createFindingKey(finding1);
      const matchingFinding = findings2Map.get(key1);

      if (matchingFinding) {
        // Found a match - check for conflicts
        const similarity = this.calculateFindingSimilarity(finding1, matchingFinding);
        
        if (similarity >= this.similarityThreshold) {
          matches.push({
            finding1,
            finding2: matchingFinding,
            similarity,
            confidenceDifference: Math.abs(finding1.confidence - matchingFinding.confidence),
            severityMatch: finding1.severity === matchingFinding.severity
          });
        } else {
          // Similar location but different findings - potential conflict
          conflicts.push({
            finding1,
            finding2: matchingFinding,
            conflictType: 'interpretation-difference',
            severity: this.assessConflictSeverity(finding1, matchingFinding),
            description: `Different interpretations of issue at ${finding1.file}:${finding1.lineNumber}`
          });
        }
        
        findings2Map.delete(key1); // Remove to avoid double-counting
      } else {
        unique1.push(finding1);
      }
    }

    // Remaining findings in findings2 are unique to that result
    unique2.push(...Array.from(findings2Map.values()));

    return {
      matches,
      unique1,
      unique2,
      conflicts,
      totalFindings1: findings1.length,
      totalFindings2: findings2.length,
      matchRate: findings1.length > 0 ? matches.length / findings1.length : 0,
      overlapScore: this.calculateOverlapScore(matches, unique1, unique2)
    };
  }

  private async compareRecommendations(
    recommendations1: Recommendation[],
    recommendations2: Recommendation[],
    type1: AnalysisType,
    type2: AnalysisType
  ): Promise<RecommendationComparison> {
    const matches: RecommendationMatch[] = [];
    const unique1: Recommendation[] = [];
    const unique2: Recommendation[] = [];
    const conflicts: RecommendationConflict[] = [];

    // Similar logic to findings comparison
    const rec2Map = new Map<string, Recommendation>();
    recommendations2.forEach(r => {
      const key = this.createRecommendationKey(r);
      rec2Map.set(key, r);
    });

    for (const rec1 of recommendations1) {
      const key1 = this.createRecommendationKey(rec1);
      const matchingRec = rec2Map.get(key1);

      if (matchingRec) {
        const similarity = this.calculateRecommendationSimilarity(rec1, matchingRec);
        
        if (similarity >= this.similarityThreshold) {
          matches.push({
            recommendation1: rec1,
            recommendation2: matchingRec,
            similarity,
            priorityMatch: rec1.priority === matchingRec.priority,
            categoryMatch: rec1.category === matchingRec.category
          });
        } else {
          conflicts.push({
            recommendation1: rec1,
            recommendation2: matchingRec,
            conflictType: 'priority-mismatch',
            severity: rec1.priority !== matchingRec.priority ? 'medium' : 'low',
            description: `Different priorities for similar recommendation: ${rec1.priority} vs ${matchingRec.priority}`
          });
        }
        
        rec2Map.delete(key1);
      } else {
        unique1.push(rec1);
      }
    }

    unique2.push(...Array.from(rec2Map.values()));

    return {
      matches,
      unique1,
      unique2,
      conflicts,
      totalRecommendations1: recommendations1.length,
      totalRecommendations2: recommendations2.length,
      matchRate: recommendations1.length > 0 ? matches.length / recommendations1.length : 0,
      overlapScore: this.calculateOverlapScore(matches, unique1, unique2)
    };
  }

  private calculateAgreementScore(
    findingComparison: FindingComparison,
    recommendationComparison: RecommendationComparison
  ): number {
    // Weight findings and recommendations equally
    const findingScore = findingComparison.overlapScore;
    const recommendationScore = recommendationComparison.overlapScore;
    
    return (findingScore + recommendationScore) / 2;
  }

  private identifyConflicts(
    findingComparison: FindingComparison,
    recommendationComparison: RecommendationComparison,
    result1: AgentResult,
    result2: AgentResult
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Add finding conflicts
    findingComparison.conflicts.forEach(fc => {
      conflicts.push({
        id: `finding-${Date.now()}-${Math.random()}`,
        type: 'finding-conflict',
        severity: fc.severity,
        description: fc.description,
        involvedModels: [result1.modelUsed, result2.modelUsed],
        involvedAgents: [result1.agentType, result2.agentType],
        conflictData: fc
      });
    });

    // Add recommendation conflicts
    recommendationComparison.conflicts.forEach(rc => {
      conflicts.push({
        id: `recommendation-${Date.now()}-${Math.random()}`,
        type: 'recommendation-conflict',
        severity: rc.severity,
        description: rc.description,
        involvedModels: [result1.modelUsed, result2.modelUsed],
        involvedAgents: [result1.agentType, result2.agentType],
        conflictData: rc
      });
    });

    // Identify confidence conflicts
    const confidenceConflicts = this.identifyConfidenceConflicts(result1, result2);
    conflicts.push(...confidenceConflicts);

    return conflicts;
  }

  private identifyConfidenceConflicts(
    result1: AgentResult,
    result2: AgentResult
  ): Conflict[] {
    const conflicts: Conflict[] = [];
    
    // Check for large confidence differences
    const confidenceDiff = Math.abs(result1.confidence - result2.confidence);
    
    if (confidenceDiff > 0.3) {
      conflicts.push({
        id: `confidence-${Date.now()}`,
        type: 'confidence-conflict',
        severity: confidenceDiff > 0.5 ? 'high' : 'medium',
        description: `Large confidence difference: ${result1.agentType} (${(result1.confidence * 100).toFixed(1)}%) vs ${result2.agentType} (${(result2.confidence * 100).toFixed(1)}%)`,
        involvedModels: [result1.modelUsed, result2.modelUsed],
        involvedAgents: [result1.agentType, result2.agentType],
        conflictData: {
          confidence1: result1.confidence,
          confidence2: result2.confidence,
          difference: confidenceDiff
        }
      });
    }

    return conflicts;
  }

  private async generateValidationInsights(
    findingComparison: FindingComparison,
    recommendationComparison: RecommendationComparison,
    agreementScore: number,
    conflicts: Conflict[]
  ): Promise<ValidationInsight[]> {
    const insights: ValidationInsight[] = [];

    // Agreement level insight
    if (agreementScore > 0.8) {
      insights.push({
        type: 'high-agreement',
        message: 'Models show high agreement - results are likely reliable',
        confidence: 0.9,
        actionable: false
      });
    } else if (agreementScore < 0.4) {
      insights.push({
        type: 'low-agreement',
        message: 'Models show low agreement - results need additional validation',
        confidence: 0.8,
        actionable: true,
        suggestedAction: 'Consider running additional models or manual review'
      });
    }

    // Conflict insights
    if (conflicts.length > 0) {
      const highSeverityConflicts = conflicts.filter(c => c.severity === 'high').length;
      
      if (highSeverityConflicts > 0) {
        insights.push({
          type: 'high-severity-conflicts',
          message: `${highSeverityConflicts} high-severity conflicts require resolution`,
          confidence: 0.9,
          actionable: true,
          suggestedAction: 'Prioritize resolving high-severity conflicts before proceeding'
        });
      }
    }

    // Coverage insights
    const uniqueFindings1 = findingComparison.unique1.length;
    const uniqueFindings2 = findingComparison.unique2.length;
    
    if (uniqueFindings1 > uniqueFindings2 * 2 || uniqueFindings2 > uniqueFindings1 * 2) {
      insights.push({
        type: 'coverage-imbalance',
        message: 'Significant difference in finding coverage between models',
        confidence: 0.7,
        actionable: true,
        suggestedAction: 'Review unique findings for potential blind spots'
      });
    }

    return insights;
  }

  private createFindingKey(finding: Finding): string {
    // Create a normalized key for finding comparison
    return `${finding.type}-${finding.file}-${finding.lineNumber || 0}`;
  }

  private createRecommendationKey(recommendation: Recommendation): string {
    // Create a normalized key for recommendation comparison
    return `${recommendation.category}-${recommendation.description.substring(0, 50)}`;
  }

  private calculateFindingSimilarity(finding1: Finding, finding2: Finding): number {
    let similarity = 0;

    // Type match
    if (finding1.type === finding2.type) similarity += 0.4;

    // File match
    if (finding1.file === finding2.file) similarity += 0.3;

    // Line number proximity
    if (finding1.lineNumber && finding2.lineNumber) {
      const lineDiff = Math.abs(finding1.lineNumber - finding2.lineNumber);
      if (lineDiff === 0) similarity += 0.2;
      else if (lineDiff <= 5) similarity += 0.1;
    }

    // Severity match
    if (finding1.severity === finding2.severity) similarity += 0.1;

    return Math.min(similarity, 1.0);
  }

  private calculateRecommendationSimilarity(rec1: Recommendation, rec2: Recommendation): number {
    let similarity = 0;

    // Category match
    if (rec1.category === rec2.category) similarity += 0.4;

    // Priority match
    if (rec1.priority === rec2.priority) similarity += 0.3;

    // Description similarity (simple word overlap)
    const words1 = rec1.description.toLowerCase().split(/\s+/);
    const words2 = rec2.description.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w)).length;
    const totalWords = Math.max(words1.length, words2.length);
    
    if (totalWords > 0) {
      similarity += (commonWords / totalWords) * 0.3;
    }

    return Math.min(similarity, 1.0);
  }

  private calculateOverlapScore(
    matches: any[],
    unique1: any[],
    unique2: any[]
  ): number {
    const totalItems = matches.length + unique1.length + unique2.length;
    if (totalItems === 0) return 1.0;
    
    // Overlap score based on matches vs total items
    return matches.length / totalItems;
  }

  private assessConflictSeverity(finding1: Finding, finding2: Finding): 'low' | 'medium' | 'high' {
    // Assess conflict severity based on finding characteristics
    if (finding1.severity === 'critical' || finding2.severity === 'critical') {
      return 'high';
    }
    
    if (finding1.severity === 'high' || finding2.severity === 'high') {
      return 'medium';
    }
    
    return 'low';
  }

  private updateValidationMetrics(comparison: ComparisonResult): void {
    this.validationMetrics.totalComparisons++;
    
    if (comparison.agreementScore > 0.7) {
      this.validationMetrics.agreementCount++;
    }
    
    if (comparison.conflicts.length > 0) {
      this.validationMetrics.conflictCount++;
    }
    
    // Update running average
    const total = this.validationMetrics.totalComparisons;
    this.validationMetrics.averageAgreement = 
      ((this.validationMetrics.averageAgreement * (total - 1)) + comparison.agreementScore) / total;
  }

  getValidationMetrics(): ValidationMetrics {
    return { ...this.validationMetrics };
  }
}

// Supporting interfaces
export interface ComparisonResult {
  result1Type: AnalysisType;
  result2Type: AnalysisType;
  model1: string;
  model2: string;
  agreementScore: number;
  findingComparison: FindingComparison;
  recommendationComparison: RecommendationComparison;
  conflicts: Conflict[];
  insights: ValidationInsight[];
  validationMetadata: {
    comparisonTime: number;
    similarityThreshold: number;
    conflictThreshold: number;
  };
}

interface FindingComparison {
  matches: FindingMatch[];
  unique1: Finding[];
  unique2: Finding[];
  conflicts: FindingConflict[];
  totalFindings1: number;
  totalFindings2: number;
  matchRate: number;
  overlapScore: number;
}

interface RecommendationComparison {
  matches: RecommendationMatch[];
  unique1: Recommendation[];
  unique2: Recommendation[];
  conflicts: RecommendationConflict[];
  totalRecommendations1: number;
  totalRecommendations2: number;
  matchRate: number;
  overlapScore: number;
}

interface FindingMatch {
  finding1: Finding;
  finding2: Finding;
  similarity: number;
  confidenceDifference: number;
  severityMatch: boolean;
}

interface RecommendationMatch {
  recommendation1: Recommendation;
  recommendation2: Recommendation;
  similarity: number;
  priorityMatch: boolean;
  categoryMatch: boolean;
}

interface FindingConflict {
  finding1: Finding;
  finding2: Finding;
  conflictType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface RecommendationConflict {
  recommendation1: Recommendation;
  recommendation2: Recommendation;
  conflictType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface Conflict {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  involvedModels: string[];
  involvedAgents: AnalysisType[];
  conflictData: any;
}

interface ValidationInsight {
  type: string;
  message: string;
  confidence: number;
  actionable: boolean;
  suggestedAction?: string;
}

interface ValidationMetrics {
  totalComparisons: number;
  agreementCount: number;
  conflictCount: number;
  averageAgreement: number;
}
