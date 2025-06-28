/**
 * SystemOrchestrator Tests
 * Tests the main 5-phase pipeline coordination system
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock all external dependencies
jest.mock('../../../src/services/repositoryIntelligenceService');
jest.mock('../../../src/prompts/dynamicPromptBuilder');
jest.mock('../../../src/prompts/contextAwareEnhancer');
jest.mock('../../../src/orchestration/multiModelOrchestrator');
jest.mock('../../../src/quality/qualityGatesService');
jest.mock('../../../src/quality/qualityScoringSystem');
jest.mock('../../../src/quality/qualityReportingService');

import { SystemOrchestrator } from '../../../src/integration/systemOrchestrator';

describe('SystemOrchestrator', () => {
  let orchestrator: SystemOrchestrator;
  let mockRepositoryIntelligence: any;
  let mockPromptBuilder: any;
  let mockContextEnhancer: any;
  let mockMultiModelOrchestrator: any;
  let mockQualityGates: any;
  let mockQualityScoring: any;
  let mockQualityReporting: any;

  beforeEach(() => {
    // Create mock implementations
    mockRepositoryIntelligence = {
      acquireCompleteContext: jest.fn(),
      buildBlastRadius: jest.fn(),
      extractContextualCode: jest.fn()
    };

    mockPromptBuilder = {
      buildContextualPrompt: jest.fn()
    };

    mockContextEnhancer = {
      enhancePromptForContext: jest.fn()
    };

    mockMultiModelOrchestrator = {
      conductMultiModelAnalysis: jest.fn(),
      iterativeRefinement: jest.fn()
    };

    mockQualityGates = {
      validateResults: jest.fn(),
      ensureStandards: jest.fn()
    };

    mockQualityScoring = {
      calculateComprehensiveQualityScore: jest.fn()
    };

    mockQualityReporting = {
      generateExecutiveReport: jest.fn(),
      generateTechnicalReport: jest.fn(),
      generateStakeholderReport: jest.fn()
    };

    // Mock the constructor dependencies
    jest.doMock('../../../src/services/repositoryIntelligenceService', () => ({
      RepositoryIntelligenceService: jest.fn(() => mockRepositoryIntelligence)
    }));

    orchestrator = new SystemOrchestrator();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(orchestrator).toBeDefined();
      expect(typeof orchestrator.executeCompletePRAnalysis).toBe('function');
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        maxRefinementIterations: 10,
        enableHistoricalAnalysis: false
      };

      const customOrchestrator = new SystemOrchestrator(customConfig);
      expect(customOrchestrator).toBeDefined();
    });
  });

  describe('Phase 1: Repository Intelligence & Context Building', () => {
    it('should execute phase 1 successfully', async () => {
      // Mock the repository intelligence responses
      const mockRepositoryContext = {
        repoPath: '/tmp/test-repo',
        changedFiles: ['src/test.ts'],
        repositoryMetadata: {
          name: 'test-repo',
          language: 'TypeScript',
          framework: 'Node.js',
          architecture: 'MVC',
          size: { files: 10, lines: 1000, bytes: 50000 }
        }
      };

      const mockBlastRadius = {
        directImpact: ['src/test.ts'],
        indirectImpact: ['src/related.ts'],
        testImpact: ['tests/test.spec.ts'],
        documentationImpact: [],
        configurationImpact: [],
        migrationImpact: []
      };

      const mockContextualCode = new Map([
        ['src/test.ts', {
          completeFileContent: 'export const test = () => "hello";',
          relatedFunctions: ['test'],
          dependencyChain: [],
          usageExamples: [],
          testCoverage: { covered: true, percentage: 90, testFiles: [] },
          historicalContext: { lastModified: '2024-01-01', recentChanges: 1, bugHistory: [] }
        }]
      ]);

      mockRepositoryIntelligence.acquireCompleteContext.mockResolvedValue(mockRepositoryContext);
      mockRepositoryIntelligence.buildBlastRadius.mockResolvedValue(mockBlastRadius);
      mockRepositoryIntelligence.extractContextualCode.mockResolvedValue(mockContextualCode);

      // Execute phase 1
      const result = await orchestrator.executePhase1('https://github.com/test/repo', 123);

      // Verify calls
      expect(mockRepositoryIntelligence.acquireCompleteContext).toHaveBeenCalledWith(
        'https://github.com/test/repo',
        123
      );
      expect(mockRepositoryIntelligence.buildBlastRadius).toHaveBeenCalledWith(
        ['src/test.ts'],
        '/tmp/test-repo'
      );
      expect(mockRepositoryIntelligence.extractContextualCode).toHaveBeenCalledWith(
        ['src/test.ts'],
        mockBlastRadius,
        '/tmp/test-repo'
      );

      // Verify result structure
      expect(result).toBeDefined();
      expect(result.repositoryMetadata).toEqual(mockRepositoryContext.repositoryMetadata);
      expect(result.blastRadius).toEqual(mockBlastRadius);
      expect(result.contextualCode).toEqual(mockContextualCode);
    });

    it('should handle phase 1 errors gracefully', async () => {
      mockRepositoryIntelligence.acquireCompleteContext.mockRejectedValue(
        new Error('Repository clone failed')
      );

      await expect(
        orchestrator.executePhase1('https://github.com/invalid/repo', 123)
      ).rejects.toThrow('Repository clone failed');
    });
  });

  describe('Phase 2: Dynamic Prompt Generation', () => {
    it('should execute phase 2 successfully', async () => {
      const mockContext = {
        repositoryMetadata: {
          name: 'test-repo',
          language: 'TypeScript',
          framework: 'React',
          architecture: 'Component-based',
          size: { files: 50, lines: 5000, bytes: 250000 }
        },
        blastRadius: {
          directImpact: ['src/component.tsx'],
          indirectImpact: [],
          testImpact: [],
          documentationImpact: [],
          configurationImpact: [],
          migrationImpact: []
        }
      };

      const mockPrompts = {
        architectural: 'Analyze architectural patterns...',
        security: 'Analyze security implications...',
        performance: 'Analyze performance impact...',
        testing: 'Analyze testing requirements...'
      };

      mockPromptBuilder.buildContextualPrompt.mockImplementation((type) => ({
        content: mockPrompts[type]
      }));

      mockContextEnhancer.enhancePromptForContext.mockImplementation((prompt) => 
        `Enhanced: ${prompt}`
      );

      const result = await orchestrator.executePhase2(mockContext);

      // Verify all analysis types were processed
      expect(mockPromptBuilder.buildContextualPrompt).toHaveBeenCalledTimes(4);
      expect(mockContextEnhancer.enhancePromptForContext).toHaveBeenCalledTimes(4);

      // Verify result structure
      expect(result).toBeDefined();
      expect(result.prompts).toBeDefined();
      expect(result.prompts.architectural).toContain('Enhanced:');
      expect(result.prompts.security).toContain('Enhanced:');
      expect(result.prompts.performance).toContain('Enhanced:');
      expect(result.prompts.testing).toContain('Enhanced:');
      expect(result.metadata).toBeDefined();
      expect(result.metadata.totalPrompts).toBe(4);
    });

    it('should handle prompt generation errors', async () => {
      const mockContext = { repositoryMetadata: {} };

      mockPromptBuilder.buildContextualPrompt.mockRejectedValue(
        new Error('Prompt generation failed')
      );

      await expect(
        orchestrator.executePhase2(mockContext)
      ).rejects.toThrow('Prompt generation failed');
    });
  });

  describe('Phase 3: Multi-Model Analysis & Orchestration', () => {
    it('should execute phase 3 successfully', async () => {
      const mockContext = { repositoryMetadata: {} };
      const mockPromptContext = {
        prompts: {
          architectural: 'Architectural prompt',
          security: 'Security prompt',
          performance: 'Performance prompt',
          testing: 'Testing prompt'
        }
      };

      const mockMultiModelResults = {
        metadata: { totalModelsUsed: 4 },
        individualResults: [],
        crossValidation: { overallAgreement: 0.85 },
        consensus: {
          findings: [{ type: 'architectural', description: 'Test finding' }],
          recommendations: [{ type: 'architectural', description: 'Test recommendation' }]
        }
      };

      const mockRefinedResults = {
        finalResults: mockMultiModelResults,
        totalIterations: 2,
        convergenceScore: 0.9
      };

      mockMultiModelOrchestrator.conductMultiModelAnalysis.mockResolvedValue(mockMultiModelResults);
      mockMultiModelOrchestrator.iterativeRefinement.mockResolvedValue(mockRefinedResults);

      const result = await orchestrator.executePhase3(mockContext, mockPromptContext);

      expect(mockMultiModelOrchestrator.conductMultiModelAnalysis).toHaveBeenCalledWith(
        mockContext,
        expect.any(Array) // Analysis agents array
      );
      expect(mockMultiModelOrchestrator.iterativeRefinement).toHaveBeenCalledWith(
        mockMultiModelResults,
        mockContext,
        expect.any(Number) // Max iterations
      );

      expect(result).toEqual(mockRefinedResults);
    });

    it('should handle analysis failures', async () => {
      const mockContext = {};
      const mockPromptContext = { prompts: {} };

      mockMultiModelOrchestrator.conductMultiModelAnalysis.mockRejectedValue(
        new Error('Analysis failed')
      );

      await expect(
        orchestrator.executePhase3(mockContext, mockPromptContext)
      ).rejects.toThrow('Analysis failed');
    });
  });

  describe('Phase 4: Quality Gates & Validation', () => {
    it('should execute phase 4 successfully', async () => {
      const mockAnalysisResults = {
        finalResults: {
          consensus: {
            findings: [],
            recommendations: []
          }
        }
      };

      const mockQualityValidation = {
        passesGates: true,
        completeness: 0.9,
        consistency: 0.85,
        actionability: 0.8
      };

      const mockStandardsCompliantResults = {
        results: mockAnalysisResults,
        complianceScore: 0.9
      };

      const mockQualityScore = {
        overallScore: 0.87,
        qualityGrade: 'A',
        dimensions: {}
      };

      mockQualityGates.validateResults.mockResolvedValue(mockQualityValidation);
      mockQualityGates.ensureStandards.mockResolvedValue(mockStandardsCompliantResults);
      mockQualityScoring.calculateComprehensiveQualityScore.mockResolvedValue(mockQualityScore);

      const result = await orchestrator.executePhase4(mockAnalysisResults, {});

      expect(mockQualityGates.validateResults).toHaveBeenCalledWith(mockAnalysisResults);
      expect(mockQualityGates.ensureStandards).toHaveBeenCalledWith(
        mockAnalysisResults,
        mockQualityValidation
      );
      expect(mockQualityScoring.calculateComprehensiveQualityScore).toHaveBeenCalled();

      expect(result).toBeDefined();
      expect(result.validation).toEqual(mockQualityValidation);
      expect(result.score).toEqual(mockQualityScore);
      expect(result.standardsCompliant).toEqual(mockStandardsCompliantResults);
      expect(result.passesGates).toBe(true);
    });

    it('should handle quality validation failures', async () => {
      const mockAnalysisResults = {};

      mockQualityGates.validateResults.mockRejectedValue(
        new Error('Quality validation failed')
      );

      await expect(
        orchestrator.executePhase4(mockAnalysisResults, {})
      ).rejects.toThrow('Quality validation failed');
    });
  });

  describe('Phase 5: Final Synthesis & Reporting', () => {
    it('should execute phase 5 successfully', async () => {
      const mockAnalysisResults = {};
      const mockQualityResults = {
        score: { overallScore: 0.9 },
        validation: {}
      };
      const mockContext = {};

      const mockExecutiveReport = { summary: 'Executive summary' };
      const mockTechnicalReport = { details: 'Technical details' };
      const mockStakeholderReports = {
        developer: { recommendations: [] },
        'tech-lead': { overview: 'Tech lead overview' }
      };

      mockQualityReporting.generateExecutiveReport.mockResolvedValue(mockExecutiveReport);
      mockQualityReporting.generateTechnicalReport.mockResolvedValue(mockTechnicalReport);
      mockQualityReporting.generateStakeholderReport.mockImplementation((_, __, stakeholder) => 
        Promise.resolve(mockStakeholderReports[stakeholder])
      );

      const result = await orchestrator.executePhase5(
        mockAnalysisResults,
        mockQualityResults,
        mockContext,
        { stakeholders: ['developer', 'tech-lead'] }
      );

      expect(mockQualityReporting.generateExecutiveReport).toHaveBeenCalled();
      expect(mockQualityReporting.generateTechnicalReport).toHaveBeenCalled();
      expect(mockQualityReporting.generateStakeholderReport).toHaveBeenCalledTimes(2);

      expect(result).toBeDefined();
      expect(result.reports.executive).toEqual(mockExecutiveReport);
      expect(result.reports.technical).toEqual(mockTechnicalReport);
      expect(result.reports.stakeholder).toEqual(mockStakeholderReports);
      expect(result.performanceMetrics).toBeDefined();
      expect(result.phaseMetrics).toBeDefined();
    });
  });

  describe('Complete PR Analysis Pipeline', () => {
    it('should execute complete analysis successfully', async () => {
      // Mock all phase responses
      const mockPhase1Result = { repositoryMetadata: {}, blastRadius: {}, contextualCode: new Map() };
      const mockPhase2Result = { prompts: {}, metadata: {} };
      const mockPhase3Result = { finalResults: { consensus: {} } };
      const mockPhase4Result = { validation: {}, score: { overallScore: 0.9 }, passesGates: true };
      const mockPhase5Result = { reports: {}, performanceMetrics: {}, phaseMetrics: {} };

      // Mock each phase
      jest.spyOn(orchestrator, 'executePhase1').mockResolvedValue(mockPhase1Result);
      jest.spyOn(orchestrator, 'executePhase2').mockResolvedValue(mockPhase2Result);
      jest.spyOn(orchestrator, 'executePhase3').mockResolvedValue(mockPhase3Result);
      jest.spyOn(orchestrator, 'executePhase4').mockResolvedValue(mockPhase4Result);
      jest.spyOn(orchestrator, 'executePhase5').mockResolvedValue(mockPhase5Result);

      const result = await orchestrator.executeCompletePRAnalysis(
        'https://github.com/test/repo',
        123
      );

      // Verify all phases were called
      expect(orchestrator.executePhase1).toHaveBeenCalledWith('https://github.com/test/repo', 123);
      expect(orchestrator.executePhase2).toHaveBeenCalledWith(mockPhase1Result);
      expect(orchestrator.executePhase3).toHaveBeenCalledWith(mockPhase1Result, mockPhase2Result);
      expect(orchestrator.executePhase4).toHaveBeenCalledWith(mockPhase3Result, mockPhase1Result);
      expect(orchestrator.executePhase5).toHaveBeenCalledWith(
        mockPhase3Result,
        mockPhase4Result,
        mockPhase1Result,
        undefined
      );

      expect(result).toEqual(mockPhase5Result);
    });

    it('should handle pipeline failures and record metrics', async () => {
      jest.spyOn(orchestrator, 'executePhase1').mockRejectedValue(
        new Error('Phase 1 failed')
      );

      await expect(
        orchestrator.executeCompletePRAnalysis('https://github.com/test/repo', 123)
      ).rejects.toThrow('Complete PR analysis failed: Phase 1 failed');
    });

    it('should track performance metrics', async () => {
      // Mock successful execution
      jest.spyOn(orchestrator, 'executePhase1').mockResolvedValue({});
      jest.spyOn(orchestrator, 'executePhase2').mockResolvedValue({});
      jest.spyOn(orchestrator, 'executePhase3').mockResolvedValue({});
      jest.spyOn(orchestrator, 'executePhase4').mockResolvedValue({ score: { overallScore: 0.9 } });
      jest.spyOn(orchestrator, 'executePhase5').mockResolvedValue({
        performanceMetrics: { totalTime: 1000 },
        phaseMetrics: {}
      });

      const startTime = Date.now();
      await orchestrator.executeCompletePRAnalysis('https://github.com/test/repo', 123);
      const endTime = Date.now();

      // Verify execution completed within reasonable time
      expect(endTime - startTime).toBeLessThan(1000); // Should complete quickly with mocks
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle individual phase failures', async () => {
      const phases = [
        'executePhase1',
        'executePhase2', 
        'executePhase3',
        'executePhase4',
        'executePhase5'
      ];

      for (const phase of phases) {
        jest.clearAllMocks();
        jest.spyOn(orchestrator, phase as any).mockRejectedValue(
          new Error(`${phase} failed`)
        );

        await expect(
          orchestrator.executeCompletePRAnalysis('https://github.com/test/repo', 123)
        ).rejects.toThrow(`Complete PR analysis failed: ${phase} failed`);
      }
    });

    it('should generate unique analysis IDs', async () => {
      const id1 = orchestrator.generateAnalysisId();
      const id2 = orchestrator.generateAnalysisId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });
});
