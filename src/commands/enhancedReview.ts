/**
 * Enhanced Review Command - Integrates the comprehensive analysis system
 */
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { ComprehensiveReviewWorkflow } from '../workflows/comprehensiveReviewWorkflow.js';
import { ComprehensiveReview } from '../types/analysis.js';
import { ENHANCED_SYSTEM_CONFIG } from '../config/enhancedConfig.js';

interface EnhancedReviewOptions {
  useComprehensiveAnalysis?: boolean;
  maxAnalysisTime?: number;
  enableIterativeRefinement?: boolean;
  qualityGatesEnabled?: boolean;
}

export async function enhancedReview(
  prUrl: string, 
  options: EnhancedReviewOptions = {}
): Promise<void> {
  const startTime = new Date();
  const taskId = uuidv4();
  const prisma = new PrismaClient();
  
  // Default to comprehensive analysis
  const useComprehensive = options.useComprehensiveAnalysis !== false;
  
  console.log(chalk.bold.blue('\n🚀 HIKMA-PR ENHANCED REVIEW SYSTEM'));
  console.log(chalk.blue('='.repeat(50)));
  console.log(chalk.blue(`📋 Task ID: ${chalk.yellow(taskId)}`));
  console.log(chalk.blue(`🔗 PR URL: ${chalk.cyan(prUrl)}`));
  console.log(chalk.blue(`🧠 Analysis Mode: ${chalk.green(useComprehensive ? 'Comprehensive' : 'Standard')}`));
  console.log(chalk.blue(`⏰ Started: ${chalk.gray(startTime.toLocaleString())}`));
  console.log(chalk.blue('='.repeat(50)));

  let currentSpinner: any = null;
  let comprehensiveReview: ComprehensiveReview | null = null;

  try {
    // Create database record
    currentSpinner = ora('Creating review record...').start();
    await prisma.review.create({
      data: {
        id: taskId,
        prUrl,
        startedAt: startTime,
        state: {
          phase: 'initialization',
          useComprehensive,
          options: {
            useComprehensiveAnalysis: options.useComprehensiveAnalysis,
            maxAnalysisTime: options.maxAnalysisTime,
            enableIterativeRefinement: options.enableIterativeRefinement,
            qualityGatesEnabled: options.qualityGatesEnabled
          }
        }
      }
    });
    currentSpinner.succeed('Review record created');

    if (useComprehensive) {
      // Use the new comprehensive analysis system
      comprehensiveReview = await runComprehensiveAnalysis(prUrl, taskId, prisma);
    } else {
      // Fall back to the original system
      console.log(chalk.yellow('⚠️ Falling back to standard analysis system'));
      // For now, we'll skip the fallback since we're testing the comprehensive system
      throw new Error('Standard analysis system not available in this test');
    }

    // Save comprehensive review results
    await saveComprehensiveResults(comprehensiveReview, taskId, prisma);

    // Generate and save reports
    await generateComprehensiveReports(comprehensiveReview, prUrl, taskId, startTime);

  } catch (error: any) {
    if (currentSpinner) currentSpinner.fail();
    
    console.error(chalk.red(`\n❌ Enhanced review failed: ${error.message}`));
    console.error(chalk.gray(`Stack trace: ${error.stack}`));
    
    // Save error state
    try {
      await prisma.review.update({
        where: { id: taskId },
        data: { 
          error: error.message,
          state: { phase: 'error', error: error.message }
        }
      });
    } catch (dbError) {
      console.error(chalk.red(`❌ Could not save error state: ${dbError}`));
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function runComprehensiveAnalysis(
  prUrl: string, 
  taskId: string, 
  prisma: PrismaClient
): Promise<ComprehensiveReview> {
  console.log(chalk.bold.green('\n🔬 COMPREHENSIVE ANALYSIS PIPELINE'));
  console.log(chalk.green('='.repeat(50)));

  const workflow = new ComprehensiveReviewWorkflow();
  
  // Extract PR number from URL
  const prNumber = extractPRNumber(prUrl);
  if (!prNumber) {
    throw new Error('Could not extract PR number from URL');
  }

  // Update database state
  await prisma.review.update({
    where: { id: taskId },
    data: { 
      state: { 
        phase: 'comprehensive-analysis',
        prNumber,
        startTime: new Date()
      }
    }
  });

  try {
    // Execute comprehensive review
    const comprehensiveReview = await workflow.executeReview(prUrl, prNumber);
    
    console.log(chalk.bold.green('\n✨ COMPREHENSIVE ANALYSIS COMPLETE'));
    console.log(chalk.green('='.repeat(50)));
    console.log(chalk.green(`📊 Executive Summary:`));
    console.log(chalk.white(`   Purpose: ${comprehensiveReview.executiveSummary.changePurpose}`));
    console.log(chalk.white(`   Impact: ${comprehensiveReview.executiveSummary.overallImpact.toUpperCase()}`));
    console.log(chalk.white(`   Recommendation: ${comprehensiveReview.executiveSummary.recommendation.toUpperCase()}`));
    console.log(chalk.green(`🔍 Analysis Results:`));
    console.log(chalk.white(`   Key Findings: ${comprehensiveReview.executiveSummary.keyFindings.length}`));
    console.log(chalk.white(`   Critical Issues: ${comprehensiveReview.executiveSummary.criticalIssues.length}`));
    console.log(chalk.white(`   Must Fix: ${comprehensiveReview.recommendations.mustFix.length}`));
    console.log(chalk.white(`   Should Fix: ${comprehensiveReview.recommendations.shouldFix.length}`));
    console.log(chalk.white(`   Consider: ${comprehensiveReview.recommendations.consider.length}`));
    console.log(chalk.green(`⚡ Performance:`));
    console.log(chalk.white(`   Analysis Time: ${Math.round(comprehensiveReview.metadata.analysisTime / 1000)}s`));
    console.log(chalk.white(`   Models Used: ${comprehensiveReview.metadata.modelsUsed.join(', ')}`));
    console.log(chalk.white(`   Iterations: ${comprehensiveReview.metadata.iterationsPerformed}`));
    console.log(chalk.white(`   Context Depth: ${(comprehensiveReview.metadata.contextDepth * 100).toFixed(1)}%`));
    console.log(chalk.green('='.repeat(50)));

    return comprehensiveReview;
    
  } catch (error) {
    console.error(chalk.red('❌ Comprehensive analysis failed:'), error);
    throw error;
  }
}

async function saveComprehensiveResults(
  review: ComprehensiveReview,
  taskId: string,
  prisma: PrismaClient
): Promise<void> {
  const spinner = ora('Saving comprehensive results to database...').start();
  
  try {
    // Update main review record
    await prisma.review.update({
      where: { id: taskId },
      data: {
        completedAt: new Date(),
        state: {
          phase: 'completed',
          comprehensiveReview: {
            executiveSummary: {
              changePurpose: review.executiveSummary.changePurpose,
              overallImpact: review.executiveSummary.overallImpact,
              keyFindings: review.executiveSummary.keyFindings,
              criticalIssues: review.executiveSummary.criticalIssues,
              recommendation: review.executiveSummary.recommendation
            },
            totalFindings: review.detailedAnalysis.architectural.findings.length +
                          review.detailedAnalysis.security.findings.length +
                          review.detailedAnalysis.performance.findings.length +
                          review.detailedAnalysis.testing.findings.length,
            totalRecommendations: review.recommendations.mustFix.length +
                                review.recommendations.shouldFix.length +
                                review.recommendations.consider.length,
            qualityScore: review.qualityAssurance.confidenceLevel,
            metadata: {
              analysisTime: review.metadata.analysisTime,
              modelsUsed: review.metadata.modelsUsed,
              iterationsPerformed: review.metadata.iterationsPerformed,
              contextDepth: review.metadata.contextDepth
            }
          }
        }
      }
    });

    // Save detailed findings - DISABLED: Tables removed in schema cleanup
    // const allFindings = [
    //   ...review.detailedAnalysis.architectural.findings,
    //   ...review.detailedAnalysis.security.findings,
    //   ...review.detailedAnalysis.performance.findings,
    //   ...review.detailedAnalysis.testing.findings
    // ];

    // for (const finding of allFindings) {
    //   await prisma.finding.create({
    //     data: {
    //       id: finding.id,
    //       reviewId: taskId,
    //       type: finding.type,
    //       severity: finding.severity,
    //       message: finding.message,
    //       file: finding.file,
    //       lineNumber: finding.lineNumber,
    //       evidence: finding.evidence
    //     }
    //   });
    // }

    // Save recommendations - DISABLED: Tables removed in schema cleanup
    // const allRecommendations = [
    //   ...review.recommendations.mustFix,
    //   ...review.recommendations.shouldFix,
    //   ...review.recommendations.consider
    // ];

    // for (const rec of allRecommendations) {
    //   await prisma.recommendation.create({
    //     data: {
    //       id: rec.id,
    //       reviewId: taskId,
    //       priority: rec.priority,
    //       category: rec.category,
    //       description: rec.description,
    //       rationale: rec.rationale,
    //       implementation: rec.implementation,
    //       effort: rec.effort
    //     }
    //   });
    // }

    spinner.succeed('Comprehensive results saved to database');
    
  } catch (error) {
    spinner.fail('Failed to save comprehensive results');
    console.error(chalk.red('Database save error:'), error);
    throw error;
  }
}

async function generateComprehensiveReports(
  review: ComprehensiveReview,
  prUrl: string,
  taskId: string,
  startTime: Date
): Promise<void> {
  console.log(chalk.blue('\n📄 Generating comprehensive reports...'));

  try {
    // Generate markdown report (like your original system)
    const markdown = generateComprehensiveMarkdown(review, prUrl, taskId, startTime);
    const reportPath = saveMarkdownReport(markdown, prUrl, taskId);
    
    // Generate JSON report for programmatic access
    const jsonPath = saveJsonReport(review, prUrl, taskId);
    
    // Generate executive summary
    const summaryPath = saveExecutiveSummary(review, prUrl, taskId);

    console.log(chalk.green('✅ Reports generated successfully:'));
    console.log(chalk.blue(`📝 Markdown Report: ${chalk.cyan(path.relative(process.cwd(), reportPath))}`));
    console.log(chalk.blue(`📊 JSON Report: ${chalk.cyan(path.relative(process.cwd(), jsonPath))}`));
    console.log(chalk.blue(`📋 Executive Summary: ${chalk.cyan(path.relative(process.cwd(), summaryPath))}`));
    
    // Show commands to view reports (like your original system)
    console.log(chalk.blue(`\n📖 View your reports:`));
    console.log(chalk.cyan(`   cat "${path.relative(process.cwd(), reportPath)}"`));
    console.log(chalk.cyan(`   code "${path.relative(process.cwd(), reportPath)}"`));
    
    // Display executive summary in console
    displayExecutiveSummary(review);
    
  } catch (error) {
    console.error(chalk.red('❌ Error generating reports:'), error);
    throw error;
  }
}

function generateComprehensiveMarkdown(
  review: ComprehensiveReview,
  prUrl: string,
  taskId: string,
  startTime: Date
): string {
  const endTime = new Date();
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
  
  const urlMatch = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  const owner = urlMatch ? urlMatch[1] : 'unknown';
  const repo = urlMatch ? urlMatch[2] : 'unknown';
  const prNumber = urlMatch ? urlMatch[3] : 'unknown';

  return `# 🔍 Comprehensive PR Review Report

## 📋 Review Information
- **Repository**: ${owner}/${repo}
- **PR Number**: #${prNumber}
- **Review ID**: ${taskId}
- **Analysis Time**: ${duration}s
- **Generated**: ${endTime.toISOString()}
- **Models Used**: ${review.metadata.modelsUsed.join(', ')}
- **Iterations**: ${review.metadata.iterationsPerformed}

## 🎯 Executive Summary

### Change Purpose
${review.executiveSummary.changePurpose}

### Overall Impact: ${review.executiveSummary.overallImpact.toUpperCase()}

### Recommendation: ${review.executiveSummary.recommendation.toUpperCase()}

### Key Findings
${review.executiveSummary.keyFindings.map(finding => `- ${finding}`).join('\n')}

${review.executiveSummary.criticalIssues.length > 0 ? `
### 🚨 Critical Issues
${review.executiveSummary.criticalIssues.map(issue => `- ⚠️ ${issue}`).join('\n')}
` : ''}

## 📊 Detailed Analysis

### 🏗️ Architectural Analysis
${formatAnalysisSection(review.detailedAnalysis.architectural)}

### 🔒 Security Analysis
${formatAnalysisSection(review.detailedAnalysis.security)}

### ⚡ Performance Analysis
${formatAnalysisSection(review.detailedAnalysis.performance)}

### 🧪 Testing Analysis
${formatAnalysisSection(review.detailedAnalysis.testing)}

## 💡 Recommendations

### 🚨 Must Fix (${review.recommendations.mustFix.length})
${review.recommendations.mustFix.map(rec => formatRecommendation(rec)).join('\n\n')}

### ⚠️ Should Fix (${review.recommendations.shouldFix.length})
${review.recommendations.shouldFix.map(rec => formatRecommendation(rec)).join('\n\n')}

### 💭 Consider (${review.recommendations.consider.length})
${review.recommendations.consider.map(rec => formatRecommendation(rec)).join('\n\n')}

## 📈 Quality Assurance

- **Confidence Level**: ${(review.qualityAssurance.confidenceLevel * 100).toFixed(1)}%
- **Review Completeness**: ${(review.qualityAssurance.reviewCompleteness * 100).toFixed(1)}%
- **Validation Scores**:
  - Completeness: ${(review.qualityAssurance.validationResults.completeness.score * 100).toFixed(1)}%
  - Consistency: ${(review.qualityAssurance.validationResults.consistency.score * 100).toFixed(1)}%
  - Actionability: ${(review.qualityAssurance.validationResults.actionability.score * 100).toFixed(1)}%
  - Evidence-Based: ${(review.qualityAssurance.validationResults.evidenceBased.score * 100).toFixed(1)}%

## 🔧 Technical Details

- **Context Depth**: ${(review.metadata.contextDepth * 100).toFixed(1)}%
- **Analysis Duration**: ${Math.round(review.metadata.analysisTime / 1000)}s
- **Iterative Refinement**: ${review.metadata.iterationsPerformed} iterations

---
*Generated by HIKMA-PR Enhanced Review System*
`;
}

function formatAnalysisSection(analysis: any): string {
  if (!analysis.findings || analysis.findings.length === 0) {
    return 'No significant issues found.';
  }
  
  return analysis.findings.map((finding: any) => 
    `- **${finding.severity.toUpperCase()}**: ${finding.message} (${finding.file})`
  ).join('\n');
}

function formatRecommendation(rec: any): string {
  return `#### ${rec.description}
**Category**: ${rec.category}  
**Effort**: ${rec.effort}  
**Rationale**: ${rec.rationale}  
**Implementation**: ${rec.implementation}`;
}

function saveMarkdownReport(markdown: string, prUrl: string, taskId: string): string {
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(os.homedir(), '.hikmapr', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Generate filename based on repo and PR number with full timestamp (like your original)
  const urlMatch = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  const owner = urlMatch ? urlMatch[1] : 'unknown';
  const repo = urlMatch ? urlMatch[2] : 'unknown';
  const prNumber = urlMatch ? urlMatch[3] : 'unknown';
  
  // Create a detailed timestamp: YYYY-MM-DD-HHMMSS (matching your format)
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
  const timestamp = `${date}-${time}`;
  
  const filename = `ENHANCED-${owner}-${repo}-PR${prNumber}-${timestamp}-${taskId.slice(0, 8)}.md`;
  const filepath = path.join(reportsDir, filename);
  
  // Write the file
  fs.writeFileSync(filepath, markdown, 'utf8');
  
  return filepath;
}

function saveJsonReport(review: ComprehensiveReview, prUrl: string, taskId: string): string {
  const urlMatch = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  const repo = urlMatch ? `${urlMatch[1]}-${urlMatch[2]}` : 'unknown-repo';
  const prNumber = urlMatch ? urlMatch[3] : 'unknown';
  
  const filename = `hikma-pr-${repo}-${prNumber}-${taskId.slice(0, 8)}.json`;
  const reportPath = path.join(os.homedir(), '.hikmapr', 'reports', filename);
  
  fs.writeFileSync(reportPath, JSON.stringify(review, null, 2), 'utf8');
  return reportPath;
}

function saveExecutiveSummary(review: ComprehensiveReview, prUrl: string, taskId: string): string {
  const urlMatch = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  const repo = urlMatch ? `${urlMatch[1]}-${urlMatch[2]}` : 'unknown-repo';
  const prNumber = urlMatch ? urlMatch[3] : 'unknown';
  
  const summary = `# Executive Summary - PR #${prNumber}

## Recommendation: ${review.executiveSummary.recommendation.toUpperCase()}

## Key Points:
${review.executiveSummary.keyFindings.map(finding => `• ${finding}`).join('\n')}

## Action Items:
• Must Fix: ${review.recommendations.mustFix.length} items
• Should Fix: ${review.recommendations.shouldFix.length} items
• Consider: ${review.recommendations.consider.length} items

## Quality Score: ${(review.qualityAssurance.confidenceLevel * 100).toFixed(1)}%
`;
  
  const filename = `hikma-pr-summary-${repo}-${prNumber}-${taskId.slice(0, 8)}.md`;
  const reportPath = path.join(os.homedir(), '.hikmapr', 'reports', filename);
  
  fs.writeFileSync(reportPath, summary, 'utf8');
  return reportPath;
}

function displayExecutiveSummary(review: ComprehensiveReview): void {
  console.log(chalk.bold.magenta('\n' + '='.repeat(60)));
  console.log(chalk.bold.magenta('📊 COMPREHENSIVE PR REVIEW SUMMARY'));
  console.log(chalk.bold.magenta('='.repeat(60)));
  
  console.log(chalk.bold.white(`\n🎯 RECOMMENDATION: ${review.executiveSummary.recommendation.toUpperCase()}`));
  console.log(chalk.white(`📝 Purpose: ${review.executiveSummary.changePurpose}`));
  console.log(chalk.white(`📊 Impact: ${review.executiveSummary.overallImpact.toUpperCase()}`));
  
  if (review.executiveSummary.keyFindings.length > 0) {
    console.log(chalk.bold.yellow('\n🔍 KEY FINDINGS:'));
    review.executiveSummary.keyFindings.forEach(finding => {
      console.log(chalk.yellow(`  • ${finding}`));
    });
  }
  
  if (review.executiveSummary.criticalIssues.length > 0) {
    console.log(chalk.bold.red('\n🚨 CRITICAL ISSUES:'));
    review.executiveSummary.criticalIssues.forEach(issue => {
      console.log(chalk.red(`  ⚠️ ${issue}`));
    });
  }
  
  console.log(chalk.bold.blue('\n💡 ACTION ITEMS:'));
  console.log(chalk.red(`  🚨 Must Fix: ${review.recommendations.mustFix.length}`));
  console.log(chalk.yellow(`  ⚠️ Should Fix: ${review.recommendations.shouldFix.length}`));
  console.log(chalk.blue(`  💭 Consider: ${review.recommendations.consider.length}`));
  
  console.log(chalk.bold.green(`\n📈 QUALITY SCORE: ${(review.qualityAssurance.confidenceLevel * 100).toFixed(1)}%`));
  
  console.log(chalk.bold.magenta('='.repeat(60)));
}

function extractPRNumber(prUrl: string): number | null {
  const match = prUrl.match(/\/pull\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Export the enhanced review function
export { enhancedReview as review };
