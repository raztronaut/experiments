import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardData } from "./types";
import { PROFILE_COLORS } from "./types";

interface StatsBarProps {
  contentCoverage: DashboardData["contentCoverage"];
  profileDistribution: DashboardData["profileDistribution"];
  stats: DashboardData["stats"];
  warningCount: number;
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardContent className="px-4 py-3">
        <div
          className={cn(
            "font-semibold text-2xl tabular-nums",
            accent ?? "text-zinc-100"
          )}
        >
          {value}
        </div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </CardContent>
    </Card>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {value}/{total} ({pct}%)
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StatsBar({
  stats,
  profileDistribution,
  contentCoverage,
  warningCount,
}: StatsBarProps) {
  const maxProfileCount = Math.max(...Object.values(profileDistribution), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <StatCard label="Total" value={stats.total} />
        <StatCard
          accent="text-emerald-400"
          label="Shipped"
          value={stats.shipped}
        />
        <StatCard accent="text-amber-400" label="WIP" value={stats.wip} />
        <StatCard label="Legacy" value={stats.legacy} />
        <StatCard label="With Articles" value={stats.withArticles} />
        <StatCard label="With Video" value={stats.withVideo} />
        <StatCard
          accent={warningCount > 0 ? "text-red-400" : "text-zinc-100"}
          label="Warnings"
          value={warningCount}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="font-medium text-sm text-zinc-300">
              Content Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4">
            <div className="space-y-3">
              <ProgressRow
                color="bg-emerald-500"
                label="Have video"
                total={contentCoverage.total}
                value={contentCoverage.videos}
              />
              <ProgressRow
                color="bg-blue-500"
                label="Have article"
                total={contentCoverage.total}
                value={contentCoverage.articles}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="font-medium text-sm text-zinc-300">
              Profile Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4">
            <div className="space-y-2">
              {Object.entries(profileDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([profile, count]) => {
                  const pct = Math.round((count / maxProfileCount) * 100);
                  const color =
                    PROFILE_COLORS[profile] ?? "bg-zinc-500/15 text-zinc-400";
                  const barColor = color.split(" ")[0].replace("/15", "");
                  return (
                    <div className="flex items-center gap-3" key={profile}>
                      <span className="w-24 shrink-0 truncate text-xs text-zinc-400">
                        {profile}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={cn("h-full rounded-full", barColor)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right font-mono text-muted-foreground text-xs tabular-nums">
                        {count}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
