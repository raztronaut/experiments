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
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-background"
        style={{ height }}
      >
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
        <figcaption className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
          <span>Live demo</span>
          <a
            className="underline underline-offset-4 transition-colors hover:text-foreground"
            href={`/experiments/${slug}`}
          >
            Open full page
          </a>
        </figcaption>
      )}
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
