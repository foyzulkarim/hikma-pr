import { HikmaPlugin, PluginAnalysisInput, PluginAnalysisOutput, PluginFinding } from '../types/plugins';

const CODE_SMELL_PROMPT = `
ANALYZE CODE FOR SMELLS

Examine this code diff for common code smells and anti-patterns:

FILE: {filePath}
CODE:
{chunkContent}

RESPOND IN THIS FORMAT ONLY:
SMELLS: [list specific code smells found, or "None"]
COMPLEXITY: [high complexity areas, or "None"]  
DUPLICATION: [code duplication issues, or "None"]
NAMING: [poor naming conventions, or "None"]
STRUCTURE: [structural issues, or "None"]

Focus on:
- Magic numbers/strings
- Long methods/functions
- Deep nesting
- Code duplication
- Poor variable/function names
- Violation of single responsibility
- Dead code
- Complex conditionals
`;

const codeSmellPlugin: HikmaPlugin = {
  id: 'code-smell-detector',
  name: 'Code Smell Detector',
  description: 'Uses LLM to detect code smells and anti-patterns in code chunks.',
  hooks: ['onChunkAnalysis'],
  usesLLM: true, // This plugin requires LLM access
  async execute(input: PluginAnalysisInput): Promise<PluginAnalysisOutput> {
    const findings: PluginFinding[] = [];

    // Basic regex-based checks (fast, always run)
    const lines = input.chunkContent.split('\n');
    
    // Quick regex checks for obvious issues
    lines.forEach((line, index) => {
      // Magic numbers (simple heuristic)
      const magicNumberRegex = /(?<![a-zA-Z_])[0-9]{3,}(?![a-zA-Z_0-9])/g;
      if (magicNumberRegex.test(line) && !line.includes('http') && !line.includes('port')) {
        findings.push({
          line: index + 1,
          message: 'Potential magic number detected. Consider using named constants.',
          severity: 'warning',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Console statements
      if (/console\.(log|warn|error|debug)/.test(line)) {
        findings.push({
          line: index + 1,
          message: 'Console statement found. Remove before production.',
          severity: 'info',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // TODO comments
      if (/\/\/\s*TODO|\/\*\s*TODO/.test(line)) {
        findings.push({
          line: index + 1,
          message: 'TODO comment found. Consider creating a ticket or completing the task.',
          severity: 'info',
          pluginId: this.id,
          pluginName: this.name,
        });
      }
    });

    // LLM-powered analysis (more sophisticated)
    if (input.llmClient && input.chunkContent.trim().length > 50) {
      try {
        const prompt = CODE_SMELL_PROMPT
          .replace('{filePath}', input.filePath)
          .replace('{chunkContent}', input.chunkContent);

        const llmResponse = await input.llmClient.generate(prompt);
        
        // Parse LLM response and extract findings
        const llmFindings = parseLLMResponse(llmResponse, input.filePath);
        findings.push(...llmFindings);

      } catch (error) {
        console.error(`LLM analysis failed for code smell detection:`, error);
        // Fallback to regex-only analysis (already done above)
      }
    }

    return { findings };
  },
};

function parseLLMResponse(response: string, filePath: string): PluginFinding[] {
  const findings: PluginFinding[] = [];
  const lines = response.split('\n');

  let currentSection = '';
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('SMELLS:')) {
      currentSection = 'smells';
      const content = trimmed.replace('SMELLS:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Code smell detected: ${content}`,
          severity: 'warning',
          pluginId: 'code-smell-detector',
          pluginName: 'Code Smell Detector',
        });
      }
    } else if (trimmed.startsWith('COMPLEXITY:')) {
      currentSection = 'complexity';
      const content = trimmed.replace('COMPLEXITY:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `High complexity: ${content}`,
          severity: 'warning',
          pluginId: 'code-smell-detector',
          pluginName: 'Code Smell Detector',
        });
      }
    } else if (trimmed.startsWith('DUPLICATION:')) {
      currentSection = 'duplication';
      const content = trimmed.replace('DUPLICATION:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Code duplication: ${content}`,
          severity: 'warning',
          pluginId: 'code-smell-detector',
          pluginName: 'Code Smell Detector',
        });
      }
    } else if (trimmed.startsWith('NAMING:')) {
      currentSection = 'naming';
      const content = trimmed.replace('NAMING:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Naming issue: ${content}`,
          severity: 'info',
          pluginId: 'code-smell-detector',
          pluginName: 'Code Smell Detector',
        });
      }
    } else if (trimmed.startsWith('STRUCTURE:')) {
      currentSection = 'structure';
      const content = trimmed.replace('STRUCTURE:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Structural issue: ${content}`,
          severity: 'warning',
          pluginId: 'code-smell-detector',
          pluginName: 'Code Smell Detector',
        });
      }
    }
  }

  return findings;
}

export default codeSmellPlugin;
