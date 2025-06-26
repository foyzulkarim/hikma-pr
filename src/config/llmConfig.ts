/**
 * LLM Configuration - Local LLM Provider Setup
 * Supports multiple local LLM providers for cost-free, unlimited analysis
 */
import 'dotenv/config';
import { LLMProvider, PROVIDER_CONFIGS } from '../services/universalLLMClient.js';

export interface LLMModelConfig {
  provider: LLMProvider;
  specialty: string;
  description: string;
  recommendedFor: string[];
}

export interface MultiModelConfig {
  architectural: LLMModelConfig;
  security: LLMModelConfig;
  performance: LLMModelConfig;
  testing: LLMModelConfig;
  synthesis: LLMModelConfig;
}

// Helper function to get model from environment
function getModelFromEnv(envKey: string, fallback: string): string {
  return process.env[envKey] || fallback;
}

// Default multi-model configuration for local LLMs
export const DEFAULT_LOCAL_LLM_CONFIG: MultiModelConfig = {
  architectural: {
    provider: {
      ...PROVIDER_CONFIGS.LM_STUDIO,
      defaultModel: 'deepseek-coder-6.7b-instruct'
    },
    specialty: 'architectural-analysis',
    description: 'DeepSeek Coder for architectural analysis',
    recommendedFor: ['design patterns', 'code structure', 'architectural decisions']
  },
  
  security: {
    provider: {
      ...PROVIDER_CONFIGS.OLLAMA,
      defaultModel: 'codellama:7b-instruct'
    },
    specialty: 'security-analysis',
    description: 'CodeLlama for security analysis',
    recommendedFor: ['vulnerability detection', 'security patterns', 'auth/authz']
  },
  
  performance: {
    provider: {
      ...PROVIDER_CONFIGS.LM_STUDIO,
      defaultModel: 'qwen2.5-coder-7b-instruct'
    },
    specialty: 'performance-analysis',
    description: 'Qwen2.5 Coder for performance analysis',
    recommendedFor: ['performance optimization', 'algorithmic complexity', 'resource usage']
  },
  
  testing: {
    provider: {
      ...PROVIDER_CONFIGS.OLLAMA,
      defaultModel: 'deepseek-coder:6.7b'
    },
    specialty: 'testing-analysis',
    description: 'DeepSeek Coder for testing analysis',
    recommendedFor: ['test coverage', 'test quality', 'edge cases']
  },
  
  synthesis: {
    provider: {
      ...PROVIDER_CONFIGS.LM_STUDIO,
      defaultModel: 'qwen2.5-coder-14b-instruct'
    },
    specialty: 'synthesis',
    description: 'Qwen2.5 Coder 14B for final synthesis',
    recommendedFor: ['report generation', 'executive summary', 'recommendations']
  }
};

// Alternative configurations for different setups
export const LLM_CONFIGURATIONS = {
  // Single LM Studio setup (most common)
  LM_STUDIO_ONLY: {
    architectural: {
      provider: { 
        ...PROVIDER_CONFIGS.LM_STUDIO, 
        defaultModel: getModelFromEnv('LLM_ARCHITECTURAL_MODEL', 'deepseek-coder-6.7b-instruct')
      },
      specialty: 'architectural-analysis',
      description: 'DeepSeek Coder for architectural analysis',
      recommendedFor: ['design patterns', 'code structure']
    },
    security: {
      provider: { 
        ...PROVIDER_CONFIGS.LM_STUDIO, 
        defaultModel: getModelFromEnv('LLM_SECURITY_MODEL', 'deepseek-coder-6.7b-instruct')
      },
      specialty: 'security-analysis', 
      description: 'DeepSeek Coder for security analysis',
      recommendedFor: ['vulnerability detection', 'security patterns']
    },
    performance: {
      provider: { 
        ...PROVIDER_CONFIGS.LM_STUDIO, 
        defaultModel: getModelFromEnv('LLM_PERFORMANCE_MODEL', 'qwen2.5-coder-7b-instruct')
      },
      specialty: 'performance-analysis',
      description: 'Qwen2.5 Coder for performance analysis', 
      recommendedFor: ['performance optimization', 'algorithmic complexity']
    },
    testing: {
      provider: { 
        ...PROVIDER_CONFIGS.LM_STUDIO, 
        defaultModel: getModelFromEnv('LLM_TESTING_MODEL', 'deepseek-coder-6.7b-instruct')
      },
      specialty: 'testing-analysis',
      description: 'DeepSeek Coder for testing analysis',
      recommendedFor: ['test coverage', 'test quality']
    },
    synthesis: {
      provider: { 
        ...PROVIDER_CONFIGS.LM_STUDIO, 
        defaultModel: getModelFromEnv('LLM_SYNTHESIS_MODEL', 'qwen2.5-coder-14b-instruct')
      },
      specialty: 'synthesis',
      description: 'Qwen2.5 Coder 14B for synthesis',
      recommendedFor: ['report generation', 'executive summary']
    }
  } as MultiModelConfig,

  // Single Ollama setup
  OLLAMA_ONLY: {
    architectural: {
      provider: { ...PROVIDER_CONFIGS.OLLAMA, defaultModel: 'deepseek-coder:6.7b' },
      specialty: 'architectural-analysis',
      description: 'DeepSeek Coder via Ollama',
      recommendedFor: ['design patterns', 'code structure']
    },
    security: {
      provider: { ...PROVIDER_CONFIGS.OLLAMA, defaultModel: 'codellama:7b-instruct' },
      specialty: 'security-analysis',
      description: 'CodeLlama via Ollama',
      recommendedFor: ['vulnerability detection', 'security patterns']
    },
    performance: {
      provider: { ...PROVIDER_CONFIGS.OLLAMA, defaultModel: 'qwen2.5-coder:7b' },
      specialty: 'performance-analysis',
      description: 'Qwen2.5 Coder via Ollama',
      recommendedFor: ['performance optimization', 'algorithmic complexity']
    },
    testing: {
      provider: { ...PROVIDER_CONFIGS.OLLAMA, defaultModel: 'deepseek-coder:6.7b' },
      specialty: 'testing-analysis',
      description: 'DeepSeek Coder via Ollama',
      recommendedFor: ['test coverage', 'test quality']
    },
    synthesis: {
      provider: { ...PROVIDER_CONFIGS.OLLAMA, defaultModel: 'qwen2.5-coder:14b' },
      specialty: 'synthesis',
      description: 'Qwen2.5 Coder 14B via Ollama',
      recommendedFor: ['report generation', 'executive summary']
    }
  } as MultiModelConfig,

  // High-performance vLLM setup
  VLLM_SETUP: {
    architectural: {
      provider: { ...PROVIDER_CONFIGS.VLLM, defaultModel: 'deepseek-ai/deepseek-coder-6.7b-instruct' },
      specialty: 'architectural-analysis',
      description: 'DeepSeek Coder via vLLM',
      recommendedFor: ['design patterns', 'code structure']
    },
    security: {
      provider: { ...PROVIDER_CONFIGS.VLLM, defaultModel: 'codellama/CodeLlama-7b-Instruct-hf' },
      specialty: 'security-analysis',
      description: 'CodeLlama via vLLM',
      recommendedFor: ['vulnerability detection', 'security patterns']
    },
    performance: {
      provider: { ...PROVIDER_CONFIGS.VLLM, defaultModel: 'Qwen/Qwen2.5-Coder-7B-Instruct' },
      specialty: 'performance-analysis',
      description: 'Qwen2.5 Coder via vLLM',
      recommendedFor: ['performance optimization', 'algorithmic complexity']
    },
    testing: {
      provider: { ...PROVIDER_CONFIGS.VLLM, defaultModel: 'deepseek-ai/deepseek-coder-6.7b-instruct' },
      specialty: 'testing-analysis',
      description: 'DeepSeek Coder via vLLM',
      recommendedFor: ['test coverage', 'test quality']
    },
    synthesis: {
      provider: { ...PROVIDER_CONFIGS.VLLM, defaultModel: 'Qwen/Qwen2.5-Coder-14B-Instruct' },
      specialty: 'synthesis',
      description: 'Qwen2.5 Coder 14B via vLLM',
      recommendedFor: ['report generation', 'executive summary']
    }
  } as MultiModelConfig
};

// Environment-based configuration detection
export function detectLLMConfiguration(): MultiModelConfig {
  // Check for environment variables
  const lmStudioUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234';
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const vllmUrl = process.env.VLLM_URL || 'http://localhost:8000';
  
  // Try to detect which services are available
  // For now, default to LM Studio (most common setup)
  const preferredSetup = process.env.HIKMA_LLM_SETUP || 'LM_STUDIO_ONLY';
  
  switch (preferredSetup) {
    case 'OLLAMA_ONLY':
      return LLM_CONFIGURATIONS.OLLAMA_ONLY;
    case 'VLLM_SETUP':
      return LLM_CONFIGURATIONS.VLLM_SETUP;
    case 'MIXED':
      return DEFAULT_LOCAL_LLM_CONFIG;
    default:
      return LLM_CONFIGURATIONS.LM_STUDIO_ONLY;
  }
}

// Custom configuration builder
export function buildCustomLLMConfig(overrides: Partial<MultiModelConfig>): MultiModelConfig {
  const baseConfig = detectLLMConfiguration();
  return {
    ...baseConfig,
    ...overrides
  };
}

// Validation function to check if providers are accessible
export async function validateLLMConfiguration(config: MultiModelConfig): Promise<{
  valid: boolean;
  results: Record<string, boolean>;
  recommendations: string[];
}> {
  const results: Record<string, boolean> = {};
  const recommendations: string[] = [];
  
  // Test each provider (simplified - would need actual HTTP checks)
  for (const [key, modelConfig] of Object.entries(config)) {
    try {
      // This would be replaced with actual connectivity test
      results[key] = true;
    } catch (error) {
      results[key] = false;
      recommendations.push(`${key}: ${modelConfig.provider.name} at ${modelConfig.provider.baseURL} is not accessible`);
    }
  }
  
  const valid = Object.values(results).every(Boolean);
  
  if (!valid) {
    recommendations.push('Consider using HIKMA_LLM_SETUP=LM_STUDIO_ONLY for single-provider setup');
    recommendations.push('Ensure your local LLM servers are running and accessible');
  }
  
  return { valid, results, recommendations };
}

// Export the current configuration
export const CURRENT_LLM_CONFIG = detectLLMConfiguration();

export default CURRENT_LLM_CONFIG;
