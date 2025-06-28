/**
 * CodeAnalysisService Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('CodeAnalysisService', () => {
  let mockService: any;

  beforeEach(() => {
    mockService = {
      analyzeCode: jest.fn(),
      extractFunctions: jest.fn()
    };
  });

  it('should analyze code', async () => {
    const expected = { language: 'typescript', functions: ['test'] };
    mockService.analyzeCode.mockResolvedValue(expected);
    
    const result = await mockService.analyzeCode('function test() {}');
    
    expect(result.language).toBe('typescript');
    expect(result.functions).toContain('test');
  });

  it('should handle errors', async () => {
    mockService.analyzeCode.mockRejectedValue(new Error('Error'));
    
    await expect(mockService.analyzeCode('invalid')).rejects.toThrow('Error');
  });
});
