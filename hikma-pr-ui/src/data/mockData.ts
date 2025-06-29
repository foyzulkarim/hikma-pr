export interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  title: string;
  description: string;
  file: string;
  line: number;
  plugin: string;
  recommendation: string;
}

export interface Review {
  id: string;
  title: string;
  repository: string;
  author: string;
  date: string;
  url: string;
  status: 'completed' | 'in-progress' | 'failed';
  qualityScore: number;
  findings: Finding[];
  filesAnalyzed: number;
  linesOfCode: number;
  linesAdded: number;
  linesRemoved: number;
  semantic: {
    summary: string;
    impact: string;
    suggestions: string[];
  };
  quality: {
    security: number;
    performance: number;
    maintainability: number;
    standards: number;
  };
  analysisPerformance: {
    llmProvider: string;
    modelUsed: string;
    startTime: string;
    endTime: string;
    totalDuration: string;
    averagePerFile: string;
  };
}

export const mockSummaryStats = {
  totalReviews: 247,
  criticalFindings: 12,
  avgQualityScore: 78,
  activeRepos: 15
};

export const mockReviews: Review[] = [
  {
    id: '1',
    title: 'Add user authentication middleware',
    repository: 'backend-api',
    author: 'john.doe',
    date: '2024-01-15',
    url: 'https://github.com/company/backend-api/pull/123',
    status: 'completed',
    qualityScore: 85,
    filesAnalyzed: 8,
    linesOfCode: 245,
    linesAdded: 127,
    linesRemoved: 34,
    findings: [
      {
        id: 'f1',
        severity: 'high',
        type: 'Security',
        title: 'Potential SQL injection vulnerability',
        description: 'User input is directly concatenated into SQL query without sanitization',
        file: 'src/auth/middleware.js',
        line: 42,
        plugin: 'Security Scanner',
        recommendation: 'Use parameterized queries or ORM methods'
      },
      {
        id: 'f2',
        severity: 'medium',
        type: 'Performance',
        title: 'Inefficient database query',
        description: 'N+1 query pattern detected in user lookup',
        file: 'src/auth/middleware.js',
        line: 67,
        plugin: 'Performance Analyzer',
        recommendation: 'Use join or batch query to reduce database calls'
      },
      {
        id: 'f3',
        severity: 'low',
        type: 'Code Style',
        title: 'Missing JSDoc comments',
        description: 'Function lacks proper documentation',
        file: 'src/auth/middleware.js',
        line: 15,
        plugin: 'Style Checker',
        recommendation: 'Add JSDoc comments to improve code documentation'
      }
    ],
    semantic: {
      summary: 'This PR introduces authentication middleware that handles JWT token validation and user session management.',
      impact: 'Medium impact - affects all authenticated routes and improves security posture',
      suggestions: [
        'Consider implementing rate limiting for authentication endpoints',
        'Add comprehensive error handling for token validation failures',
        'Include unit tests for edge cases'
      ]
    },
    quality: {
      security: 75,
      performance: 82,
      maintainability: 88,
      standards: 91
    },
    analysisPerformance: {
      llmProvider: 'http://localhost:1234',
      modelUsed: 'google/gemma-3-1b',
      startTime: '28/06/2025, 12:20:29 pm',
      endTime: '28/06/2025, 12:20:40 pm',
      totalDuration: '11s',
      averagePerFile: '1.4s'
    }
  },
  {
    id: '2',
    title: 'Implement React dashboard components',
    repository: 'frontend-web',
    author: 'jane.smith',
    date: '2024-01-14',
    url: 'https://github.com/company/frontend-web/pull/456',
    status: 'completed',
    qualityScore: 92,
    filesAnalyzed: 12,
    linesOfCode: 487,
    linesAdded: 423,
    linesRemoved: 18,
    findings: [
      {
        id: 'f4',
        severity: 'medium',
        type: 'Performance',
        title: 'Unnecessary re-renders detected',
        description: 'Component re-renders on every state change due to inline object creation',
        file: 'src/components/Dashboard.tsx',
        line: 28,
        plugin: 'React Profiler',
        recommendation: 'Move object creation outside render or use useMemo'
      },
      {
        id: 'f5',
        severity: 'low',
        type: 'Accessibility',
        title: 'Missing ARIA labels',
        description: 'Interactive elements lack proper accessibility attributes',
        file: 'src/components/Chart.tsx',
        line: 15,
        plugin: 'A11y Checker',
        recommendation: 'Add aria-label or aria-labelledby attributes'
      }
    ],
    semantic: {
      summary: 'Comprehensive dashboard implementation with charts, filters, and responsive design.',
      impact: 'High impact - introduces major new user-facing functionality',
      suggestions: [
        'Add loading states for better UX',
        'Implement error boundaries for graceful error handling',
        'Consider virtualization for large data sets'
      ]
    },
    quality: {
      security: 95,
      performance: 85,
      maintainability: 94,
      standards: 96
    },
    analysisPerformance: {
      llmProvider: 'http://localhost:1234',
      modelUsed: 'google/gemma-3-1b',
      startTime: '28/06/2025, 12:18:15 pm',
      endTime: '28/06/2025, 12:18:31 pm',
      totalDuration: '16s',
      averagePerFile: '1.3s'
    }
  },
  {
    id: '3',
    title: 'Fix memory leak in WebSocket connection',
    repository: 'realtime-service',
    author: 'mike.wilson',
    date: '2024-01-13',
    url: 'https://github.com/company/realtime-service/pull/789',
    status: 'in-progress',
    qualityScore: 68,
    filesAnalyzed: 3,
    linesOfCode: 156,
    linesAdded: 89,
    linesRemoved: 45,
    findings: [
      {
        id: 'f6',
        severity: 'critical',
        type: 'Memory',
        title: 'Event listeners not properly cleaned up',
        description: 'WebSocket event listeners are added but never removed, causing memory leaks',
        file: 'src/websocket/client.js',
        line: 89,
        plugin: 'Memory Analyzer',
        recommendation: 'Implement proper cleanup in disconnect handler'
      },
      {
        id: 'f7',
        severity: 'high',
        type: 'Error Handling',
        title: 'Unhandled promise rejection',
        description: 'Async WebSocket operations lack proper error handling',
        file: 'src/websocket/client.js',
        line: 34,
        plugin: 'Error Tracker',
        recommendation: 'Add try-catch blocks and proper error propagation'
      }
    ],
    semantic: {
      summary: 'Critical fix for memory leaks in WebSocket connection handling that was affecting production stability.',
      impact: 'Critical impact - resolves production stability issues',
      suggestions: [
        'Add monitoring for connection pool health',
        'Implement automatic reconnection with exponential backoff',
        'Add comprehensive integration tests'
      ]
    },
    quality: {
      security: 72,
      performance: 45,
      maintainability: 78,
      standards: 85
    },
    analysisPerformance: {
      llmProvider: 'http://localhost:1234',
      modelUsed: 'google/gemma-3-1b',
      startTime: '28/06/2025, 12:15:22 pm',
      endTime: '28/06/2025, 12:15:28 pm',
      totalDuration: '6s',
      averagePerFile: '2.0s'
    }
  }
];
