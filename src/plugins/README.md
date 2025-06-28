# Hikma PR Plugins

This directory contains analysis plugins that extend the core PR review functionality. Each plugin can perform specialized analysis on code chunks during the review process.

## Available Plugins

### 🔍 Code Smell Detector (`codeSmell.plugin.ts`)
- **Purpose**: Detects common code smells and anti-patterns
- **Features**: 
  - LLM-powered analysis for complex patterns
  - Regex-based checks for quick detection
  - Identifies magic numbers, console statements, TODO comments
- **Severity**: Warning/Info

### ⚛️ React Best Practices (`reactBestPractices.plugin.ts`)
- **Purpose**: Analyzes React/JSX code for best practices violations
- **Features**:
  - Hooks rules validation
  - Performance issue detection
  - Accessibility checks
  - State management analysis
- **File Types**: `.jsx`, `.tsx`, React components
- **Severity**: Error/Warning/Info

### 📘 TypeScript Analyzer (`typescript.plugin.ts`)
- **Purpose**: Ensures TypeScript type safety and best practices
- **Features**:
  - Type safety validation
  - Generic usage analysis
  - Interface/type definition checks
  - 'any' type usage detection
- **File Types**: `.ts`, `.tsx`
- **Severity**: Warning/Info

### 🔒 Security Analyzer (`security.plugin.ts`)
- **Purpose**: Identifies common security vulnerabilities
- **Features**:
  - Injection vulnerability detection
  - Hardcoded secrets identification
  - Weak cryptography detection
  - Input validation checks
- **Severity**: Error/Warning

### 📝 Template Plugin (`template.plugin.ts`)
- **Purpose**: Template for creating new plugins
- **Usage**: Copy and modify to create custom plugins
- **Note**: Not active by default

## Creating Custom Plugins

### 1. Use the Template
Copy `template.plugin.ts` and rename it to `yourPlugin.plugin.ts`.

### 2. Plugin Structure
```typescript
const yourPlugin: HikmaPlugin = {
  id: 'unique-plugin-id',
  name: 'Human Readable Name',
  description: 'What this plugin does',
  hooks: ['onChunkAnalysis'], // When to run
  usesLLM: true, // Whether you need LLM access
  async execute(input: PluginAnalysisInput): Promise<PluginAnalysisOutput> {
    // Your analysis logic here
    return { findings };
  },
};
```

### 3. Analysis Approaches

**Regex-Based (Fast)**
```typescript
if (/your-pattern/.test(line)) {
  findings.push({
    line: index + 1,
    message: 'Issue description',
    severity: 'warning',
    pluginId: this.id,
    pluginName: this.name,
  });
}
```

**LLM-Powered (Sophisticated)**
```typescript
if (input.llmClient) {
  const prompt = `ANALYZE: Your specific concern...`;
  const response = await input.llmClient.generate(prompt);
  const findings = parseResponse(response);
}
```

### 4. File Type Filtering
```typescript
const isReactFile = /\.(jsx|tsx)$/.test(input.filePath);
const hasReactContent = input.chunkContent.includes('useState');
```

### 5. Severity Levels
- `'error'`: Critical issues that should block merge
- `'warning'`: Important issues that should be addressed
- `'info'`: Suggestions for improvement

## Plugin Hooks

- `'onChunkAnalysis'`: Run for each code chunk (most common)
- `'onFileAnalysis'`: Run for each complete file
- `'onPullRequestAnalysis'`: Run for the entire PR

## Best Practices

1. **Performance**: Use regex for quick checks, LLM for complex analysis
2. **File Filtering**: Only analyze relevant file types
3. **Error Handling**: Gracefully handle LLM failures
4. **Specificity**: Provide actionable, specific feedback
5. **Severity**: Use appropriate severity levels

## Plugin Loading

Plugins are automatically loaded from this directory at startup. File naming convention:
- `*.plugin.ts` or `*.plugin.js`
- Must export the plugin as default export

## Testing Plugins

1. Add your plugin file to this directory
2. Restart the application
3. Run a PR review to see your plugin in action
4. Check the console for plugin loading messages

## Examples

### Simple Regex Plugin
```typescript
// Check for console.log statements
if (/console\.log/.test(line)) {
  findings.push({
    line: index + 1,
    message: 'Remove console.log before production',
    severity: 'info',
    pluginId: this.id,
    pluginName: this.name,
  });
}
```

### LLM-Powered Plugin
```typescript
const prompt = `
ANALYZE: Performance issues
CODE: ${input.chunkContent}
RESPOND: PERFORMANCE: [issues or "None"]
`;

const response = await input.llmClient.generate(prompt);
// Parse response and create findings
```

## Troubleshooting

- **Plugin not loading**: Check file naming and export syntax
- **LLM not working**: Ensure `usesLLM: true` and handle errors
- **No findings**: Verify file type filtering and regex patterns
- **Build errors**: Check TypeScript types and imports

For more details, see the [Plugin Architecture Documentation](../../docs/PLUGIN_ARCHITECTURE.md).
