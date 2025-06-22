# LLM Provider Comparison Guide

## Overview

hikma-pr now supports three LLM providers with seamless switching:

| Provider | Type | Port | API Format | Streaming | API Key Required |
|----------|------|------|------------|-----------|------------------|
| **Ollama** | Local | 11434 | Ollama API | ✅ | ❌ |
| **LM Studio** | Local | 1234 | OpenAI Compatible | ✅ | ❌ |
| **OpenAI** | Cloud | 443/80 | OpenAI API | ✅ | ✅ |

## Quick Setup

### 1. Ollama (Default)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama3.2:3b-instruct-fp16
ollama pull gemma3:27b-it-q8_0

# Check status
ollama list
```

### 2. LM Studio
```bash
# Download from https://lmstudio.ai/
# Load a model (e.g., qwen/qwen3-4b)
# Start server

# Check status
lms status
```

### 3. OpenAI
```bash
# Get API key from https://openai.com/api/
export OPENAI_API_KEY="your-key-here"
```

## Code Examples

### Default Usage (Ollama)
```typescript
import { analyzeFile } from './src/services/llmService';

// Uses default Ollama configuration
const analysis = await analyzeFile(octokit, prUrl, filePath);
```

### LM Studio
```typescript
import { createLLMClient } from './src/services/llmService';

const client = createLLMClient({
  provider: 'lmstudio',
  baseUrl: 'http://localhost:1234',
  model: 'qwen/qwen3-4b'
});

const response = await client.generate(prompt, {
  onData: (chunk) => process.stdout.write(chunk)
});
```

### OpenAI
```typescript
import { createLLMClient } from './src/services/llmService';

const client = createLLMClient({
  provider: 'openai',
  baseUrl: 'https://api.openai.com',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY
});
```

## Performance Comparison

| Provider | Speed | Cost | Privacy | Model Variety |
|----------|-------|------|---------|---------------|
| **Ollama** | Fast (local) | Free | 🔒 Fully Local | High |
| **LM Studio** | Fast (local) | Free | 🔒 Fully Local | High |
| **OpenAI** | Very Fast | $$ | ☁️ Cloud-based | Medium |

## Model Recommendations

### For Code Review:
- **Ollama**: `codestral:latest`, `deepseek-coder:33b`
- **LM Studio**: `qwen/qwen3-4b`, `microsoft/DialoGPT-medium`
- **OpenAI**: `gpt-4`, `gpt-3.5-turbo`

### For Fast Analysis:
- **Ollama**: `llama3.2:3b-instruct-fp16`
- **LM Studio**: `qwen/qwen3-4b`
- **OpenAI**: `gpt-3.5-turbo`

### For Comprehensive Review:
- **Ollama**: `gemma3:27b-it-q8_0`
- **LM Studio**: `qwen/qwen3-32b` (if you have RAM)
- **OpenAI**: `gpt-4`

## Troubleshooting

### Ollama Issues
```bash
# Check if running
ollama list

# Restart service
ollama serve

# Check logs
journalctl -u ollama
```

### LM Studio Issues
```bash
# Check status
lms status

# Restart server in LM Studio GUI
# Make sure model is loaded and server is started
```

### GitHub CLI Issues
```bash
# Check if authenticated
gh auth status

# Login if needed
gh auth login

# Test PR access
gh pr view https://github.com/owner/repo/pull/123

# Note: gh pr diff gets entire PR diff, we extract file-specific diffs
```

### OpenAI Issues
```bash
# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Check rate limits in OpenAI dashboard
```

## Environment Variables

Create a `.env` file:
```bash
# GitHub
GITHUB_TOKEN=your_github_token

# LLM Provider (optional - defaults to ollama)
LLM_PROVIDER=ollama|lmstudio|openai
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=gemma3:27b-it-q8_0
LLM_API_KEY=your_api_key_if_needed
```

## Switching Providers

You can switch providers in three ways:

1. **Environment Variables** (Global)
2. **Code Configuration** (Per-client)
3. **Runtime Configuration** (Dynamic)

The flexible architecture makes it easy to experiment with different providers and find what works best for your use case! 
