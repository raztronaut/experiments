import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { showDevContent } from "@/lib/env";
import type {
  ExperimentComplexity,
  ExperimentListing,
  ExperimentProfile,
  ExperimentStatus,
} from "@/lib/experiments";
import { Dashboard } from "./_components/Dashboard";
import {
  computeCompleteness,
  type DashboardData,
  type ExperimentRow,
  getSurfaces,
  getWarnings,
} from "./_components/types";

export const metadata: Metadata = {
  title: "Experiment Status Dashboard",
  robots: { index: false, follow: false },
};

const VALID_STATUSES = new Set<ExperimentStatus>(["wip", "shipped"]);
const VALID_PROFILES = new Set<ExperimentProfile>([
  "r3f-scene",
  "r3f-shader",
  "scrollytelling",
  "interaction",
  "dom-effect",
  "web-audio",
  "mixed",
  "blank",
]);
const VALID_COMPLEXITIES = new Set<ExperimentComplexity>([
  "beginner",
  "intermediate",
  "advanced",
]);
const VALID_LISTINGS = new Set<ExperimentListing>([
  "public",
  "dev",
  "registry",
]);

interface RawExperiment {
  complexity?: string;
  created: string;
  description: string;
  image?: string;
  inspiration?: { title: string; url: string }[];
  legacy?: boolean;
  listing?: string;
  profile?: string;
  related?: string[];
  slug: string;
  status?: string;
  tags?: string[];
  tech?: string[];
  title: string;
  updated?: string;
  video?: string;
}

function validateEnum<T extends string>(
  value: string | undefined,
  valid: Set<T>
): T | undefined {
  if (value === undefined) {
    return undefined;
  }
  return valid.has(value as T) ? (value as T) : undefined;
}

async function loadAllExperiments(): Promise<ExperimentRow[]> {
  const experimentsDir = path.join(process.cwd(), "src/app/experiments");
  const entries = await fs.readdir(experimentsDir, { withFileTypes: true });

  const experimentDirs = entries.filter(
    (d) => d.isDirectory() && d.name.startsWith("(") && d.name !== "(index)"
  );

  const rows = await Promise.all(
    experimentDirs.map(async (dir) => {
      const configPath = path.join(experimentsDir, dir.name, "experiment.json");
      try {
        const content = await fs.readFile(configPath, "utf-8");
        const raw: RawExperiment = JSON.parse(content);

        const articlePath = path.join(
          experimentsDir,
          dir.name,
          raw.slug,
          "article",
          "content.mdx"
        );
        let hasArticle = false;
        try {
          await fs.access(articlePath);
          hasArticle = true;
        } catch {
          /* no article */
        }

        const status: ExperimentStatus =
          validateEnum(raw.status, VALID_STATUSES) ?? "wip";
        const listing: ExperimentListing =
          validateEnum(raw.listing, VALID_LISTINGS) ?? "public";
        const listingExplicit =
          raw.listing !== undefined &&
          VALID_LISTINGS.has(raw.listing as ExperimentListing);
        const profile = validateEnum(raw.profile, VALID_PROFILES);
        const complexity = validateEnum(raw.complexity, VALID_COMPLEXITIES);

        const partial = {
          status,
          listing,
          listingExplicit,
          profile,
          complexity,
          tags: raw.tags ?? [],
          tech: raw.tech ?? [],
          video: raw.video || undefined,
          hasArticle,
          updated: raw.updated,
          inspiration: raw.inspiration,
          related: raw.related,
        };

        const surfaces = getSurfaces(partial);
        const { score, missing } = computeCompleteness(partial);

        const row: ExperimentRow = {
          title: raw.title,
          slug: raw.slug,
          description: raw.description,
          created: raw.created,
          legacy: raw.legacy,
          ...partial,
          surfaces,
          completenessScore: score,
          missingFields: missing,
        };

        return row;
      } catch {
        return null;
      }
    })
  );

  return rows
    .filter((r): r is ExperimentRow => r !== null)
    .sort((a, b) => b.created.localeCompare(a.created));
}

export default async function DevDashboardPage() {
  if (!showDevContent) {
    notFound();
  }

  const experiments = await loadAllExperiments();
  const warnings = getWarnings(experiments);

  const stats = {
    total: experiments.length,
    shipped: experiments.filter((e) => e.status === "shipped").length,
    wip: experiments.filter((e) => e.status === "wip").length,
    legacy: experiments.filter((e) => e.legacy).length,
    withArticles: experiments.filter((e) => e.hasArticle).length,
    withVideo: experiments.filter((e) => Boolean(e.video)).length,
  };

  const profileDistribution: Record<string, number> = {};
  for (const exp of experiments) {
    const p = exp.profile ?? "unset";
    profileDistribution[p] = (profileDistribution[p] ?? 0) + 1;
  }

  const data: DashboardData = {
    experiments,
    warnings,
    stats,
    profileDistribution,
    contentCoverage: {
      articles: stats.withArticles,
      videos: stats.withVideo,
      total: stats.total,
    },
  };

  return <Dashboard data={data} />;
}
