import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["sacred-symbol-autolinker.spec.ts"],
    environment: "node",
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});