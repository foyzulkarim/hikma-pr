"use strict";
/**
 * UniversalLLMClient Tests
 * Tests OpenAI-compatible API client with mocked HTTP responses
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const axios_1 = __importDefault(require("axios"));
// Mock axios
globals_1.jest.mock('axios');
const mockedAxios = axios_1.default;
const universalLLMClient_1 = require("../../../src/services/universalLLMClient");
(0, globals_1.describe)('UniversalLLMClient', () => {
    let client;
    let mockAxiosInstance;
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        // Create mock axios instance
        mockAxiosInstance = {
            post: globals_1.jest.fn(),
            get: globals_1.jest.fn(),
            interceptors: {
                request: { use: globals_1.jest.fn() },
                response: { use: globals_1.jest.fn() }
            }
        };
        mockedAxios.create.mockReturnValue(mockAxiosInstance);
        // Create client with test configuration
        client = (0, universalLLMClient_1.createLLMClient)(universalLLMClient_1.PROVIDER_CONFIGS.LM_STUDIO, {
            enableRetry: false,
            enableFallback: false
        });
    });
    (0, globals_1.describe)('Client Initialization', () => {
        (0, globals_1.it)('should create client with correct configuration', () => {
            (0, globals_1.expect)(mockedAxios.create).toHaveBeenCalledWith({
                baseURL: 'http://localhost:1234',
                timeout: 120000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });
        (0, globals_1.it)('should setup request and response interceptors', () => {
            (0, globals_1.expect)(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
            (0, globals_1.expect)(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
        });
        (0, globals_1.it)('should include API key when provided', () => {
            const providerWithKey = Object.assign(Object.assign({}, universalLLMClient_1.PROVIDER_CONFIGS.LM_STUDIO), { apiKey: 'test-api-key' });
            (0, universalLLMClient_1.createLLMClient)(providerWithKey);
            (0, globals_1.expect)(mockedAxios.create).toHaveBeenCalledWith({
                baseURL: 'http://localhost:1234',
                timeout: 120000,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                }
            });
        });
    });
    (0, globals_1.describe)('Chat Completion', () => {
        (0, globals_1.it)('should make successful chat completion request', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                id: 'test-completion-123',
                object: 'chat.completion',
                created: Date.now(),
                model: 'local-model',
                choices: [{
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: 'This is a test response from the LLM.'
                        },
                        finish_reason: 'stop'
                    }],
                usage: {
                    prompt_tokens: 50,
                    completion_tokens: 25,
                    total_tokens: 75
                }
            };
            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });
            const request = {
                model: 'local-model',
                messages: [
                    { role: 'user', content: 'Hello, how are you?' }
                ],
                temperature: 0.7,
                max_tokens: 100
            };
            const response = yield client.chatCompletion(request);
            (0, globals_1.expect)(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', request);
            (0, globals_1.expect)(response).toEqual(mockResponse);
            (0, globals_1.expect)(response.choices[0].message.content).toBe('This is a test response from the LLM.');
        }));
        (0, globals_1.it)('should handle API errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            const errorResponse = {
                response: {
                    status: 500,
                    data: { error: 'Internal server error' }
                },
                message: 'Request failed with status code 500'
            };
            mockAxiosInstance.post.mockRejectedValue(errorResponse);
            const request = {
                model: 'local-model',
                messages: [{ role: 'user', content: 'Test message' }]
            };
            yield (0, globals_1.expect)(client.chatCompletion(request)).rejects.toThrow('Request failed with status code 500');
        }));
        (0, globals_1.it)('should validate response format', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidResponse = {
                data: {
                    id: 'test-123'
                    // Missing choices array
                }
            };
            mockAxiosInstance.post.mockResolvedValue(invalidResponse);
            const request = {
                model: 'local-model',
                messages: [{ role: 'user', content: 'Test' }]
            };
            yield (0, globals_1.expect)(client.chatCompletion(request)).rejects.toThrow('Invalid response format');
        }));
        (0, globals_1.it)('should use default model when not specified', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                data: {
                    id: 'test-123',
                    choices: [{ message: { content: 'Response' } }],
                    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
                }
            };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);
            const request = {
                model: '',
                messages: [{ role: 'user', content: 'Test' }]
            };
            yield client.chatCompletion(request);
            (0, globals_1.expect)(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', {
                model: 'local-model',
                messages: [{ role: 'user', content: 'Test' }],
                temperature: 0.7,
                max_tokens: 2000
            });
        }));
    });
    (0, globals_1.describe)('Connection Testing', () => {
        (0, globals_1.it)('should return true for successful connection test', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                data: {
                    id: 'test-connection',
                    choices: [{
                            message: { content: 'OK' }
                        }],
                    usage: { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 }
                }
            };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);
            const isConnected = yield client.testConnection();
            (0, globals_1.expect)(isConnected).toBe(true);
            (0, globals_1.expect)(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', {
                model: 'local-model',
                messages: [
                    { role: 'user', content: 'Hello, this is a connection test. Please respond with "OK".' }
                ],
                max_tokens: 10,
                temperature: 0
            });
        }));
        (0, globals_1.it)('should return false for failed connection test', () => __awaiter(void 0, void 0, void 0, function* () {
            mockAxiosInstance.post.mockRejectedValue(new Error('Connection failed'));
            const isConnected = yield client.testConnection();
            (0, globals_1.expect)(isConnected).toBe(false);
        }));
    });
    (0, globals_1.describe)('Model Management', () => {
        (0, globals_1.it)('should fetch available models successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockModelsResponse = {
                data: {
                    data: [
                        { id: 'model-1', object: 'model' },
                        { id: 'model-2', object: 'model' },
                        { id: 'local-model', object: 'model' }
                    ]
                }
            };
            mockAxiosInstance.get.mockResolvedValue(mockModelsResponse);
            const models = yield client.getAvailableModels();
            (0, globals_1.expect)(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/models');
            (0, globals_1.expect)(models).toEqual(['model-1', 'model-2', 'local-model']);
        }));
        (0, globals_1.it)('should return default model on API error', () => __awaiter(void 0, void 0, void 0, function* () {
            mockAxiosInstance.get.mockRejectedValue(new Error('Models endpoint not available'));
            const models = yield client.getAvailableModels();
            (0, globals_1.expect)(models).toEqual(['local-model']);
        }));
    });
    (0, globals_1.describe)('Simple Completion', () => {
        (0, globals_1.it)('should perform simple text completion', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                data: {
                    choices: [{
                            message: { content: 'This is a simple completion response.' }
                        }],
                    usage: { prompt_tokens: 10, completion_tokens: 8, total_tokens: 18 }
                }
            };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);
            const response = yield client.simpleCompletion('Complete this sentence:', {
                temperature: 0.5,
                maxTokens: 50
            });
            (0, globals_1.expect)(response).toBe('This is a simple completion response.');
            (0, globals_1.expect)(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', {
                model: 'local-model',
                messages: [{ role: 'user', content: 'Complete this sentence:' }],
                temperature: 0.5,
                max_tokens: 50
            });
        }));
        (0, globals_1.it)('should use default parameters when not specified', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = {
                data: {
                    choices: [{ message: { content: 'Default response' } }],
                    usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 }
                }
            };
            mockAxiosInstance.post.mockResolvedValue(mockResponse);
            yield client.simpleCompletion('Test prompt');
            (0, globals_1.expect)(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', {
                model: 'local-model',
                messages: [{ role: 'user', content: 'Test prompt' }],
                temperature: 0.7,
                max_tokens: 2000
            });
        }));
    });
    (0, globals_1.describe)('Provider Configuration', () => {
        (0, globals_1.it)('should update provider configuration', () => {
            const newProvider = {
                name: 'New Provider',
                baseURL: 'http://localhost:8000',
                defaultModel: 'new-model'
            };
            client.updateProvider(newProvider);
            const providerInfo = client.getProviderInfo();
            (0, globals_1.expect)(providerInfo.name).toBe('New Provider');
            (0, globals_1.expect)(providerInfo.baseURL).toBe('http://localhost:8000');
            (0, globals_1.expect)(providerInfo.defaultModel).toBe('new-model');
        });
    });
    (0, globals_1.describe)('Error Handling', () => {
        (0, globals_1.it)('should handle network timeout errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const timeoutError = new Error('timeout of 120000ms exceeded');
            timeoutError.name = 'ECONNABORTED';
            mockAxiosInstance.post.mockRejectedValue(timeoutError);
            const request = {
                model: 'local-model',
                messages: [{ role: 'user', content: 'Test timeout' }]
            };
            yield (0, globals_1.expect)(client.chatCompletion(request)).rejects.toThrow('timeout');
        }));
        (0, globals_1.it)('should handle malformed JSON responses', () => __awaiter(void 0, void 0, void 0, function* () {
            mockAxiosInstance.post.mockResolvedValue({
                data: 'invalid json response'
            });
            const request = {
                model: 'local-model',
                messages: [{ role: 'user', content: 'Test' }]
            };
            yield (0, globals_1.expect)(client.chatCompletion(request)).rejects.toThrow();
        }));
    });
});
