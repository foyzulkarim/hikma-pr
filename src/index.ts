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
import { PrismaClient } from '@prisma/client';

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
  .description('Start a new review for a given Pull Request URL.')
  .argument('<url>', 'The full URL of the GitHub Pull Request to review.')
  .action(async (url) => {
    try {
      await reviewCommandHandler(url, prisma);
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
      await resumeCommandHandler(id, prisma);
    } catch (error) {
      console.error('Error during resume process:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
