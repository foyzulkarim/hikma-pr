"use strict";
/**
 * LLM Service Mocks
 * Mock implementations for testing without actual LLM calls
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
exports.MockEnhancedLLMService = exports.MockUniversalLLMClient = void 0;
exports.createMockLLMClient = createMockLLMClient;
const mockPRData_1 = require("../fixtures/mockPRData");
class MockUniversalLLMClient {
    constructor(provider) {
        this.callCount = 0;
        this.shouldFail = false;
        this.provider = provider;
    }
    chatCompletion(request) {
        return __awaiter(this, void 0, void 0, function* () {
            this.callCount++;
            if (this.shouldFail) {
                throw new Error('Mock LLM service failure');
            }
            // Simulate response delay
            yield new Promise(resolve => setTimeout(resolve, 10));
            const mockResponse = {
                id: `mock-${Date.now()}`,
                object: 'chat.completion',
                created: Date.now(),
                model: this.provider.defaultModel,
                choices: [{
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: this.getMockResponseContent(request.messages)
                        },
                        finish_reason: 'stop'
                    }],
                usage: {
                    prompt_tokens: 100,
                    completion_tokens: 200,
                    total_tokens: 300
                }
            };
            return mockResponse;
        });
    }
    testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.shouldFail)
                return false;
            return true;
        });
    }
    getAvailableModels() {
        return __awaiter(this, void 0, void 0, function* () {
            return [this.provider.defaultModel, 'mock-model-2'];
        });
    }
    simpleCompletion(prompt, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.chatCompletion(Object.assign({ model: this.provider.defaultModel, messages: [{ role: 'user', content: prompt }] }, options));
            return response.choices[0].message.content;
        });
    }
    getMockResponseContent(messages) {
        var _a;
        const userMessage = ((_a = messages.find(m => m.role === 'user')) === null || _a === void 0 ? void 0 : _a.content) || '';
        // Return different responses based on analysis type
        if (userMessage.toLowerCase().includes('architectural')) {
            return mockPRData_1.mockLLMResponses.architectural;
        }
        else if (userMessage.toLowerCase().includes('security')) {
            return mockPRData_1.mockLLMResponses.security;
        }
        else if (userMessage.toLowerCase().includes('performance')) {
            return mockPRData_1.mockLLMResponses.performance;
        }
        else if (userMessage.toLowerCase().includes('testing')) {
            return mockPRData_1.mockLLMResponses.testing;
        }
        return 'Mock LLM response for general analysis';
    }
    getCallCount() {
        return this.callCount;
    }
    setShouldFail(shouldFail) {
        this.shouldFail = shouldFail;
    }
    reset() {
        this.callCount = 0;
        this.shouldFail = false;
    }
}
exports.MockUniversalLLMClient = MockUniversalLLMClient;
class MockEnhancedLLMService {
    constructor() {
        this.mockClients = new Map();
        this.requestCount = 0;
        this.shouldFail = false;
        // Initialize mock clients for each analysis type
        const analysisTypes = ['architectural', 'security', 'performance', 'testing'];
        analysisTypes.forEach(type => {
            const mockProvider = {
                name: `Mock ${type}`,
                baseURL: 'http://localhost:1234',
                defaultModel: `mock-${type}-model`
            };
            this.mockClients.set(type, new MockUniversalLLMClient(mockProvider));
        });
    }
    generateAnalysis(analysisType, context, prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            this.requestCount++;
            if (this.shouldFail) {
                throw new Error(`Mock ${analysisType} analysis failed`);
            }
            // Simulate processing time
            yield new Promise(resolve => setTimeout(resolve, 50));
            const mockAnalysis = {
                type: analysisType,
                findings: this.generateMockFindings(analysisType),
                recommendations: this.generateMockRecommendations(analysisType),
                confidence: 0.85,
                processingTime: Date.now(),
                metadata: {
                    model: `mock-${analysisType}-model`,
                    provider: 'Mock Provider',
                    analysisType,
                    contextSize: JSON.stringify(context).length
                }
            };
            return mockAnalysis;
        });
    }
    generateMockFindings(analysisType) {
        const findingsMap = {
            architectural: [
                {
                    type: 'architectural',
                    severity: 'medium',
                    description: 'Component structure follows React best practices',
                    evidence: ['Proper TypeScript interfaces', 'Good separation of concerns'],
                    location: 'src/components/UserProfile.tsx'
                },
                {
                    type: 'architectural',
                    severity: 'high',
                    description: 'Loading state logic has a bug',
                    evidence: ['setLoading(false) called immediately after async operation'],
                    location: 'src/components/UserProfile.tsx:20'
                }
            ],
            security: [
                {
                    type: 'security',
                    severity: 'medium',
                    description: 'Input validation added for email',
                    evidence: ['validateEmail function implemented'],
                    location: 'src/utils/validation.ts'
                },
                {
                    type: 'security',
                    severity: 'high',
                    description: 'Potential XSS risk in user data rendering',
                    evidence: ['Direct rendering without sanitization'],
                    location: 'src/components/UserProfile.tsx:35'
                }
            ],
            performance: [
                {
                    type: 'performance',
                    severity: 'low',
                    description: 'Efficient React hooks usage',
                    evidence: ['Proper useEffect dependency array'],
                    location: 'src/components/UserProfile.tsx'
                },
                {
                    type: 'performance',
                    severity: 'medium',
                    description: 'No caching mechanism for user data',
                    evidence: ['API calls on every component mount'],
                    location: 'src/api/userService.ts'
                }
            ],
            testing: [
                {
                    type: 'testing',
                    severity: 'low',
                    description: 'Good test coverage for utilities',
                    evidence: ['Validation functions well tested'],
                    location: 'tests/utils/validation.test.ts'
                },
                {
                    type: 'testing',
                    severity: 'medium',
                    description: 'Missing error scenario tests',
                    evidence: ['No tests for API failures'],
                    location: 'tests/components/UserProfile.test.tsx'
                }
            ]
        };
        return findingsMap[analysisType] || [];
    }
    generateMockRecommendations(analysisType) {
        const recommendationsMap = {
            architectural: [
                {
                    type: 'architectural',
                    priority: 'high',
                    description: 'Fix loading state logic',
                    implementation: 'Move setLoading(false) inside the async operation completion',
                    impact: 'high'
                },
                {
                    type: 'architectural',
                    priority: 'medium',
                    description: 'Add error state management',
                    implementation: 'Add error state and error boundaries',
                    impact: 'medium'
                }
            ],
            security: [
                {
                    type: 'security',
                    priority: 'high',
                    description: 'Add input sanitization',
                    implementation: 'Use DOMPurify or similar for user data rendering',
                    impact: 'high'
                },
                {
                    type: 'security',
                    priority: 'medium',
                    description: 'Implement CSRF protection',
                    implementation: 'Add CSRF tokens to state-changing requests',
                    impact: 'medium'
                }
            ],
            performance: [
                {
                    type: 'performance',
                    priority: 'medium',
                    description: 'Add caching layer',
                    implementation: 'Implement React Query or SWR for data caching',
                    impact: 'medium'
                },
                {
                    type: 'performance',
                    priority: 'low',
                    description: 'Optimize component re-renders',
                    implementation: 'Use React.memo for UserProfile component',
                    impact: 'low'
                }
            ],
            testing: [
                {
                    type: 'testing',
                    priority: 'high',
                    description: 'Add error scenario tests',
                    implementation: 'Test API failure cases and error handling',
                    impact: 'high'
                },
                {
                    type: 'testing',
                    priority: 'medium',
                    description: 'Add integration tests',
                    implementation: 'Test complete user update flow',
                    impact: 'medium'
                }
            ]
        };
        return recommendationsMap[analysisType] || [];
    }
    testConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = {};
            for (const [analysisType, client] of this.mockClients.entries()) {
                results[analysisType] = yield client.testConnection();
            }
            return results;
        });
    }
    getPerformanceStats() {
        return {
            totalRequests: this.requestCount,
            totalErrors: 0,
            errorRate: 0,
            byAnalysisType: {
                architectural: { requests: 1, avgResponseTime: 50 },
                security: { requests: 1, avgResponseTime: 45 },
                performance: { requests: 1, avgResponseTime: 55 },
                testing: { requests: 1, avgResponseTime: 48 }
            }
        };
    }
    setShouldFail(shouldFail) {
        this.shouldFail = shouldFail;
        this.mockClients.forEach(client => client.setShouldFail(shouldFail));
    }
    reset() {
        this.requestCount = 0;
        this.shouldFail = false;
        this.mockClients.forEach(client => client.reset());
    }
    getMockClient(analysisType) {
        return this.mockClients.get(analysisType);
    }
}
exports.MockEnhancedLLMService = MockEnhancedLLMService;
// Factory function for creating mock LLM client
function createMockLLMClient(provider) {
    return new MockUniversalLLMClient(provider);
}
exports.default = {
    MockUniversalLLMClient,
    MockEnhancedLLMService,
    createMockLLMClient
};
