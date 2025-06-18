/**
 * LLM Service
 *
 * This service handles all communication with the local Ollama LLM.
 */
import { Ollama } from 'ollama-node';
import { Octokit } from 'octokit';
import { getFileDiff } from './githubService';
import chalk from 'chalk';

/**
 * Analyzes a single file's diff and returns a summary.
 */
export const analyzeFile = async (ollama: Ollama, octokit: Octokit, prUrl: string, filePath: string): Promise<string> => {
  console.log(chalk.blue(`\n🔍 Starting analysis of: ${chalk.yellow(filePath)}`));
  
  const diff = await getFileDiff(octokit, prUrl, filePath);
  if (!diff) {
    console.log(chalk.red(`❌ Could not retrieve diff for ${filePath}`));
    return "Could not retrieve diff for this file.";
  }

  console.log(chalk.green(`✅ Retrieved diff for ${filePath} (${diff.length} characters)`));

  const prompt = `
    Review the following code changes for the file "${filePath}". 
    Please provide a concise summary of the changes and point out any potential issues, 
    style violations, or areas for improvement.

    File Diff:
    \`\`\`diff
    ${diff}
    \`\`\`
  `;

  try {
    console.log(chalk.blue(`🤖 Setting model to llama3.2:1b...`));
    await ollama.setModel("llama3.2:1b");
    
    console.log(chalk.blue(`📤 Sending prompt to Ollama (${prompt.length} characters):`));
    console.log(chalk.gray(`"${prompt.substring(0, 200)}..."`));
    
    const startTime = Date.now();
    console.log(chalk.blue(`⏳ Generating analysis...`));
    
    const response = await ollama.generate(prompt);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(chalk.green(`✅ Analysis completed in ${duration}s`));
    console.log(chalk.blue(`📥 Response received (${response.output.length} characters):`));
    console.log(chalk.gray(`"${response.output.substring(0, 300)}..."`));
    
    return response.output;
  } catch (error) {
    console.error(chalk.red(`❌ Error generating analysis for ${filePath}:`), error);
    throw error; // Re-throw to be handled by the workflow
  }
};

/**
 * Synthesizes a final, high-level report from all individual file analyses.
 */
export const synthesizeReport = async (ollama: Ollama, state: any): Promise<string> => {
  console.log(chalk.magenta(`\n📊 Starting report synthesis...`));
  
  const analyses = Object.entries(state.analyzed_files)
    .map(([file, analysis]) => `### Analysis for ${file}\n${analysis}`)
    .join('\n\n');

  console.log(chalk.blue(`📝 Combining analyses from ${Object.keys(state.analyzed_files).length} files`));
  console.log(chalk.blue(`📋 PR Title: "${state.pr_details.title}"`));
  console.log(chalk.blue(`📄 PR Body: "${(state.pr_details.body || 'No description').substring(0, 100)}..."`));

  const prompt = `
    You are hikmapr, a PR review agent. You have analyzed several files from a pull request.
    The PR title is: "${state.pr_details.title}"
    The PR body is: "${state.pr_details.body || 'No description provided.'}"

    Here are the individual file analyses:
    ${analyses}

    Based on all this information, please generate a cohesive, high-level summary of the pull request.
    Conclude with a clear, actionable list of recommendations or "Looks good to me!" if no issues were found.
  `;

  try {
    console.log(chalk.magenta(`🤖 Setting model to llama3.2:1b for synthesis...`));
    await ollama.setModel("llama3.2:1b");
    
    console.log(chalk.magenta(`📤 Sending synthesis prompt to Ollama (${prompt.length} characters)`));
    console.log(chalk.gray(`"${prompt.substring(0, 200)}..."`));
    
    const startTime = Date.now();
    console.log(chalk.magenta(`⏳ Generating final report...`));
    
    const response = await ollama.generate(prompt);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(chalk.green(`✅ Report synthesis completed in ${duration}s`));
    console.log(chalk.magenta(`📥 Final report received (${response.output.length} characters)`));
    
    return response.output;
  } catch (error) {
    console.error(chalk.red(`❌ Error generating synthesis report:`), error);
    throw error; // Re-throw to be handled by the workflow
  }
};
