"use strict";
/**
 * Test Utilities and Helpers
 * Common functions for testing Hikma-PR components
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
exports.assertions = exports.PerformanceMeasurer = exports.MockFileSystem = void 0;
exports.createMockPRContext = createMockPRContext;
exports.createMockRepositoryContext = createMockRepositoryContext;
exports.readMockPRDiff = readMockPRDiff;
exports.createTempDir = createTempDir;
exports.cleanupTempDir = cleanupTempDir;
exports.waitFor = waitFor;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const mockPRData_1 = require("../fixtures/mockPRData");
/**
 * Create a mock EnhancedPRContext for testing
 */
function createMockPRContext(overrides) {
    const defaultContext = {
        repositoryMetadata: {
            name: mockPRData_1.mockRepositoryData.name,
            language: mockPRData_1.mockRepositoryData.language,
            framework: mockPRData_1.mockRepositoryData.framework,
            architecture: mockPRData_1.mockRepositoryData.architecture,
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
            recentCommits: mockPRData_1.mockPRData.commits,
            changeFrequency: 'weekly',
            bugHistory: [],
            performanceHistory: []
        },
        blastRadius: mockPRData_1.mockBlastRadius,
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
    return Object.assign(Object.assign({}, defaultContext), overrides);
}
/**
 * Create a mock CompleteRepositoryContext for testing
 */
function createMockRepositoryContext(overrides) {
    const defaultContext = {
        repoPath: '/tmp/test-repo',
        changedFiles: mockPRData_1.mockPRData.changedFiles,
        repositoryMetadata: {
            owner: mockPRData_1.mockRepositoryData.owner,
            name: mockPRData_1.mockRepositoryData.name,
            fullName: mockPRData_1.mockRepositoryData.fullName,
            primaryLanguage: mockPRData_1.mockRepositoryData.language,
            framework: mockPRData_1.mockRepositoryData.framework,
            architecture: mockPRData_1.mockRepositoryData.architecture,
            description: mockPRData_1.mockRepositoryData.description
        },
        codebaseMap: {
            structure: mockPRData_1.mockRepositoryData.structure,
            fileTypes: {
                '.tsx': 15,
                '.ts': 25,
                '.json': 5,
                '.md': 3
            },
            totalFiles: 48,
            linesOfCode: mockPRData_1.mockRepositoryData.metrics.linesOfCode
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
            testCoverage: mockPRData_1.mockRepositoryData.metrics.testCoverage,
            complexity: mockPRData_1.mockRepositoryData.metrics.complexity,
            maintainabilityIndex: mockPRData_1.mockRepositoryData.metrics.maintainabilityIndex,
            technicalDebt: 'low'
        }
    };
    return Object.assign(Object.assign({}, defaultContext), overrides);
}
/**
 * Read mock PR diff file
 */
function readMockPRDiff() {
    return __awaiter(this, void 0, void 0, function* () {
        const diffPath = path_1.default.join(__dirname, '../fixtures/samplePR.diff');
        return yield promises_1.default.readFile(diffPath, 'utf-8');
    });
}
/**
 * Create a temporary directory for testing
 */
function createTempDir() {
    return __awaiter(this, arguments, void 0, function* (prefix = 'hikma-test') {
        const tempDir = path_1.default.join('/tmp', `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        yield promises_1.default.mkdir(tempDir, { recursive: true });
        return tempDir;
    });
}
/**
 * Clean up temporary directory
 */
function cleanupTempDir(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield promises_1.default.rm(dirPath, { recursive: true, force: true });
        }
        catch (error) {
            // Ignore cleanup errors in tests
            console.warn(`Failed to cleanup temp dir ${dirPath}:`, error);
        }
    });
}
/**
 * Wait for a condition to be true (useful for async testing)
 */
function waitFor(condition_1) {
    return __awaiter(this, arguments, void 0, function* (condition, timeout = 5000, interval = 100) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            if (yield condition()) {
                return;
            }
            yield new Promise(resolve => setTimeout(resolve, interval));
        }
        throw new Error(`Condition not met within ${timeout}ms`);
    });
}
/**
 * Mock file system operations
 */
class MockFileSystem {
    constructor() {
        this.files = new Map();
        this.directories = new Set();
    }
    writeFile(filePath, content) {
        this.files.set(filePath, content);
        // Add parent directories
        const dir = path_1.default.dirname(filePath);
        this.directories.add(dir);
    }
    readFile(filePath) {
        const content = this.files.get(filePath);
        if (content === undefined) {
            throw new Error(`File not found: ${filePath}`);
        }
        return content;
    }
    exists(filePath) {
        return this.files.has(filePath) || this.directories.has(filePath);
    }
    listFiles(dirPath) {
        return Array.from(this.files.keys())
            .filter(filePath => filePath.startsWith(dirPath))
            .map(filePath => path_1.default.relative(dirPath, filePath));
    }
    clear() {
        this.files.clear();
        this.directories.clear();
    }
    getFileCount() {
        return this.files.size;
    }
}
exports.MockFileSystem = MockFileSystem;
/**
 * Performance measurement utility
 */
class PerformanceMeasurer {
    constructor() {
        this.startTime = 0;
        this.measurements = new Map();
    }
    start() {
        this.startTime = Date.now();
    }
    end(label) {
        const duration = Date.now() - this.startTime;
        if (!this.measurements.has(label)) {
            this.measurements.set(label, []);
        }
        this.measurements.get(label).push(duration);
        return duration;
    }
    getAverage(label) {
        const times = this.measurements.get(label) || [];
        if (times.length === 0)
            return 0;
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }
    getStats(label) {
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
    reset() {
        this.measurements.clear();
    }
}
exports.PerformanceMeasurer = PerformanceMeasurer;
/**
 * Assertion helpers for testing
 */
exports.assertions = {
    /**
     * Assert that an object has the expected structure
     */
    hasStructure(obj, expectedKeys) {
        const actualKeys = Object.keys(obj);
        const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key));
        if (missingKeys.length > 0) {
            throw new Error(`Missing keys: ${missingKeys.join(', ')}`);
        }
    },
    /**
     * Assert that an array contains items matching a condition
     */
    arrayContains(array, condition, message) {
        const hasMatch = array.some(condition);
        if (!hasMatch) {
            throw new Error(message || 'Array does not contain expected item');
        }
    },
    /**
     * Assert that a value is within a range
     */
    inRange(value, min, max, message) {
        if (value < min || value > max) {
            throw new Error(message || `Value ${value} is not in range [${min}, ${max}]`);
        }
    },
    /**
     * Assert that an async function completes within a time limit
     */
    completesWithin(asyncFn, timeoutMs, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(message || `Operation timed out after ${timeoutMs}ms`)), timeoutMs);
            });
            return Promise.race([asyncFn(), timeoutPromise]);
        });
    }
};
exports.default = {
    createMockPRContext,
    createMockRepositoryContext,
    readMockPRDiff,
    createTempDir,
    cleanupTempDir,
    waitFor,
    MockFileSystem,
    PerformanceMeasurer,
    assertions: exports.assertions
};
