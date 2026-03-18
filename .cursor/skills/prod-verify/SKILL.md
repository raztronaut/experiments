---
name: prod-verify
description: Production verification checklist (Sentry wiring, tunnel, releases/source maps, and runtime sanity). Use for “verify in prod/preview”, “is Sentry working?”, “why no events?”, “check release quality”.
---

# Prod Verify (S-tier)

## Inputs

- Target URL (preview or prod)
- Target environment name (e.g. `vercel-production`, `vercel-preview`)

## Zero-guess workflow

### 1) Confirm Sentry is enabled (env vars + build-time reality)

- Client DSN is build-time inlined. If env vars changed after deploy, redeploy.
- Verify `NEXT_PUBLIC_SENTRY_DSN` and/or `SENTRY_DSN` exist in the environment running the build.

### 2) Deterministic verification triggers

- **Error-only**: visit `/?sentry_test=prod-verify`
  - Expect: 1 new issue/event ("Sentry prod test"), param removed from URL.
- **Healthcheck (message + trace + profile)**: visit `/?sentry_test=healthcheck`
  - Expect: 1 message event ("Sentry healthcheck")
  - Expect: 1 traced span/transaction visible in Performance
  - Expect: profile attached to trace when supported (Chromium for browser profiling; node for server spans)

### 3) Tunnel verification (`/_t`)

- Confirm `next.config.ts` uses `tunnelRoute: "/_t"` and client uses `tunnel: "/_t"`.
- If ad blockers still block: test incognito with extensions disabled.

### 4) Release + source maps loop

- Confirm latest release exists for the environment.
- Confirm debug files (source maps) exist for that release.
- Confirm at least one stack trace symbolicates as expected.

### 5) Output format (always)

Return a short report:

- **Environment**: prod/preview + URL
- **Sentry enabled**: yes/no (+ why)
- **Error verify**: pass/fail (+ issue/event link if available)
- **Healthcheck verify**: pass/fail (+ performance trace/profile evidence)
- **Tunnel**: pass/fail (+ request evidence)
- **Release/source maps**: pass/fail (+ evidence)

