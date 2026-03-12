import type {
  ExperimentComplexity,
  ExperimentListing,
  ExperimentProfile,
  ExperimentStatus,
} from "@/lib/experiments";

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type Surface =
  | "Homepage"
  | "Dev Homepage"
  | "Registry"
  | "llms.txt"
  | "Posters"
  | "Articles"
  | "Sitemap"
  | "RSS";

export const ALL_SURFACES: Surface[] = [
  "Homepage",
  "Dev Homepage",
  "Registry",
  "llms.txt",
  "Posters",
  "Articles",
  "Sitemap",
  "RSS",
];

export interface ExperimentRow {
  completenessScore: number;
  complexity?: ExperimentComplexity;
  created: string;
  description: string;
  hasArticle: boolean;
  inspiration?: { title: string; url: string }[];
  legacy?: boolean;
  listing: ExperimentListing;
  listingExplicit: boolean;
  missingFields: string[];
  profile?: ExperimentProfile;
  related?: string[];
  slug: string;
  status: ExperimentStatus;
  surfaces: Surface[];
  tags: string[];
  tech: string[];
  title: string;
  updated?: string;
  video?: string;
}

export interface Warning {
  message: string;
  severity: "error" | "warn" | "info";
  slug: string;
}

export interface Stats {
  legacy: number;
  shipped: number;
  total: number;
  wip: number;
  withArticles: number;
  withVideo: number;
}

export interface DashboardData {
  contentCoverage: { articles: number; videos: number; total: number };
  experiments: ExperimentRow[];
  profileDistribution: Record<string, number>;
  stats: Stats;
  warnings: Warning[];
}

export type SortKey =
  | "created"
  | "title"
  | "status"
  | "completeness"
  | "profile";
export type SortDir = "asc" | "desc";

export type Tab = "overview" | "experiments" | "health" | "surfaces";

export const TABLE_COLUMN_COUNT = 13;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getSurfaces(exp: {
  status: ExperimentStatus;
  listing: ExperimentListing;
  video?: string;
  hasArticle: boolean;
}): Surface[] {
  if (exp.status === "wip") {
    return ["Dev Homepage"];
  }

  if (exp.listing === "public") {
    const s: Surface[] = ["Homepage", "Registry", "llms.txt", "Sitemap", "RSS"];
    if (exp.video) {
      s.push("Posters");
    }
    if (exp.hasArticle) {
      s.push("Articles");
    }
    return s;
  }

  if (exp.listing === "dev") {
    return ["Dev Homepage", "Registry", "llms.txt"];
  }

  if (exp.listing === "registry") {
    return ["Registry"];
  }

  return [];
}

export function getWarnings(experiments: ExperimentRow[]): Warning[] {
  const warnings: Warning[] = [];
  for (const exp of experiments) {
    if (exp.status === "shipped" && exp.listing === "public" && !exp.video) {
      warnings.push({
        slug: exp.slug,
        message: "Public shipped experiment missing video",
        severity: "error",
      });
    }
    if (exp.status === "wip" && exp.hasArticle) {
      warnings.push({
        slug: exp.slug,
        message: "WIP experiment has an article",
        severity: "warn",
      });
    }
    if (!exp.listingExplicit) {
      warnings.push({
        slug: exp.slug,
        message: "Missing explicit listing field (defaults to public)",
        severity: "info",
      });
    }
  }
  return warnings;
}

interface CompletenessResult {
  missing: string[];
  score: number;
}

export function computeCompleteness(exp: {
  status?: ExperimentStatus;
  listing?: ExperimentListing;
  listingExplicit: boolean;
  profile?: string;
  complexity?: string;
  tags: string[];
  tech: string[];
  video?: string;
  hasArticle: boolean;
  updated?: string;
  inspiration?: { title: string; url: string }[];
  related?: string[];
}): CompletenessResult {
  const checks: { label: string; pts: number; met: boolean }[] = [
    { label: "Set status", pts: 5, met: exp.status !== undefined },
    { label: "Set listing", pts: 5, met: exp.listingExplicit },
    { label: "Set profile", pts: 10, met: exp.profile !== undefined },
    { label: "Set complexity", pts: 5, met: exp.complexity !== undefined },
    { label: "Add tags", pts: 10, met: exp.tags.length > 0 },
    { label: "Add tech stack", pts: 10, met: exp.tech.length > 0 },
    { label: "Add video", pts: 15, met: Boolean(exp.video) },
    { label: "Write article", pts: 20, met: exp.hasArticle },
    { label: "Set updated date", pts: 5, met: exp.updated !== undefined },
    {
      label: "Add inspiration links",
      pts: 5,
      met: (exp.inspiration?.length ?? 0) > 0,
    },
    {
      label: "Add related experiments",
      pts: 5,
      met: (exp.related?.length ?? 0) > 0,
    },
    { label: "Set legacy flag", pts: 5, met: true },
  ];

  const total = checks.reduce((s, c) => s + c.pts, 0);
  const earned = checks.filter((c) => c.met).reduce((s, c) => s + c.pts, 0);
  const missing = checks.filter((c) => !c.met).map((c) => c.label);

  return { score: Math.round((earned / total) * 100), missing };
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

export const LISTING_COLORS: Record<ExperimentListing, string> = {
  public: "bg-emerald-500/15 text-emerald-400",
  dev: "bg-blue-500/15 text-blue-400",
  registry: "bg-zinc-500/15 text-zinc-400",
};

export const SURFACE_COLORS: Record<string, string> = {
  Homepage: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  Sitemap: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  RSS: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  Posters: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  Articles: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  "Dev Homepage": "bg-blue-500/15 text-blue-400 ring-blue-500/30",
  Registry: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
  "llms.txt": "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
};

export const SEVERITY_STYLES: Record<string, string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

export const PROFILE_COLORS: Record<string, string> = {
  "r3f-scene": "bg-violet-500/15 text-violet-400",
  "r3f-shader": "bg-fuchsia-500/15 text-fuchsia-400",
  scrollytelling: "bg-sky-500/15 text-sky-400",
  interaction: "bg-teal-500/15 text-teal-400",
  "dom-effect": "bg-orange-500/15 text-orange-400",
  "web-audio": "bg-pink-500/15 text-pink-400",
  mixed: "bg-indigo-500/15 text-indigo-400",
  blank: "bg-zinc-500/15 text-zinc-400",
};

export const COMPLEXITY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/15 text-green-400",
  intermediate: "bg-yellow-500/15 text-yellow-400",
  advanced: "bg-red-500/15 text-red-400",
};
