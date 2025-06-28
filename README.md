# Hikma-PR: Your Local-First, AI-Powered Pull Request Review Agent

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

Hikma-PR is a sophisticated, stateful CLI application designed to automate the review of GitHub Pull Requests. Its core mission is to leverage the power of locally hosted Large Language Models (LLMs) to provide in-depth, multi-faceted code analysis without relying on cloud-based services. This gives you unlimited, cost-free, and private code analysis.

The system is architected to be modular, extensible, and resilient. It uses a graph-based workflow engine to orchestrate a team of specialized AI agents, ensuring a deep and comprehensive review process that can be resumed at any time.

## Key Features

-   **Local LLM Integration**: Works out-of-the-box with local LLM servers like **LM Studio**, **Ollama**, and any OpenAI-compatible endpoint. Keep your code on your machine.
-   **Stateful & Resumable Reviews**: Never lose progress. If a review is interrupted, you can resume it from the exact point it left off with the `resume` command.
-   **Multi-Agent Analysis**: Goes beyond simple reviews by using a team of specialized AI agents for different analysis aspects: Architecture, Security, Performance, and Testing.
-   **Dynamic, Context-Aware Prompts**: Generates highly specific prompts by analyzing the repository's language, framework, and architectural patterns, leading to more relevant and accurate insights.
-   **Comprehensive Reporting**: Generates detailed markdown reports for each review, which are stored locally for your records.
-   **Optional GUI**: Includes a Next.js-based web interface to visualize review results in a user-friendly format.

## Getting Started

### Quick Start with npx (Recommended)

The easiest way to get started is using npx, which automatically handles installation and setup:

```bash
npx hikma-pr review --server "http://localhost:1234" --model "your-model-name" --url "https://github.com/owner/repo/pull/123"
```

**First-time setup**: The first time you run the command, it will automatically:
- Install the package
- Set up the database in `~/.hikmapr/reviews.db`
- Generate the necessary Prisma client

**View results in web interface:**
```bash
npx hikma-pr ui
```

If you encounter any setup issues, you can manually initialize:
```bash
npx hikma-pr init
```

### Manual Installation (For Development)

### Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [npm](https://www.npmjs.com/)
-   [GitHub CLI (`gh`)](https://cli.github.com/): Make sure you are authenticated (`gh auth login`).
-   A local LLM server: We recommend [LM Studio](https://lmstudio.ai/) or [Ollama](https://ollama.ai/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/hikma-pr.git
    cd hikma-pr
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the project:**
    Since this is a TypeScript project, you need to compile it to JavaScript before running.
    ```bash
    npm run build
    ```

4.  **Set up the database:**
    Hikma-PR uses Prisma for state management with an SQLite database automatically created in `~/.hikmapr/reviews.db`. This step is required for the `resume` feature and the GUI.
    ```bash
    npx prisma generate
    npx prisma db push
    ```

## Configuration

## Command Options

The `review` command uses named options for better usability and flexibility:

- **`-u, --url <url>`**: The full GitHub Pull Request URL
- **`-p, --provider <provider>`**: The LLM provider (`ollama`, `lmstudio`, or `vllm`)
- **`-s, --server <server>`**: The URL where your LLM server is running
- **`-m, --model <model>`**: The name of the model to use for analysis

### Supported Providers

- **LM Studio**: Use `lmstudio` as provider, typically runs on `http://localhost:1234`
- **Ollama**: Use `ollama` as provider, typically runs on `http://localhost:11434`
- **vLLM**: Use `vllm` as provider, configure your custom endpoint

### Example Commands

```bash
# LM Studio example
hikma-pr review --url "https://github.com/owner/repo/pull/123" --provider "lmstudio" --server "http://localhost:1234" --model "gemma3:1b"

# Ollama example (using short flags)
hikma-pr review -u "https://github.com/owner/repo/pull/123" -p "ollama" -s "http://localhost:11434" -m "llama3:8b"

# vLLM example (mixed flags)
hikma-pr review --url "https://github.com/owner/repo/pull/123" -p "vllm" --server "http://localhost:8000" -m "microsoft/DialoGPT-medium"
```

## Usage

The primary interface for Hikma-PR is its command-line tool.

### Start a New Review

This is the main command. It kicks off the comprehensive, multi-pass analysis of a pull request.

```bash
# Basic usage with named options (all 4 options are required)
npx hikma-pr review --url <pr_url> --provider <provider> --server <server_url> --model <model>

# Example with long flags
npx hikma-pr review --url "https://github.com/owner/repo/pull/123" --provider "lmstudio" --server "http://localhost:1234" --model "gemma3:1b"

# Example with short flags
npx hikma-pr review -u "https://github.com/owner/repo/pull/123" -p "ollama" -s "http://localhost:11434" -m "llama3:8b"

# Mixed usage (options can be in any order)
npx hikma-pr review -p "vllm" --url "https://github.com/owner/repo/pull/123" -m "microsoft/DialoGPT-medium" --server "http://localhost:8000"
```

> **Note for Developers:** If you are running the application locally for development using `npm run dev`, you need to provide all options and include the double dash (`--`) to separate npm script options from the command arguments:
> ```bash
> npm run dev -- review --url "<pr_url>" --provider "<provider>" --server "<server_url>" --model "<model>"
> # Example with long flags:
> npm run dev -- review --url "https://github.com/owner/repo/pull/123" --provider "lmstudio" --server "http://localhost:1234" --model "gemma3:1b"
> # Example with short flags:
> npm run dev -- review -u "https://github.com/owner/repo/pull/123" -p "ollama" -s "http://localhost:11434" -m "llama3:8b"
> ```
> 
> The double dash (`--`) is important as it tells npm to pass all arguments after it directly to the script being run.

### Resume an Interrupted Review

If a review fails for any reason (e.g., network issue, LLM error), you can resume it using the `taskId` provided when the review started.

```bash
hikma-pr resume <task_id>
```

### Manage Reports

Hikma-PR saves a detailed markdown report for every completed review in the `reports/` directory.

**List all saved reports:**
```bash
hikma-pr reports list
```

**View a specific report in the console:**
```bash
# View by number from the list
hikma-pr reports view 1

# Or view by filename/taskId
hikma-pr reports view <report_filename_or_task_id>
```

### Web Interface

Hikma-PR includes a modern web interface to visualize your review results in a user-friendly format.

**Start the web UI server:**
```bash
# Start on default port (3000)
npx hikma-pr ui

# Or use the explicit start command
npx hikma-pr ui start

# Start on a custom port
npx hikma-pr ui start --port 8080

# Start without automatically opening browser
npx hikma-pr ui start --no-open
```

The web interface provides:
- 📊 **Review Dashboard**: Overview of all your PR reviews
- 🔍 **Detailed Analysis View**: In-depth view of each review with syntax highlighting
- 🔌 **Plugin Findings**: Visual display of plugin-detected issues
- 📈 **Progress Tracking**: Real-time progress of ongoing reviews
- 🎯 **Risk Assessment**: Color-coded risk levels and severity indicators

**Build the UI for production:**
```bash
npx hikma-pr ui build
```

> **Note**: The first time you run the UI command, it will automatically install the necessary dependencies. This may take a moment.

## Project Documentation

For a deeper understanding of the project's inner workings, please refer to the detailed documentation:

-   **[Software Architecture Document](./docs/ARCHITECTURE.md)**: A high-level overview of the system's components, layers, and the comprehensive review workflow.
-   **[Data Flow Document](./docs/DATA_FLOW.md)**: A detailed explanation of how data moves through the system, from the initial user command to the final report generation.
-   **[Plugin Architecture Document](./docs/PLUGIN_ARCHITECTURE.md)**: Describes the extensible plugin system, allowing custom analysis logic to be added without modifying core code.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss your ideas. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
