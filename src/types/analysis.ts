// Analysis Types for Multi-Pass PR Review Architecture

export interface PrContext {
  repo_name: string;
  source_branch: string;
  target_branch: string;
  file_count: number;
  additions: number;
  deletions: number;
  diff_summary: string;
}

export interface ChunkInfo {
  id: string;
  file_path: string;
  start_line?: number;
  end_line?: number;
  size_tokens: number;
  context_before?: string;
  context_after?: string;
  diff_content: string;
  is_complete_file: boolean;
}

export interface AnalysisPass {
  id: string;
  chunk_id: string;
  pass_type: 'syntax_logic' | 'security_performance' | 'architecture_design' | 'testing_docs';
  analysis_result: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issues_found: string[];
  recommendations: string[];
  tokens_used: number;
  duration_ms: number;
  timestamp: Date;
}

export interface FileAnalysisResult {
  file_path: string;
  total_chunks: number;
  chunk_analyses: {
    [chunk_id: string]: {
      syntax_logic?: AnalysisPass;
      security_performance?: AnalysisPass;
      architecture_design?: AnalysisPass;
      testing_docs?: AnalysisPass;
    };
  };
  file_synthesis: string;
  overall_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  total_issues: number;
  recommendations: string[];
}

export interface ReviewState {
  // Core identification
  pr_url: string;
  task_id: string;
  
  // Context establishment
  pr_details?: {
    title: string;
    body: string | null;
    author: string;
    state: string;
    additions: number;
    deletions: number;
  };
  pr_context?: PrContext;
  
  // File processing
  all_changed_files?: string[];        // All files changed in PR
  filtered_files?: string[];           // Files that will be analyzed
  files_to_process?: string[];         // Queue of files remaining
  current_file?: string;               // File currently being processed
  full_pr_diff?: string;               // Complete PR diff (fetched once)
  
  // Chunk processing
  file_chunks?: {
    [file_path: string]: ChunkInfo[];
  };
  current_chunks?: ChunkInfo[];        // Chunks for current file
  chunks_to_process?: ChunkInfo[];     // Queue of chunks remaining
  current_chunk?: ChunkInfo;           // Chunk currently being analyzed
  current_pass?: 'syntax_logic' | 'security_performance' | 'architecture_design' | 'testing_docs';
  
  // Analysis results
  chunk_analyses?: {
    [chunk_id: string]: {
      syntax_logic?: AnalysisPass;
      security_performance?: AnalysisPass;
      architecture_design?: AnalysisPass;
      testing_docs?: AnalysisPass;
    };
  };
  file_results?: {
    [file_path: string]: FileAnalysisResult;
  };
  
  // Final synthesis
  synthesis_data?: {
    critical_issues: string[];
    important_recommendations: string[];
    minor_suggestions: string[];
    overall_assessment: string;
    decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';
    reasoning: string;
  };
  final_report?: string;
  
  // Progress tracking
  progress?: {
    total_files: number;
    completed_files: number;
    total_chunks: number;
    completed_chunks: number;
    total_passes: number;
    completed_passes: number;
  };
}

export interface ProjectConfig {
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust' | 'auto';
  file_extensions: string[];
  exclude_patterns: string[];
  max_chunk_tokens: number;
  context_lines: number;
}

export interface PromptTemplate {
  name: string;
  template: string;
  variables: string[];
}

export type Provider = 'ollama' | 'openai' | 'lmstudio';
  
export interface ModelConfig {
  name: string;
  provider: Provider;
  base_url?: string;
  api_key?: string;
  max_tokens: number;
  temperature: number;
}

export interface AnalysisConfig {
  models: {
    syntax_logic: ModelConfig;
    security_performance: ModelConfig;
    architecture_design: ModelConfig;
    testing_docs: ModelConfig;
    synthesis: ModelConfig;
  };
  project: ProjectConfig;
  chunking: {
    max_tokens: number;
    overlap_lines: number;
    min_chunk_size: number;
  };
} 
