"use client";

import { LayoutGrid, List } from "lucide-react";
import { WithHover } from "../cursor/WithHover";

interface ViewModeToggleProps {
  onViewModeChange: (mode: "list" | "grid") => void;
  viewMode: "list" | "grid";
}

/**
 * Toggle between list and grid view modes.
 */
export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center rounded-lg border border-border/50 bg-muted/50 p-0.5">
        <WithHover config={{ hoverOffset: 0 }}>
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:h-8 md:w-8 ${
              viewMode === "grid"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </WithHover>
        <WithHover config={{ hoverOffset: 0 }}>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={viewMode === "list"}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:h-8 md:w-8 ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </button>
        </WithHover>
      </div>
    </div>
  );
}
