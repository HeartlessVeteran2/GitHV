const { add, multiply } = require('./utils');

describe('Basic functionality', () => {
  test('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  });
  
  test('should multiply two numbers correctly', () => {
    expect(multiply(3, 4)).toBe(12);
  });
  
  test('should check if string includes substring', () => {
    expect('GitHV IDE'.toLowerCase()).toContain('ide');
  });
});