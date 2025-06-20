/**
 * Handler for the 'resume' command.
 */
import { PrismaClient } from '@prisma/client';
import { app as sdkWorkflow } from '../graph/workflow';
import { appCli as cliWorkflow } from '../graph/workflow-cli';
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

  // Choose the appropriate workflow based on GitHub method
  const app = githubMethod === 'cli' ? cliWorkflow : sdkWorkflow;
  
  const methodInfo = githubMethod === 'cli' 
    ? 'Using GitHub CLI (gh)'
    : 'Using GitHub SDK (Octokit)';
  
  console.log(chalk.gray(`🔧 ${methodInfo} for resume operation`));

  const config = {
    configurable: {
      thread_id: taskId,
    },
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
