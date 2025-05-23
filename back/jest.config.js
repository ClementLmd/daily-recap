module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/api/tests/setup.ts"],
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/tests/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
