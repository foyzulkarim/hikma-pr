/**
 * Handler for the 'review' command.
 */
import { PrismaClient } from '@prisma/client';
import { app } from '../graph/workflow';
import { v4 as uuidv4 } from 'uuid';
import ora from 'ora';
import chalk from 'chalk';

export const reviewCommandHandler = async (prUrl: string, prisma: PrismaClient) => {
  const taskId = uuidv4();
  console.log(chalk.bold.cyan(`\n🚀 Starting hikmapr Review`));
  console.log(chalk.blue(`📝 Task ID: ${chalk.yellow(taskId)}`));
  console.log(chalk.blue(`🔗 PR URL: ${chalk.yellow(prUrl)}`));

  const config = {
    configurable: {
      thread_id: taskId,
    },
  };

  // Initial state
  const initialState = {
    pr_url: prUrl,
    task_id: taskId,
  };

  console.log(chalk.blue(`💾 Saving initial state to database...`));
  // Save initial state to the database
  await prisma.review.create({
    data: {
      id: taskId,
      prUrl: prUrl,
      state: initialState,
    },
  });
  console.log(chalk.green(`✅ Initial state saved`));

  let lastState: any = {};
  let currentSpinner: any = null;
  
  console.log(chalk.bold.magenta(`\n🔄 Starting workflow execution...\n`));
  
  for await (const event of await app.stream(initialState, config)) {
    // Fix: Access the state directly from the event
    const state = Object.values(event)[0] as any;
    lastState = state;
    
    // Ensure analyzed_files is always an object to prevent Object.keys errors
    const analyzedFiles = state.analyzed_files || {};
    const filesToReview = state.files_to_review || [];
    
    // Update progress based on workflow state
    if(state.pr_details && !state.files_to_review) {
        if (currentSpinner) currentSpinner.succeed();
        console.log(chalk.green(`\n✅ PR Details fetched successfully`));
        currentSpinner = ora('Getting changed files list...').start();
    } else if (filesToReview.length > 0 && Object.keys(analyzedFiles).length === 0) {
        if (currentSpinner) currentSpinner.succeed();
        console.log(chalk.green(`\n✅ Found ${filesToReview.length} files to analyze`));
        console.log(chalk.blue(`📋 Files queue: ${filesToReview.join(', ')}`));
        // Don't start spinner here - let the detailed logs show
    } else if (Object.keys(analyzedFiles).length > 0) {
        if (currentSpinner) currentSpinner.stop();
        const completed = Object.keys(analyzedFiles).length;
        const total = completed + filesToReview.length;
        console.log(chalk.cyan(`\n📈 Progress: ${completed}/${total} files analyzed`));
        
        if (filesToReview.length > 0) {
          console.log(chalk.blue(`🔄 Continuing with next file...`));
        } else {
          console.log(chalk.green(`🎯 All files analyzed, generating final report...`));
        }
    }

    console.log(chalk.gray(`💾 Updating database state...`));
    // Update state in DB
    await prisma.review.update({
      where: { id: taskId },
      data: { state: state },
    });
  }

  if (currentSpinner) currentSpinner.succeed();
  
  console.log(chalk.bold.green(`\n🎉 Analysis Complete!`));
  console.log(chalk.blue(`⏱️  Task ID for future reference: ${chalk.yellow(taskId)}`));
  
  console.log(chalk.bold.magenta('\n' + '='.repeat(60)));
  console.log(chalk.bold.magenta('📊 HIKMAPR PR REVIEW REPORT'));
  console.log(chalk.bold.magenta('='.repeat(60)));
  console.log(lastState.final_report);
  console.log(chalk.bold.magenta('='.repeat(60)));
};
