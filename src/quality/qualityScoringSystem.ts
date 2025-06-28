/**
 * Quality Scoring System - Complete Implementation
 * Provides comprehensive quality assessment and scoring for PR analysis results
 */
import { 
  Finding,
  Recommendation,
  AnalysisType
} from '../types/analysis.js';
import { RefinedAnalysisResult } from '../orchestration/multiModelOrchestrator.js';
import { QualityValidation } from './qualityGatesService.js';

export class QualityScoringSystem {
  private scoringWeights: ScoringWeights;
  private qualityDimensions: QualityDimension[];
  private benchmarkScores: BenchmarkScores;

  constructor() {
    this.scoringWeights = this.initializeScoringWeights();
    this.qualityDimensions = this.initializeQualityDimensions();
    this.benchmarkScores = this.initializeBenchmarkScores();
  }

  async calculateComprehensiveQualityScore(
    results: RefinedAnalysisResult,
    validation: QualityValidation
  ): Promise<ComprehensiveQualityScore> {
    console.log('📊 Calculating comprehensive quality score...');

    try {
      // Calculate individual dimension scores
      const dimensionScores = await this.calculateDimensionScores(results, validation);

      // Calculate weighted overall score
      const overallScore = this.calculateWeightedScore(dimensionScores);

      // Determine quality grade
      const qualityGrade = this.determineQualityGrade(overallScore);

      // Generate quality insights
      const insights = await this.generateQualityInsights(dimensionScores, results);

      // Compare with benchmarks
      const benchmarkComparison = this.compareToBenchmarks(dimensionScores);

      // Calculate improvement potential
      const improvementPotential = this.calculateImprovementPotential(dimensionScores);

      const comprehensiveScore: ComprehensiveQualityScore = {
        overallScore,
        qualityGrade,
        dimensionScores,
        insights,
        benchmarkComparison,
        improvementPotential,
        timestamp: new Date(),
        metadata: {
          analysisTypes: results.finalResults.individualResults.map(r => r.agentType),
          totalFindings: results.finalResults.consensus.findings.length,
          totalRecommendations: results.finalResults.consensus.recommendations.length,
          modelAgreement: results.finalResults.crossValidation.overallAgreement,
          refinementIterations: results.refinementHistory.length
        }
      };

      console.log(`✅ Quality score calculated: ${(overallScore * 100).toFixed(1)}% (${qualityGrade})`);
      return comprehensiveScore;

    } catch (error) {
      console.error('❌ Quality scoring failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Quality scoring failed: ${errorMessage}`);
    }
  }

  async trackQualityTrends(
    currentScore: ComprehensiveQualityScore,
    historicalScores: ComprehensiveQualityScore[]
  ): Promise<QualityTrends> {
    console.log('📈 Analyzing quality trends...');

    const trends: QualityTrends = {
      overallTrend: this.calculateTrend(
        historicalScores.map(s => s.overallScore),
        currentScore.overallScore
      ),
      dimensionTrends: {},
      improvementAreas: [],
      strengths: [],
      recommendations: []
    };

    // Calculate trends for each dimension
    for (const dimension of this.qualityDimensions) {
      const historicalValues = historicalScores.map(s => 
        s.dimensionScores[dimension.id]?.score || 0
      );
      const currentValue = currentScore.dimensionScores[dimension.id]?.score || 0;
      
      trends.dimensionTrends[dimension.id] = this.calculateTrend(historicalValues, currentValue);
    }

    // Identify improvement areas and strengths
    Object.entries(trends.dimensionTrends).forEach(([dimensionId, trend]) => {
      const dimension = this.qualityDimensions.find(d => d.id === dimensionId);
      if (!dimension) return;

      if (trend.direction === 'declining' || trend.currentValue < 0.7) {
        trends.improvementAreas.push({
          dimension: dimension.name,
          currentScore: trend.currentValue,
          trend: trend.direction,
          priority: trend.currentValue < 0.5 ? 'high' : 'medium'
        });
      } else if (trend.direction === 'improving' || trend.currentValue > 0.8) {
        trends.strengths.push({
          dimension: dimension.name,
          currentScore: trend.currentValue,
          trend: trend.direction
        });
      }
    });

    // Generate trend-based recommendations
    trends.recommendations = this.generateTrendRecommendations(trends);

    return trends;
  }

  private async calculateDimensionScores(
    results: RefinedAnalysisResult,
    validation: QualityValidation
  ): Promise<Record<string, DimensionScore>> {
    const scores: Record<string, DimensionScore> = {};

    for (const dimension of this.qualityDimensions) {
      const score = await this.calculateDimensionScore(dimension, results, validation);
      scores[dimension.id] = score;
    }

    return scores;
  }

  private async calculateDimensionScore(
    dimension: QualityDimension,
    results: RefinedAnalysisResult,
    validation: QualityValidation
  ): Promise<DimensionScore> {
    let score = 0;
    const metrics: Record<string, number> = {};

    switch (dimension.id) {
      case 'completeness':
        score = validation.completeness.score;
        metrics['type-coverage'] = validation.completeness.coveredTypes.length / 4;
        metrics['file-coverage'] = validation.completeness.filesCovered.length > 0 ? 1 : 0;
        metrics['recommendation-presence'] = validation.completeness.hasActionableRecommendations ? 1 : 0;
        break;

      case 'accuracy':
        score = this.calculateAccuracyScore(results);
        metrics['evidence-quality'] = validation.evidenceBased.score;
        metrics['confidence-level'] = validation.confidenceScores.score;
        metrics['model-agreement'] = results.finalResults.crossValidation.overallAgreement;
        break;

      case 'actionability':
        score = validation.actionability.score;
        metrics['implementation-guidance'] = validation.actionability.withImplementation / Math.max(validation.actionability.totalRecommendations, 1);
        metrics['effort-estimation'] = validation.actionability.withEffort / Math.max(validation.actionability.totalRecommendations, 1);
        metrics['priority-assignment'] = validation.actionability.withPriority / Math.max(validation.actionability.totalRecommendations, 1);
        break;

      case 'consistency':
        score = validation.consistency.score;
        metrics['cross-model-agreement'] = validation.consistency.agreementScore;
        metrics['finding-consistency'] = validation.consistency.findingConsistency;
        metrics['recommendation-consistency'] = validation.consistency.recommendationConsistency;
        break;

      case 'depth':
        score = this.calculateDepthScore(results);
        metrics['analysis-depth'] = this.assessAnalysisDepth(results);
        metrics['evidence-depth'] = this.assessEvidenceDepth(results);
        metrics['refinement-quality'] = this.assessRefinementQuality(results);
        break;

      case 'relevance':
        score = this.calculateRelevanceScore(results);
        metrics['context-relevance'] = this.assessContextRelevance(results);
        metrics['finding-relevance'] = this.assessFindingRelevance(results);
        metrics['recommendation-relevance'] = this.assessRecommendationRelevance(results);
        break;
    }

    return {
      score,
      grade: this.scoreToGrade(score),
      metrics,
      strengths: this.identifyDimensionStrengths(dimension, metrics),
      weaknesses: this.identifyDimensionWeaknesses(dimension, metrics),
      recommendations: this.generateDimensionRecommendations(dimension, metrics)
    };
  }

  private calculateWeightedScore(dimensionScores: Record<string, DimensionScore>): number {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(dimensionScores).forEach(([dimensionId, dimensionScore]) => {
      const weight = this.scoringWeights[dimensionId] || 0;
      weightedSum += dimensionScore.score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private determineQualityGrade(score: number): QualityGrade {
    if (score >= 0.9) return 'A+';
    if (score >= 0.85) return 'A';
    if (score >= 0.8) return 'A-';
    if (score >= 0.75) return 'B+';
    if (score >= 0.7) return 'B';
    if (score >= 0.65) return 'B-';
    if (score >= 0.6) return 'C+';
    if (score >= 0.55) return 'C';
    if (score >= 0.5) return 'C-';
    if (score >= 0.4) return 'D';
    return 'F';
  }

  private async generateQualityInsights(
    dimensionScores: Record<string, DimensionScore>,
    results: RefinedAnalysisResult
  ): Promise<QualityInsight[]> {
    const insights: QualityInsight[] = [];

    // Overall performance insights
    const overallScore = this.calculateWeightedScore(dimensionScores);
    if (overallScore > 0.85) {
      insights.push({
        type: 'strength',
        category: 'overall',
        message: 'Excellent overall analysis quality with comprehensive coverage',
        impact: 'high',
        actionable: false
      });
    } else if (overallScore < 0.6) {
      insights.push({
        type: 'improvement',
        category: 'overall',
        message: 'Analysis quality needs significant improvement across multiple dimensions',
        impact: 'high',
        actionable: true,
        recommendation: 'Focus on improving completeness, accuracy, and actionability'
      });
    }

    // Dimension-specific insights
    Object.entries(dimensionScores).forEach(([dimensionId, score]) => {
      const dimension = this.qualityDimensions.find(d => d.id === dimensionId);
      if (!dimension) return;

      if (score.score > 0.9) {
        insights.push({
          type: 'strength',
          category: dimension.name.toLowerCase(),
          message: `Exceptional ${dimension.name.toLowerCase()} with comprehensive coverage`,
          impact: 'medium',
          actionable: false
        });
      } else if (score.score < 0.5) {
        insights.push({
          type: 'critical',
          category: dimension.name.toLowerCase(),
          message: `Critical issues in ${dimension.name.toLowerCase()} require immediate attention`,
          impact: 'high',
          actionable: true,
          recommendation: score.recommendations[0] || `Improve ${dimension.name.toLowerCase()}`
        });
      }
    });

    // Model agreement insights
    const modelAgreement = results.finalResults.crossValidation.overallAgreement;
    if (modelAgreement > 0.9) {
      insights.push({
        type: 'strength',
        category: 'consensus',
        message: 'Excellent model agreement indicates high confidence in results',
        impact: 'medium',
        actionable: false
      });
    } else if (modelAgreement < 0.6) {
      insights.push({
        type: 'warning',
        category: 'consensus',
        message: 'Low model agreement suggests uncertainty in analysis results',
        impact: 'medium',
        actionable: true,
        recommendation: 'Consider additional validation or expert review'
      });
    }

    return insights;
  }

  private compareToBenchmarks(dimensionScores: Record<string, DimensionScore>): BenchmarkComparison {
    const comparison: BenchmarkComparison = {
      overallRanking: 'average',
      dimensionRankings: {},
      exceedsIndustryStandard: false,
      areasAboveBenchmark: [],
      areasBelowBenchmark: []
    };

    let aboveBenchmarkCount = 0;
    let totalDimensions = 0;

    Object.entries(dimensionScores).forEach(([dimensionId, score]) => {
      const benchmark = this.benchmarkScores[dimensionId];
      if (!benchmark) return;

      totalDimensions++;
      const ranking = this.determineBenchmarkRanking(score.score, benchmark);
      comparison.dimensionRankings[dimensionId] = ranking;

      if (score.score > benchmark.industry) {
        aboveBenchmarkCount++;
        comparison.areasAboveBenchmark.push(dimensionId);
      } else if (score.score < benchmark.minimum) {
        comparison.areasBelowBenchmark.push(dimensionId);
      }
    });

    // Determine overall ranking
    const benchmarkRatio = totalDimensions > 0 ? aboveBenchmarkCount / totalDimensions : 0;
    if (benchmarkRatio > 0.8) comparison.overallRanking = 'excellent';
    else if (benchmarkRatio > 0.6) comparison.overallRanking = 'good';
    else if (benchmarkRatio > 0.4) comparison.overallRanking = 'average';
    else comparison.overallRanking = 'below-average';

    comparison.exceedsIndustryStandard = benchmarkRatio > 0.7;

    return comparison;
  }

  private calculateImprovementPotential(dimensionScores: Record<string, DimensionScore>): ImprovementPotential {
    const potential: ImprovementPotential = {
      overallPotential: 0,
      quickWins: [],
      longTermImprovements: [],
      prioritizedActions: []
    };

    const improvements: Array<{dimension: string, potential: number, effort: 'low' | 'medium' | 'high'}> = [];

    Object.entries(dimensionScores).forEach(([dimensionId, score]) => {
      const maxPossible = 1.0;
      const improvementPotential = maxPossible - score.score;
      
      if (improvementPotential > 0.1) {
        const effort = this.estimateImprovementEffort(dimensionId, score.score);
        improvements.push({
          dimension: dimensionId,
          potential: improvementPotential,
          effort
        });

        if (effort === 'low' && improvementPotential > 0.2) {
          potential.quickWins.push({
            dimension: dimensionId,
            currentScore: score.score,
            potentialScore: Math.min(score.score + 0.2, 1.0),
            effort: 'low',
            timeframe: 'immediate'
          });
        } else if (improvementPotential > 0.3) {
          potential.longTermImprovements.push({
            dimension: dimensionId,
            currentScore: score.score,
            potentialScore: Math.min(score.score + 0.3, 1.0),
            effort,
            timeframe: effort === 'high' ? 'long-term' : 'medium-term'
          });
        }
      }
    });

    // Calculate overall potential
    potential.overallPotential = improvements.reduce((sum, imp) => sum + imp.potential, 0) / improvements.length;

    // Prioritize actions
    potential.prioritizedActions = improvements
      .sort((a, b) => {
        // Prioritize by potential impact and inverse effort
        const scoreA = a.potential * (a.effort === 'low' ? 3 : a.effort === 'medium' ? 2 : 1);
        const scoreB = b.potential * (b.effort === 'low' ? 3 : b.effort === 'medium' ? 2 : 1);
        return scoreB - scoreA;
      })
      .slice(0, 5)
      .map(imp => ({
        dimension: imp.dimension,
        action: `Improve ${imp.dimension}`,
        expectedImpact: imp.potential,
        effort: imp.effort,
        priority: imp.potential > 0.3 ? 'high' : imp.potential > 0.2 ? 'medium' : 'low'
      }));

    return potential;
  }

  // Helper methods for score calculations
  private calculateAccuracyScore(results: RefinedAnalysisResult): number {
    const consensus = results.finalResults.consensus;
    const modelAgreement = results.finalResults.crossValidation.overallAgreement;
    const confidenceSum = consensus.findings.reduce((sum, f) => sum + (f.confidence || 0.5), 0);
    const avgConfidence = consensus.findings.length > 0 ? confidenceSum / consensus.findings.length : 0.5;
    
    return (modelAgreement + avgConfidence) / 2;
  }

  private calculateDepthScore(results: RefinedAnalysisResult): number {
    const findings = results.finalResults.consensus.findings;
    const recommendations = results.finalResults.consensus.recommendations;
    
    // Assess depth based on evidence quality and recommendation detail
    const evidenceDepth = findings.filter(f => f.evidence && f.evidence.length > 1).length / Math.max(findings.length, 1);
    const recommendationDepth = recommendations.filter(r => r.implementation && r.rationale).length / Math.max(recommendations.length, 1);
    const refinementDepth = results.refinementHistory.length > 0 ? 0.2 : 0;
    
    return (evidenceDepth + recommendationDepth + refinementDepth) / 2;
  }

  private calculateRelevanceScore(results: RefinedAnalysisResult): number {
    // Simplified relevance calculation
    const findings = results.finalResults.consensus.findings;
    const hasFileSpecificFindings = findings.filter(f => f.file && f.file.length > 0).length / Math.max(findings.length, 1);
    const hasLineNumbers = findings.filter(f => f.lineNumber && f.lineNumber > 0).length / Math.max(findings.length, 1);
    
    return (hasFileSpecificFindings + hasLineNumbers) / 2;
  }

  // Additional helper methods
  private assessAnalysisDepth(results: RefinedAnalysisResult): number {
    return results.finalResults.individualResults.length / 4; // Assuming 4 analysis types
  }

  private assessEvidenceDepth(results: RefinedAnalysisResult): number {
    const findings = results.finalResults.consensus.findings;
    const withEvidence = findings.filter(f => f.evidence && f.evidence.length > 0).length;
    return findings.length > 0 ? withEvidence / findings.length : 1;
  }

  private assessRefinementQuality(results: RefinedAnalysisResult): number {
    return results.refinementHistory.length > 0 ? 
      results.refinementHistory[results.refinementHistory.length - 1].qualityImprovement : 0;
  }

  private assessContextRelevance(results: RefinedAnalysisResult): number {
    // Simplified context relevance assessment
    return 0.8; // Placeholder
  }

  private assessFindingRelevance(results: RefinedAnalysisResult): number {
    const findings = results.finalResults.consensus.findings;
    const relevantFindings = findings.filter(f => f.file && f.lineNumber).length;
    return findings.length > 0 ? relevantFindings / findings.length : 1;
  }

  private assessRecommendationRelevance(results: RefinedAnalysisResult): number {
    const recommendations = results.finalResults.consensus.recommendations;
    const relevantRecs = recommendations.filter(r => r.implementation && r.rationale).length;
    return recommendations.length > 0 ? relevantRecs / recommendations.length : 1;
  }

  private scoreToGrade(score: number): string {
    return this.determineQualityGrade(score);
  }

  private identifyDimensionStrengths(dimension: QualityDimension, metrics: Record<string, number>): string[] {
    const strengths: string[] = [];
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value > 0.8) {
        strengths.push(`Excellent ${metric.replace('-', ' ')}`);
      }
    });
    return strengths;
  }

  private identifyDimensionWeaknesses(dimension: QualityDimension, metrics: Record<string, number>): string[] {
    const weaknesses: string[] = [];
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value < 0.5) {
        weaknesses.push(`Poor ${metric.replace('-', ' ')}`);
      }
    });
    return weaknesses;
  }

  private generateDimensionRecommendations(dimension: QualityDimension, metrics: Record<string, number>): string[] {
    const recommendations: string[] = [];
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value < 0.6) {
        recommendations.push(`Improve ${metric.replace('-', ' ')}`);
      }
    });
    return recommendations;
  }

  private calculateTrend(historicalValues: number[], currentValue: number): QualityTrend {
    if (historicalValues.length === 0) {
      return {
        direction: 'stable',
        changeRate: 0,
        currentValue,
        previousValue: currentValue,
        confidence: 0.5
      };
    }

    const previousValue = historicalValues[historicalValues.length - 1];
    const changeRate = currentValue - previousValue;
    
    let direction: 'improving' | 'declining' | 'stable';
    if (Math.abs(changeRate) < 0.05) direction = 'stable';
    else if (changeRate > 0) direction = 'improving';
    else direction = 'declining';

    return {
      direction,
      changeRate,
      currentValue,
      previousValue,
      confidence: historicalValues.length > 3 ? 0.8 : 0.6
    };
  }

  private generateTrendRecommendations(trends: QualityTrends): string[] {
    const recommendations: string[] = [];

    if (trends.overallTrend.direction === 'declining') {
      recommendations.push('Overall quality is declining - implement quality improvement measures');
    }

    trends.improvementAreas.forEach(area => {
      if (area.priority === 'high') {
        recommendations.push(`Critical: Address declining ${area.dimension} immediately`);
      }
    });

    if (trends.strengths.length > 0) {
      recommendations.push(`Maintain excellence in: ${trends.strengths.map(s => s.dimension).join(', ')}`);
    }

    return recommendations;
  }

  private determineBenchmarkRanking(score: number, benchmark: BenchmarkScore): string {
    if (score >= benchmark.excellent) return 'excellent';
    if (score >= benchmark.good) return 'good';
    if (score >= benchmark.industry) return 'industry-standard';
    if (score >= benchmark.minimum) return 'acceptable';
    return 'below-standard';
  }

  private estimateImprovementEffort(dimensionId: string, currentScore: number): 'low' | 'medium' | 'high' {
    // Estimate effort based on dimension and current score
    const effortMap: Record<string, 'low' | 'medium' | 'high'> = {
      'completeness': 'medium',
      'accuracy': 'high',
      'actionability': 'low',
      'consistency': 'medium',
      'depth': 'high',
      'relevance': 'medium'
    };

    const baseEffort = effortMap[dimensionId] || 'medium';
    
    // Adjust based on current score
    if (currentScore < 0.3) return 'high';
    if (currentScore > 0.7) return 'low';
    
    return baseEffort;
  }

  private initializeScoringWeights(): ScoringWeights {
    return {
      completeness: 0.25,
      accuracy: 0.20,
      actionability: 0.20,
      consistency: 0.15,
      depth: 0.10,
      relevance: 0.10
    };
  }

  private initializeQualityDimensions(): QualityDimension[] {
    return [
      {
        id: 'completeness',
        name: 'Completeness',
        description: 'Coverage of all required analysis areas',
        weight: 0.25
      },
      {
        id: 'accuracy',
        name: 'Accuracy',
        description: 'Correctness and reliability of findings',
        weight: 0.20
      },
      {
        id: 'actionability',
        name: 'Actionability',
        description: 'Practicality and implementability of recommendations',
        weight: 0.20
      },
      {
        id: 'consistency',
        name: 'Consistency',
        description: 'Agreement across models and internal coherence',
        weight: 0.15
      },
      {
        id: 'depth',
        name: 'Depth',
        description: 'Thoroughness and detail of analysis',
        weight: 0.10
      },
      {
        id: 'relevance',
        name: 'Relevance',
        description: 'Applicability to the specific code changes',
        weight: 0.10
      }
    ];
  }

  private initializeBenchmarkScores(): BenchmarkScores {
    return {
      completeness: { minimum: 0.6, industry: 0.75, good: 0.85, excellent: 0.95 },
      accuracy: { minimum: 0.7, industry: 0.8, good: 0.9, excellent: 0.95 },
      actionability: { minimum: 0.6, industry: 0.75, good: 0.85, excellent: 0.9 },
      consistency: { minimum: 0.65, industry: 0.75, good: 0.85, excellent: 0.9 },
      depth: { minimum: 0.5, industry: 0.7, good: 0.8, excellent: 0.9 },
      relevance: { minimum: 0.6, industry: 0.75, good: 0.85, excellent: 0.9 }
    };
  }
}

// Supporting interfaces
type QualityGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

interface ScoringWeights {
  [dimensionId: string]: number;
}

interface QualityDimension {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface BenchmarkScores {
  [dimensionId: string]: BenchmarkScore;
}

interface BenchmarkScore {
  minimum: number;
  industry: number;
  good: number;
  excellent: number;
}

export interface ComprehensiveQualityScore {
  overallScore: number;
  qualityGrade: QualityGrade;
  dimensionScores: Record<string, DimensionScore>;
  insights: QualityInsight[];
  benchmarkComparison: BenchmarkComparison;
  improvementPotential: ImprovementPotential;
  timestamp: Date;
  metadata: {
    analysisTypes: AnalysisType[];
    totalFindings: number;
    totalRecommendations: number;
    modelAgreement: number;
    refinementIterations: number;
  };
}

interface DimensionScore {
  score: number;
  grade: string;
  metrics: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface QualityInsight {
  type: 'strength' | 'improvement' | 'warning' | 'critical';
  category: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendation?: string;
}

interface BenchmarkComparison {
  overallRanking: 'excellent' | 'good' | 'average' | 'below-average';
  dimensionRankings: Record<string, string>;
  exceedsIndustryStandard: boolean;
  areasAboveBenchmark: string[];
  areasBelowBenchmark: string[];
}

interface ImprovementPotential {
  overallPotential: number;
  quickWins: Array<{
    dimension: string;
    currentScore: number;
    potentialScore: number;
    effort: string;
    timeframe: string;
  }>;
  longTermImprovements: Array<{
    dimension: string;
    currentScore: number;
    potentialScore: number;
    effort: string;
    timeframe: string;
  }>;
  prioritizedActions: Array<{
    dimension: string;
    action: string;
    expectedImpact: number;
    effort: string;
    priority: string;
  }>;
}

export interface QualityTrends {
  overallTrend: QualityTrend;
  dimensionTrends: Record<string, QualityTrend>;
  improvementAreas: Array<{
    dimension: string;
    currentScore: number;
    trend: string;
    priority: string;
  }>;
  strengths: Array<{
    dimension: string;
    currentScore: number;
    trend: string;
  }>;
  recommendations: string[];
}

interface QualityTrend {
  direction: 'improving' | 'declining' | 'stable';
  changeRate: number;
  currentValue: number;
  previousValue: number;
  confidence: number;
}
