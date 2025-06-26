"use strict";
/**
 * Basic Tests - Simple functionality tests to verify test setup
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
const testHelpers_1 = require("../utils/testHelpers");
const llmServiceMock_1 = require("../mocks/llmServiceMock");
(0, globals_1.describe)('Basic Test Suite', () => {
    (0, globals_1.describe)('Test Setup Verification', () => {
        (0, globals_1.it)('should run basic test successfully', () => {
            (0, globals_1.expect)(true).toBe(true);
        });
        (0, globals_1.it)('should create mock PR context', () => {
            const context = (0, testHelpers_1.createMockPRContext)();
            (0, globals_1.expect)(context).toBeDefined();
            (0, globals_1.expect)(context.repositoryMetadata).toBeDefined();
            (0, globals_1.expect)(context.repositoryMetadata.language).toBeDefined();
            (0, globals_1.expect)(context.blastRadius).toBeDefined();
            (0, globals_1.expect)(context.semanticAnalysis).toBeDefined();
        });
        (0, globals_1.it)('should create mock LLM service', () => {
            const mockService = new llmServiceMock_1.MockEnhancedLLMService();
            (0, globals_1.expect)(mockService).toBeDefined();
            (0, globals_1.expect)(typeof mockService.generateAnalysis).toBe('function');
            (0, globals_1.expect)(typeof mockService.testConnections).toBe('function');
        });
    });
    (0, globals_1.describe)('Mock LLM Service Basic Tests', () => {
        let mockService;
        let mockContext;
        beforeEach(() => {
            mockService = new llmServiceMock_1.MockEnhancedLLMService();
            mockContext = (0, testHelpers_1.createMockPRContext)();
        });
        afterEach(() => {
            mockService.reset();
        });
        (0, globals_1.it)('should generate architectural analysis', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysis = yield mockService.generateAnalysis('architectural', mockContext, 'Test prompt');
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.type).toBe('architectural');
            (0, globals_1.expect)(analysis.findings).toBeDefined();
            (0, globals_1.expect)(analysis.recommendations).toBeDefined();
            (0, globals_1.expect)(analysis.confidence).toBeGreaterThan(0);
        }));
        (0, globals_1.it)('should generate security analysis', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysis = yield mockService.generateAnalysis('security', mockContext, 'Test prompt');
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.type).toBe('security');
            (0, globals_1.expect)(Array.isArray(analysis.findings)).toBe(true);
            (0, globals_1.expect)(Array.isArray(analysis.recommendations)).toBe(true);
        }));
        (0, globals_1.it)('should test connections successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const connections = yield mockService.testConnections();
            (0, globals_1.expect)(connections).toBeDefined();
            (0, globals_1.expect)(connections.architectural).toBe(true);
            (0, globals_1.expect)(connections.security).toBe(true);
            (0, globals_1.expect)(connections.performance).toBe(true);
            (0, globals_1.expect)(connections.testing).toBe(true);
        }));
        (0, globals_1.it)('should track performance stats', () => __awaiter(void 0, void 0, void 0, function* () {
            yield mockService.generateAnalysis('architectural', mockContext, 'Test 1');
            yield mockService.generateAnalysis('security', mockContext, 'Test 2');
            const stats = mockService.getPerformanceStats();
            (0, globals_1.expect)(stats).toBeDefined();
            (0, globals_1.expect)(stats.totalRequests).toBe(2);
            (0, globals_1.expect)(stats.errorRate).toBe(0);
        }));
        (0, globals_1.it)('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockService.setShouldFail(true);
            yield (0, globals_1.expect)(mockService.generateAnalysis('architectural', mockContext, 'Test')).rejects.toThrow();
        }));
    });
    (0, globals_1.describe)('Data Structure Tests', () => {
        (0, globals_1.it)('should validate analysis structure', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockService = new llmServiceMock_1.MockEnhancedLLMService();
            const mockContext = (0, testHelpers_1.createMockPRContext)();
            const analysis = yield mockService.generateAnalysis('performance', mockContext, 'Test');
            // Validate required properties
            (0, globals_1.expect)(analysis).toHaveProperty('type');
            (0, globals_1.expect)(analysis).toHaveProperty('findings');
            (0, globals_1.expect)(analysis).toHaveProperty('recommendations');
            (0, globals_1.expect)(analysis).toHaveProperty('confidence');
            (0, globals_1.expect)(analysis).toHaveProperty('processingTime');
            (0, globals_1.expect)(analysis).toHaveProperty('metadata');
            // Validate findings structure
            if (analysis.findings.length > 0) {
                const finding = analysis.findings[0];
                (0, globals_1.expect)(finding).toHaveProperty('type');
                (0, globals_1.expect)(finding).toHaveProperty('severity');
                (0, globals_1.expect)(finding).toHaveProperty('description');
                (0, globals_1.expect)(finding).toHaveProperty('evidence');
                (0, globals_1.expect)(finding).toHaveProperty('location');
            }
            // Validate recommendations structure
            if (analysis.recommendations.length > 0) {
                const recommendation = analysis.recommendations[0];
                (0, globals_1.expect)(recommendation).toHaveProperty('type');
                (0, globals_1.expect)(recommendation).toHaveProperty('priority');
                (0, globals_1.expect)(recommendation).toHaveProperty('description');
                (0, globals_1.expect)(recommendation).toHaveProperty('implementation');
                (0, globals_1.expect)(recommendation).toHaveProperty('impact');
            }
        }));
        (0, globals_1.it)('should validate severity levels', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockService = new llmServiceMock_1.MockEnhancedLLMService();
            const mockContext = (0, testHelpers_1.createMockPRContext)();
            const analysis = yield mockService.generateAnalysis('security', mockContext, 'Test');
            const validSeverities = ['low', 'medium', 'high', 'critical'];
            analysis.findings.forEach(finding => {
                (0, globals_1.expect)(validSeverities).toContain(finding.severity);
            });
        }));
        (0, globals_1.it)('should validate priority levels', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockService = new llmServiceMock_1.MockEnhancedLLMService();
            const mockContext = (0, testHelpers_1.createMockPRContext)();
            const analysis = yield mockService.generateAnalysis('testing', mockContext, 'Test');
            const validPriorities = ['low', 'medium', 'high', 'critical'];
            analysis.recommendations.forEach(recommendation => {
                (0, globals_1.expect)(validPriorities).toContain(recommendation.priority);
            });
        }));
    });
    (0, globals_1.describe)('Context Processing Tests', () => {
        (0, globals_1.it)('should handle different context configurations', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockService = new llmServiceMock_1.MockEnhancedLLMService();
            // Test with minimal context
            const minimalContext = (0, testHelpers_1.createMockPRContext)({
                repositoryMetadata: {
                    name: 'test-repo',
                    language: 'JavaScript',
                    framework: 'Node.js',
                    architecture: 'MVC',
                    size: { files: 10, lines: 500, bytes: 25000 }
                }
            });
            const analysis1 = yield mockService.generateAnalysis('architectural', minimalContext, 'Test');
            (0, globals_1.expect)(analysis1).toBeDefined();
            // Test with rich context
            const richContext = (0, testHelpers_1.createMockPRContext)({
                repositoryMetadata: {
                    name: 'rich-repo',
                    language: 'TypeScript',
                    framework: 'React',
                    architecture: 'Component-based',
                    size: { files: 100, lines: 5000, bytes: 250000 }
                }
            });
            const analysis2 = yield mockService.generateAnalysis('architectural', richContext, 'Test');
            (0, globals_1.expect)(analysis2).toBeDefined();
            // Both should succeed
            (0, globals_1.expect)(analysis1.type).toBe('architectural');
            (0, globals_1.expect)(analysis2.type).toBe('architectural');
        }));
        (0, globals_1.it)('should handle empty prompts', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockService = new llmServiceMock_1.MockEnhancedLLMService();
            const mockContext = (0, testHelpers_1.createMockPRContext)();
            const analysis = yield mockService.generateAnalysis('performance', mockContext, '');
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
        }));
        (0, globals_1.it)('should handle long prompts', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockService = new llmServiceMock_1.MockEnhancedLLMService();
            const mockContext = (0, testHelpers_1.createMockPRContext)();
            const longPrompt = 'A'.repeat(1000);
            const analysis = yield mockService.generateAnalysis('testing', mockContext, longPrompt);
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.type).toBe('testing');
        }));
    });
});
