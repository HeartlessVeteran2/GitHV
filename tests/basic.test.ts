import { describe, it, expect } from '@jest/globals';

describe('Basic functionality', () => {
  it('should add two numbers correctly', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(2, 3)).toBe(5);
  });
  
  it('should check if string includes substring', () => {
    expect('GitHV IDE'.toLowerCase()).toContain('ide');
  });
});