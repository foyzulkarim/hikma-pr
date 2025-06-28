/**
 * LLM Service Mocks
 * Mock implementations for testing without actual LLM calls
 */

import { AnalysisType, SpecializedAnalysis, EnhancedPRContext } from '../../src/types/analysis';
import { mockLLMResponses } from '../fixtures/mockPRData';

export class MockUniversalLLMClient {
  private provider: any;
  private callCount: number = 0;
  private shouldFail: boolean = false;

  constructor(provider: any) {
    this.provider = provider;
  }

  async chatCompletion(request: any) {
    this.callCount++;
    
    if (this.shouldFail) {
      throw new Error('Mock LLM service failure');
    }

    // Simulate response delay
    await new Promise(resolve => setTimeout(resolve, 10));

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
  }

  async testConnection(): Promise<boolean> {
    if (this.shouldFail) return false;
    return true;
  }

  async getAvailableModels(): Promise<string[]> {
    return [this.provider.defaultModel, 'mock-model-2'];
  }

  async simpleCompletion(prompt: string, options?: any): Promise<string> {
    const response = await this.chatCompletion({
      model: this.provider.defaultModel,
      messages: [{ role: 'user', content: prompt }],
      ...options
    });
    return response.choices[0].message.content;
  }

  private getMockResponseContent(messages: any[]): string {
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    
    // Return different responses based on analysis type
    if (userMessage.toLowerCase().includes('architectural')) {
      return mockLLMResponses.architectural;
    } else if (userMessage.toLowerCase().includes('security')) {
      return mockLLMResponses.security;
    } else if (userMessage.toLowerCase().includes('performance')) {
      return mockLLMResponses.performance;
    } else if (userMessage.toLowerCase().includes('testing')) {
      return mockLLMResponses.testing;
    }
    
    return 'Mock LLM response for general analysis';
  }

  getCallCount(): number {
    return this.callCount;
  }

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  reset(): void {
    this.callCount = 0;
    this.shouldFail = false;
  }
}

export class MockEnhancedLLMService {
  private mockClients: Map<AnalysisType, MockUniversalLLMClient> = new Map();
  private requestCount: number = 0;
  private shouldFail: boolean = false;

  constructor() {
    // Initialize mock clients for each analysis type
    const analysisTypes: AnalysisType[] = ['architectural', 'security', 'performance', 'testing'];
    
    analysisTypes.forEach(type => {
      const mockProvider = {
        name: `Mock ${type}`,
        baseURL: 'http://localhost:1234',
        defaultModel: `mock-${type}-model`
      };
      
      this.mockClients.set(type, new MockUniversalLLMClient(mockProvider));
    });
  }

  async generateAnalysis(
    analysisType: AnalysisType,
    context: EnhancedPRContext,
    prompt: string
  ): Promise<SpecializedAnalysis> {
    this.requestCount++;

    if (this.shouldFail) {
      throw new Error(`Mock ${analysisType} analysis failed`);
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 50));

    const mockAnalysis: SpecializedAnalysis = {
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
  }

  private generateMockFindings(analysisType: AnalysisType): any[] {
    const findingsMap = {
      architectural: [
        {
          type: 'architectural',
          severity: 'medium' as const,
          description: 'Component structure follows React best practices',
          evidence: ['Proper TypeScript interfaces', 'Good separation of concerns'],
          location: 'src/components/UserProfile.tsx'
        },
        {
          type: 'architectural',
          severity: 'high' as const,
          description: 'Loading state logic has a bug',
          evidence: ['setLoading(false) called immediately after async operation'],
          location: 'src/components/UserProfile.tsx:20'
        }
      ],
      security: [
        {
          type: 'security',
          severity: 'medium' as const,
          description: 'Input validation added for email',
          evidence: ['validateEmail function implemented'],
          location: 'src/utils/validation.ts'
        },
        {
          type: 'security',
          severity: 'high' as const,
          description: 'Potential XSS risk in user data rendering',
          evidence: ['Direct rendering without sanitization'],
          location: 'src/components/UserProfile.tsx:35'
        }
      ],
      performance: [
        {
          type: 'performance',
          severity: 'low' as const,
          description: 'Efficient React hooks usage',
          evidence: ['Proper useEffect dependency array'],
          location: 'src/components/UserProfile.tsx'
        },
        {
          type: 'performance',
          severity: 'medium' as const,
          description: 'No caching mechanism for user data',
          evidence: ['API calls on every component mount'],
          location: 'src/api/userService.ts'
        }
      ],
      testing: [
        {
          type: 'testing',
          severity: 'low' as const,
          description: 'Good test coverage for utilities',
          evidence: ['Validation functions well tested'],
          location: 'tests/utils/validation.test.ts'
        },
        {
          type: 'testing',
          severity: 'medium' as const,
          description: 'Missing error scenario tests',
          evidence: ['No tests for API failures'],
          location: 'tests/components/UserProfile.test.tsx'
        }
      ]
    };

    return findingsMap[analysisType] || [];
  }

  private generateMockRecommendations(analysisType: AnalysisType): any[] {
    const recommendationsMap = {
      architectural: [
        {
          type: 'architectural',
          priority: 'high' as const,
          description: 'Fix loading state logic',
          implementation: 'Move setLoading(false) inside the async operation completion',
          impact: 'high'
        },
        {
          type: 'architectural',
          priority: 'medium' as const,
          description: 'Add error state management',
          implementation: 'Add error state and error boundaries',
          impact: 'medium'
        }
      ],
      security: [
        {
          type: 'security',
          priority: 'high' as const,
          description: 'Add input sanitization',
          implementation: 'Use DOMPurify or similar for user data rendering',
          impact: 'high'
        },
        {
          type: 'security',
          priority: 'medium' as const,
          description: 'Implement CSRF protection',
          implementation: 'Add CSRF tokens to state-changing requests',
          impact: 'medium'
        }
      ],
      performance: [
        {
          type: 'performance',
          priority: 'medium' as const,
          description: 'Add caching layer',
          implementation: 'Implement React Query or SWR for data caching',
          impact: 'medium'
        },
        {
          type: 'performance',
          priority: 'low' as const,
          description: 'Optimize component re-renders',
          implementation: 'Use React.memo for UserProfile component',
          impact: 'low'
        }
      ],
      testing: [
        {
          type: 'testing',
          priority: 'high' as const,
          description: 'Add error scenario tests',
          implementation: 'Test API failure cases and error handling',
          impact: 'high'
        },
        {
          type: 'testing',
          priority: 'medium' as const,
          description: 'Add integration tests',
          implementation: 'Test complete user update flow',
          impact: 'medium'
        }
      ]
    };

    return recommendationsMap[analysisType] || [];
  }

  async testConnections(): Promise<Record<AnalysisType, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [analysisType, client] of this.mockClients.entries()) {
      results[analysisType] = await client.testConnection();
    }
    
    return results as Record<AnalysisType, boolean>;
  }

  getPerformanceStats(): Record<string, any> {
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

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
    this.mockClients.forEach(client => client.setShouldFail(shouldFail));
  }

  reset(): void {
    this.requestCount = 0;
    this.shouldFail = false;
    this.mockClients.forEach(client => client.reset());
  }

  getMockClient(analysisType: AnalysisType): MockUniversalLLMClient | undefined {
    return this.mockClients.get(analysisType);
  }
}

// Factory function for creating mock LLM client
export function createMockLLMClient(provider: any): MockUniversalLLMClient {
  return new MockUniversalLLMClient(provider);
}

export default {
  MockUniversalLLMClient,
  MockEnhancedLLMService,
  createMockLLMClient
};
