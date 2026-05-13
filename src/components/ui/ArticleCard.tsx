"use client";

import { ArrowRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useRef } from "react";
import type { Article } from "@/lib/articles";

const PREFETCH_HOVER_DELAY_MS = 100;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

interface ArticleCardProps {
  article: Article;
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
}

/**
 * Article card with prefetch={false} and hover-triggered prefetch.
 * Reduces bandwidth vs viewport prefetch when many articles are visible.
 */
export function ArticleCard({
  article,
  onMouseEnter,
  onMouseLeave,
}: ArticleCardProps) {
  const router = useRouter();
  const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      prefetchTimeoutRef.current = setTimeout(() => {
        router.prefetch(article.href);
        prefetchTimeoutRef.current = null;
      }, PREFETCH_HOVER_DELAY_MS);
      onMouseEnter?.(e);
    },
    [article.href, onMouseEnter, router]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
        prefetchTimeoutRef.current = null;
      }
      onMouseLeave?.(e);
    },
    [onMouseLeave]
  );

  return (
    <Link
      className="group flex flex-col gap-3 rounded-xl border border-border p-5 transition-[border-color,box-shadow] duration-200 hover:border-foreground/20 hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
      data-umami-event="article_click"
      data-umami-event-article={article.slug}
      href={article.href}
      prefetch={false}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-muted-foreground/60 text-xs">
          {formatDate(article.publishedAt)}
        </span>
        <span className="font-mono text-muted-foreground/60 text-xs">
          {article.readingMinutes} min read
        </span>
      </div>

      <div>
        <h3 className="font-semibold text-foreground leading-tight tracking-tight transition-colors group-hover:text-primary">
          {article.title}
        </h3>
      </div>

      {article.description && (
        <p className="line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed">
          {article.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-[10px] text-primary">
          <FlaskConical className="h-3 w-3" />
          View Experiment
        </span>
        {article.tech?.map((t) => (
          <span
            className="rounded-full bg-accent px-2 py-0.5 font-medium text-[10px] text-accent-foreground"
            key={t}
          >
            {t}
          </span>
        ))}
      </div>

      <span className="flex items-center gap-1 text-muted-foreground text-xs transition-colors group-hover:text-foreground">
        Read article
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
