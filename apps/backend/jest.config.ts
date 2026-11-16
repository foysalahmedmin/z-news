import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2022',
          parser: { syntax: 'typescript', decorators: true },
        },
      },
    ],
    '^.+\\.js$': ['@swc/jest', { jsc: { target: 'es2022' } }],
  },
  // sanitize-html's parser (htmlparser2 and its dom* / entities deps) ships ESM only;
  // let swc compile those to CommonJS for Jest.
  transformIgnorePatterns: [
    '/node_modules/(?!(\\.pnpm/)?(htmlparser2|domhandler|domutils|domelementtype|entities|dom-serializer)[@/])',
  ],
  clearMocks: true,
  setupFiles: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    '^@google-cloud/storage$': '<rootDir>/src/__mocks__/@google-cloud/storage.ts',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/__tests__/**',
    '!src/**/*.type.ts',
  ],
};

export default config;
