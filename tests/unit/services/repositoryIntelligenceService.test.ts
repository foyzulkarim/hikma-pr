/**
 * RepositoryIntelligenceService Tests
 * Tests repository analysis, context building, and blast radius calculation
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';

// Mock external dependencies
jest.mock('fs/promises');
jest.mock('simple-git');

import { RepositoryIntelligenceService } from '../../../src/services/repositoryIntelligenceService';

describe('RepositoryIntelligenceService', () => {
  let service: RepositoryIntelligenceService;
  let mockFs: jest.Mocked<typeof fs>;
  let mockGit: any;

  beforeEach(() => {
    service = new RepositoryIntelligenceService();
    mockFs = fs as jest.Mocked<typeof fs>;
    mockGit = {
      clone: jest.fn(),
      log: jest.fn(),
      show: jest.fn(),
      diff: jest.fn()
    };
    (simpleGit as jest.Mock).mockReturnValue(mockGit);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Repository Context Acquisition', () => {
    it('should acquire complete repository context', async () => {
      // Mock file system operations
      mockFs.readdir = jest.fn()
        .mockResolvedValueOnce(['src', 'tests', 'package.json'] as any)
        .mockResolvedValueOnce(['components', 'utils'] as any)
        .mockResolvedValueOnce(['UserProfile.tsx'] as any);

      mockFs.stat = jest.fn().mockImplementation((filePath: string) => {
        const isFile = filePath.includes('.');
        return Promise.resolve({
          isDirectory: () => !isFile,
          isFile: () => isFile,
          size: isFile ? 1000 : 0
        });
      });

      mockFs.readFile = jest.fn().mockImplementation((filePath: string) => {
        if (filePath.includes('package.json')) {
          return Promise.resolve(JSON.stringify({
            name: 'test-repo',
            dependencies: { react: '^18.0.0' }
          }));
        }
        return Promise.resolve('// Test file content');
      });

      // Mock git operations
      mockGit.clone.mockResolvedValue(undefined);
      mockGit.log.mockResolvedValue({
        all: [
          { hash: 'abc123', message: 'Test commit', date: '2024-01-01' }
        ]
      });

      const result = await service.acquireCompleteContext(
        'https://github.com/test/repo',
        123
      );

      expect(result).toBeDefined();
      expect(result.repositoryMetadata).toBeDefined();
      expect(result.repositoryMetadata.name).toBe('test-repo');
      expect(result.codebaseMap).toBeDefined();
      expect(result.architecturalPatterns).toBeDefined();
      expect(Array.isArray(result.architecturalPatterns)).toBe(true);
    });

    it('should handle repository cloning errors', async () => {
      mockGit.clone.mockRejectedValue(new Error('Clone failed'));

      await expect(
        service.acquireCompleteContext('https://github.com/invalid/repo', 123)
      ).rejects.toThrow();
    });
  });

  describe('Blast Radius Analysis', () => {
    it('should calculate direct and indirect impact', async () => {
      const changedFiles = ['src/components/UserProfile.tsx', 'src/utils/validation.ts'];
      
      // Mock file reading for dependency analysis
      mockFs.readFile = jest.fn().mockImplementation((filePath: string) => {
        if (filePath.includes('UserProfile.tsx')) {
          return Promise.resolve(`
            import { validateEmail } from '../utils/validation';
            import React from 'react';
            export const UserProfile = () => <div>Profile</div>;
          `);
        } else if (filePath.includes('validation.ts')) {
          return Promise.resolve(`
            export const validateEmail = (email: string) => /^[^@]+@[^@]+$/.test(email);
          `);
        }
        return Promise.resolve('// Other file content');
      });

      // Mock directory traversal
      mockFs.readdir = jest.fn()
        .mockResolvedValue(['src', 'tests'] as any);

      mockFs.stat = jest.fn().mockResolvedValue({
        isDirectory: () => true,
        isFile: () => false
      });

      const result = await service.buildBlastRadius(changedFiles, '/tmp/test-repo');

      expect(result).toBeDefined();
      expect(result.directImpact).toContain('src/components/UserProfile.tsx');
      expect(result.directImpact).toContain('src/utils/validation.ts');
      expect(Array.isArray(result.indirectImpact)).toBe(true);
      expect(Array.isArray(result.testImpact)).toBe(true);
    });

    it('should handle files with no dependencies', async () => {
      const changedFiles = ['README.md'];
      
      mockFs.readFile = jest.fn().mockResolvedValue('# Test Repository\nDocumentation content');
      mockFs.readdir = jest.fn().mockResolvedValue([] as any);

      const result = await service.buildBlastRadius(changedFiles, '/tmp/test-repo');

      expect(result.directImpact).toContain('README.md');
      expect(result.indirectImpact).toHaveLength(0);
    });
  });

  describe('Architectural Pattern Detection', () => {
    it('should detect React component patterns', async () => {
      // Mock file system for React project
      mockFs.readdir = jest.fn()
        .mockResolvedValueOnce(['src'] as any)
        .mockResolvedValueOnce(['components'] as any)
        .mockResolvedValueOnce(['UserProfile.tsx', 'Header.tsx'] as any);

      mockFs.stat = jest.fn().mockImplementation((filePath: string) => ({
        isDirectory: () => !filePath.includes('.'),
        isFile: () => filePath.includes('.'),
        size: 1000
      }));

      mockFs.readFile = jest.fn().mockResolvedValue(`
        import React, { useState, useEffect } from 'react';
        
        interface Props {
          userId: string;
        }
        
        export const UserProfile: React.FC<Props> = ({ userId }) => {
          const [user, setUser] = useState(null);
          return <div>Profile</div>;
        };
      `);

      const patterns = await service.extractArchitecturalPatterns('/tmp/test-repo');

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
      
      const reactPattern = patterns.find(p => p.name.toLowerCase().includes('react'));
      expect(reactPattern).toBeDefined();
      expect(reactPattern?.confidence).toBeGreaterThan(0);
    });

    it('should detect TypeScript patterns', async () => {
      mockFs.readdir = jest.fn()
        .mockResolvedValueOnce(['src'] as any)
        .mockResolvedValueOnce(['types'] as any)
        .mockResolvedValueOnce(['user.ts'] as any);

      mockFs.stat = jest.fn().mockImplementation((filePath: string) => ({
        isDirectory: () => !filePath.includes('.'),
        isFile: () => filePath.includes('.'),
        size: 500
      }));

      mockFs.readFile = jest.fn().mockResolvedValue(`
        interface User {
          id: string;
          email: string;
        }
        
        type UserAction = 'create' | 'update' | 'delete';
        
        export const validateUser = (user: User): boolean => {
          return user.id && user.email;
        };
      `);

      const patterns = await service.extractArchitecturalPatterns('/tmp/test-repo');

      const tsPattern = patterns.find(p => p.name.toLowerCase().includes('typescript'));
      expect(tsPattern).toBeDefined();
    });
  });

  describe('Quality Metrics Extraction', () => {
    it('should calculate basic quality metrics', async () => {
      // Mock package.json
      mockFs.readFile = jest.fn().mockImplementation((filePath: string) => {
        if (filePath.includes('package.json')) {
          return Promise.resolve(JSON.stringify({
            scripts: { test: 'jest' },
            dependencies: { react: '^18.0.0' },
            devDependencies: { jest: '^29.0.0' }
          }));
        }
        return Promise.resolve('// Sample code\nconst x = 1;\nfunction test() { return x; }');
      });

      // Mock directory structure
      mockFs.readdir = jest.fn()
        .mockResolvedValueOnce(['src', 'tests', 'package.json'] as any)
        .mockResolvedValueOnce(['components'] as any)
        .mockResolvedValueOnce(['UserProfile.tsx'] as any)
        .mockResolvedValueOnce(['components'] as any)
        .mockResolvedValueOnce(['UserProfile.test.tsx'] as any);

      mockFs.stat = jest.fn().mockImplementation((filePath: string) => ({
        isDirectory: () => !filePath.includes('.'),
        isFile: () => filePath.includes('.'),
        size: 1000
      }));

      const metrics = await service.extractQualityMetrics('/tmp/test-repo');

      expect(metrics).toBeDefined();
      expect(metrics.testCoverage).toBeDefined();
      expect(typeof metrics.testCoverage).toBe('number');
      expect(metrics.testCoverage).toBeGreaterThanOrEqual(0);
      expect(metrics.testCoverage).toBeLessThanOrEqual(100);
    });
  });

  describe('Contextual Code Extraction', () => {
    it('should extract complete context for changed files', async () => {
      const changedFiles = ['src/components/UserProfile.tsx'];
      const mockBlastRadius = {
        directImpact: ['src/components/UserProfile.tsx'],
        indirectImpact: ['src/pages/ProfilePage.tsx'],
        testImpact: ['tests/components/UserProfile.test.tsx'],
        documentationImpact: [],
        configurationImpact: [],
        migrationImpact: []
      };

      mockFs.readFile = jest.fn().mockImplementation((filePath: string) => {
        if (filePath.includes('UserProfile.tsx')) {
          return Promise.resolve(`
            import React, { useState } from 'react';
            export const UserProfile = () => {
              const [user, setUser] = useState(null);
              return <div>Profile: {user?.name}</div>;
            };
          `);
        }
        return Promise.resolve('// Related file content');
      });

      // Mock git operations for historical context
      mockGit.log = jest.fn().mockResolvedValue({
        all: [
          { hash: 'abc123', message: 'Update UserProfile', date: '2024-01-01' }
        ]
      });

      const contextualCode = await service.extractContextualCode(
        changedFiles,
        mockBlastRadius,
        '/tmp/test-repo'
      );

      expect(contextualCode).toBeDefined();
      expect(contextualCode.has('src/components/UserProfile.tsx')).toBe(true);
      
      const fileContext = contextualCode.get('src/components/UserProfile.tsx');
      expect(fileContext).toBeDefined();
      expect(fileContext?.completeFileContent).toContain('UserProfile');
      expect(Array.isArray(fileContext?.relatedFunctions)).toBe(true);
      expect(Array.isArray(fileContext?.dependencyChain)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      mockFs.readdir = jest.fn().mockRejectedValue(new Error('Permission denied'));

      await expect(
        service.buildCodebaseMap('/invalid/path')
      ).rejects.toThrow();
    });

    it('should handle git errors gracefully', async () => {
      mockGit.clone.mockRejectedValue(new Error('Git clone failed'));

      await expect(
        service.acquireCompleteContext('https://invalid-url', 123)
      ).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should complete analysis within reasonable time', async () => {
      // Mock minimal file system
      mockFs.readdir = jest.fn().mockResolvedValue(['package.json'] as any);
      mockFs.stat = jest.fn().mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
        size: 100
      });
      mockFs.readFile = jest.fn().mockResolvedValue('{}');
      mockGit.clone.mockResolvedValue(undefined);

      const startTime = Date.now();
      await service.buildCodebaseMap('/tmp/test-repo');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second with mocks
    });
  });
});
