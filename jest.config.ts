import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
	dir: './'
});

const customJestConfig: Config = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'^@app/(.*)$': '<rootDir>/app/$1',
		'^@lib/(.*)$': '<rootDir>/lib/$1',
		'^@components/(.*)$': '<rootDir>/components/$1'
	},
	moduleDirectories: ['node_modules', '<rootDir>/'],
	testEnvironment: 'jest-environment-jsdom',
	modulePathIgnorePatterns: ['<rootDir>/cypress', '<rootDir>/.next/'],
	collectCoverageFrom: [
		'<rootDir>/app/**/*.{ts,tsx}',
		'<rootDir>/lib/**/*.{ts,tsx}',
		'<rootDir>/components/**/*.{ts,tsx}'
	],
	coverageProvider: 'v8',
	coverageReporters: ['text', 'lcov', 'json', 'clover']
};

export default createJestConfig(customJestConfig);
