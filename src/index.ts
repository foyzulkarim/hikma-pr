#!/usr/bin/env node

/**
 * hikmapr PR Agent
 * * This is the main entry point for the CLI application.
 * It uses 'commander.js' to parse command-line arguments and
 * delegate tasks to the appropriate command handlers.
 */

import { Command } from 'commander';
import { reviewCommandHandler } from './commands/review';
import { resumeCommandHandler } from './commands/resume';
import { listReportsHandler, viewReportHandler, viewFileAnalysesHandler, cleanReportsHandler } from './commands/reports';
import { PrismaClient } from '@prisma/client';

// Configuration for GitHub interaction method
export type GitHubMethod = 'sdk' | 'cli';

// CONFIGURATION: Change this to choose your preferred GitHub interaction method
// 'sdk' = Uses GitHub SDK (Octokit) - requires GITHUB_TOKEN, subject to rate limits
// 'cli' = Uses GitHub CLI (gh) - requires 'gh' to be installed and authenticated
const GITHUB_METHOD: GitHubMethod = 'cli'; // 👈 Change this to 'sdk' or 'cli' as needed

const program = new Command();
const prisma = new PrismaClient();

// Ensure the database connection is closed gracefully
process.on('exit', () => {
  prisma.$disconnect();
});

program
  .name('hikmapr')
  .description('A stateful, resilient, and powerful CLI agent for reviewing Pull Requests.')
  .version('0.1.0');

program
  .command('review')
  .description('Start a new multi-pass PR review analysis.')
  .argument('<url>', 'The full URL of the GitHub Pull Request to review.')
  .action(async (url) => {
    try {
      await reviewCommandHandler(url, prisma, GITHUB_METHOD);
    } catch (error) {
      console.error('Error during review process:', error);
      process.exit(1);
    }
  });

program
  .command('resume')
  .description('Resume an interrupted review from the last checkpoint.')
  .argument('<id>', 'The unique ID of the review to resume.')
  .action(async (id) => {
    try {
      await resumeCommandHandler(id, prisma, GITHUB_METHOD);
    } catch (error) {
      console.error('Error during resume process:', error);
      process.exit(1);
    }
  });

// Reports command with subcommands
const reportsCmd = program
  .command('reports')
  .description('Manage saved PR review reports');

reportsCmd
  .command('list')
  .description('List all saved reports')
  .action(async () => {
    try {
      await listReportsHandler();
    } catch (error) {
      console.error('Error listing reports:', error);
      process.exit(1);
    }
  });

reportsCmd
  .command('view')
  .description('View a specific report by number or filename')
  .argument('<identifier>', 'Report number (1, 2, 3...) or filename')
  .action(async (identifier) => {
    try {
      await viewReportHandler(identifier);
    } catch (error) {
      console.error('Error viewing report:', error);
      process.exit(1);
    }
  });

reportsCmd
  .command('files')
  .description('View individual file analyses for a specific review')
  .argument('<taskId>', 'Review task ID')
  .action(async (taskId) => {
    try {
      await viewFileAnalysesHandler(taskId);
    } catch (error) {
      console.error('Error viewing file analyses:', error);
      process.exit(1);
    }
  });

reportsCmd
  .command('clean')
  .description('Clean up old reports')
  .option('-d, --days <days>', 'Delete reports older than N days', '30')
  .action(async (options) => {
    try {
      const days = parseInt(options.days, 10);
      await cleanReportsHandler(days);
    } catch (error) {
      console.error('Error cleaning reports:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
