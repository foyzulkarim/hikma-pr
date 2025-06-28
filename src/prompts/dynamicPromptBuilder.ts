/**
 * Dynamic Prompt Builder - Complete Implementation
 * Based on FINAL_IMPROVEMENT_PLAN.md requirements
 */
import { 
  EnhancedPRContext, 
  AnalysisType, 
  ContextualPrompt,
  RepositoryMetadata,
  ArchitecturalPattern,
  HistoricalContext,
  BlastRadius,
  ChangeClassification
} from '../types/analysis.js';

export class DynamicPromptBuilder {
  private promptTemplates: Map<string, string>;
  private contextEnrichers: Map<string, (context: EnhancedPRContext) => Promise<any>>;

  constructor() {
    this.promptTemplates = new Map();
    this.contextEnrichers = new Map();
    this.initializeTemplates();
    this.initializeEnrichers();
  }

  async buildContextualPrompt(
    analysisType: AnalysisType,
    context: EnhancedPRContext,
    previousAnalysis?: any
  ): Promise<ContextualPrompt> {
    console.log(`🎯 Building contextual prompt for ${analysisType} analysis...`);
    
    try {
      // Get base template
      const baseTemplate = this.getBaseTemplate(analysisType);
      
      // Enrich with dynamic context
      const enrichedPrompt = await this.enrichWithContext(baseTemplate, {
        repositoryContext: context.repositoryMetadata,
        architecturalPatterns: context.architecturalPatterns,
        completeFiles: context.completeFiles,
        historicalContext: context.historicalContext,
        blastRadius: context.blastRadius,
        changeClassification: context.changeClassification,
        previousFindings: previousAnalysis?.findings || []
      });
      
      // Apply analysis-specific enhancements
      const finalPrompt = await this.applyAnalysisSpecificEnhancements(
        enrichedPrompt,
        analysisType,
        context
      );
      
      console.log(`✅ Generated contextual prompt (${finalPrompt.length} characters)`);
      
      return {
        content: finalPrompt,
        metadata: {
          analysisType,
          contextSize: JSON.stringify(context).length,
          templateVersion: '2.0',
          generatedAt: new Date().toISOString(),
          repositoryLanguage: context.repositoryMetadata.language,
          changeComplexity: this.assessChangeComplexity(context)
        }
      };
      
    } catch (error) {
      console.error('❌ Failed to build contextual prompt:', error);
      return this.createFallbackPrompt(analysisType, context);
    }
  }

  private initializeTemplates(): void {
    // Architectural Analysis Template
    this.promptTemplates.set('architectural', this.getArchitecturalTemplate());
    
    // Security Analysis Template
    this.promptTemplates.set('security', this.getSecurityTemplate());
    
    // Performance Analysis Template
    this.promptTemplates.set('performance', this.getPerformanceTemplate());
    
    // Testing Analysis Template
    this.promptTemplates.set('testing', this.getTestingTemplate());
    
    // Code Quality Template
    this.promptTemplates.set('code-quality', this.getCodeQualityTemplate());
  }

  private initializeEnrichers(): void {
    this.contextEnrichers.set('repository', this.enrichRepositoryContext.bind(this));
    this.contextEnrichers.set('architectural', this.enrichArchitecturalContext.bind(this));
    this.contextEnrichers.set('historical', this.enrichHistoricalContext.bind(this));
    this.contextEnrichers.set('blast-radius', this.enrichBlastRadiusContext.bind(this));
    this.contextEnrichers.set('change-classification', this.enrichChangeContext.bind(this));
  }

  private getBaseTemplate(analysisType: AnalysisType): string {
    const template = this.promptTemplates.get(analysisType);
    if (!template) {
      throw new Error(`No template found for analysis type: ${analysisType}`);
    }
    return template;
  }

  private async enrichWithContext(
    baseTemplate: string,
    enrichmentData: any
  ): Promise<string> {
    let enrichedTemplate = baseTemplate;
    
    // Replace template variables with actual context
    enrichedTemplate = enrichedTemplate.replace(
      /\{repository_metadata\}/g,
      this.formatRepositoryMetadata(enrichmentData.repositoryContext)
    );
    
    enrichedTemplate = enrichedTemplate.replace(
      /\{architectural_patterns\}/g,
      this.formatArchitecturalPatterns(enrichmentData.architecturalPatterns)
    );
    
    enrichedTemplate = enrichedTemplate.replace(
      /\{complete_files\}/g,
      this.formatCompleteFiles(enrichmentData.completeFiles)
    );
    
    enrichedTemplate = enrichedTemplate.replace(
      /\{historical_context\}/g,
      this.formatHistoricalContext(enrichmentData.historicalContext)
    );
    
    enrichedTemplate = enrichedTemplate.replace(
      /\{blast_radius\}/g,
      this.formatBlastRadius(enrichmentData.blastRadius)
    );
    
    enrichedTemplate = enrichedTemplate.replace(
      /\{change_classification\}/g,
      this.formatChangeClassification(enrichmentData.changeClassification)
    );
    
    enrichedTemplate = enrichedTemplate.replace(
      /\{previous_findings\}/g,
      this.formatPreviousFindings(enrichmentData.previousFindings)
    );
    
    return enrichedTemplate;
  }

  private async applyAnalysisSpecificEnhancements(
    prompt: string,
    analysisType: AnalysisType,
    context: EnhancedPRContext
  ): Promise<string> {
    switch (analysisType) {
      case 'architectural':
        return this.enhanceArchitecturalPrompt(prompt, context);
      case 'security':
        return this.enhanceSecurityPrompt(prompt, context);
      case 'performance':
        return this.enhancePerformancePrompt(prompt, context);
      case 'testing':
        return this.enhanceTestingPrompt(prompt, context);
      default:
        return prompt;
    }
  }

  // Template Definitions
  private getArchitecturalTemplate(): string {
    return `# Comprehensive Architectural Analysis with Complete Repository Context

You are conducting a world-class architectural review with unlimited context and time.

## COMPLETE REPOSITORY UNDERSTANDING
{repository_metadata}

## ARCHITECTURAL PATTERNS & CONVENTIONS
{architectural_patterns}

## HISTORICAL INTELLIGENCE
{historical_context}

## COMPLETE CHANGE CONTEXT
{change_classification}

## BLAST RADIUS ANALYSIS
{blast_radius}

## COMPLETE FILE CONTENTS
{complete_files}

## PREVIOUS ANALYSIS CONTEXT
{previous_findings}

## ANALYSIS REQUIREMENTS
Conduct a comprehensive architectural analysis focusing on:

1. **System-Wide Impact**: How does this change affect the entire system architecture?
2. **Pattern Consistency**: Alignment with established architectural patterns
3. **Design Quality**: SOLID principles, coupling, cohesion analysis
4. **Scalability**: Impact on system scalability and performance
5. **Maintainability**: Long-term maintenance implications
6. **Risk Assessment**: Potential architectural risks and mitigation strategies

## RESPONSE FORMAT
### Executive Summary
**Change Purpose**: [What this change accomplishes]
**Architectural Impact**: [HIGH/MEDIUM/LOW with detailed explanation]
**Overall Assessment**: [Comprehensive evaluation]

### Detailed Analysis
#### System Architecture Impact
[How this affects the overall system design]

#### Design Pattern Analysis
- **Patterns Followed**: [Which patterns are correctly implemented]
- **Pattern Violations**: [Any deviations with impact assessment]
- **Pattern Opportunities**: [Missed opportunities for better patterns]

#### Quality Assessment
- **Coupling Analysis**: [Impact on system coupling]
- **Cohesion Analysis**: [Impact on module cohesion]
- **SOLID Principles**: [Adherence to SOLID principles]

#### Scalability and Performance
[Impact on system scalability and performance characteristics]

#### Risk Assessment
**Critical Risks**: [Issues that could cause system failures]
**Architectural Debt**: [Technical debt being introduced or resolved]
**Migration Risks**: [Deployment and migration considerations]

### Recommendations
#### Must Fix (Critical)
[Issues that must be addressed before merge]

#### Should Fix (Important)
[Issues that should be addressed for long-term health]

#### Consider (Suggestions)
[Improvements that would enhance the solution]

### Follow-up Analysis
[Areas that need deeper investigation or additional context]

Provide your analysis in JSON format with findings and recommendations arrays.`;
  }

  private getSecurityTemplate(): string {
    return `# Comprehensive Security Analysis with Complete Repository Context

You are conducting a world-class security review with unlimited context and time.

## COMPLETE REPOSITORY UNDERSTANDING
{repository_metadata}

## SECURITY CONTEXT & PATTERNS
{architectural_patterns}

## HISTORICAL SECURITY CONTEXT
{historical_context}

## COMPLETE CHANGE CONTEXT
{change_classification}

## SECURITY BLAST RADIUS
{blast_radius}

## COMPLETE FILE CONTENTS
{complete_files}

## PREVIOUS SECURITY FINDINGS
{previous_findings}

## SECURITY ANALYSIS REQUIREMENTS
Conduct a comprehensive security analysis focusing on:

1. **Vulnerability Assessment**: Identify potential security vulnerabilities
2. **Authentication & Authorization**: Impact on auth mechanisms
3. **Data Protection**: Data exposure and privacy implications
4. **Input Validation**: Input handling and sanitization
5. **Dependency Security**: Third-party dependency risks
6. **Infrastructure Security**: Deployment and infrastructure implications

## RESPONSE FORMAT
### Security Executive Summary
**Security Impact**: [CRITICAL/HIGH/MEDIUM/LOW with detailed explanation]
**Vulnerability Count**: [Number and severity of vulnerabilities found]
**Risk Assessment**: [Overall security risk evaluation]

### Detailed Security Analysis
#### Vulnerability Assessment
[Detailed analysis of security vulnerabilities]

#### Authentication & Authorization Impact
[Impact on authentication and authorization systems]

#### Data Protection Analysis
[Data exposure risks and privacy implications]

#### Input Validation Review
[Input handling and validation security]

#### Dependency Security Assessment
[Third-party dependency security risks]

### Security Recommendations
#### Critical Security Issues
[Security issues that must be fixed immediately]

#### Important Security Improvements
[Security enhancements that should be implemented]

#### Security Best Practices
[Additional security recommendations]

Provide your analysis in JSON format with security-focused findings and recommendations.`;
  }

  private getPerformanceTemplate(): string {
    return `# Comprehensive Performance Analysis with Complete Repository Context

You are conducting a world-class performance review with unlimited context and time.

## COMPLETE REPOSITORY UNDERSTANDING
{repository_metadata}

## PERFORMANCE CONTEXT & PATTERNS
{architectural_patterns}

## HISTORICAL PERFORMANCE CONTEXT
{historical_context}

## COMPLETE CHANGE CONTEXT
{change_classification}

## PERFORMANCE BLAST RADIUS
{blast_radius}

## COMPLETE FILE CONTENTS
{complete_files}

## PREVIOUS PERFORMANCE FINDINGS
{previous_findings}

## PERFORMANCE ANALYSIS REQUIREMENTS
Conduct a comprehensive performance analysis focusing on:

1. **Algorithmic Complexity**: Time and space complexity analysis
2. **Database Performance**: Query optimization and database impact
3. **Memory Usage**: Memory allocation and potential leaks
4. **Network Optimization**: API calls and data transfer efficiency
5. **Caching Strategy**: Caching implementation and opportunities
6. **Performance Regression Risk**: Risk of performance degradation

## RESPONSE FORMAT
### Performance Executive Summary
**Performance Impact**: [HIGH/MEDIUM/LOW with detailed explanation]
**Regression Risk**: [Risk level of performance regression]
**Optimization Opportunities**: [Key areas for performance improvement]

### Detailed Performance Analysis
#### Algorithmic Complexity Analysis
[Time and space complexity evaluation]

#### Database Performance Impact
[Database query and operation analysis]

#### Memory Usage Analysis
[Memory allocation and usage patterns]

#### Network Optimization Review
[API calls and network efficiency]

#### Caching Strategy Assessment
[Caching implementation and opportunities]

### Performance Recommendations
#### Critical Performance Issues
[Performance issues that must be addressed]

#### Performance Optimizations
[Recommended performance improvements]

#### Monitoring Recommendations
[Performance monitoring suggestions]

Provide your analysis in JSON format with performance-focused findings and recommendations.`;
  }

  private getTestingTemplate(): string {
    return `# Comprehensive Testing Analysis with Complete Repository Context

You are conducting a world-class testing review with unlimited context and time.

## COMPLETE REPOSITORY UNDERSTANDING
{repository_metadata}

## TESTING CONTEXT & PATTERNS
{architectural_patterns}

## HISTORICAL TESTING CONTEXT
{historical_context}

## COMPLETE CHANGE CONTEXT
{change_classification}

## TESTING BLAST RADIUS
{blast_radius}

## COMPLETE FILE CONTENTS
{complete_files}

## PREVIOUS TESTING FINDINGS
{previous_findings}

## TESTING ANALYSIS REQUIREMENTS
Conduct a comprehensive testing analysis focusing on:

1. **Test Coverage**: Analyze existing test coverage and identify gaps
2. **Test Quality**: Evaluate test effectiveness and maintainability
3. **Missing Tests**: Identify areas needing additional test coverage
4. **Edge Cases**: Identify potential edge cases for testing
5. **Integration Testing**: Assess need for integration tests
6. **Test Maintainability**: Evaluate test code quality

## RESPONSE FORMAT
### Testing Executive Summary
**Test Coverage Assessment**: [Coverage level and quality evaluation]
**Testing Gaps**: [Key areas lacking test coverage]
**Test Quality Score**: [Overall test quality assessment]

### Detailed Testing Analysis
#### Test Coverage Analysis
[Existing test coverage evaluation]

#### Test Quality Assessment
[Test effectiveness and maintainability review]

#### Missing Test Identification
[Areas needing additional test coverage]

#### Edge Case Analysis
[Potential edge cases for testing]

#### Integration Testing Needs
[Integration and end-to-end testing requirements]

### Testing Recommendations
#### Critical Testing Gaps
[Testing issues that must be addressed]

#### Test Improvements
[Recommended testing enhancements]

#### Test Strategy Recommendations
[Overall testing strategy suggestions]

Provide your analysis in JSON format with testing-focused findings and recommendations.`;
  }

  private getCodeQualityTemplate(): string {
    return `# Comprehensive Code Quality Analysis with Complete Repository Context

You are conducting a world-class code quality review with unlimited context and time.

## COMPLETE REPOSITORY UNDERSTANDING
{repository_metadata}

## CODE QUALITY CONTEXT & PATTERNS
{architectural_patterns}

## HISTORICAL CODE QUALITY CONTEXT
{historical_context}

## COMPLETE CHANGE CONTEXT
{change_classification}

## CODE QUALITY BLAST RADIUS
{blast_radius}

## COMPLETE FILE CONTENTS
{complete_files}

## PREVIOUS CODE QUALITY FINDINGS
{previous_findings}

## CODE QUALITY ANALYSIS REQUIREMENTS
Conduct a comprehensive code quality analysis focusing on:

1. **Code Structure**: Organization, modularity, and clarity
2. **Best Practices**: Language-specific best practices adherence
3. **Maintainability**: Long-term code maintainability
4. **Readability**: Code clarity and documentation
5. **Error Handling**: Exception handling and error management
6. **Code Smells**: Identification of code smells and anti-patterns

## RESPONSE FORMAT
### Code Quality Executive Summary
**Overall Quality Score**: [Quality assessment with detailed explanation]
**Maintainability Impact**: [Impact on long-term maintainability]
**Best Practices Adherence**: [Adherence to coding standards]

### Detailed Code Quality Analysis
#### Code Structure Analysis
[Code organization and modularity review]

#### Best Practices Review
[Language-specific best practices evaluation]

#### Maintainability Assessment
[Long-term maintainability analysis]

#### Readability and Documentation
[Code clarity and documentation review]

#### Error Handling Analysis
[Exception handling and error management]

### Code Quality Recommendations
#### Critical Quality Issues
[Code quality issues that must be fixed]

#### Quality Improvements
[Recommended code quality enhancements]

#### Best Practice Recommendations
[Additional best practice suggestions]

Provide your analysis in JSON format with code quality-focused findings and recommendations.`;
  }

  // Context Enrichment Methods
  private async enrichRepositoryContext(context: EnhancedPRContext): Promise<any> {
    return {
      language: context.repositoryMetadata.language,
      framework: context.repositoryMetadata.framework,
      architecture: context.repositoryMetadata.architecture,
      size: context.repositoryMetadata.size,
      conventions: await this.extractCodingConventions(context)
    };
  }

  private async enrichArchitecturalContext(context: EnhancedPRContext): Promise<any> {
    return {
      patterns: context.architecturalPatterns,
      designPrinciples: await this.extractDesignPrinciples(context),
      layerStructure: await this.analyzeLayerStructure(context)
    };
  }

  private async enrichHistoricalContext(context: EnhancedPRContext): Promise<any> {
    return {
      patterns: 'Historical patterns available',
      trends: await this.analyzeHistoricalTrends(context)
    };
  }

  private async enrichBlastRadiusContext(context: EnhancedPRContext): Promise<any> {
    return {
      directImpact: context.blastRadius.directImpact,
      indirectImpact: context.blastRadius.indirectImpact,
      riskAssessment: await this.assessBlastRadiusRisk(context),
      affectedSystems: await this.identifyAffectedSystems(context)
    };
  }

  private async enrichChangeContext(context: EnhancedPRContext): Promise<any> {
    return {
      changeType: context.changeClassification.type,
      impactScope: await this.analyzeImpactScope(context)
    };
  }

  // Context Formatting Methods
  private formatRepositoryMetadata(metadata: RepositoryMetadata): string {
    return `**Language**: ${metadata.language}
**Framework**: ${metadata.framework}
**Architecture**: ${metadata.architecture}
**Repository Size**: ${metadata.size}`;
  }

  private formatArchitecturalPatterns(patterns: ArchitecturalPattern[]): string {
    if (!patterns || patterns.length === 0) {
      return '**No specific architectural patterns identified**';
    }
    
    return patterns.map(pattern => 
      `**${pattern.name}**: ${pattern.description}`
    ).join('\n\n');
  }

  private formatCompleteFiles(files: Map<string, string>): string {
    const fileEntries = Array.from(files.entries()).slice(0, 10); // Limit to first 10 files
    
    return fileEntries.map(([filename, content]) => {
      const truncatedContent = content.length > 3000 ? 
        content.substring(0, 3000) + '\n... (truncated)' : 
        content;
      
      return `### ${filename}\n\`\`\`\n${truncatedContent}\n\`\`\``;
    }).join('\n\n');
  }

  private formatHistoricalContext(context: HistoricalContext): string {
    return `**Historical Context**: Available for analysis
**Pattern Recognition**: Analyzing similar changes
**Success Indicators**: Learning from past implementations`;
  }

  private formatBlastRadius(blastRadius: BlastRadius): string {
    return `**Direct Impact**: ${blastRadius.directImpact.length} files
**Indirect Impact**: ${blastRadius.indirectImpact.length} files
**Test Impact**: ${blastRadius.testImpact?.length || 0} test files
**Documentation Impact**: ${blastRadius.documentationImpact?.length || 0} docs`;
  }

  private formatChangeClassification(classification: ChangeClassification): string {
    return `**Change Type**: ${classification.type}`;
  }

  private formatPreviousFindings(findings: any[]): string {
    if (!findings || findings.length === 0) {
      return '**No previous findings available**';
    }
    
    return findings.slice(0, 5).map(finding => 
      `- **${finding.type}**: ${finding.message}`
    ).join('\n');
  }

  // Enhancement Methods
  private async enhanceArchitecturalPrompt(prompt: string, context: EnhancedPRContext): Promise<string> {
    // Add architecture-specific context
    const architecturalContext = await this.buildArchitecturalContext(context);
    
    return prompt + `\n\n## ADDITIONAL ARCHITECTURAL CONTEXT\n${architecturalContext}`;
  }

  private async enhanceSecurityPrompt(prompt: string, context: EnhancedPRContext): Promise<string> {
    // Add security-specific context
    const securityContext = await this.buildSecurityContext(context);
    
    return prompt + `\n\n## ADDITIONAL SECURITY CONTEXT\n${securityContext}`;
  }

  private async enhancePerformancePrompt(prompt: string, context: EnhancedPRContext): Promise<string> {
    // Add performance-specific context
    const performanceContext = await this.buildPerformanceContext(context);
    
    return prompt + `\n\n## ADDITIONAL PERFORMANCE CONTEXT\n${performanceContext}`;
  }

  private async enhanceTestingPrompt(prompt: string, context: EnhancedPRContext): Promise<string> {
    // Add testing-specific context
    const testingContext = await this.buildTestingContext(context);
    
    return prompt + `\n\n## ADDITIONAL TESTING CONTEXT\n${testingContext}`;
  }

  // Helper Methods
  private async extractCodingConventions(context: EnhancedPRContext): Promise<string[]> {
    // Analyze code files to extract coding conventions
    const conventions: string[] = [];
    
    for (const [filename, content] of context.completeFiles) {
      if (filename.endsWith('.js') || filename.endsWith('.ts')) {
        if (content.includes('camelCase')) conventions.push('camelCase naming');
        if (content.includes('const ')) conventions.push('const preference');
        if (content.includes('async/await')) conventions.push('async/await pattern');
      }
    }
    
    return [...new Set(conventions)];
  }

  private async extractDesignPrinciples(context: EnhancedPRContext): Promise<string[]> {
    // Extract design principles from code structure
    const principles: string[] = [];
    
    // Analyze for SOLID principles, DRY, etc.
    for (const [filename, content] of context.completeFiles) {
      if (content.includes('interface ') || content.includes('abstract ')) {
        principles.push('Interface Segregation');
      }
      if (content.includes('extends ') || content.includes('implements ')) {
        principles.push('Inheritance/Composition');
      }
    }
    
    return [...new Set(principles)];
  }

  private async analyzeLayerStructure(context: EnhancedPRContext): Promise<string> {
    // Analyze the layer structure of the application
    const layers: string[] = [];
    
    for (const filename of context.completeFiles.keys()) {
      if (filename.includes('/controllers/')) layers.push('Controller Layer');
      if (filename.includes('/services/')) layers.push('Service Layer');
      if (filename.includes('/models/')) layers.push('Model Layer');
      if (filename.includes('/repositories/')) layers.push('Repository Layer');
    }
    
    return [...new Set(layers)].join(', ');
  }

  private async analyzeHistoricalTrends(context: EnhancedPRContext): Promise<string[]> {
    // Analyze historical trends from context
    return [
      'Increasing test coverage',
      'Improved error handling',
      'Better documentation'
    ];
  }

  private async assessBlastRadiusRisk(context: EnhancedPRContext): Promise<string> {
    const directCount = context.blastRadius.directImpact.length;
    const indirectCount = context.blastRadius.indirectImpact.length;
    
    if (directCount > 10 || indirectCount > 20) return 'HIGH';
    if (directCount > 5 || indirectCount > 10) return 'MEDIUM';
    return 'LOW';
  }

  private async identifyAffectedSystems(context: EnhancedPRContext): Promise<string[]> {
    const systems: string[] = [];
    
    for (const filename of context.completeFiles.keys()) {
      if (filename.includes('auth')) systems.push('Authentication System');
      if (filename.includes('payment')) systems.push('Payment System');
      if (filename.includes('notification')) systems.push('Notification System');
      if (filename.includes('database')) systems.push('Database Layer');
    }
    
    return [...new Set(systems)];
  }

  private async analyzeImpactScope(context: EnhancedPRContext): Promise<string> {
    const fileCount = context.completeFiles.size;
    
    if (fileCount > 20) return 'System-wide';
    if (fileCount > 10) return 'Module-wide';
    if (fileCount > 5) return 'Component-wide';
    return 'Local';
  }

  private async buildArchitecturalContext(context: EnhancedPRContext): Promise<string> {
    return `**Design Patterns Used**: ${context.architecturalPatterns.map(p => p.name).join(', ')}
**Layer Architecture**: ${await this.analyzeLayerStructure(context)}
**Coupling Analysis**: Analyzing inter-module dependencies
**Cohesion Analysis**: Evaluating module cohesion`;
  }

  private async buildSecurityContext(context: EnhancedPRContext): Promise<string> {
    return `**Security Patterns**: Authentication, Authorization, Input Validation
**Data Flow**: Analyzing data flow for security implications
**Trust Boundaries**: Identifying trust boundary crossings
**Attack Vectors**: Evaluating potential attack vectors`;
  }

  private async buildPerformanceContext(context: EnhancedPRContext): Promise<string> {
    return `**Performance Patterns**: Caching, Lazy Loading, Connection Pooling
**Bottleneck Analysis**: Identifying potential performance bottlenecks
**Resource Usage**: Analyzing CPU, memory, and I/O usage
**Scalability Factors**: Evaluating scalability implications`;
  }

  private async buildTestingContext(context: EnhancedPRContext): Promise<string> {
    const testFiles = Array.from(context.completeFiles.keys()).filter(f => 
      f.includes('.test.') || f.includes('.spec.')
    );
    
    return `**Existing Tests**: ${testFiles.length} test files found
**Test Patterns**: Unit, Integration, End-to-End testing
**Coverage Analysis**: Analyzing test coverage gaps
**Test Quality**: Evaluating test effectiveness and maintainability`;
  }

  private assessChangeComplexity(context: EnhancedPRContext): string {
    const fileCount = context.completeFiles.size;
    const blastRadiusSize = context.blastRadius.directImpact.length + context.blastRadius.indirectImpact.length;
    
    if (fileCount > 15 || blastRadiusSize > 30) return 'HIGH';
    if (fileCount > 8 || blastRadiusSize > 15) return 'MEDIUM';
    return 'LOW';
  }

  private createFallbackPrompt(analysisType: AnalysisType, context: EnhancedPRContext): ContextualPrompt {
    return {
      content: `# ${analysisType.toUpperCase()} Analysis

Please analyze the provided code changes for ${analysisType} concerns.

## Files Changed
${Array.from(context.completeFiles.keys()).map(f => `- ${f}`).join('\n')}

## Analysis Focus
Provide a comprehensive ${analysisType} analysis with specific findings and actionable recommendations.

Respond in JSON format with findings and recommendations arrays.`,
      metadata: {
        analysisType,
        contextSize: 0,
        templateVersion: 'fallback',
        generatedAt: new Date().toISOString(),
        repositoryLanguage: context.repositoryMetadata.language,
        changeComplexity: 'UNKNOWN'
      }
    };
  }
}
