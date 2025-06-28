
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { program } from 'commander';

// Define the structure of our configuration
export interface AppConfig {
  llmUrl: string;
  defaultModel: string;
  // Add other config properties here as needed
}

// Centralized default values
const DEFAULTS = {
  LLM_URL: 'http://localhost:11434', // Default to Ollama
  LLM_DEFAULT_MODEL: 'gemma3:1b',
};

/**
 * Loads configuration with a clear priority:
 * 1. Command-line flags
 * 2. Environment variables (from shell or user's .env file)
 * 3. Default values
 */
export function loadConfiguration(): AppConfig {
  // Load environment variables from user's home directory .env file
  // This does not override existing process.env variables
  const userConfigPath = path.join(os.homedir(), '.hikma-pr', '.env');
  dotenv.config({ path: userConfigPath });

  // Get values from command-line options, if provided
  const opts = program.opts();

  // Determine final configuration values based on priority
  const config: AppConfig = {
    llmUrl: opts.llmUrl || process.env.LLM_URL || DEFAULTS.LLM_URL,
    defaultModel: opts.modelName || process.env.LLM_DEFAULT_MODEL || DEFAULTS.LLM_DEFAULT_MODEL,
  };

  return config;
}

/**
 * Adds the common configuration flags to a commander instance.
 * @param command The commander program or command to add flags to.
 */
export function addConfigOptions(command: any) {
  return command
    .option('--llm-url <url>', 'The URL of the LLM server')
    .option('--model-name <name>', 'The name of the default LLM model');
}

