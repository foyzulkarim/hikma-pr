# Hikmapr - AI-Powered Pull Request Review Agent

A sophisticated CLI tool that provides intelligent, multi-pass analysis of GitHub Pull Requests using local LLMs.

## 🚀 Key Features

### **Single API Call Architecture**
- **Efficient**: Fetches entire PR diff in one `gh` CLI call
- **Rate Limit Friendly**: No multiple API calls per file
- **Local Processing**: All file extraction done locally after single fetch

### **Multi-Pass Analysis**
- **4 Specialized Passes**: Syntax/Logic, Security/Performance, Architecture/Design, Testing/Docs
- **Intelligent Chunking**: Recursive splitting with context preservation
- **Smart Filtering**: Auto-detects project type and filters relevant files
- **Hierarchical Synthesis**: Chunk → File → PR level analysis

### **Complete Tracking**
- **Database Storage**: Every analysis pass saved with metadata
- **Progress Monitoring**: Real-time progress with streaming responses
- **Resume Capability**: Can resume interrupted analyses
- **Report Generation**: Markdown reports with file-level details

### **Modern Web Dashboard**
- **Real-time Progress**: Visual progress bars and completion tracking
- **Risk Assessment**: Color-coded risk levels (LOW/MEDIUM/HIGH/CRITICAL)
- **Interactive Analysis**: Expandable chunks with detailed pass results
- **Decision Support**: Clear APPROVE/REQUEST_CHANGES/REJECT recommendations

## 📋 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Review a PR (single command, no flags needed)
hikma review https://github.com/owner/repo/pull/123

# Resume interrupted analysis
hikma resume <task-id>

# View saved reports
hikma reports list
hikma reports view <report-id>

# Launch web dashboard
cd hikma-pr-gui && npm install && npm run dev
# Visit http://localhost:3000
```

## 🏗️ Architecture

### Efficient Data Flow
1. **Single Fetch**: `gh pr diff <URL>` - one API call for entire PR
2. **Smart Filter**: Auto-detect project type, filter relevant files
3. **Local Extract**: Extract individual file diffs from cached full diff
4. **Chunk & Analyze**: 4-pass analysis per chunk with streaming
5. **Synthesize**: Hierarchical synthesis from chunks → files → PR

### No Rate Limiting Issues
- ✅ **One API call** per PR analysis
- ✅ **Local processing** for all file operations  
- ✅ **gh CLI** integration (no environment variables needed)
- ❌ No multiple calls per file
- ❌ No API key management

## 🔧 Configuration

### LLM Models
Configure in `src/graph/workflow.ts`:

```typescript
const DEFAULT_CONFIG: AnalysisConfig = {
  models: {
    syntax_logic: { name: 'gemma3:1b', provider: 'ollama' },
    security_performance: { name: 'gemma3:1b', provider: 'ollama' },
    // ... other passes
  }
}
```

### Project Detection
Supports auto-detection for:
- TypeScript/JavaScript (Node.js, React, Next.js)
- Python (Django, Flask, FastAPI)
- Java (Spring, Maven, Gradle)
- Go modules

## 📊 Example Output

```bash
🚀 Starting Hikmapr Multi-Pass Analysis
📝 Task ID: abc123def
🔗 PR URL: https://github.com/owner/repo/pull/123
🔬 Using Advanced Multi-Pass Analysis Architecture

✅ Single API call completed - all file diffs cached locally
📊 Found 5 analyzable files
🔬 4-pass analysis: syntax_logic completed in 2.1s
📊 Risk level: MEDIUM
🔍 Issues found: 3

📄 Report saved to: reports/owner-repo-PR123-2024-01-15-abc123def.md
```

## 🗃️ Database Schema

Tracks comprehensive analysis data:
- **Reviews**: PR metadata and final reports
- **ChunkAnalysis**: Individual chunks with context
- **AnalysisPass**: All 4 passes per chunk with risk levels
- **FileAnalysis**: Legacy file-level analyses

## 📝 Commands

```bash
# Core commands
hikma review <PR_URL>              # Analyze PR with multi-pass
hikma resume <task-id>             # Resume interrupted analysis

# Report management  
hikma reports list                 # List all saved reports
hikma reports view <number>        # View report by number
hikma reports view <filename>      # View report by filename
hikma reports files <task-id>      # View individual file analyses
hikma reports clean --days 30      # Clean old reports
```

## 🛠️ Requirements

- **Node.js** 18+
- **GitHub CLI** (`gh`) installed and authenticated
- **Ollama** running locally (default) or other LLM provider
- **PostgreSQL** for analysis storage

## 🎯 Why This Architecture?

1. **Rate Limit Safe**: Single API call vs. N calls per file
2. **Efficient**: Local processing after single fetch
3. **Resilient**: Database checkpointing and resume capability
4. **Comprehensive**: 4-pass analysis with risk assessment
5. **User Friendly**: No API keys, uses `gh` CLI authentication

Perfect for teams wanting thorough PR analysis without API rate limiting concerns.
