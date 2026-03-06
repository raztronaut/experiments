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
      <div className="flex items-center rounded-lg border border-border/50 bg-muted/50 p-1">
        <WithHover config={{ hoverOffset: 0 }}>
          <button
            aria-label="Grid view"
            className={`rounded-md p-1.5 transition-all ${
              viewMode === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </WithHover>
        <WithHover config={{ hoverOffset: 0 }}>
          <button
            aria-label="List view"
            className={`rounded-md p-1.5 transition-all ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm"
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
