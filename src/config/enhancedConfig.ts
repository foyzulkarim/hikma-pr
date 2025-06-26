import { ModelConfig, Provider } from '../types/analysis.js';

export interface EnhancedSystemConfig {
  repository: RepositoryConfig;
  models: MultiModelConfig;
  analysis: AnalysisConfig;
  qualityGates: QualityGatesConfig;
  performance: PerformanceConfig;
}

export interface RepositoryConfig {
  cloneDirectory: string;
  maxRepositorySize: string;
  analysisTimeout: number;
  enableHistoricalAnalysis: boolean;
  maxHistoryDepth: number;
  enableFullClone: boolean;
  tempDirectory: string;
}

export interface MultiModelConfig {
  architectural: ModelConfig;
  security: ModelConfig;
  performance: ModelConfig;
  codeQuality: ModelConfig;
  testing: ModelConfig;
  synthesis: ModelConfig;
}

export interface AnalysisConfig {
  maxIterations: number;
  convergenceThreshold: number;
  confidenceThreshold: number;
  enableCrossValidation: boolean;
  enableIterativeRefinement: boolean;
  maxContextFiles: number;
  includeCompleteFiles: boolean;
  enableBlastRadiusAnalysis: boolean;
  semanticChunkingEnabled: boolean;
  astAnalysisEnabled: boolean;
}

export interface QualityGatesConfig {
  enforceCompleteness: boolean;
  enforceConsistency: boolean;
  enforceActionability: boolean;
  minimumConfidenceScore: number;
  requireEvidence: boolean;
  enableQualityValidation: boolean;
}

export interface PerformanceConfig {
  maxConcurrentAnalyses: number;
  timeoutPerAnalysis: number;
  enableCaching: boolean;
  cacheDirectory: string;
  maxCacheSize: string;
}

export const ENHANCED_SYSTEM_CONFIG: EnhancedSystemConfig = {
  repository: {
    cloneDirectory: './temp/repos',
    maxRepositorySize: '2GB',
    analysisTimeout: 3600000, // 1 hour
    enableHistoricalAnalysis: true,
    maxHistoryDepth: 100,
    enableFullClone: true,
    tempDirectory: './temp'
  },
  
  models: {
    architectural: { 
      name: 'gemini-2.5-pro', 
      provider: 'lmstudio' as Provider,
      base_url: 'http://localhost:1234',
      max_tokens: 8192,
      temperature: 0.1
    },
    security: { 
      name: 'claude-3.5-sonnet', 
      provider: 'ollama' as Provider,
      base_url: 'http://localhost:11434',
      max_tokens: 8192,
      temperature: 0.1
    },
    performance: { 
      name: 'gpt-4-turbo', 
      provider: 'lmstudio' as Provider,
      base_url: 'http://localhost:1234',
      max_tokens: 8192,
      temperature: 0.1
    },
    codeQuality: { 
      name: 'deepseek-coder-33b', 
      provider: 'ollama' as Provider,
      base_url: 'http://localhost:11434',
      max_tokens: 8192,
      temperature: 0.1
    },
    testing: { 
      name: 'qwen2.5-coder-32b', 
      provider: 'lmstudio' as Provider,
      base_url: 'http://localhost:1234',
      max_tokens: 8192,
      temperature: 0.1
    },
    synthesis: { 
      name: 'gemini-2.5-pro', 
      provider: 'lmstudio' as Provider,
      base_url: 'http://localhost:1234',
      max_tokens: 8192,
      temperature: 0.1
    }
  },
  
  analysis: {
    maxIterations: 5,
    convergenceThreshold: 0.85,
    confidenceThreshold: 0.8,
    enableCrossValidation: true,
    enableIterativeRefinement: true,
    maxContextFiles: 50,
    includeCompleteFiles: true,
    enableBlastRadiusAnalysis: true,
    semanticChunkingEnabled: true,
    astAnalysisEnabled: true
  },
  
  qualityGates: {
    enforceCompleteness: true,
    enforceConsistency: true,
    enforceActionability: true,
    minimumConfidenceScore: 0.7,
    requireEvidence: true,
    enableQualityValidation: true
  },

  performance: {
    maxConcurrentAnalyses: 3,
    timeoutPerAnalysis: 600000, // 10 minutes
    enableCaching: true,
    cacheDirectory: './temp/cache',
    maxCacheSize: '1GB'
  }
};

// Configuration validation
export function validateConfig(config: EnhancedSystemConfig): string[] {
  const errors: string[] = [];

  // Validate repository config
  if (!config.repository.cloneDirectory) {
    errors.push('Repository clone directory is required');
  }

  // Validate model configs
  const modelTypes = ['architectural', 'security', 'performance', 'codeQuality', 'testing', 'synthesis'];
  for (const modelType of modelTypes) {
    const model = config.models[modelType as keyof MultiModelConfig];
    if (!model.name) {
      errors.push(`Model name is required for ${modelType}`);
    }
    if (!model.provider) {
      errors.push(`Model provider is required for ${modelType}`);
    }
  }

  // Validate analysis config
  if (config.analysis.maxIterations < 1) {
    errors.push('Max iterations must be at least 1');
  }
  if (config.analysis.convergenceThreshold < 0 || config.analysis.convergenceThreshold > 1) {
    errors.push('Convergence threshold must be between 0 and 1');
  }

  // Validate quality gates
  if (config.qualityGates.minimumConfidenceScore < 0 || config.qualityGates.minimumConfidenceScore > 1) {
    errors.push('Minimum confidence score must be between 0 and 1');
  }

  return errors;
}

// Environment-specific configurations
export function getConfigForEnvironment(env: 'development' | 'production' | 'test'): EnhancedSystemConfig {
  const baseConfig = { ...ENHANCED_SYSTEM_CONFIG };

  switch (env) {
    case 'development':
      return {
        ...baseConfig,
        analysis: {
          ...baseConfig.analysis,
          maxIterations: 3,
          enableIterativeRefinement: true
        },
        performance: {
          ...baseConfig.performance,
          maxConcurrentAnalyses: 2
        }
      };

    case 'production':
      return {
        ...baseConfig,
        analysis: {
          ...baseConfig.analysis,
          maxIterations: 5,
          enableIterativeRefinement: true
        },
        performance: {
          ...baseConfig.performance,
          maxConcurrentAnalyses: 4
        }
      };

    case 'test':
      return {
        ...baseConfig,
        repository: {
          ...baseConfig.repository,
          analysisTimeout: 60000, // 1 minute for tests
          enableHistoricalAnalysis: false
        },
        analysis: {
          ...baseConfig.analysis,
          maxIterations: 1,
          enableIterativeRefinement: false,
          enableCrossValidation: false
        }
      };

    default:
      return baseConfig;
  }
}
