module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/server/**/*.test.{js,ts}',
  ],
  transform: {},
  collectCoverageFrom: [
    'server/**/*.{js,ts}',
    'shared/**/*.{js,ts}',
    '!**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
};