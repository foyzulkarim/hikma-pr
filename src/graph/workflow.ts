/**
 * Enhanced Multi-Pass PR Review Workflow (V2)
 * 
 * This implements the new architecture with:
 * - Smart file filtering
 * - Recursive chunking
 * - 4-pass specialized analysis
 * - Hierarchical synthesis
 * - Complete tracking in database
 */

import { StateGraph, END } from "@langchain/langgraph";
import { ReviewState, AnalysisConfig, ChunkInfo, AnalysisPass, Provider } from '../types/analysis';
import { FileFilterService } from '../services/fileFilterService';
import { ChunkService } from '../services/chunkService';
import { AnalysisService } from '../services/analysisService';
import { PluginService } from '../services/pluginService';
import { getPrDetailsViaCli, getChangedFilesViaCli, getFullPrDiffViaCli, extractFileFromFullDiff } from '../services/githubService';
import { PromptBuilder } from '../prompts/templates';
import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';

const MODEL1 = "llama3.2:3b-instruct-fp16";
const MODEL2 = "gemma3:27b-it-q8_0";
const MODEL3 = 'qwen2.5-coder:14b-instruct-q4_K_M';
const MODEL4 = 'qwen2.5-coder:32b-instruct-q8_0';
const MODEL5 = 'gemma3:1b';

// LM Studio models
const LMS_QWEN25_CODER_14B = 'qwen2.5-coder-14b-instruct-mlx';
const LMS_QWEN25_CODER_32B = 'qwen2.5-coder-32b-instruct-mlx';
const LMS_GEMMA_3_1B = 'google/gemma-3-1b';

const SELECTED_MODEL = LMS_GEMMA_3_1B;

const URLS = {
  OLLAMA: 'http://localhost:11434',
  LMSTUDIO: 'http://192.168.4.106:1234',
};

const SELECTED_PROVIDER = {
  NAME: "lmstudio" as Provider,
  BASE_URL: URLS.LMSTUDIO,
};

// Default configuration
export const DEFAULT_CONFIG = {
  // models: {
  //   syntax_logic: {
  //     name: "", // Will be set dynamically
  //     provider: "lmstudio", // Default provider, can be overridden
  //     base_url: "", // Will be set dynamically
  //     max_tokens: 8000,
  //     temperature: 0.1
  //   },
  //   security_performance: {
  //     name: "", // Will be set dynamically
  //     provider: "lmstudio",
  //     base_url: "",
  //     max_tokens: 8000,
  //     temperature: 0.1
  //   },
  //   architecture_design: {
  //     name: "", // Will be set dynamically
  //     provider: "lmstudio",
  //     base_url: "",
  //     max_tokens: 8000,
  //     temperature: 0.1
  //   },
  //   testing_docs: {
  //     name: "", // Will be set dynamically
  //     provider: "lmstudio",
  //     base_url: "",
  //     max_tokens: 8000,
  //     temperature: 0.1
  //   },
  //   synthesis: {
  //     name: "", // Will be set dynamically
  //     provider: "lmstudio",
  //     base_url: "",
  //     max_tokens: 8000,
  //     temperature: 0.3
  //   }
  // },
  project: {
    language: 'typescript',
    file_extensions: ['.ts', '.tsx', '.js', '.jsx'],
    exclude_patterns: ['*.d.ts', '*.min.js', 'node_modules/**', 'dist/**', 'build/**', '*.test.ts', '*.spec.ts'],
    max_chunk_tokens: 4000,
    context_lines: 5
  },
  chunking: {
    max_tokens: 4000,
    overlap_lines: 3,
    min_chunk_size: 50
  }
};

// Service instances
let fileFilterService: FileFilterService;
let chunkService: ChunkService;
let analysisService: AnalysisService;
let prisma: PrismaClient;

/**
 * Initialize services
 */
function initializeServices(config: Partial<AnalysisConfig>, pluginService?: PluginService) {
  fileFilterService = new FileFilterService(config.project);
  chunkService = new ChunkService(config.project || {});
  analysisService = new AnalysisService(config as AnalysisConfig, pluginService);
  prisma = new PrismaClient();
  console.log(chalk.blue(`🚀 Enhanced workflow services initialized`));
}

/**
 * Workflow routing functions
 */
const shouldContinueFileProcessing = (state: ReviewState) => {
  const remaining = state.files_to_process?.length || 0;
  console.log(chalk.blue(`🔀 File processing decision: ${remaining} files remaining`));

  if (remaining > 0) {
    console.log(chalk.yellow(`➡️  Processing next file: ${state.files_to_process![0]}`));
    return "setupFileChunks";
  }
  console.log(chalk.green(`➡️  All files processed, moving to final synthesis`));
  return "finalSynthesis";
};

const shouldContinueChunkProcessing = (state: ReviewState) => {
  const remaining = state.chunks_to_process?.length || 0;
  console.log(chalk.blue(`🔀 Chunk processing decision: ${remaining} chunks remaining`));

  if (remaining > 0) {
    console.log(chalk.yellow(`➡️  Processing next chunk: ${state.chunks_to_process![0].id.slice(0, 8)}`));
    return "analyzeChunk";
  }
  console.log(chalk.green(`➡️  All chunks processed, synthesizing file results`));
  return "synthesizeFile";
};

// Create the multi-pass analysis workflow
const workflow = new StateGraph<ReviewState>({
  channels: {
    // Core identification
    pr_url: { value: (x: any, y: any) => y, default: () => "" },
    task_id: { value: (x: any, y: any) => y, default: () => "" },

    // Context establishment
    pr_details: { value: (x: any, y: any) => y, default: () => undefined },
    pr_context: { value: (x: any, y: any) => y, default: () => undefined },

    // File processing
    all_changed_files: { value: (x: any, y: any) => y, default: () => [] },
    filtered_files: { value: (x: any, y: any) => y, default: () => [] },
    files_to_process: { value: (x: any, y: any) => y, default: () => [] },
    current_file: { value: (x: any, y: any) => y, default: () => undefined },

    // Full diff (fetched once)
    full_pr_diff: { value: (x: any, y: any) => y, default: () => undefined },

    // Chunk processing
    file_chunks: {
      value: (existing: any, update: any) => ({ ...(existing || {}), ...(update || {}) }),
      default: () => ({})
    },
    current_chunks: { value: (x: any, y: any) => y, default: () => [] },
    chunks_to_process: { value: (x: any, y: any) => y, default: () => [] },
    current_chunk: { value: (x: any, y: any) => y, default: () => undefined },
    current_pass: { value: (x: any, y: any) => y, default: () => undefined },

    // Analysis results
    chunk_analyses: {
      value: (existing: any, update: any) => ({ ...(existing || {}), ...(update || {}) }),
      default: () => ({})
    },
    file_results: {
      value: (existing: any, update: any) => ({ ...(existing || {}), ...(update || {}) }),
      default: () => ({})
    },

    // Final synthesis
    synthesis_data: { value: (x: any, y: any) => y, default: () => undefined },
    final_report: { value: (x: any, y: any) => y, default: () => undefined },

    // Progress tracking
    progress: {
      value: (existing: any, update: any) => ({ ...(existing || {}), ...(update || {}) }),
      default: () => ({
        total_files: 0,
        completed_files: 0,
        total_chunks: 0,
        completed_chunks: 0,
        total_passes: 0,
        completed_passes: 0
      })
    }
  }
});

/**
 * Node 1: Establish Context
 */
workflow.addNode("establishContext", async (state: ReviewState) => {
  console.log(chalk.bold.blue(`
🏃 Node: establishContext`));

  const details = await getPrDetailsViaCli(state.pr_url);

  // Parse URL for context
  const urlMatch = state.pr_url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  const owner = urlMatch?.[1] || 'unknown';
  const repo = urlMatch?.[2] || 'unknown';

  const context = {
    repo_name: `${owner}/${repo}`,
    source_branch: 'feature-branch', // TODO: Get from PR details
    target_branch: 'main', // TODO: Get from PR details
    file_count: 0, // Will be updated later
    additions: details.body?.length || 0, // Placeholder
    deletions: 0, // Placeholder
    diff_summary: details.body || 'No description provided'
  };

  console.log(chalk.green(`✅ Context established for ${context.repo_name}`));

  return {
    pr_details: details,
    pr_context: context
  };
});

/**
 * Node 2: Filter Files & Fetch Full Diff
 */
workflow.addNode("filterFiles", async (state: ReviewState) => {
  console.log(chalk.bold.blue(`
🏃 Node: filterFiles`));

  // Fetch files and full diff in parallel for efficiency
  console.log(chalk.blue(`🔄 Fetching changed files and full PR diff...`));

  const [allFiles, fullDiff] = await Promise.all([
    getChangedFilesViaCli(state.pr_url),
    getFullPrDiffViaCli(state.pr_url)
  ]);

  if (!fullDiff) {
    throw new Error('Could not fetch PR diff');
  }

  const filteredFiles = fileFilterService.filterFiles(allFiles);

  // Update context with file count
  const updatedContext = {
    ...state.pr_context!,
    file_count: filteredFiles.length
  };

  // Estimate complexity
  const complexity = fileFilterService.estimateComplexity(filteredFiles);
  console.log(chalk.blue(`📊 Analysis complexity estimation:`));
  console.log(chalk.gray(`   Files: ${complexity.totalFiles}`));
  console.log(chalk.gray(`   Est. chunks: ${complexity.estimatedChunks}`));
  console.log(chalk.gray(`   Est. passes: ${complexity.estimatedPasses}`));
  console.log(chalk.gray(`   Est. time: ${complexity.estimatedTimeMinutes} minutes`));

  console.log(chalk.green(`✅ Single API call completed - all file diffs cached locally`));

  return {
    all_changed_files: allFiles,
    filtered_files: filteredFiles,
    files_to_process: [...filteredFiles],
    full_pr_diff: fullDiff,
    pr_context: updatedContext,
    progress: {
      total_files: filteredFiles.length,
      completed_files: 0,
      total_chunks: complexity.estimatedChunks,
      completed_chunks: 0,
      total_passes: complexity.estimatedPasses,
      completed_passes: 0
    }
  };
});

/**
 * Node 3: Setup File Chunks
 */
workflow.addNode("setupFileChunks", async (state: ReviewState) => {
  console.log(chalk.bold.blue(`
🏃 Node: setupFileChunks`));

  if (!state.files_to_process || state.files_to_process.length === 0) {
    console.log(chalk.yellow(`⚠️  No files to process`));
    return {};
  }

  const currentFile = state.files_to_process[0];
  const remainingFiles = state.files_to_process.slice(1);

  console.log(chalk.blue(`📁 Setting up chunks for: ${chalk.yellow(currentFile)}`));

  // Extract file diff from already-fetched full diff (LOCAL operation, no API call!)
  const diff = extractFileFromFullDiff(state.full_pr_diff!, currentFile);
  if (!diff) {
    console.log(chalk.red(`❌ Could not extract diff for ${currentFile}, skipping...`));
    return {
      current_file: currentFile,
      files_to_process: remainingFiles,
      current_chunks: [],
      chunks_to_process: []
    };
  }

  // Create chunks
  const chunks = await chunkService.chunkFileDiff(currentFile, diff);

  // Save chunks to database
  for (const chunk of chunks) {
    await prisma.chunkAnalysis.create({
      data: {
        reviewId: state.task_id,
        chunkId: chunk.id,
        filePath: chunk.file_path,
        startLine: chunk.start_line,
        endLine: chunk.end_line,
        sizeTokens: chunk.size_tokens,
        diffContent: chunk.diff_content,
        isCompleteFile: chunk.is_complete_file,
        contextBefore: chunk.context_before,
        contextAfter: chunk.context_after
      }
    });
  }

  console.log(chalk.green(`✅ Created ${chunks.length} chunks for ${currentFile}`));

  return {
    current_file: currentFile,
    files_to_process: remainingFiles,
    file_chunks: { [currentFile]: chunks },
    current_chunks: chunks,
    chunks_to_process: [...chunks]
  };
});

/**
 * Node 4: Analyze Chunk (4-pass analysis)
 */
workflow.addNode("analyzeChunk", async (state: ReviewState) => {
  console.log(chalk.bold.blue(`
🏃 Node: analyzeChunk`));

  if (!state.chunks_to_process || state.chunks_to_process.length === 0) {
    console.log(chalk.yellow(`⚠️  No chunks to process`));
    return {};
  }

  const currentChunk = state.chunks_to_process[0];
  const remainingChunks = state.chunks_to_process.slice(1);

  console.log(chalk.blue(`🔬 Analyzing chunk: ${chalk.yellow(currentChunk.id.slice(0, 8))}`));

  // Perform 4-pass analysis
  const chunkAnalysis = await analysisService.analyzeChunk(currentChunk);

  // Save analysis passes to database (excluding plugin findings)
  for (const [passType, analysis] of Object.entries(chunkAnalysis)) {
    if (analysis && passType !== 'plugin_findings' && typeof analysis === 'object' && 'analysis_result' in analysis) {
      await prisma.analysisPass.create({
        data: {
          reviewId: state.task_id,
          chunkId: currentChunk.id,
          passType: passType,
          analysisResult: analysis.analysis_result,
          riskLevel: analysis.risk_level,
          issuesFound: analysis.issues_found,
          recommendations: analysis.recommendations,
          tokensUsed: analysis.tokens_used,
          durationMs: analysis.duration_ms
        }
      });
    }
  }

  // Save plugin findings to separate table
  if (chunkAnalysis.plugin_findings && Array.isArray(chunkAnalysis.plugin_findings)) {
    for (const finding of chunkAnalysis.plugin_findings) {
      await prisma.pluginFinding.create({
        data: {
          reviewId: state.task_id,
          chunkId: currentChunk.id,
          pluginId: finding.pluginId,
          pluginName: finding.pluginName,
          message: finding.message,
          severity: finding.severity,
          line: finding.line || null
        }
      });
    }
    console.log(chalk.blue(`💾 Saved ${chunkAnalysis.plugin_findings.length} plugin findings to database`));
  }

  console.log(chalk.green(`✅ 4-pass analysis completed for chunk ${currentChunk.id.slice(0, 8)}`));

  // Update progress
  const newProgress = {
    ...state.progress!,
    completed_chunks: (state.progress?.completed_chunks || 0) + 1,
    completed_passes: (state.progress?.completed_passes || 0) + 4
  };

  return {
    current_chunk: currentChunk,
    chunks_to_process: remainingChunks,
    chunk_analyses: { [currentChunk.id]: chunkAnalysis },
    progress: newProgress
  };
});

/**
 * Node 5: Synthesize File
 */
workflow.addNode("synthesizeFile", async (state: ReviewState) => {
  console.log(chalk.bold.blue(`
🏃 Node: synthesizeFile`));

  const currentFile = state.current_file!;
  const fileChunks = state.current_chunks || [];

  // Collect all chunk analyses for this file
  const fileChunkAnalyses: { [chunkId: string]: any } = {};
  for (const chunk of fileChunks) {
    if (state.chunk_analyses?.[chunk.id]) {
      fileChunkAnalyses[chunk.id] = state.chunk_analyses[chunk.id];
    }
  }

  console.log(chalk.magenta(`📊 Synthesizing results for file: ${chalk.yellow(currentFile)}`));

  // Generate file-level synthesis
  const fileResult = await analysisService.synthesizeFileAnalysis(currentFile, fileChunkAnalyses);

  console.log(chalk.green(`✅ File synthesis completed for ${currentFile}`));

  // Update progress
  const newProgress = {
    ...state.progress!,
    completed_files: (state.progress?.completed_files || 0) + 1
  };

  return {
    file_results: { [currentFile]: fileResult },
    progress: newProgress
  };
});

/**
 * Node 6: Final Synthesis
 * Note: This node is redefined in getAppWithConfig() to ensure proper access to analysisService
 */

// Set up the graph flow
(workflow as any).setEntryPoint("establishContext");
(workflow as any).addEdge("establishContext", "filterFiles");
(workflow as any).addConditionalEdges(
  "filterFiles",
  shouldContinueFileProcessing,
  {
    "setupFileChunks": "setupFileChunks",
    "finalSynthesis": "finalSynthesis"
  }
);
(workflow as any).addConditionalEdges(
  "setupFileChunks",
  shouldContinueChunkProcessing,
  {
    "analyzeChunk": "analyzeChunk",
    "synthesizeFile": "synthesizeFile"
  }
);
(workflow as any).addConditionalEdges(
  "analyzeChunk",
  shouldContinueChunkProcessing,
  {
    "analyzeChunk": "analyzeChunk",
    "synthesizeFile": "synthesizeFile"
  }
);
(workflow as any).addConditionalEdges(
  "synthesizeFile",
  shouldContinueFileProcessing,
  {
    "setupFileChunks": "setupFileChunks",
    "finalSynthesis": "finalSynthesis"
  }
);
(workflow as any).addEdge("finalSynthesis", END);

// Note: Workflow compilation is done in getAppWithConfig() after services are initialized

export const getAppWithConfig = (customConfig?: Partial<AnalysisConfig> & { pluginService?: PluginService }) => {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  initializeServices(config as AnalysisConfig, customConfig?.pluginService);

  // Re-create the finalSynthesis node with proper access to analysisService
  workflow.addNode("finalSynthesis", async (state: ReviewState) => {
    console.log(chalk.bold.blue(`🏃 Node: finalSynthesis`));

    // Collect all file results
    const fileResults = state.file_results || {};
    const fileCount = Object.keys(fileResults).length;

    if (fileCount === 0) {
      console.log(chalk.yellow(`⚠️  No file results to synthesize`));
      return {
        final_report: "No files were analyzed due to filtering or errors."
      };
    }

    // Prepare analysis summary
    let analysisText = '';
    let criticalIssues: string[] = [];
    let importantRecommendations: string[] = [];
    let minorSuggestions: string[] = [];

    for (const [filePath, result] of Object.entries(fileResults)) {
      analysisText += `
## File: ${filePath}
`;
      analysisText += `Risk Level: ${result.overall_risk}
`;
      analysisText += `Total Issues: ${result.total_issues}
`;
      analysisText += `Analysis: ${result.file_synthesis}
`;

      // Categorize by risk level
      if (result.overall_risk === 'CRITICAL' || result.overall_risk === 'HIGH') {
        criticalIssues.push(`${filePath}: ${result.total_issues} issues (${result.overall_risk})`);
      } else if (result.overall_risk === 'MEDIUM') {
        importantRecommendations.push(`${filePath}: Review recommended`);
      } else {
        minorSuggestions.push(`${filePath}: Low risk, minor improvements possible`);
      }
    }

    // Determine overall decision
    const hasCritical = criticalIssues.length > 0;
    const hasImportant = importantRecommendations.length > 0;

    let decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' = 'APPROVE';
    let reasoning = 'No significant issues found.';

    if (hasCritical) {
      decision = criticalIssues.length > fileCount / 2 ? 'REJECT' : 'REQUEST_CHANGES';
      reasoning = `Found ${criticalIssues.length} files with critical/high risk issues.`;
    } else if (hasImportant) {
      decision = 'REQUEST_CHANGES';
      reasoning = `Found ${importantRecommendations.length} files that would benefit from improvements.`;
    }

    const synthesisData = {
      critical_issues: criticalIssues,
      important_recommendations: importantRecommendations,
      minor_suggestions: minorSuggestions,
      overall_assessment: `Analyzed ${fileCount} files with ${decision.toLowerCase()} recommendation.`,
      decision,
      reasoning
    };

    // Generate final report using LLM
    const finalReportPrompt = PromptBuilder.buildSynthesisPrompt(
      state.pr_details?.title || 'No title',
      'Unknown author', // TODO: Get from PR details
      fileCount,
      Object.keys(state.chunk_analyses || {}).length,
      analysisText
    );

    console.log(chalk.magenta(`🤖 Generating final report...`));

    let finalReport = '';
    try {
      if (analysisService && analysisService['llmClient']) {
        finalReport = await analysisService['llmClient'].generate(finalReportPrompt, {
          onData: (chunk: string) => {
            process.stdout.write(chalk.magenta(chunk));
          },
          onComplete: () => {
            console.log(); // New line
            console.log(chalk.green(`✅ Final report synthesis completed`));
          },
          onError: (error: Error) => {
            console.error(chalk.red(`❌ Streaming error:`), error.message);
          }
        });
      } else {
        console.log(chalk.yellow(`⚠️  Analysis service not available, generating basic report`));
        finalReport = `# PR Review Summary

## Overall Assessment
${synthesisData.decision}: ${synthesisData.reasoning}

## Files Analyzed: ${fileCount}

### Critical Issues (${criticalIssues.length})
${criticalIssues.map(issue => `- ${issue}`).join('\n')}

### Important Recommendations (${importantRecommendations.length})
${importantRecommendations.map(rec => `- ${rec}`).join('\n')}

### Minor Suggestions (${minorSuggestions.length})
${minorSuggestions.map(sug => `- ${sug}`).join('\n')}

## Detailed Analysis
${analysisText}
`;
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error generating final report: ${error}`));
      finalReport = `# PR Review Summary (Error occurred during generation)

## Overall Assessment
${synthesisData.decision}: ${synthesisData.reasoning}

## Files Analyzed: ${fileCount}
${analysisText}
`;
    }

    return {
      synthesis_data: synthesisData,
      final_report: finalReport
    };
  });

  // Re-compile the workflow after updating the node
  const compiledApp = workflow.compile({
    checkpointer: undefined,
  });

  return {
    app: compiledApp,
    config: {
      recursionLimit: 200, // Higher limit for complex workflows
      maxSteps: 2000,
    }
  };
}; 
