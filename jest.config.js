/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testTimeout: 10000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['./lib'],
  coveragePathIgnorePatterns: ['tests'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
