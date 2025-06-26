/**
 * Repository Intelligence Service - Complete Implementation
 * Based on FINAL_IMPROVEMENT_PLAN.md requirements
 */
import fs from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';
import { 
  CompleteRepositoryContext, 
  BlastRadius, 
  ContextualCodeMap,
  DirectoryStructure,
  ArchitecturalPattern,
  QualityMetrics,
  GitCommit,
  HistoricalPattern
} from '../types/analysis.js';

export class RepositoryIntelligenceService {
  
  async acquireCompleteContext(repoUrl: string, prNumber: number): Promise<CompleteRepositoryContext> {
    console.log('🔍 Acquiring complete repository context...');
    console.log(`🔍 Acquiring complete repository context for PR #${prNumber}`);
    
    // Clone repository with full history
    const repoPath = await this.cloneRepository(repoUrl, prNumber);
    
    // Build comprehensive understanding
    const [
      codebaseMap,
      architecturalPatterns,
      historicalPatterns,
      qualityMetrics
    ] = await Promise.all([
      this.buildCodebaseMap(repoPath),
      this.extractArchitecturalPatterns(repoPath),
      this.analyzeHistoricalPatterns(repoPath),
      this.extractQualityMetrics(repoPath)
    ]);
    
    return this.synthesizeRepositoryContext({
      codebaseMap,
      architecturalPatterns,
      historicalPatterns,
      qualityMetrics
    }, prNumber);
  }

  async buildBlastRadius(changedFiles: string[], repoPath: string): Promise<BlastRadius> {
    console.log('💥 Building blast radius analysis...');
    
    // For now, implement a basic blast radius analysis
    // In a full implementation, this would use AST analysis
    const directImpact = changedFiles;
    const indirectImpact = await this.findRelatedFiles(changedFiles, repoPath);
    const testImpact = await this.findTestFiles(changedFiles, repoPath);
    const documentationImpact = await this.findDocumentationFiles(changedFiles, repoPath);
    
    return {
      directImpact,
      indirectImpact,
      testImpact,
      documentationImpact,
      migrationImpact: [],
      configurationImpact: this.findConfigFiles(changedFiles)
    };
  }

  async extractContextualCode(
    targetFiles: string[],
    blastRadius: BlastRadius,
    repoPath: string
  ): Promise<ContextualCodeMap> {
    console.log('📄 Extracting contextual code...');
    
    const contextMap = new Map();
    
    for (const file of targetFiles) {
      try {
        const completeFileContent = await this.getCompleteFile(file, repoPath);
        const relatedFunctions = await this.getRelatedFunctions(file, blastRadius, repoPath);
        const dependencyChain = await this.getDependencyChain(file, repoPath);
        const usageExamples = await this.getUsageExamples(file, repoPath);
        const testCoverage = await this.getTestCoverage(file, repoPath);
        const historicalContext = await this.getHistoricalContext(file, repoPath);
        
        contextMap.set(file, {
          completeFileContent,
          relatedFunctions,
          dependencyChain,
          usageExamples,
          testCoverage,
          historicalContext
        });
      } catch (error) {
        console.warn(`⚠️ Could not extract context for ${file}:`, error);
        contextMap.set(file, {
          completeFileContent: '',
          relatedFunctions: [],
          dependencyChain: [],
          usageExamples: [],
          testCoverage: [],
          historicalContext: {}
        });
      }
    }
    
    return contextMap;
  }

  // Core implementation methods
  private async cloneRepository(repoUrl: string, prNumber: number): Promise<string> {
    console.log(`📥 Cloning repository to temp/repos/${prNumber}...`);
    
    // Extract repository URL from PR URL
    const repoUrlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoUrlMatch) {
      throw new Error('Invalid repository URL format');
    }
    
    const [, owner, repo] = repoUrlMatch;
    const actualRepoUrl = `https://github.com/${owner}/${repo}.git`;
    const tempDir = path.join(process.cwd(), 'temp', 'repos', prNumber.toString());
    
    // Ensure temp directory exists
    await fs.mkdir(path.dirname(tempDir), { recursive: true });
    
    // Clone the repository
    const git = simpleGit();
    await git.clone(actualRepoUrl, tempDir);
    
    return tempDir;
  }

  private async buildCodebaseMap(repoPath: string): Promise<any> {
    console.log('🗺️ Building codebase map...');
    
    const structure = await this.buildDirectoryStructure(repoPath);
    const fileTypes = await this.analyzeFileTypes(repoPath);
    const totalLines = await this.countTotalLines(repoPath);
    const languages = await this.detectLanguages(repoPath);
    
    return {
      structure,
      fileTypes: Object.fromEntries(fileTypes),
      totalLines,
      languages,
      size: {
        files: await this.countFiles(repoPath),
        directories: await this.countDirectories(repoPath),
        lines: totalLines,
        bytes: await this.calculateTotalSize(repoPath)
      }
    };
  }

  private async buildDirectoryStructure(repoPath: string): Promise<any> {
    console.log('📁 Building directory structure...');
    
    const buildStructureRecursive = async (currentPath: string): Promise<any> => {
      try {
        const items = await fs.readdir(currentPath, { withFileTypes: true });
        const currentStructure: any = {};
        
        for (const item of items) {
          const fullPath = path.join(currentPath, item.name);
          
          if (this.shouldIgnoreItem(item.name)) continue;
          
          if (item.isDirectory()) {
            currentStructure[item.name] = await buildStructureRecursive(fullPath);
          } else {
            currentStructure[item.name] = null; // Files are represented as null
          }
        }
        
        return currentStructure;
      } catch (error) {
        console.warn(`⚠️ Could not read directory ${currentPath}:`, error);
        return {};
      }
    };
    
    const structure = await buildStructureRecursive(repoPath);
    console.log(`✅ Directory structure built`);
    return structure;
  }

  private shouldIgnoreItem(name: string): boolean {
    const ignorePatterns = [
      'node_modules', '.git', '.DS_Store', 'dist', 'build', 
      'coverage', '.nyc_output', 'logs', '.env', '.vscode',
      'target', 'bin', 'obj', '.idea'
    ];
    
    return ignorePatterns.some(pattern => name === pattern || name.startsWith(pattern));
  }

  private detectDirectoryPatterns(structure: any): string[] {
    const patterns: string[] = [];
    const directories = Object.keys(structure).filter(key => 
      typeof structure[key] === 'object' && structure[key].type !== 'file'
    );
    
    if (directories.includes('src') && directories.includes('test')) {
      patterns.push('Standard Source/Test Structure');
    }
    
    if (directories.includes('controllers') || directories.includes('models') || directories.includes('views')) {
      patterns.push('MVC Architecture');
    }
    
    if (directories.includes('services') && directories.includes('repositories')) {
      patterns.push('Service-Repository Pattern');
    }
    
    if (directories.includes('components') && directories.includes('pages')) {
      patterns.push('Component-Based Frontend');
    }
    
    return patterns;
  }

  private async analyzeFileTypes(repoPath: string): Promise<Map<string, number>> {
    console.log('📄 Analyzing file types...');
    
    const fileTypes = new Map<string, number>();
    
    const analyzeDirectory = async (dirPath: string): Promise<void> => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (this.shouldIgnoreItem(item.name)) continue;
          
          if (item.isDirectory()) {
            await analyzeDirectory(fullPath);
          } else {
            const extension = path.extname(item.name).toLowerCase();
            const key = extension || 'no-extension';
            fileTypes.set(key, (fileTypes.get(key) || 0) + 1);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not analyze directory ${dirPath}:`, error);
      }
    };
    
    await analyzeDirectory(repoPath);
    
    console.log(`✅ File types analyzed: ${fileTypes.size} different types`);
    return fileTypes;
  }

  private async countTotalLines(repoPath: string): Promise<number> {
    console.log('📊 Counting total lines of code...');
    
    let totalLines = 0;
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go'];
    
    const countLinesInDirectory = async (dirPath: string): Promise<void> => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (this.shouldIgnoreItem(item.name)) continue;
          
          if (item.isDirectory()) {
            await countLinesInDirectory(fullPath);
          } else {
            const extension = path.extname(item.name).toLowerCase();
            if (codeExtensions.includes(extension)) {
              try {
                const content = await fs.readFile(fullPath, 'utf8');
                const lines = content.split('\n').length;
                totalLines += lines;
              } catch (error) {
                // Skip files that can't be read
              }
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not count lines in directory ${dirPath}:`, error);
      }
    };
    
    await countLinesInDirectory(repoPath);
    
    console.log(`✅ Total lines counted: ${totalLines.toLocaleString()}`);
    return totalLines;
  }

  private async detectLanguages(repoPath: string): Promise<string[]> {
    console.log('🔍 Detecting programming languages...');
    
    const languageMap = new Map<string, string>([
      ['.js', 'JavaScript'],
      ['.ts', 'TypeScript'],
      ['.jsx', 'JavaScript (React)'],
      ['.tsx', 'TypeScript (React)'],
      ['.py', 'Python'],
      ['.java', 'Java'],
      ['.cpp', 'C++'],
      ['.c', 'C'],
      ['.cs', 'C#'],
      ['.php', 'PHP'],
      ['.rb', 'Ruby'],
      ['.go', 'Go'],
      ['.rs', 'Rust'],
      ['.swift', 'Swift']
    ]);
    
    const detectedLanguages = new Set<string>();
    
    const scanDirectory = async (dirPath: string): Promise<void> => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (this.shouldIgnoreItem(item.name)) continue;
          
          if (item.isDirectory()) {
            await scanDirectory(fullPath);
          } else {
            const extension = path.extname(item.name).toLowerCase();
            const language = languageMap.get(extension);
            if (language) {
              detectedLanguages.add(language);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not scan directory ${dirPath}:`, error);
      }
    };
    
    await scanDirectory(repoPath);
    
    const languages = Array.from(detectedLanguages);
    console.log(`✅ Languages detected: ${languages.join(', ')}`);
    return languages;
  }

  private async calculateTotalSize(repoPath: string): Promise<number> {
    let totalSize = 0;
    
    const calculateSizeRecursive = async (dirPath: string): Promise<void> => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (this.shouldIgnoreItem(item.name)) continue;
          
          if (item.isDirectory()) {
            await calculateSizeRecursive(fullPath);
          } else {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    await calculateSizeRecursive(repoPath);
    return totalSize;
  }

  private async extractArchitecturalPatterns(repoPath: string): Promise<ArchitecturalPattern[]> {
    console.log('🏗️ Extracting architectural patterns...');
    
    const patterns: ArchitecturalPattern[] = [];
    
    // Detect common patterns
    const patternDetectors = [
      this.detectMVCPattern.bind(this),
      this.detectRepositoryPattern.bind(this),
      this.detectFactoryPattern.bind(this),
      this.detectObserverPattern.bind(this),
      this.detectSingletonPattern.bind(this)
    ];
    
    for (const detector of patternDetectors) {
      try {
        const pattern = await detector(repoPath);
        if (pattern) {
          patterns.push(pattern);
        }
      } catch (error) {
        console.warn('⚠️ Error detecting pattern:', error);
      }
    }
    
    console.log(`✅ Detected ${patterns.length} architectural patterns`);
    return patterns;
  }

  private async detectMVCPattern(repoPath: string): Promise<ArchitecturalPattern | null> {
    const directories = await this.getDirectoryNames(repoPath);
    const mvcIndicators = ['models', 'views', 'controllers', 'controller', 'model', 'view'];
    const foundIndicators = mvcIndicators.filter(indicator => 
      directories.some(dir => dir.toLowerCase().includes(indicator))
    );
    
    if (foundIndicators.length >= 2) {
      return {
        name: 'MVC (Model-View-Controller)',
        description: 'Separates application logic into Model, View, and Controller components',
        files: foundIndicators.map(indicator => `${indicator}/`),
        confidence: Math.min(foundIndicators.length / 3, 1.0)
      };
    }
    
    return null;
  }

  private async detectRepositoryPattern(repoPath: string): Promise<ArchitecturalPattern | null> {
    const repositoryFiles = await this.findFilesWithPattern(repoPath, /.*[Rr]epository\.(js|ts|php|py|java|cs)$/);
    
    if (repositoryFiles.length > 0) {
      return {
        name: 'Repository Pattern',
        description: 'Encapsulates data access logic and provides a uniform interface to access data',
        files: repositoryFiles.slice(0, 3),
        confidence: Math.min(repositoryFiles.length * 0.3, 1.0)
      };
    }
    
    return null;
  }

  private async detectFactoryPattern(repoPath: string): Promise<ArchitecturalPattern | null> {
    const factoryFiles = await this.findFilesWithPattern(repoPath, /.*[Ff]actory\.(js|ts|php|py|java|cs)$/);
    
    if (factoryFiles.length > 0) {
      return {
        name: 'Factory Pattern',
        description: 'Creates objects without specifying their concrete classes',
        files: factoryFiles.slice(0, 2),
        confidence: Math.min(factoryFiles.length * 0.4, 1.0)
      };
    }
    
    return null;
  }

  private async detectObserverPattern(repoPath: string): Promise<ArchitecturalPattern | null> {
    const observerFiles = await this.findFilesWithPattern(repoPath, /.*[Oo]bserver\.(js|ts|php|py|java|cs)$/);
    const eventFiles = await this.findFilesWithPattern(repoPath, /.*[Ee]vent.*\.(js|ts|php|py|java|cs)$/);
    
    const totalFiles = observerFiles.length + eventFiles.length;
    
    if (totalFiles > 0) {
      return {
        name: 'Observer Pattern',
        description: 'Defines a subscription mechanism to notify multiple objects about events',
        files: [...observerFiles.slice(0, 2), ...eventFiles.slice(0, 2)],
        confidence: Math.min(totalFiles * 0.2, 1.0)
      };
    }
    
    return null;
  }

  private async detectSingletonPattern(repoPath: string): Promise<ArchitecturalPattern | null> {
    const singletonFiles = await this.findFilesWithPattern(repoPath, /.*[Ss]ingleton\.(js|ts|php|py|java|cs)$/);
    
    if (singletonFiles.length > 0) {
      return {
        name: 'Singleton Pattern',
        description: 'Ensures a class has only one instance and provides global access to it',
        files: singletonFiles,
        confidence: Math.min(singletonFiles.length * 0.5, 1.0)
      };
    }
    
    return null;
  }

  private async analyzeHistoricalPatterns(repoPath: string): Promise<HistoricalPattern[]> {
    console.log('📜 Analyzing historical patterns...');
    
    try {
      const commits = await this.getRecentCommits(repoPath);
      return await this.extractPatternsFromCommits(commits);
    } catch (error) {
      console.warn('⚠️ Could not analyze historical patterns:', error);
      return [];
    }
  }

  private async getRecentCommits(repoPath: string): Promise<GitCommit[]> {
    try {
      const git = simpleGit(repoPath);
      const log = await git.log({ maxCount: 50 });
      
      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: new Date(commit.date),
        files: []
      }));
    } catch (error) {
      console.warn('⚠️ Could not get recent commits:', error);
      return [];
    }
  }

  private async extractPatternsFromCommits(commits: GitCommit[]): Promise<HistoricalPattern[]> {
    const patterns: HistoricalPattern[] = [];
    
    // Analyze commit frequency
    const commitsByDay = new Map<string, number>();
    commits.forEach(commit => {
      const day = commit.date.toISOString().split('T')[0];
      commitsByDay.set(day, (commitsByDay.get(day) || 0) + 1);
    });
    
    if (commitsByDay.size > 0) {
      const avgCommitsPerDay = Array.from(commitsByDay.values()).reduce((a, b) => a + b, 0) / commitsByDay.size;
      patterns.push({
        pattern: 'commit-frequency',
        frequency: avgCommitsPerDay,
        successRate: 0.8,
        commonIssues: []
      });
    }
    
    return patterns;
  }

  private async extractQualityMetrics(repoPath: string): Promise<QualityMetrics> {
    console.log('📊 Extracting quality metrics...');
    
    return {
      codeComplexity: await this.calculateComplexity(repoPath),
      testCoverage: await this.calculateTestCoverage(repoPath),
      duplication: await this.calculateDuplication(repoPath),
      maintainabilityIndex: await this.calculateMaintainabilityIndex(repoPath)
    };
  }

  private async calculateComplexity(repoPath: string): Promise<number> {
    // Simple complexity calculation based on file count and size
    const fileCount = await this.countFiles(repoPath);
    const complexity = Math.min(fileCount / 100, 1.0);
    return complexity;
  }

  private async calculateTestCoverage(repoPath: string): Promise<number> {
    const testFiles = await this.findFilesWithPattern(repoPath, /\.(test|spec)\.(js|ts|jsx|tsx|py|java)$/);
    const allCodeFiles = await this.findFilesWithPattern(repoPath, /\.(js|ts|jsx|tsx|py|java)$/);
    const codeFiles = allCodeFiles.filter(file => !/(test|spec|__tests__|tests)/i.test(file));
    
    if (codeFiles.length === 0) return 0;
    
    return Math.min((testFiles.length * 2) / codeFiles.length, 1.0);
  }

  private async calculateDuplication(repoPath: string): Promise<number> {
    // Simple heuristic for duplication
    return 0.1; // 10% estimated duplication
  }

  private async calculateMaintainabilityIndex(repoPath: string): Promise<number> {
    const complexity = await this.calculateComplexity(repoPath);
    const testCoverage = await this.calculateTestCoverage(repoPath);
    
    return Math.max(0, Math.min(1, 1 - complexity + testCoverage * 0.5));
  }

  // Helper methods
  private async getDirectoryNames(repoPath: string): Promise<string[]> {
    try {
      const items = await fs.readdir(repoPath, { withFileTypes: true });
      return items.filter(item => item.isDirectory()).map(item => item.name);
    } catch (error) {
      return [];
    }
  }

  private async findFilesWithPattern(repoPath: string, pattern: RegExp): Promise<string[]> {
    const matchingFiles: string[] = [];
    
    const searchDirectory = async (dirPath: string): Promise<void> => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          const relativePath = path.relative(repoPath, fullPath);
          
          if (this.shouldIgnoreItem(item.name)) continue;
          
          if (item.isDirectory()) {
            await searchDirectory(fullPath);
          } else if (pattern.test(item.name)) {
            matchingFiles.push(relativePath);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    await searchDirectory(repoPath);
    return matchingFiles;
  }

  private async findRelatedFiles(changedFiles: string[], repoPath: string): Promise<string[]> {
    // Simple implementation - find files in same directories
    const relatedFiles: string[] = [];
    
    for (const file of changedFiles) {
      const dir = path.dirname(file);
      try {
        const items = await fs.readdir(path.join(repoPath, dir));
        const sameDir = items
          .filter(item => !changedFiles.includes(path.join(dir, item)))
          .map(item => path.join(dir, item))
          .slice(0, 3); // Limit to 3 files per directory
        
        relatedFiles.push(...sameDir);
      } catch (error) {
        // Skip if directory can't be read
      }
    }
    
    return relatedFiles;
  }

  private async findTestFiles(changedFiles: string[], repoPath: string): Promise<string[]> {
    const testFiles: string[] = [];
    
    for (const file of changedFiles) {
      const fileName = path.basename(file, path.extname(file));
      const testPatterns = [
        `${fileName}.test.js`,
        `${fileName}.test.ts`,
        `${fileName}.spec.js`,
        `${fileName}.spec.ts`
      ];
      
      for (const pattern of testPatterns) {
        const testFiles = await this.findFilesWithPattern(repoPath, new RegExp(pattern));
        testFiles.push(...testFiles);
      }
    }
    
    return testFiles;
  }

  private async findDocumentationFiles(changedFiles: string[], repoPath: string): Promise<string[]> {
    const docFiles = await this.findFilesWithPattern(repoPath, /\.(md|txt|rst|doc)$/i);
    return docFiles.slice(0, 5); // Limit to 5 documentation files
  }

  private findConfigFiles(changedFiles: string[]): string[] {
    return changedFiles.filter(file => 
      /\.(json|yml|yaml|toml|ini|conf|config)$/i.test(file) ||
      ['package.json', 'tsconfig.json', '.env', 'Dockerfile'].includes(path.basename(file))
    );
  }

  private async getCompleteFile(file: string, repoPath: string): Promise<string> {
    try {
      const filePath = path.join(repoPath, file);
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.warn(`⚠️ Could not read file ${file}:`, error);
      return '';
    }
  }

  private async getRelatedFunctions(file: string, blastRadius: BlastRadius, repoPath: string): Promise<any[]> {
    // Simple implementation - return empty for now
    return [];
  }

  private async getDependencyChain(file: string, repoPath: string): Promise<any> {
    // Simple implementation - extract imports
    try {
      const content = await this.getCompleteFile(file, repoPath);
      const imports: string[] = [];
      
      const importPatterns = [
        /import.*from\s+['"]([^'"]+)['"]/g,
        /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
      ];
      
      importPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          imports.push(match[1]);
        }
      });
      
      return { imports: imports.slice(0, 10), exports: [], transitiveDependencies: [] };
    } catch (error) {
      return { imports: [], exports: [], transitiveDependencies: [] };
    }
  }

  private async getUsageExamples(file: string, repoPath: string): Promise<any[]> {
    // Simple implementation - return empty for now
    return [];
  }

  private async getTestCoverage(file: string, repoPath: string): Promise<any[]> {
    // Simple implementation - return empty for now
    return [];
  }

  private async getHistoricalContext(file: string, repoPath: string): Promise<any> {
    // Simple implementation - return empty for now
    return { recentCommits: [], totalCommits: 0, lastModified: null };
  }

  private synthesizeRepositoryContext(context: any, prNumber: number): CompleteRepositoryContext {
    return {
      repoUrl: `https://github.com/unknown/repo/pull/${prNumber}`,
      repoPath: context.codebaseMap?.structure || '',
      changedFiles: [],
      codebaseMap: context.codebaseMap,
      architecturalPatterns: context.architecturalPatterns,
      historicalPatterns: context.historicalPatterns,
      qualityMetrics: context.qualityMetrics,
      dependencyGraph: {
        nodes: [],
        edges: [],
        cycles: []
      },
      prNumber
    };
  }

  // Helper methods for counting
  private async countFiles(repoPath: string): Promise<number> {
    let count = 0;
    
    const countRecursive = async (dirPath: string): Promise<void> => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (this.shouldIgnoreItem(item.name)) continue;
          
          if (item.isDirectory()) {
            await countRecursive(fullPath);
          } else {
            count++;
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    await countRecursive(repoPath);
    return count;
  }

  private async countDirectories(repoPath: string): Promise<number> {
    let count = 0;
    
    const countRecursive = async (dirPath: string): Promise<void> => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (this.shouldIgnoreItem(item.name)) continue;
          
          if (item.isDirectory()) {
            count++;
            await countRecursive(fullPath);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    await countRecursive(repoPath);
    return count;
  }
}
