# Local LLM Pull Request Review Architecture

## Core Strategy: Multi-Pass Analysis with Synthesis

### Phase 1: Context Establishment
**Prompt Template:**
```
You are a senior software engineer reviewing code changes. Your task is to analyze this pull request diff systematically.

CONTEXT:
- Repository: {repo_name}
- Branch: {source_branch} → {target_branch}
- Files changed: {file_count}
- Lines added: {additions}, Lines removed: {deletions}

DIFF OVERVIEW:
{diff_summary}

Your analysis should be thorough, focusing on code quality, potential bugs, security issues, and best practices. Respond in structured format.
```

### Phase 2: Specialized Analysis Passes

#### Pass 1: Syntax & Logic Analysis
```
TASK: Code Quality & Logic Review

Analyze the following diff for:
1. Syntax errors or potential compilation issues
2. Logic errors or edge cases
3. Code structure and readability
4. Variable naming and conventions

DIFF:
{diff_chunk}

FORMAT YOUR RESPONSE:
## Syntax Issues
- [List any syntax problems]

## Logic Concerns
- [Identify logical flaws or edge cases]

## Code Quality
- [Comment on structure, readability, naming]

## Risk Level
[LOW/MEDIUM/HIGH] - Brief justification
```

#### Pass 2: Security & Performance Analysis
```
TASK: Security & Performance Review

Examine this code diff for:
1. Security vulnerabilities (injection, XSS, auth bypass, etc.)
2. Performance bottlenecks or inefficiencies
3. Resource management issues
4. Data validation problems

DIFF:
{diff_chunk}

FORMAT YOUR RESPONSE:
## Security Issues
- [List security concerns with severity]

## Performance Impact
- [Identify performance issues]

## Resource Management
- [Memory leaks, file handles, connections]

## Risk Assessment
[CRITICAL/HIGH/MEDIUM/LOW] - Detailed reasoning
```

#### Pass 3: Architecture & Design Analysis
```
TASK: Architecture & Design Review

Evaluate this diff for:
1. Design patterns and architectural concerns
2. Code maintainability and extensibility
3. Dependency management
4. API design and contracts

DIFF:
{diff_chunk}

FORMAT YOUR RESPONSE:
## Design Quality
- [Assess architectural decisions]

## Maintainability
- [Long-term code health concerns]

## API/Interface Changes
- [Breaking changes, backward compatibility]

## Recommendations
- [Specific improvement suggestions]
```

#### Pass 4: Testing & Documentation Analysis
```
TASK: Testing & Documentation Review

Review this diff for:
1. Test coverage and quality
2. Documentation completeness
3. Example usage and edge cases
4. Error handling and logging

DIFF:
{diff_chunk}

FORMAT YOUR RESPONSE:
## Test Coverage
- [Assess test completeness]

## Documentation
- [Missing or unclear documentation]

## Error Handling
- [Exception handling quality]

## Suggestions
- [Testing and documentation improvements]
```

### Phase 3: Synthesis & Final Review

#### Context Aggregation Prompt
```
TASK: Synthesize Pull Request Analysis

You have completed multiple specialized reviews of a pull request. Now synthesize these findings into a comprehensive review.

PREVIOUS ANALYSES:
## Syntax & Logic Review
{pass1_results}

## Security & Performance Review
{pass2_results}

## Architecture & Design Review
{pass3_results}

## Testing & Documentation Review
{pass4_results}

SYNTHESIS REQUIREMENTS:
1. Prioritize issues by severity and impact
2. Identify patterns across different analysis types
3. Provide actionable recommendations
4. Suggest approval/rejection with reasoning

FORMAT YOUR RESPONSE:
## Executive Summary
[2-3 sentences on overall assessment]

## Critical Issues
[Must-fix items before merge]

## Important Recommendations
[Should-fix items for code quality]

## Minor Suggestions
[Nice-to-have improvements]

## Decision Recommendation
[APPROVE/REQUEST_CHANGES/REJECT] with clear reasoning
```

## Advanced Optimization Techniques

### 1. Context Window Management
- **Chunking Strategy**: Split large diffs into logical chunks (by function, class, or file)
- **Overlap Handling**: Include 3-5 lines of context before/after each chunk
- **Priority Ordering**: Analyze modified functions before new additions

### 2. Model-Specific Adaptations

#### For Gemma3:
- Use shorter, more direct prompts
- Include explicit examples in prompts
- Break complex tasks into smaller steps
- Use numbered lists for clarity

#### For Qwen3:
- Provide more context about the codebase
- Use Chinese technical terms if model responds better
- Include explicit role-playing ("You are an expert...")
- Use structured output formats

### 3. Prompt Engineering Enhancements

#### Few-Shot Examples
Include 1-2 examples of good reviews:
```
EXAMPLE REVIEW:
Diff: [small example diff]
Review: [high-quality analysis example]
---
```

#### Chain-of-Thought Prompting
```
Think through this step by step:
1. First, understand what this code is trying to do
2. Then, identify any obvious issues
3. Consider edge cases and error conditions
4. Finally, assess overall code quality
```

#### Temperature and Sampling Settings
- **Analysis Passes**: Lower temperature (0.1-0.3) for consistency
- **Synthesis Pass**: Moderate temperature (0.5-0.7) for creativity
- **Use top-p sampling**: 0.9-0.95 for balanced output

### 4. Quality Assurance Layer

#### Consistency Checking
```
TASK: Review Consistency Check

Compare these two analyses of the same code:
Analysis 1: {analysis1}
Analysis 2: {analysis2}

Identify:
1. Contradictory findings
2. Missing issues in either analysis
3. Severity level disagreements

Provide reconciled analysis.
```

### 5. Implementation Algorithm

```python
def review_pull_request(diff, repo_context):
    # Phase 1: Preprocessing
    chunks = split_diff_intelligently(diff)
    context = build_context_summary(repo_context, diff)
    
    # Phase 2: Multi-pass analysis
    analyses = {}
    for chunk in chunks:
        analyses[chunk.id] = {
            'syntax_logic': analyze_syntax_logic(chunk, context),
            'security_perf': analyze_security_performance(chunk, context),
            'architecture': analyze_architecture(chunk, context),
            'testing_docs': analyze_testing_docs(chunk, context)
        }
    
    # Phase 3: Synthesis
    consolidated = consolidate_analyses(analyses)
    final_review = synthesize_review(consolidated, context)
    
    # Phase 4: Quality check
    validated_review = validate_consistency(final_review, analyses)
    
    return format_github_comment(validated_review)
```

### 6. Continuous Improvement

#### Feedback Loop
- Track which issues were actually valid
- Adjust prompt weights based on accuracy
- Maintain a database of effective prompt variations

#### Model Selection Strategy
- Use faster models (Gemma3) for initial passes
- Use more capable models (Qwen3) for synthesis
- Consider ensemble approaches for critical reviews

## Expected Outcomes

This architecture should improve local model performance by:
- **Reducing cognitive load** through specialized passes
- **Improving context retention** via structured analysis
- **Enhancing consistency** through synthesis validation
- **Increasing depth** through multi-perspective analysis

The iterative approach compensates for local models' limitations while leveraging their strengths in focused analysis tasks.
