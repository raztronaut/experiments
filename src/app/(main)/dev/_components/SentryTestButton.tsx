"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { captureExperimentError, isSentryEnabled } from "@/lib/sentry";

const TEST_MESSAGE = "Sentry test from /dev dashboard";

export function SentryTestButton() {
  const [sent, setSent] = useState(false);

  if (!isSentryEnabled()) {
    return (
      <p className="text-muted-foreground text-xs">
        Sentry disabled (no DSN). Set env vars to test.
      </p>
    );
  }

  const handleSendTest = () => {
    captureExperimentError(new Error(TEST_MESSAGE), undefined, {
      source: "dev-dashboard",
      test: "true",
    });
    setSent(true);
  };

  const handleThrow = () => {
    throw new Error(`${TEST_MESSAGE} (throw)`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSendTest}
        aria-label="Send test error to Sentry"
      >
        Send test to Sentry
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleThrow}
        aria-label="Throw test error (tests error boundary)"
      >
        Throw test error
      </Button>
      {sent && (
        <span className="text-muted-foreground text-xs">
          Sent — check Sentry Issues in ~30s.
        </span>
      )}
    </div>
  );
}
