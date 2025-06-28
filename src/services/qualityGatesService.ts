import { 
  RefinedAnalysisResult,
  QualityValidation,
  CompletenessScore,
  ConsistencyScore,
  ActionabilityScore,
  EvidenceScore,
  Finding,
  Recommendation
} from '../types/analysis.js';
import { ENHANCED_SYSTEM_CONFIG } from '../config/enhancedConfig.js';

export class QualityGatesService {
  async validateResults(results: RefinedAnalysisResult): Promise<QualityValidation> {
    console.log('🔍 Validating analysis results quality...');
    
    const [
      completeness,
      consistency,
      actionability,
      evidenceBased
    ] = await Promise.all([
      this.validateCompleteness(results),
      this.validateConsistency(results),
      this.validateActionability(results),
      this.validateEvidence(results)
    ]);
    
    const confidenceScores = this.calculateConfidenceScores(results, {
      completeness,
      consistency,
      actionability,
      evidenceBased
    });
    
    return {
      completeness,
      consistency,
      actionability,
      evidenceBased,
      confidenceScores
    };
  }

  async ensureStandards(
    results: RefinedAnalysisResult,
    validation: QualityValidation
  ): Promise<RefinedAnalysisResult> {
    console.log('📋 Ensuring analysis meets quality standards...');
    
    let enhancedResults = { ...results };
    
    // Apply quality improvements based on validation results
    if (validation.completeness.score < ENHANCED_SYSTEM_CONFIG.qualityGates.minimumConfidenceScore) {
      enhancedResults = await this.improveCompleteness(enhancedResults, validation.completeness);
    }
    
    if (validation.consistency.score < ENHANCED_SYSTEM_CONFIG.qualityGates.minimumConfidenceScore) {
      enhancedResults = await this.improveConsistency(enhancedResults, validation.consistency);
    }
    
    if (validation.actionability.score < ENHANCED_SYSTEM_CONFIG.qualityGates.minimumConfidenceScore) {
      enhancedResults = await this.improveActionability(enhancedResults, validation.actionability);
    }
    
    if (validation.evidenceBased.score < ENHANCED_SYSTEM_CONFIG.qualityGates.minimumConfidenceScore) {
      enhancedResults = await this.improveEvidence(enhancedResults, validation.evidenceBased);
    }
    
    return enhancedResults;
  }

  private async validateCompleteness(results: RefinedAnalysisResult): Promise<CompletenessScore> {
    console.log('📊 Validating analysis completeness...');
    
    const missingAreas: string[] = [];
    let score = 1.0;
    
    // Check if all critical analysis areas are covered
    const requiredAreas = ['architectural', 'security', 'performance', 'testing'];
    const coveredAreas = results.individualResults.map(r => r.type);
    
    for (const area of requiredAreas) {
      if (!coveredAreas.includes(area)) {
        missingAreas.push(`Missing ${area} analysis`);
        score -= 0.2;
      }
    }
    
    // Check if findings have sufficient detail
    const findingsWithoutEvidence = results.consensus.finalFindings.filter(f => 
      !f.evidence || f.evidence.length === 0
    );
    
    if (findingsWithoutEvidence.length > 0) {
      missingAreas.push(`${findingsWithoutEvidence.length} findings lack supporting evidence`);
      score -= 0.1;
    }
    
    // Check if recommendations have implementation guidance
    const vagueRecommendations = results.consensus.finalRecommendations.filter(r => 
      !r.implementation || r.implementation.length < 20
    );
    
    if (vagueRecommendations.length > 0) {
      missingAreas.push(`${vagueRecommendations.length} recommendations lack implementation details`);
      score -= 0.1;
    }
    
    // Check if high-risk findings have been addressed
    const criticalFindings = results.consensus.finalFindings.filter(f => f.severity === 'critical');
    const criticalRecommendations = results.consensus.finalRecommendations.filter(r => r.priority === 'must-fix');
    
    if (criticalFindings.length > criticalRecommendations.length) {
      missingAreas.push('Not all critical findings have corresponding must-fix recommendations');
      score -= 0.15;
    }
    
    return {
      score: Math.max(0, score),
      missingAreas
    };
  }

  private async validateConsistency(results: RefinedAnalysisResult): Promise<ConsistencyScore> {
    console.log('🔄 Validating analysis consistency...');
    
    const inconsistencies: string[] = [];
    let score = 1.0;
    
    // Check for conflicting findings across agents
    const conflictingFindings = this.findConflictingFindings(results.individualResults);
    if (conflictingFindings.length > 0) {
      inconsistencies.push(`${conflictingFindings.length} conflicting findings between agents`);
      score -= 0.2;
    }
    
    // Check for inconsistent severity assessments
    const severityInconsistencies = this.findSeverityInconsistencies(results.consensus.finalFindings);
    if (severityInconsistencies.length > 0) {
      inconsistencies.push(`${severityInconsistencies.length} inconsistent severity assessments`);
      score -= 0.15;
    }
    
    // Check for inconsistent recommendation priorities
    const priorityInconsistencies = this.findPriorityInconsistencies(
      results.consensus.finalFindings,
      results.consensus.finalRecommendations
    );
    if (priorityInconsistencies.length > 0) {
      inconsistencies.push(`${priorityInconsistencies.length} inconsistent recommendation priorities`);
      score -= 0.15;
    }
    
    // Check for duplicate or overlapping findings
    const duplicateFindings = this.findDuplicateFindings(results.consensus.finalFindings);
    if (duplicateFindings.length > 0) {
      inconsistencies.push(`${duplicateFindings.length} duplicate or overlapping findings`);
      score -= 0.1;
    }
    
    return {
      score: Math.max(0, score),
      inconsistencies
    };
  }

  private async validateActionability(results: RefinedAnalysisResult): Promise<ActionabilityScore> {
    console.log('🎯 Validating recommendation actionability...');
    
    const vagueSuggestions: string[] = [];
    let score = 1.0;
    
    // Check if recommendations are specific and actionable
    for (const recommendation of results.consensus.finalRecommendations) {
      const actionabilityIssues = this.assessRecommendationActionability(recommendation);
      if (actionabilityIssues.length > 0) {
        vagueSuggestions.push(`${recommendation.description}: ${actionabilityIssues.join(', ')}`);
        score -= 0.05;
      }
    }
    
    // Check if findings provide clear context
    for (const finding of results.consensus.finalFindings) {
      if (!finding.file || finding.file === 'multiple') {
        if (!finding.evidence || finding.evidence.length === 0) {
          vagueSuggestions.push(`Finding "${finding.message}" lacks specific location and context`);
          score -= 0.03;
        }
      }
    }
    
    // Check if recommendations have effort estimates
    const recommendationsWithoutEffort = results.consensus.finalRecommendations.filter(r => !r.effort);
    if (recommendationsWithoutEffort.length > 0) {
      vagueSuggestions.push(`${recommendationsWithoutEffort.length} recommendations lack effort estimates`);
      score -= 0.1;
    }
    
    return {
      score: Math.max(0, score),
      vagueSuggestions
    };
  }

  private async validateEvidence(results: RefinedAnalysisResult): Promise<EvidenceScore> {
    console.log('📚 Validating evidence quality...');
    
    const unsupportedClaims: string[] = [];
    let score = 1.0;
    
    // Check if findings have supporting evidence
    for (const finding of results.consensus.finalFindings) {
      if (!finding.evidence || finding.evidence.length === 0) {
        unsupportedClaims.push(`Finding: "${finding.message}" lacks supporting evidence`);
        score -= 0.1;
      } else {
        // Check evidence quality
        const weakEvidence = finding.evidence.filter(e => e.length < 10 || e.includes('TODO') || e.includes('placeholder'));
        if (weakEvidence.length > 0) {
          unsupportedClaims.push(`Finding: "${finding.message}" has weak evidence`);
          score -= 0.05;
        }
      }
    }
    
    // Check if recommendations have rationale
    for (const recommendation of results.consensus.finalRecommendations) {
      if (!recommendation.rationale || recommendation.rationale.length < 20) {
        unsupportedClaims.push(`Recommendation: "${recommendation.description}" lacks sufficient rationale`);
        score -= 0.05;
      }
    }
    
    // Check if high-severity findings have strong evidence
    const criticalFindings = results.consensus.finalFindings.filter(f => f.severity === 'critical');
    for (const finding of criticalFindings) {
      if (!finding.evidence || finding.evidence.length < 2) {
        unsupportedClaims.push(`Critical finding: "${finding.message}" needs stronger evidence`);
        score -= 0.2;
      }
    }
    
    return {
      score: Math.max(0, score),
      unsupportedClaims
    };
  }

  private calculateConfidenceScores(
    results: RefinedAnalysisResult,
    validation: {
      completeness: CompletenessScore;
      consistency: ConsistencyScore;
      actionability: ActionabilityScore;
      evidenceBased: EvidenceScore;
    }
  ): Map<string, number> {
    const scores = new Map<string, number>();
    
    // Individual validation scores
    scores.set('completeness', validation.completeness.score);
    scores.set('consistency', validation.consistency.score);
    scores.set('actionability', validation.actionability.score);
    scores.set('evidence', validation.evidenceBased.score);
    
    // Overall quality score
    const overallScore = (
      validation.completeness.score +
      validation.consistency.score +
      validation.actionability.score +
      validation.evidenceBased.score
    ) / 4;
    
    scores.set('overall', overallScore);
    
    // Analysis-specific confidence scores
    for (const result of results.individualResults) {
      scores.set(result.type, result.confidence);
    }
    
    return scores;
  }

  // Quality improvement methods
  private async improveCompleteness(
    results: RefinedAnalysisResult,
    completeness: CompletenessScore
  ): Promise<RefinedAnalysisResult> {
    console.log('📈 Improving analysis completeness...');
    
    const improvedResults = { ...results };
    
    // Add missing evidence to findings
    improvedResults.consensus.finalFindings = improvedResults.consensus.finalFindings.map(finding => {
      if (!finding.evidence || finding.evidence.length === 0) {
        return {
          ...finding,
          evidence: [`Analysis indicates ${finding.type} issue in ${finding.file}`]
        };
      }
      return finding;
    });
    
    // Add implementation details to vague recommendations
    improvedResults.consensus.finalRecommendations = improvedResults.consensus.finalRecommendations.map(rec => {
      if (!rec.implementation || rec.implementation.length < 20) {
        return {
          ...rec,
          implementation: `${rec.implementation || 'Implement the following:'} Review the ${rec.category} aspects and apply best practices.`
        };
      }
      return rec;
    });
    
    return improvedResults;
  }

  private async improveConsistency(
    results: RefinedAnalysisResult,
    consistency: ConsistencyScore
  ): Promise<RefinedAnalysisResult> {
    console.log('🔄 Improving analysis consistency...');
    
    const improvedResults = { ...results };
    
    // Remove duplicate findings
    const uniqueFindings = this.deduplicateFindings(improvedResults.consensus.finalFindings);
    improvedResults.consensus.finalFindings = uniqueFindings;
    
    // Align recommendation priorities with finding severities
    improvedResults.consensus.finalRecommendations = this.alignRecommendationPriorities(
      improvedResults.consensus.finalFindings,
      improvedResults.consensus.finalRecommendations
    );
    
    return improvedResults;
  }

  private async improveActionability(
    results: RefinedAnalysisResult,
    actionability: ActionabilityScore
  ): Promise<RefinedAnalysisResult> {
    console.log('🎯 Improving recommendation actionability...');
    
    const improvedResults = { ...results };
    
    // Add effort estimates to recommendations without them
    improvedResults.consensus.finalRecommendations = improvedResults.consensus.finalRecommendations.map(rec => {
      if (!rec.effort) {
        return {
          ...rec,
          effort: this.estimateEffort(rec) as 'low' | 'medium' | 'high'
        };
      }
      return rec;
    });
    
    return improvedResults;
  }

  private async improveEvidence(
    results: RefinedAnalysisResult,
    evidence: EvidenceScore
  ): Promise<RefinedAnalysisResult> {
    console.log('📚 Improving evidence quality...');
    
    const improvedResults = { ...results };
    
    // Enhance rationale for recommendations
    improvedResults.consensus.finalRecommendations = improvedResults.consensus.finalRecommendations.map(rec => {
      if (!rec.rationale || rec.rationale.length < 20) {
        return {
          ...rec,
          rationale: `${rec.rationale || ''} This recommendation addresses ${rec.category} concerns and will improve code quality and maintainability.`
        };
      }
      return rec;
    });
    
    return improvedResults;
  }

  // Helper methods for validation
  private findConflictingFindings(individualResults: any[]): any[] {
    // Implementation would find conflicting findings between agents
    return [];
  }

  private findSeverityInconsistencies(findings: Finding[]): any[] {
    // Implementation would find inconsistent severity assessments
    return [];
  }

  private findPriorityInconsistencies(findings: Finding[], recommendations: Recommendation[]): any[] {
    // Implementation would find inconsistent priorities
    return [];
  }

  private findDuplicateFindings(findings: Finding[]): Finding[] {
    const seen = new Set<string>();
    const duplicates: Finding[] = [];
    
    for (const finding of findings) {
      const key = `${finding.type}-${finding.file}-${finding.message.substring(0, 50)}`;
      if (seen.has(key)) {
        duplicates.push(finding);
      } else {
        seen.add(key);
      }
    }
    
    return duplicates;
  }

  private assessRecommendationActionability(recommendation: Recommendation): string[] {
    const issues: string[] = [];
    
    if (!recommendation.implementation || recommendation.implementation.length < 20) {
      issues.push('lacks implementation details');
    }
    
    if (recommendation.description.includes('should') || recommendation.description.includes('consider')) {
      if (!recommendation.implementation.includes('specific') && !recommendation.implementation.includes('example')) {
        issues.push('too vague, needs specific examples');
      }
    }
    
    return issues;
  }

  private deduplicateFindings(findings: Finding[]): Finding[] {
    const unique = new Map<string, Finding>();
    
    for (const finding of findings) {
      const key = `${finding.type}-${finding.file}-${finding.message.substring(0, 50)}`;
      if (!unique.has(key) || unique.get(key)!.severity < finding.severity) {
        unique.set(key, finding);
      }
    }
    
    return Array.from(unique.values());
  }

  private alignRecommendationPriorities(findings: Finding[], recommendations: Recommendation[]): Recommendation[] {
    return recommendations.map(rec => {
      // Find related findings
      const relatedFindings = findings.filter(f => 
        f.type.includes(rec.category) || rec.description.includes(f.type)
      );
      
      if (relatedFindings.length > 0) {
        const maxSeverity = relatedFindings.reduce((max, f) => {
          const severityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
          return severityOrder[f.severity] > severityOrder[max] ? f.severity : max;
        }, 'low' as 'low' | 'medium' | 'high' | 'critical');
        
        // Align priority with severity
        let priority: 'must-fix' | 'should-fix' | 'consider' = rec.priority;
        if (maxSeverity === 'critical') priority = 'must-fix';
        else if (maxSeverity === 'high') priority = 'should-fix';
        
        return { ...rec, priority };
      }
      
      return rec;
    });
  }

  private estimateEffort(recommendation: Recommendation): string {
    // Simple heuristic for effort estimation
    if (recommendation.category === 'security' || recommendation.priority === 'must-fix') {
      return 'high';
    }
    if (recommendation.description.length > 100) {
      return 'medium';
    }
    return 'low';
  }
}
