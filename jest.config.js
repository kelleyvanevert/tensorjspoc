/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/recommender/**/*.{ts,tsx}'],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
