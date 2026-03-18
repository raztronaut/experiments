---
name: ttfb-audit
description: TTFB audit workflow for Next.js App Router. Detect request-time work (middleware/edge/server), remove accidental fetches, and verify with traces.
---

# TTFB Audit (S-tier)

## Goal

Eliminate request-time work that inflates TTFB (especially middleware/edge).

## Workflow

### 1) Identify the slow routes

- Use real-user data (Speed Insights) or Sentry transactions.
- Pick 1–2 URLs to fix first.

### 2) Inspect request-time code paths

High-risk areas:

- `middleware` (if present)
- route handlers (`src/app/**/route.ts`)
- server components with request-time fetch
- edge runtime modules

### 3) Fix patterns

- Prefer build-time generation / cached fetch (`revalidate`, `cache`, `unstable_cache`) where appropriate
- Avoid third-party fetches in middleware/edge
- Reduce server compute work and serialization

### 4) Verify

- Compare TTFB before/after for the same URL
- Use traces to confirm server span durations dropped

## Output format (always)

- **Route(s)**: impacted URLs
- **Root cause**: what was happening on-request
- **Fix**: what changed and why it’s safe
- **After**: evidence

