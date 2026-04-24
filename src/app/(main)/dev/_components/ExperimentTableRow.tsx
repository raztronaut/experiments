"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ComplexityBadge,
  ListingBadge,
  ProfileBadge,
  StatusBadge,
  SurfacePill,
} from "./badges";
import { CompletenessBar } from "./CompletenessBar";
import type { ExperimentRow } from "./types";
import { TABLE_COLUMN_COUNT } from "./types";

function relativeDate(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) {
    return "today";
  }
  if (days === 1) {
    return "yesterday";
  }
  if (days < 30) {
    return `${days}d ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function ContentIndicator({
  label,
  active,
  tooltip,
}: {
  label: string;
  active: boolean;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "cursor-default",
            active ? "text-emerald-500" : "text-zinc-800"
          )}
        >
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function ExpandedRow({ exp }: { exp: ExperimentRow }) {
  return (
    <TableRow className="bg-zinc-900/60 hover:bg-zinc-900/60">
      <TableCell className="px-3 py-3" colSpan={TABLE_COLUMN_COUNT}>
        <div className="grid gap-4 text-xs text-zinc-400 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="mb-1 font-medium text-zinc-300">Description</div>
            <p className="leading-relaxed">{exp.description}</p>
          </div>

          {exp.missingFields.length > 0 && (
            <div>
              <div className="mb-1 font-medium text-zinc-300">
                Missing Fields
              </div>
              <ul className="list-inside list-disc space-y-0.5">
                {exp.missingFields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {exp.inspiration && exp.inspiration.length > 0 && (
            <div>
              <div className="mb-1 font-medium text-zinc-300">Inspiration</div>
              <ul className="space-y-0.5">
                {exp.inspiration.map((link) => (
                  <li key={link.url}>
                    <a
                      className="underline decoration-zinc-700 underline-offset-2 hover:decoration-zinc-400"
                      href={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exp.related && exp.related.length > 0 && (
            <div>
              <div className="mb-1 font-medium text-zinc-300">Related</div>
              <div className="flex flex-wrap gap-1">
                {exp.related.map((slug) => (
                  <Link
                    className="rounded bg-zinc-800 px-2 py-0.5 hover:bg-zinc-700"
                    href={`/experiments/${slug}`}
                    key={slug}
                  >
                    {slug}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function PillList({ items, max = 2 }: { items: string[]; max?: number }) {
  if (items.length === 0) {
    return <span className="text-zinc-700">&mdash;</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.slice(0, max).map((t) => (
        <Badge
          className="border-zinc-700 bg-zinc-800 text-[10px] text-zinc-400"
          key={t}
          variant="outline"
        >
          {t}
        </Badge>
      ))}
      {items.length > max && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default text-[10px] text-muted-foreground">
              +{items.length - max}
            </span>
          </TooltipTrigger>
          <TooltipContent>{items.join(", ")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function ExperimentTableRow({
  exp,
  isExpanded,
  onToggle,
}: {
  exp: ExperimentRow;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <TableRow className="hover:bg-zinc-900/40">
        <TableCell>
          <Button
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? "Collapse row details" : "Expand row details"
            }
            className={cn(
              "h-6 w-6 text-muted-foreground transition-transform hover:text-zinc-300",
              isExpanded && "rotate-90"
            )}
            onClick={onToggle}
            size="icon"
            variant="ghost"
          >
            ▸
          </Button>
        </TableCell>

        <TableCell>
          <Link
            className="font-medium text-zinc-200 underline decoration-zinc-700 underline-offset-2 hover:decoration-zinc-400"
            href={`/experiments/${exp.slug}`}
          >
            {exp.title}
          </Link>
          <div className="mt-0.5 text-muted-foreground text-xs">{exp.slug}</div>
        </TableCell>

        <TableCell>
          <StatusBadge status={exp.status} />
        </TableCell>

        <TableCell>
          <ListingBadge explicit={exp.listingExplicit} listing={exp.listing} />
        </TableCell>

        <TableCell>
          {exp.profile ? (
            <ProfileBadge profile={exp.profile} />
          ) : (
            <span className="text-zinc-700">&mdash;</span>
          )}
        </TableCell>

        <TableCell>
          {exp.complexity ? (
            <ComplexityBadge complexity={exp.complexity} />
          ) : (
            <span className="text-zinc-700">&mdash;</span>
          )}
        </TableCell>

        <TableCell className="max-w-32">
          <PillList items={exp.tags} />
        </TableCell>

        <TableCell className="max-w-32">
          <PillList items={exp.tech} />
        </TableCell>

        <TableCell className="text-right">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-xs text-zinc-400">
                {relativeDate(exp.created)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{exp.created}</TooltipContent>
          </Tooltip>
        </TableCell>

        <TableCell>
          <div className="flex justify-center gap-2">
            <ContentIndicator
              active={!!exp.legacy}
              label="L"
              tooltip={exp.legacy ? "Legacy" : "Not legacy"}
            />
            <ContentIndicator
              active={!!exp.video}
              label="V"
              tooltip={exp.video ? "Has video" : "No video"}
            />
            <ContentIndicator
              active={exp.hasArticle}
              label="A"
              tooltip={exp.hasArticle ? "Has article" : "No article"}
            />
          </div>
        </TableCell>

        <TableCell>
          <CompletenessBar score={exp.completenessScore} />
        </TableCell>

        <TableCell>
          <div className="flex flex-wrap gap-1">
            {exp.surfaces.map((s) => (
              <SurfacePill key={s} surface={s} />
            ))}
          </div>
        </TableCell>

        <TableCell>
          <div className="flex gap-2">
            <Link
              className="text-xs text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
              href={`/experiments/${exp.slug}`}
            >
              View
            </Link>
            {exp.hasArticle && (
              <Link
                className="text-xs text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
                href={`/experiments/${exp.slug}/article`}
              >
                Article
              </Link>
            )}
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && <ExpandedRow exp={exp} />}
    </TooltipProvider>
  );
}
