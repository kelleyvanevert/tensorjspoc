import type { Config } from 'jest';

const config: Config = {
  preset: 'react-native',
  cacheDirectory: "./cache",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/jest"
  ],
  testPathIgnorePatterns: [
    "App-test.tsx",
    "exercise-scores-test.tsx",
    "mood-selector-test.tsx",
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
    "/node_modules/(?!(@react-native|react-native|react-native-star-rating|react-native-vector-icons|react-native-sectioned-multi-select|react-native-gesture-handler|@react-navigation)/).*/"
  ],
  setupFiles:[
    "./jest.setup.ts"
  ],
  verbose: true,
  transform: {},
};

export default config;