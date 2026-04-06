/** @type {import('jest').Config} */
export default {
  displayName: "react-native",
  testMatch: ["**/tests/react-native/**/*.test.{ts,tsx}"],
  // jsdom so DOM queries work with our HTML-element RN mock
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" }, modules: "commonjs" }],
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript",
        ],
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(react-native)/)" ],
  moduleNameMapper: {
    // Stub RN with HTML-element equivalents so @testing-library/react can query them
    "^react-native$": "<rootDir>/tests/react-native/__mocks__/react-native.js",
  },
  setupFilesAfterEnv: [],
};
