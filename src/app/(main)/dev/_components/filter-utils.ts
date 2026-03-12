import type { ExperimentRow, SortDir, SortKey } from "./types";

export interface FilterState {
  hasArticle: boolean | null;
  hasVideo: boolean | null;
  isLegacy: boolean | null;
  listing: string[];
  profile: string[];
  search: string;
  sortDir: SortDir;
  sortKey: SortKey;
  status: string[];
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: [],
  listing: [],
  profile: [],
  hasVideo: null,
  hasArticle: null,
  isLegacy: null,
  sortKey: "created",
  sortDir: "desc",
};

export function applyFilters(
  experiments: ExperimentRow[],
  f: FilterState
): ExperimentRow[] {
  let result = experiments;

  if (f.search) {
    const q = f.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.tech.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (f.status.length > 0) {
    result = result.filter((e) => f.status.includes(e.status));
  }
  if (f.listing.length > 0) {
    result = result.filter((e) => f.listing.includes(e.listing));
  }
  if (f.profile.length > 0) {
    result = result.filter((e) => e.profile && f.profile.includes(e.profile));
  }
  if (f.hasVideo === true) {
    result = result.filter((e) => Boolean(e.video));
  }
  if (f.hasVideo === false) {
    result = result.filter((e) => !e.video);
  }
  if (f.hasArticle === true) {
    result = result.filter((e) => e.hasArticle);
  }
  if (f.hasArticle === false) {
    result = result.filter((e) => !e.hasArticle);
  }
  if (f.isLegacy === true) {
    result = result.filter((e) => e.legacy);
  }
  if (f.isLegacy === false) {
    result = result.filter((e) => !e.legacy);
  }

  const dir = f.sortDir === "asc" ? 1 : -1;
  result = [...result].sort((a, b) => {
    switch (f.sortKey) {
      case "title":
        return dir * a.title.localeCompare(b.title);
      case "status":
        return dir * a.status.localeCompare(b.status);
      case "completeness":
        return dir * (a.completenessScore - b.completenessScore);
      case "profile":
        return dir * (a.profile ?? "").localeCompare(b.profile ?? "");
      default:
        return dir * a.created.localeCompare(b.created);
    }
  });

  return result;
}
