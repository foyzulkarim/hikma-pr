/**
 * Context-Aware Prompt Enhancer - Complete Implementation
 * Adapts prompts based on repository characteristics and change patterns
 */
import { 
  EnhancedPRContext, 
  RepositoryMetadata,
  ChangeClassification,
  AnalysisType
} from '../types/analysis.js';

export class ContextAwareEnhancer {
  private languageSpecificEnhancements: Map<string, LanguageEnhancement>;
  private frameworkSpecificEnhancements: Map<string, FrameworkEnhancement>;
  private architectureSpecificEnhancements: Map<string, ArchitectureEnhancement>;

  constructor() {
    this.languageSpecificEnhancements = new Map();
    this.frameworkSpecificEnhancements = new Map();
    this.architectureSpecificEnhancements = new Map();
    this.initializeEnhancements();
  }

  async enhancePromptForContext(
    basePrompt: string,
    analysisType: AnalysisType,
    context: EnhancedPRContext
  ): Promise<string> {
    console.log(`🎯 Enhancing prompt for ${context.repositoryMetadata.language} ${context.repositoryMetadata.framework}...`);

    let enhancedPrompt = basePrompt;

    // Apply language-specific enhancements
    enhancedPrompt = await this.applyLanguageEnhancements(
      enhancedPrompt,
      context.repositoryMetadata.language,
      analysisType
    );

    // Apply framework-specific enhancements
    enhancedPrompt = await this.applyFrameworkEnhancements(
      enhancedPrompt,
      context.repositoryMetadata.framework,
      analysisType
    );

    // Apply architecture-specific enhancements
    enhancedPrompt = await this.applyArchitectureEnhancements(
      enhancedPrompt,
      context.repositoryMetadata.architecture,
      analysisType
    );

    // Apply change-specific enhancements
    enhancedPrompt = await this.applyChangeSpecificEnhancements(
      enhancedPrompt,
      context.changeClassification,
      analysisType
    );

    // Apply repository size-specific enhancements
    enhancedPrompt = await this.applyRepositorySizeEnhancements(
      enhancedPrompt,
      context.repositoryMetadata.size,
      analysisType
    );

    console.log(`✅ Enhanced prompt with context-specific guidance`);
    return enhancedPrompt;
  }

  private initializeEnhancements(): void {
    this.initializeLanguageEnhancements();
    this.initializeFrameworkEnhancements();
    this.initializeArchitectureEnhancements();
  }

  private initializeLanguageEnhancements(): void {
    // TypeScript/JavaScript enhancements
    this.languageSpecificEnhancements.set('typescript', {
      architectural: {
        patterns: ['Decorator Pattern', 'Module Pattern', 'Factory Pattern'],
        bestPractices: [
          'Use strict type checking',
          'Leverage interface segregation',
          'Implement proper error handling with Result types',
          'Use dependency injection patterns'
        ],
        commonIssues: [
          'Any type usage reducing type safety',
          'Missing null/undefined checks',
          'Improper async/await usage',
          'Circular dependencies'
        ]
      },
      security: {
        vulnerabilities: [
          'Prototype pollution',
          'XSS through DOM manipulation',
          'CSRF token handling',
          'JWT token security'
        ],
        bestPractices: [
          'Input validation with type guards',
          'Sanitize user inputs',
          'Use Content Security Policy',
          'Implement proper CORS handling'
        ]
      },
      performance: {
        optimizations: [
          'Tree shaking for bundle size',
          'Lazy loading modules',
          'Memoization patterns',
          'Efficient DOM manipulation'
        ],
        commonBottlenecks: [
          'Large bundle sizes',
          'Memory leaks in closures',
          'Inefficient array operations',
          'Excessive re-renders'
        ]
      },
      testing: {
        strategies: [
          'Unit testing with Jest',
          'Integration testing with Supertest',
          'E2E testing with Playwright',
          'Type testing with tsd'
        ],
        patterns: [
          'Test-driven development',
          'Behavior-driven development',
          'Property-based testing',
          'Snapshot testing'
        ]
      }
    });

    // Python enhancements
    this.languageSpecificEnhancements.set('python', {
      architectural: {
        patterns: ['MVC Pattern', 'Repository Pattern', 'Factory Pattern'],
        bestPractices: [
          'Follow PEP 8 style guidelines',
          'Use type hints for better code clarity',
          'Implement proper exception handling',
          'Use context managers for resource management'
        ],
        commonIssues: [
          'Circular imports',
          'Global state management',
          'Improper exception handling',
          'Memory leaks with circular references'
        ]
      },
      security: {
        vulnerabilities: [
          'SQL injection in raw queries',
          'Pickle deserialization attacks',
          'Path traversal vulnerabilities',
          'Command injection'
        ],
        bestPractices: [
          'Use parameterized queries',
          'Validate and sanitize inputs',
          'Use secure random generators',
          'Implement proper authentication'
        ]
      },
      performance: {
        optimizations: [
          'Use list comprehensions',
          'Leverage built-in functions',
          'Implement caching strategies',
          'Use generators for memory efficiency'
        ],
        commonBottlenecks: [
          'GIL limitations in threading',
          'Inefficient string concatenation',
          'Large object creation',
          'Blocking I/O operations'
        ]
      },
      testing: {
        strategies: [
          'Unit testing with pytest',
          'Mock testing with unittest.mock',
          'Integration testing',
          'Property-based testing with Hypothesis'
        ],
        patterns: [
          'Fixture-based testing',
          'Parametrized testing',
          'Test doubles and mocking',
          'Coverage-driven testing'
        ]
      }
    });

    // Java enhancements
    this.languageSpecificEnhancements.set('java', {
      architectural: {
        patterns: ['Spring Framework patterns', 'Enterprise patterns', 'GoF patterns'],
        bestPractices: [
          'Use dependency injection',
          'Follow SOLID principles',
          'Implement proper layered architecture',
          'Use design patterns appropriately'
        ],
        commonIssues: [
          'Tight coupling between layers',
          'God objects and classes',
          'Improper exception handling',
          'Memory leaks with listeners'
        ]
      },
      security: {
        vulnerabilities: [
          'Deserialization vulnerabilities',
          'SQL injection',
          'XML external entity attacks',
          'Path traversal'
        ],
        bestPractices: [
          'Use prepared statements',
          'Validate inputs thoroughly',
          'Implement proper authentication',
          'Use security frameworks'
        ]
      },
      performance: {
        optimizations: [
          'JVM tuning and garbage collection',
          'Connection pooling',
          'Caching strategies',
          'Asynchronous processing'
        ],
        commonBottlenecks: [
          'Memory leaks',
          'Inefficient database queries',
          'Blocking I/O operations',
          'Poor garbage collection'
        ]
      },
      testing: {
        strategies: [
          'Unit testing with JUnit',
          'Integration testing with Spring Test',
          'Mock testing with Mockito',
          'Performance testing with JMeter'
        ],
        patterns: [
          'Test-driven development',
          'Behavior-driven development',
          'Contract testing',
          'Mutation testing'
        ]
      }
    });
  }

  private initializeFrameworkEnhancements(): void {
    // React enhancements
    this.frameworkSpecificEnhancements.set('react', {
      architectural: {
        patterns: [
          'Component composition',
          'Higher-order components',
          'Render props pattern',
          'Custom hooks pattern'
        ],
        stateManagement: [
          'Redux for complex state',
          'Context API for shared state',
          'Local state for component-specific data',
          'State normalization'
        ]
      },
      performance: {
        optimizations: [
          'React.memo for component memoization',
          'useMemo and useCallback hooks',
          'Code splitting with React.lazy',
          'Virtual scrolling for large lists'
        ],
        antiPatterns: [
          'Unnecessary re-renders',
          'Large component trees',
          'Inline object creation',
          'Missing dependency arrays'
        ]
      },
      testing: {
        strategies: [
          'Component testing with React Testing Library',
          'Snapshot testing',
          'Integration testing',
          'Visual regression testing'
        ]
      }
    });

    // Express.js enhancements
    this.frameworkSpecificEnhancements.set('express', {
      architectural: {
        patterns: [
          'MVC architecture',
          'Middleware pattern',
          'Router pattern',
          'Service layer pattern'
        ],
        bestPractices: [
          'Proper error handling middleware',
          'Request validation',
          'Response formatting',
          'Logging and monitoring'
        ]
      },
      security: {
        middleware: [
          'Helmet for security headers',
          'CORS configuration',
          'Rate limiting',
          'Input validation'
        ],
        vulnerabilities: [
          'NoSQL injection',
          'Parameter pollution',
          'Prototype pollution',
          'Path traversal'
        ]
      },
      performance: {
        optimizations: [
          'Response compression',
          'Caching strategies',
          'Connection pooling',
          'Asynchronous operations'
        ]
      }
    });

    // Spring Boot enhancements
    this.frameworkSpecificEnhancements.set('spring-boot', {
      architectural: {
        patterns: [
          'Dependency injection',
          'Aspect-oriented programming',
          'Repository pattern',
          'Service layer pattern'
        ],
        bestPractices: [
          'Use Spring profiles',
          'Implement proper exception handling',
          'Use Spring Security',
          'Follow REST conventions'
        ]
      },
      security: {
        features: [
          'Spring Security configuration',
          'OAuth2 integration',
          'JWT token handling',
          'Method-level security'
        ]
      },
      performance: {
        optimizations: [
          'Connection pooling',
          'Caching with Spring Cache',
          'Async processing',
          'Database optimization'
        ]
      }
    });
  }

  private initializeArchitectureEnhancements(): void {
    // Microservices architecture
    this.architectureSpecificEnhancements.set('microservices', {
      patterns: [
        'Service discovery',
        'Circuit breaker pattern',
        'API gateway pattern',
        'Event sourcing'
      ],
      concerns: [
        'Service communication',
        'Data consistency',
        'Distributed tracing',
        'Service mesh'
      ],
      testing: [
        'Contract testing',
        'Service virtualization',
        'Chaos engineering',
        'End-to-end testing'
      ]
    });

    // Monolithic architecture
    this.architectureSpecificEnhancements.set('monolithic', {
      patterns: [
        'Layered architecture',
        'Modular monolith',
        'Hexagonal architecture',
        'Clean architecture'
      ],
      concerns: [
        'Module boundaries',
        'Dependency management',
        'Scalability planning',
        'Deployment strategies'
      ],
      testing: [
        'Integration testing',
        'Component testing',
        'System testing',
        'Performance testing'
      ]
    });

    // Serverless architecture
    this.architectureSpecificEnhancements.set('serverless', {
      patterns: [
        'Function as a Service',
        'Event-driven architecture',
        'Backend as a Service',
        'Stateless design'
      ],
      concerns: [
        'Cold start optimization',
        'Function composition',
        'State management',
        'Vendor lock-in'
      ],
      testing: [
        'Unit testing',
        'Integration testing',
        'Load testing',
        'Chaos testing'
      ]
    });
  }

  private async applyLanguageEnhancements(
    prompt: string,
    language: string,
    analysisType: AnalysisType
  ): Promise<string> {
    const enhancement = this.languageSpecificEnhancements.get(language.toLowerCase());
    if (!enhancement) return prompt;

    const languageGuidance = this.buildLanguageGuidance(enhancement, analysisType);
    
    return prompt + `\n\n## ${language.toUpperCase()} SPECIFIC GUIDANCE\n${languageGuidance}`;
  }

  private async applyFrameworkEnhancements(
    prompt: string,
    framework: string,
    analysisType: AnalysisType
  ): Promise<string> {
    const enhancement = this.frameworkSpecificEnhancements.get(framework.toLowerCase());
    if (!enhancement) return prompt;

    const frameworkGuidance = this.buildFrameworkGuidance(enhancement, analysisType);
    
    return prompt + `\n\n## ${framework.toUpperCase()} SPECIFIC GUIDANCE\n${frameworkGuidance}`;
  }

  private async applyArchitectureEnhancements(
    prompt: string,
    architecture: string,
    analysisType: AnalysisType
  ): Promise<string> {
    const enhancement = this.architectureSpecificEnhancements.get(architecture.toLowerCase());
    if (!enhancement) return prompt;

    const architectureGuidance = this.buildArchitectureGuidance(enhancement, analysisType);
    
    return prompt + `\n\n## ${architecture.toUpperCase()} ARCHITECTURE GUIDANCE\n${architectureGuidance}`;
  }

  private async applyChangeSpecificEnhancements(
    prompt: string,
    changeClassification: ChangeClassification,
    analysisType: AnalysisType
  ): Promise<string> {
    const changeGuidance = this.buildChangeSpecificGuidance(changeClassification, analysisType);
    
    return prompt + `\n\n## CHANGE-SPECIFIC ANALYSIS FOCUS\n${changeGuidance}`;
  }

  private async applyRepositorySizeEnhancements(
    prompt: string,
    repositorySize: any,
    analysisType: AnalysisType
  ): Promise<string> {
    const sizeGuidance = this.buildRepositorySizeGuidance(repositorySize, analysisType);
    
    return prompt + `\n\n## REPOSITORY SIZE CONSIDERATIONS\n${sizeGuidance}`;
  }

  private buildLanguageGuidance(enhancement: LanguageEnhancement, analysisType: AnalysisType): string {
    // Handle code-quality as architectural for now
    const actualType = analysisType === 'code-quality' ? 'architectural' : analysisType;
    const guidance = enhancement[actualType as keyof LanguageEnhancement];
    if (!guidance) return '';

    let result = '';

    // Type-safe property access
    if ('patterns' in guidance && guidance.patterns) {
      result += `**Common Patterns**: ${guidance.patterns.join(', ')}\n`;
    }

    if ('bestPractices' in guidance && guidance.bestPractices) {
      result += `**Best Practices**:\n${guidance.bestPractices.map((p: string) => `- ${p}`).join('\n')}\n`;
    }

    if ('commonIssues' in guidance && guidance.commonIssues) {
      result += `**Common Issues to Look For**:\n${guidance.commonIssues.map((i: string) => `- ${i}`).join('\n')}\n`;
    }

    if ('vulnerabilities' in guidance && guidance.vulnerabilities) {
      result += `**Security Vulnerabilities**:\n${guidance.vulnerabilities.map((v: string) => `- ${v}`).join('\n')}\n`;
    }

    if ('optimizations' in guidance && guidance.optimizations) {
      result += `**Performance Optimizations**:\n${guidance.optimizations.map((o: string) => `- ${o}`).join('\n')}\n`;
    }

    if ('strategies' in guidance && guidance.strategies) {
      result += `**Testing Strategies**:\n${guidance.strategies.map((s: string) => `- ${s}`).join('\n')}\n`;
    }

    return result;
  }

  private buildFrameworkGuidance(enhancement: FrameworkEnhancement, analysisType: AnalysisType): string {
    let result = '';

    if (enhancement.architectural) {
      result += `**Architectural Patterns**: ${enhancement.architectural.patterns.join(', ')}\n`;
      if (enhancement.architectural.bestPractices) {
        result += `**Best Practices**:\n${enhancement.architectural.bestPractices.map(p => `- ${p}`).join('\n')}\n`;
      }
    }

    if (enhancement.security && analysisType === 'security') {
      if (enhancement.security.middleware) {
        result += `**Security Middleware**: ${enhancement.security.middleware.join(', ')}\n`;
      }
      if (enhancement.security.vulnerabilities) {
        result += `**Framework Vulnerabilities**:\n${enhancement.security.vulnerabilities.map(v => `- ${v}`).join('\n')}\n`;
      }
    }

    if (enhancement.performance && analysisType === 'performance') {
      result += `**Performance Optimizations**:\n${enhancement.performance.optimizations.map(o => `- ${o}`).join('\n')}\n`;
      if (enhancement.performance.antiPatterns) {
        result += `**Anti-patterns to Avoid**:\n${enhancement.performance.antiPatterns.map(a => `- ${a}`).join('\n')}\n`;
      }
    }

    return result;
  }

  private buildArchitectureGuidance(enhancement: ArchitectureEnhancement, analysisType: AnalysisType): string {
    let result = '';

    result += `**Architectural Patterns**: ${enhancement.patterns.join(', ')}\n`;
    result += `**Key Concerns**: ${enhancement.concerns.join(', ')}\n`;
    
    if (analysisType === 'testing') {
      result += `**Testing Strategies**: ${enhancement.testing.join(', ')}\n`;
    }

    return result;
  }

  private buildChangeSpecificGuidance(changeClassification: ChangeClassification, analysisType: AnalysisType): string {
    let result = `**Change Type**: ${changeClassification.type}\n`;

    // Add analysis focus based on change type
    switch (changeClassification.type) {
      case 'feature':
        result += `**Focus Areas**: New functionality testing, integration points, user experience impact\n`;
        break;
      case 'bugfix':
        result += `**Focus Areas**: Root cause analysis, regression testing, edge case validation\n`;
        break;
      case 'refactor':
        result += `**Focus Areas**: Behavior preservation, performance impact, maintainability improvement\n`;
        break;
      default:
        result += `**Focus Areas**: General code quality, maintainability, performance\n`;
    }

    return result;
  }

  private buildRepositorySizeGuidance(repositorySize: any, analysisType: AnalysisType): string {
    let result = '';

    // Adjust analysis depth based on repository size
    if (repositorySize === 'large') {
      result += `**Large Repository Considerations**:
- Focus on modular architecture and clear boundaries
- Emphasize performance and scalability
- Consider microservice extraction opportunities
- Pay attention to build and deployment complexity\n`;
    } else if (repositorySize === 'medium') {
      result += `**Medium Repository Considerations**:
- Balance between simplicity and scalability
- Focus on maintainable architecture
- Consider future growth patterns
- Optimize for team collaboration\n`;
    } else {
      result += `**Small Repository Considerations**:
- Keep architecture simple and focused
- Avoid over-engineering
- Focus on rapid development and iteration
- Ensure good test coverage\n`;
    }

    return result;
  }
}

// Supporting interfaces
interface LanguageEnhancement {
  architectural?: {
    patterns: string[];
    bestPractices: string[];
    commonIssues: string[];
  };
  security?: {
    vulnerabilities: string[];
    bestPractices: string[];
  };
  performance?: {
    optimizations: string[];
    commonBottlenecks: string[];
  };
  testing?: {
    strategies: string[];
    patterns: string[];
  };
}

interface FrameworkEnhancement {
  architectural?: {
    patterns: string[];
    bestPractices?: string[];
    stateManagement?: string[];
  };
  security?: {
    middleware?: string[];
    vulnerabilities?: string[];
    features?: string[];
  };
  performance?: {
    optimizations: string[];
    antiPatterns?: string[];
  };
  testing?: {
    strategies: string[];
  };
}

interface ArchitectureEnhancement {
  patterns: string[];
  concerns: string[];
  testing: string[];
}
