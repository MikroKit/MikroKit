/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: '.coverage',
  collectCoverageFrom: ['src/**'],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
};
