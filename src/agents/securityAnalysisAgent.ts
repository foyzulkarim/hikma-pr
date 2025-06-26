/**
 * Security Analysis Agent - Enhanced for Multi-Model System
 * Specializes in security vulnerability detection and threat assessment
 */
import { AnalysisAgent } from './baseAgent.js';
import { 
  EnhancedPRContext, 
  SpecializedAnalysis, 
  Finding, 
  Recommendation,
  AnalysisType,
  ValidationResult
} from '../types/analysis.js';
import { EnhancedLLMService } from '../services/enhancedLLMService.js';
import { DynamicPromptBuilder } from '../prompts/dynamicPromptBuilder.js';
import { ContextAwareEnhancer } from '../prompts/contextAwareEnhancer.js';

export class SecurityAnalysisAgent implements AnalysisAgent {
  private llmService: EnhancedLLMService;
  private promptBuilder: DynamicPromptBuilder;
  private contextEnhancer: ContextAwareEnhancer;
  private securityPatterns: SecurityPattern[];

  constructor() {
    this.llmService = new EnhancedLLMService();
    this.promptBuilder = new DynamicPromptBuilder();
    this.contextEnhancer = new ContextAwareEnhancer();
    this.securityPatterns = this.initializeSecurityPatterns();
  }

  getAnalysisType(): AnalysisType {
    return 'security';
  }

  async analyze(context: EnhancedPRContext, enhancedPrompt?: string): Promise<SpecializedAnalysis> {
    console.log('🔒 Starting Security Analysis...');

    try {
      // Use enhanced prompt if provided, otherwise build context-aware prompt
      let finalPrompt: string;
      
      if (enhancedPrompt) {
        console.log('🎯 Using provided enhanced prompt for security analysis');
        finalPrompt = enhancedPrompt;
      } else {
        // Build dynamic, context-aware prompt
        console.log('🎯 Building context-aware security analysis prompt...');
        const contextualPrompt = await this.promptBuilder.buildContextualPrompt(
          'security',
          context
        );
        
        // Enhance prompt with language/framework-specific guidance
        finalPrompt = await this.contextEnhancer.enhancePromptForContext(
          contextualPrompt.content,
          'security',
          context
        );
      }
      
      // Get LLM analysis with enhanced prompt
      console.log('🤖 Calling LLM service for security analysis');
      const llmResponse = await this.llmService.generateAnalysis(
        'security',
        context,
        finalPrompt
      );

      // Process and enhance the response
      const processedAnalysis = await this.processSecurityAnalysis(llmResponse, context);

      console.log(`✅ Security Analysis complete: ${processedAnalysis.findings.length} findings, ${processedAnalysis.recommendations.length} recommendations`);
      
      return processedAnalysis;

    } catch (error) {
      console.error('❌ Security Analysis failed:', error);
      
      // Return fallback analysis
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.createFallbackAnalysis(context, errorMessage);
    }
  }

  async validate(analysis: SpecializedAnalysis): Promise<ValidationResult> {
    console.log('🔍 Validating security analysis...');

    const issues: string[] = [];
    const suggestions: string[] = [];
    let confidence = 0.8;

    // Validate findings
    if (!analysis.findings || analysis.findings.length === 0) {
      issues.push('No security findings identified');
      confidence -= 0.2;
    } else {
      // Check for security-specific finding types
      const securityTypes = ['vulnerability', 'injection', 'authentication', 'authorization', 'encryption', 'xss', 'csrf'];
      const hasSecurityFindings = analysis.findings.some(f => 
        securityTypes.some(type => f.type.toLowerCase().includes(type))
      );
      
      if (!hasSecurityFindings) {
        suggestions.push('Consider adding more security-specific findings');
        confidence -= 0.1;
      }
    }

    // Validate critical security issues
    const criticalFindings = analysis.findings.filter(f => f.severity === 'critical');
    if (criticalFindings.length > 0) {
      // Critical security findings should have detailed evidence
      const inadequateEvidence = criticalFindings.filter(f => 
        !f.evidence || f.evidence.length < 2
      );
      
      if (inadequateEvidence.length > 0) {
        issues.push('Critical security findings need more detailed evidence');
        confidence -= 0.2;
      }
    }

    // Validate recommendations
    if (!analysis.recommendations || analysis.recommendations.length === 0) {
      issues.push('No security recommendations provided');
      confidence -= 0.2;
    } else {
      // Check for security remediation guidance
      const remediationRecs = analysis.recommendations.filter(r => 
        r.implementation && r.implementation.includes('security')
      );
      
      if (remediationRecs.length < analysis.recommendations.length * 0.3) {
        suggestions.push('Provide more specific security remediation guidance');
        confidence -= 0.1;
      }
    }

    return {
      isValid: issues.length === 0,
      errors: issues,
      warnings: suggestions,
      score: Math.max(confidence, 0.1)
    };
  }

  async refine(analysis: SpecializedAnalysis, feedback: any): Promise<SpecializedAnalysis> {
    console.log('🔧 Refining security analysis based on feedback...');

    const refinedAnalysis = { ...analysis };

    // Apply security-specific refinements
    if (feedback.improvementAreas) {
      for (const area of feedback.improvementAreas) {
        switch (area.type) {
          case 'missing-evidence':
            refinedAnalysis.findings = await this.enhanceSecurityEvidence(refinedAnalysis.findings);
            break;
          case 'vague-recommendation':
            refinedAnalysis.recommendations = await this.enhanceSecurityRecommendations(refinedAnalysis.recommendations);
            break;
          case 'low-confidence':
            refinedAnalysis.confidence = Math.min(refinedAnalysis.confidence + 0.1, 1.0);
            break;
        }
      }
    }

    return refinedAnalysis;
  }

  private async processSecurityAnalysis(
    llmResponse: SpecializedAnalysis,
    context: EnhancedPRContext
  ): Promise<SpecializedAnalysis> {
    // Enhance findings with security context
    const enhancedFindings = await this.enhanceSecurityFindings(llmResponse.findings, context);
    
    // Enhance recommendations with security remediation
    const enhancedRecommendations = await this.enhanceSecurityRemediation(llmResponse.recommendations, context);
    
    // Calculate security risk score
    const riskScore = this.calculateSecurityRisk(enhancedFindings);
    
    // Perform additional security pattern matching
    const patternMatches = await this.matchSecurityPatterns(context);

    return {
      ...llmResponse,
      findings: [...enhancedFindings, ...patternMatches.findings],
      recommendations: [...enhancedRecommendations, ...patternMatches.recommendations]
    };
  }

  private async enhanceSecurityFindings(
    findings: Finding[],
    context: EnhancedPRContext
  ): Promise<Finding[]> {
    return findings.map(finding => {
      const enhancedFinding = { ...finding };
      
      // Categorize security findings
      const message = finding.message.toLowerCase();
      
      if (message.includes('injection') || message.includes('sql')) {
        enhancedFinding.type = 'injection-vulnerability';
      } else if (message.includes('xss') || message.includes('cross-site')) {
        enhancedFinding.type = 'xss-vulnerability';
      } else if (message.includes('csrf') || message.includes('cross-site request')) {
        enhancedFinding.type = 'csrf-vulnerability';
      } else if (message.includes('authentication') || message.includes('auth')) {
        enhancedFinding.type = 'authentication-issue';
      } else if (message.includes('authorization') || message.includes('access')) {
        enhancedFinding.type = 'authorization-issue';
      } else if (message.includes('encryption') || message.includes('crypto')) {
        enhancedFinding.type = 'cryptographic-issue';
      }
      
      return enhancedFinding;
    });
  }

  private async enhanceSecurityRemediation(
    recommendations: Recommendation[],
    context: EnhancedPRContext
  ): Promise<Recommendation[]> {
    return recommendations.map(rec => {
      const enhancedRec = { ...rec };
      
      return enhancedRec;
    });
  }

  private async matchSecurityPatterns(context: EnhancedPRContext): Promise<{ findings: Finding[], recommendations: Recommendation[] }> {
    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];
    
    // Check for common security anti-patterns
    for (const [filename, content] of context.completeFiles) {
      for (const pattern of this.securityPatterns) {
        if (pattern.regex.test(content)) {
          findings.push({
            id: `pattern-${pattern.id}-${Date.now()}`,
            type: pattern.type,
            severity: pattern.severity,
            message: pattern.message,
            file: filename,
            lineNumber: this.findLineNumber(content, pattern.regex),
            evidence: [pattern.evidence],
            confidence: 0.8
          });
          
          recommendations.push({
            id: `pattern-rec-${pattern.id}-${Date.now()}`,
            priority: pattern.severity === 'critical' ? 'must-fix' : 'should-fix',
            category: 'security',
            description: pattern.remediation,
            rationale: pattern.rationale,
            implementation: pattern.implementation,
            effort: pattern.effort as 'low' | 'medium' | 'high',
            confidence: 0.8
          });
        }
      }
    }
    
    return { findings, recommendations };
  }

  private calculateSecurityRisk(findings: Finding[]): number {
    let riskScore = 0;
    
    findings.forEach(finding => {
      switch (finding.severity) {
        case 'critical':
          riskScore += 10;
          break;
        case 'high':
          riskScore += 7;
          break;
        case 'medium':
          riskScore += 4;
          break;
        case 'low':
          riskScore += 1;
          break;
      }
    });
    
    // Normalize to 0-1 scale
    return Math.min(riskScore / 50, 1.0);
  }

  private categorizeSecurityFindings(findings: Finding[]): string[] {
    const categories = new Set<string>();
    
    findings.forEach(finding => {
      if (finding.type?.includes('injection')) categories.add('injection');
      if (finding.type?.includes('xss')) categories.add('xss');
      if (finding.type?.includes('csrf')) categories.add('csrf');
      if (finding.type?.includes('authentication')) categories.add('authentication');
      if (finding.type?.includes('authorization')) categories.add('authorization');
      if (finding.type?.includes('cryptographic')) categories.add('cryptography');
    });
    
    return Array.from(categories);
  }

  private assessThreatLevel(findings: Finding[]): string {
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (highCount > 0 || findings.length > 5) return 'medium';
    return 'low';
  }

  private assessComplianceImpact(findings: Finding[]): string[] {
    const impacts: string[] = [];
    
    findings.forEach(finding => {
      if (finding.type?.includes('encryption') || finding.type?.includes('data')) {
        impacts.push('GDPR', 'PCI-DSS');
      }
      if (finding.type?.includes('authentication') || finding.type?.includes('access')) {
        impacts.push('SOX', 'HIPAA');
      }
      if (finding.severity === 'critical') {
        impacts.push('ISO-27001');
      }
    });
    
    return [...new Set(impacts)];
  }

  private mapToOWASP(findingType: string): string {
    const owaspMapping: Record<string, string> = {
      'injection-vulnerability': 'A03:2021 – Injection',
      'authentication-issue': 'A07:2021 – Identification and Authentication Failures',
      'authorization-issue': 'A01:2021 – Broken Access Control',
      'xss-vulnerability': 'A03:2021 – Injection',
      'csrf-vulnerability': 'A01:2021 – Broken Access Control',
      'cryptographic-issue': 'A02:2021 – Cryptographic Failures'
    };
    
    return owaspMapping[findingType] || 'A10:2021 – Server-Side Request Forgery';
  }

  private assessSecurityImpact(finding: Finding): string {
    if (finding.severity === 'critical') return 'system-compromise';
    if (finding.severity === 'high') return 'data-breach';
    if (finding.severity === 'medium') return 'privilege-escalation';
    return 'information-disclosure';
  }

  private generateSecurityImplementation(rec: Recommendation, context: EnhancedPRContext): string {
    const language = context.repositoryMetadata.language;
    const framework = context.repositoryMetadata.framework;
    
    return `Security implementation for ${language}/${framework}: ${rec.description}. Follow OWASP guidelines and security best practices.`;
  }

  private generateComplianceNotes(rec: Recommendation): string {
    return 'Consider compliance requirements (GDPR, PCI-DSS, HIPAA) when implementing this security recommendation.';
  }

  private generateSecurityTestingGuidance(rec: Recommendation): string {
    return 'Implement security tests including penetration testing, vulnerability scanning, and security unit tests.';
  }

  private findLineNumber(content: string, regex: RegExp): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        return i + 1;
      }
    }
    return 0;
  }

  private async enhanceSecurityEvidence(findings: Finding[]): Promise<Finding[]> {
    return findings.map(finding => ({
      ...finding,
      evidence: [
        ...(finding.evidence || []),
        'Enhanced security evidence with threat analysis',
        'OWASP reference and CWE mapping provided'
      ]
    }));
  }

  private async enhanceSecurityRecommendations(recommendations: Recommendation[]): Promise<Recommendation[]> {
    return recommendations.map(rec => ({
      ...rec,
      implementation: rec.implementation || 'Detailed security remediation steps to be provided',
      rationale: rec.rationale || 'Security vulnerability remediation'
    }));
  }

  private initializeSecurityPatterns(): SecurityPattern[] {
    return [
      {
        id: 'sql-injection',
        type: 'injection-vulnerability',
        severity: 'critical',
        regex: /(?:SELECT|INSERT|UPDATE|DELETE).*\+.*\$|query.*\+.*\$/gi,
        message: 'Potential SQL injection vulnerability detected',
        evidence: 'String concatenation in SQL query construction',
        remediation: 'Use parameterized queries or prepared statements',
        rationale: 'Prevents SQL injection attacks',
        implementation: 'Replace string concatenation with parameterized queries',
        effort: 'medium',
        confidence: 0.8,
        cweId: 'CWE-89',
        owaspCategory: 'A03:2021 – Injection'
      },
      {
        id: 'hardcoded-secret',
        type: 'cryptographic-issue',
        severity: 'high',
        regex: /(password|secret|key|token)\s*=\s*["'][^"']{8,}["']/gi,
        message: 'Hardcoded secret or credential detected',
        evidence: 'Hardcoded sensitive information in source code',
        remediation: 'Move secrets to environment variables or secure vault',
        rationale: 'Prevents credential exposure in source code',
        implementation: 'Use environment variables or configuration management',
        effort: 'low',
        confidence: 0.9,
        cweId: 'CWE-798',
        owaspCategory: 'A02:2021 – Cryptographic Failures'
      },
      {
        id: 'weak-crypto',
        type: 'cryptographic-issue',
        severity: 'medium',
        regex: /(MD5|SHA1|DES|RC4)/gi,
        message: 'Weak cryptographic algorithm detected',
        evidence: 'Use of deprecated or weak cryptographic algorithm',
        remediation: 'Use strong cryptographic algorithms (SHA-256, AES)',
        rationale: 'Ensures data integrity and confidentiality',
        implementation: 'Replace with modern cryptographic algorithms',
        effort: 'medium',
        confidence: 0.7,
        cweId: 'CWE-327',
        owaspCategory: 'A02:2021 – Cryptographic Failures'
      }
    ];
  }

  private createFallbackAnalysis(context: EnhancedPRContext, error: string): SpecializedAnalysis {
    return {
      type: 'security',
      findings: [
        {
          id: 'fallback-security-finding',
          type: 'analysis-error',
          severity: 'medium',
          message: `Security analysis encountered an issue: ${error}`,
          file: '',
          lineNumber: 0,
          evidence: ['Fallback analysis due to processing error'],
          confidence: 0.3
        }
      ],
      recommendations: [
        {
          id: 'fallback-security-recommendation',
          priority: 'should-fix',
          category: 'security',
          description: 'Manual security review recommended due to analysis error',
          rationale: 'Automated security analysis failed, manual review needed',
          implementation: 'Conduct manual security assessment',
          effort: 'high',
          confidence: 0.3
        }
      ],
      riskLevel: 'MEDIUM',
      confidence: 0.3
    };
  }
}

// Supporting interfaces
interface SecurityPattern {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  regex: RegExp;
  message: string;
  evidence: string;
  remediation: string;
  rationale: string;
  implementation: string;
  effort: string;
  confidence: number;
  cweId: string;
  owaspCategory: string;
}
