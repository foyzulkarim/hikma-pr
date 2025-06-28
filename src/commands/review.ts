/**
 * Handler for the 'review' command - now supports both V1 and V2 workflows.
 */
// import { loadConfiguration } from '../config/configLoader';
import { PrismaClient } from '@prisma/client';
import { getAppWithConfig, DEFAULT_CONFIG } from '../graph/workflow';
// import { GitHubMethod } from '../index';
import { v4 as uuidv4 } from 'uuid';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Generates a comprehensive markdown report from the review state
 */
const generateMarkdownReport = async (state: any, taskId: string, prUrl: string, prisma: PrismaClient, analysisMetadata?: {
  startTime: Date;
  endTime: Date;
  modelInfo: {
    providerUrl: string;
    modelName: string;
  };
}, reviewRecord?: any): Promise<string> => {
  const timestamp = new Date().toISOString();
  const prDetails = state.pr_details || {};

  // Handle both workflow types: CLI workflow uses analyzed_files, advanced workflow uses file_results
  const analyzedFiles = state.analyzed_files || {};
  const fileResults = state.file_results || {};

  // Count total files analyzed from both sources
  const analyzedFilesCount = Object.keys(analyzedFiles).length;
  const fileResultsCount = Object.keys(fileResults).length;
  const totalFileCount = analyzedFilesCount + fileResultsCount;

  // Extract owner/repo from URL for cleaner display
  const urlMatch = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  const owner = urlMatch ? urlMatch[1] : 'unknown';
  const repo = urlMatch ? urlMatch[2] : 'unknown';
  const prNumber = urlMatch ? urlMatch[3] : 'unknown';

  // Calculate elapsed time - prefer database timing if available
  let timingInfo = '';
  let modelProvider = 'Unknown';
  let modelName = 'Unknown';

  if (reviewRecord && reviewRecord.startedAt && reviewRecord.completedAt) {
    // Use database timing (most accurate)
    const startTime = new Date(reviewRecord.startedAt);
    const endTime = new Date(reviewRecord.completedAt);
    const elapsedMs = endTime.getTime() - startTime.getTime();
    const elapsedSeconds = Math.round(elapsedMs / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const remainingSeconds = elapsedSeconds % 60;

    const elapsedFormatted = elapsedMinutes > 0
      ? `${elapsedMinutes}m ${remainingSeconds}s`
      : `${elapsedSeconds}s`;

    modelProvider = reviewRecord.modelProvider || 'Unknown';
    modelName = reviewRecord.modelName || 'Unknown';

    timingInfo = `
## ⏱️ Analysis Performance

| Metric | Value |
|--------|-------|
| **LLM Provider** | ${modelProvider} |
| **Model Used** | \`${modelName}\` |
| **Start Time** | ${startTime.toLocaleString()} |
| **End Time** | ${endTime.toLocaleString()} |
| **Total Duration** | ${elapsedFormatted} |
| **Average per File** | ${totalFileCount > 0 ? Math.round(elapsedSeconds / totalFileCount) : 0}s |

`;
  } else if (analysisMetadata) {
    // Fallback to passed metadata
    const elapsedMs = analysisMetadata.endTime.getTime() - analysisMetadata.startTime.getTime();
    const elapsedSeconds = Math.round(elapsedMs / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const remainingSeconds = elapsedSeconds % 60;

    const elapsedFormatted = elapsedMinutes > 0
      ? `${elapsedMinutes}m ${remainingSeconds}s`
      : `${elapsedSeconds}s`;

    modelProvider = analysisMetadata.modelInfo.providerUrl;
    modelName = analysisMetadata.modelInfo.modelName;

    timingInfo = `
## ⏱️ Analysis Performance

| Metric | Value |
|--------|-------|
| **LLM Provider** | ${modelProvider} |
| **Model Used** | \`${modelName}\` |
| **Start Time** | ${analysisMetadata.startTime.toLocaleString()} |
| **End Time** | ${analysisMetadata.endTime.toLocaleString()} |
| **Total Duration** | ${elapsedFormatted} |
| **Average per File** | ${totalFileCount > 0 ? Math.round(elapsedSeconds / totalFileCount) : 0}s |

`;
  }

  let markdown = `# 📊 Hikmapr PR Review Report

## 📋 Pull Request Information

| Field | Value |
|-------|-------|
| **Repository** | \`${owner}/${repo}\` |
| **PR Number** | #${prNumber} |
| **PR Title** | ${prDetails.title || 'No title'} |
| **PR URL** | [${prUrl}](${prUrl}) |
| **Review Date** | ${new Date(timestamp).toLocaleString()} |
| **Task ID** | \`${taskId}\` |
| **Files Analyzed** | ${totalFileCount} |

${timingInfo}## 📝 PR Description

${prDetails.body || '*No description provided*'}

---

## 🔍 File Analysis Summary

`;

  // Add individual file analyses
  if (totalFileCount > 0) {
    markdown += `### Files Reviewed (${totalFileCount})\n\n`;

    // Handle CLI workflow analyzed_files (simple string analyses)
    for (const [fileName, analysis] of Object.entries(analyzedFiles)) {
      markdown += `#### 📁 \`${fileName}\`\n\n`;
      markdown += `${analysis || '*No analysis available*'}\n\n`;
      markdown += `---\n\n`;
    }

    // Handle advanced workflow file_results (structured FileAnalysisResult objects)
    for (const [fileName, result] of Object.entries(fileResults)) {
      const fileResult = result as any; // Type assertion since we're dealing with any
      markdown += `#### 📁 \`${fileName}\`\n\n`;

      if (fileResult.overall_risk) {
        markdown += `**Risk Level:** ${fileResult.overall_risk}\n`;
      }
      if (fileResult.total_issues !== undefined) {
        markdown += `**Issues Found:** ${fileResult.total_issues}\n`;
      }
      if (fileResult.total_chunks !== undefined) {
        markdown += `**Chunks Analyzed:** ${fileResult.total_chunks}\n`;
      }

      markdown += `\n**Analysis:**\n`;
      markdown += `${fileResult.file_synthesis || '*No synthesis available*'}\n\n`;

      if (fileResult.recommendations && fileResult.recommendations.length > 0) {
        markdown += `**Recommendations:**\n`;
        fileResult.recommendations.forEach((rec: string, index: number) => {
          markdown += `${index + 1}. ${rec}\n`;
        });
        markdown += `\n`;
      }

      // Add plugin findings from database
      try {
        const pluginFindings = await prisma.pluginFinding.findMany({
          where: {
            reviewId: taskId,
            // Get findings for chunks related to this file
            chunk: {
              filePath: fileName
            }
          },
          orderBy: [
            { line: 'asc' },
            { severity: 'desc' }
          ]
        });

        if (pluginFindings.length > 0) {
          // Count findings by severity
          const severityCounts = pluginFindings.reduce((acc, finding) => {
            acc[finding.severity] = (acc[finding.severity] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const errorCount = severityCounts.error || 0;
          const warningCount = severityCounts.warning || 0;
          const infoCount = severityCounts.info || 0;

          markdown += `\n### 🔌 Plugin Analysis Results\n\n`;
          
          // Summary with badges
          let summaryBadges = [];
          if (errorCount > 0) summaryBadges.push(`🚨 ${errorCount} error${errorCount > 1 ? 's' : ''}`);
          if (warningCount > 0) summaryBadges.push(`⚠️ ${warningCount} warning${warningCount > 1 ? 's' : ''}`);
          if (infoCount > 0) summaryBadges.push(`ℹ️ ${infoCount} info`);
          
          markdown += `**Summary:** ${summaryBadges.join(' • ')}\n\n`;
          
          // Group findings by plugin for better organization
          const findingsByPlugin = pluginFindings.reduce((acc: Record<string, typeof pluginFindings>, finding) => {
            if (!acc[finding.pluginName]) acc[finding.pluginName] = [];
            acc[finding.pluginName].push(finding);
            return acc;
          }, {});

          // Sort plugins by severity (plugins with errors first)
          const sortedPlugins = Object.entries(findingsByPlugin).sort(([, findingsA], [, findingsB]) => {
            const maxSeverityA = Math.min(...findingsA.map(f => ['error', 'warning', 'info'].indexOf(f.severity)));
            const maxSeverityB = Math.min(...findingsB.map(f => ['error', 'warning', 'info'].indexOf(f.severity)));
            return maxSeverityA - maxSeverityB;
          });

          for (const [pluginName, findings] of sortedPlugins) {
            const pluginIcon = pluginName.includes('Security') ? '🔒' :
                             pluginName.includes('React') ? '⚛️' :
                             pluginName.includes('TypeScript') ? '📘' :
                             pluginName.includes('Code Smell') ? '🔍' : '🔌';
            
            markdown += `#### ${pluginIcon} ${pluginName}\n\n`;
            
            // Sort findings by severity, then by line number
            const sortedFindings = findings.sort((a, b) => {
              const severityOrder = ['error', 'warning', 'info'];
              const severityDiff = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
              if (severityDiff !== 0) return severityDiff;
              return (a.line || 0) - (b.line || 0);
            });

            sortedFindings.forEach((finding, index) => {
              const severityIcon = finding.severity === 'error' ? '🚨' : 
                                 finding.severity === 'warning' ? '⚠️' : 'ℹ️';
              
              markdown += `${index + 1}. ${severityIcon} **${finding.message}**`;
              if (finding.line) {
                markdown += ` *(Line ${finding.line})*`;
              }
              markdown += `\n\n`;
            });
          }
          
          markdown += `---\n\n`;
        }
      } catch (error) {
        console.error(chalk.yellow(`⚠️  Could not fetch plugin findings: ${error}`));
      }

      markdown += `---\n\n`;
    }
  } else {
    markdown += `*No files were analyzed*\n\n`;
  }

  // Add final report
  markdown += `## 🎯 Overall Assessment\n\n`;
  markdown += `${state.final_report || '*No final report generated*'}\n\n`;

  // Add footer with enhanced information
  markdown += `---\n\n`;
  if (modelProvider !== 'Unknown' && modelName !== 'Unknown') {
    markdown += `*Report generated by [Hikmapr](https://github.com/foyzulkarim/hikma-pr) using **${modelProvider}** provider with **${modelName}** model*\n\n`;
    if (reviewRecord && reviewRecord.completedAt) {
      const completedAt = new Date(reviewRecord.completedAt);
      const elapsedMs = reviewRecord.startedAt ? completedAt.getTime() - new Date(reviewRecord.startedAt).getTime() : 0;
      const elapsedSeconds = Math.round(elapsedMs / 1000);
      markdown += `*Analysis completed in ${elapsedSeconds}s on ${completedAt.toLocaleString()}*\n`;
    } else if (analysisMetadata) {
      markdown += `*Analysis completed in ${Math.round((analysisMetadata.endTime.getTime() - analysisMetadata.startTime.getTime()) / 1000)}s on ${analysisMetadata.endTime.toLocaleString()}*\n`;
    }
  } else {
    markdown += `*Report generated by [Hikmapr](https://github.com/foyzulkarim/hikma-pr) on ${new Date(timestamp).toLocaleString()}*\n`;
  }

  return markdown;
};

/**
 * Saves the markdown report to a file
 */
const saveMarkdownReport = (markdown: string, prUrl: string, taskId: string): string => {
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(os.homedir(), '.hikmapr', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Generate filename based on repo and PR number with full timestamp
  const urlMatch = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  const owner = urlMatch ? urlMatch[1] : 'unknown';
  const repo = urlMatch ? urlMatch[2] : 'unknown';
  const prNumber = urlMatch ? urlMatch[3] : 'unknown';

  // Create a detailed timestamp: YYYY-MM-DD-HHMMSS
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
  const timestamp = `${date}-${time}`;

  const filename = `${owner}-${repo}-PR${prNumber}-${timestamp}-${taskId.slice(0, 8)}.md`;
  const filepath = path.join(reportsDir, filename);

  // Write the file
  fs.writeFileSync(filepath, markdown, 'utf8');

  return filepath;
};

import { PluginService } from '../services/pluginService';

export const reviewCommandHandler = async (input: { url: string, prisma: PrismaClient, provider: string, llmUrl: string, llmModel: string, pluginService: PluginService }) => {
  const taskId = uuidv4();
  const startTime = new Date(); // Track start time
  const { url: prUrl, prisma, provider, llmUrl, llmModel, pluginService } = input;
  console.log(chalk.bold.cyan(`
🚀 Starting Hikmapr Multi-Pass Analysis`));
  console.log(chalk.blue(`📝 Task ID: ${chalk.yellow(taskId)}`));
  console.log(chalk.blue(`🔗 PR URL: ${chalk.yellow(prUrl)}`));
  console.log(chalk.blue(`🔬 Using Advanced Multi-Pass Analysis Architecture`));
  console.log(chalk.gray(`⏰ Started at: ${startTime.toLocaleString()}`));

  // Extract model information from the DEFAULT_CONFIG
  const modelInfo = {
    provider: provider,
    providerUrl: llmUrl,
    modelName: llmModel
  };

  // Use the advanced multi-pass analysis workflow
  const { app, config: workflowConfig } = getAppWithConfig({
    modelInfo,
    pluginService, // Pass the pluginService here
  });


  console.log(chalk.gray(`🤖 Using ${chalk.yellow(modelInfo.provider)} providerURL ${chalk.yellow(modelInfo.providerUrl)} with ${chalk.yellow(modelInfo.modelName)} model`));

  const methodInfo = '🔬 Multi-Pass Analysis: 4 specialized passes per chunk with hierarchical synthesis';
  console.log(chalk.gray(methodInfo));
  console.log(chalk.gray(`📋 Smart filtering → Recursive chunking → 4-pass analysis → Synthesis`));
  console.log(chalk.gray(`🔧 Workflow configured with recursion limit: ${workflowConfig.recursionLimit}`));

  const streamConfig = {
    configurable: {
      thread_id: taskId,
    },
    // Apply the workflow configuration to handle large number of files
    ...workflowConfig,
  };

  // Initial state
  const initialState = {
    pr_url: prUrl,
    task_id: taskId,
  };

  console.log(chalk.blue(`💾 Saving initial state to database...`));
  // Save initial state to the database with model metadata
  await prisma.review.create({
    data: {
      id: taskId,
      prUrl: prUrl,
      state: initialState,
      modelProvider: modelInfo.providerUrl,
      modelName: modelInfo.modelName,
      startedAt: startTime,
    },
  });
  console.log(chalk.green(`✅ Initial state saved with model metadata`));

  let lastState: any = {};
  let currentSpinner: any = null;

  console.log(chalk.bold.magenta(`\n🔄 Starting workflow execution...\n`));

  try {
    for await (const event of await app.stream(initialState, streamConfig)) {
      // Fix: Access the state directly from the event
      const state = Object.values(event)[0] as any;

      // Properly merge both analyzed_files (CLI workflow) and file_results (advanced workflow)
      const currentAnalyzedFiles = lastState.analyzed_files || {};
      const newAnalyzedFiles = state.analyzed_files || {};
      const mergedAnalyzedFiles = { ...currentAnalyzedFiles, ...newAnalyzedFiles };

      const currentFileResults = lastState.file_results || {};
      const newFileResults = state.file_results || {};
      const mergedFileResults = { ...currentFileResults, ...newFileResults };

      // Preserve accumulated state by merging with lastState
      lastState = {
        ...lastState,
        ...state,
        analyzed_files: mergedAnalyzedFiles,
        file_results: mergedFileResults
      };

      // Handle both workflow types for progress tracking
      const analyzedFiles = state.analyzed_files || {};
      const fileResults = state.file_results || {};
      const filesToReview = state.files_to_review || [];
      const filesToProcess = state.files_to_process || [];

      // Save individual file analyses to database if new analyses are added
      // Handle CLI workflow analyzed_files (simple string analyses)
      if (state.analyzed_files && Object.keys(state.analyzed_files).length > 0) {
        for (const [fileName, analysis] of Object.entries(state.analyzed_files)) {
          // Check if this file analysis already exists to avoid duplicates
          const existingAnalysis = await prisma.fileAnalysis.findUnique({
            where: {
              reviewId_fileName: {
                reviewId: taskId,
                fileName: fileName
              }
            }
          });

          if (!existingAnalysis && typeof analysis === 'string') {
            console.log(chalk.gray(`💾 Saving CLI file analysis for: ${fileName}`));
            await prisma.fileAnalysis.create({
              data: {
                reviewId: taskId,
                fileName: fileName,
                analysis: analysis,
                diffSize: analysis.length, // Store the analysis length as a proxy for diff size
              }
            });
            console.log(chalk.green(`✅ CLI file analysis saved for: ${fileName}`));
          }
        }
      }

      // Handle advanced workflow file_results (structured FileAnalysisResult objects)
      if (state.file_results && Object.keys(state.file_results).length > 0) {
        for (const [fileName, result] of Object.entries(state.file_results)) {
          // Check if this file analysis already exists to avoid duplicates
          const existingAnalysis = await prisma.fileAnalysis.findUnique({
            where: {
              reviewId_fileName: {
                reviewId: taskId,
                fileName: fileName
              }
            }
          });

          if (!existingAnalysis && result && typeof result === 'object') {
            const fileResult = result as any;
            const analysisText = fileResult.file_synthesis || 'No synthesis available';
            console.log(chalk.gray(`💾 Saving advanced file analysis for: ${fileName}`));
            await prisma.fileAnalysis.create({
              data: {
                reviewId: taskId,
                fileName: fileName,
                analysis: analysisText,
                diffSize: analysisText.length,
              }
            });
            console.log(chalk.green(`✅ Advanced file analysis saved for: ${fileName}`));
          }
        }
      }

      // Update progress based on workflow state
      const totalAnalyzedFiles = Object.keys(analyzedFiles).length + Object.keys(fileResults).length;
      const totalFilesToProcess = filesToReview.length + filesToProcess.length;

      if (state.pr_details && !state.files_to_review && !state.filtered_files) {
        if (currentSpinner) currentSpinner.succeed();
        console.log(chalk.green(`\n✅ PR Details fetched successfully`));
        currentSpinner = ora('Getting changed files list...').start();
      } else if ((filesToReview.length > 0 || filesToProcess.length > 0) && totalAnalyzedFiles === 0) {
        if (currentSpinner) currentSpinner.succeed();
        const totalFiles = filesToReview.length || filesToProcess.length;
        console.log(chalk.green(`\n✅ Found ${totalFiles} files to analyze`));
        const filesList = filesToReview.length > 0 ? filesToReview : filesToProcess;
        console.log(chalk.blue(`📋 Files queue: ${filesList.join(', ')}`));

        // Show warning for large number of files
        if (totalFiles > 20) {
          console.log(chalk.yellow(`⚠️  Large number of files detected (${totalFiles}). This may take a while...`));
        }

        // Don't start spinner here - let the detailed logs show
      } else if (totalAnalyzedFiles > 0) {
        if (currentSpinner) currentSpinner.stop();
        const total = totalAnalyzedFiles + totalFilesToProcess;
        console.log(chalk.cyan(`\n📈 Progress: ${totalAnalyzedFiles}/${total} files analyzed`));

        if (totalFilesToProcess > 0) {
          console.log(chalk.blue(`🔄 Continuing with next file...`));
        } else {
          console.log(chalk.green(`🎯 All files analyzed, generating final report...`));
        }
      }

      console.log(chalk.gray(`💾 Updating database state...`));
      // Update state in DB with accumulated state to preserve all file analyses
      await prisma.review.update({
        where: { id: taskId },
        data: { state: lastState },
      });
    }
  } catch (error: any) {
    if (currentSpinner) currentSpinner.fail();

    // Handle recursion limit error specifically
    if (error.lc_error_code === 'GRAPH_RECURSION_LIMIT') {
      const analyzedFilesCount = Object.keys(lastState.analyzed_files || {}).length;
      const fileResultsCount = Object.keys(lastState.file_results || {}).length;
      const totalAnalyzed = analyzedFilesCount + fileResultsCount;

      console.error(chalk.red(`\n❌ Workflow hit recursion limit while processing files.`));
      console.error(chalk.yellow(`🔧 This usually happens with a large number of files (${totalAnalyzed} files processed so far).`));
      console.error(chalk.blue(`💡 Consider breaking down the PR into smaller commits or contact support.`));

      const analyzedFilesList = [
        ...Object.keys(lastState.analyzed_files || {}),
        ...Object.keys(lastState.file_results || {})
      ];
      const remainingFilesList = [
        ...(lastState.files_to_review || []),
        ...(lastState.files_to_process || [])
      ];

      console.error(chalk.gray(`📋 Files already analyzed: ${analyzedFilesList.join(', ')}`));
      console.error(chalk.gray(`📋 Files remaining: ${remainingFilesList.join(', ')}`));
    } else {
      console.error(chalk.red(`\n❌ Error during review process: ${error.message || error}`));
    }

    // Save the current state even on error
    try {
      await prisma.review.update({
        where: { id: taskId },
        data: {
          state: lastState,
          error: error.message || String(error)
        },
      });
    } catch (dbError) {
      console.error(chalk.red(`❌ Additional error saving state to database: ${dbError}`));
    }

    return; // Exit early on error
  }

  if (currentSpinner) currentSpinner.succeed();

  const endTime = new Date(); // Track end time
  const elapsedMs = endTime.getTime() - startTime.getTime();
  const elapsedSeconds = Math.round(elapsedMs / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;

  const elapsedFormatted = elapsedMinutes > 0
    ? `${elapsedMinutes}m ${remainingSeconds}s`
    : `${elapsedSeconds}s`;

  console.log(chalk.bold.green(`\n🎉 Analysis Complete!`));
  console.log(chalk.blue(`⏱️  Total time: ${chalk.yellow(elapsedFormatted)}`));
  console.log(chalk.blue(`🏁 Finished at: ${chalk.gray(endTime.toLocaleString())}`));
  console.log(chalk.blue(`📝 Task ID for future reference: ${chalk.yellow(taskId)}`));

  // Update database with completion time
  try {
    await prisma.review.update({
      where: { id: taskId },
      data: {
        state: lastState,
        completedAt: endTime
      },
    });
    console.log(chalk.gray(`💾 Final state and timing saved to database`));
  } catch (dbError) {
    console.log(chalk.yellow(`⚠️  Could not save completion time to database: ${dbError}`));
  }

  // Show file analysis database summary
  try {
    const fileAnalysisCount = await prisma.fileAnalysis.count({
      where: { reviewId: taskId }
    });
    console.log(chalk.blue(`💾 Individual file analyses saved to database: ${chalk.yellow(fileAnalysisCount)}`));
    console.log(chalk.gray(`💡 View file analyses: ${chalk.cyan(`hikma reports files ${taskId}`)}`));
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Could not verify file analysis count in database`));
  }

  // Generate and save markdown report with timing and model information
  console.log(chalk.blue(`\n📄 Generating markdown report...`));
  try {
    const analysisMetadata = {
      startTime,
      endTime,
      modelInfo
    };

    // Fetch the review record from database to get accurate timing
    let reviewRecord = null;
    try {
      reviewRecord = await prisma.review.findUnique({
        where: { id: taskId }
      });
    } catch (dbError) {
      console.log(chalk.yellow(`⚠️  Could not fetch review record for timing info`));
    }

    const markdown = await generateMarkdownReport(lastState, taskId, prUrl, prisma, analysisMetadata, reviewRecord);
    const reportPath = saveMarkdownReport(markdown, prUrl, taskId);
    console.log(chalk.green(`✅ Report saved to: ${chalk.yellow(reportPath)}`));
  } catch (error) {
    console.error(chalk.red(`❌ Error saving markdown report: ${error}`));
  }

  console.log(chalk.bold.magenta('\n' + '='.repeat(60)));
  console.log(chalk.bold.magenta('📊 HIKMAPR PR REVIEW REPORT'));
  console.log(chalk.bold.magenta('='.repeat(60)));
  console.log(lastState.final_report);
  console.log(chalk.bold.magenta('='.repeat(60)));
};
