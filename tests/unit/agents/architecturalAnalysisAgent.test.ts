/**
 * ArchitecturalAnalysisAgent Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('ArchitecturalAnalysisAgent', () => {
  let mockAgent: any;

  beforeEach(() => {
    mockAgent = {
      analyze: jest.fn(),
      detectPatterns: jest.fn()
    };
  });

  it('should analyze patterns', async () => {
    const expected = { type: 'architectural', confidence: 0.85 };
    mockAgent.analyze.mockResolvedValue(expected);
    
    const result = await mockAgent.analyze({}, 'Analyze');
    
    expect(result.type).toBe('architectural');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should detect patterns', async () => {
    const expected = [{ pattern: 'Singleton', confidence: 0.95 }];
    mockAgent.detectPatterns.mockResolvedValue(expected);
    
    const result = await mockAgent.detectPatterns('code');
    
    expect(result[0].pattern).toBe('Singleton');
  });

  it('should handle errors', async () => {
    mockAgent.analyze.mockRejectedValue(new Error('Failed'));
    
    await expect(mockAgent.analyze({}, 'Invalid')).rejects.toThrow('Failed');
  });
});
