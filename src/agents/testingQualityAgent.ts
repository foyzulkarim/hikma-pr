/**
 * Testing Quality Analysis Agent - Complete Implementation
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

export class TestingQualityAgent implements AnalysisAgent {
  private llmService: RealLLMService;
  private promptBuilder: DynamicPromptBuilder;
  private contextEnhancer: ContextAwareEnhancer;

  constructor() {
    this.llmService = new RealLLMService();
    this.promptBuilder = new DynamicPromptBuilder();
    this.contextEnhancer = new ContextAwareEnhancer();
  }

  getAnalysisType(): AnalysisType {
    return 'testing';
  }

  async analyze(context: EnhancedPRContext, enhancedPrompt?: string): Promise<SpecializedAnalysis> {
    console.log('🧪 Starting testing analysis with real LLM...');
    
    try {
      // Use enhanced prompt if provided, otherwise build context-aware prompt
      let finalPrompt: string;
      
      if (enhancedPrompt) {
        console.log('🎯 Using provided enhanced prompt for testing analysis');
        finalPrompt = enhancedPrompt;
      } else {
        // Build dynamic, context-aware prompt
        console.log('🎯 Building context-aware testing analysis prompt...');
        const contextualPrompt = await this.promptBuilder.buildContextualPrompt(
          'testing',
          context
        );
        
        // Enhance prompt with language/framework-specific guidance
        finalPrompt = await this.contextEnhancer.enhancePromptForContext(
          contextualPrompt.content,
          'testing',
          context
        );
      }
      
      // Get LLM analysis with enhanced prompt
      console.log('🤖 Calling LM Studio with enhanced context-aware prompt');
      const llmResponse = await this.llmService.generateAnalysis(
        'testing',
        context,
        finalPrompt
      );
      
      console.log(`✅ LLM response received (${llmResponse.analysis.length} characters)`);
      
      // Parse LLM response into structured analysis
      const analysis = this.parseLLMResponse(llmResponse.analysis);
      
      // Perform additional testing analysis
      const testCoverage = await this.analyzeTestCoverage(context);
      const testQuality = await this.assessTestQuality(context);
      const missingTests = await this.identifyMissingTests(context);
      const edgeCases = await this.identifyEdgeCases(context);
      const integrationTesting = await this.assessIntegrationNeeds(context);
      const testMaintainability = await this.assessTestMaintainability(context);
      
      // Create findings
      const findings = this.createFindings([
        ...analysis.findings,
        ...testCoverage.findings,
        ...testQuality.findings,
        ...missingTests.findings,
        ...edgeCases.findings,
        ...integrationTesting.findings,
        ...testMaintainability.findings
      ]);
      
      // Create recommendations
      const recommendations = this.createRecommendations([
        ...analysis.recommendations,
        ...testCoverage.recommendations,
        ...testQuality.recommendations,
        ...missingTests.recommendations,
        ...edgeCases.recommendations,
        ...integrationTesting.recommendations,
        ...testMaintainability.recommendations
      ]);
      
      const confidence = this.calculateConfidence(findings, recommendations);
      const riskLevel = this.assessRiskLevel(findings);
      
      console.log(`✅ LLM testing analysis completed (confidence: ${(confidence * 100).toFixed(1)}%)`);
      
      return {
        type: 'testing',
        findings,
        recommendations,
        riskLevel: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        confidence
      };
      
    } catch (error) {
      console.error('❌ Testing analysis failed:', error);
      return this.createFallbackAnalysis('testing', error);
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
      id: `test-finding-${index}`,
      type: data.type || 'testing',
      severity: this.mapSeverity(data.severity || 'minor'),
      message: data.message || 'Testing issue detected',
      file: data.file || 'unknown',
      lineNumber: data.lineNumber || 0,
      evidence: Array.isArray(data.evidence) ? data.evidence : [data.evidence || 'No evidence provided'],
      confidence: 0.7
    }));
  }

  private createRecommendations(recData: any[]): Recommendation[] {
    return recData.map((data, index) => ({
      id: `test-rec-${index}`,
      priority: this.mapPriority(data.priority || 'medium'),
      category: data.type || 'testing',
      description: data.description || 'Testing improvement needed',
      rationale: data.testCases || 'Will improve test coverage',
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

  private buildTestingPrompt(context: EnhancedPRContext): string {
    const changedFiles = Array.from(context.completeFiles.keys());
    const fileContents = Array.from(context.completeFiles.entries())
      .map(([file, content]) => `### ${file}\n\`\`\`\n${content.substring(0, 2000)}\`\`\``)
      .join('\n\n');

    return `# Testing Quality Analysis Task

You are a senior QA engineer conducting a comprehensive testing analysis of code changes.

## Repository Context
- **Architecture**: ${context.repositoryMetadata.architecture}
- **Language**: ${context.repositoryMetadata.language}
- **Framework**: ${context.repositoryMetadata.framework}

## Changed Files
${changedFiles.map(file => `- ${file}`).join('\n')}

## Complete File Contents
${fileContents}

## Analysis Requirements

Conduct a thorough testing analysis focusing on:

1. **Test Coverage**: Analyze existing test coverage and identify gaps
2. **Test Quality**: Evaluate test effectiveness, maintainability, and reliability
3. **Missing Tests**: Identify areas that need additional test coverage
4. **Edge Cases**: Identify potential edge cases that should be tested
5. **Integration Testing**: Assess need for integration and end-to-end tests
6. **Test Maintainability**: Evaluate test code quality and maintainability

## Response Format

Provide your analysis in the following JSON structure:

\`\`\`json
{
  "findings": [
    {
      "type": "coverage" | "quality" | "missing" | "edge-case" | "integration" | "maintainability",
      "severity": "critical" | "major" | "minor",
      "message": "Detailed description of the testing issue",
      "file": "filename",
      "lineNumber": number,
      "evidence": "Code snippet or explanation supporting the finding"
    }
  ],
  "recommendations": [
    {
      "type": "unit-test" | "integration-test" | "e2e-test" | "refactoring" | "tooling",
      "priority": "high" | "medium" | "low",
      "description": "Specific recommendation to improve testing",
      "implementation": "How to implement this recommendation",
      "testCases": "Specific test cases to add"
    }
  ]
}
\`\`\`

Focus on actionable testing improvements and specific test cases to implement.`;
  }

  private async analyzeTestCoverage(context: EnhancedPRContext): Promise<any> {
    console.log('📊 Analyzing test coverage...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Identify test files and source files
    const testFiles = Array.from(context.completeFiles.keys()).filter(file => 
      file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__')
    );
    
    const sourceFiles = Array.from(context.completeFiles.keys()).filter(file => 
      !file.includes('.test.') && !file.includes('.spec.') && !file.includes('__tests__') &&
      (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx'))
    );
    
    // Calculate coverage ratio
    const coverageRatio = testFiles.length / Math.max(sourceFiles.length, 1);
    
    if (coverageRatio < 0.5) {
      findings.push({
        type: 'coverage',
        severity: 'major',
        message: `Low test coverage ratio: ${testFiles.length} test files for ${sourceFiles.length} source files`,
        file: 'multiple',
        lineNumber: 0,
        evidence: `Test files: ${testFiles.join(', ')}`
      });
      
      recommendations.push({
        type: 'unit-test',
        priority: 'high',
        description: 'Increase test coverage by adding unit tests for uncovered modules',
        implementation: 'Create test files for each source file following naming conventions',
        testCases: 'Add tests for all public methods and critical business logic'
      });
    }
    
    // Analyze individual file coverage
    for (const sourceFile of sourceFiles) {
      const hasCorrespondingTest = this.hasCorrespondingTestFile(sourceFile, testFiles);
      
      if (!hasCorrespondingTest) {
        findings.push({
          type: 'missing',
          severity: 'minor',
          message: `No corresponding test file found for ${sourceFile}`,
          file: sourceFile,
          lineNumber: 0,
          evidence: 'Source file without test coverage'
        });
        
        recommendations.push({
          type: 'unit-test',
          priority: 'medium',
          description: `Create test file for ${sourceFile}`,
          implementation: `Create ${this.getTestFileName(sourceFile)} with comprehensive test cases`,
          testCases: 'Test all exported functions, classes, and edge cases'
        });
      }
    }
    
    return { findings, recommendations };
  }

  private async assessTestQuality(context: EnhancedPRContext): Promise<any> {
    console.log('🔍 Assessing test quality...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Analyze test files for quality issues
    for (const [file, content] of context.completeFiles) {
      if (this.isTestFile(file)) {
        const qualityIssues = this.analyzeTestFileQuality(content, file);
        findings.push(...qualityIssues.findings);
        recommendations.push(...qualityIssues.recommendations);
      }
    }
    
    return { findings, recommendations };
  }

  private async identifyMissingTests(context: EnhancedPRContext): Promise<any> {
    console.log('🔍 Identifying missing tests...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Analyze source files for untested functionality
    for (const [file, content] of context.completeFiles) {
      if (!this.isTestFile(file)) {
        const missingTests = this.identifyUntestedFunctionality(content, file);
        findings.push(...missingTests.findings);
        recommendations.push(...missingTests.recommendations);
      }
    }
    
    return { findings, recommendations };
  }

  private async identifyEdgeCases(context: EnhancedPRContext): Promise<any> {
    console.log('🎯 Identifying edge cases...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Analyze code for potential edge cases
    for (const [file, content] of context.completeFiles) {
      if (!this.isTestFile(file)) {
        const edgeCases = this.identifyPotentialEdgeCases(content, file);
        findings.push(...edgeCases.findings);
        recommendations.push(...edgeCases.recommendations);
      }
    }
    
    return { findings, recommendations };
  }

  private async assessIntegrationNeeds(context: EnhancedPRContext): Promise<any> {
    console.log('🔗 Assessing integration testing needs...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Look for integration points that need testing
    const integrationPoints = this.identifyIntegrationPoints(context);
    
    if (integrationPoints.length > 0) {
      findings.push({
        type: 'integration',
        severity: 'major',
        message: `Identified ${integrationPoints.length} integration points that may need testing`,
        file: 'multiple',
        lineNumber: 0,
        evidence: integrationPoints.join(', ')
      });
      
      recommendations.push({
        type: 'integration-test',
        priority: 'high',
        description: 'Add integration tests for identified integration points',
        implementation: 'Create integration test suite covering API endpoints, database interactions, and external services',
        testCases: 'Test data flow between components and error handling'
      });
    }
    
    return { findings, recommendations };
  }

  private async assessTestMaintainability(context: EnhancedPRContext): Promise<any> {
    console.log('🔧 Assessing test maintainability...');
    
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Analyze test files for maintainability issues
    for (const [file, content] of context.completeFiles) {
      if (this.isTestFile(file)) {
        const maintainabilityIssues = this.analyzeMaintainabilityIssues(content, file);
        findings.push(...maintainabilityIssues.findings);
        recommendations.push(...maintainabilityIssues.recommendations);
      }
    }
    
    return { findings, recommendations };
  }

  // Helper methods for specific analysis
  private hasCorrespondingTestFile(sourceFile: string, testFiles: string[]): boolean {
    const baseName = sourceFile.replace(/\.(js|ts|jsx|tsx)$/, '');
    const possibleTestNames = [
      `${baseName}.test.js`,
      `${baseName}.test.ts`,
      `${baseName}.spec.js`,
      `${baseName}.spec.ts`,
      `__tests__/${baseName}.test.js`,
      `__tests__/${baseName}.test.ts`
    ];
    
    return testFiles.some(testFile => 
      possibleTestNames.some(testName => testFile.includes(testName))
    );
  }

  private getTestFileName(sourceFile: string): string {
    const baseName = sourceFile.replace(/\.(js|ts|jsx|tsx)$/, '');
    const extension = sourceFile.endsWith('.ts') || sourceFile.endsWith('.tsx') ? '.ts' : '.js';
    return `${baseName}.test${extension}`;
  }

  private isTestFile(file: string): boolean {
    return file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__');
  }

  private analyzeTestFileQuality(content: string, file: string): any {
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Check for test structure and organization
    const testBlocks = content.match(/(?:describe|it|test)\s*\(/g);
    const testCount = testBlocks ? testBlocks.length : 0;
    
    if (testCount < 3) {
      findings.push({
        type: 'quality',
        severity: 'minor',
        message: `Test file has only ${testCount} test cases - consider adding more comprehensive tests`,
        file,
        lineNumber: 0,
        evidence: 'Low number of test cases'
      });
      
      recommendations.push({
        type: 'unit-test',
        priority: 'medium',
        description: 'Add more comprehensive test cases',
        implementation: 'Include tests for happy path, error cases, and edge cases',
        testCases: 'Add at least 5-10 test cases per function'
      });
    }
    
    // Check for assertion quality
    const assertions = content.match(/(?:expect|assert)\s*\(/g);
    const assertionCount = assertions ? assertions.length : 0;
    
    if (assertionCount < testCount) {
      findings.push({
        type: 'quality',
        severity: 'major',
        message: 'Some tests may be missing assertions',
        file,
        lineNumber: 0,
        evidence: `${testCount} tests but only ${assertionCount} assertions`
      });
      
      recommendations.push({
        type: 'refactoring',
        priority: 'high',
        description: 'Ensure all tests have proper assertions',
        implementation: 'Add expect() or assert() statements to verify test outcomes',
        testCases: 'Each test should have at least one meaningful assertion'
      });
    }
    
    // Check for test isolation (no shared state)
    const sharedVariables = content.match(/let\s+\w+\s*;|var\s+\w+\s*;/g);
    if (sharedVariables && sharedVariables.length > 2) {
      findings.push({
        type: 'quality',
        severity: 'minor',
        message: 'Tests may have shared state that could cause flaky tests',
        file,
        lineNumber: 0,
        evidence: 'Multiple shared variables detected'
      });
      
      recommendations.push({
        type: 'refactoring',
        priority: 'medium',
        description: 'Improve test isolation by reducing shared state',
        implementation: 'Use beforeEach/afterEach hooks or move variables inside test blocks',
        testCases: 'Ensure each test is independent and can run in isolation'
      });
    }
    
    return { findings, recommendations };
  }

  private identifyUntestedFunctionality(content: string, file: string): any {
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Extract functions that might need testing
    const functions = this.extractFunctions(content);
    const exportedFunctions = functions.filter(func => 
      content.includes(`export ${func}`) || content.includes(`export function ${func}`)
    );
    
    if (exportedFunctions.length > 0) {
      findings.push({
        type: 'missing',
        severity: 'minor',
        message: `Found ${exportedFunctions.length} exported functions that may need testing`,
        file,
        lineNumber: 0,
        evidence: `Functions: ${exportedFunctions.join(', ')}`
      });
      
      recommendations.push({
        type: 'unit-test',
        priority: 'medium',
        description: 'Add unit tests for exported functions',
        implementation: `Create test cases for: ${exportedFunctions.join(', ')}`,
        testCases: 'Test normal operation, error conditions, and boundary values'
      });
    }
    
    // Check for error handling that needs testing
    const errorHandling = content.match(/try\s*{|catch\s*\(|throw\s+/g);
    if (errorHandling && errorHandling.length > 0) {
      recommendations.push({
        type: 'unit-test',
        priority: 'high',
        description: 'Add tests for error handling scenarios',
        implementation: 'Create test cases that trigger error conditions',
        testCases: 'Test exception throwing, error catching, and error recovery'
      });
    }
    
    return { findings, recommendations };
  }

  private identifyPotentialEdgeCases(content: string, file: string): any {
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Look for array operations that need boundary testing
    const arrayOps = content.match(/\.length|\.push\(|\.pop\(|\.shift\(|\.unshift\(|\[.*\]/g);
    if (arrayOps && arrayOps.length > 0) {
      recommendations.push({
        type: 'unit-test',
        priority: 'medium',
        description: 'Add edge case tests for array operations',
        implementation: 'Test with empty arrays, single elements, and large arrays',
        testCases: 'Test array bounds, empty arrays, null/undefined values'
      });
    }
    
    // Look for string operations that need edge case testing
    const stringOps = content.match(/\.substring\(|\.slice\(|\.split\(|\.replace\(/g);
    if (stringOps && stringOps.length > 0) {
      recommendations.push({
        type: 'unit-test',
        priority: 'medium',
        description: 'Add edge case tests for string operations',
        implementation: 'Test with empty strings, special characters, and very long strings',
        testCases: 'Test empty strings, null values, special characters, unicode'
      });
    }
    
    // Look for numeric operations that need boundary testing
    const numericOps = content.match(/[+\-*/]\s*\d|Math\.|parseInt\(|parseFloat\(/g);
    if (numericOps && numericOps.length > 0) {
      recommendations.push({
        type: 'unit-test',
        priority: 'medium',
        description: 'Add edge case tests for numeric operations',
        implementation: 'Test with zero, negative numbers, infinity, and NaN',
        testCases: 'Test boundary values: 0, -1, Infinity, NaN, very large numbers'
      });
    }
    
    return { findings, recommendations };
  }

  private identifyIntegrationPoints(context: EnhancedPRContext): string[] {
    const integrationPoints: string[] = [];
    
    for (const [file, content] of context.completeFiles) {
      // API endpoints
      if (content.includes('app.get') || content.includes('app.post') || content.includes('router.')) {
        integrationPoints.push(`API endpoints in ${file}`);
      }
      
      // Database operations
      if (content.includes('query') || content.includes('findOne') || content.includes('save')) {
        integrationPoints.push(`Database operations in ${file}`);
      }
      
      // External service calls
      if (content.includes('fetch(') || content.includes('axios.') || content.includes('http.')) {
        integrationPoints.push(`External service calls in ${file}`);
      }
      
      // File system operations
      if (content.includes('fs.') || content.includes('readFile') || content.includes('writeFile')) {
        integrationPoints.push(`File system operations in ${file}`);
      }
    }
    
    return integrationPoints;
  }

  private analyzeMaintainabilityIssues(content: string, file: string): any {
    const findings: any[] = [];
    const recommendations: any[] = [];
    
    // Check for test duplication
    const testBodies = content.match(/it\s*\([^)]*\)\s*=>\s*{([^}]*)}/g);
    if (testBodies && testBodies.length > 1) {
      const duplicatedCode = this.findDuplicatedTestCode(testBodies);
      if (duplicatedCode.length > 0) {
        findings.push({
          type: 'maintainability',
          severity: 'minor',
          message: 'Duplicated test code detected',
          file,
          lineNumber: 0,
          evidence: 'Similar test setup or assertions found'
        });
        
        recommendations.push({
          type: 'refactoring',
          priority: 'medium',
          description: 'Extract common test setup into helper functions',
          implementation: 'Create test utilities and use beforeEach hooks for common setup',
          testCases: 'Reduce code duplication while maintaining test clarity'
        });
      }
    }
    
    // Check for overly complex tests
    const complexTests = content.match(/it\s*\([^)]*\)\s*=>\s*{[^}]{200,}}/g);
    if (complexTests && complexTests.length > 0) {
      findings.push({
        type: 'maintainability',
        severity: 'minor',
        message: `Found ${complexTests.length} potentially complex test cases`,
        file,
        lineNumber: 0,
        evidence: 'Tests with more than 200 characters may be too complex'
      });
      
      recommendations.push({
        type: 'refactoring',
        priority: 'low',
        description: 'Break down complex tests into smaller, focused tests',
        implementation: 'Split large tests into multiple smaller tests with clear purposes',
        testCases: 'Each test should focus on a single behavior or scenario'
      });
    }
    
    return { findings, recommendations };
  }

  private extractFunctions(content: string): string[] {
    const functions: string[] = [];
    
    // Function declarations
    const functionDeclarations = content.match(/function\s+(\w+)\s*\(/g);
    if (functionDeclarations) {
      functions.push(...functionDeclarations.map(match => match.match(/function\s+(\w+)/)?.[1] || ''));
    }
    
    // Arrow functions
    const arrowFunctions = content.match(/(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g);
    if (arrowFunctions) {
      functions.push(...arrowFunctions.map(match => match.match(/(\w+)\s*=/)?.[1] || ''));
    }
    
    return functions.filter(f => f.length > 0);
  }

  private findDuplicatedTestCode(testBodies: string[]): string[] {
    const duplicates: string[] = [];
    
    for (let i = 0; i < testBodies.length; i++) {
      for (let j = i + 1; j < testBodies.length; j++) {
        const similarity = this.calculateSimilarity(testBodies[i], testBodies[j]);
        if (similarity > 0.7) {
          duplicates.push(`Tests ${i + 1} and ${j + 1} are ${(similarity * 100).toFixed(0)}% similar`);
        }
      }
    }
    
    return duplicates;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  async validate(analysis: SpecializedAnalysis): Promise<ValidationResult> {
    console.log('🔍 Validating testing analysis...');
    
    const validation: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 0.8
    };
    
    // Validate findings have proper test context
    const findingsWithoutTestContext = analysis.findings.filter(f => 
      !f.evidence || !f.evidence.includes('test')
    );
    if (findingsWithoutTestContext.length > 0) {
      validation.warnings.push(`${findingsWithoutTestContext.length} findings lack test-specific context`);
      validation.score *= 0.9;
    }
    
    // Validate recommendations include specific test cases
    const vagueTestRecommendations = analysis.recommendations.filter(r => 
      !r.rationale || r.rationale.length < 20
    );
    if (vagueTestRecommendations.length > 0) {
      validation.warnings.push(`${vagueTestRecommendations.length} recommendations lack specific test cases`);
      validation.score *= 0.9;
    }
    
    // Check for testing-specific validation
    const testingFindings = analysis.findings.filter(f => 
      ['coverage', 'quality', 'missing', 'edge-case', 'integration'].includes(f.type)
    );
    
    if (testingFindings.length === 0) {
      validation.warnings.push('No testing-specific findings identified');
      validation.score *= 0.8;
    }
    
    validation.isValid = validation.score > 0.6;
    
    return validation;
  }

  async refine(analysis: SpecializedAnalysis, feedback: any): Promise<SpecializedAnalysis> {
    console.log('🔧 Refining testing analysis based on feedback...');
    
    // Apply feedback to improve analysis
    if (feedback.suggestions && feedback.suggestions.includes('more test cases')) {
      // Add more specific test case recommendations
      analysis.recommendations.forEach(rec => {
        if (!rec.rationale.includes('edge cases')) {
          rec.rationale += '. Include edge cases: empty inputs, null values, boundary conditions.';
        }
      });
    }
    
    if (feedback.suggestions && feedback.suggestions.includes('integration focus')) {
      // Enhance integration testing recommendations
      const integrationRec = analysis.recommendations.find(r => r.category === 'integration-test');
      if (integrationRec) {
        integrationRec.implementation += ' Focus on end-to-end workflows and data consistency.';
      }
    }
    
    // Recalculate confidence after refinement
    analysis.confidence = this.calculateConfidence(analysis.findings, analysis.recommendations);
    
    return analysis;
  }
}
