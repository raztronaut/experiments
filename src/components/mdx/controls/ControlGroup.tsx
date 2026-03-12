import type React from "react";
import { cn } from "@/lib/utils";

export interface ControlGroupProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
  /** Keep multi-column layout on mobile instead of collapsing to 1 column. */
  compact?: boolean;
}

export function ControlGroup({
  children,
  columns = 1,
  compact,
  className,
}: ControlGroupProps) {
  return (
    <div
      className={cn(
        "grid gap-4 text-sm",
        compact
          ? columns >= 2 && "grid-cols-2"
          : columns === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}
