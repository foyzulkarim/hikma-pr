/**
 * LLM Service
 *
 * This service handles all communication with LLM providers (Ollama, OpenAI, etc.).
 * Uses generic HTTP client approach for better flexibility and provider swapping.
 */
import axios, { AxiosResponse } from 'axios';
import { Octokit } from 'octokit';
import { getFileDiff, getFileDiffViaCli } from './githubService';
import chalk from 'chalk';

const MODEL1 = "llama3.2:3b-instruct-fp16";
const MODEL2 = "gemma3:27b-it-q8_0";
const MODEL3 = 'qwen2.5-coder:14b-instruct-q4_K_M';
const MODEL4 = 'qwen2.5-coder:32b-instruct-q8_0';
const MODEL5 = 'gemma3:1b';

const SELECTED_MODEL = MODEL3;

// LLM Provider Configuration
interface LLMConfig {
  baseUrl: string;
  model: string;
  provider: string;
  apiKey?: string;
}

// Default Ollama configuration
const DEFAULT_CONFIG: LLMConfig = {
  baseUrl: 'http://localhost:11434',
  model: SELECTED_MODEL,
  provider: 'ollama'
};

// Streaming response handler
interface StreamHandler {
  onData?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Generic LLM client that can work with different providers
 */
class LLMClient {
  private config: LLMConfig;

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set the model to use for subsequent requests
   */
  // setModel(model: string): void {
  //   this.config.model = model;
  // }

  // setProvider(provider: 'ollama' | 'openai' | 'lmstudio'): void {
  //   this.config.provider = provider;
  // }

  /**
   * Generate response from LLM with streaming support
   */
  async generate(prompt: string, streamHandler?: StreamHandler): Promise<string> {
    if (this.config.provider === 'ollama') {
      return this.generateOllama(prompt, streamHandler);
    } else if (this.config.provider === 'openai') {
      return this.generateOpenAI(prompt, streamHandler);
    } else if (this.config.provider === 'lmstudio') {
      return this.generateLMStudio(prompt, streamHandler);
    } else {
      throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Generate response using Ollama API
   */
  private async generateOllama(prompt: string, streamHandler?: StreamHandler): Promise<string> {
    const requestData = {
      model: this.config.model,
      prompt: prompt,
      stream: !!streamHandler // Enable streaming if handler provided
    };

    try {
      if (streamHandler) {
        return this.handleOllamaStreaming(requestData, streamHandler);
      } else {
        return this.handleOllamaNonStreaming(requestData);
      }
    } catch (error) {
      if (streamHandler?.onError) {
        streamHandler.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Handle Ollama streaming response
   */
  private async handleOllamaStreaming(requestData: any, streamHandler: StreamHandler): Promise<string> {
    const response = await axios.post(`${this.config.baseUrl}/api/generate`, requestData, {
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      let fullResponse = '';
      
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              fullResponse += parsed.response;
              streamHandler.onData?.(parsed.response);
            }
            
            if (parsed.done) {
              streamHandler.onComplete?.(fullResponse);
              resolve(fullResponse);
              return;
            }
          } catch (parseError) {
            // Ignore malformed JSON lines
            continue;
          }
        }
      });

      response.data.on('error', (error: Error) => {
        streamHandler.onError?.(error);
        reject(error);
      });

      response.data.on('end', () => {
        if (fullResponse) {
          streamHandler.onComplete?.(fullResponse);
          resolve(fullResponse);
        } else {
          const error = new Error('Stream ended without receiving complete response');
          streamHandler.onError?.(error);
          reject(error);
        }
      });
    });
  }

  /**
   * Handle Ollama non-streaming response
   */
  private async handleOllamaNonStreaming(requestData: any): Promise<string> {
    const response = await axios.post(`${this.config.baseUrl}/api/generate`, requestData);
    return response.data.response || '';
  }

  /**
   * Generate response using LM Studio API (OpenAI-compatible)
   */
  private async generateLMStudio(prompt: string, streamHandler?: StreamHandler): Promise<string> {
    const requestData = {
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      stream: !!streamHandler,
      temperature: 0.7,
      max_tokens: -1 // LM Studio uses -1 for unlimited
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    try {
      if (streamHandler) {
        return this.handleLMStudioStreaming(requestData, headers, streamHandler);
      } else {
        const response = await axios.post(`${this.config.baseUrl}/v1/chat/completions`, requestData, { headers });
        return response.data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      if (streamHandler?.onError) {
        streamHandler.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Handle LM Studio streaming response
   */
  private async handleLMStudioStreaming(requestData: any, headers: Record<string, string>, streamHandler: StreamHandler): Promise<string> {
    const response = await axios.post(`${this.config.baseUrl}/v1/chat/completions`, requestData, {
      headers,
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      let fullResponse = '';
      
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              streamHandler.onComplete?.(fullResponse);
              resolve(fullResponse);
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                streamHandler.onData?.(content);
              }
            } catch (parseError) {
              // Ignore malformed JSON
              continue;
            }
          }
        }
      });

      response.data.on('error', (error: Error) => {
        streamHandler.onError?.(error);
        reject(error);
      });

      response.data.on('end', () => {
        streamHandler.onComplete?.(fullResponse);
        resolve(fullResponse);
      });
    });
  }

  /**
   * Generate response using OpenAI API (for future use)
   */
  private async generateOpenAI(prompt: string, streamHandler?: StreamHandler): Promise<string> {
    const requestData = {
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      stream: !!streamHandler
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      if (streamHandler) {
        return this.handleOpenAIStreaming(requestData, headers, streamHandler);
      } else {
        const response = await axios.post(`${this.config.baseUrl}/v1/chat/completions`, requestData, { headers });
        return response.data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      if (streamHandler?.onError) {
        streamHandler.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Handle OpenAI streaming response
   */
  private async handleOpenAIStreaming(requestData: any, headers: Record<string, string>, streamHandler: StreamHandler): Promise<string> {
    const response = await axios.post(`${this.config.baseUrl}/v1/chat/completions`, requestData, {
      headers,
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      let fullResponse = '';
      
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              streamHandler.onComplete?.(fullResponse);
              resolve(fullResponse);
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                streamHandler.onData?.(content);
              }
            } catch (parseError) {
              // Ignore malformed JSON
              continue;
            }
          }
        }
      });

      response.data.on('error', (error: Error) => {
        streamHandler.onError?.(error);
        reject(error);
      });

      response.data.on('end', () => {
        streamHandler.onComplete?.(fullResponse);
        resolve(fullResponse);
      });
    });
  }
}

// Create a default LLM client instance
const llmClient = new LLMClient();

/**
 * Analyzes a single file's diff and returns a summary with streaming support.
 */
export const analyzeFile = async (octokit: Octokit, prUrl: string, filePath: string): Promise<string> => {
  console.log(chalk.blue(`\n🔍 Starting analysis of: ${chalk.yellow(filePath)}`));
  
  const diff = await getFileDiff(octokit, prUrl, filePath);
  if (!diff) {
    console.log(chalk.red(`❌ Could not retrieve diff for ${filePath}`));
    return "Could not retrieve diff for this file.";
  }

  console.log(chalk.green(`✅ Retrieved diff for ${filePath} (${diff.length} characters)`));

  const prompt = `
    Review the following code changes for the file "${filePath}". 
    Please point out any potential issues, style violations, or areas for improvement. Make the response concise and to the point. Do not provide code suggestions.

    File Diff:
    \`\`\`diff
    ${diff}
    \`\`\`
  `;

  try {
    console.log(chalk.blue(`🤖 Setting model to ${SELECTED_MODEL}...`));
    // llmClient.setModel(SELECTED_MODEL);
    // llmClient.setProvider('lmstudio');
    
    console.log(chalk.blue(`📤 Sending prompt to LLM (${prompt.length} characters):`));
    console.log(chalk.gray(`"${prompt.substring(0, 200)}..."`));
    
    const startTime = Date.now();
    console.log(chalk.blue(`⏳ Generating analysis...`));
    
    // Set up streaming handler
    const streamHandler: StreamHandler = {
      onData: (chunk: string) => {
        // Show streaming response in terminal
        process.stdout.write(chalk.cyan(chunk));
      },
      onComplete: (fullResponse: string) => {
        console.log(); // New line after streaming
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.log(chalk.green(`✅ Analysis completed in ${duration}s`));
        console.log(chalk.blue(`📥 Response received (${fullResponse.length} characters)`));
      },
      onError: (error: Error) => {
        console.error(chalk.red(`❌ Streaming error:`), error.message);
      }
    };
    
    const response = await llmClient.generate(prompt, streamHandler);
    
    return response;
  } catch (error) {
    console.error(chalk.red(`❌ Error generating analysis for ${filePath}:`), error);
    throw error; // Re-throw to be handled by the workflow
  }
};

/**
 * Analyzes a single file's diff using gh CLI and returns a summary with streaming support.
 */
export const analyzeFileViaCli = async (prUrl: string, filePath: string): Promise<string> => {
  console.log(chalk.blue(`\n🔍 Starting analysis of: ${chalk.yellow(filePath)} (via gh CLI)`));
  
  const diff = await getFileDiffViaCli(prUrl, filePath);
  if (!diff) {
    console.log(chalk.red(`❌ Could not retrieve diff for ${filePath}`));
    return "Could not retrieve diff for this file.";
  }

  console.log(chalk.green(`✅ Retrieved diff for ${filePath} (${diff.length} characters)`));

  const prompt = `
    Review this diff for "${filePath}". Analyze these questions concisely:

    1. Could this break existing code? (Yes/No + brief reason)
    2. Are there any obvious bugs or security issues? (Yes/No + what)
    3. Does anything look suspicious or unclear? (Yes/No + what)

    If all answers are "No", just respond "No issues detected."

    \`\`\`diff
    ${diff}
    \`\`\`
  `;

  try {
    console.log(chalk.blue(`🤖 Setting model to ${SELECTED_MODEL}...`));
    // llmClient.setModel(SELECTED_MODEL);
    // llmClient.setProvider('lmstudio');
    console.log(chalk.blue(`📤 Sending prompt to LLM (${prompt.length} characters):`));
    console.log(chalk.gray(`"${prompt.substring(0, 200)}..."`));
    
    const startTime = Date.now();
    console.log(chalk.blue(`⏳ Generating analysis...`));
    
    // Set up streaming handler
    const streamHandler: StreamHandler = {
      onData: (chunk: string) => {
        // Show streaming response in terminal
        process.stdout.write(chalk.cyan(chunk));
      },
      onComplete: (fullResponse: string) => {
        console.log(); // New line after streaming
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.log(chalk.green(`✅ Analysis completed in ${duration}s`));
        console.log(chalk.blue(`📥 Response received (${fullResponse.length} characters)`));
      },
      onError: (error: Error) => {
        console.error(chalk.red(`❌ Streaming error:`), error.message);
      }
    };
    
    const response = await llmClient.generate(prompt, streamHandler);
    
    return response;
  } catch (error) {
    console.error(chalk.red(`❌ Error generating analysis for ${filePath}:`), error);
    throw error; // Re-throw to be handled by the workflow
  }
};

/**
 * Synthesizes a final, high-level report from all individual file analyses with streaming support.
 */
export const synthesizeReport = async (state: any): Promise<string> => {
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
      console.log(chalk.magenta(`🤖 Setting model to ${SELECTED_MODEL} for synthesis...`));
    // llmClient.setModel(SELECTED_MODEL);
    // llmClient.setProvider('lmstudio');
    console.log(chalk.magenta(`📤 Sending synthesis prompt to LLM (${prompt.length} characters)`));
    console.log(chalk.gray(`"${prompt.substring(0, 200)}..."`));
    
    const startTime = Date.now();
    console.log(chalk.magenta(`⏳ Generating final report...`));
    
    // Set up streaming handler for synthesis
    const streamHandler: StreamHandler = {
      onData: (chunk: string) => {
        // Show streaming response in terminal with different color for synthesis
        process.stdout.write(chalk.magenta(chunk));
      },
      onComplete: (fullResponse: string) => {
        console.log(); // New line after streaming
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.log(chalk.green(`✅ Report synthesis completed in ${duration}s`));
        console.log(chalk.magenta(`📥 Final report received (${fullResponse.length} characters)`));
      },
      onError: (error: Error) => {
        console.error(chalk.red(`❌ Synthesis streaming error:`), error.message);
      }
    };
    
    const response = await llmClient.generate(prompt, streamHandler);
    
    return response;
  } catch (error) {
    console.error(chalk.red(`❌ Error generating synthesis report:`), error);
    throw error; // Re-throw to be handled by the workflow
  }
};

/**
 * Create a custom LLM client with specific configuration
 * Useful for switching between providers
 */
export const createLLMClient = (config: Partial<LLMConfig>): LLMClient => {
  return new LLMClient(config);
};

/**
 * Export the LLMClient class for advanced usage
 */
export { LLMClient, LLMConfig, StreamHandler };
