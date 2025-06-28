/**
 * Prompt Template Manager - Complete Implementation
 * Manages template versioning, optimization, and performance tracking
 */
import { 
  AnalysisType, 
  ContextualPrompt,
  EnhancedPRContext
} from '../types/analysis.js';
import { SpecializedTemplates } from './specializedTemplates.js';

export class PromptTemplateManager {
  private templates: Map<string, TemplateVersion[]>;
  private performanceMetrics: Map<string, TemplatePerformance>;
  private templateOptimizer: TemplateOptimizer;

  constructor() {
    this.templates = new Map();
    this.performanceMetrics = new Map();
    this.templateOptimizer = new TemplateOptimizer();
    this.initializeTemplates();
  }

  async getOptimalTemplate(
    analysisType: AnalysisType,
    context: EnhancedPRContext
  ): Promise<TemplateVersion> {
    console.log(`🎯 Selecting optimal template for ${analysisType}...`);

    const templateVersions = this.templates.get(analysisType);
    if (!templateVersions || templateVersions.length === 0) {
      throw new Error(`No templates found for analysis type: ${analysisType}`);
    }

    // Get the best performing template for this context
    const optimalTemplate = await this.selectBestTemplate(templateVersions, context);
    
    console.log(`✅ Selected template version ${optimalTemplate.version} for ${analysisType}`);
    return optimalTemplate;
  }

  async optimizeTemplate(
    analysisType: AnalysisType,
    template: TemplateVersion,
    performanceData: TemplatePerformanceData
  ): Promise<TemplateVersion> {
    console.log(`🔧 Optimizing template for ${analysisType}...`);

    // Analyze performance data
    const optimizations = await this.templateOptimizer.analyzePerformance(
      template,
      performanceData
    );

    // Apply optimizations
    const optimizedTemplate = await this.templateOptimizer.applyOptimizations(
      template,
      optimizations
    );

    // Create new version
    const newVersion: TemplateVersion = {
      ...optimizedTemplate,
      version: this.generateNewVersion(template.version),
      createdAt: new Date(),
      parentVersion: template.version,
      optimizations: optimizations.map(o => o.description)
    };

    // Add to template versions
    const versions = this.templates.get(analysisType) || [];
    versions.push(newVersion);
    this.templates.set(analysisType, versions);

    console.log(`✅ Created optimized template version ${newVersion.version}`);
    return newVersion;
  }

  async trackTemplatePerformance(
    templateId: string,
    performanceData: TemplatePerformanceData
  ): Promise<void> {
    const existing = this.performanceMetrics.get(templateId) || {
      templateId,
      totalUsage: 0,
      averageResponseTime: 0,
      averageQualityScore: 0,
      successRate: 0,
      contextTypes: new Map(),
      performanceHistory: [] as PerformanceHistoryEntry[]
    };

    // Update metrics
    existing.totalUsage++;
    existing.averageResponseTime = this.updateAverage(
      existing.averageResponseTime,
      performanceData.responseTime,
      existing.totalUsage
    );
    existing.averageQualityScore = this.updateAverage(
      existing.averageQualityScore,
      performanceData.qualityScore,
      existing.totalUsage
    );
    existing.successRate = this.updateAverage(
      existing.successRate,
      performanceData.success ? 1 : 0,
      existing.totalUsage
    );

    // Track context-specific performance
    const contextKey = `${performanceData.language}-${performanceData.framework}`;
    const contextMetrics = existing.contextTypes.get(contextKey) || {
      usage: 0,
      averageQuality: 0,
      averageResponseTime: 0
    };
    
    contextMetrics.usage++;
    contextMetrics.averageQuality = this.updateAverage(
      contextMetrics.averageQuality,
      performanceData.qualityScore,
      contextMetrics.usage
    );
    contextMetrics.averageResponseTime = this.updateAverage(
      contextMetrics.averageResponseTime,
      performanceData.responseTime,
      contextMetrics.usage
    );
    
    existing.contextTypes.set(contextKey, contextMetrics);

    // Add to history
    existing.performanceHistory.push({
      timestamp: new Date(),
      responseTime: performanceData.responseTime,
      qualityScore: performanceData.qualityScore,
      success: performanceData.success,
      context: contextKey
    } as PerformanceHistoryEntry);

    // Keep only last 100 entries
    if (existing.performanceHistory.length > 100) {
      existing.performanceHistory = existing.performanceHistory.slice(-100);
    }

    this.performanceMetrics.set(templateId, existing);
  }

  async getTemplateAnalytics(analysisType: AnalysisType): Promise<TemplateAnalytics> {
    const templates = this.templates.get(analysisType) || [];
    const analytics: TemplateAnalytics = {
      analysisType,
      totalTemplates: templates.length,
      activeTemplates: templates.filter(t => t.isActive).length,
      averagePerformance: 0,
      bestPerformingTemplate: null,
      worstPerformingTemplate: null,
      optimizationOpportunities: [],
      usageDistribution: new Map()
    };

    // Calculate performance metrics
    let totalPerformance = 0;
    let bestScore = 0;
    let worstScore = 1;

    for (const template of templates) {
      const performance = this.performanceMetrics.get(template.id);
      if (performance) {
        const score = performance.averageQualityScore;
        totalPerformance += score;

        if (score > bestScore) {
          bestScore = score;
          analytics.bestPerformingTemplate = template;
        }

        if (score < worstScore) {
          worstScore = score;
          analytics.worstPerformingTemplate = template;
        }

        analytics.usageDistribution.set(template.id, performance.totalUsage);
      }
    }

    analytics.averagePerformance = templates.length > 0 ? totalPerformance / templates.length : 0;

    // Identify optimization opportunities
    analytics.optimizationOpportunities = await this.identifyOptimizationOpportunities(templates);

    return analytics;
  }

  private initializeTemplates(): void {
    // Initialize architectural templates
    this.templates.set('architectural', [
      {
        id: 'arch-v2.0',
        version: '2.0',
        content: SpecializedTemplates.getAdvancedArchitecturalTemplate(),
        analysisType: 'architectural',
        isActive: true,
        createdAt: new Date(),
        metadata: {
          complexity: 'high',
          contextAware: true,
          optimizedFor: ['enterprise', 'microservices', 'monolithic']
        }
      }
    ]);

    // Initialize security templates
    this.templates.set('security', [
      {
        id: 'sec-v2.0',
        version: '2.0',
        content: SpecializedTemplates.getAdvancedSecurityTemplate(),
        analysisType: 'security',
        isActive: true,
        createdAt: new Date(),
        metadata: {
          complexity: 'high',
          contextAware: true,
          optimizedFor: ['web-security', 'api-security', 'data-protection']
        }
      }
    ]);

    // Initialize performance templates
    this.templates.set('performance', [
      {
        id: 'perf-v2.0',
        version: '2.0',
        content: SpecializedTemplates.getAdvancedPerformanceTemplate(),
        analysisType: 'performance',
        isActive: true,
        createdAt: new Date(),
        metadata: {
          complexity: 'high',
          contextAware: true,
          optimizedFor: ['scalability', 'optimization', 'bottleneck-analysis']
        }
      }
    ]);

    // Initialize testing templates
    this.templates.set('testing', [
      {
        id: 'test-v2.0',
        version: '2.0',
        content: SpecializedTemplates.getAdvancedTestingTemplate(),
        analysisType: 'testing',
        isActive: true,
        createdAt: new Date(),
        metadata: {
          complexity: 'high',
          contextAware: true,
          optimizedFor: ['coverage-analysis', 'quality-assessment', 'automation']
        }
      }
    ]);
  }

  private async selectBestTemplate(
    templates: TemplateVersion[],
    context: EnhancedPRContext
  ): Promise<TemplateVersion> {
    // Filter active templates
    const activeTemplates = templates.filter(t => t.isActive);
    if (activeTemplates.length === 0) {
      throw new Error('No active templates available');
    }

    // If only one template, return it
    if (activeTemplates.length === 1) {
      return activeTemplates[0];
    }

    // Score templates based on context and performance
    const scoredTemplates = await Promise.all(
      activeTemplates.map(async template => ({
        template,
        score: await this.scoreTemplate(template, context)
      }))
    );

    // Sort by score and return the best
    scoredTemplates.sort((a, b) => b.score - a.score);
    return scoredTemplates[0].template;
  }

  private async scoreTemplate(
    template: TemplateVersion,
    context: EnhancedPRContext
  ): Promise<number> {
    let score = 0;

    // Base score from performance metrics
    const performance = this.performanceMetrics.get(template.id);
    if (performance) {
      score += performance.averageQualityScore * 0.4;
      score += performance.successRate * 0.3;
      score += (1 - performance.averageResponseTime / 10000) * 0.2; // Normalize response time
    } else {
      score += 0.5; // Default score for new templates
    }

    // Context-specific scoring
    const contextKey = `${context.repositoryMetadata.language}-${context.repositoryMetadata.framework}`;
    if (performance?.contextTypes.has(contextKey)) {
      const contextMetrics = performance.contextTypes.get(contextKey)!;
      score += contextMetrics.averageQuality * 0.1;
    }

    // Template metadata scoring
    if (template.metadata) {
      // Prefer templates optimized for current architecture
      if (template.metadata.optimizedFor?.includes(context.repositoryMetadata.architecture)) {
        score += 0.1;
      }

      // Prefer context-aware templates
      if (template.metadata.contextAware) {
        score += 0.05;
      }
    }

    return Math.min(score, 1.0);
  }

  private async identifyOptimizationOpportunities(
    templates: TemplateVersion[]
  ): Promise<OptimizationOpportunity[]> {
    const opportunities: OptimizationOpportunity[] = [];

    for (const template of templates) {
      const performance = this.performanceMetrics.get(template.id);
      if (!performance) continue;

      // Low quality score opportunity
      if (performance.averageQualityScore < 0.7) {
        opportunities.push({
          templateId: template.id,
          type: 'quality-improvement',
          description: 'Template produces low-quality analysis results',
          priority: 'high',
          estimatedImpact: 'high'
        });
      }

      // High response time opportunity
      if (performance.averageResponseTime > 5000) {
        opportunities.push({
          templateId: template.id,
          type: 'performance-optimization',
          description: 'Template has high response times',
          priority: 'medium',
          estimatedImpact: 'medium'
        });
      }

      // Low success rate opportunity
      if (performance.successRate < 0.9) {
        opportunities.push({
          templateId: template.id,
          type: 'reliability-improvement',
          description: 'Template has low success rate',
          priority: 'high',
          estimatedImpact: 'high'
        });
      }

      // Context-specific opportunities
      for (const [contextKey, contextMetrics] of performance.contextTypes) {
        if (contextMetrics.averageQuality < 0.6) {
          opportunities.push({
            templateId: template.id,
            type: 'context-optimization',
            description: `Poor performance for ${contextKey} context`,
            priority: 'medium',
            estimatedImpact: 'medium'
          });
        }
      }
    }

    return opportunities;
  }

  private updateAverage(currentAverage: number, newValue: number, count: number): number {
    return ((currentAverage * (count - 1)) + newValue) / count;
  }

  private generateNewVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const major = parseInt(parts[0]);
    const minor = parseInt(parts[1] || '0');
    
    return `${major}.${minor + 1}`;
  }
}

class TemplateOptimizer {
  async analyzePerformance(
    template: TemplateVersion,
    performanceData: TemplatePerformanceData
  ): Promise<TemplateOptimization[]> {
    const optimizations: TemplateOptimization[] = [];

    // Analyze response quality
    if (performanceData.qualityScore < 0.7) {
      optimizations.push({
        type: 'content-enhancement',
        description: 'Enhance template content for better analysis quality',
        priority: 'high',
        implementation: 'Add more specific guidance and examples'
      });
    }

    // Analyze response time
    if (performanceData.responseTime > 5000) {
      optimizations.push({
        type: 'length-optimization',
        description: 'Reduce template length to improve response time',
        priority: 'medium',
        implementation: 'Remove redundant sections and optimize prompt structure'
      });
    }

    // Analyze context relevance
    if (performanceData.contextRelevance < 0.8) {
      optimizations.push({
        type: 'context-enhancement',
        description: 'Improve context-specific guidance',
        priority: 'medium',
        implementation: 'Add more targeted language and framework-specific instructions'
      });
    }

    return optimizations;
  }

  async applyOptimizations(
    template: TemplateVersion,
    optimizations: TemplateOptimization[]
  ): Promise<TemplateVersion> {
    let optimizedContent = template.content;

    for (const optimization of optimizations) {
      switch (optimization.type) {
        case 'content-enhancement':
          optimizedContent = await this.enhanceContent(optimizedContent);
          break;
        case 'length-optimization':
          optimizedContent = await this.optimizeLength(optimizedContent);
          break;
        case 'context-enhancement':
          optimizedContent = await this.enhanceContext(optimizedContent);
          break;
      }
    }

    return {
      ...template,
      content: optimizedContent
    };
  }

  private async enhanceContent(content: string): Promise<string> {
    // Add more specific examples and guidance
    const enhancements = [
      '\n## ADDITIONAL ANALYSIS GUIDANCE\n',
      '- Provide specific code examples in findings\n',
      '- Include quantified impact assessments\n',
      '- Reference industry best practices\n',
      '- Include actionable implementation steps\n'
    ];

    return content + enhancements.join('');
  }

  private async optimizeLength(content: string): Promise<string> {
    // Remove redundant sections and optimize structure
    let optimized = content;

    // Remove duplicate instructions
    optimized = optimized.replace(/(\n.*?Focus on.*?\n)/g, (match, p1) => {
      return optimized.indexOf(p1) === optimized.lastIndexOf(p1) ? p1 : '';
    });

    // Consolidate similar sections
    optimized = optimized.replace(/\n## RESPONSE FORMAT\n[\s\S]*?\n## RESPONSE FORMAT\n/g, '\n## RESPONSE FORMAT\n');

    return optimized;
  }

  private async enhanceContext(content: string): Promise<string> {
    // Add placeholders for context-specific enhancements
    const contextEnhancements = [
      '\n{language_specific_guidance}\n',
      '{framework_specific_guidance}\n',
      '{architecture_specific_guidance}\n'
    ];

    return content + contextEnhancements.join('');
  }
}

// Supporting interfaces
interface TemplateVersion {
  id: string;
  version: string;
  content: string;
  analysisType: AnalysisType;
  isActive: boolean;
  createdAt: Date;
  parentVersion?: string;
  optimizations?: string[];
  metadata?: {
    complexity: 'low' | 'medium' | 'high';
    contextAware: boolean;
    optimizedFor: string[];
  };
}

interface TemplatePerformance {
  templateId: string;
  totalUsage: number;
  averageResponseTime: number;
  averageQualityScore: number;
  successRate: number;
  contextTypes: Map<string, ContextMetrics>;
  performanceHistory: PerformanceHistoryEntry[];
}

interface ContextMetrics {
  usage: number;
  averageQuality: number;
  averageResponseTime: number;
}

interface PerformanceHistoryEntry {
  timestamp: Date;
  responseTime: number;
  qualityScore: number;
  success: boolean;
  context: string;
}

interface TemplatePerformanceData {
  responseTime: number;
  qualityScore: number;
  success: boolean;
  language: string;
  framework: string;
  contextRelevance: number;
}

interface TemplateAnalytics {
  analysisType: AnalysisType;
  totalTemplates: number;
  activeTemplates: number;
  averagePerformance: number;
  bestPerformingTemplate: TemplateVersion | null;
  worstPerformingTemplate: TemplateVersion | null;
  optimizationOpportunities: OptimizationOpportunity[];
  usageDistribution: Map<string, number>;
}

interface OptimizationOpportunity {
  templateId: string;
  type: 'quality-improvement' | 'performance-optimization' | 'reliability-improvement' | 'context-optimization';
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: 'low' | 'medium' | 'high';
}

interface TemplateOptimization {
  type: 'content-enhancement' | 'length-optimization' | 'context-enhancement';
  description: string;
  priority: 'low' | 'medium' | 'high';
  implementation: string;
}
