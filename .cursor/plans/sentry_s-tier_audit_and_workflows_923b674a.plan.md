---
name: sentry_s-tier_audit_and_workflows
overview: Audit and harden Sentry (including profiling) and add Cursor-native workflows (skills, rules, subagents) so the repo has a repeatable 100x performance/debugging practice (clean + modern), not just tooling installed.
todos:
  - id: profiling-setup
    content: Add @sentry/profiling-node and enable node+browser profiling integrations with sane sampling defaults (plus verification steps).
    status: pending
  - id: middleware-tunnel-verify
    content: Confirm middleware wiring so the /_t exclusion is actually active; add/adjust middleware entrypoint if needed.
    status: pending
  - id: sentry-verification-tests
    content: Add automated Sentry verification (unit + optional Playwright) so integration can’t silently regress.
    status: pending
  - id: docs-integrations-and-cloud
    content: Update performance.md + AGENTS.md with integrations, MCP readiness, and verification flows (incl. profiling + INP/TTFB workflows).
    status: pending
  - id: cursor-workflows
    content: Create new .cursor skills, rules, and subagents for Sentry triage + performance debugging (INP + TTFB + bundle + profiling).
    status: pending
  - id: consistency-pass
    content: Repo-wide consistency pass across agent docs, plop, scripts, registry, and SEO touchpoints.
    status: pending
isProject: false
---

# Sentry S-tier audit + 100x workflows

## Current state (validated from repo + Sentry MCP)

- **Sentry org/project**: `razi-org/javascript-nextjs` exists and DSN matches what’s configured in code.
- **Events in production**: confirmed via Sentry MCP (issues exist in `vercel-production`, including the prod test issue).
- **Tunnel**: client uses `tunnel: "/_t"` and `next.config.ts` uses `tunnelRoute: "/_t"`.
- **Profiling header**: global `Document-Policy: js-profiling` is already set in `[/Users/razisyed/Developer/experiments/next.config.ts](/Users/razisyed/Developer/experiments/next.config.ts)`.
- **Prod test trigger exists**: `SentryProdTestTrigger` is mounted in the main app layout; works without `/dev` in prod.
- **Vendor Sentry skills installed**: under `/Users/razisyed/Developer/experiments/.agents/skills/sentry-`*. These should remain upstream; we add project-level wrappers.

## Definition of “S-tier” (for this repo)

### Operational

- **No silent regressions**: tests/CI catch broken Sentry wiring (errors, tunnel, spans).
- **Fast prod verification**: deterministic triggers for Errors + Performance + Profiling.
- **Low noise**: sampling defaults are sane; no PII; avoid unnecessary complexity.

### Coverage

- **Errors**: main app + experiments + R3F/canvas boundaries + global error boundary.
- **Tracing**: client navigation + server requests (node + edge).
- **Profiling**: browser + node, gated by sampling.
- **Replay**: replay-on-error only, privacy-default.

## Part A — Product hardening (align with Sentry best practices)

### A1) Enable Profiling (Node + Browser)

This repo already sets the required `Document-Policy: js-profiling` header. Remaining work is wiring integrations.

Implementation:

- **Deps**: add `@sentry/profiling-node` (prod dep).
- **Server init**: update `[/Users/razisyed/Developer/experiments/sentry.server.config.ts](/Users/razisyed/Developer/experiments/sentry.server.config.ts)`:
  - add `nodeProfilingIntegration()` in `integrations`
  - set `profileSessionSampleRate` (dev 1.0, prod 0.1 default)
  - set `profileLifecycle: "trace"`
- **Client init**: update `[/Users/razisyed/Developer/experiments/instrumentation-client.ts](/Users/razisyed/Developer/experiments/instrumentation-client.ts)`:
  - add `Sentry.browserProfilingIntegration()` in `integrations`
  - set `profileSessionSampleRate` (dev 1.0, prod 0.1 default)

Verification:

- confirm a profiled transaction exists in Sentry Performance/Profiling UI.

### A2) Deterministic healthcheck for Error + Trace + Profile

We already have an error-only prod trigger (`?sentry_test=prod-verify`). Add a complementary “healthcheck” trigger that:

- emits `captureMessage("Sentry healthcheck")`
- starts a tiny span/transaction (so Performance has a known-good sample)
- once profiling is enabled, yields a profile attached to a trace

### A3) Tunnel & middleware correctness (ad-blocker bypass that stays bypassed)

We currently have the exclusion matcher for `/_t` in `[/Users/razisyed/Developer/experiments/src/proxy.ts](/Users/razisyed/Developer/experiments/src/proxy.ts)`.

To ensure it actually applies:

- verify whether a Next.js middleware entrypoint exists (e.g. `middleware.ts`) and calls/exports `proxy`.
- if absent, add the minimal entrypoint and ensure its matcher excludes `/_t`.

Also: add a regression net (tests) so tunnel behavior can’t silently break.

### A4) Releases + source maps verification loop

We’ve confirmed releases are being created for `vercel-production`. Add a documented loop:

- check latest release exists (MCP)
- check it has deploy environment (MCP)
- check Debug Files (source maps) are present for that release (Sentry UI)

### A5) Metrics (documented, opt-in)

`@sentry/nextjs` is already `^10.44.0` so metrics are supported. Keep metrics opt-in and document narrow, high-value use cases only.

## Part B — Docs + AGENTS.md updates

### B1) Update `docs/performance.md`

- Add “Integrations installed” info (GitHub / Vercel / Cursor Agent / Vercel Internal Integration) and what they enable for this repo.
- Add Profiling section (Node + Browser), and the `Document-Policy: js-profiling` header requirement.
- Add explicit “Prod verify” flows:
  - error verify (`?sentry_test=prod-verify`)
  - healthcheck verify (message + span + profile)
  - release/source-map verification
- Add INP/TTFB guidance as workflow anchors:
  - INP: measure interaction, identify long tasks, verify improvements.
  - TTFB: avoid middleware/edge request-time fetches; prefer build-time.

References:

- `sentry-testkit` for verification testing: [Getting Started](https://zivl.github.io/sentry-testkit/docs/getting-started)
- INP background & debugging direction: [What is INP and why you should care](https://blog.sentry.io/what-is-inp/)
- TTFB tradeoffs (avoid request-time middleware work): [How I fixed my brutal TTFB](https://blog.sentry.io/how-i-fixed-my-brutal-ttfb/)

### B2) Update `AGENTS.md` (“Cursor Cloud specific instructions”)

- Explicitly note:
  - Sentry MCP is configured (`plugin-sentry-sentry`) and should be used for Sentry-side verification.
  - Browser MCPs available for verification (`cursor-ide-browser`, `project-0-experiments-browser-devtools`, PinchTab).
- Add a short checklist: “When debugging prod issues” → invoke new skills/subagents.

## Part C — Cursor-native 100x workflows (skills, rules, subagents)

Principle: treat the vendor Sentry skills as upstream. Do not edit them directly. Create project-level wrappers that encode this repo’s invariants (tags, tunnel, env gating, perf workflow, modern habits).

### C1) New project skills (`.cursor/skills/`)

Create concise skills (SKILL.md under ~500 lines) with progressive disclosure files:

- `sentry-triage/` — query Sentry (MCP), interpret issues/releases/environments, decide next action, and produce a tight triage report.
- `perf-investigation/` — reproduce, measure, profile (DevTools), correlate with Sentry traces & profiles.
- `inp-investigation/` — INP-first workflow: isolate interaction, map to main-thread long tasks, then map to Sentry spans/profiles.
- `ttfb-audit/` — avoid request-time middleware work; detect accidental regressions in middleware patterns.
- `bundle-analysis/` — repeatable `next experimental-analyze` workflow + budget comparisons.
- `prod-verify/` — production verification checklist (query params, network, Sentry release, source maps).

### C2) New rules (`.cursor/rules/`)

- `monitoring-sentry.mdc` (globs targeting Sentry-related files) — invariants:
  - env gating behavior
  - PII posture
  - sampling defaults
  - tunnel invariants (`/_t`)
  - release/source map expectations
- `performance-workflow.mdc` (alwaysApply: true) — “measure-first” workflow + required artifacts (analyze output, profiler capture, Sentry link).
- `middleware-ttfb.mdc` (globs: `middleware.ts`, `src/proxy.ts`, `next.config.ts`) — forbid request-time third-party fetches, keep middleware cheap, prefer build-time.

### C3) New subagents (`.cursor/agents/`)

- `sentry-triage-agent` — Sentry MCP specialist; outputs a consistent triage report (Issue → impact → repro → fix surface → verification).
- `performance-debugger` — profiling + bundle analysis + runtime perf.
- `release-quality-auditor` — pre/post deploy verification: releases, source maps, tunnel, sampling sanity.
- `interaction-latency-agent` — INP-first investigation agent that produces concrete “reduce main thread work” patches.

Subagent best practices to follow:

- short, specific `description` with “use proactively” where appropriate
- very explicit “what to do first” steps
- avoid side effects unless user asks (especially alerts/changes in Sentry)

## Part D — Automated verification (prevents regressions)

### D1) Unit-level verification via `sentry-testkit`

- Add `sentry-testkit` (dev dep).
- Add/update tests so we can assert:
  - `captureExperimentError()` produces an event
  - prod trigger emits exactly once
  - healthcheck emits message + span

Reference: [Sentry-Testkit Getting Started](https://zivl.github.io/sentry-testkit/docs/getting-started)

### D2) Optional Playwright smoke check (tunnel request exists)

- Add a minimal Playwright test that:
  - visits `/?sentry_test=prod-verify` (local dev or preview)
  - asserts a request to `/_t` is attempted (without depending on Sentry ingestion)

Keep this surgical: one file, one assertion, no harness sprawl.

## Part E — Repo-wide consistency pass

- Scan and align:
  - plop templates (experiment route error template should tag `route` + `slug`)
  - existing agent docs (`.agents/rules/performance.md`, workflows)
  - scripts and registry pipeline docs where monitoring/perf is referenced
  - SEO docs only where Sentry touches headers/CSP
- Produce a short “Sentry implementation map” in docs (which file owns what) so future edits don’t regress.

## Appendix — Repo touchpoints (so we don’t miss anything)

- Client init: `[/Users/razisyed/Developer/experiments/instrumentation-client.ts](/Users/razisyed/Developer/experiments/instrumentation-client.ts)`
- Server init: `[/Users/razisyed/Developer/experiments/sentry.server.config.ts](/Users/razisyed/Developer/experiments/sentry.server.config.ts)`
- Edge init: `[/Users/razisyed/Developer/experiments/sentry.edge.config.ts](/Users/razisyed/Developer/experiments/sentry.edge.config.ts)`
- Registration hook: `[/Users/razisyed/Developer/experiments/instrumentation.ts](/Users/razisyed/Developer/experiments/instrumentation.ts)`
- Next config: `[/Users/razisyed/Developer/experiments/next.config.ts](/Users/razisyed/Developer/experiments/next.config.ts)`
- Prod test trigger: `/Users/razisyed/Developer/experiments/src/components/monitoring/SentryProdTestTrigger.tsx`
- Global error boundary: `/Users/razisyed/Developer/experiments/src/app/global-error.tsx`
- Main error boundary: `/Users/razisyed/Developer/experiments/src/app/(main)/error.tsx`
- Main layout: `/Users/razisyed/Developer/experiments/src/app/(main)/layout.tsx`
- Middleware proxy/matcher: `/Users/razisyed/Developer/experiments/src/proxy.ts` (plus the middleware entrypoint that uses it)

