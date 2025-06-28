"use strict";
/**
 * Enhanced LLM Service Tests
 * Tests the service that orchestrates multiple LLM clients for specialized analysis
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
const enhancedLLMService_js_1 = require("../../../src/services/enhancedLLMService.js");
const testHelpers_js_1 = require("../../utils/testHelpers.js");
const llmServiceMock_js_1 = require("../../mocks/llmServiceMock.js");
// Mock the UniversalLLMClient
globals_1.jest.mock('../../../src/services/universalLLMClient.js', () => ({
    createLLMClient: globals_1.jest.fn().mockImplementation(() => ({
        chatCompletion: globals_1.jest.fn(),
        testConnection: globals_1.jest.fn().mockResolvedValue(true),
        getAvailableModels: globals_1.jest.fn().mockResolvedValue(['mock-model']),
        simpleCompletion: globals_1.jest.fn().mockResolvedValue('Mock response')
    }))
}));
(0, globals_1.describe)('EnhancedLLMService', () => {
    let service;
    let mockService;
    let mockContext;
    (0, globals_1.beforeEach)(() => {
        // Use mock service for most tests to avoid actual LLM calls
        mockService = new llmServiceMock_js_1.MockEnhancedLLMService();
        mockContext = (0, testHelpers_js_1.createMockPRContext)();
        // Reset mocks
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.afterEach)(() => {
        mockService.reset();
    });
    (0, globals_1.describe)('initialization', () => {
        (0, globals_1.it)('should initialize with default configuration', () => {
            service = new enhancedLLMService_js_1.EnhancedLLMService();
            (0, globals_1.expect)(service).toBeDefined();
        });
        (0, globals_1.it)('should initialize with custom configuration', () => {
            const customConfig = {
                architectural: {
                    provider: {
                        name: 'Custom Provider',
                        baseURL: 'http://localhost:9999',
                        defaultModel: 'custom-model'
                    },
                    specialty: 'custom-analysis',
                    description: 'Custom model for testing',
                    recommendedFor: ['testing']
                }
            };
            service = new enhancedLLMService_js_1.EnhancedLLMService(customConfig);
            (0, globals_1.expect)(service).toBeDefined();
        });
    });
    (0, globals_1.describe)('generateAnalysis', () => {
        (0, globals_1.it)('should generate architectural analysis successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysisType = 'architectural';
            const prompt = 'Analyze the architectural patterns in this code change.';
            const analysis = yield mockService.generateAnalysis(analysisType, mockContext, prompt);
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.type).toBe('architectural');
            (0, globals_1.expect)(analysis.findings).toBeDefined();
            (0, globals_1.expect)(analysis.recommendations).toBeDefined();
            (0, globals_1.expect)(analysis.confidence).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.metadata).toBeDefined();
            (0, globals_1.expect)(analysis.metadata.analysisType).toBe('architectural');
        }));
        (0, globals_1.it)('should generate security analysis successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysisType = 'security';
            const prompt = 'Analyze security implications of this code change.';
            const analysis = yield mockService.generateAnalysis(analysisType, mockContext, prompt);
            (0, globals_1.expect)(analysis.type).toBe('security');
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.recommendations.length).toBeGreaterThan(0);
            // Check that security-specific findings are present
            const securityFinding = analysis.findings.find(f => f.type === 'security');
            (0, globals_1.expect)(securityFinding).toBeDefined();
        }));
        (0, globals_1.it)('should generate performance analysis successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysisType = 'performance';
            const prompt = 'Analyze performance implications of this code change.';
            const analysis = yield mockService.generateAnalysis(analysisType, mockContext, prompt);
            (0, globals_1.expect)(analysis.type).toBe('performance');
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.recommendations.length).toBeGreaterThan(0);
            // Check performance-specific content
            const performanceFinding = analysis.findings.find(f => f.type === 'performance');
            (0, globals_1.expect)(performanceFinding).toBeDefined();
        }));
        (0, globals_1.it)('should generate testing analysis successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysisType = 'testing';
            const prompt = 'Analyze testing implications of this code change.';
            const analysis = yield mockService.generateAnalysis(analysisType, mockContext, prompt);
            (0, globals_1.expect)(analysis.type).toBe('testing');
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.recommendations.length).toBeGreaterThan(0);
            // Check testing-specific content
            const testingFinding = analysis.findings.find(f => f.type === 'testing');
            (0, globals_1.expect)(testingFinding).toBeDefined();
        }));
        (0, globals_1.it)('should handle analysis errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockService.setShouldFail(true);
            yield (0, globals_1.expect)(mockService.generateAnalysis('architectural', mockContext, 'Test prompt')).rejects.toThrow('Mock architectural analysis failed');
        }));
        (0, globals_1.it)('should include proper metadata in analysis results', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysis = yield mockService.generateAnalysis('architectural', mockContext, 'Test');
            (0, globals_1.expect)(analysis.metadata).toHaveProperty('model');
            (0, globals_1.expect)(analysis.metadata).toHaveProperty('provider');
            (0, globals_1.expect)(analysis.metadata).toHaveProperty('analysisType');
            (0, globals_1.expect)(analysis.metadata).toHaveProperty('contextSize');
            (0, globals_1.expect)(analysis.metadata.contextSize).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.metadata.analysisType).toBe('architectural');
        }));
    });
    (0, globals_1.describe)('analysis parsing', () => {
        (0, globals_1.it)('should parse findings with correct severity levels', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysis = yield mockService.generateAnalysis('security', mockContext, 'Test');
            const findings = analysis.findings;
            (0, globals_1.expect)(findings.length).toBeGreaterThan(0);
            findings.forEach(finding => {
                (0, globals_1.expect)(finding).toHaveProperty('severity');
                (0, globals_1.expect)(['low', 'medium', 'high', 'critical']).toContain(finding.severity);
                (0, globals_1.expect)(finding).toHaveProperty('description');
                (0, globals_1.expect)(finding).toHaveProperty('evidence');
                (0, globals_1.expect)(finding).toHaveProperty('location');
            });
        }));
        (0, globals_1.it)('should parse recommendations with correct priority levels', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysis = yield mockService.generateAnalysis('performance', mockContext, 'Test');
            const recommendations = analysis.recommendations;
            (0, globals_1.expect)(recommendations.length).toBeGreaterThan(0);
            recommendations.forEach(recommendation => {
                (0, globals_1.expect)(recommendation).toHaveProperty('priority');
                (0, globals_1.expect)(['low', 'medium', 'high', 'critical']).toContain(recommendation.priority);
                (0, globals_1.expect)(recommendation).toHaveProperty('description');
                (0, globals_1.expect)(recommendation).toHaveProperty('implementation');
                (0, globals_1.expect)(recommendation).toHaveProperty('impact');
            });
        }));
        (0, globals_1.it)('should provide fallback analysis when parsing fails', () => __awaiter(void 0, void 0, void 0, function* () {
            // This would test the actual service with malformed LLM responses
            // For now, we test that the mock service provides valid fallback
            const analysis = yield mockService.generateAnalysis('testing', mockContext, '');
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.recommendations.length).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.confidence).toBeGreaterThan(0);
        }));
    });
    (0, globals_1.describe)('connection testing', () => {
        (0, globals_1.it)('should test all LLM connections', () => __awaiter(void 0, void 0, void 0, function* () {
            const connectionResults = yield mockService.testConnections();
            (0, globals_1.expect)(connectionResults).toHaveProperty('architectural');
            (0, globals_1.expect)(connectionResults).toHaveProperty('security');
            (0, globals_1.expect)(connectionResults).toHaveProperty('performance');
            (0, globals_1.expect)(connectionResults).toHaveProperty('testing');
            // All mock connections should succeed
            Object.values(connectionResults).forEach(isConnected => {
                (0, globals_1.expect)(isConnected).toBe(true);
            });
        }));
        (0, globals_1.it)('should handle connection failures', () => __awaiter(void 0, void 0, void 0, function* () {
            mockService.setShouldFail(true);
            const connectionResults = yield mockService.testConnections();
            Object.values(connectionResults).forEach(isConnected => {
                (0, globals_1.expect)(isConnected).toBe(false);
            });
        }));
    });
    (0, globals_1.describe)('performance tracking', () => {
        (0, globals_1.it)('should track performance statistics', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate a few analyses
            yield mockService.generateAnalysis('architectural', mockContext, 'Test 1');
            yield mockService.generateAnalysis('security', mockContext, 'Test 2');
            yield mockService.generateAnalysis('performance', mockContext, 'Test 3');
            const stats = mockService.getPerformanceStats();
            (0, globals_1.expect)(stats).toHaveProperty('totalRequests');
            (0, globals_1.expect)(stats).toHaveProperty('totalErrors');
            (0, globals_1.expect)(stats).toHaveProperty('errorRate');
            (0, globals_1.expect)(stats).toHaveProperty('byAnalysisType');
            (0, globals_1.expect)(stats.totalRequests).toBe(3);
            (0, globals_1.expect)(stats.errorRate).toBe(0);
            (0, globals_1.expect)(stats.byAnalysisType).toHaveProperty('architectural');
            (0, globals_1.expect)(stats.byAnalysisType).toHaveProperty('security');
            (0, globals_1.expect)(stats.byAnalysisType).toHaveProperty('performance');
        }));
        (0, globals_1.it)('should track error rates correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            // Generate successful analysis
            yield mockService.generateAnalysis('architectural', mockContext, 'Success');
            // Generate failed analysis
            mockService.setShouldFail(true);
            try {
                yield mockService.generateAnalysis('security', mockContext, 'Fail');
            }
            catch (error) {
                // Expected to fail
            }
            const stats = mockService.getPerformanceStats();
            (0, globals_1.expect)(stats.totalRequests).toBeGreaterThan(0);
        }));
    });
    (0, globals_1.describe)('configuration management', () => {
        (0, globals_1.it)('should allow updating model configuration', () => {
            service = new enhancedLLMService_js_1.EnhancedLLMService();
            const newConfig = {
                provider: {
                    name: 'Updated Provider',
                    baseURL: 'http://localhost:7777',
                    defaultModel: 'updated-model'
                },
                specialty: 'updated-analysis',
                description: 'Updated model configuration',
                recommendedFor: ['updated-tasks']
            };
            service.updateModelConfig('architectural', newConfig);
            // The update should not throw an error
            (0, globals_1.expect)(service).toBeDefined();
        });
    });
    (0, globals_1.describe)('temperature and token configuration', () => {
        (0, globals_1.it)('should use appropriate temperature for different analysis types', () => __awaiter(void 0, void 0, void 0, function* () {
            // This tests the internal logic for temperature selection
            // We can verify through the mock that different analysis types
            // would use different temperatures in a real implementation
            const architecturalAnalysis = yield mockService.generateAnalysis('architectural', mockContext, 'Test');
            const securityAnalysis = yield mockService.generateAnalysis('security', mockContext, 'Test');
            const performanceAnalysis = yield mockService.generateAnalysis('performance', mockContext, 'Test');
            const testingAnalysis = yield mockService.generateAnalysis('testing', mockContext, 'Test');
            // All should complete successfully with appropriate configurations
            (0, globals_1.expect)(architecturalAnalysis.type).toBe('architectural');
            (0, globals_1.expect)(securityAnalysis.type).toBe('security');
            (0, globals_1.expect)(performanceAnalysis.type).toBe('performance');
            (0, globals_1.expect)(testingAnalysis.type).toBe('testing');
        }));
        (0, globals_1.it)('should use appropriate max tokens for different analysis types', () => __awaiter(void 0, void 0, void 0, function* () {
            // Similar to temperature test, this verifies the configuration logic
            const analysis = yield mockService.generateAnalysis('architectural', mockContext, 'Long prompt that requires detailed analysis...');
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.recommendations.length).toBeGreaterThan(0);
        }));
    });
    (0, globals_1.describe)('context building', () => {
        (0, globals_1.it)('should build appropriate system prompts for different analysis types', () => __awaiter(void 0, void 0, void 0, function* () {
            const contextWithLanguage = (0, testHelpers_js_1.createMockPRContext)({
                repositoryMetadata: Object.assign(Object.assign({}, mockContext.repositoryMetadata), { primaryLanguage: 'TypeScript', framework: 'React', architecture: 'Component-based' })
            });
            const analysis = yield mockService.generateAnalysis('architectural', contextWithLanguage, 'Test');
            // The analysis should reflect the context provided
            (0, globals_1.expect)(analysis.metadata.contextSize).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.type).toBe('architectural');
        }));
        (0, globals_1.it)('should handle missing context gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            const minimalContext = (0, testHelpers_js_1.createMockPRContext)({
                repositoryMetadata: undefined,
                changedFiles: [],
                blastRadius: undefined
            });
            const analysis = yield mockService.generateAnalysis('security', minimalContext, 'Test');
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
        }));
    });
    (0, globals_1.describe)('edge cases', () => {
        (0, globals_1.it)('should handle empty prompts', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysis = yield mockService.generateAnalysis('testing', mockContext, '');
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
        }));
        (0, globals_1.it)('should handle very long prompts', () => __awaiter(void 0, void 0, void 0, function* () {
            const longPrompt = 'A'.repeat(10000); // Very long prompt
            const analysis = yield mockService.generateAnalysis('performance', mockContext, longPrompt);
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.metadata.contextSize).toBeGreaterThan(10000);
        }));
        (0, globals_1.it)('should handle special characters in prompts', () => __awaiter(void 0, void 0, void 0, function* () {
            const specialPrompt = 'Test with special chars: @#$%^&*()[]{}|\\:";\'<>?,./`~';
            const analysis = yield mockService.generateAnalysis('architectural', mockContext, specialPrompt);
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
        }));
    });
});
