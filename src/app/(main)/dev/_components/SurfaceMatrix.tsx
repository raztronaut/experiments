import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ALL_SURFACES,
  type ExperimentRow,
  SURFACE_COLORS,
  type Surface,
} from "./types";

const SHORT_LABELS: Record<Surface, string> = {
  Homepage: "Home",
  "Dev Homepage": "Dev",
  Registry: "Reg.",
  "llms.txt": "LLMs",
  Posters: "Post.",
  Articles: "Art.",
  Sitemap: "Site",
  RSS: "RSS",
};

interface SurfaceMatrixProps {
  experiments: ExperimentRow[];
}

function surfaceRule(exp: ExperimentRow, surface: string): string {
  if (exp.status === "wip") {
    return surface === "Dev Homepage"
      ? "wip → Dev Homepage"
      : "wip → not visible";
  }
  if (exp.listing === "registry") {
    return surface === "Registry"
      ? "shipped + registry → Registry only"
      : "shipped + registry → not visible";
  }
  if (exp.listing === "dev") {
    return ["Dev Homepage", "Registry", "llms.txt"].includes(surface)
      ? `shipped + dev → ${surface}`
      : "shipped + dev → not visible";
  }
  if (surface === "Posters") {
    return exp.video
      ? "shipped + public + video"
      : "shipped + public, no video";
  }
  if (surface === "Articles") {
    return exp.hasArticle
      ? "shipped + public + article"
      : "shipped + public, no article";
  }
  return `shipped + public → ${surface}`;
}

export function SurfaceMatrix({ experiments }: SurfaceMatrixProps) {
  const sorted = [...experiments].sort((a, b) => {
    const statusOrder: Record<string, number> = { shipped: 0, wip: 1 };
    const listingOrder: Record<string, number> = {
      public: 0,
      dev: 1,
      registry: 2,
    };
    const sd = (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2);
    if (sd !== 0) {
      return sd;
    }
    return (listingOrder[a.listing] ?? 3) - (listingOrder[b.listing] ?? 3);
  });

  const totals: Record<string, number> = {};
  for (const s of ALL_SURFACES) {
    totals[s] = experiments.filter((e) => e.surfaces.includes(s)).length;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-lg border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider">
              <TableHead className="sticky left-0 bg-zinc-900/80">
                Experiment
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Listing</TableHead>
              {ALL_SURFACES.map((s) => (
                <TableHead className="text-center" key={s}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">{SHORT_LABELS[s]}</span>
                    </TooltipTrigger>
                    <TooltipContent>{s}</TooltipContent>
                  </Tooltip>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((exp) => (
              <TableRow className="hover:bg-zinc-900/40" key={exp.slug}>
                <TableCell className="sticky left-0 bg-zinc-950">
                  <Link
                    className="text-xs text-zinc-300 underline decoration-zinc-700 underline-offset-2 hover:decoration-zinc-400"
                    href={`/experiments/${exp.slug}`}
                  >
                    {exp.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-medium text-xs",
                      exp.status === "shipped"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    )}
                  >
                    {exp.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-zinc-400">{exp.listing}</span>
                </TableCell>
                {ALL_SURFACES.map((s) => {
                  const active = exp.surfaces.includes(s);
                  const rule = surfaceRule(exp, s);
                  const colorClass = active
                    ? (SURFACE_COLORS[s]?.split(" ")[1] ?? "text-emerald-400")
                    : "text-zinc-800";
                  return (
                    <TableCell className="text-center" key={s}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn("cursor-default text-sm", colorClass)}
                          >
                            {active ? "●" : "·"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{rule}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="border-zinc-800 bg-zinc-900/80">
            <TableRow className="text-muted-foreground text-xs hover:bg-zinc-900/80">
              <TableCell className="sticky left-0 bg-zinc-900/80 font-medium">
                Totals
              </TableCell>
              <TableCell />
              <TableCell />
              {ALL_SURFACES.map((s) => (
                <TableCell
                  className="text-center font-mono tabular-nums"
                  key={s}
                >
                  {totals[s]}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </TooltipProvider>
  );
}
