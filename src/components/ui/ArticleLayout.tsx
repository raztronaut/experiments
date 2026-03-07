"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type React from "react";

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
  publishedAt: string;
  readingTime: string;
  title: string;
  updatedAt?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
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
}: ArticleLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-muted-foreground text-sm">
        <Link className="transition-colors hover:text-foreground" href="/">
          Home
        </Link>
        <span>&gt;</span>
        <Link
          className="transition-colors hover:text-foreground"
          href={`/experiments/${experimentSlug}`}
        >
          {experimentTitle}
        </Link>
        <span>&gt;</span>
        <span className="text-foreground">Article</span>
      </nav>

      <header className="mb-10">
        <p className="font-semibold text-foreground">{title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-1 text-muted-foreground text-sm">
          <span>Published {formatDate(publishedAt)}</span>
          {updatedAt && updatedAt !== publishedAt && (
            <>
              <span>&middot;</span>
              <span>Updated {formatDate(updatedAt)}</span>
            </>
          )}
          <span>&middot;</span>
          <span>{readingTime}</span>
        </div>
      </header>

      {/* TOC commented out for now -- will re-enable after styling is finalized */}
      {/* <MobileTOC /> */}

      <article className="min-w-0">{children}</article>

      {(prev || next) && (
        <nav className="mt-16 flex items-stretch gap-4 border-border border-t pt-8">
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
