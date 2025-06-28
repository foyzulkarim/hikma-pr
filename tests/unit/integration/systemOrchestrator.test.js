"use strict";
/**
 * SystemOrchestrator Tests
 * Tests the main 5-phase pipeline coordination system
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
// Mock all external dependencies
globals_1.jest.mock('../../../src/services/repositoryIntelligenceService');
globals_1.jest.mock('../../../src/prompts/dynamicPromptBuilder');
globals_1.jest.mock('../../../src/prompts/contextAwareEnhancer');
globals_1.jest.mock('../../../src/orchestration/multiModelOrchestrator');
globals_1.jest.mock('../../../src/quality/qualityGatesService');
globals_1.jest.mock('../../../src/quality/qualityScoringSystem');
globals_1.jest.mock('../../../src/quality/qualityReportingService');
const systemOrchestrator_1 = require("../../../src/integration/systemOrchestrator");
(0, globals_1.describe)('SystemOrchestrator', () => {
    let orchestrator;
    let mockRepositoryIntelligence;
    let mockPromptBuilder;
    let mockContextEnhancer;
    let mockMultiModelOrchestrator;
    let mockQualityGates;
    let mockQualityScoring;
    let mockQualityReporting;
    (0, globals_1.beforeEach)(() => {
        // Create mock implementations
        mockRepositoryIntelligence = {
            acquireCompleteContext: globals_1.jest.fn(),
            buildBlastRadius: globals_1.jest.fn(),
            extractContextualCode: globals_1.jest.fn()
        };
        mockPromptBuilder = {
            buildContextualPrompt: globals_1.jest.fn()
        };
        mockContextEnhancer = {
            enhancePromptForContext: globals_1.jest.fn()
        };
        mockMultiModelOrchestrator = {
            conductMultiModelAnalysis: globals_1.jest.fn(),
            iterativeRefinement: globals_1.jest.fn()
        };
        mockQualityGates = {
            validateResults: globals_1.jest.fn(),
            ensureStandards: globals_1.jest.fn()
        };
        mockQualityScoring = {
            calculateComprehensiveQualityScore: globals_1.jest.fn()
        };
        mockQualityReporting = {
            generateExecutiveReport: globals_1.jest.fn(),
            generateTechnicalReport: globals_1.jest.fn(),
            generateStakeholderReport: globals_1.jest.fn()
        };
        // Mock the constructor dependencies
        globals_1.jest.doMock('../../../src/services/repositoryIntelligenceService', () => ({
            RepositoryIntelligenceService: globals_1.jest.fn(() => mockRepositoryIntelligence)
        }));
        orchestrator = new systemOrchestrator_1.SystemOrchestrator();
    });
    (0, globals_1.afterEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)('Initialization', () => {
        (0, globals_1.it)('should initialize with default configuration', () => {
            (0, globals_1.expect)(orchestrator).toBeDefined();
            (0, globals_1.expect)(typeof orchestrator.executeCompletePRAnalysis).toBe('function');
        });
        (0, globals_1.it)('should initialize with custom configuration', () => {
            const customConfig = {
                maxRefinementIterations: 10,
                enableHistoricalAnalysis: false
            };
            const customOrchestrator = new systemOrchestrator_1.SystemOrchestrator(customConfig);
            (0, globals_1.expect)(customOrchestrator).toBeDefined();
        });
    });
    (0, globals_1.describe)('Phase 1: Repository Intelligence & Context Building', () => {
        (0, globals_1.it)('should execute phase 1 successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield orchestrator.executePhase1('https://github.com/test/repo', 123);
            // Verify calls
            (0, globals_1.expect)(mockRepositoryIntelligence.acquireCompleteContext).toHaveBeenCalledWith('https://github.com/test/repo', 123);
            (0, globals_1.expect)(mockRepositoryIntelligence.buildBlastRadius).toHaveBeenCalledWith(['src/test.ts'], '/tmp/test-repo');
            (0, globals_1.expect)(mockRepositoryIntelligence.extractContextualCode).toHaveBeenCalledWith(['src/test.ts'], mockBlastRadius, '/tmp/test-repo');
            // Verify result structure
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.repositoryMetadata).toEqual(mockRepositoryContext.repositoryMetadata);
            (0, globals_1.expect)(result.blastRadius).toEqual(mockBlastRadius);
            (0, globals_1.expect)(result.contextualCode).toEqual(mockContextualCode);
        }));
        (0, globals_1.it)('should handle phase 1 errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRepositoryIntelligence.acquireCompleteContext.mockRejectedValue(new Error('Repository clone failed'));
            yield (0, globals_1.expect)(orchestrator.executePhase1('https://github.com/invalid/repo', 123)).rejects.toThrow('Repository clone failed');
        }));
    });
    (0, globals_1.describe)('Phase 2: Dynamic Prompt Generation', () => {
        (0, globals_1.it)('should execute phase 2 successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            mockContextEnhancer.enhancePromptForContext.mockImplementation((prompt) => `Enhanced: ${prompt}`);
            const result = yield orchestrator.executePhase2(mockContext);
            // Verify all analysis types were processed
            (0, globals_1.expect)(mockPromptBuilder.buildContextualPrompt).toHaveBeenCalledTimes(4);
            (0, globals_1.expect)(mockContextEnhancer.enhancePromptForContext).toHaveBeenCalledTimes(4);
            // Verify result structure
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.prompts).toBeDefined();
            (0, globals_1.expect)(result.prompts.architectural).toContain('Enhanced:');
            (0, globals_1.expect)(result.prompts.security).toContain('Enhanced:');
            (0, globals_1.expect)(result.prompts.performance).toContain('Enhanced:');
            (0, globals_1.expect)(result.prompts.testing).toContain('Enhanced:');
            (0, globals_1.expect)(result.metadata).toBeDefined();
            (0, globals_1.expect)(result.metadata.totalPrompts).toBe(4);
        }));
        (0, globals_1.it)('should handle prompt generation errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockContext = { repositoryMetadata: {} };
            mockPromptBuilder.buildContextualPrompt.mockRejectedValue(new Error('Prompt generation failed'));
            yield (0, globals_1.expect)(orchestrator.executePhase2(mockContext)).rejects.toThrow('Prompt generation failed');
        }));
    });
    (0, globals_1.describe)('Phase 3: Multi-Model Analysis & Orchestration', () => {
        (0, globals_1.it)('should execute phase 3 successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield orchestrator.executePhase3(mockContext, mockPromptContext);
            (0, globals_1.expect)(mockMultiModelOrchestrator.conductMultiModelAnalysis).toHaveBeenCalledWith(mockContext, globals_1.expect.any(Array) // Analysis agents array
            );
            (0, globals_1.expect)(mockMultiModelOrchestrator.iterativeRefinement).toHaveBeenCalledWith(mockMultiModelResults, mockContext, globals_1.expect.any(Number) // Max iterations
            );
            (0, globals_1.expect)(result).toEqual(mockRefinedResults);
        }));
        (0, globals_1.it)('should handle analysis failures', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockContext = {};
            const mockPromptContext = { prompts: {} };
            mockMultiModelOrchestrator.conductMultiModelAnalysis.mockRejectedValue(new Error('Analysis failed'));
            yield (0, globals_1.expect)(orchestrator.executePhase3(mockContext, mockPromptContext)).rejects.toThrow('Analysis failed');
        }));
    });
    (0, globals_1.describe)('Phase 4: Quality Gates & Validation', () => {
        (0, globals_1.it)('should execute phase 4 successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield orchestrator.executePhase4(mockAnalysisResults, {});
            (0, globals_1.expect)(mockQualityGates.validateResults).toHaveBeenCalledWith(mockAnalysisResults);
            (0, globals_1.expect)(mockQualityGates.ensureStandards).toHaveBeenCalledWith(mockAnalysisResults, mockQualityValidation);
            (0, globals_1.expect)(mockQualityScoring.calculateComprehensiveQualityScore).toHaveBeenCalled();
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.validation).toEqual(mockQualityValidation);
            (0, globals_1.expect)(result.score).toEqual(mockQualityScore);
            (0, globals_1.expect)(result.standardsCompliant).toEqual(mockStandardsCompliantResults);
            (0, globals_1.expect)(result.passesGates).toBe(true);
        }));
        (0, globals_1.it)('should handle quality validation failures', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockAnalysisResults = {};
            mockQualityGates.validateResults.mockRejectedValue(new Error('Quality validation failed'));
            yield (0, globals_1.expect)(orchestrator.executePhase4(mockAnalysisResults, {})).rejects.toThrow('Quality validation failed');
        }));
    });
    (0, globals_1.describe)('Phase 5: Final Synthesis & Reporting', () => {
        (0, globals_1.it)('should execute phase 5 successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            mockQualityReporting.generateStakeholderReport.mockImplementation((_, __, stakeholder) => Promise.resolve(mockStakeholderReports[stakeholder]));
            const result = yield orchestrator.executePhase5(mockAnalysisResults, mockQualityResults, mockContext, { stakeholders: ['developer', 'tech-lead'] });
            (0, globals_1.expect)(mockQualityReporting.generateExecutiveReport).toHaveBeenCalled();
            (0, globals_1.expect)(mockQualityReporting.generateTechnicalReport).toHaveBeenCalled();
            (0, globals_1.expect)(mockQualityReporting.generateStakeholderReport).toHaveBeenCalledTimes(2);
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.reports.executive).toEqual(mockExecutiveReport);
            (0, globals_1.expect)(result.reports.technical).toEqual(mockTechnicalReport);
            (0, globals_1.expect)(result.reports.stakeholder).toEqual(mockStakeholderReports);
            (0, globals_1.expect)(result.performanceMetrics).toBeDefined();
            (0, globals_1.expect)(result.phaseMetrics).toBeDefined();
        }));
    });
    (0, globals_1.describe)('Complete PR Analysis Pipeline', () => {
        (0, globals_1.it)('should execute complete analysis successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock all phase responses
            const mockPhase1Result = { repositoryMetadata: {}, blastRadius: {}, contextualCode: new Map() };
            const mockPhase2Result = { prompts: {}, metadata: {} };
            const mockPhase3Result = { finalResults: { consensus: {} } };
            const mockPhase4Result = { validation: {}, score: { overallScore: 0.9 }, passesGates: true };
            const mockPhase5Result = { reports: {}, performanceMetrics: {}, phaseMetrics: {} };
            // Mock each phase
            globals_1.jest.spyOn(orchestrator, 'executePhase1').mockResolvedValue(mockPhase1Result);
            globals_1.jest.spyOn(orchestrator, 'executePhase2').mockResolvedValue(mockPhase2Result);
            globals_1.jest.spyOn(orchestrator, 'executePhase3').mockResolvedValue(mockPhase3Result);
            globals_1.jest.spyOn(orchestrator, 'executePhase4').mockResolvedValue(mockPhase4Result);
            globals_1.jest.spyOn(orchestrator, 'executePhase5').mockResolvedValue(mockPhase5Result);
            const result = yield orchestrator.executeCompletePRAnalysis('https://github.com/test/repo', 123);
            // Verify all phases were called
            (0, globals_1.expect)(orchestrator.executePhase1).toHaveBeenCalledWith('https://github.com/test/repo', 123);
            (0, globals_1.expect)(orchestrator.executePhase2).toHaveBeenCalledWith(mockPhase1Result);
            (0, globals_1.expect)(orchestrator.executePhase3).toHaveBeenCalledWith(mockPhase1Result, mockPhase2Result);
            (0, globals_1.expect)(orchestrator.executePhase4).toHaveBeenCalledWith(mockPhase3Result, mockPhase1Result);
            (0, globals_1.expect)(orchestrator.executePhase5).toHaveBeenCalledWith(mockPhase3Result, mockPhase4Result, mockPhase1Result, undefined);
            (0, globals_1.expect)(result).toEqual(mockPhase5Result);
        }));
        (0, globals_1.it)('should handle pipeline failures and record metrics', () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(orchestrator, 'executePhase1').mockRejectedValue(new Error('Phase 1 failed'));
            yield (0, globals_1.expect)(orchestrator.executeCompletePRAnalysis('https://github.com/test/repo', 123)).rejects.toThrow('Complete PR analysis failed: Phase 1 failed');
        }));
        (0, globals_1.it)('should track performance metrics', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock successful execution
            globals_1.jest.spyOn(orchestrator, 'executePhase1').mockResolvedValue({});
            globals_1.jest.spyOn(orchestrator, 'executePhase2').mockResolvedValue({});
            globals_1.jest.spyOn(orchestrator, 'executePhase3').mockResolvedValue({});
            globals_1.jest.spyOn(orchestrator, 'executePhase4').mockResolvedValue({ score: { overallScore: 0.9 } });
            globals_1.jest.spyOn(orchestrator, 'executePhase5').mockResolvedValue({
                performanceMetrics: { totalTime: 1000 },
                phaseMetrics: {}
            });
            const startTime = Date.now();
            yield orchestrator.executeCompletePRAnalysis('https://github.com/test/repo', 123);
            const endTime = Date.now();
            // Verify execution completed within reasonable time
            (0, globals_1.expect)(endTime - startTime).toBeLessThan(1000); // Should complete quickly with mocks
        }));
    });
    (0, globals_1.describe)('Error Handling and Recovery', () => {
        (0, globals_1.it)('should handle individual phase failures', () => __awaiter(void 0, void 0, void 0, function* () {
            const phases = [
                'executePhase1',
                'executePhase2',
                'executePhase3',
                'executePhase4',
                'executePhase5'
            ];
            for (const phase of phases) {
                globals_1.jest.clearAllMocks();
                globals_1.jest.spyOn(orchestrator, phase).mockRejectedValue(new Error(`${phase} failed`));
                yield (0, globals_1.expect)(orchestrator.executeCompletePRAnalysis('https://github.com/test/repo', 123)).rejects.toThrow(`Complete PR analysis failed: ${phase} failed`);
            }
        }));
        (0, globals_1.it)('should generate unique analysis IDs', () => __awaiter(void 0, void 0, void 0, function* () {
            const id1 = orchestrator.generateAnalysisId();
            const id2 = orchestrator.generateAnalysisId();
            (0, globals_1.expect)(id1).toBeDefined();
            (0, globals_1.expect)(id2).toBeDefined();
            (0, globals_1.expect)(id1).not.toBe(id2);
            (0, globals_1.expect)(typeof id1).toBe('string');
            (0, globals_1.expect)(typeof id2).toBe('string');
        }));
    });
});
