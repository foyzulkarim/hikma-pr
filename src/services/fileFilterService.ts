// File Filtering Service - Smart detection and filtering of analyzable files

import { ProjectConfig } from '../types/analysis';
import chalk from 'chalk';
import path from 'path';

// Predefined configurations for different project types
const PROJECT_CONFIGS: { [key: string]: ProjectConfig } = {
  typescript: {
    language: 'typescript',
    file_extensions: ['.ts', '.tsx', '.js', '.jsx'],
    exclude_patterns: [
      '*.d.ts',           // Type definition files
      '*.min.js',         // Minified files
      'node_modules/**',  // Dependencies
      'dist/**',          // Build output
      'build/**',         // Build output
      '.next/**',         // Next.js output
      'coverage/**',      // Test coverage
      '*.spec.ts',        // Test files (optional)
      '*.test.ts',        // Test files (optional)
      '*.spec.js',        // Test files (optional)
      '*.test.js'         // Test files (optional)
    ],
    max_chunk_tokens: 4000,
    context_lines: 5
  },
  
  javascript: {
    language: 'javascript',
    file_extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    exclude_patterns: [
      '*.min.js',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.spec.js',
      '*.test.js'
    ],
    max_chunk_tokens: 4000,
    context_lines: 5
  },
  
  python: {
    language: 'python',
    file_extensions: ['.py', '.pyx', '.pyi'],
    exclude_patterns: [
      '__pycache__/**',
      '*.pyc',
      'venv/**',
      '.venv/**',
      'env/**',
      'dist/**',
      'build/**',
      '*.egg-info/**',
      'test_*.py',
      '*_test.py'
    ],
    max_chunk_tokens: 4000,
    context_lines: 5
  },
  
  java: {
    language: 'java',
    file_extensions: ['.java'],
    exclude_patterns: [
      'target/**',
      'build/**',
      '.gradle/**',
      '*.class',
      '*Test.java',
      '*Tests.java'
    ],
    max_chunk_tokens: 4000,
    context_lines: 5
  },
  
  go: {
    language: 'go',
    file_extensions: ['.go'],
    exclude_patterns: [
      'vendor/**',
      '*_test.go'
    ],
    max_chunk_tokens: 4000,
    context_lines: 5
  }
};

export class FileFilterService {
  private config: ProjectConfig;

  constructor(customConfig?: Partial<ProjectConfig>) {
    if (customConfig?.language && customConfig.language !== 'auto') {
      this.config = { ...PROJECT_CONFIGS[customConfig.language], ...customConfig };
    } else {
      // Auto-detect project type
      this.config = this.detectProjectType();
      if (customConfig) {
        this.config = { ...this.config, ...customConfig };
      }
    }
    
    console.log(chalk.blue(`🔍 File filter configured for ${chalk.yellow(this.config.language)} project`));
    console.log(chalk.gray(`📋 Extensions: ${this.config.file_extensions.join(', ')}`));
    console.log(chalk.gray(`🚫 Exclusions: ${this.config.exclude_patterns.length} patterns`));
  }

  /**
   * Auto-detect project type based on common file patterns
   */
  private detectProjectType(): ProjectConfig {
    // This is a simplified detection - in a real implementation,
    // you might want to check package.json, requirements.txt, etc.
    
    // For now, default to TypeScript since that's what the current project uses
    console.log(chalk.yellow(`🔄 Auto-detecting project type...`));
    console.log(chalk.blue(`📝 Defaulting to TypeScript configuration`));
    
    return PROJECT_CONFIGS.typescript;
  }

  /**
   * Filter files that should be analyzed
   */
  filterFiles(allFiles: string[]): string[] {
    console.log(chalk.blue(`\n🔍 Filtering ${allFiles.length} changed files...`));
    
    const filtered = allFiles.filter(file => this.shouldAnalyzeFile(file));
    
    console.log(chalk.green(`✅ Filtered to ${filtered.length} analyzable files:`));
    filtered.forEach((file, index) => {
      console.log(chalk.gray(`   ${index + 1}. ${file}`));
    });
    
    if (filtered.length !== allFiles.length) {
      const excluded = allFiles.filter(file => !this.shouldAnalyzeFile(file));
      console.log(chalk.yellow(`⚠️  Excluded ${excluded.length} files:`));
      excluded.forEach((file, index) => {
        console.log(chalk.gray(`   ${index + 1}. ${file} (${this.getExclusionReason(file)})`));
      });
    }
    
    return filtered;
  }

  /**
   * Check if a file should be analyzed
   */
  private shouldAnalyzeFile(filePath: string): boolean {
    // Check if file has an allowed extension
    const hasValidExtension = this.config.file_extensions.some(ext => 
      filePath.toLowerCase().endsWith(ext.toLowerCase())
    );
    
    if (!hasValidExtension) {
      return false;
    }
    
    // Check if file matches any exclusion pattern
    const isExcluded = this.config.exclude_patterns.some(pattern => 
      this.matchesPattern(filePath, pattern)
    );
    
    return !isExcluded;
  }

  /**
   * Get reason why a file was excluded (for logging)
   */
  private getExclusionReason(filePath: string): string {
    const hasValidExtension = this.config.file_extensions.some(ext => 
      filePath.toLowerCase().endsWith(ext.toLowerCase())
    );
    
    if (!hasValidExtension) {
      return 'unsupported extension';
    }
    
    const matchedPattern = this.config.exclude_patterns.find(pattern => 
      this.matchesPattern(filePath, pattern)
    );
    
    return matchedPattern ? `matches pattern: ${matchedPattern}` : 'unknown';
  }

  /**
   * Simple pattern matching (supports basic wildcards)
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob-like pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')     // ** matches any path
      .replace(/\*/g, '[^/]*')    // * matches any filename chars
      .replace(/\./g, '\\.');     // Escape dots
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  /**
   * Get current configuration
   */
  getConfig(): ProjectConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ProjectConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log(chalk.blue(`🔄 File filter configuration updated`));
  }

  /**
   * Estimate analysis complexity based on file characteristics
   */
  estimateComplexity(files: string[]): {
    totalFiles: number;
    estimatedChunks: number;
    estimatedPasses: number;
    estimatedTimeMinutes: number;
  } {
    const totalFiles = files.length;
    // Rough estimation: average file = 2 chunks, each chunk = 4 passes, each pass = 30 seconds
    const estimatedChunks = totalFiles * 2;
    const estimatedPasses = estimatedChunks * 4;
    const estimatedTimeMinutes = Math.ceil(estimatedPasses * 0.5); // 30 seconds per pass
    
    return {
      totalFiles,
      estimatedChunks,
      estimatedPasses,
      estimatedTimeMinutes
    };
  }
} 
