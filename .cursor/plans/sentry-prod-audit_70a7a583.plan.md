---
name: sentry-prod-audit
overview: "Run an S-tier “prove-it” verification of Sentry on the deployed site using `user-chrome-devtools` MCP + Sentry MCP: deterministic triggers, tunnel/profiling prerequisites, release/source-map symbolication, and tagging sanity."
todos:
  - id: preflight-local-gates
    content: "Run local gates in `/Users/razisyed/Developer/experiments`: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run budget` and record results."
    status: completed
  - id: deployed-artifacts-check
    content: Verify prod-serving of `https://razisyed.cv/llms.txt`, `https://razisyed.cv/llms-full.txt`, `https://razisyed.cv/registry/index.json`, `https://razisyed.cv/registry/index-slim.json` (HTTP 200 + basic content check).
    status: completed
  - id: browser-header-and-tunnel-invariants
    content: "Using `user-chrome-devtools` MCP: confirm `Document-Policy: js-profiling` header on `/` and that Sentry tunnel calls go to `/_t` (not direct ingest endpoints) when probes fire."
    status: completed
  - id: probe-prod-verify
    content: "`user-chrome-devtools` MCP: visit `https://razisyed.cv/?sentry_test=prod-verify`, confirm param removal, observe `/_t` request, and capture any console/network errors."
    status: completed
  - id: sentry-verify-prod-verify
    content: "Sentry MCP: in the deployed environment, find the new event for `\"Sentry prod test\"` (time-windowed). Verify tags `source=prod-query-param` and `test=true`, confirm release association and symbolication via event/issue details."
    status: completed
  - id: probe-healthcheck
    content: "`user-chrome-devtools` MCP: visit `https://razisyed.cv/?sentry_test=healthcheck`, confirm param removal, observe `/_t` request, and (if needed) repeat up to 2 more times if profiling attachment is missing due to sampling."
    status: completed
  - id: sentry-verify-healthcheck
    content: "Sentry MCP: verify `\"Sentry healthcheck\"` message exists, verify Performance contains `\"Sentry healthcheck span\"` (trace/span). Confirm profiling attachment presence in supported environments; record evidence (trace id + profile attachment info if available)."
    status: completed
  - id: tagging-main-and-experiment-sanity
    content: "Sentry MCP: validate `route=main` events have correct routing tags and symbolicated frames. For `route=experiment`, validate most recent events have `slug` populated (runtime attempt optional; if no new experiment error is produced, rely on Sentry-side event search)."
    status: completed
  - id: final-report
    content: Compile a concise pass/fail report matching the checklist sections, including evidence links/IDs (issue/event URL, trace id, and symbolication/profiling evidence).
    status: completed
isProject: false
---

## Goal

Verify that `https://razisyed.cv` is emitting the expected Sentry artifacts in production: errors, traces/spans, profiling attachments (when supported), correct tunnel wiring (`/_t`), correct release association, and correct symbolication.

## Key implementation references (what we expect to observe)

- Deterministic probes are mounted in main layout:
  - `src/app/(main)/layout.tsx` mounts `SentryProdTestTrigger` and `SentryHealthcheckTrigger`.
- Error-only probe:
  - `src/components/monitoring/SentryProdTestTrigger.tsx`
  - Tags expected on the captured exception: `source=prod-query-param`, `test=true`.
  - Removes `?sentry_test=prod-verify` from the URL after firing.
- Healthcheck probe:
  - `src/components/monitoring/SentryHealthcheckTrigger.tsx`
  - Tags expected: `source=prod-query-param`, `test=true`.
  - Emits `Sentry.captureMessage("Sentry healthcheck")` and starts a tiny span (`op="healthcheck"`, name `"Sentry healthcheck span"`).
  - Removes `?sentry_test=healthcheck` from the URL after firing.
- Tunnel + ad-blocker bypass:
  - Client init sets `tunnel: "/_t"` in `instrumentation-client.ts`.
  - Server config sets `tunnelRoute: "/_t"` in `next.config.ts`.
- Profiling prerequisites:
  - Global header `Document-Policy: js-profiling` in `next.config.ts`.

## Workflow (execution phase)

1. Preflight gates (local, to establish baseline health)
  - Run: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run budget` in `/Users/razisyed/Developer/experiments`.
2. Deployed artifact sanity (served on prod)
  - Verify on the live site (HTTP 200 + basic content check):
    - `https://razisyed.cv/llms.txt`
    - `https://razisyed.cv/llms-full.txt`
    - `https://razisyed.cv/registry/index.json`
    - `https://razisyed.cv/registry/index-slim.json`
3. Chrome DevTools-side header + network invariants
  - With `user-chrome-devtools` MCP:
    - Confirm `Document-Policy: js-profiling` header exists on the homepage response.
    - Confirm Sentry tunnel requests happen at `/_t` (and not direct Sentry ingest endpoints) when probes fire.
4. Deterministic runtime triggers (`user-chrome-devtools` MCP)
  - `/?sentry_test=prod-verify`
    - Confirm URL param removed after firing.
    - Confirm `/_t` request observed.
  - `/?sentry_test=healthcheck`
    - Confirm URL param removed after firing.
    - Confirm `/_t` request observed.
5. Sentry-side verification (Sentry MCP)
  - Using Sentry MCP:
    - Locate the latest relevant release for the deployed environment.
    - For `prod-verify`, verify exactly one new event in a tight time window with the expected tags (`source=prod-query-param`, `test=true`) and symbolicated frames tied to the right release.
    - For `healthcheck`, verify:
      - Issues contain the message `Sentry healthcheck`.
      - Performance contains a span/trace corresponding to `Sentry healthcheck span`.
      - Profile attachment is present when supported; if missing due to sampling, retry up to 2 more times and document findings.
6. Tagging correctness: main vs experiment
  - Main route tagging (`route: "main"`):
    - Deterministic probes do not set `route`; instead, we will validate this by querying existing recent Sentry events with `route=main` in the deployed environment (Sentry MCP) and confirm symbolication.
  - Experiment route tagging (`route: "experiment"` + `slug`):
    - Best-effort runtime attempt: load a candidate experiment route with a known error boundary file and see if it triggers naturally.
    - If no new experiment error is produced, validate tagging via Sentry MCP by querying the most recent events with `route=experiment` and checking that the `slug` tag is populated.
7. Tunnel correctness / no interception
  - Confirm `/_t` requests are not rewritten/blocked by any app middleware (repo currently has no `middleware.ts` entrypoints).
  - In Sentry MCP, ensure the tunnel-connected events show normal behavior (not only client console failures).

## Evidence we will collect for the final report

- URLs tested + exact timestamps/time window
- For each probe:
  - Chrome DevTools evidence: `/_t` request observed (yes/no), and any notable console/network errors.
  - Sentry evidence: issue/event link, event id, release, and symbolication status.
  - Healthcheck evidence: trace id / span name / presence of profiling attachment.
- Tagging evidence:
  - Example event(s) for `route=main` and `route=experiment` with `slug`.

## Expected outputs

A final “pass/fail” report aligned to your checklist sections (baseline → wiring → triggers → tunnel → profiling → tagging → symbolication).