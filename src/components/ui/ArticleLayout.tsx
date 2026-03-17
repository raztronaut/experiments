import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Suspense } from "react";
import { TypographyDebugPanel } from "@/components/dev/TypographyDebugPanel";
import { PageActions } from "@/components/mdx/PageActions";
import { RelatedExperimentsSection } from "@/components/ui/RelatedExperimentsSection";
import { AUTHOR_DISPLAY, SITE_URL } from "@/lib/constants";

interface ArticleNavItem {
  href: string;
  title: string;
}

interface ArticleLayoutProps {
  children: React.ReactNode;
  experimentSlug: string;
  experimentTitle: string;
  next?: ArticleNavItem;
  prev?: ArticleNavItem;
  related?: string[];
  publishedAt: string;
  readingTime: string;
  tags?: string[];
  title: string;
  updatedAt?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ArticleLayout({
  title,
  publishedAt,
  updatedAt,
  readingTime,
  experimentSlug,
  experimentTitle,
  children,
  prev,
  next,
  related,
  tags,
}: ArticleLayoutProps) {
  const permalink = `${SITE_URL}/experiments/${experimentSlug}/article`;

  return (
    <div className="mx-auto h-entry max-w-3xl px-4 pt-20 pb-10 sm:px-6 sm:py-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-muted-foreground text-sm"
      >
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden className="select-none">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </li>
          <li>
            <Link
              href={`/experiments/${experimentSlug}`}
              className="transition-colors hover:text-foreground"
            >
              {experimentTitle}
            </Link>
          </li>
          <li aria-hidden className="select-none">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </li>
          <li aria-current="page" className="text-foreground">
            Article
          </li>
        </ol>
      </nav>
      <header className="mb-10">
        <h1 className="p-name font-semibold text-foreground">{title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-1 text-muted-foreground text-sm">
          <time className="dt-published" dateTime={publishedAt}>
            Published {formatDate(publishedAt)}
          </time>
          {updatedAt && updatedAt !== publishedAt && (
            <>
              <span>&middot;</span>
              <time className="dt-updated" dateTime={updatedAt}>
                Updated {formatDate(updatedAt)}
              </time>
            </>
          )}
          <span>&middot;</span>
          <span>{readingTime}</span>
        </div>
        <a className="sr-only h-card p-author" href={SITE_URL} rel="author">
          {AUTHOR_DISPLAY}
        </a>
        <a className="u-url sr-only" href={permalink}>
          Permalink
        </a>
        {tags?.map((tag) => (
          <span className="sr-only p-category" key={tag}>
            {tag}
          </span>
        ))}
      </header>

      <PageActions markdownUrl={`/experiments/${experimentSlug}/article.mdx`} />

      <article className="e-content mt-8 min-w-0">{children}</article>

      <div className="mt-10">
        <Link
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 font-medium text-foreground text-sm transition-colors hover:border-foreground/20 hover:bg-muted/50"
          href={`/experiments/${experimentSlug}`}
        >
          <Play className="h-4 w-4" />
          Try the {experimentTitle} experiment
        </Link>
      </div>

      <Suspense>
        <TypographyDebugPanel />
      </Suspense>

      {related && related.length > 0 && (
        <Suspense fallback={null}>
          <RelatedExperimentsSection slugs={related} variant="article" />
        </Suspense>
      )}

      {(prev || next) && (
        <nav className="mt-16 flex flex-col items-stretch gap-4 border-border border-t pt-8 sm:flex-row">
          {prev ? (
            <Link
              className="group flex flex-1 flex-col gap-1 rounded-lg border border-border p-4 transition-colors hover:border-foreground/20"
              href={prev.href}
            >
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <ChevronLeft className="h-3 w-3" />
                Previous
              </span>
              <span className="font-medium text-sm transition-colors group-hover:text-foreground">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link
              className="group flex flex-1 flex-col items-end gap-1 rounded-lg border border-border p-4 text-right transition-colors hover:border-foreground/20"
              href={next.href}
            >
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                Next
                <ChevronRight className="h-3 w-3" />
              </span>
              <span className="font-medium text-sm transition-colors group-hover:text-foreground">
                {next.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      )}
    </div>
  );
}
