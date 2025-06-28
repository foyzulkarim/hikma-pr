/**
 * System Orchestrator - Complete Integration
 * Orchestrates the entire Hikma-PR analysis pipeline from start to finish
 */
import { 
  EnhancedPRContext,
  RepositoryMetadata,
  AnalysisType
} from '../types/analysis.js';

// Phase imports
import { RepositoryIntelligenceService } from '../services/repositoryIntelligenceService.js';
import { DynamicPromptBuilder } from '../prompts/dynamicPromptBuilder.js';
import { ContextAwareEnhancer } from '../prompts/contextAwareEnhancer.js';
import { MultiModelOrchestrator, RefinedAnalysisResult } from '../orchestration/multiModelOrchestrator.js';
import { QualityGatesService, QualityValidation } from '../quality/qualityGatesService.js';
import { QualityScoringSystem, ComprehensiveQualityScore } from '../quality/qualityScoringSystem.js';
import { QualityReportingService, ExecutiveReport } from '../quality/qualityReportingService.js';

// Analysis agents
import { ArchitecturalAnalysisAgent } from '../agents/architecturalAnalysisAgent.js';
import { SecurityAnalysisAgent } from '../agents/securityAnalysisAgent.js';
import { PerformanceAnalysisAgent } from '../agents/performanceAnalysisAgent.js';
import { TestingQualityAgent } from '../agents/testingQualityAgent.js';

export class SystemOrchestrator {
  // Phase services
  private repositoryIntelligence!: RepositoryIntelligenceService;
  private promptBuilder!: DynamicPromptBuilder;
  private contextEnhancer!: ContextAwareEnhancer;
  private multiModelOrchestrator!: MultiModelOrchestrator;
  private qualityGates!: QualityGatesService;
  private qualityScoring!: QualityScoringSystem;
  private qualityReporting!: QualityReportingService;

  // Analysis agents
  private analysisAgents!: Map<AnalysisType, any>;

  // System configuration
  private systemConfig: SystemConfiguration;
  private performanceMonitor: PerformanceMonitor;

  constructor(config?: Partial<SystemConfiguration>) {
    this.systemConfig = { ...this.getDefaultConfiguration(), ...config };
    this.initializeServices();
    this.initializeAgents();
    this.performanceMonitor = new PerformanceMonitor();
  }

  async executeCompletePRAnalysis(
    repoUrl: string,
    prNumber: number,
    options?: AnalysisOptions
  ): Promise<CompletePRAnalysisResult> {
    console.log('\n🚀 Starting Complete PR Analysis Pipeline...');
    console.log('=' .repeat(80));
    
    const startTime = Date.now();
    const analysisId = this.generateAnalysisId();
    
    try {
      // Phase 1: Repository Intelligence & Context Building
      console.log('\n📊 Phase 1: Repository Intelligence & Context Building');
      const repositoryContext = await this.executePhase1(repoUrl, prNumber);
      
      // Phase 2: Dynamic Prompt Generation
      console.log('\n🎯 Phase 2: Dynamic Prompt Generation');
      const promptContext = await this.executePhase2(repositoryContext);
      
      // Phase 3: Multi-Model Analysis
      console.log('\n🤖 Phase 3: Multi-Model Analysis & Orchestration');
      const analysisResults = await this.executePhase3(repositoryContext, promptContext);
      
      // Phase 4: Quality Gates & Validation
      console.log('\n🔍 Phase 4: Quality Gates & Validation');
      const qualityResults = await this.executePhase4(analysisResults, repositoryContext);
      
      // Phase 5: Final Synthesis & Reporting
      console.log('\n📋 Phase 5: Final Synthesis & Reporting');
      const finalResults = await this.executePhase5(
        analysisResults,
        qualityResults,
        repositoryContext,
        options
      );

      const totalTime = Date.now() - startTime;
      
      // Performance tracking
      await this.performanceMonitor.recordAnalysis({
        analysisId,
        totalTime,
        success: true,
        phases: finalResults.phaseMetrics,
        qualityScore: finalResults.qualityScore.overallScore
      });

      console.log('\n✅ Complete PR Analysis Pipeline Finished!');
      console.log(`⏱️ Total Time: ${(totalTime / 1000).toFixed(1)}s`);
      console.log(`🏆 Quality Score: ${(finalResults.qualityScore.overallScore * 100).toFixed(1)}%`);
      console.log('=' .repeat(80));

      return finalResults;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error('\n❌ Complete PR Analysis Pipeline Failed!');
      console.error(`Error: ${errorMessage}`);
      console.error(`Time elapsed: ${(totalTime / 1000).toFixed(1)}s`);
      
      // Record failure
      await this.performanceMonitor.recordAnalysis({
        analysisId,
        totalTime,
        success: false,
        error: errorMessage
      });

      throw new Error(`Complete PR analysis failed: ${errorMessage}`);
    }
  }

  private async executePhase1(
    repoUrl: string,
    prNumber: number
  ): Promise<EnhancedPRContext> {
    const phaseStart = Date.now();
    
    try {
      console.log('  🔍 Acquiring complete repository context...');
      const repositoryContext = await this.repositoryIntelligence.acquireCompleteContext(
        repoUrl,
        prNumber
      );
      
      console.log('  📊 Building blast radius analysis...');
      const blastRadius = await this.repositoryIntelligence.buildBlastRadius(
        repositoryContext.changedFiles,
        repositoryContext.repoPath
      );
      
      console.log('  🧠 Extracting contextual code...');
      const contextualCode = await this.repositoryIntelligence.extractContextualCode(
        repositoryContext.changedFiles,
        blastRadius,
        repositoryContext.repoPath
      );

      const enhancedContext: EnhancedPRContext = {
        repositoryMetadata: repositoryContext.repositoryMetadata || {
          name: 'unknown',
          language: 'typescript',
          framework: 'unknown',
          architecture: 'unknown',
          size: { files: 0, lines: 0, bytes: 0 }
        },
        architecturalPatterns: repositoryContext.architecturalPatterns || [],
        completeFiles: repositoryContext.completeFiles || new Map(),
        historicalContext: repositoryContext.historicalContext || {
          recentChanges: [],
          changeFrequency: 0,
          bugHistory: []
        },
        blastRadius,
        changeClassification: repositoryContext.changeClassification || {
          type: 'feature',
          scope: 'local',
          risk: 'low'
        },
        semanticAnalysis: {
          functionSignatures: [],
          typeDefinitions: [],
          importExportChains: [],
          callGraphs: [],
          dataFlows: []
        }
      };

      const phaseTime = Date.now() - phaseStart;
      console.log(`  ✅ Phase 1 complete (${(phaseTime / 1000).toFixed(1)}s)`);
      console.log(`     📁 Files analyzed: ${repositoryContext.changedFiles.length}`);
      console.log(`     🎯 Blast radius: ${blastRadius.directImpact.length} direct, ${blastRadius.indirectImpact.length} indirect`);

      return enhancedContext;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Phase 1 failed: ${errorMessage}`);
      throw error;
    }
  }

  private async executePhase2(
    context: EnhancedPRContext
  ): Promise<PromptContext> {
    const phaseStart = Date.now();
    
    try {
      console.log('  🎯 Building dynamic prompts for all analysis types...');
      
      const analysisTypes: AnalysisType[] = ['architectural', 'security', 'performance', 'testing'];
      const prompts: Record<AnalysisType, string> = {} as Record<AnalysisType, string>;

      for (const analysisType of analysisTypes) {
        console.log(`    📝 Generating ${analysisType} prompt...`);
        
        // Build contextual prompt
        const contextualPrompt = await this.promptBuilder.buildContextualPrompt(
          analysisType,
          context
        );
        
        // Enhance with context-aware guidance
        const enhancedPrompt = await this.contextEnhancer.enhancePromptForContext(
          contextualPrompt.content,
          analysisType,
          context
        );
        
        prompts[analysisType] = enhancedPrompt;
      }

      const promptContext: PromptContext = {
        prompts,
        metadata: {
          totalPrompts: analysisTypes.length,
          averageLength: Object.values(prompts).reduce((sum, p) => sum + p.length, 0) / analysisTypes.length,
          contextSize: JSON.stringify(context).length,
          generatedAt: new Date()
        }
      };

      const phaseTime = Date.now() - phaseStart;
      console.log(`  ✅ Phase 2 complete (${(phaseTime / 1000).toFixed(1)}s)`);
      console.log(`     📝 Prompts generated: ${analysisTypes.length}`);
      console.log(`     📏 Average prompt length: ${promptContext.metadata.averageLength.toLocaleString()} chars`);

      return promptContext;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Phase 2 failed: ${errorMessage}`);
      throw error;
    }
  }

  private async executePhase3(
    context: EnhancedPRContext,
    promptContext: PromptContext
  ): Promise<RefinedAnalysisResult> {
    const phaseStart = Date.now();
    
    try {
      console.log('  🤖 Initializing analysis agents...');
      const agents = [
        this.analysisAgents.get('architectural'),
        this.analysisAgents.get('security'),
        this.analysisAgents.get('performance'),
        this.analysisAgents.get('testing')
      ].filter(Boolean);

      console.log('  🔄 Conducting multi-model analysis...');
      const multiModelResults = await this.multiModelOrchestrator.conductMultiModelAnalysis(
        context,
        agents
      );

      console.log('  🔧 Applying iterative refinement...');
      const refinedResults = await this.multiModelOrchestrator.iterativeRefinement(
        multiModelResults,
        context,
        this.systemConfig.maxRefinementIterations
      );

      const phaseTime = Date.now() - phaseStart;
      console.log(`  ✅ Phase 3 complete (${(phaseTime / 1000).toFixed(1)}s)`);
      console.log(`     🤖 Models used: ${multiModelResults.metadata.totalModelsUsed}`);
      console.log(`     🔍 Findings: ${refinedResults.finalResults.consensus.findings.length}`);
      console.log(`     💡 Recommendations: ${refinedResults.finalResults.consensus.recommendations.length}`);
      console.log(`     🔄 Refinement iterations: ${refinedResults.totalIterations}`);

      return refinedResults;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Phase 3 failed: ${errorMessage}`);
      throw error;
    }
  }

  private async executePhase4(
    analysisResults: RefinedAnalysisResult,
    context: EnhancedPRContext
  ): Promise<QualityResults> {
    const phaseStart = Date.now();
    
    try {
      console.log('  🔍 Validating analysis quality...');
      const qualityValidation = await this.qualityGates.validateResults(analysisResults);

      console.log('  📋 Enforcing quality standards...');
      const standardsCompliantResults = await this.qualityGates.ensureStandards(
        analysisResults,
        qualityValidation
      );

      console.log('  📊 Calculating comprehensive quality score...');
      const qualityScore = await this.qualityScoring.calculateComprehensiveQualityScore(
        standardsCompliantResults.results,
        qualityValidation
      );

      const qualityResults: QualityResults = {
        validation: qualityValidation,
        score: qualityScore,
        standardsCompliant: standardsCompliantResults,
        passesGates: qualityValidation.passesGates
      };

      const phaseTime = Date.now() - phaseStart;
      console.log(`  ✅ Phase 4 complete (${(phaseTime / 1000).toFixed(1)}s)`);
      console.log(`     🏆 Quality score: ${(qualityScore.overallScore * 100).toFixed(1)}% (${qualityScore.qualityGrade})`);
      console.log(`     🚪 Quality gates: ${qualityValidation.passesGates ? 'PASSED' : 'FAILED'}`);
      console.log(`     📊 Standards compliance: ${(standardsCompliantResults.complianceScore * 100).toFixed(1)}%`);

      return qualityResults;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Phase 4 failed: ${errorMessage}`);
      throw error;
    }
  }

  private async executePhase5(
    analysisResults: RefinedAnalysisResult,
    qualityResults: QualityResults,
    context: EnhancedPRContext,
    options?: AnalysisOptions
  ): Promise<CompletePRAnalysisResult> {
    const phaseStart = Date.now();
    
    try {
      console.log('  📊 Generating executive report...');
      const executiveReport = await this.qualityReporting.generateExecutiveReport(
        analysisResults,
        qualityResults.score,
        context
      );

      console.log('  🔧 Generating technical report...');
      const technicalReport = await this.qualityReporting.generateTechnicalReport(
        analysisResults,
        qualityResults.validation,
        qualityResults.score,
        context
      );

      console.log('  👥 Generating stakeholder reports...');
      const stakeholderReports = await this.generateStakeholderReports(
        analysisResults,
        qualityResults.score,
        context,
        options?.stakeholders || ['developer', 'tech-lead']
      );

      console.log('  📈 Generating performance metrics...');
      const performanceMetrics = await this.generatePerformanceMetrics(
        analysisResults,
        qualityResults
      );

      const finalResults: CompletePRAnalysisResult = {
        analysisId: this.generateAnalysisId(),
        timestamp: new Date(),
        context,
        analysisResults: qualityResults.standardsCompliant.results,
        qualityScore: qualityResults.score,
        qualityValidation: qualityResults.validation,
        reports: {
          executive: executiveReport,
          technical: technicalReport,
          stakeholder: stakeholderReports
        },
        performanceMetrics,
        phaseMetrics: this.calculatePhaseMetrics(),
        recommendations: this.generateSystemRecommendations(qualityResults),
        nextSteps: this.generateNextSteps(qualityResults, context)
      };

      const phaseTime = Date.now() - phaseStart;
      console.log(`  ✅ Phase 5 complete (${(phaseTime / 1000).toFixed(1)}s)`);
      console.log(`     📊 Reports generated: ${Object.keys(finalResults.reports).length + Object.keys(stakeholderReports).length}`);
      console.log(`     📈 Performance metrics: ${Object.keys(performanceMetrics).length} categories`);

      return finalResults;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Phase 5 failed: ${errorMessage}`);
      throw error;
    }
  }

  private initializeServices(): void {
    this.repositoryIntelligence = new RepositoryIntelligenceService();
    this.promptBuilder = new DynamicPromptBuilder();
    this.contextEnhancer = new ContextAwareEnhancer();
    this.multiModelOrchestrator = new MultiModelOrchestrator();
    this.qualityGates = new QualityGatesService();
    this.qualityScoring = new QualityScoringSystem();
    this.qualityReporting = new QualityReportingService();
  }

  private initializeAgents(): void {
    this.analysisAgents = new Map();
    this.analysisAgents.set('architectural', new ArchitecturalAnalysisAgent());
    this.analysisAgents.set('security', new SecurityAnalysisAgent());
    this.analysisAgents.set('performance', new PerformanceAnalysisAgent());
    this.analysisAgents.set('testing', new TestingQualityAgent());
  }

  private async generateStakeholderReports(
    analysisResults: RefinedAnalysisResult,
    qualityScore: ComprehensiveQualityScore,
    context: EnhancedPRContext,
    stakeholders: string[]
  ): Promise<Record<string, any>> {
    const reports: Record<string, any> = {};
    
    for (const stakeholder of stakeholders) {
      reports[stakeholder] = await this.qualityReporting.generateStakeholderReport(
        analysisResults,
        qualityScore,
        stakeholder as any,
        context
      );
    }
    
    return reports;
  }

  private async generatePerformanceMetrics(
    analysisResults: RefinedAnalysisResult,
    qualityResults: QualityResults
  ): Promise<PerformanceMetrics> {
    return {
      analysisTime: analysisResults.finalResults.metadata.processingTime,
      qualityScore: qualityResults.score.overallScore,
      modelAgreement: analysisResults.finalResults.crossValidation.overallAgreement,
      refinementIterations: analysisResults.totalIterations,
      findingsCount: analysisResults.finalResults.consensus.findings.length,
      recommendationsCount: analysisResults.finalResults.consensus.recommendations.length,
      qualityGatesPassed: qualityResults.passesGates,
      standardsCompliance: qualityResults.standardsCompliant.complianceScore
    };
  }

  private calculatePhaseMetrics(): PhaseMetrics {
    return {
      phase1: { name: 'Repository Intelligence', duration: 0, success: true },
      phase2: { name: 'Dynamic Prompts', duration: 0, success: true },
      phase3: { name: 'Multi-Model Analysis', duration: 0, success: true },
      phase4: { name: 'Quality Gates', duration: 0, success: true },
      phase5: { name: 'Final Synthesis', duration: 0, success: true }
    };
  }

  private generateSystemRecommendations(qualityResults: QualityResults): string[] {
    const recommendations: string[] = [];
    
    if (qualityResults.score.overallScore < 0.8) {
      recommendations.push('Consider improving overall analysis quality');
    }
    
    if (!qualityResults.passesGates) {
      recommendations.push('Address quality gate failures before proceeding');
    }
    
    return recommendations;
  }

  private generateNextSteps(qualityResults: QualityResults, context: EnhancedPRContext): string[] {
    const steps: string[] = [];
    
    if (qualityResults.passesGates) {
      steps.push('Analysis meets quality standards - ready for review');
    } else {
      steps.push('Address quality issues identified in validation');
    }
    
    return steps;
  }

  private generateAnalysisId(): string {
    return `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultConfiguration(): SystemConfiguration {
    return {
      maxRefinementIterations: 3,
      qualityThresholds: {
        overall: 0.75,
        completeness: 0.8,
        consistency: 0.7,
        actionability: 0.8,
        evidence: 0.7,
        confidence: 0.7
      },
      enablePerformanceMonitoring: true,
      enableQualityGates: true,
      enableIterativeRefinement: true,
      maxAnalysisTime: 3600000, // 1 hour
      reportFormats: ['executive', 'technical', 'stakeholder']
    };
  }
}

// Supporting classes and interfaces
class PerformanceMonitor {
  async recordAnalysis(data: any): Promise<void> {
    // Record performance metrics
    console.log(`📊 Performance recorded: ${data.success ? 'SUCCESS' : 'FAILURE'}`);
  }
}

// Supporting interfaces
interface SystemConfiguration {
  maxRefinementIterations: number;
  qualityThresholds: {
    overall: number;
    completeness: number;
    consistency: number;
    actionability: number;
    evidence: number;
    confidence: number;
  };
  enablePerformanceMonitoring: boolean;
  enableQualityGates: boolean;
  enableIterativeRefinement: boolean;
  maxAnalysisTime: number;
  reportFormats: string[];
}

interface AnalysisOptions {
  stakeholders?: string[];
  reportFormats?: string[];
  enableDeepAnalysis?: boolean;
  customThresholds?: any;
}

interface PromptContext {
  prompts: Record<AnalysisType, string>;
  metadata: {
    totalPrompts: number;
    averageLength: number;
    contextSize: number;
    generatedAt: Date;
  };
}

interface QualityResults {
  validation: QualityValidation;
  score: ComprehensiveQualityScore;
  standardsCompliant: any;
  passesGates: boolean;
}

export interface CompletePRAnalysisResult {
  analysisId: string;
  timestamp: Date;
  context: EnhancedPRContext;
  analysisResults: RefinedAnalysisResult;
  qualityScore: ComprehensiveQualityScore;
  qualityValidation: QualityValidation;
  reports: {
    executive: ExecutiveReport;
    technical: any;
    stakeholder: Record<string, any>;
  };
  performanceMetrics: PerformanceMetrics;
  phaseMetrics: PhaseMetrics;
  recommendations: string[];
  nextSteps: string[];
}

interface PerformanceMetrics {
  analysisTime: number;
  qualityScore: number;
  modelAgreement: number;
  refinementIterations: number;
  findingsCount: number;
  recommendationsCount: number;
  qualityGatesPassed: boolean;
  standardsCompliance: number;
}

interface PhaseMetrics {
  phase1: { name: string; duration: number; success: boolean; };
  phase2: { name: string; duration: number; success: boolean; };
  phase3: { name: string; duration: number; success: boolean; };
  phase4: { name: string; duration: number; success: boolean; };
  phase5: { name: string; duration: number; success: boolean; };
}
