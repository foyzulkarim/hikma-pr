import { HikmaPlugin, PluginAnalysisInput, PluginAnalysisOutput, PluginFinding } from '../types/plugins';

const SECURITY_PROMPT = `
ANALYZE CODE FOR SECURITY VULNERABILITIES

Examine this code for potential security issues:

FILE: {filePath}
CODE:
{chunkContent}

RESPOND IN THIS FORMAT ONLY:
INJECTION: [SQL/XSS/command injection risks, or "None"]
AUTH: [authentication/authorization issues, or "None"]
CRYPTO: [cryptography problems, or "None"]
INPUT: [input validation issues, or "None"]
SECRETS: [hardcoded secrets/keys, or "None"]

Focus on:
- SQL injection vulnerabilities
- XSS vulnerabilities
- Command injection
- Hardcoded passwords/keys
- Weak cryptography
- Missing input validation
- Authentication bypasses
- Insecure direct object references
`;

const securityPlugin: HikmaPlugin = {
  id: 'security-analyzer',
  name: 'Security Analyzer',
  description: 'Analyzes code for common security vulnerabilities.',
  hooks: ['onChunkAnalysis'],
  usesLLM: true,
  async execute(input: PluginAnalysisInput): Promise<PluginAnalysisOutput> {
    const findings: PluginFinding[] = [];
    const lines = input.chunkContent.split('\n');

    // Quick regex-based security checks
    lines.forEach((line, index) => {
      // Check for hardcoded passwords/secrets
      const secretPatterns = [
        /password\s*=\s*['"][^'"]+['"]/i,
        /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
        /secret\s*=\s*['"][^'"]+['"]/i,
        /token\s*=\s*['"][^'"]+['"]/i,
      ];

      secretPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          findings.push({
            line: index + 1,
            message: 'Potential hardcoded secret detected. Use environment variables instead.',
            severity: 'error',
            pluginId: this.id,
            pluginName: this.name,
          });
        }
      });

      // Check for SQL injection risks
      if (/query\s*\+|SELECT.*\+|INSERT.*\+|UPDATE.*\+|DELETE.*\+/.test(line)) {
        findings.push({
          line: index + 1,
          message: 'Potential SQL injection risk. Use parameterized queries.',
          severity: 'error',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for eval usage
      if (/\beval\s*\(/.test(line)) {
        findings.push({
          line: index + 1,
          message: 'eval() usage detected. This can lead to code injection vulnerabilities.',
          severity: 'error',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for innerHTML usage (XSS risk)
      if (/innerHTML\s*=/.test(line)) {
        findings.push({
          line: index + 1,
          message: 'innerHTML usage detected. Potential XSS risk. Consider using textContent or sanitization.',
          severity: 'warning',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for weak crypto
      if (/md5|sha1(?!256|512)/i.test(line)) {
        findings.push({
          line: index + 1,
          message: 'Weak cryptographic algorithm detected. Use SHA-256 or stronger.',
          severity: 'warning',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for insecure HTTP
      if (/http:\/\/(?!localhost|127\.0\.0\.1)/.test(line)) {
        findings.push({
          line: index + 1,
          message: 'Insecure HTTP URL detected. Use HTTPS for external connections.',
          severity: 'warning',
          pluginId: this.id,
          pluginName: this.name,
        });
      }
    });

    // LLM-powered security analysis
    if (input.llmClient && input.chunkContent.trim().length > 50) {
      try {
        const prompt = SECURITY_PROMPT
          .replace('{filePath}', input.filePath)
          .replace('{chunkContent}', input.chunkContent);

        const llmResponse = await input.llmClient.generate(prompt);
        const llmFindings = parseLLMResponse(llmResponse);
        findings.push(...llmFindings);

      } catch (error) {
        console.error(`LLM analysis failed for security analysis:`, error);
      }
    }

    return { findings };
  },
};

function parseLLMResponse(response: string): PluginFinding[] {
  const findings: PluginFinding[] = [];
  const lines = response.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('INJECTION:')) {
      const content = trimmed.replace('INJECTION:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Injection vulnerability: ${content}`,
          severity: 'error',
          pluginId: 'security-analyzer',
          pluginName: 'Security Analyzer',
        });
      }
    } else if (trimmed.startsWith('AUTH:')) {
      const content = trimmed.replace('AUTH:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Authentication issue: ${content}`,
          severity: 'error',
          pluginId: 'security-analyzer',
          pluginName: 'Security Analyzer',
        });
      }
    } else if (trimmed.startsWith('CRYPTO:')) {
      const content = trimmed.replace('CRYPTO:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Cryptography issue: ${content}`,
          severity: 'warning',
          pluginId: 'security-analyzer',
          pluginName: 'Security Analyzer',
        });
      }
    } else if (trimmed.startsWith('INPUT:')) {
      const content = trimmed.replace('INPUT:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Input validation issue: ${content}`,
          severity: 'warning',
          pluginId: 'security-analyzer',
          pluginName: 'Security Analyzer',
        });
      }
    } else if (trimmed.startsWith('SECRETS:')) {
      const content = trimmed.replace('SECRETS:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Secret management issue: ${content}`,
          severity: 'error',
          pluginId: 'security-analyzer',
          pluginName: 'Security Analyzer',
        });
      }
    }
  }

  return findings;
}

export default securityPlugin;
