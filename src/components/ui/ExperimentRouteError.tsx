"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { captureExperimentError } from "@/lib/sentry";

type RouteError = Error & { digest?: string };

interface ExperimentRouteErrorProps {
  error: RouteError;
  reset: () => void;
  slug: string;
}

/**
 * Shared fallback for experiment route `error.tsx` boundaries. Reports to Sentry
 * (env-gated) and offers a retry. Distinct from `ExperimentErrorBoundary`, which
 * is a class boundary for inline component trees without `reset`/`digest`.
 */
export function ExperimentRouteError({
  error,
  reset,
  slug,
}: ExperimentRouteErrorProps) {
  useEffect(() => {
    console.error(error);
    captureExperimentError(error, undefined, { route: "experiment", slug });
  }, [error, slug]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h2 className="font-bold text-red-600 text-xl">Something went wrong!</h2>
      <p className="text-muted-foreground">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="text-muted-foreground/60 text-xs">
          Error ID: {error.digest}
        </p>
      )}
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
