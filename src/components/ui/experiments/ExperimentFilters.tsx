"use client";

import type { ExperimentStatus } from "@/lib/experiments";
import { cn } from "@/lib/utils";

interface ExperimentFiltersProps {
  onStatusFilterChange: (status: ExperimentStatus | "all") => void;
  statusFilter: ExperimentStatus | "all";
}

const statusOptions: { label: string; value: ExperimentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Shipped", value: "shipped" },
  { label: "WIP", value: "wip" },
];

export function ExperimentFilters({
  statusFilter,
  onStatusFilterChange,
}: ExperimentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-lg border border-border/50 bg-muted/50 p-1">
        {statusOptions.map(({ label, value }) => (
          <button
            className={cn(
              "rounded-md px-2.5 py-1 font-medium text-xs transition-all",
              statusFilter === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            key={value}
            onClick={() => onStatusFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
