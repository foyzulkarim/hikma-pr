/**
 * Universal LLM Client - OpenAI API Compatible
 * Supports LM Studio, Ollama, vLLM, and any OpenAI-spec compatible endpoint
 * Core philosophy: Leverage locally hosted LLMs for unlimited, cost-free analysis
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface LLMProvider {
  name: string;
  baseURL: string;
  apiKey?: string;
  defaultModel: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMClientConfig {
  provider: LLMProvider;
  defaultParams?: Partial<ChatCompletionRequest>;
  enableRetry?: boolean;
  enableFallback?: boolean;
  fallbackProviders?: LLMProvider[];
}

export class UniversalLLMClient {
  private client: AxiosInstance;
  private config: LLMClientConfig;
  private fallbackClients: AxiosInstance[] = [];

  constructor(config: LLMClientConfig) {
    this.config = config;
    this.client = this.createAxiosClient(config.provider);
    
    // Initialize fallback clients if enabled
    if (config.enableFallback && config.fallbackProviders) {
      this.fallbackClients = config.fallbackProviders.map(provider => 
        this.createAxiosClient(provider)
      );
    }
  }

  private createAxiosClient(provider: LLMProvider): AxiosInstance {
    const client = axios.create({
      baseURL: provider.baseURL,
      timeout: provider.timeout || 120000, // 2 minutes default
      headers: {
        'Content-Type': 'application/json',
        ...(provider.apiKey && { 'Authorization': `Bearer ${provider.apiKey}` })
      }
    });

    // Add request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        console.log(`🤖 LLM Request to ${provider.name}: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error(`❌ LLM Request Error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    client.interceptors.response.use(
      (response) => {
        console.log(`✅ LLM Response from ${provider.name}: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.error(`❌ LLM Response Error from ${provider.name}: ${error.response?.status} ${error.message}`);
        return Promise.reject(error);
      }
    );

    return client;
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const fullRequest = {
      ...this.config.defaultParams,
      ...request,
      model: request.model || this.config.provider.defaultModel
    };

    try {
      return await this.attemptChatCompletion(this.client, fullRequest, this.config.provider.name);
    } catch (error: any) {
      console.warn(`⚠️ Primary provider ${this.config.provider.name} failed: ${error.message}`);
      
      // Try fallback providers if enabled
      if (this.config.enableFallback && this.fallbackClients.length > 0) {
        return await this.tryFallbackProviders(fullRequest);
      }
      
      throw error;
    }
  }

  private async attemptChatCompletion(
    client: AxiosInstance, 
    request: ChatCompletionRequest, 
    providerName: string
  ): Promise<ChatCompletionResponse> {
    const maxRetries = this.config.provider.maxRetries || 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${providerName}`);
        
        const response = await client.post('/v1/chat/completions', request);
        
        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
          throw new Error('Invalid response format: missing choices');
        }

        return response.data as ChatCompletionResponse;
        
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt} failed for ${providerName}: ${error.message}`);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private async tryFallbackProviders(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    for (let i = 0; i < this.fallbackClients.length; i++) {
      const fallbackClient = this.fallbackClients[i];
      const fallbackProvider = this.config.fallbackProviders![i];
      
      try {
        console.log(`🔄 Trying fallback provider: ${fallbackProvider.name}`);
        
        // Adjust model name for fallback provider
        const fallbackRequest = {
          ...request,
          model: fallbackProvider.defaultModel
        };
        
        return await this.attemptChatCompletion(fallbackClient, fallbackRequest, fallbackProvider.name);
        
      } catch (error: any) {
        console.warn(`⚠️ Fallback provider ${fallbackProvider.name} failed: ${error.message}`);
        continue;
      }
    }
    
    throw new Error('All providers (primary and fallback) failed');
  }

  async testConnection(): Promise<boolean> {
    try {
      const testRequest: ChatCompletionRequest = {
        model: this.config.provider.defaultModel,
        messages: [
          { role: 'user', content: 'Hello, this is a connection test. Please respond with "OK".' }
        ],
        max_tokens: 10,
        temperature: 0
      };

      const response = await this.chatCompletion(testRequest);
      const content = response.choices[0]?.message?.content?.toLowerCase() || '';
      
      console.log(`✅ Connection test successful for ${this.config.provider.name}`);
      return content.includes('ok') || content.includes('hello');
      
    } catch (error: any) {
      console.error(`❌ Connection test failed for ${this.config.provider.name}: ${error.message}`);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/v1/models');
      const models = response.data.data || [];
      return models.map((model: any) => model.id);
    } catch (error: any) {
      console.warn(`⚠️ Could not fetch models from ${this.config.provider.name}: ${error.message}`);
      return [this.config.provider.defaultModel];
    }
  }

  // Utility method for simple text completion
  async simpleCompletion(
    prompt: string, 
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const request: ChatCompletionRequest = {
      model: options?.model || this.config.provider.defaultModel,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000
    };

    const response = await this.chatCompletion(request);
    return response.choices[0]?.message?.content || '';
  }

  // Get provider info
  getProviderInfo(): LLMProvider {
    return this.config.provider;
  }

  // Update provider configuration
  updateProvider(provider: LLMProvider): void {
    this.config.provider = provider;
    this.client = this.createAxiosClient(provider);
  }
}

// Predefined provider configurations
export const PROVIDER_CONFIGS = {
  LM_STUDIO: {
    name: 'LM Studio',
    baseURL: 'http://localhost:1234',
    defaultModel: 'local-model',
    timeout: 120000
  } as LLMProvider,

  OLLAMA: {
    name: 'Ollama',
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama2',
    timeout: 120000
  } as LLMProvider,

  VLLM: {
    name: 'vLLM',
    baseURL: 'http://localhost:8000',
    defaultModel: 'meta-llama/Llama-2-7b-chat-hf',
    timeout: 120000
  } as LLMProvider
};

// Helper function for creating OpenAI-compatible providers
export const createOpenAICompatibleProvider = (baseURL: string, model: string, apiKey?: string): LLMProvider => ({
  name: 'OpenAI Compatible',
  baseURL,
  defaultModel: model,
  apiKey,
  timeout: 120000
});

// Factory function for easy client creation
export function createLLMClient(
  provider: LLMProvider | keyof typeof PROVIDER_CONFIGS,
  options?: {
    enableRetry?: boolean;
    enableFallback?: boolean;
    fallbackProviders?: LLMProvider[];
    defaultParams?: Partial<ChatCompletionRequest>;
  }
): UniversalLLMClient {
  const providerConfig = typeof provider === 'string' 
    ? PROVIDER_CONFIGS[provider] 
    : provider as LLMProvider;

  const config: LLMClientConfig = {
    provider: providerConfig,
    enableRetry: options?.enableRetry ?? true,
    enableFallback: options?.enableFallback ?? false,
    fallbackProviders: options?.fallbackProviders,
    defaultParams: {
      temperature: 0.7,
      max_tokens: 2000,
      ...options?.defaultParams
    }
  };

  return new UniversalLLMClient(config);
}

export default UniversalLLMClient;
