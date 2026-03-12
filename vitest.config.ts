import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

function getWipExperimentExcludes(): string[] {
  const experimentsDir = "src/app/experiments";
  const dirs = readdirSync(experimentsDir, { withFileTypes: true }).filter(
    (d) => d.isDirectory()
  );

  const wipSlugs: string[] = [];
  for (const dir of dirs) {
    const jsonPath = path.join(experimentsDir, dir.name, "experiment.json");
    try {
      const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
      if (data.status === "wip") {
        wipSlugs.push(data.slug);
      }
    } catch {
      // No experiment.json in this directory -- skip (e.g. route group wrappers)
    }
  }

  return wipSlugs.map((slug) => `src/components/experiments/${slug}/**`);
}

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
          exclude: ["node_modules", ".next", ...getWipExperimentExcludes()],
          environment: "jsdom",
        },
      },
    ],
  },
});
