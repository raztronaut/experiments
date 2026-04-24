"use client";

import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExperimentListing } from "@/lib/experiments";
import { cn } from "@/lib/utils";
import { DEFAULT_FILTERS, type FilterState } from "./filter-utils";
import type { SortKey } from "./types";

interface FilterBarProps {
  experiments: { profile?: string }[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "created", label: "Created" },
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "completeness", label: "Completeness" },
  { key: "profile", label: "Profile" },
];

const LISTING_OPTIONS: ExperimentListing[] = ["public", "dev", "registry"];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      className={cn(
        "h-7 rounded-full px-2.5 text-xs",
        active
          ? "border-zinc-500 bg-zinc-700 text-zinc-100"
          : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
      )}
      onClick={onClick}
      size="sm"
      variant="outline"
    >
      {label}
    </Button>
  );
}

function TriChip({
  label,
  value,
  onClick,
}: {
  label: string;
  value: boolean | null;
  onClick: () => void;
}) {
  const display =
    value === true ? `${label}: Yes` : value === false ? `${label}: No` : label;
  return (
    <Button
      className={cn(
        "h-7 rounded-full px-2.5 text-xs",
        value === null
          ? "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
          : "border-zinc-500 bg-zinc-700 text-zinc-100"
      )}
      onClick={onClick}
      size="sm"
      title="Click to cycle: any → yes → no → any"
      variant="outline"
    >
      {display}
    </Button>
  );
}

export function FilterBar({ experiments, filters, onChange }: FilterBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  const profiles = [
    ...new Set(experiments.map((e) => e.profile).filter(Boolean)),
  ].sort() as string[];

  const toggle = useCallback(
    (key: "status" | "listing" | "profile", value: string) => {
      const current = filters[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onChange({ ...filters, [key]: next });
    },
    [filters, onChange]
  );

  const cycleBool = useCallback(
    (key: "hasVideo" | "hasArticle" | "isLegacy") => {
      const current = filters[key];
      const next = current === null ? true : current === true ? false : null;
      onChange({ ...filters, [key]: next });
    },
    [filters, onChange]
  );

  const hasActive =
    filters.search ||
    filters.status.length > 0 ||
    filters.listing.length > 0 ||
    filters.profile.length > 0 ||
    filters.hasVideo !== null ||
    filters.hasArticle !== null ||
    filters.isLegacy !== null;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            className="border-zinc-800 bg-zinc-900/50 pr-20 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-600"
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search experiments..."
            ref={searchRef}
            value={filters.search}
          />
          <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
            ⌘K
          </kbd>
        </div>
        <select
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 outline-none"
          onChange={(e) =>
            onChange({ ...filters, sortKey: e.target.value as SortKey })
          }
          value={filters.sortKey}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              Sort: {o.label}
            </option>
          ))}
        </select>
        <Button
          aria-label={
            filters.sortDir === "asc" ? "Sort ascending" : "Sort descending"
          }
          className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
          onClick={() =>
            onChange({
              ...filters,
              sortDir: filters.sortDir === "asc" ? "desc" : "asc",
            })
          }
          size="icon"
          title={filters.sortDir === "asc" ? "Ascending" : "Descending"}
          variant="outline"
        >
          {filters.sortDir === "asc" ? "↑" : "↓"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs">Status:</span>
        <Chip
          active={filters.status.includes("shipped")}
          label="shipped"
          onClick={() => toggle("status", "shipped")}
        />
        <Chip
          active={filters.status.includes("wip")}
          label="wip"
          onClick={() => toggle("status", "wip")}
        />

        <span className="ml-2 text-muted-foreground text-xs">Listing:</span>
        {LISTING_OPTIONS.map((v) => (
          <Chip
            active={filters.listing.includes(v)}
            key={v}
            label={v}
            onClick={() => toggle("listing", v)}
          />
        ))}

        <span className="ml-2 text-muted-foreground text-xs">Content:</span>
        <TriChip
          label="Video"
          onClick={() => cycleBool("hasVideo")}
          value={filters.hasVideo}
        />
        <TriChip
          label="Article"
          onClick={() => cycleBool("hasArticle")}
          value={filters.hasArticle}
        />
        <TriChip
          label="Legacy"
          onClick={() => cycleBool("isLegacy")}
          value={filters.isLegacy}
        />

        {profiles.length > 0 && (
          <>
            <span className="ml-2 text-muted-foreground text-xs">Profile:</span>
            {profiles.map((p) => (
              <Chip
                active={filters.profile.includes(p)}
                key={p}
                label={p}
                onClick={() => toggle("profile", p)}
              />
            ))}
          </>
        )}

        {hasActive && (
          <Button
            className="ml-auto h-auto p-0 text-xs text-zinc-500 hover:text-zinc-300"
            onClick={() => onChange(DEFAULT_FILTERS)}
            size="sm"
            variant="link"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
