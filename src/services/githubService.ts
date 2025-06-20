/**
 * GitHub Service
 *
 * This service encapsulates all interactions with the GitHub API.
 * It uses Octokit.js for robust communication.
 */
import { Octokit } from 'octokit';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
 * Fetches the title and body of a Pull Request using gh CLI.
 */
export const getPrDetailsViaCli = async (prUrl: string) => {
  console.log(chalk.blue(`\n📋 Fetching PR details via gh CLI...`));
  
  try {
    console.log(chalk.blue(`🔧 Executing: gh pr view ${prUrl} --json title,body,author,state,additions,deletions`));
    const startTime = Date.now();
    
    const { stdout } = await execAsync(`gh pr view ${prUrl} --json title,body,author,state,additions,deletions`);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    const prData = JSON.parse(stdout);
    
    console.log(chalk.green(`✅ PR details fetched via CLI in ${duration}s`));
    console.log(chalk.blue(`📋 Title: "${chalk.yellow(prData.title)}"`));
    console.log(chalk.blue(`📄 Body length: ${prData.body ? prData.body.length : 0} characters`));
    console.log(chalk.blue(`👤 Author: ${chalk.yellow(prData.author.login)}`));
    console.log(chalk.blue(`📊 Status: ${chalk.yellow(prData.state)} | +${prData.additions || 0} -${prData.deletions || 0}`));

    return {
      title: prData.title,
      body: prData.body,
    };
  } catch (error) {
    console.error(chalk.red(`❌ Error fetching PR details via CLI:`), error);
    throw error;
  }
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
 * Fetches the list of files changed in a Pull Request using gh CLI.
 */
export const getChangedFilesViaCli = async (prUrl: string): Promise<string[]> => {
  console.log(chalk.blue(`\n📁 Fetching changed files list via gh CLI...`));
  
  try {
    console.log(chalk.blue(`🔧 Executing: gh pr diff ${prUrl} --name-only`));
    const startTime = Date.now();
    
    const { stdout } = await execAsync(`gh pr diff ${prUrl} --name-only`);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const filenames = stdout.trim().split('\n').filter(line => line.length > 0);
    
    console.log(chalk.green(`✅ Changed files fetched via CLI in ${duration}s`));
    console.log(chalk.blue(`📊 Found ${chalk.yellow(filenames.length)} changed files:`));
    filenames.forEach((filename: string, index: number) => {
      console.log(chalk.gray(`   ${index + 1}. ${filename}`));
    });

    return filenames;
  } catch (error) {
    console.error(chalk.red(`❌ Error fetching changed files via CLI:`), error);
    throw error;
  }
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

/**
 * Fetches the diff for a specific file in a Pull Request using gh CLI.
 * Since gh pr diff doesn't support file-specific diffs, we get the entire diff
 * and extract the specific file's changes.
 */
export const getFileDiffViaCli = async (prUrl: string, filePath: string): Promise<string | null> => {
  console.log(chalk.blue(`📄 Fetching diff for: ${chalk.yellow(filePath)} via gh CLI`));
  
  try {
    console.log(chalk.blue(`🔧 Executing: gh pr diff ${prUrl}`));
    const startTime = Date.now();
    
    const { stdout } = await execAsync(`gh pr diff ${prUrl}`);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (!stdout.trim()) {
      console.log(chalk.red(`❌ No diff found in PR`));
      return null;
    }

    console.log(chalk.green(`✅ Full PR diff fetched via CLI in ${duration}s (${stdout.length} characters)`));
    
    // Extract the specific file's diff from the full PR diff
    const fileDiff = extractFileDiffFromFullDiff(stdout, filePath);
    
    if (!fileDiff) {
      console.log(chalk.red(`❌ No diff found for specific file: ${filePath}`));
      return null;
    }

    console.log(chalk.green(`✅ Extracted diff for ${filePath} (${fileDiff.length} characters)`));
    console.log(chalk.gray(`📝 Diff preview: "${fileDiff.substring(0, 100)}..."`));
    
    return fileDiff;
  } catch (error) {
    console.error(chalk.red(`❌ Error fetching diff for ${filePath} via CLI:`), error);
    return null;
  }
};

/**
 * Extracts the diff for a specific file from the full PR diff output.
 */
const extractFileDiffFromFullDiff = (fullDiff: string, targetFilePath: string): string | null => {
  const lines = fullDiff.split('\n');
  const fileDiffLines: string[] = [];
  let foundFile = false;
  let currentFileInDiff = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for file header (diff --git a/path b/path)
    if (line.startsWith('diff --git')) {
      // If we found our target file previously, we're done
      if (foundFile) {
        break;
      }
      
      // Reset state for new file
      currentFileInDiff = false;
      
      // Check if this is our target file - handle various path formats
      const isTargetFile = 
        line.includes(`a/${targetFilePath}`) || 
        line.includes(`"a/${targetFilePath}"`) ||
        line.includes(targetFilePath);
      
      if (isTargetFile) {
        foundFile = true;
        currentFileInDiff = true;
        fileDiffLines.push(line);
        console.log(chalk.gray(`🎯 Found target file in diff: ${targetFilePath}`));
      }
    } else if (currentFileInDiff) {
      // Add all lines that are part of our target file's diff
      fileDiffLines.push(line);
    }
  }

  if (foundFile && fileDiffLines.length > 1) { // At least diff header + some content
    console.log(chalk.blue(`📝 Extracted ${fileDiffLines.length} lines for ${targetFilePath}`));
    return fileDiffLines.join('\n');
  }

  console.log(chalk.yellow(`⚠️  File ${targetFilePath} not found in PR diff. Available files:`));
  
  // Help debug by showing what files are actually in the diff
  const availableFiles = fullDiff
    .split('\n')
    .filter(line => line.startsWith('diff --git'))
    .map(line => {
      const match = line.match(/diff --git a\/(.+?) b\//);
      return match ? match[1] : 'unknown';
    })
    .slice(0, 10); // Show first 10 files
  
  availableFiles.forEach((file, index) => {
    console.log(chalk.gray(`   ${index + 1}. ${file}`));
  });
  
  if (availableFiles.length === 10) {
    console.log(chalk.gray(`   ... and more`));
  }

  return null;
};
