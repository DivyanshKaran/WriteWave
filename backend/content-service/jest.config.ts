import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/**/__tests__/**',
    '!src/**/types/**',
    '!src/config/logger.ts',
  ],
};

export default config;


