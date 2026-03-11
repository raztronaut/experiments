import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

export type ExperimentProfile =
  | "r3f-scene"
  | "r3f-shader"
  | "scrollytelling"
  | "interaction"
  | "dom-effect"
  | "web-audio"
  | "mixed"
  | "blank";

export type ExperimentStatus = "wip" | "shipped" | "archived";

export type ExperimentComplexity = "beginner" | "intermediate" | "advanced";

const VALID_PROFILES: ExperimentProfile[] = [
  "r3f-scene",
  "r3f-shader",
  "scrollytelling",
  "interaction",
  "dom-effect",
  "web-audio",
  "mixed",
  "blank",
];
const VALID_STATUSES: ExperimentStatus[] = ["wip", "shipped", "archived"];
const VALID_COMPLEXITIES: ExperimentComplexity[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export interface Experiment {
  complexity?: ExperimentComplexity;
  content?: Record<string, boolean>;
  created: string;
  description: string;
  href: string;
  image?: string;
  inspiration?: { title: string; url: string }[];
  legacy?: boolean;
  poster?: string;
  profile?: ExperimentProfile;
  publishable?: boolean;
  related?: string[];
  slug: string;
  status?: ExperimentStatus;
  tags?: string[];
  tech?: string[];
  title: string;
  updated?: string;
  video?: string;
}

export interface ExperimentFilter {
  includeArchived?: boolean;
  profile?: ExperimentProfile;
  status?: ExperimentStatus[];
  tags?: string[];
  tech?: string[];
}

function validateExperiment(raw: unknown): Experiment | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.title !== "string" || !obj.title) {
    return null;
  }
  if (typeof obj.description !== "string" || !obj.description) {
    return null;
  }
  if (typeof obj.slug !== "string" || !obj.slug) {
    return null;
  }
  if (typeof obj.created !== "string") {
    return null;
  }
  if (typeof obj.href !== "string") {
    return null;
  }

  if (
    obj.status !== undefined &&
    !VALID_STATUSES.includes(obj.status as ExperimentStatus)
  ) {
    console.warn(`Invalid status "${obj.status}" in experiment "${obj.slug}"`);
    return null;
  }

  if (
    obj.profile !== undefined &&
    !VALID_PROFILES.includes(obj.profile as ExperimentProfile)
  ) {
    console.warn(
      `Invalid profile "${obj.profile}" in experiment "${obj.slug}"`
    );
    return null;
  }

  if (
    obj.complexity !== undefined &&
    !VALID_COMPLEXITIES.includes(obj.complexity as ExperimentComplexity)
  ) {
    console.warn(
      `Invalid complexity "${obj.complexity}" in experiment "${obj.slug}"`
    );
    return null;
  }

  return obj as unknown as Experiment;
}

// React.cache() deduplicates within a single server render pass.
// Caveat: uses Object.is for args -- inline filter objects will miss cache.
// All current callers pass undefined (no filter), which deduplicates correctly.
export const getExperiments = cache(async function getExperiments(
  filter?: ExperimentFilter
): Promise<Experiment[]> {
  const experimentsDir = path.join(process.cwd(), "src/app/experiments");

  try {
    const entries = await fs.readdir(experimentsDir, { withFileTypes: true });

    const experimentDirs = entries
      .filter(
        (dirent) =>
          dirent.isDirectory() &&
          dirent.name.startsWith("(") &&
          dirent.name !== "(index)"
      )
      .map((dirent) => dirent.name);

    const experiments = await Promise.all(
      experimentDirs.map(async (dirName) => {
        const configPath = path.join(
          experimentsDir,
          dirName,
          "experiment.json"
        );
        try {
          const content = await fs.readFile(configPath, "utf-8");
          const config = JSON.parse(content);

          const posterPath = config.video
            ? `/experiments/${config.slug}/poster.jpg`
            : undefined;

          const experiment = validateExperiment({
            ...config,
            href: `/experiments/${config.slug}`,
            poster: posterPath,
          });

          if (!experiment) {
            console.warn(`Validation failed for ${dirName}`);
          }

          return experiment;
        } catch (error) {
          console.warn(`Could not read config for ${dirName}:`, error);
          return null;
        }
      })
    );

    let results = experiments.filter((exp): exp is Experiment => exp !== null);

    if (!filter?.includeArchived) {
      results = results.filter((exp) => exp.status !== "archived");
    }

    if (filter?.status?.length) {
      results = results.filter(
        (exp) => exp.status && filter.status!.includes(exp.status)
      );
    }

    if (filter?.tags?.length) {
      results = results.filter((exp) =>
        exp.tags?.some((tag) => filter.tags!.includes(tag))
      );
    }

    if (filter?.tech?.length) {
      results = results.filter((exp) =>
        exp.tech?.some((t) => filter.tech!.includes(t))
      );
    }

    if (filter?.profile) {
      results = results.filter((exp) => exp.profile === filter.profile);
    }

    return results.sort((a, b) => b.created.localeCompare(a.created));
  } catch (error) {
    console.error("Error reading experiments directory:", error);
    return [];
  }
});
