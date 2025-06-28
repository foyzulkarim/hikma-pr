import { LLMClient } from '../services/llmService';

export interface PluginAnalysisInput {
  filePath: string;
  chunkContent: string;
  llmClient?: LLMClient; // Optional LLM client for advanced analysis
  // Add more context here as needed, e.g., fullFileContent, projectConfig
}

export interface PluginFinding {
  line?: number; // Optional: line number of the finding
  message: string;
  severity: 'info' | 'warning' | 'error';
  pluginId: string; // To identify which plugin generated the finding
  pluginName: string; // Human-readable name of the plugin
}

export interface PluginAnalysisOutput {
  findings: PluginFinding[];
}

export type PluginHook = 'onChunkAnalysis' | 'onFileAnalysis' | 'onPullRequestAnalysis'; // Extend as needed

export interface HikmaPlugin {
  id: string; // Unique identifier for the plugin (e.g., 'code-smell-detector')
  name: string; // Human-readable name (e.g., 'Code Smell Detector')
  description: string; // Brief description of what the plugin does
  hooks: PluginHook[]; // Array of hooks this plugin subscribes to
  usesLLM?: boolean; // Indicates if this plugin requires LLM access
  execute: (input: PluginAnalysisInput) => Promise<PluginAnalysisOutput>;
}
