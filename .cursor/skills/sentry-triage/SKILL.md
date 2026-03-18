---
name: sentry-triage
description: Triage Sentry issues/releases/environments using the Sentry MCP; produce a tight report and recommended next actions.
---

# Sentry Triage (100x)

## When to use

- “What broke in prod?”
- “Why is this error happening?”
- “Are source maps working?”
- “Did the last deploy regress performance?”

## Workflow (MCP-first)

### 1) Identify scope

- Environment: `vercel-production` vs `vercel-preview`
- Time window
- Impact: users, frequency, crash-free rate (if available)

### 2) Issues triage

- Rank by: new + frequent + high impact
- For top issues:
  - title + fingerprint
  - first/last seen
  - sample event context
  - suspect release (if present)

### 3) Release quality

- Confirm latest release exists
- Confirm deploy environments
- Confirm source maps/debug files attached

### 4) Recommend action

Pick one:

- **Fix now**: clear repro, tight surface area
- **Instrument**: missing tags/spans/metadata
- **De-noise**: sampling/filtering/tags adjustment (no PII)
- **Verify**: use prod triggers (`prod-verify`, `healthcheck`)

## Output format (always)

- **Environment** + **time window**
- **Top issues** (3–5): impact + suspected cause + fix surface
- **Release + sourcemaps**: pass/fail
- **Next actions**: 1–3 items

