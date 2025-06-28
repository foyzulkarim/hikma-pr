/**
 * Performance Analysis Agent - Complete Implementation
 * Based on FINAL_IMPROVEMENT_PLAN.md requirements
 */
import { AnalysisAgent } from './baseAgent.js';
import { 
  EnhancedPRContext, 
  SpecializedAnalysis, 
  Finding, 
  Recommendation,
  ValidationResult,
  AnalysisType
} from '../types/analysis.js';
import { RealLLMService } from '../services/realLLMService.js';
import { DynamicPromptBuilder } from '../prompts/dynamicPromptBuilder.js';
import { ContextAwareEnhancer } from '../prompts/contextAwareEnhancer.js';

export class PerformanceAnalysisAgent implements AnalysisAgent {
  private llmService: RealLLMService;
  private promptBuilder: DynamicPromptBuilder;
  private contextEnhancer: ContextAwareEnhancer;

  constructor() {
    this.llmService = new RealLLMService();
    this.promptBuilder = new DynamicPromptBuilder();
    this.contextEnhancer = new ContextAwareEnhancer();
  }

  getAnalysisType(): AnalysisType {
    return 'performance';
  }

  async analyze(context: EnhancedPRContext, enhancedPrompt?: string): Promise<SpecializedAnalysis> {
    console.log('⚡ Starting performance analysis with real LLM...');
    
    try {
      // Use enhanced prompt if provided, otherwise build context-aware prompt
      let finalPrompt: string;
      
      if (enhancedPrompt) {
        console.log('🎯 Using provided enhanced prompt for performance analysis');
        finalPrompt = enhancedPrompt;
      } else {
        // Build dynamic, context-aware prompt
        console.log('🎯 Building context-aware performance analysis prompt...');
        const contextualPrompt = await this.promptBuilder.buildContextualPrompt(
          'performance',
          context
        );
        
        // Enhance prompt with language/framework-specific guidance
        finalPrompt = await this.contextEnhancer.enhancePromptForContext(
          contextualPrompt.content,
          'performance',
          context
        );
      }
      
      // Get LLM analysis with enhanced prompt
      console.log('🤖 Calling LM Studio with enhanced context-aware prompt');
      const llmResponse = await this.llmService.generateAnalysis(
        'performance',
        context,
        finalPrompt
      );
      
      console.log(`✅ LLM response received (${llmResponse.analysis.length} characters)`);
      
      // Parse LLM response into structured analysis
      const analysis = this.parseLLMResponse(llmResponse.analysis);
      
      // Perform additional performance analysis
      const algorithmicComplexity = await this.analyzeAlgorithmicComplexity(context);
      const databaseImpact = await this.analyzeDatabaseImpact(context);
      const memoryUsage = await this.analyzeMemoryUsage(context);
      const networkOptimization = await this.analyzeNetworkCalls(context);
      const cachingStrategy = await this.analyzeCaching(context);
      const regressionRisk = await this.assessRegressionRisk(context);
      
      // Create findings
      const findings = this.createFindings([
        ...analysis.findings,
        ...algorithmicComplexity.findings,
        ...databaseImpact.findings,
        ...memoryUsage.findings,
        ...networkOptimization.findings,
        ...cachingStrategy.findings,
        ...regressionRisk.findings
      ]);
      
      // Create recommendations
      const recommendations = this.createRecommendations([
        ...analysis.recommendations,
        ...algorithmicComplexity.recommendations,
        ...databaseImpact.recommendations,
        ...memoryUsage.recommendations,
        ...networkOptimization.recommendations,
        ...cachingStrategy.recommendations,
        ...regressionRisk.recommendations
      ]);
      
      const confidence = this.calculateConfidence(findings, recommendations);
      const riskLevel = this.assessRiskLevel(findings);
      
      console.log(`✅ LLM performance analysis completed (confidence: ${(confidence * 100).toFixed(1)}%)`);
      
      return {
        type: 'performance',
        findings,
        recommendations,
        riskLevel: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        confidence
      };
      
    } catch (error) {
      console.error('❌ Performance analysis failed:', error);
      return this.createFallbackAnalysis('performance', error);
    }
  }

  // Helper methods from BaseAgent functionality
  private parseLLMResponse(content: string): any {
    try {
      // Try to parse JSON response
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Fallback to basic parsing
      return {
        findings: [],
        recommendations: []
      };
    } catch (error) {
      console.warn('⚠️ Failed to parse LLM response, using fallback');
      return {
        findings: [],
        recommendations: []
      };
    }
  }

  private createFindings(findingData: any[]): Finding[] {
    return findingData.map((data, index) => ({
      id: `perf-finding-${index}`,
      type: data.type || 'performance',
      severity: this.mapSeverity(data.severity || 'minor'),
      message: data.message || 'Performance issue detected',
      file: data.file || 'unknown',
      lineNumber: data.lineNumber || 0,
      evidence: Array.isArray(data.evidence) ? data.evidence : [data.evidence || 'No evidence provided'],
      confidence: 0.7
    }));
  }

  private createRecommendations(recData: any[]): Recommendation[] {
    return recData.map((data, index) => ({
      id: `perf-rec-${index}`,
      priority: this.mapPriority(data.priority || 'medium'),
      category: data.type || 'performance',
      description: data.description || 'Performance improvement needed',
      rationale: data.expectedImpact || 'Will improve performance',
      implementation: data.implementation || 'Implementation details needed',
      effort: this.estimateEffort(data.priority),
      confidence: 0.7
    }));
  }

  private mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity.toLowerCase()) {
      case 'critical': return 'critical';
      case 'major': return 'high';
      case 'minor': return 'low';
      default: return 'medium';
    }
  }

  private mapPriority(priority: string): 'must-fix' | 'should-fix' | 'consider' {
    switch (priority.toLowerCase()) {
      case 'high': return 'must-fix';
      case 'medium': return 'should-fix';
      default: return 'consider';
    }
  }

  private estimateEffort(priority: string): 'low' | 'medium' | 'high' {
    switch (priority) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  private calculateConfidence(findings: Finding[], recommendations: Recommendation[]): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on evidence quality
    const findingsWithEvidence = findings.filter(f => f.evidence && f.evidence.length > 20);
    confidence += (findingsWithEvidence.length / Math.max(findings.length, 1)) * 0.2;
    
    // Increase confidence based on recommendation detail
    const detailedRecs = recommendations.filter(r => r.implementation && r.implementation.length > 30);
    confidence += (detailedRecs.length / Math.max(recommendations.length, 1)) * 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private assessRiskLevel(findings: Finding[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');
    
    if (criticalFindings.length > 0) return 'HIGH';
    if (highFindings.length > 2) return 'HIGH';
    if (highFindings.length > 0) return 'MEDIUM';
    return 'LOW';
  }

  private createFallbackAnalysis(type: string, error: any): SpecializedAnalysis {
    return {
      type,
      findings: [{
        id: 'fallback-finding-1',
        type: 'error',
        severity: 'low',
        message: `Analysis failed: ${error.message || 'Unknown error'}`,
        file: 'system',
        lineNumber: 0,
        evidence: ['Analysis could not be completed due to system error'],
        confidence: 0.3
      }],
      recommendations: [{
        id: 'fallback-rec-1',
        priority: 'consider',
        category: 'system',
        description: 'Review system configuration and try analysis again',
        rationale: 'System error prevented complete analysis',
        implementation: 'Check logs and system status',
        effort: 'low',
        confidence: 0.3
      }],
      riskLevel: 'LOW',
      confidence: 0.1
    };
  }

  private buildPerformancePrompt(context: EnhancedPRContext): string {
    const changedFiles = Array.from(context.completeFiles.keys());
    const fileContents = Array.from(context.completeFiles.entries())
      .map(([file, content]) => `### ${file}\n\`\`\`\n${content.substring(0, 2000)}\`\`\``)
      .join('\n\n');

    return `# Performance Analysis Task

You are a senior performance engineer conducting a comprehensive performance analysis of code changes.

## Repository Context
- **Architecture**: ${context.repositoryMetadata.architecture}
- **Language**: ${context.repositoryMetadata.language}
- **Framework**: ${context.repositoryMetadata.framework}

## Changed Files
${changedFiles.map(file => `- ${file}`).join('\n')}

## Complete File Contents
${fileContents}

## Analysis Requirements

Conduct a thorough performance analysis focusing on:

1. **Algorithmic Complexity**: Analyze time and space complexity of new/modified algorithms
2. **Database Performance**: Identify potential database bottlenecks, N+1 queries, missing indexes
3. **Memory Usage**: Detect memory leaks, excessive allocations, inefficient data structures
4. **Network Optimization**: Analyze API calls, data transfer efficiency, caching opportunities
5. **Caching Strategy**: Evaluate caching implementation and opportunities
6. **Performance Regression Risk**: Assess risk of performance degradation

## Response Format

Provide your analysis in the following JSON structure:

\`\`\`json
{
  "findings": [
    {
      "type": "algorithmic-complexity" | "database" | "memory" | "network" | "caching" | "regression",
      "severity": "critical" | "major" | "minor",
      "message": "Detailed description of the performance issue",
      "file": "filename",
      "lineNumber": number,
      "evidence": "Code snippet or explanation supporting the finding"
    }
  ],
  "recommendations": [
    {
      "type": "optimization" | "refactoring" | "caching" | "database" | "monitoring",
      "priority": "high" | "medium" | "low",
      "description": "Specific recommendation to improve performance",
      "implementation": "How to implement this recommendation",
      "expectedImpact": "Expected performance improvement"
    }
  ]
}
\`\`\`

Focus on actionable insights and specific performance improvements.`;
  }

  private async analyzeAlgorithmicComplexity(context: EnhancedPRContext): Promise<any> {
    console.log('🧮 Analyzing algorithmic complexity...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Analyze each changed file for complexity issues
    for (const [file, content] of context.completeFiles) {
      const complexityIssues = this.detectComplexityIssues(content, file);
      findings.push(...complexityIssues.findings);
      recommendations.push(...complexityIssues.recommendations);
    }
    
    return { findings, recommendations };
  }

  private async analyzeDatabaseImpact(context: EnhancedPRContext): Promise<any> {
    console.log('🗄️ Analyzing database impact...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Look for database-related patterns
    for (const [file, content] of context.completeFiles) {
      const dbIssues = this.detectDatabaseIssues(content, file);
      findings.push(...dbIssues.findings);
      recommendations.push(...dbIssues.recommendations);
    }
    
    return { findings, recommendations };
  }

  private async analyzeMemoryUsage(context: EnhancedPRContext): Promise<any> {
    console.log('🧠 Analyzing memory usage...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Analyze memory usage patterns
    for (const [file, content] of context.completeFiles) {
      const memoryIssues = this.detectMemoryIssues(content, file);
      findings.push(...memoryIssues.findings);
      recommendations.push(...memoryIssues.recommendations);
    }
    
    return { findings, recommendations };
  }

  private async analyzeNetworkCalls(context: EnhancedPRContext): Promise<any> {
    console.log('🌐 Analyzing network optimization...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Analyze network call patterns
    for (const [file, content] of context.completeFiles) {
      const networkIssues = this.detectNetworkIssues(content, file);
      findings.push(...networkIssues.findings);
      recommendations.push(...networkIssues.recommendations);
    }
    
    return { findings, recommendations };
  }

  private async analyzeCaching(context: EnhancedPRContext): Promise<any> {
    console.log('💾 Analyzing caching strategy...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Analyze caching opportunities
    for (const [file, content] of context.completeFiles) {
      const cachingIssues = this.detectCachingOpportunities(content, file);
      findings.push(...cachingIssues.findings);
      recommendations.push(...cachingIssues.recommendations);
    }
    
    return { findings, recommendations };
  }

  private async assessRegressionRisk(context: EnhancedPRContext): Promise<any> {
    console.log('📉 Assessing performance regression risk...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Assess regression risk based on changes
    const riskFactors = this.identifyRegressionRisks(context);
    
    if (riskFactors.length > 0) {
      findings.push({
        type: 'regression',
        severity: 'major',
        message: `Identified ${riskFactors.length} potential performance regression risks`,
        file: 'multiple',
        lineNumber: 0,
        evidence: riskFactors.join(', ')
      });
      
      recommendations.push({
        type: 'monitoring',
        priority: 'high',
        description: 'Implement performance monitoring for regression detection',
        implementation: 'Add performance benchmarks and monitoring alerts',
        expectedImpact: 'Early detection of performance regressions'
      });
    }
    
    return { findings, recommendations };
  }

  // Helper methods for specific analysis
  private detectComplexityIssues(content: string, file: string): any {
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Detect nested loops (O(n²) or worse)
    const nestedLoopPattern = /for\s*\([^)]*\)\s*{[^}]*for\s*\([^)]*\)/g;
    const nestedLoops = content.match(nestedLoopPattern);
    
    if (nestedLoops && nestedLoops.length > 0) {
      findings.push({
        type: 'algorithmic-complexity',
        severity: 'major',
        message: `Found ${nestedLoops.length} nested loop(s) that may cause O(n²) complexity`,
        file,
        lineNumber: this.findLineNumber(content, nestedLoops[0]),
        evidence: nestedLoops[0].substring(0, 100)
      });
      
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        description: 'Consider optimizing nested loops to reduce algorithmic complexity',
        implementation: 'Use hash maps, early termination, or algorithm optimization',
        expectedImpact: 'Significant performance improvement for large datasets'
      });
    }
    
    // Detect inefficient array operations
    const inefficientArrayOps = /\.forEach\s*\([^)]*\)\s*{[^}]*\.find\s*\(/g;
    const inefficientOps = content.match(inefficientArrayOps);
    
    if (inefficientOps && inefficientOps.length > 0) {
      findings.push({
        type: 'algorithmic-complexity',
        severity: 'minor',
        message: 'Found potentially inefficient array operations (forEach with find)',
        file,
        lineNumber: this.findLineNumber(content, inefficientOps[0]),
        evidence: inefficientOps[0].substring(0, 100)
      });
      
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        description: 'Replace forEach+find with more efficient alternatives',
        implementation: 'Use Array.find() directly or create lookup maps',
        expectedImpact: 'Improved performance for array operations'
      });
    }
    
    return { findings, recommendations };
  }

  private detectDatabaseIssues(content: string, file: string): any {
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Detect potential N+1 query patterns
    const n1QueryPattern = /\.forEach\s*\([^)]*\)\s*{[^}]*(?:find|query|select)/gi;
    const n1Queries = content.match(n1QueryPattern);
    
    if (n1Queries && n1Queries.length > 0) {
      findings.push({
        type: 'database',
        severity: 'critical',
        message: 'Potential N+1 query pattern detected',
        file,
        lineNumber: this.findLineNumber(content, n1Queries[0]),
        evidence: n1Queries[0].substring(0, 100)
      });
      
      recommendations.push({
        type: 'database',
        priority: 'high',
        description: 'Optimize database queries to prevent N+1 problem',
        implementation: 'Use batch queries, joins, or eager loading',
        expectedImpact: 'Dramatic reduction in database load and response time'
      });
    }
    
    // Detect missing indexes (SELECT without WHERE optimization)
    const unindexedQueryPattern = /SELECT\s+.*\s+FROM\s+\w+(?!\s+WHERE\s+\w+\s*=)/gi;
    const unindexedQueries = content.match(unindexedQueryPattern);
    
    if (unindexedQueries && unindexedQueries.length > 0) {
      findings.push({
        type: 'database',
        severity: 'major',
        message: 'Potential unoptimized database query without proper indexing',
        file,
        lineNumber: this.findLineNumber(content, unindexedQueries[0]),
        evidence: unindexedQueries[0].substring(0, 100)
      });
      
      recommendations.push({
        type: 'database',
        priority: 'high',
        description: 'Add appropriate database indexes for query optimization',
        implementation: 'Create indexes on frequently queried columns',
        expectedImpact: 'Faster query execution and reduced database load'
      });
    }
    
    return { findings, recommendations };
  }

  private detectMemoryIssues(content: string, file: string): any {
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Detect potential memory leaks (event listeners without cleanup)
    const memoryLeakPattern = /addEventListener\s*\([^)]*\)(?![^}]*removeEventListener)/g;
    const memoryLeaks = content.match(memoryLeakPattern);
    
    if (memoryLeaks && memoryLeaks.length > 0) {
      findings.push({
        type: 'memory',
        severity: 'major',
        message: 'Potential memory leak: event listeners without cleanup',
        file,
        lineNumber: this.findLineNumber(content, memoryLeaks[0]),
        evidence: memoryLeaks[0].substring(0, 100)
      });
      
      recommendations.push({
        type: 'refactoring',
        priority: 'high',
        description: 'Add proper cleanup for event listeners to prevent memory leaks',
        implementation: 'Use removeEventListener in cleanup functions or useEffect cleanup',
        expectedImpact: 'Prevention of memory leaks and improved application stability'
      });
    }
    
    // Detect large object creation in loops
    const largeObjectPattern = /for\s*\([^)]*\)\s*{[^}]*new\s+(?:Array|Object|Map|Set)\s*\(/g;
    const largeObjects = content.match(largeObjectPattern);
    
    if (largeObjects && largeObjects.length > 0) {
      findings.push({
        type: 'memory',
        severity: 'minor',
        message: 'Object creation inside loops may cause excessive memory allocation',
        file,
        lineNumber: this.findLineNumber(content, largeObjects[0]),
        evidence: largeObjects[0].substring(0, 100)
      });
      
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        description: 'Move object creation outside loops or use object pooling',
        implementation: 'Pre-allocate objects or reuse existing instances',
        expectedImpact: 'Reduced memory allocation and garbage collection pressure'
      });
    }
    
    return { findings, recommendations };
  }

  private detectNetworkIssues(content: string, file: string): any {
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Detect multiple sequential API calls
    const sequentialCallsPattern = /(?:await\s+)?(?:fetch|axios|http)\s*\([^)]*\)\s*;?\s*(?:await\s+)?(?:fetch|axios|http)\s*\(/g;
    const sequentialCalls = content.match(sequentialCallsPattern);
    
    if (sequentialCalls && sequentialCalls.length > 0) {
      findings.push({
        type: 'network',
        severity: 'major',
        message: 'Sequential API calls detected - consider parallelization',
        file,
        lineNumber: this.findLineNumber(content, sequentialCalls[0]),
        evidence: sequentialCalls[0].substring(0, 100)
      });
      
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        description: 'Parallelize independent API calls using Promise.all()',
        implementation: 'Use Promise.all() or Promise.allSettled() for concurrent requests',
        expectedImpact: 'Reduced total request time and improved user experience'
      });
    }
    
    // Detect large data transfers without compression
    const largeDataPattern = /\.json\(\)\s*\.then\([^)]*\)\s*{[^}]*\.length\s*>\s*\d{4,}/g;
    const largeData = content.match(largeDataPattern);
    
    if (largeData && largeData.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        description: 'Consider implementing data compression for large transfers',
        implementation: 'Use gzip compression or implement pagination',
        expectedImpact: 'Reduced bandwidth usage and faster data transfer'
      });
    }
    
    return { findings, recommendations };
  }

  private detectCachingOpportunities(content: string, file: string): any {
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Detect repeated expensive operations
    const expensiveOpsPattern = /(?:JSON\.parse|JSON\.stringify|sort\(\)|filter\(\).*map\(\))/g;
    const expensiveOps = content.match(expensiveOpsPattern);
    
    if (expensiveOps && expensiveOps.length > 2) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        description: 'Consider caching results of expensive operations',
        implementation: 'Implement memoization or use caching libraries',
        expectedImpact: 'Improved performance for repeated operations'
      });
    }
    
    // Detect API calls that could be cached
    const apiCallPattern = /(?:fetch|axios|http).*\/api\//g;
    const apiCalls = content.match(apiCallPattern);
    
    if (apiCalls && apiCalls.length > 0) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        description: 'Consider implementing API response caching',
        implementation: 'Use HTTP caching headers or implement client-side caching',
        expectedImpact: 'Reduced server load and faster response times'
      });
    }
    
    return { findings, recommendations };
  }

  private identifyRegressionRisks(context: EnhancedPRContext): string[] {
    const risks: string[] = [];
    
    // Check for changes in critical performance areas
    const criticalPatterns = [
      'database query modifications',
      'loop complexity changes',
      'large data structure modifications',
      'API endpoint changes',
      'caching logic modifications'
    ];
    
    for (const [file, content] of context.completeFiles) {
      if (content.includes('SELECT') || content.includes('query')) {
        risks.push('Database query modifications detected');
      }
      
      if (content.includes('for') && content.includes('for')) {
        risks.push('Nested loop modifications detected');
      }
      
      if (content.includes('Array') && content.includes('length > 1000')) {
        risks.push('Large data structure modifications detected');
      }
    }
    
    return risks;
  }

  private findLineNumber(content: string, searchString: string): number {
    const index = content.indexOf(searchString);
    if (index === -1) return 0;
    
    return content.substring(0, index).split('\n').length;
  }

  async validate(analysis: SpecializedAnalysis): Promise<ValidationResult> {
    console.log('🔍 Validating performance analysis...');
    
    const validation: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 0.8
    };
    
    // Validate findings have proper evidence
    const findingsWithoutEvidence = analysis.findings.filter(f => !f.evidence || f.evidence.length < 10);
    if (findingsWithoutEvidence.length > 0) {
      validation.warnings.push(`${findingsWithoutEvidence.length} findings lack sufficient evidence`);
      validation.score *= 0.9;
    }
    
    // Validate recommendations are actionable
    const vagueRecommendations = analysis.recommendations.filter(r => 
      !r.implementation || r.implementation.length < 20
    );
    if (vagueRecommendations.length > 0) {
      validation.warnings.push(`${vagueRecommendations.length} recommendations lack implementation details`);
      validation.score *= 0.9;
    }
    
    // Check for performance-specific validation
    const performanceFindings = analysis.findings.filter(f => 
      ['algorithmic-complexity', 'database', 'memory', 'network'].includes(f.type)
    );
    
    if (performanceFindings.length === 0) {
      validation.warnings.push('No performance-specific findings identified');
      validation.score *= 0.8;
    }
    
    validation.isValid = validation.score > 0.6;
    
    return validation;
  }

  async refine(analysis: SpecializedAnalysis, feedback: any): Promise<SpecializedAnalysis> {
    console.log('🔧 Refining performance analysis based on feedback...');
    
    // Apply feedback to improve analysis
    if (feedback.suggestions && feedback.suggestions.includes('more specific')) {
      // Add more specific performance metrics
      analysis.findings.forEach(finding => {
        if (!finding.evidence.some(e => e.includes('performance impact'))) {
          finding.evidence.push('Performance impact: moderate to high');
        }
      });
    }
    
    if (feedback.suggestions && feedback.suggestions.includes('implementation details')) {
      // Enhance recommendation implementation details
      analysis.recommendations.forEach(rec => {
        if (rec.implementation.length < 50) {
          rec.implementation += '. Consider using performance profiling tools to measure impact.';
        }
      });
    }
    
    // Recalculate confidence after refinement
    analysis.confidence = this.calculateConfidence(analysis.findings, analysis.recommendations);
    
    return analysis;
  }
}
