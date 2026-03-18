import * as Sentry from "@sentry/nextjs";
import type { ErrorInfo } from "react";

/**
 * True when Sentry DSN is configured (client or server).
 * Client: NEXT_PUBLIC_SENTRY_DSN. Server/Edge: SENTRY_DSN ?? NEXT_PUBLIC_SENTRY_DSN.
 */
export function isSentryEnabled(): boolean {
  if (typeof window !== "undefined") {
    return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
  }
  return Boolean(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/**
 * Report an error to Sentry when DSN is set. No-op when Sentry is disabled.
 * Use in error boundaries and route error.tsx for env-gated reporting.
 */
export function captureExperimentError(
  error: Error,
  errorInfo?: ErrorInfo,
  tags?: Record<string, string>
): void {
  if (!isSentryEnabled()) {
    return;
  }
  Sentry.captureException(error, {
    extra: errorInfo?.componentStack
      ? { componentStack: errorInfo.componentStack }
      : undefined,
    tags,
  });
}
