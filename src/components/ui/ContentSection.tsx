"use client";

import { Rss } from "lucide-react";
import { useState } from "react";
import type { Article } from "@/lib/articles";
import type { Experiment } from "@/lib/experiments";
import { cn } from "@/lib/utils";
import { WithHover } from "./cursor/WithHover";
import { ExperimentDrawerList } from "./ExperimentDrawerList";
import { ViewModeToggle } from "./experiments/ViewModeToggle";
import { WritingSection } from "./WritingSection";

type ContentTab = "experiments" | "writing";

interface ContentSectionProps {
  articles: Article[];
  experiments: Experiment[];
}

export function ContentSection({ articles, experiments }: ContentSectionProps) {
  const [activeTab, setActiveTab] = useState<ContentTab>("experiments");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const tabs: { count: number; id: ContentTab; label: string }[] = [
    { id: "experiments", label: "Experiments", count: experiments.length },
    { id: "writing", label: "Writing", count: articles.length },
  ];

  return (
    <section className="relative w-full">
      <div className="mb-6 flex items-center justify-between">
        <div
          aria-label="Content type"
          className="flex items-center rounded-lg border border-border/50 bg-muted/50 p-1"
          role="tablist"
        >
          {tabs.map((tab) => (
            <WithHover config={{ hoverOffset: 0 }} key={tab.id}>
              <button
                aria-selected={activeTab === tab.id}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
                <span className="ml-1.5 font-mono text-[11px] opacity-50">
                  {tab.count}
                </span>
              </button>
            </WithHover>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "writing" && (
            <WithHover>
              <a
                aria-label="RSS Feed"
                className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/20 px-2.5 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted/40 hover:text-foreground"
                href="/feed.xml"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Rss className="h-3 w-3" />
                RSS
              </a>
            </WithHover>
          )}
          {activeTab === "experiments" && (
            <ViewModeToggle
              onViewModeChange={setViewMode}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>

      {activeTab === "experiments" ? (
        <ExperimentDrawerList experiments={experiments} viewMode={viewMode} />
      ) : (
        <WritingSection articles={articles} />
      )}
    </section>
  );
}
