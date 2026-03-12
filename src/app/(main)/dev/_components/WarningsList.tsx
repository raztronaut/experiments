import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Warning } from "./types";
import { SEVERITY_STYLES } from "./types";

interface WarningsListProps {
  warnings: Warning[];
}

const SEVERITY_ORDER: Record<string, number> = { error: 0, warn: 1, info: 2 };
const SEVERITY_LABELS: Record<string, string> = {
  error: "Errors",
  warn: "Warnings",
  info: "Info",
};

export function WarningsList({ warnings }: WarningsListProps) {
  if (warnings.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="px-4 py-8 text-center text-muted-foreground text-sm">
          No warnings. Everything looks good.
        </CardContent>
      </Card>
    );
  }

  const grouped = warnings.reduce<Record<string, Warning[]>>((acc, w) => {
    const key = w.severity;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(w);
    return acc;
  }, {});

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) => (SEVERITY_ORDER[a] ?? 9) - (SEVERITY_ORDER[b] ?? 9)
  );

  return (
    <div className="space-y-4">
      {sortedGroups.map(([severity, items]) => (
        <div key={severity}>
          <h3 className="mb-2 font-medium text-sm text-zinc-400">
            {SEVERITY_LABELS[severity] ?? severity} ({items.length})
          </h3>
          <div className="space-y-1.5">
            {items.map((w, i) => (
              <div
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  SEVERITY_STYLES[w.severity]
                )}
                key={`${w.slug}-${i}`}
              >
                <Link
                  className="font-medium font-mono underline decoration-current/30 underline-offset-2 hover:decoration-current"
                  href={`/experiments/${w.slug}`}
                >
                  {w.slug}
                </Link>
                <span className="mx-2 text-zinc-600">&mdash;</span>
                {w.message}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
