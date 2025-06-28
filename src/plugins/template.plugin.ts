import { HikmaPlugin, PluginAnalysisInput, PluginAnalysisOutput, PluginFinding } from '../types/plugins';

// Template for creating new plugins
// Copy this file and modify it to create your own custom analysis plugin

const CUSTOM_PROMPT = `
ANALYZE CODE FOR [YOUR SPECIFIC CONCERN]

Examine this code for [describe what you're looking for]:

FILE: {filePath}
CODE:
{chunkContent}

RESPOND IN THIS FORMAT ONLY:
CATEGORY1: [findings for category 1, or "None"]
CATEGORY2: [findings for category 2, or "None"]
CATEGORY3: [findings for category 3, or "None"]

Focus on:
- [Specific thing 1 to look for]
- [Specific thing 2 to look for]
- [Specific thing 3 to look for]
`;

const templatePlugin: HikmaPlugin = {
  id: 'template-plugin', // Change this to your plugin's unique ID
  name: 'Template Plugin', // Change this to your plugin's name
  description: 'Template plugin for creating custom analysis plugins.', // Describe what your plugin does
  hooks: ['onChunkAnalysis'], // Choose which hooks your plugin should run on
  usesLLM: true, // Set to false if you don't need LLM analysis
  async execute(input: PluginAnalysisInput): Promise<PluginAnalysisOutput> {
    const findings: PluginFinding[] = [];

    // Add file type filtering if needed
    const shouldAnalyze = true; // Add your logic here
    // Example: const shouldAnalyze = /\.(js|ts|jsx|tsx)$/.test(input.filePath);
    
    if (!shouldAnalyze) {
      return { findings };
    }

    // Quick regex-based checks (fast, always run)
    const lines = input.chunkContent.split('\n');
    
    lines.forEach((line, index) => {
      // Add your regex-based checks here
      // Example:
      // if (/your-pattern/.test(line)) {
      //   findings.push({
      //     line: index + 1,
      //     message: 'Your finding message',
      //     severity: 'warning', // 'info', 'warning', or 'error'
      //     pluginId: this.id,
      //     pluginName: this.name,
      //   });
      // }
    });

    // LLM-powered analysis (more sophisticated)
    if (input.llmClient && input.chunkContent.trim().length > 50) {
      try {
        const prompt = CUSTOM_PROMPT
          .replace('{filePath}', input.filePath)
          .replace('{chunkContent}', input.chunkContent);

        const llmResponse = await input.llmClient.generate(prompt);
        const llmFindings = parseLLMResponse(llmResponse);
        findings.push(...llmFindings);

      } catch (error) {
        console.error(`LLM analysis failed for ${this.name}:`, error);
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
    
    // Parse each category from your prompt format
    if (trimmed.startsWith('CATEGORY1:')) {
      const content = trimmed.replace('CATEGORY1:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Category 1 issue: ${content}`,
          severity: 'warning', // Adjust severity as needed
          pluginId: 'template-plugin',
          pluginName: 'Template Plugin',
        });
      }
    } else if (trimmed.startsWith('CATEGORY2:')) {
      const content = trimmed.replace('CATEGORY2:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Category 2 issue: ${content}`,
          severity: 'info',
          pluginId: 'template-plugin',
          pluginName: 'Template Plugin',
        });
      }
    } else if (trimmed.startsWith('CATEGORY3:')) {
      const content = trimmed.replace('CATEGORY3:', '').trim();
      if (content !== 'None' && content) {
        findings.push({
          message: `Category 3 issue: ${content}`,
          severity: 'error',
          pluginId: 'template-plugin',
          pluginName: 'Template Plugin',
        });
      }
    }
    // Add more categories as needed
  }

  return findings;
}

// Don't export this template plugin by default
// export default templatePlugin;
