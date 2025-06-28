// Concise Prompt Templates for Multi-Pass Analysis
// Designed for focused, actionable responses

import { PrContext, ChunkInfo } from '../types/analysis';

export const SYNTAX_LOGIC_TEMPLATE = `
ANALYZE: Code Quality & Logic

FILE: {file_path}
{chunk_context}

DIFF:
{diff_chunk}

RESPOND IN THIS FORMAT ONLY:
SYNTAX: [list critical syntax issues, or "None"]
LOGIC: [list logic flaws/edge cases, or "None"] 
QUALITY: [major readability/structure issues, or "None"]
RISK: [LOW/MEDIUM/HIGH] - [one sentence why]
`;

export const SECURITY_PERFORMANCE_TEMPLATE = `
ANALYZE: Security & Performance

FILE: {file_path}
{chunk_context}

DIFF:
{diff_chunk}

RESPOND IN THIS FORMAT ONLY:
SECURITY: [critical vulnerabilities, or "None"]
PERFORMANCE: [bottlenecks/inefficiencies, or "None"]
RESOURCES: [memory/connection leaks, or "None"]
RISK: [CRITICAL/HIGH/MEDIUM/LOW] - [one sentence why]
`;

export const ARCHITECTURE_DESIGN_TEMPLATE = `
ANALYZE: Architecture & Design

FILE: {file_path}
{chunk_context}

DIFF:
{diff_chunk}

RESPOND IN THIS FORMAT ONLY:
DESIGN: [architectural concerns, or "None"]
MAINTAINABILITY: [long-term issues, or "None"]
BREAKING_CHANGES: [API/interface breaks, or "None"]
RECOMMENDATIONS: [top 2 improvements, or "None"]
`;

export const TESTING_DOCS_TEMPLATE = `
ANALYZE: Testing & Documentation

FILE: {file_path}
{chunk_context}

DIFF:
{diff_chunk}

RESPOND IN THIS FORMAT ONLY:
TESTS: [missing critical tests, or "Adequate"]
DOCS: [missing documentation, or "Adequate"]
ERROR_HANDLING: [poor error handling, or "Adequate"]
SUGGESTIONS: [top 2 testing improvements, or "None"]
`;

export const SYNTHESIS_TEMPLATE = `
SYNTHESIZE PR ANALYSIS

PR: {pr_title} | Files: {files_count} | Chunks: {chunks_count}

ANALYSIS DATA:
{analysis_results}

RESPOND IN THIS FORMAT ONLY:
SUMMARY: [2 sentences max - what changed and overall quality]
CRITICAL: [must-fix before merge, or "None"]
IMPORTANT: [should-fix for quality, or "None"] 
MINOR: [nice-to-have improvements, or "None"]
DECISION: [APPROVE/REQUEST_CHANGES/REJECT] - [one sentence reasoning]
`;

export const FILE_SYNTHESIS_TEMPLATE = `
SYNTHESIZE FILE ANALYSIS

FILE: {file_path} | Chunks: {chunk_count}

CHUNK ANALYSES:
{chunk_analyses}

RESPOND IN THIS FORMAT ONLY:
SUMMARY: [what this file does and key changes - 1 sentence]
CRITICAL: [must-fix issues, or "None"]
RECOMMENDATIONS: [top 3 specific improvements, or "None"]
RISK: [CRITICAL/HIGH/MEDIUM/LOW] - [one sentence reasoning]
`;

// Template processing utility
export class PromptBuilder {
  static buildAnalysisPrompt(
    template: string,
    chunk: ChunkInfo,
    additionalContext?: { [key: string]: string }
  ): string {
    let prompt = template
      .replace('{file_path}', chunk.file_path)
      .replace('{diff_chunk}', chunk.diff_content);

    // Add concise chunk context
    let chunkContext = '';
    if (chunk.start_line && chunk.end_line) {
      chunkContext += `LINES: ${chunk.start_line}-${chunk.end_line}`;
    }
    if (chunk.context_before) {
      chunkContext += `\nBEFORE: ${chunk.context_before.slice(0, 200)}...`;
    }
    if (chunk.context_after) {
      chunkContext += `\nAFTER: ${chunk.context_after.slice(0, 200)}...`;
    }
    
    prompt = prompt.replace('{chunk_context}', chunkContext);

    // Replace any additional context variables
    if (additionalContext) {
      Object.entries(additionalContext).forEach(([key, value]) => {
        prompt = prompt.replace(`{${key}}`, value);
      });
    }

    return prompt;
  }

  static buildSynthesisPrompt(
    prTitle: string,
    prAuthor: string,
    filesCount: number,
    chunksCount: number,
    analysisResults: string
  ): string {
    return SYNTHESIS_TEMPLATE
      .replace('{pr_title}', prTitle)
      .replace('{files_count}', filesCount.toString())
      .replace('{chunks_count}', chunksCount.toString())
      .replace('{analysis_results}', analysisResults.slice(0, 4000)); // Limit analysis data
  }

  static buildFileSynthesisPrompt(
    filePath: string,
    chunkCount: number,
    chunkAnalyses: string
  ): string {
    return FILE_SYNTHESIS_TEMPLATE
      .replace('{file_path}', filePath)
      .replace('{chunk_count}', chunkCount.toString())
      .replace('{chunk_analyses}', chunkAnalyses.slice(0, 3000)); // Limit chunk data
  }
} 
