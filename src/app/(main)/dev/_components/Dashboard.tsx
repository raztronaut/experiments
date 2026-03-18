"use client";

import { useCallback, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentHealth } from "./ContentHealth";
import { ExperimentTable } from "./ExperimentTable";
import { FilterBar } from "./FilterBar";
import {
  applyFilters,
  DEFAULT_FILTERS,
  type FilterState,
} from "./filter-utils";
import { SentryTestButton } from "./SentryTestButton";
import { StatsBar } from "./StatsBar";
import { SurfaceMatrix } from "./SurfaceMatrix";
import type { DashboardData, SortKey, Tab } from "./types";
import { WarningsList } from "./WarningsList";

interface DashboardProps {
  data: DashboardData;
}

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "overview", label: "Overview", description: "Lab status at a glance" },
  {
    id: "experiments",
    label: "Experiments",
    description: "Full filterable table",
  },
  {
    id: "health",
    label: "Content Health",
    description: "Completeness audit",
  },
  { id: "surfaces", label: "Surfaces", description: "Visibility matrix" },
];

function useTabState(): [Tab, (tab: Tab) => void] {
  const [tab, setTabRaw] = useState<Tab>(() => {
    if (typeof window === "undefined") {
      return "overview";
    }
    const params = new URLSearchParams(window.location.search);
    return (params.get("tab") as Tab) || "overview";
  });

  const setTab = useCallback((next: Tab) => {
    setTabRaw(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.toString());
  }, []);

  return [tab, setTab];
}

export function Dashboard({ data }: DashboardProps) {
  const [tab, setTab] = useTabState();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => applyFilters(data.experiments, filters),
    [data.experiments, filters]
  );

  const handleSort = useCallback(
    (key: SortKey) => {
      if (filters.sortKey === key) {
        setFilters((f) => ({
          ...f,
          sortDir: f.sortDir === "asc" ? "desc" : "asc",
        }));
      } else {
        setFilters((f) => ({ ...f, sortKey: key, sortDir: "desc" }));
      }
    },
    [filters.sortKey]
  );

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-bold text-2xl text-zinc-100 tracking-tight">
          Experiment Status Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Dev-only command center &mdash; {data.stats.total} experiments,{" "}
          {data.stats.shipped} shipped, {data.stats.wip} WIP
        </p>
        <div className="mt-3">
          <SentryTestButton />
        </div>
      </header>

      <Tabs
        className="space-y-6"
        onValueChange={(v) => setTab(v as Tab)}
        value={tab}
      >
        <TabsList className="w-full justify-start">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} title={t.description} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent className="space-y-8" value="overview">
          <StatsBar
            contentCoverage={data.contentCoverage}
            profileDistribution={data.profileDistribution}
            stats={data.stats}
            warningCount={data.warnings.length}
          />
          <div>
            <h2 className="mb-3 font-medium text-sm text-zinc-300">
              Warnings ({data.warnings.length})
            </h2>
            <WarningsList warnings={data.warnings} />
          </div>
        </TabsContent>

        <TabsContent value="experiments">
          <div className="space-y-4">
            <div className="sticky top-0 z-10 -mx-4 bg-zinc-950/90 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <FilterBar
                experiments={data.experiments}
                filters={filters}
                onChange={setFilters}
              />
              <p className="mt-2 text-muted-foreground text-xs">
                Showing {filtered.length} of {data.experiments.length}{" "}
                experiments
              </p>
            </div>
            <ExperimentTable
              experiments={filtered}
              onSort={handleSort}
              sortDir={filters.sortDir}
              sortKey={filters.sortKey}
            />
          </div>
        </TabsContent>

        <TabsContent value="health">
          <div className="space-y-4">
            <div className="sticky top-0 z-10 -mx-4 bg-zinc-950/90 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <FilterBar
                experiments={data.experiments}
                filters={filters}
                onChange={setFilters}
              />
              <p className="mt-2 text-muted-foreground text-xs">
                Showing {filtered.length} of {data.experiments.length}{" "}
                experiments
              </p>
            </div>
            <ContentHealth experiments={filtered} />
          </div>
        </TabsContent>

        <TabsContent value="surfaces">
          <div className="space-y-4">
            <div className="sticky top-0 z-10 -mx-4 bg-zinc-950/90 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <FilterBar
                experiments={data.experiments}
                filters={filters}
                onChange={setFilters}
              />
              <p className="mt-2 text-muted-foreground text-xs">
                Showing {filtered.length} of {data.experiments.length}{" "}
                experiments
              </p>
            </div>
            <SurfaceMatrix experiments={filtered} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
