#!/usr/bin/env node

/**
 * hikmapr PR Agent
 * * This is the main entry point for the CLI application.
 * It uses 'commander.js' to parse command-line arguments and
 * delegate tasks to the appropriate command handlers.
 */

import { Command } from 'commander';
import { addConfigOptions } from './config/configLoader';
import { reviewCommandHandler } from './commands/review';
import { resumeCommandHandler } from './commands/resume';
import { listReportsHandler, viewReportHandler, viewFileAnalysesHandler, cleanReportsHandler } from './commands/reports';
import { startUIServer, buildUI } from './commands/ui';
import { setupDatabaseConfig, ensureDatabaseSetup } from './config/databaseConfig';
import { PrismaClient } from '@prisma/client';
import { PluginService } from './services/pluginService';
import * as path from 'path';

// Setup database configuration before initializing Prisma
setupDatabaseConfig();

// Initialize and load plugins
const pluginService = new PluginService(path.join(__dirname, 'plugins'));
pluginService.loadPlugins();

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

const reviewCommand = program
  .command('review')
  .description('Start a new multi-pass PR review analysis.')
  .requiredOption('-u, --url <url>', 'The full URL of the GitHub Pull Request to review.')
  .requiredOption('-p, --provider <provider>', 'The provider of the LLM model. (ollama, lmstudio, vllm)')
  .requiredOption('-s, --server <server>', 'The URL of the LLM server.')
  .requiredOption('-m, --model <model>', 'The name of the LLM model to use.');

// Add common configuration options
addConfigOptions(reviewCommand)
  .action(async (options: { url: string; provider: string; server: string; model: string }) => {
    try {
      // Ensure database is set up before proceeding
      await ensureDatabaseSetup();
      
      const { url, provider, server, model } = options;
      const input = { url, prisma, provider, llmUrl: server, llmModel: model, pluginService };
      await reviewCommandHandler(input);
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
      // Ensure database is set up before proceeding
      await ensureDatabaseSetup();
      
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
      await ensureDatabaseSetup();
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
      await ensureDatabaseSetup();
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
      await ensureDatabaseSetup();
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
      await ensureDatabaseSetup();
      const days = parseInt(options.days, 10);
      await cleanReportsHandler(days);
    } catch (error) {
      console.error('Error cleaning reports:', error);
      process.exit(1);
    }
  });

// UI Commands
const uiCmd = program
  .command('ui')
  .description('Web interface commands')
  .option('-p, --port <port>', 'Port to run the server on (when used without subcommand)', '3000')
  .option('--no-open', 'Don\'t automatically open browser (when used without subcommand)')
  .action(async (options) => {
    // If no subcommand is provided, default to 'start'
    try {
      await ensureDatabaseSetup();
      const port = parseInt(options.port, 10);
      await startUIServer({ port, open: options.open });
    } catch (error) {
      console.error('Error starting UI server:', error);
      process.exit(1);
    }
  });

uiCmd
  .command('start')
  .description('Start the web UI server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('--no-open', 'Don\'t automatically open browser')
  .action(async (options) => {
    try {
      await ensureDatabaseSetup();
      const port = parseInt(options.port, 10);
      await startUIServer({ port, open: options.open });
    } catch (error) {
      console.error('Error starting UI server:', error);
      process.exit(1);
    }
  });

uiCmd
  .command('build')
  .description('Build the web UI for production')
  .action(async () => {
    try {
      await buildUI();
    } catch (error) {
      console.error('Error building UI:', error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize Hikma PR (setup database and generate Prisma client)')
  .action(async () => {
    try {
      console.log('🔧 Initializing Hikma PR...');
      await ensureDatabaseSetup();
      console.log('✅ Hikma PR initialized successfully!');
      console.log('🎉 You can now run: hikma-pr review --help');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
