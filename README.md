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

## 🛠️ Prerequisites

Before you start, ensure you have these installed:

### **Required Software**
1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **GitHub CLI (gh)** - [Installation guide](https://cli.github.com/)
3. **Ollama** - [Download here](https://ollama.ai/) (for local LLM)

### **Setup Steps**

#### 1. Install and Configure GitHub CLI
```bash
# Install GitHub CLI (if not already installed)
# macOS
brew install gh
# Windows
winget install GitHub.cli
# Linux
sudo apt install gh

# Authenticate with GitHub
gh auth login
```

#### 2. Install and Start Ollama
```bash
# Download and install Ollama from https://ollama.ai/
# Then pull the required model
ollama pull gemma2:2b
# or for faster analysis (smaller model)
ollama pull gemma2:1b
```

#### 3. Verify Prerequisites
```bash
# Check Node.js version (should be 18+)
node --version

# Check GitHub CLI is authenticated
gh auth status

# Check Ollama is running
ollama list
```

## 📋 Installation & Quick Start

### **Step 1: Clone and Install**
```bash
# Clone the repository
git clone https://github.com/foyzulkarim/hikma-pr.git
cd hikma-pr

# Install dependencies
npm install

# Set up database
npm run db:migrate
```

### **Step 2: First Analysis**
```bash
# Analyze any public GitHub PR
npm run dev -- review https://github.com/microsoft/vscode/pull/12345

# Or build and run
npm run build
npm start review https://github.com/microsoft/vscode/pull/12345
```

### **Step 3: Launch Web Dashboard (Optional)**
```bash
# In a new terminal window
cd hikma-pr-gui
npm install
npm run dev

# Visit http://localhost:3000 to see the dashboard
```

## 🎯 Usage Examples

### **Analyze a Pull Request**
```bash
# Basic analysis
hikma review https://github.com/owner/repo/pull/123

# The tool will:
# 1. Fetch PR diff using GitHub CLI
# 2. Filter relevant files automatically
# 3. Run 4-pass analysis on each chunk
# 4. Generate comprehensive report
# 5. Save results to database
```

### **View Results**
```bash
# List all analysis reports
hikma reports list

# View specific report
hikma reports view 1

# Resume interrupted analysis
hikma resume abc123def
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

## 🛠️ Development Scripts

Quick reference for development tasks:

```bash
# Show all available scripts with descriptions
npm run help

# Development workflow
npm run dev          # Run in development mode (hot reload)
npm run build        # Build TypeScript to JavaScript
npm start           # Run the built application

# Database management
npm run db:generate  # Generate Prisma client after schema changes
npm run db:migrate   # Create and apply new migration
npm run db:deploy    # Apply existing migrations (production)
npm run db:studio    # Open database GUI
npm run db:status    # Check migration status
```

For detailed explanations of each script, see [SCRIPTS.md](./SCRIPTS.md) or run `npm run help`.

## 📊 Example Output

```bash
🚀 Starting Hikmapr Multi-Pass Analysis
📝 Task ID: abc123def
🔗 PR URL: https://github.com/owner/repo/pull/123
🔬 Using Advanced Multi-Pass Analysis Architecture

✅ Single API call completed - all file diffs cached locally
📊 Found 5 analyzable files (filtered from 12 total files)
🔄 Processing chunks: ████████████████████ 100% (20/20)

🔬 Analysis Progress:
├── 📄 src/components/Button.tsx
│   ├── 🔍 Syntax & Logic: ✅ LOW risk (2.1s)
│   ├── 🔒 Security & Performance: ✅ LOW risk (1.8s)
│   ├── 🏗️ Architecture & Design: ⚠️ MEDIUM risk (2.3s)
│   └── 📋 Testing & Documentation: ❌ HIGH risk (1.9s)
├── 📄 src/utils/api.ts
│   ├── 🔍 Syntax & Logic: ✅ LOW risk (1.5s)
│   ├── 🔒 Security & Performance: 🚨 CRITICAL risk (2.7s)
│   └── ... (analysis continues)

📊 Final Summary:
├── 🟢 LOW: 12 issues
├── 🟡 MEDIUM: 5 issues  
├── 🟠 HIGH: 3 issues
└── 🔴 CRITICAL: 1 issue

🎯 Recommendation: REQUEST_CHANGES
📄 Report saved: reports/owner-repo-PR123-2024-01-15-abc123def.md
🌐 View in dashboard: http://localhost:3000/review/abc123def
```

## 🔧 Configuration

### **LLM Models**
Configure in `src/graph/workflow.ts`:

```typescript
const DEFAULT_CONFIG: AnalysisConfig = {
  models: {
    syntax_logic: { name: 'gemma2:2b', provider: 'ollama' },
    security_performance: { name: 'gemma2:2b', provider: 'ollama' },
    architecture_design: { name: 'gemma2:2b', provider: 'ollama' },
    testing_docs: { name: 'gemma2:2b', provider: 'ollama' }
  }
}
```

### **Supported Models**
- **Ollama**: `gemma2:2b`, `gemma2:1b`, `llama3.1:8b`, `codellama:7b`
- **OpenAI**: `gpt-4`, `gpt-3.5-turbo` (requires API key)
- **Anthropic**: `claude-3-sonnet` (requires API key)

### **Project Detection**
Automatically detects and filters files for:
- **JavaScript/TypeScript**: React, Next.js, Node.js, Vue, Angular
- **Python**: Django, Flask, FastAPI, general Python
- **Java**: Spring Boot, Maven, Gradle projects
- **Go**: Go modules and packages
- **C#**: .NET, ASP.NET projects
- **PHP**: Laravel, Symfony projects

## 🛠️ Development Scripts

Quick reference for development tasks:

```bash
# Show all available scripts with descriptions
npm run help

# Development workflow
npm run dev          # Run in development mode (hot reload)
npm run build        # Build TypeScript to JavaScript
npm start           # Run the built application

# Database management
npm run db:generate  # Generate Prisma client after schema changes
npm run db:migrate   # Create and apply new migration
npm run db:deploy    # Apply existing migrations (production)
npm run db:studio    # Open database GUI
npm run db:status    # Check migration status
```

For detailed explanations of each script, see [SCRIPTS.md](./SCRIPTS.md) or run `npm run help`.

## 🗃️ Database Schema

Tracks comprehensive analysis data:
- **Reviews**: PR metadata and final reports
- **ChunkAnalysis**: Individual chunks with context
- **AnalysisPass**: All 4 passes per chunk with risk levels
- **FileAnalysis**: Legacy file-level analyses

## 📝 Available Commands

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

## 🚨 Troubleshooting

### **Common Issues**

#### "gh: command not found"
```bash
# Install GitHub CLI
brew install gh  # macOS
# or visit https://cli.github.com/
```

#### "ollama: command not found"
```bash
# Install Ollama from https://ollama.ai/
# Then pull a model
ollama pull gemma2:2b
```

#### "Database connection error"
```bash
# Reset database
npm run db:reset
npm run db:migrate
```

#### "Build errors after updates"
```bash
# Clean and rebuild
npm run db:generate
npm run build
```

### **Getting Help**
- 📖 Read [SCRIPTS.md](./SCRIPTS.md) for detailed script explanations
- 🗄️ Read [hikma-pr-gui/DATABASE.md](./hikma-pr-gui/DATABASE.md) for GUI database issues
- 🐛 [Open an issue](https://github.com/foyzulkarim/hikma-pr/issues) for bugs
- 💬 [Start a discussion](https://github.com/foyzulkarim/hikma-pr/discussions) for questions

## 🎯 Why This Architecture?

1. **Rate Limit Safe**: Single API call vs. N calls per file
2. **Efficient**: Local processing after single fetch
3. **Resilient**: Database checkpointing and resume capability
4. **Comprehensive**: 4-pass analysis with risk assessment
5. **User Friendly**: No API keys, uses `gh` CLI authentication

Perfect for teams wanting thorough PR analysis without API rate limiting concerns.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

⭐ **Star this repo if you find it helpful!** ⭐
