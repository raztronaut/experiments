---
name: ""
overview: ""
todos: []
isProject: false
---

# Sentry S-Tier Implementation Plan

**Status:** Ready to execute  
**Reference:** [Sentry Next.js SDK skill](https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-nextjs-sdk/SKILL.md), [docs.sentry.io Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)  
**Free tier:** 50k errors/mo, 5M spans/mo, 50 replays/mo — this plan stays within limits.

---

## Overview

Env-gated Sentry setup across browser, Node server, and Edge: error monitoring, tracing, and replay-on-error only. Uses current Sentry best practices (`instrumentation-client.ts`, `onRequestError`, `global-error.tsx`, tunnel route). No Sentry code runs when DSN is unset (graceful degradation per AGENTS.md).

---

## 1. Config Files (Root)

### 1.1 `instrumentation-client.ts` (browser / client)

- **Location:** project root (not `sentry.client.config.ts` — skill uses this name).
- **Behavior:** Only call `Sentry.init()` when `process.env.NEXT_PUBLIC_SENTRY_DSN` is set.
- **Options:**
  - `dsn: process.env.NEXT_PUBLIC_SENTRY_DSN`
  - `tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1`
  - `replaysSessionSampleRate: 0`, `replaysOnErrorSampleRate: 1.0` (replay only when error)
  - `integrations: [Sentry.replayIntegration()]`
  - `sendDefaultPii: false`, `enableLogs: false`
- **Export:** `export const onRouterTransitionStart = Sentry.captureRouterTransitionStart` (App Router navigation spans).

### 1.2 `sentry.server.config.ts` (Node server)

- Only init when DSN set: `process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN`.
- Same `tracesSampleRate` as client.
- `includeLocalVariables: false`, `sendDefaultPii: false`, `enableLogs: false`.

### 1.3 `sentry.edge.config.ts` (Edge)

- Same DSN fallback and sample rate as server; no replay/local vars.

### 1.4 `instrumentation.ts` (bootstrap)

- `register()`: when `NEXT_RUNTIME === "nodejs"` import `./sentry.server.config`; when `NEXT_RUNTIME === "edge"` import `./sentry.edge.config`. Client is loaded by Next.js from `instrumentation-client.ts`.
- **Export:** `export const onRequestError = Sentry.captureRequestError` (auto-capture unhandled server request errors; requires `@sentry/nextjs` >= 8.28.0).

---

## 2. Error Boundaries and Global Error

### 2.1 `app/global-error.tsx`

- **Required** for App Router: catches root layout and critical React errors.
- "use client"; in `useEffect` call `Sentry.captureException(error)`; render minimal full-page UI (e.g. `<NextError statusCode={0} />`). Only call Sentry when DSN is set (check in effect or use a small helper).

### 2.2 `src/lib/sentry.ts` (shared helper)

- `isSentryEnabled(): boolean` — true when `process.env.NEXT_PUBLIC_SENTRY_DSN` (or server `SENTRY_DSN`/fallback) is set.
- `captureExperimentError(error: Error, errorInfo?: React.ErrorInfo, tags?: Record<string, string>): void` — if enabled, call `Sentry.captureException(error, { extra: { componentStack: errorInfo?.componentStack }, tags })`; otherwise no-op. Use in error boundaries and route error.tsx so all reporting is env-gated in one place.

### 2.3 `ExperimentErrorBoundary` ([src/components/ui/ExperimentErrorBoundary.tsx](src/components/ui/ExperimentErrorBoundary.tsx))

- In `componentDidCatch`: call `captureExperimentError(error, errorInfo)` from `@/lib/sentry`. Optional tag e.g. `context: 'experiment-boundary'`.

### 2.4 `CanvasErrorBoundary` ([src/lib/toolkit/r3f.tsx](src/lib/toolkit/r3f.tsx))

- In `componentDidCatch`: call `captureExperimentError(error, errorInfo, { context: 'r3f-canvas' })`.

### 2.5 Experiment route `error.tsx`

- **Plop template** [plop-templates/experiment/route-error.tsx.hbs](plop-templates/experiment/route-error.tsx.hbs): in `useEffect` call `captureExperimentError(error, undefined, { route: 'experiment', slug: '<experiment-slug>' })`. Slug can be from layout/segment or a prop; document how slug is passed in template.
- **Existing experiments:** One-time pass over every `src/app/experiments/(<slug>)/<slug>/error.tsx` to add the same capture with the correct slug (or a small script that injects it).

---

## 3. Next Config and Build

### 3.1 `next.config.ts`

- Wrap existing config with `withSentryConfig(nextConfig, { org, project, authToken: process.env.SENTRY_AUTH_TOKEN, widenClientFileUpload: true, tunnelRoute: "/monitoring", silent: !process.env.CI })`. Use `process.env.SENTRY_ORG` / `process.env.SENTRY_PROJECT` or placeholders; only apply wrapper when Sentry is desired (e.g. when `process.env.SENTRY_AUTH_TOKEN` or `NEXT_PUBLIC_SENTRY_DSN` is set) so builds without env remain unchanged.
- **CSP:** Add to `connect-src`: `https://*.ingest.sentry.io` and your tunnel origin if used (e.g. same origin for `/monitoring`).

### 3.2 Middleware

- If [middleware.ts](middleware.ts) exists, add `monitoring` to the matcher exclusion so the tunnel route is not blocked: e.g. `(?!monitoring|_next/static|_next/image|favicon.ico)`.

### 3.3 Source maps

- Auth token: create in Sentry (Settings → Auth Tokens) with `project:releases` and `org:read`. Set `SENTRY_AUTH_TOKEN` in Vercel and optionally in CI. Add `.env.sentry-build-plugin` to `.gitignore` if used locally.
- Plugin uploads source maps on `next build`; `productionBrowserSourceMaps: true` already set.

---

## 4. Layout and CSP

- **Main layout** [src/app/(main)/layout.tsx](src/app/(main)/layout.tsx): add preconnect for Sentry ingest, e.g. `<link href="https://*.ingest.sentry.io" rel="preconnect" />` (or exact host). CSP already updated in next.config.

---

## 5. Dependency and Env

- Add `@sentry/nextjs` (current stable, >= 8.28.0 for `onRequestError`).
- **Env vars:** `NEXT_PUBLIC_SENTRY_DSN` (required for client; use same for server/edge fallback). Optional: `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` for build/upload.

---

## 6. Documentation and Agent Updates

- **[docs/performance.md](docs/performance.md):** Add "Sentry" subsection: env vars, tunnel, source maps, link to Sentry Next.js docs. Add Sentry to "Ongoing Monitoring" table and "Implemented Optimizations" (env-gated, errors + tracing + replay-on-error).
- **[AGENTS.md](AGENTS.md):** Note Sentry is optional; `NEXT_PUBLIC_SENTRY_DSN` (and optionally `SENTRY_AUTH_TOKEN`) enable it; no `.env` required for local run.
- **[.agents/rules/performance.md](.agents/rules/performance.md):** Add bullet: report errors via `@/lib/sentry`; do not log PII or secrets in Sentry.
- **Cursor rules:** If any experiment/performance rule exists, add one line: use `captureExperimentError` from `@/lib/sentry` for error boundaries and route errors.

---

## 7. Tests and Verification

- **Unit:** Test `src/lib/sentry.ts`: `isSentryEnabled()` false when DSN unset, true when set (mock env). Test `captureExperimentError` no-op when unset, calls `Sentry.captureException` when set (mock Sentry).
- **Error boundaries:** In ExperimentErrorBoundary (and optionally CanvasErrorBoundary) tests, assert that when a child throws, fallback renders and capture helper is invoked when Sentry is mocked.
- **Verification (manual):** After deploy, throw a test error in a server action or API route, confirm event in Sentry Issues with readable stack trace, then remove the test.
- **Bundle:** Run `npm run budget` and `npm run analyze:output` after integration; update [docs/performance-metrics.md](docs/performance-metrics.md) if totals change.

---

## 8. Implementation Order

1. Install `@sentry/nextjs`, add env var docs.
2. Create `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts` (all env-gated).
3. Create `src/lib/sentry.ts` (isSentryEnabled, captureExperimentError).
4. Add `app/global-error.tsx`.
5. Update ExperimentErrorBoundary and CanvasErrorBoundary to use captureExperimentError.
6. Update plop template `route-error.tsx.hbs` and run one-time pass on existing experiment error.tsx files.
7. Wrap next.config with withSentryConfig; add CSP and tunnel; update middleware matcher if present.
8. Add preconnect in main layout.
9. Update docs/performance.md, AGENTS.md, .agents/rules/performance.md, Cursor rules.
10. Add unit tests for sentry.ts and error boundaries; run budget/Lighthouse; verify in Sentry then remove test error.

---

## 9. Checklist Summary


| Item              | Action                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Config files      | instrumentation-client.ts, sentry.server.config.ts, sentry.edge.config.ts, instrumentation.ts (env-gated, onRequestError, onRouterTransitionStart) |
| Helpers           | src/lib/sentry.ts (isSentryEnabled, captureExperimentError)                                                                                        |
| Global error      | app/global-error.tsx with captureException                                                                                                         |
| Boundaries        | ExperimentErrorBoundary, CanvasErrorBoundary → captureExperimentError                                                                              |
| Experiment errors | Plop template + one-time pass for existing error.tsx                                                                                               |
| Next config       | withSentryConfig (tunnelRoute, widenClientFileUpload, authToken), CSP, conditional wrap                                                            |
| Middleware        | Exclude `monitoring` in matcher if middleware exists                                                                                               |
| Layout            | Preconnect Sentry ingest                                                                                                                           |
| Docs              | performance.md, AGENTS.md, .agents/rules/performance.md, Cursor rules                                                                              |
| Tests             | sentry.ts unit tests, error boundary tests with mocked Sentry                                                                                      |
| Verify            | Throw test error → check Sentry → remove                                                                                                           |


