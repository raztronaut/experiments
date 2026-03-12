"use client";

import type React from "react";
import { Suspense } from "react";

interface LiveDemoProps {
  children?: React.ReactNode;
  height?: string;
  slug?: string;
}

export function LiveDemo({ slug, height = "400px", children }: LiveDemoProps) {
  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="relative" style={{ height }}>
          {children ? (
            <Suspense fallback={<DemoSkeleton />}>
              <div className="h-full w-full">{children}</div>
            </Suspense>
          ) : slug ? (
            <iframe
              className="h-full w-full border-0"
              loading="lazy"
              src={`/experiments/${slug}`}
              title={`Live demo: ${slug}`}
            />
          ) : (
            <DemoSkeleton />
          )}
        </div>
        {slug && (
          <div className="flex items-center justify-between border-border border-t px-3 py-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
            <a
              className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              href={`/experiments/${slug}`}
            >
              Open full page
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1={10} x2={21} y1={14} y2={3} />
              </svg>
            </a>
          </div>
        )}
      </div>
    </figure>
  );
}

function DemoSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/30 text-muted-foreground text-sm">
      Loading demo...
    </div>
  );
}
