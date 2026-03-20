# Sentry Audit Fix — Pass/Fail Report

**Date:** 2026-03-18  
**Plan:** sentry-audit-fix  
**Target:** https://razisyed.cv

---

## Implementation Status: ✅ Complete

| Todo | Status |
|------|--------|
| patch-prod-verify-route-main | ✅ Done |
| add-experiment-verify-trigger | ✅ Done |
| mount-experiment-verify-trigger | ✅ Done |
| fix-healthcheck-transaction-span | ✅ Done |
| preflight-again | ✅ Pass |

---

## Preflight Gates: ✅ Pass

| Gate | Result |
|------|--------|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass (70 tests) |
| `npm run build` | Pass |
| `npm run budget` | Pass |

---

## Code Changes Summary

1. **SentryProdTestTrigger** — Added `route: "main"` to tags.
2. **SentryExperimentProdTestTrigger** — New component for `?sentry_test=experiment-verify` with `route: "experiment"` + `slug: "bugged-out-game-of-life-shader-experiment"`.
3. **SentryHealthcheckTrigger** — Wrapped in explicit root transaction (`forceTransaction: true`) + nested span (`Sentry healthcheck span`) for Performance visibility.
4. **layout.tsx** — Mounted `SentryExperimentProdTestTrigger` alongside existing triggers.
5. **Free-plan optimizations** — Profiling disabled (removed `browserProfilingIntegration`, `nodeProfilingIntegration`, `@sentry/profiling-node`). Replay sampling lowered to `0.1` in prod.

---

## Live Verification: ⏳ Post-Deploy Required

Live verification must be run **after** deployment to production (push/merge to `main` → Vercel deploy). Probes only fire when `NEXT_PUBLIC_SENTRY_DSN` is set (production has it).

### Checklist (run after deploy)

1. **Browser** (Chromium)
   - `https://razisyed.cv/?sentry_test=prod-verify` → param removed, `/_t` tunnel
   - `https://razisyed.cv/?sentry_test=healthcheck` → param removed, `/_t` tunnel
   - `https://razisyed.cv/?sentry_test=experiment-verify` → param removed, `/_t` tunnel
   - Optional: confirm `/_t` tunnel requests in Network tab

2. **Sentry MCP / UI**
   - **prod-verify**: Issue/Event has `route=main`, `source=prod-query-param`, `test=true`
   - **healthcheck**: Performance shows transaction + span "Sentry healthcheck span"; trace lookup returns non-zero spans
   - **experiment-verify**: Issue/Event has `route=experiment`, `slug=bugged-out-game-of-life-shader-experiment`
   - Symbolication: stack frames map to first-party source

### Success Criteria

- `prod-verify` emits one error event per run with `route=main`
- `healthcheck` produces visible Performance span/trace (not `Total Spans: 0`)
- `experiment-verify` emits event with `route=experiment` + `slug`

---

## Free-Plan Optimizations (Post-Implementation)

- **Profiling disabled**: `browserProfilingIntegration` and `nodeProfilingIntegration` removed; `@sentry/profiling-node` dependency removed. Profiling is PAYG-only on Sentry.
- **Replay sampling lowered**: `replaysOnErrorSampleRate` is `0.1` in prod (was `1.0`), `1.0` in dev for debugging. Keeps replay usage within free-tier quota.

---

## Notes

- Local verification of param removal is not possible without DSN (probes early-return when Sentry is disabled).
