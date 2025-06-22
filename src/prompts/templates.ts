// Prompt Templates for Multi-Pass Analysis

import { PrContext, ChunkInfo } from '../types/analysis';

export const CONTEXT_ESTABLISHMENT_TEMPLATE = `
You are a senior software engineer reviewing code changes. Your task is to analyze this pull request diff systematically.

CONTEXT:
- Repository: {repo_name}
- Branch: {source_branch} → {target_branch}
- Files changed: {file_count}
- Lines added: {additions}, Lines removed: {deletions}

DIFF OVERVIEW:
{diff_summary}

Your analysis should be thorough, focusing on code quality, potential bugs, security issues, and best practices. Respond in structured format.
`;

export const SYNTAX_LOGIC_TEMPLATE = `
TASK: Code Quality & Logic Review

Analyze the following diff for:
1. Syntax errors or potential compilation issues
2. Logic errors or edge cases
3. Code structure and readability
4. Variable naming and conventions

FILE: {file_path}
{chunk_context}

DIFF:
{diff_chunk}

FORMAT YOUR RESPONSE:
## Syntax Issues
- [List any syntax problems]

## Logic Concerns
- [Identify logical flaws or edge cases]

## Code Quality
- [Comment on structure, readability, naming]

## Risk Level
[LOW/MEDIUM/HIGH] - Brief justification
`;

export const SECURITY_PERFORMANCE_TEMPLATE = `
TASK: Security & Performance Review

Examine this code diff for:
1. Security vulnerabilities (injection, XSS, auth bypass, etc.)
2. Performance bottlenecks or inefficiencies
3. Resource management issues
4. Data validation problems

FILE: {file_path}
{chunk_context}

DIFF:
{diff_chunk}

FORMAT YOUR RESPONSE:
## Security Issues
- [List security concerns with severity]

## Performance Impact
- [Identify performance issues]

## Resource Management
- [Memory leaks, file handles, connections]

## Risk Assessment
[CRITICAL/HIGH/MEDIUM/LOW] - Detailed reasoning
`;

export const ARCHITECTURE_DESIGN_TEMPLATE = `
TASK: Architecture & Design Review

Evaluate this diff for:
1. Design patterns and architectural concerns
2. Code maintainability and extensibility
3. Dependency management
4. API design and contracts

FILE: {file_path}
{chunk_context}

DIFF:
{diff_chunk}

FORMAT YOUR RESPONSE:
## Design Quality
- [Assess architectural decisions]

## Maintainability
- [Long-term code health concerns]

## API/Interface Changes
- [Breaking changes, backward compatibility]

## Recommendations
- [Specific improvement suggestions]
`;

export const TESTING_DOCS_TEMPLATE = `
TASK: Testing & Documentation Review

Review this diff for:
1. Test coverage and quality
2. Documentation completeness
3. Example usage and edge cases
4. Error handling and logging

FILE: {file_path}
{chunk_context}

DIFF:
{diff_chunk}

FORMAT YOUR RESPONSE:
## Test Coverage
- [Assess test completeness]

## Documentation
- [Missing or unclear documentation]

## Error Handling
- [Exception handling quality]

## Suggestions
- [Testing and documentation improvements]
`;

export const SYNTHESIS_TEMPLATE = `
TASK: Synthesize Pull Request Analysis

You have completed multiple specialized reviews of a pull request. Now synthesize these findings into a comprehensive review.

PULL REQUEST CONTEXT:
- Title: {pr_title}
- Author: {pr_author}
- Files analyzed: {files_count}
- Total chunks: {chunks_count}

PREVIOUS ANALYSES:
{analysis_results}

SYNTHESIS REQUIREMENTS:
1. Prioritize issues by severity and impact
2. Identify patterns across different analysis types
3. Provide actionable recommendations
4. Suggest approval/rejection with reasoning

FORMAT YOUR RESPONSE:
## Executive Summary
[2-3 sentences on overall assessment]

## Critical Issues
[Must-fix items before merge]

## Important Recommendations
[Should-fix items for code quality]

## Minor Suggestions
[Nice-to-have improvements]

## Decision Recommendation
[APPROVE/REQUEST_CHANGES/REJECT] with clear reasoning
`;

export const FILE_SYNTHESIS_TEMPLATE = `
TASK: Synthesize File Analysis

You have analyzed a file through multiple specialized passes. Synthesize the findings into a cohesive file-level review.

FILE: {file_path}
CHUNKS ANALYZED: {chunk_count}

ANALYSIS RESULTS:
{chunk_analyses}

Provide a cohesive summary that:
1. Identifies the most critical issues for this file
2. Provides specific recommendations
3. Assigns an overall risk level
4. Suggests prioritized actions

FORMAT YOUR RESPONSE:
## File Summary
[What this file does and what changed]

## Critical Issues
[Must-fix issues for this file]

## Recommendations
[Specific improvements for this file]

## Overall Risk Level
[CRITICAL/HIGH/MEDIUM/LOW] with reasoning
`;

// Template processing utility
export class PromptBuilder {
  static buildContextEstablishment(context: PrContext): string {
    return CONTEXT_ESTABLISHMENT_TEMPLATE
      .replace('{repo_name}', context.repo_name)
      .replace('{source_branch}', context.source_branch)
      .replace('{target_branch}', context.target_branch)
      .replace('{file_count}', context.file_count.toString())
      .replace('{additions}', context.additions.toString())
      .replace('{deletions}', context.deletions.toString())
      .replace('{diff_summary}', context.diff_summary);
  }

  static buildAnalysisPrompt(
    template: string,
    chunk: ChunkInfo,
    additionalContext?: { [key: string]: string }
  ): string {
    let prompt = template
      .replace('{file_path}', chunk.file_path)
      .replace('{diff_chunk}', chunk.diff_content);

    // Add chunk context if available
    let chunkContext = '';
    if (chunk.context_before) {
      chunkContext += `\nCONTEXT BEFORE:\n${chunk.context_before}`;
    }
    if (chunk.context_after) {
      chunkContext += `\nCONTEXT AFTER:\n${chunk.context_after}`;
    }
    if (chunk.start_line && chunk.end_line) {
      chunkContext += `\nLINES: ${chunk.start_line}-${chunk.end_line}`;
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
      .replace('{pr_author}', prAuthor)
      .replace('{files_count}', filesCount.toString())
      .replace('{chunks_count}', chunksCount.toString())
      .replace('{analysis_results}', analysisResults);
  }

  static buildFileSynthesisPrompt(
    filePath: string,
    chunkCount: number,
    chunkAnalyses: string
  ): string {
    return FILE_SYNTHESIS_TEMPLATE
      .replace('{file_path}', filePath)
      .replace('{chunk_count}', chunkCount.toString())
      .replace('{chunk_analyses}', chunkAnalyses);
  }
} 
