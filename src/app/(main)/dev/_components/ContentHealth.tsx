import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ProfileBadge, StatusBadge } from "./badges";
import { CompletenessBar } from "./CompletenessBar";
import type { ExperimentRow } from "./types";

interface ContentHealthProps {
  experiments: ExperimentRow[];
}

function HistogramBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-right text-muted-foreground text-xs">
        {label}
      </span>
      <div className="h-4 flex-1 overflow-hidden rounded bg-zinc-800">
        <div
          className={cn(
            "flex h-full items-center rounded pl-2 font-medium text-[10px] text-white",
            color
          )}
          style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
        >
          {count > 0 && count}
        </div>
      </div>
    </div>
  );
}

export function ContentHealth({ experiments }: ContentHealthProps) {
  const sorted = [...experiments].sort(
    (a, b) => a.completenessScore - b.completenessScore
  );

  const avgScore =
    experiments.length > 0
      ? Math.round(
          experiments.reduce((s, e) => s + e.completenessScore, 0) /
            experiments.length
        )
      : 0;

  const buckets = { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 };
  for (const e of experiments) {
    if (e.completenessScore <= 25) {
      buckets["0-25"]++;
    } else if (e.completenessScore <= 50) {
      buckets["26-50"]++;
    } else if (e.completenessScore <= 75) {
      buckets["51-75"]++;
    } else {
      buckets["76-100"]++;
    }
  }
  const maxBucket = Math.max(...Object.values(buckets), 1);

  const almostPublishable = experiments.filter(
    (e) =>
      e.completenessScore >= 75 &&
      e.completenessScore < 100 &&
      e.missingFields.length <= 3
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="font-medium text-sm text-zinc-300">
              Lab Health Score
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-2 pb-4">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "font-bold text-4xl tabular-nums",
                  avgScore >= 70
                    ? "text-emerald-400"
                    : avgScore >= 40
                      ? "text-amber-400"
                      : "text-red-400"
                )}
              >
                {avgScore}%
              </span>
              <span className="text-muted-foreground text-sm">
                average across {experiments.length} experiments
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="font-medium text-sm text-zinc-300">
              Completeness Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4">
            <div className="space-y-2">
              <HistogramBar
                color="bg-red-500/80"
                count={buckets["0-25"]}
                label="0-25%"
                max={maxBucket}
              />
              <HistogramBar
                color="bg-amber-500/80"
                count={buckets["26-50"]}
                label="26-50%"
                max={maxBucket}
              />
              <HistogramBar
                color="bg-yellow-500/80"
                count={buckets["51-75"]}
                label="51-75%"
                max={maxBucket}
              />
              <HistogramBar
                color="bg-emerald-500/80"
                count={buckets["76-100"]}
                label="76-100%"
                max={maxBucket}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {almostPublishable.length > 0 && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="font-medium text-emerald-400 text-sm">
              Almost Publishable ({almostPublishable.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-2 pb-4">
            <p className="mb-3 text-muted-foreground text-xs">
              These experiments are close to complete. A small push would get
              them over the line.
            </p>
            <div className="space-y-2">
              {almostPublishable.map((exp) => (
                <div
                  className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2"
                  key={exp.slug}
                >
                  <div className="flex items-center gap-2">
                    <Link
                      className="font-medium text-sm text-zinc-200 underline decoration-zinc-700 underline-offset-2 hover:decoration-zinc-400"
                      href={`/experiments/${exp.slug}`}
                    >
                      {exp.title}
                    </Link>
                    <span className="font-mono text-emerald-400 text-xs">
                      {exp.completenessScore}%
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {exp.missingFields.map((f) => (
                      <Badge
                        className="border-zinc-700 bg-zinc-800 text-[10px] text-zinc-400"
                        key={f}
                        variant="outline"
                      >
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="mb-3 font-medium text-sm text-zinc-300">
          All Experiments by Completeness
        </h3>
        <div className="rounded-lg border border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider">
                <TableHead>Experiment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Missing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((exp) => (
                <TableRow className="hover:bg-zinc-900/40" key={exp.slug}>
                  <TableCell>
                    <Link
                      className="text-zinc-200 underline decoration-zinc-700 underline-offset-2 hover:decoration-zinc-400"
                      href={`/experiments/${exp.slug}`}
                    >
                      {exp.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={exp.status} />
                  </TableCell>
                  <TableCell>
                    {exp.profile ? (
                      <ProfileBadge profile={exp.profile} />
                    ) : (
                      <span className="text-zinc-700">&mdash;</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <CompletenessBar score={exp.completenessScore} />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {exp.missingFields.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {exp.missingFields.map((f) => (
                          <Badge
                            className="border-zinc-700 bg-zinc-800 text-[10px] text-muted-foreground"
                            key={f}
                            variant="outline"
                          >
                            {f}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-500 text-xs">Complete</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
