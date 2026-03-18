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
    profilesSampleRate: isDev ? 1.0 : 0.1,

    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // Explicit tracing + propagation (Sentry docs); tunnel is set via next.config tunnelRoute
    integrations: [
      Sentry.browserTracingIntegration(),
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
