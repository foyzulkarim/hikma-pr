/**
 * Handler for the 'reports' command - manages saved markdown reports
 */
import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Lists all saved markdown reports
 */
export const listReportsHandler = async () => {
  const reportsDir = path.join(os.homedir(), '.hikmapr', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.log(chalk.yellow(`📄 No reports directory found. Reports will be saved to: ${reportsDir}`));
    return;
  }
  
  const files = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => {
      const statA = fs.statSync(path.join(reportsDir, a));
      const statB = fs.statSync(path.join(reportsDir, b));
      return statB.mtime.getTime() - statA.mtime.getTime(); // Most recent first
    });
  
  if (files.length === 0) {
    console.log(chalk.yellow(`📄 No saved reports found in: ${reportsDir}`));
    return;
  }
  
  console.log(chalk.bold.cyan(`\n📄 Saved PR Review Reports (${files.length})`));
  console.log(chalk.bold.cyan('='.repeat(50)));
  
  files.forEach((file, index) => {
    const filepath = path.join(reportsDir, file);
    const stats = fs.statSync(filepath);
    const size = (stats.size / 1024).toFixed(1);
    const date = stats.mtime.toLocaleDateString();
    const time = stats.mtime.toLocaleTimeString();
    
    // Parse filename to extract info
    const match = file.match(/^(.+)-(.+)-PR(\d+)-(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (match) {
      const [, owner, repo, prNumber, reportDate, taskId] = match;
      console.log(chalk.blue(`\n${index + 1}. ${chalk.yellow(`${owner}/${repo}`)} - PR #${prNumber}`));
      console.log(chalk.gray(`   📅 ${date} ${time} | 📏 ${size}KB | 🔑 ${taskId}`));
      console.log(chalk.gray(`   📁 ${file}`));
    } else {
      console.log(chalk.blue(`\n${index + 1}. ${chalk.yellow(file)}`));
      console.log(chalk.gray(`   📅 ${date} ${time} | 📏 ${size}KB`));
    }
  });
  
  console.log(chalk.bold.cyan('\n' + '='.repeat(50)));
  console.log(chalk.blue(`💡 To view a report: ${chalk.cyan('hikma reports view <number>')}`));
  console.log(chalk.blue(`💡 To view by filename: ${chalk.cyan('hikma reports view <filename>')}`));
  console.log(chalk.blue(`💡 To view file analyses: ${chalk.cyan('hikma reports files <taskId>')}`));
  console.log(chalk.blue(`💡 To open in editor: ${chalk.cyan('code reports/<filename>')}`));
};

/**
 * Views a specific report by index or filename
 */
export const viewReportHandler = async (identifier: string) => {
  const reportsDir = path.join(os.homedir(), '.hikmapr', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.log(chalk.red(`❌ No reports directory found: ${reportsDir}`));
    return;
  }
  
  let targetFile: string | null = null;
  
  // Check if identifier is a number (index)
  if (/^\d+$/.test(identifier)) {
    const index = parseInt(identifier, 10) - 1; // Convert to 0-based index
    const files = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.md'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(reportsDir, a));
        const statB = fs.statSync(path.join(reportsDir, b));
        return statB.mtime.getTime() - statA.mtime.getTime(); // Most recent first
      });
    
    if (index >= 0 && index < files.length) {
      targetFile = files[index];
    } else {
      console.log(chalk.red(`❌ Invalid report number. Available reports: 1-${files.length}`));
      return;
    }
  } else {
    // Check if it's a filename
    const filename = identifier.endsWith('.md') ? identifier : `${identifier}.md`;
    const filepath = path.join(reportsDir, filename);
    
    if (fs.existsSync(filepath)) {
      targetFile = filename;
    } else {
      console.log(chalk.red(`❌ Report not found: ${filename}`));
      console.log(chalk.blue(`💡 Run ${chalk.cyan('hikma reports list')} to see available reports`));
      return;
    }
  }
  
  if (!targetFile) {
    console.log(chalk.red(`❌ Could not find report: ${identifier}`));
    return;
  }
  
  // Read and display the report
  const filepath = path.join(reportsDir, targetFile);
  const content = fs.readFileSync(filepath, 'utf8');
  
  console.log(chalk.bold.cyan(`\n📄 Viewing Report: ${targetFile}`));
  console.log(chalk.bold.cyan('='.repeat(80)));
  console.log(content);
  console.log(chalk.bold.cyan('='.repeat(80)));
  
  const relativePath = path.relative(process.cwd(), filepath);
  console.log(chalk.blue(`\n💡 Report location: ${chalk.yellow(relativePath)}`));
  console.log(chalk.blue(`💡 Open in editor: ${chalk.cyan(`code "${relativePath}"`)}`));
};

/**
 * Views individual file analyses for a specific review
 */
export const viewFileAnalysesHandler = async (taskId: string) => {
  const prisma = new PrismaClient();
  
  try {
    // Get the review and its file analyses
    const review = await prisma.review.findUnique({
      where: { id: taskId },
      include: {
        fileAnalyses: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!review) {
      console.log(chalk.red(`❌ Review not found with ID: ${taskId}`));
      return;
    }
    
    console.log(chalk.bold.cyan(`\n📁 File Analyses for Review: ${taskId}`));
    console.log(chalk.bold.cyan('='.repeat(60)));
    console.log(chalk.blue(`🔗 PR URL: ${review.prUrl}`));
    console.log(chalk.blue(`📅 Created: ${review.createdAt.toLocaleString()}`));
    console.log(chalk.blue(`📊 Total Files Analyzed: ${review.fileAnalyses.length}`));
    
    if (review.fileAnalyses.length === 0) {
      console.log(chalk.yellow(`\n⚠️  No individual file analyses found for this review.`));
      console.log(chalk.gray(`This could mean the review was created before file analysis saving was implemented.`));
    } else {
      console.log(chalk.bold.cyan(`\n📋 Individual File Analyses:`));
      
      review.fileAnalyses.forEach((fileAnalysis, index) => {
        console.log(chalk.bold.green(`\n${index + 1}. 📁 ${fileAnalysis.fileName}`));
        console.log(chalk.gray(`   📏 Analysis Size: ${fileAnalysis.analysis.length} characters`));
        console.log(chalk.gray(`   📅 Analyzed: ${fileAnalysis.createdAt.toLocaleString()}`));
        console.log(chalk.cyan(`\n${fileAnalysis.analysis}`));
        console.log(chalk.gray('─'.repeat(80)));
      });
    }
    
    console.log(chalk.bold.cyan('='.repeat(60)));
    console.log(chalk.blue(`💡 To view the full report: ${chalk.cyan(`hikma reports view ${taskId}`)}`));
    
  } catch (error) {
    console.error(chalk.red(`❌ Error retrieving file analyses: ${error}`));
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Cleans up old reports (optional utility)
 */
export const cleanReportsHandler = async (daysOld: number = 30) => {
  const reportsDir = path.join(os.homedir(), '.hikmapr', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.log(chalk.yellow(`📄 No reports directory found.`));
    return;
  }
  
  const files = fs.readdirSync(reportsDir).filter(file => file.endsWith('.md'));
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  let deletedCount = 0;
  
  files.forEach(file => {
    const filepath = path.join(reportsDir, file);
    const stats = fs.statSync(filepath);
    
    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filepath);
      deletedCount++;
      console.log(chalk.gray(`🗑️  Deleted: ${file}`));
    }
  });
  
  if (deletedCount > 0) {
    console.log(chalk.green(`\n✅ Cleaned up ${deletedCount} old reports (older than ${daysOld} days)`));
  } else {
    console.log(chalk.blue(`\n📄 No reports older than ${daysOld} days found.`));
  }
}; 
