/**
 * LangGraph Workflow Definition
 * * This file defines the stateful graph that orchestrates the PR review process.
 * It includes the state definition, nodes for each step, and the conditional
 * logic that controls the flow.
 */

import { StateGraph, END } from "@langchain/langgraph";
import { getPrDetails } from '../services/githubService';
import { getChangedFiles } from '../services/githubService';
import { analyzeFile } from '../services/llmService';
import { synthesizeReport } from '../services/llmService';
import { Octokit } from 'octokit';
import chalk from 'chalk';

// Define the state shape that flows through the graph
interface ReviewState {
  pr_url: string;
  task_id: string;
  pr_details?: {
    title: string;
    body: string | null;
  };
  files_to_review?: string[];
  analyzed_files?: Record<string, string>;
  final_report?: string;
}

// Service clients that will be passed to the nodes
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
// No LLM client needed here - llmService manages its own client internally

/**
 * Defines the conditional router that checks if there are more files to review.
 */
const shouldContinue = (state: ReviewState) => {
  const remainingFiles = state.files_to_review?.length || 0;
  console.log(chalk.blue(`🔀 Workflow decision: ${remainingFiles} files remaining`));
  
  if (state.files_to_review && state.files_to_review.length > 0) {
    console.log(chalk.yellow(`➡️  Continuing to analyze next file: ${state.files_to_review[0]}`));
    return "analyzeFile";
  }
  console.log(chalk.green(`➡️  All files analyzed, moving to report synthesis`));
  return "synthesizeReport";
};

/**
 * Router for after analyzing files - determines if we should continue or synthesize
 */
const routeAfterAnalysis = (state: ReviewState) => {
  const remainingFiles = state.files_to_review?.length || 0;
  console.log(chalk.blue(`🔀 Analysis routing: ${remainingFiles} files remaining`));
  
  if (state.files_to_review && state.files_to_review.length > 0) {
    console.log(chalk.yellow(`➡️  More files to analyze: ${state.files_to_review[0]}`));
    return "analyzeFile";
  }
  console.log(chalk.green(`➡️  All files analyzed, moving to report synthesis`));
  return "synthesizeReport";
};

// Create a new state graph
const workflow = new StateGraph<ReviewState>({
  channels: {
    pr_url: { value: (x: any, y: any) => y, default: () => "" },
    task_id: { value: (x: any, y: any) => y, default: () => "" },
    pr_details: { value: (x: any, y: any) => y, default: () => undefined },
    files_to_review: { value: (x: any, y: any) => y, default: () => [] },
    analyzed_files: { 
      value: (existing: Record<string, string> | undefined, update: Record<string, string> | undefined) => {
        const result = { ...(existing || {}), ...(update || {}) };
        console.log(chalk.gray(`🔄 State update - analyzed_files now has ${Object.keys(result).length} files`));
        return result;
      }, 
      default: () => ({}) 
    },
    final_report: { value: (x: any, y: any) => y, default: () => undefined },
  }
});

// Add nodes to the graph
workflow.addNode("getPrDetails", async (state: ReviewState) => {
  console.log(chalk.bold.blue(`\n🏃 Executing Node: getPrDetails (GitHub SDK)`));
  
  const details = await getPrDetails(octokit, state.pr_url);
  console.log(chalk.green(`✅ Node getPrDetails completed`));
  return { pr_details: details };
});

workflow.addNode("getChangedFiles", async (state: ReviewState) => {
  console.log(chalk.bold.blue(`\n🏃 Executing Node: getChangedFiles (GitHub SDK)`));
  
  const files = await getChangedFiles(octokit, state.pr_url);
  console.log(chalk.green(`✅ Node getChangedFiles completed`));
  return { files_to_review: files };
});

workflow.addNode("analyzeFile", async (state: ReviewState) => {
  console.log(chalk.bold.blue(`\n🏃 Executing Node: analyzeFile (GitHub SDK)`));
  
  if (!state.files_to_review || state.files_to_review.length === 0) {
    console.log(chalk.yellow(`⚠️  No files to analyze`));
    return {}; // No files to analyze
  }
  
  // Take the first file and remove it from the list
  const fileToReview = state.files_to_review[0];
  const remainingFiles = state.files_to_review.slice(1);
  
  console.log(chalk.blue(`📁 Analyzing file: ${chalk.yellow(fileToReview)}`));
  console.log(chalk.blue(`📋 Files remaining after this: ${remainingFiles.length}`));
  
  try {
    const analysis = await analyzeFile(octokit, state.pr_url, fileToReview);
    console.log(chalk.green(`✅ Node analyzeFile completed for ${fileToReview}`));
    
    const result = { 
      files_to_review: remainingFiles,
      analyzed_files: { [fileToReview]: analysis } 
    };
    
    console.log(chalk.blue(`📊 Returning analysis for ${fileToReview} (${analysis ? analysis.length : 0} characters)`));
    console.log(chalk.gray(`📋 Current state: ${Object.keys(state.analyzed_files || {}).length} files already analyzed`));
    
    return result;
  } catch (error: any) {
    console.error(chalk.red(`❌ Error in analyzeFile node for ${fileToReview}:`), error);
    // Return a default analysis if errors occur
    const errorAnalysis = `Error analyzing file: ${error}`;
    
    const result = { 
      files_to_review: remainingFiles,
      analyzed_files: { [fileToReview]: errorAnalysis } 
    };
    
    console.log(chalk.yellow(`📊 Returning error analysis for ${fileToReview}`));
    
    return result;
  }
});

workflow.addNode("synthesizeReport", async (state: ReviewState) => {
  console.log(chalk.bold.blue(`\n🏃 Executing Node: synthesizeReport`));
  
  // Debug: Check what files we have in state
  const analyzedFiles = state.analyzed_files || {};
  const fileCount = Object.keys(analyzedFiles).length;
  console.log(chalk.blue(`📊 Synthesizing report with ${fileCount} analyzed files:`));
  Object.keys(analyzedFiles).forEach((fileName, index) => {
    const analysisLength = analyzedFiles[fileName] ? analyzedFiles[fileName].length : 0;
    console.log(chalk.gray(`   ${index + 1}. ${fileName} (${analysisLength} chars)`));
  });
  
  try {
    const report = await synthesizeReport(state);
    console.log(chalk.green(`✅ Node synthesizeReport completed`));
    return { final_report: report };
  } catch (error) {
    console.error(chalk.red(`❌ Error in synthesizeReport node:`), error);
    // Generate a fallback report
    const analyzedFiles = state.analyzed_files || {};
    const fileCount = Object.keys(analyzedFiles).length;
    console.log(chalk.yellow(`⚠️  Generating fallback report for ${fileCount} files`));
    
    const fallbackReport = `
## PR Review Report (Generated with Limited Analysis)

**Files Analyzed:** ${fileCount}

${Object.entries(analyzedFiles).map(([file, analysis]) => 
  `### ${file}\n${analysis}`
).join('\n\n')}

**Note:** This report was generated with limited analysis due to technical issues.
    `;
    console.log(chalk.green(`✅ Fallback report generated`));
    return { final_report: fallbackReport };
  }
});

// Set up the graph's flow
(workflow as any).setEntryPoint("getPrDetails");
(workflow as any).addEdge("getPrDetails", "getChangedFiles");
(workflow as any).addConditionalEdges(
  "getChangedFiles",
  shouldContinue,
  {
    "analyzeFile": "analyzeFile",
    "synthesizeReport": "synthesizeReport"
  }
);
(workflow as any).addConditionalEdges(
  "analyzeFile",
  routeAfterAnalysis,
  {
    "analyzeFile": "analyzeFile",
    "synthesizeReport": "synthesizeReport"
  }
);
(workflow as any).addEdge("synthesizeReport", END);

export const app = workflow.compile({
  checkpointer: undefined, // No checkpointing needed for simple workflows
});

// Configure with higher recursion limit to handle large number of files
export const getAppWithConfig = () => {
  return {
    app,
    config: {
      recursionLimit: 100, // Increase from default 25 to handle more files
      maxSteps: 1000,     // Maximum number of steps to prevent infinite loops
    }
  };
};
