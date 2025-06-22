/**
 * Handler for the 'resume' command.
 */
import { PrismaClient } from '@prisma/client';
import { getAppWithConfig } from '../graph/workflow';
import { GitHubMethod } from '../index';
import ora from 'ora';
import chalk from 'chalk';

export const resumeCommandHandler = async (taskId: string, prisma: PrismaClient, githubMethod: GitHubMethod) => {
  const spinner = ora(`Resuming hikmapr Review [ID: ${taskId}]...`).start();
  
  const review = await prisma.review.findUnique({
    where: { id: taskId },
  });

  if (!review) {
    spinner.fail(chalk.red(`Error: No review found with ID ${taskId}`));
    process.exit(1);
  }

  // Use the advanced multi-pass analysis workflow  
  const { app, config: workflowConfig } = getAppWithConfig();
  
  console.log(chalk.gray(`🔬 Using Multi-Pass Analysis architecture for resume operation`));
  console.log(chalk.gray(`🔧 Workflow configured with recursion limit: ${workflowConfig.recursionLimit}`));

  const config = {
    configurable: {
      thread_id: taskId,
    },
    ...workflowConfig, // Apply the workflow configuration
  };

  const initialState = review.state as any;
  let lastState: any = {};

  for await (const event of await app.stream(null, config)) {
     const state = Object.values(event)[0] as any;
     lastState = state;
     
     // Ensure analyzed_files is always an object to prevent Object.keys errors
     const analyzedFiles = state.analyzed_files || {};
     const filesToReview = state.files_to_review || [];
     
     if(state.pr_details && !state.files_to_review) {
         spinner.succeed(chalk.green('Resumed: Fetched PR Details'));
         spinner.start('Getting changed file list...');
     } else if (filesToReview.length > 0 && Object.keys(analyzedFiles).length === 0) {
         spinner.succeed(chalk.green(`Resumed: Get Changed File List (${filesToReview.length} files found)`));
         spinner.start('Analyzing files...');
     } else if (Object.keys(analyzedFiles).length > 0) {
         spinner.text = `Analyzing files... (${Object.keys(analyzedFiles).length}/${filesToReview.length + Object.keys(analyzedFiles).length})`;
     }

     await prisma.review.update({
         where: { id: taskId },
         data: { state: state },
     });
  }
  
  spinner.succeed(chalk.green('Resumed analysis complete!'));
  
  console.log(chalk.bold.magenta('\n--- hikmapr PR Review Report ---'));
  console.log(lastState.final_report);
  console.log(chalk.bold.magenta('--- End of Report ---'));
};
