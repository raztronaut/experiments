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
    captureExperimentError(error, undefined, { route: "main" });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 font-bold text-2xl tracking-tight">
        Something went wrong!
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        An error occurred in this experiment. Check the console for details.
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
