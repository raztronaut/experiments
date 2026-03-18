"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { captureExperimentError } from "@/lib/sentry";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    captureExperimentError(error, undefined, {
      route: "experiment",
      slug: "non-euclidean-hyperbolic-workspace",
    });
  }, [error]);

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
