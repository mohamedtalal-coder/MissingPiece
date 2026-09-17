import type { Config } from "jest";

// First run needs internet access to download the binary once; it's cached afterward under the default mongodb-memory-server cache dir.
// If your CI environment has no internet access, this test approach is a hard blocker.
process.env["MONGOMS_VERSION"] = "7.0.14";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "node",
  testTimeout: 30000,
  setupFiles: ["<rootDir>/jest.setup.ts"],
};

export default config;