import { HikmaPlugin, PluginAnalysisInput, PluginAnalysisOutput, PluginHook, PluginFinding } from '../types/plugins';
import { LLMClient } from './llmService';
import * as path from 'path';
import * as fs from 'fs';

export class PluginService {
  private plugins: HikmaPlugin[] = [];
  private pluginDirectory: string;
  private llmClient?: LLMClient;

  constructor(pluginDirectory: string, llmClient?: LLMClient) {
    this.pluginDirectory = pluginDirectory;
    this.llmClient = llmClient;
  }

  public setLLMClient(llmClient: LLMClient): void {
    this.llmClient = llmClient;
  }

  public async loadPlugins(): Promise<void> {
    this.plugins = []; // Clear existing plugins
    console.log(`Loading plugins from: ${this.pluginDirectory}`);

    if (!fs.existsSync(this.pluginDirectory)) {
      console.warn(`Plugin directory not found: ${this.pluginDirectory}`);
      return;
    }

    const pluginFiles = fs.readdirSync(this.pluginDirectory).filter(file => file.endsWith('.plugin.ts') || file.endsWith('.plugin.js'));

    for (const file of pluginFiles) {
      const pluginPath = path.join(this.pluginDirectory, file);
      try {
        // Use dynamic import for TypeScript/JavaScript modules
        const module = await import(pluginPath);
        const plugin: HikmaPlugin = module.default || module; // Handle default export or direct export

        // Basic validation
        if (plugin.id && plugin.name && plugin.description && Array.isArray(plugin.hooks) && typeof plugin.execute === 'function') {
          this.plugins.push(plugin);
          console.log(`Loaded plugin: ${plugin.name} (${plugin.id})${plugin.usesLLM ? ' [LLM-enabled]' : ''}`);
        } else {
          console.warn(`Invalid plugin format for ${file}. Skipping.`);
        }
      } catch (error) {
        console.error(`Failed to load plugin ${file}:`, error);
      }
    }
    console.log(`Total plugins loaded: ${this.plugins.length}`);
  }

  public async runPlugins(hook: PluginHook, input: PluginAnalysisInput): Promise<PluginFinding[]> {
    let allFindings: PluginFinding[] = [];
    for (const plugin of this.plugins) {
      if (plugin.hooks.includes(hook)) {
        try {
          // Provide LLM client if plugin needs it and we have one available
          const pluginInput: PluginAnalysisInput = {
            ...input,
            llmClient: plugin.usesLLM ? this.llmClient : undefined
          };

          const output: PluginAnalysisOutput = await plugin.execute(pluginInput);
          const findingsWithPluginInfo = output.findings.map(finding => ({
            ...finding,
            pluginId: plugin.id,
            pluginName: plugin.name,
          }));
          allFindings = allFindings.concat(findingsWithPluginInfo);
        } catch (error) {
          console.error(`Error running plugin ${plugin.name} for hook ${hook}:`, error);
        }
      }
    }
    return allFindings;
  }
}
