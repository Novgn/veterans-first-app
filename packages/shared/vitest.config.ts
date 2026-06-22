import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30000, // 30s timeout for database tests
    // The db/__tests__ integration suites share one local Supabase instance.
    // Running test files in parallel lets one file's ride inserts inflate
    // another file's row-count assertions (flaky "expected 3 to be 2"). Run
    // test files serially so the shared DB isn't mutated concurrently.
    fileParallelism: false,
  },
});
