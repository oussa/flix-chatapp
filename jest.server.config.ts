import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Define paths to test
  testMatch: [
    '<rootDir>/server/**/*.test.ts',
  ],
  // Exclude client tests
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/dist/',
    '<rootDir>/app/',
    '<rootDir>/components/',
  ],
  // Handle module aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Coverage configuration
  collectCoverageFrom: [
    'server/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  // Transform settings
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.server.json',
    }],
  },
};

export default config; 