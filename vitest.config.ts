import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["**/*.test.{ts,tsx}"],
          exclude: ["node_modules", ".next"],
          environment: "jsdom",
        },
      },
    ],
  },
});
