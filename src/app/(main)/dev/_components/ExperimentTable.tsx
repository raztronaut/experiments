"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ExperimentTableRow } from "./ExperimentTableRow";
import type { ExperimentRow, SortDir, SortKey } from "./types";

interface ExperimentTableProps {
  experiments: ExperimentRow[];
  onSort: (key: SortKey) => void;
  sortDir: SortDir;
  sortKey: SortKey;
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = currentKey === sortKey;
  return (
    <TableHead className={className}>
      <Button
        className={cn(
          "h-auto gap-1 p-0 text-xs uppercase tracking-wider",
          active ? "text-zinc-200" : "text-muted-foreground hover:text-zinc-300"
        )}
        onClick={() => onSort(sortKey)}
        size="sm"
        variant="ghost"
      >
        {label}
        {active && (
          <span className="text-[10px]">
            {currentDir === "asc" ? "↑" : "↓"}
          </span>
        )}
      </Button>
    </TableHead>
  );
}

export function ExperimentTable({
  experiments,
  sortKey,
  sortDir,
  onSort,
}: ExperimentTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleRow = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  if (experiments.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-12 text-center text-muted-foreground text-sm">
        No experiments match the current filters.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider">
            <TableHead className="w-8" />
            <SortHeader
              currentDir={sortDir}
              currentKey={sortKey}
              label="Name"
              onSort={onSort}
              sortKey="title"
            />
            <SortHeader
              currentDir={sortDir}
              currentKey={sortKey}
              label="Status"
              onSort={onSort}
              sortKey="status"
            />
            <TableHead className="text-xs uppercase tracking-wider">
              Listing
            </TableHead>
            <SortHeader
              currentDir={sortDir}
              currentKey={sortKey}
              label="Profile"
              onSort={onSort}
              sortKey="profile"
            />
            <TableHead className="text-xs uppercase tracking-wider">
              Complexity
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider">
              Tags
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider">
              Tech
            </TableHead>
            <SortHeader
              className="text-right"
              currentDir={sortDir}
              currentKey={sortKey}
              label="Created"
              onSort={onSort}
              sortKey="created"
            />
            <TableHead className="text-center text-xs uppercase tracking-wider">
              Content
            </TableHead>
            <SortHeader
              currentDir={sortDir}
              currentKey={sortKey}
              label="Score"
              onSort={onSort}
              sortKey="completeness"
            />
            <TableHead className="text-xs uppercase tracking-wider">
              Surfaces
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiments.map((exp) => (
            <ExperimentTableRow
              exp={exp}
              isExpanded={expanded.has(exp.slug)}
              key={exp.slug}
              onToggle={() => toggleRow(exp.slug)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
