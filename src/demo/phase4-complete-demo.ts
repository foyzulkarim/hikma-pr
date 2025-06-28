/**
 * Phase 4: Complete Dynamic Prompt System Demonstration
 * Shows the full workflow of context-aware prompt generation
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
  ChangeClassification,
  AnalysisType
} from '../types/analysis.js';

export class Phase4CompleteDemo {
  private promptBuilder: DynamicPromptBuilder;
  private contextEnhancer: ContextAwareEnhancer;
  private templateManager: PromptTemplateManager;

  constructor() {
    this.promptBuilder = new DynamicPromptBuilder();
    this.contextEnhancer = new ContextAwareEnhancer();
    this.templateManager = new PromptTemplateManager();
  }

  async demonstrateCompleteWorkflow(): Promise<void> {
    console.log('\n🚀 Phase 4: Dynamic Prompt System - Complete Demonstration\n');
    console.log('=' .repeat(80));

    // Create comprehensive test contexts for different scenarios
    const scenarios = [
      this.createReactTypeScriptScenario(),
      this.createPythonDjangoScenario(),
      this.createJavaSpringScenario(),
      this.createNodeExpressScenario()
    ];

    const analysisTypes: AnalysisType[] = ['architectural', 'security', 'performance', 'testing'];

    for (const scenario of scenarios) {
      await this.demonstrateScenario(scenario, analysisTypes);
    }

    console.log('\n🎯 Demonstrating Template Management...');
    await this.demonstrateTemplateManagement();

    console.log('\n✅ Phase 4 Complete Demonstration Finished!');
    console.log('=' .repeat(80));
  }

  private async demonstrateScenario(
    context: EnhancedPRContext, 
    analysisTypes: AnalysisType[]
  ): Promise<void> {
    const { language, framework, architecture } = context.repositoryMetadata;
    
    console.log(`\n📋 Scenario: ${language.toUpperCase()} + ${framework.toUpperCase()} (${architecture})`);
    console.log('-'.repeat(60));

    for (const analysisType of analysisTypes) {
      console.log(`\n🔍 ${analysisType.toUpperCase()} Analysis:`);
      
      try {
        // Step 1: Build contextual prompt
        console.log('  1️⃣ Building contextual prompt...');
        const startTime = Date.now();
        const contextualPrompt = await this.promptBuilder.buildContextualPrompt(
          analysisType,
          context
        );
        const buildTime = Date.now() - startTime;

        // Step 2: Enhance with context-aware guidance
        console.log('  2️⃣ Enhancing with context-aware guidance...');
        const enhanceStartTime = Date.now();
        const enhancedPrompt = await this.contextEnhancer.enhancePromptForContext(
          contextualPrompt.content,
          analysisType,
          context
        );
        const enhanceTime = Date.now() - enhanceStartTime;

        // Step 3: Get optimal template
        console.log('  3️⃣ Getting optimal template...');
        const template = await this.templateManager.getOptimalTemplate(analysisType, context);

        // Display results
        console.log(`     ✅ Generated in ${buildTime + enhanceTime}ms`);
        console.log(`     📏 Prompt length: ${enhancedPrompt.length.toLocaleString()} characters`);
        console.log(`     🎯 Template: ${template.id} (v${template.version})`);
        console.log(`     🧠 Context size: ${contextualPrompt.metadata.contextSize.toLocaleString()} bytes`);
        console.log(`     🔧 Complexity: ${contextualPrompt.metadata.changeComplexity}`);

        // Analyze prompt content
        const contentAnalysis = this.analyzePromptContent(enhancedPrompt, language, framework);
        console.log(`     📊 Content analysis: ${contentAnalysis.join(', ')}`);

        // Simulate performance tracking
        await this.simulatePerformanceTracking(template.id, language, framework);

      } catch (error) {
        console.log(`     ❌ Error: ${(error as Error).message}`);
      }
    }
  }

  private async demonstrateTemplateManagement(): Promise<void> {
    console.log('\n📈 Template Analytics:');
    
    const analysisTypes: AnalysisType[] = ['architectural', 'security', 'performance', 'testing'];
    
    for (const analysisType of analysisTypes) {
      const analytics = await this.templateManager.getTemplateAnalytics(analysisType);
      
      console.log(`\n  ${analysisType.toUpperCase()}:`);
      console.log(`    📊 Total templates: ${analytics.totalTemplates}`);
      console.log(`    ✅ Active templates: ${analytics.activeTemplates}`);
      console.log(`    📈 Average performance: ${(analytics.averagePerformance * 100).toFixed(1)}%`);
      console.log(`    🏆 Best template: ${analytics.bestPerformingTemplate?.id || 'N/A'}`);
      console.log(`    🔧 Optimization opportunities: ${analytics.optimizationOpportunities.length}`);
      
      if (analytics.optimizationOpportunities.length > 0) {
        console.log(`    💡 Top opportunity: ${analytics.optimizationOpportunities[0].description}`);
      }
    }
  }

  private async simulatePerformanceTracking(
    templateId: string, 
    language: string, 
    framework: string
  ): Promise<void> {
    // Simulate realistic performance data
    const performanceData = {
      responseTime: Math.random() * 3000 + 1000, // 1-4 seconds
      qualityScore: Math.random() * 0.3 + 0.7,   // 0.7-1.0
      success: Math.random() > 0.1,              // 90% success rate
      language,
      framework,
      contextRelevance: Math.random() * 0.2 + 0.8 // 0.8-1.0
    };

    await this.templateManager.trackTemplatePerformance(templateId, performanceData);
  }

  private analyzePromptContent(prompt: string, language: string, framework: string): string[] {
    const analysis: string[] = [];
    
    // Check for language-specific content
    if (prompt.toLowerCase().includes(language.toLowerCase())) {
      analysis.push(`${language} guidance`);
    }
    
    // Check for framework-specific content
    if (prompt.toLowerCase().includes(framework.toLowerCase())) {
      analysis.push(`${framework} patterns`);
    }
    
    // Check for comprehensive analysis sections
    if (prompt.includes('COMPREHENSIVE') || prompt.includes('ANALYSIS FRAMEWORK')) {
      analysis.push('comprehensive framework');
    }
    
    // Check for specific guidance sections
    if (prompt.includes('SPECIFIC GUIDANCE')) {
      analysis.push('context-aware guidance');
    }
    
    // Check for response format
    if (prompt.includes('RESPONSE FORMAT') && prompt.includes('json')) {
      analysis.push('structured output');
    }
    
    return analysis.length > 0 ? analysis : ['basic prompt'];
  }

  // Test scenario creators
  private createReactTypeScriptScenario(): EnhancedPRContext {
    return {
      repositoryMetadata: {
        name: 'hikma-pr',
        language: 'typescript',
        framework: 'react',
        architecture: 'microservices',
        size: {
          files: 100,
          lines: 10000,
          bytes: 1000000
        }
      } as RepositoryMetadata,
      
      architecturalPatterns: [
        {
          name: 'Component Composition',
          description: 'React component composition pattern for building reusable UI components',
          files: ['src/components/UserProfile.tsx'],
          confidence: 0.9
        },
        {
          name: 'Custom Hooks',
          description: 'Custom React hooks for state management and side effects',
          files: ['src/hooks/useUser.ts'],
          confidence: 0.95
        },
        {
          name: 'Context API',
          description: 'React Context API for global state management',
          files: [],
          confidence: 0.8
        }
      ] as ArchitecturalPattern[],
      
      historicalContext: {
        recentChanges: [],
        changeFrequency: 0,
        bugHistory: []
      } as HistoricalContext,
      
      blastRadius: {
        directImpact: ['src/components/UserProfile.tsx', 'src/hooks/useUser.ts'],
        indirectImpact: ['src/pages/Dashboard.tsx', 'src/services/userService.ts'],
        testImpact: ['src/components/__tests__/UserProfile.test.tsx'],
        documentationImpact: ['docs/user-management.md'],
        migrationImpact: [],
        configurationImpact: []
      } as BlastRadius,
      
      changeClassification: {
        type: 'feature',
        scope: 'module',
        risk: 'low'
      } as ChangeClassification,
      
      completeFiles: new Map([
        ['src/components/UserProfile.tsx', this.getSampleReactComponent()],
        ['src/hooks/useUser.ts', this.getSampleCustomHook()]
      ]),
      semanticAnalysis: {
        functionSignatures: [],
        typeDefinitions: [],
        importExportChains: [],
        callGraphs: [],
        dataFlows: []
      }
    };
  }

  private createPythonDjangoScenario(): EnhancedPRContext {
    return {
      repositoryMetadata: {
        name: 'django-app',
        language: 'python',
        framework: 'django',
        architecture: 'monolithic',
        size: {
          files: 50,
          lines: 5000,
          bytes: 500000
        }
      } as RepositoryMetadata,
      
      architecturalPatterns: [
        {
          name: 'Model-View-Template',
          description: 'Django MVT pattern for web application structure',
          files: ['users/views.py'],
          confidence: 0.95
        },
        {
          name: 'Django REST Framework',
          description: 'RESTful API development with Django REST Framework',
          files: ['users/views.py'],
          confidence: 0.9
        }
      ] as ArchitecturalPattern[],
      
      historicalContext: {
        recentChanges: [],
        changeFrequency: 0,
        bugHistory: []
      } as HistoricalContext,
      
      blastRadius: {
        directImpact: ['users/models.py', 'users/views.py'],
        indirectImpact: ['users/serializers.py', 'users/urls.py'],
        testImpact: ['users/tests.py'],
        documentationImpact: ['docs/api.md'],
        migrationImpact: [],
        configurationImpact: []
      } as BlastRadius,
      
      changeClassification: {
        type: 'bugfix',
        scope: 'module',
        risk: 'medium'
      } as ChangeClassification,
      
      completeFiles: new Map([
        ['users/models.py', this.getSampleDjangoModel()],
        ['users/views.py', this.getSampleDjangoView()]
      ]),
      semanticAnalysis: {
        functionSignatures: [],
        typeDefinitions: [],
        importExportChains: [],
        callGraphs: [],
        dataFlows: []
      }
    };
  }

  private createJavaSpringScenario(): EnhancedPRContext {
    return {
      repositoryMetadata: {
        name: 'spring-app',
        language: 'java',
        framework: 'spring-boot',
        architecture: 'microservices',
        size: {
          files: 200,
          lines: 20000,
          bytes: 2000000
        }
      } as RepositoryMetadata,
      
      architecturalPatterns: [
        {
          name: 'Dependency Injection',
          description: 'Spring dependency injection for loose coupling',
          files: ['src/main/java/com/example/UserController.java'],
          confidence: 0.98
        },
        {
          name: 'Repository Pattern',
          description: 'Data access layer abstraction with Spring Data',
          files: [],
          confidence: 0.9
        }
      ] as ArchitecturalPattern[],
      
      historicalContext: {
        recentChanges: [],
        changeFrequency: 0,
        bugHistory: []
      } as HistoricalContext,
      
      blastRadius: {
        directImpact: ['src/main/java/com/example/UserController.java'],
        indirectImpact: ['src/main/java/com/example/UserService.java'],
        testImpact: ['src/test/java/com/example/UserControllerTest.java'],
        documentationImpact: ['README.md'],
        migrationImpact: [],
        configurationImpact: []
      } as BlastRadius,
      
      changeClassification: {
        type: 'refactor',
        scope: 'system',
        risk: 'high'
      } as ChangeClassification,
      
      completeFiles: new Map([
        ['src/main/java/com/example/UserController.java', this.getSampleSpringController()]
      ]),
      semanticAnalysis: {
        functionSignatures: [],
        typeDefinitions: [],
        importExportChains: [],
        callGraphs: [],
        dataFlows: []
      }
    };
  }

  private createNodeExpressScenario(): EnhancedPRContext {
    return {
      repositoryMetadata: {
        name: 'express-api',
        language: 'javascript',
        framework: 'express',
        architecture: 'serverless',
        size: {
          files: 20,
          lines: 2000,
          bytes: 200000
        }
      } as RepositoryMetadata,
      
      architecturalPatterns: [
        {
          name: 'Middleware Pattern',
          description: 'Express middleware for request processing pipeline',
          files: ['middleware/auth.js'],
          confidence: 0.9
        },
        {
          name: 'Router Pattern',
          description: 'Express router for modular route handling',
          files: ['routes/users.js'],
          confidence: 0.95
        }
      ] as ArchitecturalPattern[],
      
      historicalContext: {
        recentChanges: [],
        changeFrequency: 0,
        bugHistory: []
      } as HistoricalContext,
      
      blastRadius: {
        directImpact: ['routes/users.js'],
        indirectImpact: ['middleware/auth.js'],
        testImpact: ['test/users.test.js'],
        documentationImpact: ['API.md'],
        migrationImpact: [],
        configurationImpact: []
      } as BlastRadius,
      
      changeClassification: {
        type: 'feature',
        scope: 'module',
        risk: 'low'
      } as ChangeClassification,
      
      completeFiles: new Map([
        ['routes/users.js', this.getSampleExpressRoute()]
      ]),
      semanticAnalysis: {
        functionSignatures: [],
        typeDefinitions: [],
        importExportChains: [],
        callGraphs: [],
        dataFlows: []
      }
    };
  }

  // Sample code generators
  private getSampleReactComponent(): string {
    return `
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
};`;
  }

  private getSampleCustomHook(): string {
    return `
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
};`;
  }

  private getSampleDjangoModel(): string {
    return `
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"`;
  }

  private getSampleDjangoView(): string {
    return `
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)`;
  }

  private getSampleSpringController(): string {
    return `
@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        UserDto user = userService.findById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserDto updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("USER_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}`;
  }

  private getSampleExpressRoute(): string {
    return `
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;`;
  }
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
  const demo = new Phase4CompleteDemo();
  demo.demonstrateCompleteWorkflow().catch(console.error);
}
