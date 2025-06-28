"use strict";
/**
 * Simple Tests - Basic functionality tests without complex type dependencies
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
// Simple mock data without complex type dependencies
const mockAnalysisResult = {
    type: 'architectural',
    findings: [
        {
            type: 'architectural',
            severity: 'medium',
            description: 'Component structure follows React best practices',
            evidence: ['Proper TypeScript interfaces', 'Good separation of concerns'],
            location: 'src/components/UserProfile.tsx'
        }
    ],
    recommendations: [
        {
            type: 'architectural',
            priority: 'high',
            description: 'Fix loading state logic',
            implementation: 'Move setLoading(false) inside the async operation completion',
            impact: 'high'
        }
    ],
    confidence: 0.85,
    processingTime: Date.now(),
    metadata: {
        model: 'mock-architectural-model',
        provider: 'Mock Provider',
        analysisType: 'architectural',
        contextSize: 1000
    }
};
// Simple mock service
class SimpleMockLLMService {
    constructor() {
        this.requestCount = 0;
        this.shouldFail = false;
    }
    generateAnalysis(analysisType, context, prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            this.requestCount++;
            if (this.shouldFail) {
                throw new Error(`Mock ${analysisType} analysis failed`);
            }
            // Simulate processing time
            yield new Promise(resolve => setTimeout(resolve, 10));
            return Object.assign(Object.assign({}, mockAnalysisResult), { type: analysisType, metadata: Object.assign(Object.assign({}, mockAnalysisResult.metadata), { analysisType, contextSize: JSON.stringify(context).length }) });
        });
    }
    testConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                architectural: !this.shouldFail,
                security: !this.shouldFail,
                performance: !this.shouldFail,
                testing: !this.shouldFail
            };
        });
    }
    getPerformanceStats() {
        return {
            totalRequests: this.requestCount,
            totalErrors: 0,
            errorRate: 0,
            byAnalysisType: {
                architectural: { requests: 1, avgResponseTime: 50 }
            }
        };
    }
    setShouldFail(shouldFail) {
        this.shouldFail = shouldFail;
    }
    reset() {
        this.requestCount = 0;
        this.shouldFail = false;
    }
}
(0, globals_1.describe)('Simple Test Suite', () => {
    (0, globals_1.describe)('Basic Functionality', () => {
        (0, globals_1.it)('should run basic test successfully', () => {
            (0, globals_1.expect)(true).toBe(true);
        });
        (0, globals_1.it)('should perform basic arithmetic', () => {
            (0, globals_1.expect)(2 + 2).toBe(4);
            (0, globals_1.expect)(10 - 5).toBe(5);
            (0, globals_1.expect)(3 * 4).toBe(12);
        });
        (0, globals_1.it)('should handle strings correctly', () => {
            const testString = 'Hello, World!';
            (0, globals_1.expect)(testString.length).toBe(13);
            (0, globals_1.expect)(testString.toLowerCase()).toBe('hello, world!');
            (0, globals_1.expect)(testString.includes('World')).toBe(true);
        });
        (0, globals_1.it)('should work with arrays', () => {
            const testArray = [1, 2, 3, 4, 5];
            (0, globals_1.expect)(testArray.length).toBe(5);
            (0, globals_1.expect)(testArray[0]).toBe(1);
            (0, globals_1.expect)(testArray.includes(3)).toBe(true);
        });
        (0, globals_1.it)('should work with objects', () => {
            const testObject = {
                name: 'Test',
                value: 42,
                active: true
            };
            (0, globals_1.expect)(testObject.name).toBe('Test');
            (0, globals_1.expect)(testObject.value).toBe(42);
            (0, globals_1.expect)(testObject.active).toBe(true);
        });
    });
    (0, globals_1.describe)('Mock LLM Service Tests', () => {
        let mockService;
        let mockContext;
        (0, globals_1.beforeEach)(() => {
            mockService = new SimpleMockLLMService();
            mockContext = {
                repositoryMetadata: {
                    name: 'test-repo',
                    language: 'TypeScript',
                    framework: 'React'
                },
                files: ['src/components/UserProfile.tsx']
            };
        });
        (0, globals_1.afterEach)(() => {
            mockService.reset();
        });
        (0, globals_1.it)('should create mock service successfully', () => {
            (0, globals_1.expect)(mockService).toBeDefined();
            (0, globals_1.expect)(typeof mockService.generateAnalysis).toBe('function');
            (0, globals_1.expect)(typeof mockService.testConnections).toBe('function');
        });
        (0, globals_1.it)('should generate architectural analysis', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysis = yield mockService.generateAnalysis('architectural', mockContext, 'Test prompt');
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.type).toBe('architectural');
            (0, globals_1.expect)(Array.isArray(analysis.findings)).toBe(true);
            (0, globals_1.expect)(Array.isArray(analysis.recommendations)).toBe(true);
            (0, globals_1.expect)(typeof analysis.confidence).toBe('number');
            (0, globals_1.expect)(analysis.confidence).toBeGreaterThan(0);
            (0, globals_1.expect)(analysis.confidence).toBeLessThanOrEqual(1);
        }));
        (0, globals_1.it)('should generate different analysis types', () => __awaiter(void 0, void 0, void 0, function* () {
            const types = ['architectural', 'security', 'performance', 'testing'];
            for (const type of types) {
                const analysis = yield mockService.generateAnalysis(type, mockContext, 'Test prompt');
                (0, globals_1.expect)(analysis.type).toBe(type);
                (0, globals_1.expect)(analysis.metadata.analysisType).toBe(type);
            }
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
            (0, globals_1.expect)(stats.byAnalysisType).toBeDefined();
        }));
        (0, globals_1.it)('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockService.setShouldFail(true);
            yield (0, globals_1.expect)(mockService.generateAnalysis('architectural', mockContext, 'Test')).rejects.toThrow('Mock architectural analysis failed');
            const connections = yield mockService.testConnections();
            (0, globals_1.expect)(connections.architectural).toBe(false);
        }));
        (0, globals_1.it)('should validate analysis structure', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const analysis = yield mockService.generateAnalysis('security', mockContext, 'Test');
            const validSeverities = ['low', 'medium', 'high', 'critical'];
            analysis.findings.forEach(finding => {
                (0, globals_1.expect)(validSeverities).toContain(finding.severity);
            });
        }));
        (0, globals_1.it)('should validate priority levels', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysis = yield mockService.generateAnalysis('testing', mockContext, 'Test');
            const validPriorities = ['low', 'medium', 'high', 'critical'];
            analysis.recommendations.forEach(recommendation => {
                (0, globals_1.expect)(validPriorities).toContain(recommendation.priority);
            });
        }));
        (0, globals_1.it)('should handle different context sizes', () => __awaiter(void 0, void 0, void 0, function* () {
            const smallContext = { files: ['test.js'] };
            const largeContext = {
                files: Array.from({ length: 100 }, (_, i) => `file${i}.js`),
                metadata: { description: 'A'.repeat(1000) }
            };
            const smallAnalysis = yield mockService.generateAnalysis('architectural', smallContext, 'Test');
            const largeAnalysis = yield mockService.generateAnalysis('architectural', largeContext, 'Test');
            (0, globals_1.expect)(smallAnalysis.metadata.contextSize).toBeLessThan(largeAnalysis.metadata.contextSize);
        }));
        (0, globals_1.it)('should handle empty prompts', () => __awaiter(void 0, void 0, void 0, function* () {
            const analysis = yield mockService.generateAnalysis('performance', mockContext, '');
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.findings.length).toBeGreaterThan(0);
        }));
        (0, globals_1.it)('should handle long prompts', () => __awaiter(void 0, void 0, void 0, function* () {
            const longPrompt = 'A'.repeat(1000);
            const analysis = yield mockService.generateAnalysis('testing', mockContext, longPrompt);
            (0, globals_1.expect)(analysis).toBeDefined();
            (0, globals_1.expect)(analysis.type).toBe('testing');
        }));
        (0, globals_1.it)('should reset state correctly', () => {
            mockService.setShouldFail(true);
            (0, globals_1.expect)(mockService.testConnections()).resolves.toEqual({
                architectural: false,
                security: false,
                performance: false,
                testing: false
            });
            mockService.reset();
            (0, globals_1.expect)(mockService.testConnections()).resolves.toEqual({
                architectural: true,
                security: true,
                performance: true,
                testing: true
            });
        });
    });
    (0, globals_1.describe)('Async Operations', () => {
        (0, globals_1.it)('should handle promises correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const promise = new Promise(resolve => {
                setTimeout(() => resolve('success'), 10);
            });
            const result = yield promise;
            (0, globals_1.expect)(result).toBe('success');
        }));
        (0, globals_1.it)('should handle promise rejections', () => __awaiter(void 0, void 0, void 0, function* () {
            const promise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('test error')), 10);
            });
            yield (0, globals_1.expect)(promise).rejects.toThrow('test error');
        }));
        (0, globals_1.it)('should handle multiple concurrent promises', () => __awaiter(void 0, void 0, void 0, function* () {
            const promises = [
                Promise.resolve(1),
                Promise.resolve(2),
                Promise.resolve(3)
            ];
            const results = yield Promise.all(promises);
            (0, globals_1.expect)(results).toEqual([1, 2, 3]);
        }));
    });
    (0, globals_1.describe)('Error Handling', () => {
        (0, globals_1.it)('should catch and handle errors', () => {
            const throwError = () => {
                throw new Error('Test error');
            };
            (0, globals_1.expect)(throwError).toThrow('Test error');
        });
        (0, globals_1.it)('should handle different error types', () => {
            const throwTypeError = () => {
                throw new TypeError('Type error');
            };
            const throwRangeError = () => {
                throw new RangeError('Range error');
            };
            (0, globals_1.expect)(throwTypeError).toThrow(TypeError);
            (0, globals_1.expect)(throwRangeError).toThrow(RangeError);
        });
    });
});
