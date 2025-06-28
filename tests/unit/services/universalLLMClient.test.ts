/**
 * UniversalLLMClient Tests
 * Tests OpenAI-compatible API client with mocked HTTP responses
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

import { 
  UniversalLLMClient, 
  createLLMClient, 
  PROVIDER_CONFIGS,
  ChatCompletionRequest,
  ChatCompletionResponse 
} from '../../../src/services/universalLLMClient';

describe('UniversalLLMClient', () => {
  let client: UniversalLLMClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Create client with test configuration
    client = createLLMClient(PROVIDER_CONFIGS.LM_STUDIO, {
      enableRetry: false,
      enableFallback: false
    });
  });

  describe('Client Initialization', () => {
    it('should create client with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:1234',
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('should setup request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should include API key when provided', () => {
      const providerWithKey = {
        ...PROVIDER_CONFIGS.LM_STUDIO,
        apiKey: 'test-api-key'
      };

      createLLMClient(providerWithKey);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:1234',
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        }
      });
    });
  });

  describe('Chat Completion', () => {
    it('should make successful chat completion request', async () => {
      const mockResponse: ChatCompletionResponse = {
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

      const request: ChatCompletionRequest = {
        model: 'local-model',
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        temperature: 0.7,
        max_tokens: 100
      };

      const response = await client.chatCompletion(request);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', request);
      expect(response).toEqual(mockResponse);
      expect(response.choices[0].message.content).toBe('This is a test response from the LLM.');
    });

    it('should handle API errors gracefully', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        },
        message: 'Request failed with status code 500'
      };

      mockAxiosInstance.post.mockRejectedValue(errorResponse);

      const request: ChatCompletionRequest = {
        model: 'local-model',
        messages: [{ role: 'user', content: 'Test message' }]
      };

      await expect(client.chatCompletion(request)).rejects.toThrow('Request failed with status code 500');
    });

    it('should validate response format', async () => {
      const invalidResponse = {
        data: {
          id: 'test-123'
          // Missing choices array
        }
      };

      mockAxiosInstance.post.mockResolvedValue(invalidResponse);

      const request: ChatCompletionRequest = {
        model: 'local-model',
        messages: [{ role: 'user', content: 'Test' }]
      };

      await expect(client.chatCompletion(request)).rejects.toThrow('Invalid response format');
    });

    it('should use default model when not specified', async () => {
      const mockResponse = {
        data: {
          id: 'test-123',
          choices: [{ message: { content: 'Response' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const request: ChatCompletionRequest = {
        model: '',
        messages: [{ role: 'user', content: 'Test' }]
      };

      await client.chatCompletion(request);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', {
        model: 'local-model',
        messages: [{ role: 'user', content: 'Test' }],
        temperature: 0.7,
        max_tokens: 2000
      });
    });
  });

  describe('Connection Testing', () => {
    it('should return true for successful connection test', async () => {
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

      const isConnected = await client.testConnection();

      expect(isConnected).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', {
        model: 'local-model',
        messages: [
          { role: 'user', content: 'Hello, this is a connection test. Please respond with "OK".' }
        ],
        max_tokens: 10,
        temperature: 0
      });
    });

    it('should return false for failed connection test', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Connection failed'));

      const isConnected = await client.testConnection();

      expect(isConnected).toBe(false);
    });
  });

  describe('Model Management', () => {
    it('should fetch available models successfully', async () => {
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

      const models = await client.getAvailableModels();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/models');
      expect(models).toEqual(['model-1', 'model-2', 'local-model']);
    });

    it('should return default model on API error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Models endpoint not available'));

      const models = await client.getAvailableModels();

      expect(models).toEqual(['local-model']);
    });
  });

  describe('Simple Completion', () => {
    it('should perform simple text completion', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'This is a simple completion response.' }
          }],
          usage: { prompt_tokens: 10, completion_tokens: 8, total_tokens: 18 }
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const response = await client.simpleCompletion('Complete this sentence:', {
        temperature: 0.5,
        maxTokens: 50
      });

      expect(response).toBe('This is a simple completion response.');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', {
        model: 'local-model',
        messages: [{ role: 'user', content: 'Complete this sentence:' }],
        temperature: 0.5,
        max_tokens: 50
      });
    });

    it('should use default parameters when not specified', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Default response' } }],
          usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 }
        }
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await client.simpleCompletion('Test prompt');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/v1/chat/completions', {
        model: 'local-model',
        messages: [{ role: 'user', content: 'Test prompt' }],
        temperature: 0.7,
        max_tokens: 2000
      });
    });
  });

  describe('Provider Configuration', () => {
    it('should update provider configuration', () => {
      const newProvider = {
        name: 'New Provider',
        baseURL: 'http://localhost:8000',
        defaultModel: 'new-model'
      };

      client.updateProvider(newProvider);

      const providerInfo = client.getProviderInfo();
      expect(providerInfo.name).toBe('New Provider');
      expect(providerInfo.baseURL).toBe('http://localhost:8000');
      expect(providerInfo.defaultModel).toBe('new-model');
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('timeout of 120000ms exceeded');
      timeoutError.name = 'ECONNABORTED';
      
      mockAxiosInstance.post.mockRejectedValue(timeoutError);

      const request: ChatCompletionRequest = {
        model: 'local-model',
        messages: [{ role: 'user', content: 'Test timeout' }]
      };

      await expect(client.chatCompletion(request)).rejects.toThrow('timeout');
    });

    it('should handle malformed JSON responses', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: 'invalid json response'
      });

      const request: ChatCompletionRequest = {
        model: 'local-model',
        messages: [{ role: 'user', content: 'Test' }]
      };

      await expect(client.chatCompletion(request)).rejects.toThrow();
    });
  });
});
