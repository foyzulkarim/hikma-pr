import { HikmaPlugin, PluginAnalysisInput, PluginAnalysisOutput, PluginFinding } from '../types/plugins';

const TYPESCRIPT_PROMPT = `
ANALYZE TYPESCRIPT CODE

Examine this TypeScript code for type safety and best practices:

FILE: {filePath}
CODE:
{chunkContent}

RESPOND IN THIS FORMAT ONLY:
TYPES: [type safety issues, or "None"]
GENERICS: [generic usage problems, or "None"]
INTERFACES: [interface/type definition issues, or "None"]
ANY_USAGE: [inappropriate 'any' usage, or "None"]
STRICTNESS: [type strictness violations, or "None"]

Focus on:
- Use of 'any' type
- Missing type annotations
- Weak type definitions
- Generic constraints
- Interface vs type usage
- Optional chaining opportunities
- Null/undefined handling
`;

const typescriptPlugin: HikmaPlugin = {
  id: 'typescript-analyzer',
  name: 'TypeScript Analyzer',
  description: 'Analyzes TypeScript code for type safety and best practices.',
  hooks: ['onChunkAnalysis'],
  usesLLM: true,
  async execute(input: PluginAnalysisInput): Promise<PluginAnalysisOutput> {
    const findings: PluginFinding[] = [];

    // Only analyze TypeScript files
    const isTypeScriptFile = /\.tsx?$/.test(input.filePath) || 
                            input.chunkContent.includes('interface ') ||
                            input.chunkContent.includes('type ') ||
                            input.chunkContent.includes(': ') ||
                            input.chunkContent.includes('<T>');

    if (!isTypeScriptFile) {
      return { findings };
    }

    // Quick regex-based checks
    const lines = input.chunkContent.split('\n');
    
    lines.forEach((line, index) => {
      // Check for 'any' usage
      if (/:\s*any\b/.test(line) && !line.includes('// @ts-ignore')) {
        findings.push({
          line: index + 1,
          message: 'Usage of \'any\' type detected. Consider using more specific types.',
          severity: 'warning',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for @ts-ignore
      if (/@ts-ignore/.test(line)) {
        findings.push({
          line: index + 1,
          message: '@ts-ignore detected. Consider fixing the underlying type issue.',
          severity: 'info',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for non-null assertion operator overuse
      if ((line.match(/!/g) || []).length > 2) {
        findings.push({
          line: index + 1,
          message: 'Multiple non-null assertions (!). Consider safer null handling.',
          severity: 'warning',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for missing return type on functions
      if (/function\s+\w+\s*\([^)]*\)\s*\{/.test(line) && !/:/.test(line)) {
        findings.push({
          line: index + 1,
          message: 'Function missing explicit return type annotation.',
          severity: 'info',
          pluginId: this.id,
          pluginName: this.name,
        });
      }
    });

    // LLM-powered analysis
    if (input.llmClient && input.chunkContent.trim().length > 50) {
      try {
        const prompt = TYPESCRIPT_PROMPT
          .replace('{filePath}', input.filePath)
          .replace('{chunkContent}', input.chunkContent);

        const llmResponse = await input.llmClient.generate(prompt);
        const llmFindings = parseLLMResponse(llmResponse);
        findings.push(...llmFindings);

      } catch (error) {
        console.error(`LLM analysis failed for TypeScript analysis:`, error);
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
    
    if (trimmed.startsWith('TYPES:')) {
      const content = trimmed.replace('TYPES:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Type safety issue: ${content}`,
          severity: 'warning',
          pluginId: 'typescript-analyzer',
          pluginName: 'TypeScript Analyzer',
        });
      }
    } else if (trimmed.startsWith('GENERICS:')) {
      const content = trimmed.replace('GENERICS:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Generic usage issue: ${content}`,
          severity: 'info',
          pluginId: 'typescript-analyzer',
          pluginName: 'TypeScript Analyzer',
        });
      }
    } else if (trimmed.startsWith('INTERFACES:')) {
      const content = trimmed.replace('INTERFACES:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Interface/type issue: ${content}`,
          severity: 'info',
          pluginId: 'typescript-analyzer',
          pluginName: 'TypeScript Analyzer',
        });
      }
    } else if (trimmed.startsWith('ANY_USAGE:')) {
      const content = trimmed.replace('ANY_USAGE:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `'any' type usage: ${content}`,
          severity: 'warning',
          pluginId: 'typescript-analyzer',
          pluginName: 'TypeScript Analyzer',
        });
      }
    } else if (trimmed.startsWith('STRICTNESS:')) {
      const content = trimmed.replace('STRICTNESS:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Type strictness issue: ${content}`,
          severity: 'warning',
          pluginId: 'typescript-analyzer',
          pluginName: 'TypeScript Analyzer',
        });
      }
    }
  }

  return findings;
}

export default typescriptPlugin;
