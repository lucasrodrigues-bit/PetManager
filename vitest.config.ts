import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/features/**/__tests__/*.test.ts", "src/shared/**/__tests__/*.test.ts"],
    environment: "jsdom",
  },
});
