import { HikmaPlugin, PluginAnalysisInput, PluginAnalysisOutput, PluginFinding } from '../types/plugins';

const REACT_BEST_PRACTICES_PROMPT = `
ANALYZE REACT CODE FOR BEST PRACTICES

Examine this React/JSX code for best practices violations:

FILE: {filePath}
CODE:
{chunkContent}

RESPOND IN THIS FORMAT ONLY:
HOOKS: [React hooks violations, or "None"]
PERFORMANCE: [performance issues, or "None"]
PATTERNS: [anti-patterns found, or "None"]
ACCESSIBILITY: [a11y issues, or "None"]
STATE: [state management issues, or "None"]

Focus on:
- Hooks rules (order, conditional usage)
- Missing keys in lists
- Unnecessary re-renders
- Direct DOM manipulation
- Missing accessibility attributes
- State mutation
- useEffect dependency issues
- Component composition
- Props drilling
`;

const reactBestPracticesPlugin: HikmaPlugin = {
  id: 'react-best-practices-checker',
  name: 'React Best Practices Checker',
  description: 'Uses LLM to check React/JSX code for best practices violations.',
  hooks: ['onChunkAnalysis'],
  usesLLM: true, // This plugin requires LLM access
  async execute(input: PluginAnalysisInput): Promise<PluginAnalysisOutput> {
    const findings: PluginFinding[] = [];

    // Only analyze files that are likely React/JSX
    const isReactFile = /\.(jsx?|tsx?)$/.test(input.filePath) || 
                       input.chunkContent.includes('React') ||
                       input.chunkContent.includes('jsx') ||
                       input.chunkContent.includes('useState') ||
                       input.chunkContent.includes('useEffect') ||
                       /<[A-Z]/.test(input.chunkContent);

    if (!isReactFile) {
      return { findings };
    }

    // Quick regex-based checks (fast, always run)
    const lines = input.chunkContent.split('\n');
    
    lines.forEach((line, index) => {
      // Reset regex lastIndex to avoid issues with global regex
      const missingKeyRegex = /\.map\([^)]*\)\s*=>\s*<\w+(?![^>]*key\s*=)/g;
      const directDomRegex = /document\.(getElementById|querySelector|createElement)/g;
      const inlineStyleRegex = /style\s*=\s*\{\{[^}]+\}\}/g;
      const useEffectNoDepsRegex = /useEffect\s*\([^,)]+\)\s*;?\s*$/g;

      // Check for missing 'key' prop in lists
      if (missingKeyRegex.test(line)) {
        findings.push({
          line: index + 1,
          message: 'Missing \'key\' prop in list. Add unique key for each element.',
          severity: 'warning',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for direct DOM manipulation
      if (directDomRegex.test(line)) {
        findings.push({
          line: index + 1,
          message: 'Direct DOM manipulation detected. Use React refs or state instead.',
          severity: 'warning',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for inline styles
      if (inlineStyleRegex.test(line)) {
        findings.push({
          line: index + 1,
          message: 'Inline styles detected. Consider CSS classes or styled-components.',
          severity: 'info',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for useEffect without dependency array
      if (useEffectNoDepsRegex.test(line)) {
        findings.push({
          line: index + 1,
          message: 'useEffect without dependency array. This runs on every render.',
          severity: 'warning',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for useState with objects/arrays (potential mutation)
      if (/useState\s*\(\s*[\[\{]/.test(line)) {
        findings.push({
          line: index + 1,
          message: 'useState with object/array. Consider useReducer or ensure immutable updates.',
          severity: 'info',
          pluginId: this.id,
          pluginName: this.name,
        });
      }

      // Check for class components (suggest functional components)
      if (/class\s+\w+\s+extends\s+(React\.)?Component/.test(line)) {
        findings.push({
          line: index + 1,
          message: 'Class component detected. Consider using functional components with hooks.',
          severity: 'info',
          pluginId: this.id,
          pluginName: this.name,
        });
      }
    });

    // LLM-powered analysis (more sophisticated)
    if (input.llmClient && input.chunkContent.trim().length > 50) {
      try {
        const prompt = REACT_BEST_PRACTICES_PROMPT
          .replace('{filePath}', input.filePath)
          .replace('{chunkContent}', input.chunkContent);

        const llmResponse = await input.llmClient.generate(prompt);
        
        // Parse LLM response and extract findings
        const llmFindings = parseLLMResponse(llmResponse);
        findings.push(...llmFindings);

      } catch (error) {
        console.error(`LLM analysis failed for React best practices:`, error);
        // Fallback to regex-only analysis (already done above)
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
    
    if (trimmed.startsWith('HOOKS:')) {
      const content = trimmed.replace('HOOKS:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `React hooks issue: ${content}`,
          severity: 'error',
          pluginId: 'react-best-practices-checker',
          pluginName: 'React Best Practices Checker',
        });
      }
    } else if (trimmed.startsWith('PERFORMANCE:')) {
      const content = trimmed.replace('PERFORMANCE:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Performance issue: ${content}`,
          severity: 'warning',
          pluginId: 'react-best-practices-checker',
          pluginName: 'React Best Practices Checker',
        });
      }
    } else if (trimmed.startsWith('PATTERNS:')) {
      const content = trimmed.replace('PATTERNS:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Anti-pattern detected: ${content}`,
          severity: 'warning',
          pluginId: 'react-best-practices-checker',
          pluginName: 'React Best Practices Checker',
        });
      }
    } else if (trimmed.startsWith('ACCESSIBILITY:')) {
      const content = trimmed.replace('ACCESSIBILITY:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Accessibility issue: ${content}`,
          severity: 'warning',
          pluginId: 'react-best-practices-checker',
          pluginName: 'React Best Practices Checker',
        });
      }
    } else if (trimmed.startsWith('STATE:')) {
      const content = trimmed.replace('STATE:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `State management issue: ${content}`,
          severity: 'warning',
          pluginId: 'react-best-practices-checker',
          pluginName: 'React Best Practices Checker',
        });
      }
    }
  }

  return findings;
}

export default reactBestPracticesPlugin;
