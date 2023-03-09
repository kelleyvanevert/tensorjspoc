import type { Config } from 'jest';

const config: Config = {
  preset: 'react-native',
  cacheDirectory: "./cache",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/jest"
  ],
  collectCoverageFrom: [
    "src/**/*.ts*"
  ],
  coverageThreshold: {
    global: {
      statements: 80
    }
  },
  collectCoverage: true,
  transformIgnorePatterns: [
    "/node_modules/(?!(@react-native|react-native|react-native-gesture-handler|@react-navigation)/).*/"
  ],
  setupFiles:[
    "./jest.setup.ts"
  ],
  verbose: true
};

export default config;