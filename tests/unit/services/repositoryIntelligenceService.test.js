"use strict";
/**
 * RepositoryIntelligenceService Tests
 * Tests repository analysis, context building, and blast radius calculation
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const promises_1 = __importDefault(require("fs/promises"));
const simple_git_1 = __importDefault(require("simple-git"));
// Mock external dependencies
globals_1.jest.mock('fs/promises');
globals_1.jest.mock('simple-git');
const repositoryIntelligenceService_1 = require("../../../src/services/repositoryIntelligenceService");
(0, globals_1.describe)('RepositoryIntelligenceService', () => {
    let service;
    let mockFs;
    let mockGit;
    (0, globals_1.beforeEach)(() => {
        service = new repositoryIntelligenceService_1.RepositoryIntelligenceService();
        mockFs = promises_1.default;
        mockGit = {
            clone: globals_1.jest.fn(),
            log: globals_1.jest.fn(),
            show: globals_1.jest.fn(),
            diff: globals_1.jest.fn()
        };
        simple_git_1.default.mockReturnValue(mockGit);
    });
    (0, globals_1.afterEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)('Repository Context Acquisition', () => {
        (0, globals_1.it)('should acquire complete repository context', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock file system operations
            mockFs.readdir = globals_1.jest.fn()
                .mockResolvedValueOnce(['src', 'tests', 'package.json'])
                .mockResolvedValueOnce(['components', 'utils'])
                .mockResolvedValueOnce(['UserProfile.tsx']);
            mockFs.stat = globals_1.jest.fn().mockImplementation((filePath) => {
                const isFile = filePath.includes('.');
                return Promise.resolve({
                    isDirectory: () => !isFile,
                    isFile: () => isFile,
                    size: isFile ? 1000 : 0
                });
            });
            mockFs.readFile = globals_1.jest.fn().mockImplementation((filePath) => {
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
            const result = yield service.acquireCompleteContext('https://github.com/test/repo', 123);
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.repositoryMetadata).toBeDefined();
            (0, globals_1.expect)(result.repositoryMetadata.name).toBe('test-repo');
            (0, globals_1.expect)(result.codebaseMap).toBeDefined();
            (0, globals_1.expect)(result.architecturalPatterns).toBeDefined();
            (0, globals_1.expect)(Array.isArray(result.architecturalPatterns)).toBe(true);
        }));
        (0, globals_1.it)('should handle repository cloning errors', () => __awaiter(void 0, void 0, void 0, function* () {
            mockGit.clone.mockRejectedValue(new Error('Clone failed'));
            yield (0, globals_1.expect)(service.acquireCompleteContext('https://github.com/invalid/repo', 123)).rejects.toThrow();
        }));
    });
    (0, globals_1.describe)('Blast Radius Analysis', () => {
        (0, globals_1.it)('should calculate direct and indirect impact', () => __awaiter(void 0, void 0, void 0, function* () {
            const changedFiles = ['src/components/UserProfile.tsx', 'src/utils/validation.ts'];
            // Mock file reading for dependency analysis
            mockFs.readFile = globals_1.jest.fn().mockImplementation((filePath) => {
                if (filePath.includes('UserProfile.tsx')) {
                    return Promise.resolve(`
            import { validateEmail } from '../utils/validation';
            import React from 'react';
            export const UserProfile = () => <div>Profile</div>;
          `);
                }
                else if (filePath.includes('validation.ts')) {
                    return Promise.resolve(`
            export const validateEmail = (email: string) => /^[^@]+@[^@]+$/.test(email);
          `);
                }
                return Promise.resolve('// Other file content');
            });
            // Mock directory traversal
            mockFs.readdir = globals_1.jest.fn()
                .mockResolvedValue(['src', 'tests']);
            mockFs.stat = globals_1.jest.fn().mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false
            });
            const result = yield service.buildBlastRadius(changedFiles, '/tmp/test-repo');
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.directImpact).toContain('src/components/UserProfile.tsx');
            (0, globals_1.expect)(result.directImpact).toContain('src/utils/validation.ts');
            (0, globals_1.expect)(Array.isArray(result.indirectImpact)).toBe(true);
            (0, globals_1.expect)(Array.isArray(result.testImpact)).toBe(true);
        }));
        (0, globals_1.it)('should handle files with no dependencies', () => __awaiter(void 0, void 0, void 0, function* () {
            const changedFiles = ['README.md'];
            mockFs.readFile = globals_1.jest.fn().mockResolvedValue('# Test Repository\nDocumentation content');
            mockFs.readdir = globals_1.jest.fn().mockResolvedValue([]);
            const result = yield service.buildBlastRadius(changedFiles, '/tmp/test-repo');
            (0, globals_1.expect)(result.directImpact).toContain('README.md');
            (0, globals_1.expect)(result.indirectImpact).toHaveLength(0);
        }));
    });
    (0, globals_1.describe)('Architectural Pattern Detection', () => {
        (0, globals_1.it)('should detect React component patterns', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock file system for React project
            mockFs.readdir = globals_1.jest.fn()
                .mockResolvedValueOnce(['src'])
                .mockResolvedValueOnce(['components'])
                .mockResolvedValueOnce(['UserProfile.tsx', 'Header.tsx']);
            mockFs.stat = globals_1.jest.fn().mockImplementation((filePath) => ({
                isDirectory: () => !filePath.includes('.'),
                isFile: () => filePath.includes('.'),
                size: 1000
            }));
            mockFs.readFile = globals_1.jest.fn().mockResolvedValue(`
        import React, { useState, useEffect } from 'react';
        
        interface Props {
          userId: string;
        }
        
        export const UserProfile: React.FC<Props> = ({ userId }) => {
          const [user, setUser] = useState(null);
          return <div>Profile</div>;
        };
      `);
            const patterns = yield service.extractArchitecturalPatterns('/tmp/test-repo');
            (0, globals_1.expect)(Array.isArray(patterns)).toBe(true);
            (0, globals_1.expect)(patterns.length).toBeGreaterThan(0);
            const reactPattern = patterns.find(p => p.name.toLowerCase().includes('react'));
            (0, globals_1.expect)(reactPattern).toBeDefined();
            (0, globals_1.expect)(reactPattern === null || reactPattern === void 0 ? void 0 : reactPattern.confidence).toBeGreaterThan(0);
        }));
        (0, globals_1.it)('should detect TypeScript patterns', () => __awaiter(void 0, void 0, void 0, function* () {
            mockFs.readdir = globals_1.jest.fn()
                .mockResolvedValueOnce(['src'])
                .mockResolvedValueOnce(['types'])
                .mockResolvedValueOnce(['user.ts']);
            mockFs.stat = globals_1.jest.fn().mockImplementation((filePath) => ({
                isDirectory: () => !filePath.includes('.'),
                isFile: () => filePath.includes('.'),
                size: 500
            }));
            mockFs.readFile = globals_1.jest.fn().mockResolvedValue(`
        interface User {
          id: string;
          email: string;
        }
        
        type UserAction = 'create' | 'update' | 'delete';
        
        export const validateUser = (user: User): boolean => {
          return user.id && user.email;
        };
      `);
            const patterns = yield service.extractArchitecturalPatterns('/tmp/test-repo');
            const tsPattern = patterns.find(p => p.name.toLowerCase().includes('typescript'));
            (0, globals_1.expect)(tsPattern).toBeDefined();
        }));
    });
    (0, globals_1.describe)('Quality Metrics Extraction', () => {
        (0, globals_1.it)('should calculate basic quality metrics', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock package.json
            mockFs.readFile = globals_1.jest.fn().mockImplementation((filePath) => {
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
            mockFs.readdir = globals_1.jest.fn()
                .mockResolvedValueOnce(['src', 'tests', 'package.json'])
                .mockResolvedValueOnce(['components'])
                .mockResolvedValueOnce(['UserProfile.tsx'])
                .mockResolvedValueOnce(['components'])
                .mockResolvedValueOnce(['UserProfile.test.tsx']);
            mockFs.stat = globals_1.jest.fn().mockImplementation((filePath) => ({
                isDirectory: () => !filePath.includes('.'),
                isFile: () => filePath.includes('.'),
                size: 1000
            }));
            const metrics = yield service.extractQualityMetrics('/tmp/test-repo');
            (0, globals_1.expect)(metrics).toBeDefined();
            (0, globals_1.expect)(metrics.testCoverage).toBeDefined();
            (0, globals_1.expect)(typeof metrics.testCoverage).toBe('number');
            (0, globals_1.expect)(metrics.testCoverage).toBeGreaterThanOrEqual(0);
            (0, globals_1.expect)(metrics.testCoverage).toBeLessThanOrEqual(100);
        }));
    });
    (0, globals_1.describe)('Contextual Code Extraction', () => {
        (0, globals_1.it)('should extract complete context for changed files', () => __awaiter(void 0, void 0, void 0, function* () {
            const changedFiles = ['src/components/UserProfile.tsx'];
            const mockBlastRadius = {
                directImpact: ['src/components/UserProfile.tsx'],
                indirectImpact: ['src/pages/ProfilePage.tsx'],
                testImpact: ['tests/components/UserProfile.test.tsx'],
                documentationImpact: [],
                configurationImpact: [],
                migrationImpact: []
            };
            mockFs.readFile = globals_1.jest.fn().mockImplementation((filePath) => {
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
            mockGit.log = globals_1.jest.fn().mockResolvedValue({
                all: [
                    { hash: 'abc123', message: 'Update UserProfile', date: '2024-01-01' }
                ]
            });
            const contextualCode = yield service.extractContextualCode(changedFiles, mockBlastRadius, '/tmp/test-repo');
            (0, globals_1.expect)(contextualCode).toBeDefined();
            (0, globals_1.expect)(contextualCode.has('src/components/UserProfile.tsx')).toBe(true);
            const fileContext = contextualCode.get('src/components/UserProfile.tsx');
            (0, globals_1.expect)(fileContext).toBeDefined();
            (0, globals_1.expect)(fileContext === null || fileContext === void 0 ? void 0 : fileContext.completeFileContent).toContain('UserProfile');
            (0, globals_1.expect)(Array.isArray(fileContext === null || fileContext === void 0 ? void 0 : fileContext.relatedFunctions)).toBe(true);
            (0, globals_1.expect)(Array.isArray(fileContext === null || fileContext === void 0 ? void 0 : fileContext.dependencyChain)).toBe(true);
        }));
    });
    (0, globals_1.describe)('Error Handling', () => {
        (0, globals_1.it)('should handle file system errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockFs.readdir = globals_1.jest.fn().mockRejectedValue(new Error('Permission denied'));
            yield (0, globals_1.expect)(service.buildCodebaseMap('/invalid/path')).rejects.toThrow();
        }));
        (0, globals_1.it)('should handle git errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockGit.clone.mockRejectedValue(new Error('Git clone failed'));
            yield (0, globals_1.expect)(service.acquireCompleteContext('https://invalid-url', 123)).rejects.toThrow();
        }));
    });
    (0, globals_1.describe)('Performance', () => {
        (0, globals_1.it)('should complete analysis within reasonable time', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock minimal file system
            mockFs.readdir = globals_1.jest.fn().mockResolvedValue(['package.json']);
            mockFs.stat = globals_1.jest.fn().mockResolvedValue({
                isDirectory: () => false,
                isFile: () => true,
                size: 100
            });
            mockFs.readFile = globals_1.jest.fn().mockResolvedValue('{}');
            mockGit.clone.mockResolvedValue(undefined);
            const startTime = Date.now();
            yield service.buildCodebaseMap('/tmp/test-repo');
            const duration = Date.now() - startTime;
            (0, globals_1.expect)(duration).toBeLessThan(1000); // Should complete within 1 second with mocks
        }));
    });
});
