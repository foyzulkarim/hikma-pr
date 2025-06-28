/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HIKMA_LLM_SETUP = 'LM_STUDIO_ONLY';
process.env.LM_STUDIO_URL = 'http://localhost:1234';

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
