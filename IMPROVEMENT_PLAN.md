# Hikma-PR Enhancement Plan: From Fragmented to Holistic Analysis

## Executive Summary

Your current PR review system performs isolated chunk analysis that produces disjointed reports. This plan transforms it into a holistic, context-aware system that rivals top-tier tools like Claude Code and Amazon Q.

## Current Issues Analysis

### 1. Fragmented Analysis Pattern
- **Problem**: Each chunk analyzed independently without cross-chunk context
- **Location**: `src/graph/workflow.ts:348-399`
- **Impact**: Produces disconnected insights that miss broader patterns

### 2. Naive Chunking Strategy
- **Problem**: Simple token-based splitting ignores semantic boundaries
- **Location**: `src/services/chunkService.ts:34-68`
- **Impact**: Breaks functions/classes mid-way, losing context

### 3. Generic Prompts
- **Problem**: Templates focus on general code review, not change impact
- **Location**: `src/prompts/templates.ts:20-134`
- **Impact**: Misses diff-specific insights and architectural implications

## Implementation Plan

### Phase 1: Enhanced Context Architecture

#### 1.1 Add Dependency Analysis Service

Create `src/services/dependencyService.ts`:

```typescript
export class DependencyService {
  async analyzePRDependencies(files: string[]): Promise<DependencyGraph> {
    // Build file relationship map
    // Identify import/export chains
    // Detect circular dependencies
    // Map component hierarchies
  }
  
  async getRelatedFiles(targetFile: string): Promise<string[]> {
    // Find test files, type definitions, components
    // Return files that should be analyzed together
  }
}
```

#### 1.2 Implement Semantic Chunking

Replace token-based chunking in `chunkService.ts`:

```typescript
async createSemanticChunks(filePath: string, diffContent: string): Promise<ChunkInfo[]> {
  // Parse AST to identify function/class boundaries
  // Keep complete semantic units together
  // Preserve import/export relationships
  // Add richer context between chunks
}
```

### Phase 2: Context-Aware Analysis

#### 2.1 Progressive Context Building

Modify `workflow.ts` to build context progressively:

```typescript
// New workflow nodes:
"buildPRContext" → "groupRelatedFiles" → "analyzeFileGroups" → "synthesizeModules" → "finalSynthesis"
```

#### 2.2 Cross-File Analysis

Create `src/services/contextService.ts`:

```typescript
export class ContextService {
  async buildPRContext(prDetails: any, files: string[]): Promise<PRContext> {
    // Identify change patterns (refactor vs feature vs bugfix)
    // Map architectural impact
    // Build cross-file relationship context
  }
  
  async shareContextBetweenAnalyses(chunks: ChunkInfo[]): Promise<ChunkInfo[]> {
    // Add architectural context to each chunk
    // Include change impact context
    // Share patterns found in related files
  }
}
```

### Phase 3: Enhanced Prompting

#### 3.1 Replace Generic Templates

**Current Issue**: Templates like `SYNTAX_LOGIC_TEMPLATE` are too broad.

**New Approach**: Change-focused, contextual prompts.

#### 3.2 Improved Prompt Templates

Replace `src/prompts/templates.ts` with these enhanced prompts:

**CHANGE_IMPACT_ANALYSIS_TEMPLATE**:
```
TASK: Analyze Change Impact and Risks

You are reviewing a specific code change within a larger PR context. Focus on what changed and its implications.

PR CONTEXT:
- Change Type: {change_type} (refactor/feature/bugfix/breaking)
- Architectural Layer: {layer} (frontend/backend/database/api)
- Related Files: {related_files}

FILE: {file_path}
CHANGE SUMMARY: {change_summary}

DIFF WITH FULL CONTEXT:
{enhanced_diff_with_context}

RELATED CHANGES IN PR:
{related_pr_changes}

ANALYSIS FOCUS:
1. What specific functionality is being changed?
2. How does this change affect the broader system?
3. What could break as a result of this change?
4. Are there missing related changes (tests, docs, types)?

FORMAT YOUR RESPONSE:
## Change Summary
[What changed and why - be specific]

## Impact Analysis
- Direct impact: [immediate effects]
- Cascade effects: [what else might be affected]
- Breaking changes: [API/behavior changes]

## Risk Assessment
[HIGH/MEDIUM/LOW] - Focus on regression risk and system stability

## Missing Elements
- [Required but missing changes in related files]
- [Missing tests, documentation, type updates]

## Recommendations
- [Specific, actionable improvements]
```

**ARCHITECTURAL_CONSISTENCY_TEMPLATE**:
```
TASK: Verify Architectural Consistency

Analyze this change for consistency with existing patterns and architectural decisions.

SYSTEM CONTEXT:
- Architecture Type: {architecture_type}
- Design Patterns Used: {patterns}
- Coding Standards: {standards}

CURRENT CHANGE:
File: {file_path}
Change Context: {change_context}

DIFF:
{diff_content}

EXISTING PATTERNS IN CODEBASE:
{similar_implementations}

ANALYSIS REQUIREMENTS:
1. Does this change follow established patterns?
2. Are naming conventions consistent?
3. Is error handling consistent with the rest of the codebase?
4. Does this maintain the existing abstraction levels?

FORMAT YOUR RESPONSE:
## Pattern Consistency
[How well does this follow existing patterns]

## Architectural Alignment
[Whether this fits the overall system design]

## Consistency Issues
- [Deviations from established patterns]
- [Naming or style inconsistencies]

## Improvement Suggestions
- [How to better align with existing architecture]
```

**HOLISTIC_SYNTHESIS_TEMPLATE**:
```
TASK: Synthesize Holistic PR Analysis

You have analyzed multiple related files and their changes. Now provide a comprehensive, holistic review.

PR OVERVIEW:
- Title: {pr_title}
- Type: {change_type}
- Files Changed: {file_count}
- Lines: +{additions} -{deletions}

ARCHITECTURAL CONTEXT:
{architectural_context}

DETAILED ANALYSIS RESULTS:
{comprehensive_analysis_results}

CROSS-FILE PATTERNS IDENTIFIED:
{cross_file_patterns}

SYNTHESIS REQUIREMENTS:
1. Identify the main theme/purpose of this PR
2. Assess overall architectural impact
3. Highlight critical risks and missing elements
4. Provide prioritized, actionable feedback

FORMAT YOUR RESPONSE:
## PR Assessment
**Purpose**: [What this PR achieves]
**Scope**: [How comprehensive the changes are]
**Quality**: [Overall code quality assessment]

## Critical Issues (Must Fix)
[Issues that could cause bugs, security problems, or system instability]

## Architecture & Design Concerns
[Issues affecting maintainability, scalability, or consistency]

## Missing Elements
[Tests, documentation, error handling, edge cases]

## Testing Strategy
[What should be tested and how]

## Deployment Considerations
[Migration needs, feature flags, rollback concerns]

## Final Recommendation
**Decision**: [APPROVE/REQUEST_CHANGES/NEEDS_DISCUSSION]
**Reasoning**: [Clear explanation of the decision]
**Priority Actions**: [Top 3 things to address first]
```

### Phase 4: Implementation Details

#### 4.1 Workflow Restructuring

Update `src/graph/workflow.ts`:

```typescript
// New enhanced workflow
workflow.addNode("establishContext", establishContextEnhanced);
workflow.addNode("buildDependencyGraph", buildDependencyGraph);
workflow.addNode("groupRelatedFiles", groupRelatedFiles);
workflow.addNode("createSemanticChunks", createSemanticChunks);
workflow.addNode("analyzeWithContext", analyzeWithContextAwareness);
workflow.addNode("synthesizeModules", synthesizeModuleLevel);
workflow.addNode("finalHolisticSynthesis", finalHolisticSynthesis);
```

#### 4.2 Context-Aware Analysis

Replace the isolated 4-pass analysis with:

```typescript
async analyzeChunkWithContext(
  chunk: ChunkInfo, 
  prContext: PRContext,
  relatedChanges: RelatedChange[]
): Promise<ContextualAnalysis> {
  // Single comprehensive analysis with full context
  // Focus on change impact rather than general review
  // Include architectural consistency checks
  // Consider related changes in other files
}
```

### Phase 5: Quality Enhancements

#### 5.1 Add Change Pattern Detection

```typescript
// In src/services/patternService.ts
export class ChangePatternService {
  detectChangeType(diff: string): 'refactor' | 'feature' | 'bugfix' | 'breaking' {
    // Analyze diff patterns to categorize changes
  }
  
  findSimilarChanges(currentChange: string, allChanges: string[]): SimilarChange[] {
    // Find related changes in the same PR
  }
}
```

#### 5.2 Enhanced Error Detection

Focus on change-specific errors:
- API contract changes without version updates
- Database migrations without rollback scripts
- Frontend changes without corresponding backend updates
- Missing test updates for changed functionality

## Success Metrics

### Before vs After Comparison

**Current State**:
- 185 minutes for 27 files (6.9 min/file)
- Fragmented, disconnected analysis
- Generic feedback not specific to changes

**Target State**:
- 60-90 minutes for 27 files (2-3 min/file)
- Holistic, contextual analysis
- Change-focused, actionable feedback

### Quality Indicators

1. **Context Awareness**: Analysis should reference related files and architectural implications
2. **Change Focus**: Feedback should be specific to what changed, not general code review
3. **Actionability**: Recommendations should be specific and prioritized
4. **Completeness**: Should identify missing related changes (tests, docs, types)

## Implementation steps

- **Phase 1**: Dependency analysis and semantic chunking
- **Phase 2**: Context-aware workflow restructuring  
- **Phase 3**: Enhanced prompting and cross-file analysis
- **Phase 4**: Testing, refinement, and performance optimization

## Quick Wins

1. **Immediate**: Replace generic prompts with change-focused templates
2. **Phase 1**: Implement semantic chunking to preserve function boundaries
3. **Phase 2**: Add cross-file context sharing
4. **Phase 3**: Full holistic synthesis implementation

This plan transforms your system from producing disconnected chunk analyses to providing comprehensive, context-aware PR reviews that rival top-tier tools.
