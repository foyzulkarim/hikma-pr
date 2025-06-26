/**
 * Test Utilities and Helpers
 * Common functions for testing Hikma-PR components
 */

import fs from 'fs/promises';
import path from 'path';
import { 
  EnhancedPRContext, 
  CompleteRepositoryContext,
  BlastRadius,
  ContextualCodeMap 
} from '../../src/types/analysis';
import { 
  mockPRData, 
  mockRepositoryData, 
  mockBlastRadius, 
  mockContextualCode 
} from '../fixtures/mockPRData';

/**
 * Create a mock EnhancedPRContext for testing
 */
export function createMockPRContext(overrides?: Partial<EnhancedPRContext>): EnhancedPRContext {
  const defaultContext: EnhancedPRContext = {
    repositoryMetadata: {
      name: mockRepositoryData.name,
      language: mockRepositoryData.language,
      framework: mockRepositoryData.framework,
      architecture: mockRepositoryData.architecture,
      size: {
        files: 48,
        lines: 2500,
        bytes: 125000
      }
    },
    architecturalPatterns: [
      {
        name: 'Component-based Architecture',
        confidence: 0.9,
        description: 'React-based component architecture'
      }
    ],
    completeFiles: new Map([
      ['src/components/UserProfile.tsx', 'import React from "react"; export const UserProfile = () => <div>Profile</div>;'],
      ['src/utils/validation.ts', 'export const validateEmail = (email: string) => /^[^@]+@[^@]+$/.test(email);']
    ]),
    historicalContext: {
      recentCommits: mockPRData.commits,
      changeFrequency: 'weekly',
      bugHistory: [],
      performanceHistory: []
    },
    blastRadius: mockBlastRadius,
    changeClassification: {
      type: 'feature',
      scope: 'module',
      risk: 'low'
    },
    semanticAnalysis: {
      complexity: 'medium',
      patterns: ['React Component', 'TypeScript Interface'],
      dependencies: ['react', 'typescript']
    }
  };

  return { ...defaultContext, ...overrides };
}

/**
 * Create a mock CompleteRepositoryContext for testing
 */
export function createMockRepositoryContext(overrides?: Partial<CompleteRepositoryContext>): CompleteRepositoryContext {
  const defaultContext: CompleteRepositoryContext = {
    repoPath: '/tmp/test-repo',
    changedFiles: mockPRData.changedFiles,
    repositoryMetadata: {
      owner: mockRepositoryData.owner,
      name: mockRepositoryData.name,
      fullName: mockRepositoryData.fullName,
      primaryLanguage: mockRepositoryData.language,
      framework: mockRepositoryData.framework,
      architecture: mockRepositoryData.architecture,
      description: mockRepositoryData.description
    },
    codebaseMap: {
      structure: mockRepositoryData.structure,
      fileTypes: {
        '.tsx': 15,
        '.ts': 25,
        '.json': 5,
        '.md': 3
      },
      totalFiles: 48,
      linesOfCode: mockRepositoryData.metrics.linesOfCode
    },
    architecturalPatterns: [
      {
        name: 'Component-based Architecture',
        confidence: 0.9,
        evidence: ['React components', 'TypeScript interfaces'],
        description: 'React-based component architecture'
      }
    ],
    historicalPatterns: [
      {
        pattern: 'Regular feature additions',
        frequency: 'weekly',
        confidence: 0.8,
        examples: ['User profile updates', 'API enhancements']
      }
    ],
    qualityMetrics: {
      testCoverage: mockRepositoryData.metrics.testCoverage,
      complexity: mockRepositoryData.metrics.complexity,
      maintainabilityIndex: mockRepositoryData.metrics.maintainabilityIndex,
      technicalDebt: 'low'
    }
  };

  return { ...defaultContext, ...overrides };
}

/**
 * Read mock PR diff file
 */
export async function readMockPRDiff(): Promise<string> {
  const diffPath = path.join(__dirname, '../fixtures/samplePR.diff');
  return await fs.readFile(diffPath, 'utf-8');
}

/**
 * Create a temporary directory for testing
 */
export async function createTempDir(prefix: string = 'hikma-test'): Promise<string> {
  const tempDir = path.join('/tmp', `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up temporary directory
 */
export async function cleanupTempDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors in tests
    console.warn(`Failed to cleanup temp dir ${dirPath}:`, error);
  }
}

/**
 * Wait for a condition to be true (useful for async testing)
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Mock file system operations
 */
export class MockFileSystem {
  private files: Map<string, string> = new Map();
  private directories: Set<string> = new Set();

  writeFile(filePath: string, content: string): void {
    this.files.set(filePath, content);
    // Add parent directories
    const dir = path.dirname(filePath);
    this.directories.add(dir);
  }

  readFile(filePath: string): string {
    const content = this.files.get(filePath);
    if (content === undefined) {
      throw new Error(`File not found: ${filePath}`);
    }
    return content;
  }

  exists(filePath: string): boolean {
    return this.files.has(filePath) || this.directories.has(filePath);
  }

  listFiles(dirPath: string): string[] {
    return Array.from(this.files.keys())
      .filter(filePath => filePath.startsWith(dirPath))
      .map(filePath => path.relative(dirPath, filePath));
  }

  clear(): void {
    this.files.clear();
    this.directories.clear();
  }

  getFileCount(): number {
    return this.files.size;
  }
}

/**
 * Performance measurement utility
 */
export class PerformanceMeasurer {
  private startTime: number = 0;
  private measurements: Map<string, number[]> = new Map();

  start(): void {
    this.startTime = Date.now();
  }

  end(label: string): number {
    const duration = Date.now() - this.startTime;
    
    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    this.measurements.get(label)!.push(duration);
    
    return duration;
  }

  getAverage(label: string): number {
    const times = this.measurements.get(label) || [];
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getStats(label: string): { count: number; avg: number; min: number; max: number } {
    const times = this.measurements.get(label) || [];
    if (times.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }
    
    return {
      count: times.length,
      avg: times.reduce((sum, time) => sum + time, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    };
  }

  reset(): void {
    this.measurements.clear();
  }
}

/**
 * Assertion helpers for testing
 */
export const assertions = {
  /**
   * Assert that an object has the expected structure
   */
  hasStructure(obj: any, expectedKeys: string[]): void {
    const actualKeys = Object.keys(obj);
    const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key));
    
    if (missingKeys.length > 0) {
      throw new Error(`Missing keys: ${missingKeys.join(', ')}`);
    }
  },

  /**
   * Assert that an array contains items matching a condition
   */
  arrayContains<T>(array: T[], condition: (item: T) => boolean, message?: string): void {
    const hasMatch = array.some(condition);
    if (!hasMatch) {
      throw new Error(message || 'Array does not contain expected item');
    }
  },

  /**
   * Assert that a value is within a range
   */
  inRange(value: number, min: number, max: number, message?: string): void {
    if (value < min || value > max) {
      throw new Error(message || `Value ${value} is not in range [${min}, ${max}]`);
    }
  },

  /**
   * Assert that an async function completes within a time limit
   */
  async completesWithin<T>(
    asyncFn: () => Promise<T>, 
    timeoutMs: number, 
    message?: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(message || `Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([asyncFn(), timeoutPromise]);
  }
};

export default {
  createMockPRContext,
  createMockRepositoryContext,
  readMockPRDiff,
  createTempDir,
  cleanupTempDir,
  waitFor,
  MockFileSystem,
  PerformanceMeasurer,
  assertions
};
