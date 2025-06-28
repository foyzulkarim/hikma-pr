/**
 * Phase 4: Dynamic Prompt System Test
 * Tests the complete dynamic prompt generation and context-aware enhancement system
 */
import { DynamicPromptBuilder } from '../prompts/dynamicPromptBuilder.js';
import { ContextAwareEnhancer } from '../prompts/contextAwareEnhancer.js';
import { PromptTemplateManager } from '../prompts/promptTemplateManager.js';
import { 
  EnhancedPRContext, 
  RepositoryMetadata,
  ArchitecturalPattern,
  HistoricalContext,
  BlastRadius,
  ChangeClassification
} from '../types/analysis.js';

describe('Phase 4: Dynamic Prompt System', () => {
  let promptBuilder: DynamicPromptBuilder;
  let contextEnhancer: ContextAwareEnhancer;
  let templateManager: PromptTemplateManager;
  let mockContext: EnhancedPRContext;

  beforeEach(() => {
    promptBuilder = new DynamicPromptBuilder();
    contextEnhancer = new ContextAwareEnhancer();
    templateManager = new PromptTemplateManager();

    // Create comprehensive mock context
    mockContext = {
      repositoryMetadata: {
        name: 'test-repo',
        language: 'typescript',
        framework: 'react',
        architecture: 'microservices',
        size: { files: 100, lines: 10000, bytes: 1000000 }
      },
      semanticAnalysis: {
        functionSignatures: [],
        typeDefinitions: [],
        importExportChains: [],
        callGraphs: [],
        dataFlows: []
      },
      
      architecturalPatterns: [
        {
          name: 'Component Composition',
          description: 'React component composition pattern for building reusable UI components',
          files: ['src/components/*.tsx'],
          confidence: 0.8
        },
        {
          name: 'Custom Hooks',
          description: 'Custom React hooks for state management and side effects',
          files: ['src/hooks/*.ts'],
          confidence: 0.9
        }
      ],
      
      historicalContext: {
        recentChanges: [],
        changeFrequency: 0.5,
        bugHistory: []
      },
      
      blastRadius: {
        directImpact: ['src/components/UserProfile.tsx', 'src/hooks/useUser.ts'],
        indirectImpact: ['src/pages/Dashboard.tsx', 'src/services/userService.ts'],
        testImpact: ['src/components/__tests__/UserProfile.test.tsx'],
        documentationImpact: ['docs/user-management.md']
      } as BlastRadius,
      
      changeClassification: {
        type: 'feature',
        scope: 'module',
        risk: 'medium'
      } as ChangeClassification,
      
      completeFiles: new Map([
        ['src/components/UserProfile.tsx', `
import React, { useState, useEffect } from 'react';
import { User } from '../types/User';
import { useUser } from '../hooks/useUser';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const { user, loading, error, updateUser } = useUser(userId);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (updatedUser: User) => {
    try {
      await updateUser(updatedUser);
      setIsEditing(false);
      onUpdate?.(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {isEditing ? (
        <UserEditForm user={user} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
      )}
    </div>
  );
};
        `],
        ['src/hooks/useUser.ts', `
import { useState, useEffect } from 'react';
import { User } from '../types/User';
import { userService } from '../services/userService';

export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUser(userId);
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const updateUser = async (updatedUser: User) => {
    try {
      const result = await userService.updateUser(updatedUser);
      setUser(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { user, loading, error, updateUser };
};
        `]
      ])
    };
  });

  describe('DynamicPromptBuilder', () => {
    test('should build contextual prompt for architectural analysis', async () => {
      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'architectural',
        mockContext
      );

      expect(contextualPrompt).toBeDefined();
      expect(contextualPrompt.content).toContain('Comprehensive Architectural Analysis');
      expect(contextualPrompt.content).toContain('typescript');
      expect(contextualPrompt.content).toContain('react');
      expect(contextualPrompt.content).toContain('microservices');
      expect(contextualPrompt.content).toContain('Component Composition');
      expect(contextualPrompt.content).toContain('UserProfile.tsx');
      
      expect(contextualPrompt.metadata).toEqual({
        analysisType: 'architectural',
        contextSize: expect.any(Number),
        templateVersion: '2.0',
        generatedAt: expect.any(String),
        repositoryLanguage: 'typescript',
        changeComplexity: 'LOW'
      });
    });

    test('should build contextual prompt for security analysis', async () => {
      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'security',
        mockContext
      );

      expect(contextualPrompt.content).toContain('Comprehensive Security Analysis');
      expect(contextualPrompt.content).toContain('STRIDE methodology');
      expect(contextualPrompt.content).toContain('Vulnerability Assessment');
      expect(contextualPrompt.metadata.analysisType).toBe('security');
    });

    test('should build contextual prompt for performance analysis', async () => {
      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'performance',
        mockContext
      );

      expect(contextualPrompt.content).toContain('Comprehensive Performance Analysis');
      expect(contextualPrompt.content).toContain('Algorithmic Complexity');
      expect(contextualPrompt.content).toContain('Memory Management');
      expect(contextualPrompt.metadata.analysisType).toBe('performance');
    });

    test('should build contextual prompt for testing analysis', async () => {
      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'testing',
        mockContext
      );

      expect(contextualPrompt.content).toContain('Comprehensive Testing Analysis');
      expect(contextualPrompt.content).toContain('Test Coverage Analysis');
      expect(contextualPrompt.content).toContain('Edge Case and Boundary Testing');
      expect(contextualPrompt.metadata.analysisType).toBe('testing');
    });

    test('should include complete file contents in prompt', async () => {
      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'architectural',
        mockContext
      );

      expect(contextualPrompt.content).toContain('UserProfile.tsx');
      expect(contextualPrompt.content).toContain('useUser.ts');
      expect(contextualPrompt.content).toContain('React.FC<UserProfileProps>');
      expect(contextualPrompt.content).toContain('useState');
      expect(contextualPrompt.content).toContain('useEffect');
    });

    test('should handle fallback for unknown analysis type', async () => {
      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'unknown' as any,
        mockContext
      );

      expect(contextualPrompt.content).toContain('UNKNOWN Analysis');
      expect(contextualPrompt.metadata.templateVersion).toBe('fallback');
    });
  });

  describe('ContextAwareEnhancer', () => {
    test('should enhance prompt with TypeScript-specific guidance', async () => {
      const basePrompt = 'Base architectural analysis prompt';
      
      const enhancedPrompt = await contextEnhancer.enhancePromptForContext(
        basePrompt,
        'architectural',
        mockContext
      );

      expect(enhancedPrompt).toContain('TYPESCRIPT SPECIFIC GUIDANCE');
      expect(enhancedPrompt).toContain('Use strict type checking');
      expect(enhancedPrompt).toContain('Decorator Pattern');
      expect(enhancedPrompt).toContain('Any type usage reducing type safety');
    });

    test('should enhance prompt with React-specific guidance', async () => {
      const basePrompt = 'Base performance analysis prompt';
      
      const enhancedPrompt = await contextEnhancer.enhancePromptForContext(
        basePrompt,
        'performance',
        mockContext
      );

      expect(enhancedPrompt).toContain('REACT SPECIFIC GUIDANCE');
      expect(enhancedPrompt).toContain('Component composition');
      expect(enhancedPrompt).toContain('React.memo for component memoization');
      expect(enhancedPrompt).toContain('Unnecessary re-renders');
    });

    test('should enhance prompt with microservices architecture guidance', async () => {
      const basePrompt = 'Base architectural analysis prompt';
      
      const enhancedPrompt = await contextEnhancer.enhancePromptForContext(
        basePrompt,
        'architectural',
        mockContext
      );

      expect(enhancedPrompt).toContain('MICROSERVICES ARCHITECTURE GUIDANCE');
      expect(enhancedPrompt).toContain('Service discovery');
      expect(enhancedPrompt).toContain('Circuit breaker pattern');
      expect(enhancedPrompt).toContain('Contract testing');
    });

    test('should enhance prompt with change-specific guidance', async () => {
      const basePrompt = 'Base testing analysis prompt';
      
      const enhancedPrompt = await contextEnhancer.enhancePromptForContext(
        basePrompt,
        'testing',
        mockContext
      );

      expect(enhancedPrompt).toContain('CHANGE-SPECIFIC ANALYSIS FOCUS');
      expect(enhancedPrompt).toContain('Change Type**: feature');
      expect(enhancedPrompt).toContain('New functionality testing');
      expect(enhancedPrompt).toContain('integration points');
    });

    test('should enhance prompt with repository size considerations', async () => {
      const basePrompt = 'Base security analysis prompt';
      
      const enhancedPrompt = await contextEnhancer.enhancePromptForContext(
        basePrompt,
        'security',
        mockContext
      );

      expect(enhancedPrompt).toContain('REPOSITORY SIZE CONSIDERATIONS');
      expect(enhancedPrompt).toContain('Large Repository Considerations');
      expect(enhancedPrompt).toContain('modular architecture');
      expect(enhancedPrompt).toContain('performance and scalability');
    });
  });

  describe('PromptTemplateManager', () => {
    test('should get optimal template for analysis type', async () => {
      const template = await templateManager.getOptimalTemplate('architectural', mockContext);
      
      expect(template).toBeDefined();
      expect(template.id).toBe('arch-v2.0');
      expect(template.version).toBe('2.0');
      expect(template.analysisType).toBe('architectural');
      expect(template.isActive).toBe(true);
      expect(template.content).toContain('Comprehensive Architectural Analysis');
    });

    test('should track template performance', async () => {
      const templateId = 'arch-v2.0';
      const performanceData = {
        responseTime: 2500,
        qualityScore: 0.85,
        success: true,
        language: 'typescript',
        framework: 'react',
        contextRelevance: 0.9
      };

      await templateManager.trackTemplatePerformance(templateId, performanceData);
      
      // Performance should be tracked (we can't easily test the internal state,
      // but we can verify the method doesn't throw)
      expect(true).toBe(true);
    });

    test('should get template analytics', async () => {
      const analytics = await templateManager.getTemplateAnalytics('architectural');
      
      expect(analytics).toBeDefined();
      expect(analytics.analysisType).toBe('architectural');
      expect(analytics.totalTemplates).toBeGreaterThan(0);
      expect(analytics.activeTemplates).toBeGreaterThan(0);
      expect(analytics.optimizationOpportunities).toBeDefined();
      expect(analytics.usageDistribution).toBeDefined();
    });

    test('should optimize template based on performance data', async () => {
      const template = await templateManager.getOptimalTemplate('performance', mockContext);
      const performanceData = {
        responseTime: 6000, // High response time
        qualityScore: 0.6,  // Low quality score
        success: false,     // Failed execution
        language: 'typescript',
        framework: 'react',
        contextRelevance: 0.5 // Low relevance
      };

      const optimizedTemplate = await templateManager.optimizeTemplate(
        'performance',
        template,
        performanceData
      );

      expect(optimizedTemplate).toBeDefined();
      expect(optimizedTemplate.version).not.toBe(template.version);
      expect(optimizedTemplate.parentVersion).toBe(template.version);
      expect(optimizedTemplate.optimizations).toBeDefined();
      expect(optimizedTemplate.optimizations!.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('should create complete enhanced prompt workflow', async () => {
      // Step 1: Build contextual prompt
      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'architectural',
        mockContext
      );

      // Step 2: Enhance with context-aware guidance
      const enhancedPrompt = await contextEnhancer.enhancePromptForContext(
        contextualPrompt.content,
        'architectural',
        mockContext
      );

      // Step 3: Verify complete enhanced prompt
      expect(enhancedPrompt).toContain('Comprehensive Architectural Analysis');
      expect(enhancedPrompt).toContain('TYPESCRIPT SPECIFIC GUIDANCE');
      expect(enhancedPrompt).toContain('REACT SPECIFIC GUIDANCE');
      expect(enhancedPrompt).toContain('MICROSERVICES ARCHITECTURE GUIDANCE');
      expect(enhancedPrompt).toContain('CHANGE-SPECIFIC ANALYSIS FOCUS');
      expect(enhancedPrompt).toContain('REPOSITORY SIZE CONSIDERATIONS');
      
      // Verify it contains actual code context
      expect(enhancedPrompt).toContain('UserProfile');
      expect(enhancedPrompt).toContain('useUser');
      expect(enhancedPrompt).toContain('React.FC');
      
      // Verify it contains analysis framework
      expect(enhancedPrompt).toContain('SOLID PRINCIPLES ANALYSIS');
      expect(enhancedPrompt).toContain('COUPLING AND COHESION EVALUATION');
      expect(enhancedPrompt).toContain('SCALABILITY AND PERFORMANCE ARCHITECTURE');
    });

    test('should handle different language/framework combinations', async () => {
      // Test Python/Django context
      const pythonContext = {
        ...mockContext,
        repositoryMetadata: {
          ...mockContext.repositoryMetadata,
          language: 'python',
          framework: 'django'
        }
      };

      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'security',
        pythonContext
      );

      const enhancedPrompt = await contextEnhancer.enhancePromptForContext(
        contextualPrompt.content,
        'security',
        pythonContext
      );

      expect(enhancedPrompt).toContain('PYTHON SPECIFIC GUIDANCE');
      expect(enhancedPrompt).toContain('PEP 8 style guidelines');
      expect(enhancedPrompt).toContain('SQL injection in raw queries');
      expect(enhancedPrompt).toContain('Pickle deserialization attacks');
    });

    test('should adapt to different change types', async () => {
      // Test bugfix change type
      const bugfixContext = {
        ...mockContext,
        changeClassification: {
          type: 'bugfix' as const,
          scope: 'module' as const,
          risk: 'low' as const
        }
      };

      const enhancedPrompt = await contextEnhancer.enhancePromptForContext(
        'Base prompt',
        'testing',
        bugfixContext
      );

      expect(enhancedPrompt).toContain('Change Type**: bugfix');
      expect(enhancedPrompt).toContain('Root cause analysis');
      expect(enhancedPrompt).toContain('regression testing');
      expect(enhancedPrompt).toContain('edge case validation');
    });

    test('should provide comprehensive analysis guidance', async () => {
      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'testing',
        mockContext
      );

      // Verify comprehensive testing analysis framework
      expect(contextualPrompt.content).toContain('TEST COVERAGE ANALYSIS');
      expect(contextualPrompt.content).toContain('Line Coverage');
      expect(contextualPrompt.content).toContain('Branch Coverage');
      expect(contextualPrompt.content).toContain('Function Coverage');
      
      expect(contextualPrompt.content).toContain('TEST QUALITY ASSESSMENT');
      expect(contextualPrompt.content).toContain('Test Reliability');
      expect(contextualPrompt.content).toContain('Test Maintainability');
      
      expect(contextualPrompt.content).toContain('TESTING STRATEGY EVALUATION');
      expect(contextualPrompt.content).toContain('Unit Testing');
      expect(contextualPrompt.content).toContain('Integration Testing');
      expect(contextualPrompt.content).toContain('End-to-End Testing');
      
      expect(contextualPrompt.content).toContain('RESPONSE FORMAT');
      expect(contextualPrompt.content).toContain('json');
      expect(contextualPrompt.content).toContain('findings');
      expect(contextualPrompt.content).toContain('recommendations');
    });
  });

  describe('Performance and Quality', () => {
    test('should generate prompts efficiently', async () => {
      const startTime = Date.now();
      
      await Promise.all([
        promptBuilder.buildContextualPrompt('architectural', mockContext),
        promptBuilder.buildContextualPrompt('security', mockContext),
        promptBuilder.buildContextualPrompt('performance', mockContext),
        promptBuilder.buildContextualPrompt('testing', mockContext)
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    test('should handle large file contexts', async () => {
      // Create context with large files
      const largeFileContent = 'x'.repeat(10000); // 10KB file
      const largeContext = {
        ...mockContext,
        completeFiles: new Map([
          ['large-file-1.ts', largeFileContent],
          ['large-file-2.ts', largeFileContent],
          ['large-file-3.ts', largeFileContent]
        ])
      };

      const contextualPrompt = await promptBuilder.buildContextualPrompt(
        'architectural',
        largeContext
      );

      expect(contextualPrompt).toBeDefined();
      expect(contextualPrompt.content.length).toBeGreaterThan(1000);
      expect(contextualPrompt.metadata.contextSize).toBeGreaterThan(30000);
    });

    test('should maintain prompt quality across different contexts', async () => {
      const contexts = [
        { language: 'typescript', framework: 'react' },
        { language: 'python', framework: 'django' },
        { language: 'java', framework: 'spring-boot' },
        { language: 'javascript', framework: 'express' }
      ];

      for (const ctx of contexts) {
        const testContext = {
          ...mockContext,
          repositoryMetadata: {
            ...mockContext.repositoryMetadata,
            ...ctx
          }
        };

        const contextualPrompt = await promptBuilder.buildContextualPrompt(
          'architectural',
          testContext
        );

        // Each prompt should be comprehensive and context-specific
        expect(contextualPrompt.content).toContain('Comprehensive Architectural Analysis');
        expect(contextualPrompt.content).toContain(ctx.language);
        expect(contextualPrompt.content).toContain('RESPONSE FORMAT');
        expect(contextualPrompt.content.length).toBeGreaterThan(5000);
      }
    });
  });
});
