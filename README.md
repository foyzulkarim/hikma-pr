# hikma-pr

A CLI tool for reviewing GitHub pull requests using local LLM models. Built with LangGraph for robust workflow management.

## Features

- 📊 Automated PR analysis using LLM models
- 🔄 Resumable workflows with state persistence
- 📝 Comprehensive markdown reports with file-by-file analysis
- ⚙️ **Configurable GitHub Access** - Choose between GitHub SDK or CLI upfront
- 🔀 **Flexible LLM Provider Support** - Switch between Ollama, OpenAI, and LM Studio easily
- 📺 **Real-time Streaming Response** - See AI analysis as it's generated

## LLM Provider Configuration

The service now supports multiple LLM providers with easy switching:

### Using Ollama (Default)
```typescript
// Uses default Ollama configuration
const response = await analyzeFile(octokit, prUrl, filePath);
```

### Switching to OpenAI
```typescript
import { createLLMClient } from './src/services/llmService';

// Create OpenAI client
const openaiClient = createLLMClient({
  provider: 'openai',
  baseUrl: 'https://api.openai.com',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY
});

// Use with streaming
const response = await openaiClient.generate(prompt, {
  onData: (chunk) => console.log(chunk),
  onComplete: (full) => console.log('Complete:', full)
});
```

### Using LM Studio
```typescript
import { createLLMClient } from './src/services/llmService';

// LM Studio setup (OpenAI-compatible API)
const lmstudioClient = createLLMClient({
  provider: 'lmstudio',
  baseUrl: 'http://localhost:1234',
  model: 'qwen/qwen3-4b' // or any model loaded in LM Studio
});

// Use with streaming
const response = await lmstudioClient.generate(prompt, {
  onData: (chunk) => process.stdout.write(chunk),
  onComplete: (full) => console.log('\n✅ Complete!')
});
```

### Custom Ollama Configuration
```typescript
import { createLLMClient } from './src/services/llmService';

// Custom Ollama setup
const customClient = createLLMClient({
  provider: 'ollama',
  baseUrl: 'http://custom-ollama-server:11434',
  model: 'codestral:latest'
});
```

## Installation

```bash
git clone https://github.com/your-username/hikma-pr.git
cd hikma-pr
npm install
npm run build
```

## Setup

1. **Choose GitHub Interaction Method**:
   
   Edit `src/index.ts` and set your preferred method:
   ```typescript
   // CONFIGURATION: Change this to choose your GitHub interaction method
   const GITHUB_METHOD: GitHubMethod = 'cli'; // 👈 'sdk' or 'cli'
   ```
   
   **Options:**
   - `'sdk'` = Uses GitHub SDK (Octokit) - requires GITHUB_TOKEN, subject to rate limits
   - `'cli'` = Uses GitHub CLI (gh) - requires gh authentication, no rate limits

2. **Set up GitHub Authentication**:
   
   **For SDK method:**
   ```bash
   export GITHUB_TOKEN="your_github_token_here"
   ```
   
   **For CLI method:**
   ```bash
   # Install and authenticate gh CLI
   gh auth login
   ```

3. **Install Ollama** (if using default provider):
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull the required models
   ollama pull llama3.2:3b-instruct-fp16
   ollama pull gemma2:27b-instruct-q8_0
   ```

4. **Install LM Studio** (optional alternative to Ollama):
   - Download from [LM Studio](https://lmstudio.ai/)
   - Load a model (e.g., qwen/qwen3-4b)
   - Start the server (runs on port 1234 by default)
   - Check status: `lms status`

5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your GitHub token and other settings
   ```

6. **Initialize database**:
   ```bash
   npm run prisma:migrate
   ```

## Usage

### Basic PR Review
```bash
# Review a PR
./dist/index.js review https://github.com/owner/repo/pull/123

# Resume a previous review
./dist/index.js resume <task-id>

# Generate reports
./dist/index.js reports
```

### With Custom LLM Provider
Set environment variables:

**For OpenAI:**
```bash
export LLM_PROVIDER=openai
export LLM_BASE_URL=https://api.openai.com
export LLM_MODEL=gpt-4
export LLM_API_KEY=your-openai-key
```

**For LM Studio:**
```bash
export LLM_PROVIDER=lmstudio
export LLM_BASE_URL=http://localhost:1234
export LLM_MODEL=qwen/qwen3-4b
# No API key needed for LM Studio
```

## Architecture

- **LangGraph**: Manages stateful workflow execution
- **Prisma**: Handles data persistence and state management
- **Axios**: Generic HTTP client for LLM API calls (replaces provider-specific SDKs)
- **Streaming Support**: Real-time response display with `onData` handlers

## Technical Benefits

### 🔄 Provider Flexibility
- Easy switching between Ollama, OpenAI, LM Studio, and future providers
- No vendor lock-in - uses standard HTTP APIs
- Configuration-driven provider selection
- Support for both local (Ollama, LM Studio) and cloud (OpenAI) providers

### 📺 Streaming Response
- Real-time output as LLM generates response
- Better user experience with immediate feedback
- Configurable streaming handlers for different use cases

### 🛠 Maintainable Code
- Single HTTP client (axios) instead of multiple SDKs
- Consistent error handling across providers
- Easier testing and debugging

## Examples

Check the `examples/` directory for usage examples:
- `examples/lmstudio-example.ts` - Complete LM Studio integration example with streaming

Run the LM Studio example:
```bash
npx ts-node examples/lmstudio-example.ts
```

## License

ISC
