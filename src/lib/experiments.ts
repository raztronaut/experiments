import fs from "node:fs/promises";
import path from "node:path";

export type ExperimentProfile =
  | "r3f-scene"
  | "r3f-shader"
  | "scrollytelling"
  | "interaction"
  | "dom-effect"
  | "web-audio"
  | "blank";

export type ExperimentStatus = "wip" | "shipped" | "archived";

export type ExperimentComplexity = "beginner" | "intermediate" | "advanced";

export interface Experiment {
  complexity?: ExperimentComplexity;
  content?: Record<string, boolean>;
  created: string;
  description: string;
  href: string;
  image?: string;
  inspiration?: { title: string; url: string }[];
  isPlaceholder?: boolean;
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

export async function getExperiments(
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

          return {
            ...config,
            href: `/experiments/${config.slug}`,
            poster: posterPath,
          } as Experiment;
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
}
