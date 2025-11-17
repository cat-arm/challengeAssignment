module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
  collectCoverageFrom: ["index.ts", "!**/*.d.ts"],
  coverageDirectory: "coverage",
  verbose: true,
};

