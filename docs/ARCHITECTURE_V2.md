# Hikmapr V2 Multi-Pass Analysis Architecture

## Overview

The V2 architecture completely reimplements the PR review process with a sophisticated multi-pass analysis approach that provides higher quality, more detailed, and more actionable reviews.

## Key Improvements

### 🔄 **Multi-Pass Analysis**
- **4 Specialized Passes per Chunk**: Each code chunk is analyzed through 4 different lenses
- **Structured Output**: Consistent, parseable analysis format
- **Risk Assessment**: Each pass assigns risk levels (LOW/MEDIUM/HIGH/CRITICAL)

### 🧩 **Intelligent Chunking**
- **Recursive Splitting**: Large files are intelligently split into manageable pieces
- **Context Preservation**: Overlapping context maintains analysis continuity
- **Diff-Aware**: Chunks respect Git diff boundaries and structure

### 🎯 **Smart File Filtering**
- **Project Type Detection**: Automatically detects TypeScript, JavaScript, Python, etc.
- **Extension Filtering**: Only analyzes relevant file types
- **Pattern Exclusion**: Skips test files, build outputs, dependencies

### 📊 **Hierarchical Synthesis**
- **Chunk → File → PR**: Three levels of synthesis for comprehensive analysis
- **Risk Aggregation**: Intelligent risk level propagation
- **Decision Framework**: Clear APPROVE/REQUEST_CHANGES/REJECT recommendations

### 💾 **Complete Tracking**
- **Database Storage**: Every analysis pass is saved for future reference
- **Progress Monitoring**: Real-time progress tracking
- **Resume Capability**: Can resume interrupted analyses

## Usage

The multi-pass architecture is now the **only** workflow available:

```bash
# Multi-pass analysis (default and only option)
hikma review <PR_URL>

# Resume interrupted analysis
hikma resume <task-id>

# View analysis results
hikma reports list
hikma reports view <report-id>
hikma reports files <task-id>  # View individual file analyses
```

**Note**: Legacy V1 workflows have been completely removed. All analysis now uses the advanced multi-pass architecture.

## Architecture Components

### 1. Type System (`src/types/analysis.ts`)
Comprehensive type definitions for multi-pass analysis workflow.

### 2. Prompt Templates (`src/prompts/templates.ts`)
Structured templates for each analysis pass:
- **Syntax & Logic**: Code quality, logic errors, readability
- **Security & Performance**: Vulnerabilities, bottlenecks, resource management
- **Architecture & Design**: Patterns, maintainability, API design
- **Testing & Documentation**: Coverage, docs, error handling

### 3. Service Layer
- **File Filtering**: Smart project-aware file filtering
- **Chunking**: Recursive diff splitting with context management
- **Analysis**: 4-pass specialized analysis coordination

### 4. Workflow Engine (`src/graph/workflow.ts`)
Enhanced workflow with 6 specialized nodes processing files through multiple analysis passes.

### 5. Database Schema
Enhanced schema tracking chunks, analysis passes, and hierarchical results.

## Simplified Architecture

The V2 multi-pass analysis is now the only implementation:

- **Single Command**: `hikma review <URL>` (always uses multi-pass analysis)
- **No Flags Needed**: Advanced analysis is the default behavior
- **Clean Codebase**: Legacy workflows completely removed for clarity 
