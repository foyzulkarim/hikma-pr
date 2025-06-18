/**
 * GitHub Service
 *
 * This service encapsulates all interactions with the GitHub API.
 * It uses Octokit.js for robust communication.
 */
import { Octokit } from 'octokit';
import chalk from 'chalk';

// Type definitions for GitHub API responses
interface GitHubFile {
  filename: string;
  patch?: string;
}

/**
 * Extracts owner, repo, and pull number from a GitHub PR URL.
 */
const parsePrUrl = (url: string) => {
  console.log(chalk.blue(`🔗 Parsing PR URL: ${url}`));
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) {
    console.log(chalk.red(`❌ Invalid GitHub PR URL format`));
    throw new Error('Invalid GitHub PR URL format.');
  }
  const parsed = { owner: match[1], repo: match[2], pull_number: parseInt(match[3], 10) };
  console.log(chalk.green(`✅ Parsed URL - Owner: ${chalk.yellow(parsed.owner)}, Repo: ${chalk.yellow(parsed.repo)}, PR: ${chalk.yellow(parsed.pull_number)}`));
  return parsed;
};

/**
 * Fetches the title and body of a Pull Request.
 */
export const getPrDetails = async (octokit: Octokit, prUrl: string) => {
  console.log(chalk.blue(`\n📋 Fetching PR details...`));
  const { owner, repo, pull_number } = parsePrUrl(prUrl);
  
  console.log(chalk.blue(`📡 Making GitHub API request to get PR details...`));
  const startTime = Date.now();
  
  const response = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
  });
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(chalk.green(`✅ PR details fetched in ${duration}s`));
  console.log(chalk.blue(`📋 Title: "${chalk.yellow(response.data.title)}"`));
  console.log(chalk.blue(`📄 Body length: ${response.data.body ? response.data.body.length : 0} characters`));
  console.log(chalk.blue(`👤 Author: ${chalk.yellow(response.data.user.login)}`));
  console.log(chalk.blue(`📊 Status: ${chalk.yellow(response.data.state)} | +${response.data.additions} -${response.data.deletions}`));

  return {
    title: response.data.title,
    body: response.data.body,
  };
};

/**
 * Fetches the list of files changed in a Pull Request.
 */
export const getChangedFiles = async (octokit: Octokit, prUrl: string): Promise<string[]> => {
  console.log(chalk.blue(`\n📁 Fetching changed files list...`));
  const { owner, repo, pull_number } = parsePrUrl(prUrl);
  
  console.log(chalk.blue(`📡 Making GitHub API request to get changed files...`));
  const startTime = Date.now();
  
  const response = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  const filenames = response.data.map((file: GitHubFile) => file.filename);
  
  console.log(chalk.green(`✅ Changed files fetched in ${duration}s`));
  console.log(chalk.blue(`📊 Found ${chalk.yellow(filenames.length)} changed files:`));
  filenames.forEach((filename: string, index: number) => {
    console.log(chalk.gray(`   ${index + 1}. ${filename}`));
  });

  return filenames;
};

/**
 * Fetches the diff for a specific file in a Pull Request.
 */
export const getFileDiff = async (octokit: Octokit, prUrl: string, filePath: string): Promise<string | null> => {
  console.log(chalk.blue(`📄 Fetching diff for: ${chalk.yellow(filePath)}`));
  const { owner, repo, pull_number } = parsePrUrl(prUrl);
  
  console.log(chalk.blue(`📡 Making GitHub API request to get file diffs...`));
  const startTime = Date.now();
  
  const response = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  const file = response.data.find((f: GitHubFile) => f.filename === filePath);
  
  if (!file || !file.patch) {
    console.log(chalk.red(`❌ No diff found for ${filePath}`));
    return null;
  }

  console.log(chalk.green(`✅ Diff for ${filePath} fetched in ${duration}s (${file.patch.length} characters)`));
  console.log(chalk.gray(`📝 Diff preview: "${file.patch.substring(0, 100)}..."`));
  
  return file.patch;
};
