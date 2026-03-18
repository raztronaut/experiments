import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isDev = process.env.NODE_ENV === "development";

if (dsn) {
  Sentry.init({
    dsn,

    sendDefaultPii: false,
    enableLogs: false,

    // See console when no events show up in Sentry (e.g. DSN inlined at build time)
    debug: isDev,

    tracesSampleRate: isDev ? 1.0 : 0.1,
    profileSessionSampleRate: isDev ? 1.0 : 0.1,
    profileLifecycle: "trace",

    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // Tunnel through our origin to avoid ad-blockers (Sentry troubleshooting). Path chosen to
    // avoid block lists that match "sentry" / "monitoring" / "ingest". Must match next.config tunnelRoute.
    tunnel: "/_t",

    // Explicit tracing + propagation (Sentry docs)
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.browserProfilingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/[^/]*\.vercel\.app/,
      /^https:\/\/www\.razisyed\.cv/,
    ],
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
