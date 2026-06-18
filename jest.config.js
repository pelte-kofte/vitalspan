/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Mock the theme module so supplementTimings.ts can be imported in tests
    '^../theme$': '<rootDir>/src/__mocks__/theme.ts',
    '^../theme/index$': '<rootDir>/src/__mocks__/theme.ts',
    '^../../theme$': '<rootDir>/src/__mocks__/theme.ts',
    '^../../theme/index$': '<rootDir>/src/__mocks__/theme.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        strict: true,
        esModuleInterop: true,
      },
    }],
  },
};
