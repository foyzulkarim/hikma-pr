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

3.  **Set up the database:**
    Hikma-PR uses Prisma for state management. This step is required for the `resume` feature and the GUI.
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Configure your environment:**
    Copy the example environment file and update it with your local LLM server details if they differ from the defaults.
    ```bash
    cp .env.example .env
    ```

## Usage

The primary interface for Hikma-PR is its command-line tool.

### Start a New Review

This is the main command. It kicks off the comprehensive, multi-pass analysis of a pull request.

```bash
hikma review <full_github_pr_url>

# Example:
hikma review https://github.com/owner/repo/pull/123
```

### Resume an Interrupted Review

If a review fails for any reason (e.g., network issue, LLM error), you can resume it using the `taskId` provided when the review started.

```bash
hikma resume <task_id>
```

### Manage Reports

Hikma-PR saves a detailed markdown report for every completed review in the `reports/` directory.

**List all saved reports:**
```bash
hikma reports list
```

**View a specific report in the console:**
```bash
# View by number from the list
hikma-pr reports view 1

# Or view by filename/taskId
hikma-pr reports view <report_filename_or_task_id>
```

## Project Documentation

For a deeper understanding of the project's inner workings, please refer to the detailed documentation:

-   **[Software Architecture Document](./docs/ARCHITECTURE.md)**: A high-level overview of the system's components, layers, and the comprehensive review workflow.
-   **[Data Flow Document](./docs/DATA_FLOW.md)**: A detailed explanation of how data moves through the system, from the initial user command to the final report generation.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss your ideas. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
