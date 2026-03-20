---
name: sentry-audit-fix
overview: Patch deterministic Sentry probes so tagging (`route`/`slug`) is verifiable and the healthcheck probe reliably produces an attached Performance transaction/span (with profiling when supported), then rerun the same live verification checklist against `https://razisyed.cv`.
todos:
  - id: patch-prod-verify-route-main
    content: "Update `src/components/monitoring/SentryProdTestTrigger.tsx` to add `route: \"main\"` to tags passed to `captureExperimentError`."
    status: completed
  - id: add-experiment-verify-trigger
    content: "Create `src/components/monitoring/SentryExperimentProdTestTrigger.tsx` that handles `?sentry_test=experiment-verify`, calls `captureExperimentError` with `route: \"experiment\"` + `slug: \"bugged-out-game-of-life-shader-experiment\"`, and removes the param after firing."
    status: completed
  - id: mount-experiment-verify-trigger
    content: Mount `SentryExperimentProdTestTrigger` in `src/app/(main)/layout.tsx` alongside the existing Sentry triggers.
    status: completed
  - id: fix-healthcheck-transaction-span
    content: "Update `src/components/monitoring/SentryHealthcheckTrigger.tsx` to create an explicit transaction and a nested span so Sentry Performance traces include `Sentry healthcheck span`, aligning with `profileLifecycle: \"trace\"`."
    status: completed
  - id: preflight-again
    content: "Re-run local gates in `/Users/razisyed/Developer/experiments`: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run budget`."
    status: completed
  - id: reverify-live-site
    content: Re-run the live verification checklist via `user-chrome-devtools` for the three deterministic probes and via Sentry MCP for tags + symbolication + Performance span visibility.
    status: completed
  - id: compile-final-results
    content: Produce a concise updated pass/fail report with evidence IDs/URLs (issue/event ids + trace/span ids + symbolication + profiling linkage notes).
    status: completed
isProject: false
---

## What we found (from the investigation)

1. `prod-verify` is emitting the expected error event and symbolicated first-party stack frame, with tags `source=prod-query-param` + `test=true`, release `ad0b7046…`.
2. `healthcheck` emits the expected message and includes `profiler_id` in event context, but the expected Performance span/trace was not visible in trace lookup (`Total Spans: 0`). We also saw no event attachments via the MCP attachment tool.
3. Tagging sanity (`route=main` + experiment `route=experiment` + `slug`) was not verifiable because:
  - deterministic `prod-verify` currently does not set `route`.
  - no recent Sentry events with `route=main` were found.
  - the best-effort experiment runtime attempt did not naturally produce an experiment error boundary event.

## Implementation approach

- Make deterministic probes produce the exact tags the checklist needs.
- Make the healthcheck probe create an explicit transaction and a child span, so `profileLifecycle: "trace"` has a concrete trace context to attach to.

## Code changes

### 1) Make `prod-verify` also tag as `route: "main"`

- Update `[src/components/monitoring/SentryProdTestTrigger.tsx](src/components/monitoring/SentryProdTestTrigger.tsx)` to include:
  - `route: "main"` (tags passed into `captureExperimentError`).

### 2) Add a deterministic experiment error probe (for `route` + `slug` verification)

- Add a new component `[src/components/monitoring/SentryExperimentProdTestTrigger.tsx]` (name can vary, but keep it deterministic + one-time like the others).
- It should:
  - Watch for `?sentry_test=experiment-verify`.
  - Call `captureExperimentError(new Error("Sentry experiment test"), undefined, { source: "prod-query-param", test: "true", route: "experiment", slug: "bugged-out-game-of-life-shader-experiment" })`.
  - Remove the query param after firing.

Why this slug? It matches the known experiment route we have an `error.tsx` for in-repo.

### 3) Mount the new trigger in main layout

- Update `[src/app/(main)/layout.tsx](src/app/(main)/layout.tsx)` to mount the new `SentryExperimentProdTestTrigger` next to:
  - `SentryProdTestTrigger`
  - `SentryHealthcheckTrigger`

### 4) Fix `healthcheck` Performance visibility

- Update `[src/components/monitoring/SentryHealthcheckTrigger.tsx](src/components/monitoring/SentryHealthcheckTrigger.tsx)` so it creates:
  - an explicit `Sentry.startTransaction({ op: "healthcheck", name: "Sentry healthcheck" })`
  - a nested `Sentry.startSpan({ op: "healthcheck", name: "Sentry healthcheck span" }, ...)`.
  - finish both transaction and span.
- Keep the existing deterministic message capture (`Sentry.captureMessage("Sentry healthcheck")`) and URL param removal.

This should ensure:

- Sentry has an active transaction/span context to record performance spans.
- `profileLifecycle: "trace"` can attach profiling to the created trace.

## Validation plan (re-run the live checklist)

After code changes, re-run:

1. Local gates (same as initial): `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run budget`.
2. Deployed artifact sanity: the same 4 live URLs.
3. Browser MCP (Chromium):
  - Confirm `Document-Policy: js-profiling` on `/`.
  - `/?sentry_test=prod-verify`: confirm param removal + `/_t` tunnel requests.
  - `/?sentry_test=healthcheck`: confirm param removal + `/_t` tunnel requests.
  - `/?sentry_test=experiment-verify`: confirm param removal + `/_t` tunnel requests.
4. Sentry MCP:
  - `prod-verify`: verify Issue/Event has tags `source=prod-query-param`, `test=true`, and now `route=main`.
  - `healthcheck`: verify Performance shows a transaction and a span named `Sentry healthcheck span` and that trace lookup returns non-zero spans.
  - `experiment-verify`: verify Issue/Event has tags `route=experiment` + `slug=bugged-out-game-of-life-shader-experiment`.
  - Symbolication: confirm stack frames for each deterministic probe still map to first-party source.

## Success criteria

- `prod-verify` emits exactly one new error event per run and the event includes `route=main` tag.
- `healthcheck` produces a visible Performance span/trace (not `Total Spans: 0`).
- `experiment-verify` emits a deterministic experiment-tagged event with `route=experiment` + `slug`.

## Notes / risks

- Profiling artifacts might still not appear as “attachments” via MCP even when profiling is enabled; in that case we’ll validate via trace details + Sentry UI profiler linkage.
- If Sentry Performance data remains missing, we’ll fall back to diagnosing the exact transaction/span context being recorded (but the explicit transaction approach is the most likely fix given the observed `Total Spans: 0`).

