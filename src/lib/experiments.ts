import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { showDevContent } from "./env";

export type ExperimentProfile =
  | "r3f-scene"
  | "r3f-shader"
  | "scrollytelling"
  | "interaction"
  | "dom-effect"
  | "web-audio"
  | "mixed"
  | "blank";

export type ExperimentStatus = "wip" | "shipped";

export type ExperimentComplexity = "beginner" | "intermediate" | "advanced";

export type ExperimentListing = "public" | "dev" | "registry";

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
const VALID_STATUSES: ExperimentStatus[] = ["wip", "shipped"];
const VALID_COMPLEXITIES: ExperimentComplexity[] = [
  "beginner",
  "intermediate",
  "advanced",
];
const VALID_LISTINGS: ExperimentListing[] = ["public", "dev", "registry"];

export interface InspirationLink {
  title: string;
  url: string;
}

export interface Experiment {
  articleHref?: string;
  complexity?: ExperimentComplexity;
  created: string;
  description: string;
  href: string;
  image?: string;
  inspiration?: InspirationLink[];
  legacy?: boolean;
  listing?: ExperimentListing;
  poster?: string;
  profile?: ExperimentProfile;
  related?: string[];
  slug: string;
  status?: ExperimentStatus;
  tags?: string[];
  tech?: string[];
  title: string;
  updated?: string;
  video?: string;
}

/** Extract related slugs from raw experiment config. Works with experiment.json imports. */
export function getRelatedSlugs(config: unknown): string[] {
  if (!config || typeof config !== "object") {
    return [];
  }
  const r = (config as Record<string, unknown>).related;
  return Array.isArray(r)
    ? (r.filter((s): s is string => typeof s === "string") as string[])
    : [];
}

export interface ExperimentFilter {
  listing?: ExperimentListing[];
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

  if (
    obj.listing !== undefined &&
    !VALID_LISTINGS.includes(obj.listing as ExperimentListing)
  ) {
    console.warn(
      `Invalid listing "${obj.listing}" in experiment "${obj.slug}"`
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

          const articlePath = path.join(
            experimentsDir,
            dirName,
            config.slug,
            "article",
            "content.mdx"
          );
          let articleHref: string | undefined;
          try {
            await fs.access(articlePath);
            articleHref = `/experiments/${config.slug}/article`;
          } catch {
            // No article
          }

          const experiment = validateExperiment({
            ...config,
            ...(articleHref && { articleHref }),
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

    // WIP experiments: visible only in dev/preview environments
    if (!showDevContent) {
      results = results.filter((exp) => exp.status !== "wip");
    }

    // Listing gate
    if (filter?.listing?.length) {
      results = results.filter((exp) =>
        filter.listing!.includes(exp.listing ?? "public")
      );
    } else if (showDevContent) {
      // Dev/preview: show public + dev + wip (everything except registry-only)
      results = results.filter(
        (exp) => (exp.listing ?? "public") !== "registry"
      );
    } else {
      // Production: only public
      results = results.filter((exp) => (exp.listing ?? "public") === "public");
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

/**
 * Returns experiments matching the given slugs, in slug order.
 * Only includes experiments that would appear in getExperiments() (visibility rules apply).
 */
export const getExperimentsBySlugs = cache(
  async (slugs: string[]): Promise<Experiment[]> => {
    if (slugs.length === 0) {
      return [];
    }
    const experiments = await getExperiments();
    const bySlug = new Map(experiments.map((e) => [e.slug, e]));
    return slugs
      .map((s) => bySlug.get(s))
      .filter((e): e is Experiment => e != null);
  }
);
