"use strict";
/**
 * Mock PR Data for Testing
 * Simulates real GitHub PR data without external API calls
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockLLMResponses = exports.mockContextualCode = exports.mockBlastRadius = exports.mockRepositoryData = exports.mockPRData = void 0;
exports.mockPRData = {
    url: 'https://github.com/test-org/test-repo/pull/123',
    number: 123,
    title: 'Add user profile email validation and update functionality',
    description: `
## Changes
- Added email validation utility function
- Enhanced UserProfile component with email update functionality
- Added proper TypeScript interfaces
- Improved loading state handling

## Testing
- Added unit tests for validation functions
- Tested email update flow
- Verified error handling

## Breaking Changes
None

## Related Issues
Fixes #456
  `.trim(),
    author: {
        login: 'developer123',
        id: 12345,
        avatar_url: 'https://github.com/developer123.png'
    },
    base: {
        ref: 'main',
        sha: 'abc123def456'
    },
    head: {
        ref: 'feature/email-validation',
        sha: 'def456abc123'
    },
    changedFiles: [
        'src/components/UserProfile.tsx',
        'src/utils/validation.ts',
        'src/api/userService.ts'
    ],
    additions: 45,
    deletions: 8,
    commits: [
        {
            sha: 'commit1abc',
            message: 'Add validation utility functions',
            author: {
                name: 'Developer Name',
                email: 'dev@example.com',
                date: '2024-01-15T10:30:00Z'
            }
        },
        {
            sha: 'commit2def',
            message: 'Enhance UserProfile with email update',
            author: {
                name: 'Developer Name',
                email: 'dev@example.com',
                date: '2024-01-15T11:45:00Z'
            }
        }
    ]
};
exports.mockRepositoryData = {
    owner: 'test-org',
    name: 'test-repo',
    fullName: 'test-org/test-repo',
    description: 'A test repository for PR analysis',
    language: 'TypeScript',
    framework: 'React',
    architecture: 'Component-based',
    structure: {
        'src/': {
            'components/': {
                'UserProfile.tsx': 'React component file',
                'Header.tsx': 'Header component',
                'Footer.tsx': 'Footer component'
            },
            'utils/': {
                'validation.ts': 'Validation utilities',
                'helpers.ts': 'Helper functions'
            },
            'api/': {
                'userService.ts': 'User API service',
                'authService.ts': 'Authentication service'
            },
            'types/': {
                'user.ts': 'User type definitions',
                'api.ts': 'API type definitions'
            }
        },
        'tests/': {
            'components/': 'Component tests',
            'utils/': 'Utility tests'
        },
        'package.json': 'Package configuration',
        'tsconfig.json': 'TypeScript configuration',
        'README.md': 'Project documentation'
    },
    dependencies: {
        'react': '^18.0.0',
        'typescript': '^5.0.0',
        '@types/react': '^18.0.0',
        'jest': '^29.0.0'
    },
    metrics: {
        linesOfCode: 2500,
        testCoverage: 85,
        complexity: 'medium',
        maintainabilityIndex: 78
    }
};
exports.mockBlastRadius = {
    directImpact: [
        'src/components/UserProfile.tsx',
        'src/utils/validation.ts',
        'src/api/userService.ts'
    ],
    indirectImpact: [
        'src/components/UserSettings.tsx', // Uses UserProfile
        'src/pages/ProfilePage.tsx', // Uses UserProfile
        'src/utils/helpers.ts', // Might use validation
        'tests/components/UserProfile.test.tsx'
    ],
    testImpact: [
        'tests/components/UserProfile.test.tsx',
        'tests/utils/validation.test.ts',
        'tests/api/userService.test.ts'
    ],
    documentationImpact: [
        'README.md',
        'docs/components.md',
        'docs/api.md'
    ],
    configurationImpact: [],
    migrationImpact: [] // Add missing property
};
exports.mockContextualCode = new Map([
    ['src/components/UserProfile.tsx', {
            completeFileContent: `// Full file content would be here
import React, { useState, useEffect } from 'react';

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  // Component implementation
  return <div>User Profile</div>;
};`,
            relatedFunctions: [
                'fetchUser',
                'updateUserEmail',
                'validateEmail'
            ],
            dependencyChain: [
                'src/utils/validation.ts',
                'src/api/userService.ts'
            ],
            usageExamples: [
                'src/pages/ProfilePage.tsx',
                'src/components/UserSettings.tsx'
            ],
            testCoverage: {
                covered: true,
                percentage: 90,
                testFiles: ['tests/components/UserProfile.test.tsx']
            },
            historicalContext: {
                lastModified: '2024-01-10T15:30:00Z',
                recentChanges: 3,
                bugHistory: []
            }
        }]
]);
exports.mockLLMResponses = {
    architectural: `
## Architectural Analysis

### Findings
- **Component Structure**: The UserProfile component follows React best practices with proper TypeScript interfaces
- **Separation of Concerns**: Good separation between validation logic, API calls, and UI components
- **State Management**: Uses local state appropriately for component-level data

### Issues
- **Loading State Bug**: Setting loading to false immediately after starting async operation
- **Error Handling**: Missing error boundaries and proper error state management

### Recommendations
- Fix the loading state logic to properly handle async operations
- Add error state management to the component
- Consider using a custom hook for user data fetching
  `,
    security: `
## Security Analysis

### Findings
- **Input Validation**: Good addition of email validation function
- **API Security**: PATCH request includes proper Content-Type header

### Issues
- **XSS Risk**: Direct rendering of user data without sanitization
- **CSRF Protection**: No CSRF token in API requests
- **Input Sanitization**: Email validation only checks format, not content safety

### Recommendations
- Add input sanitization for all user-provided data
- Implement CSRF protection for state-changing requests
- Add rate limiting for email update operations
  `,
    performance: `
## Performance Analysis

### Findings
- **React Hooks**: Proper use of useEffect with dependency array
- **State Updates**: Efficient state management with minimal re-renders

### Issues
- **Unnecessary Re-renders**: Component may re-render on every user prop change
- **API Calls**: No caching mechanism for user data
- **Bundle Size**: Adding validation utility increases bundle size

### Recommendations
- Implement React.memo for component optimization
- Add caching layer for user data
- Consider lazy loading for validation utilities
  `,
    testing: `
## Testing Analysis

### Findings
- **Test Coverage**: Good coverage for utility functions
- **Component Testing**: UserProfile component has comprehensive tests

### Issues
- **Missing Edge Cases**: No tests for error scenarios
- **Integration Tests**: Missing tests for API integration
- **Async Testing**: Loading state tests may have timing issues

### Recommendations
- Add error scenario tests for all functions
- Implement integration tests for user update flow
- Use proper async testing patterns with waitFor
  `
};
exports.default = {
    mockPRData: exports.mockPRData,
    mockRepositoryData: exports.mockRepositoryData,
    mockBlastRadius: exports.mockBlastRadius,
    mockContextualCode: exports.mockContextualCode,
    mockLLMResponses: exports.mockLLMResponses
};
