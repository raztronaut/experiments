---
name: perf-investigation
description: Reproduce, measure, profile, correlate with Sentry traces, and ship a surgical fix. Use for “site feels slow”, “jank”, “low FPS”, “perf regression”.
---

# Performance Investigation (100x workflow)

## Rules

- Measure first. No speculative optimizations.
- One bottleneck at a time.
- Always produce an artifact (trace/profile/analyze output).

## Workflow

### 1) Repro

- URL + device + browser
- exact steps
- expected vs actual

### 2) Measure

Pick the right tool:

- **Interaction latency** → INP workflow (`inp-investigation`)
- **Load/regression** → bundle analysis + Lighthouse
- **Server delay** → TTFB audit + traces
- **Rendering** → DevTools performance + R3F perf metrics (if applicable)

### 3) Diagnose

- Identify the dominating cost (CPU, layout, network, hydration, GPU)
- Tie it to code (import chain / function / component)

### 4) Fix

- Prefer changes that reduce work, not just hide it
- Keep fixes local; avoid drive-by refactors

### 5) Verify

- Re-run the same measurement and compare
- If Sentry is enabled: confirm improved spans/transactions

## Output format (always)

- **Repro**: steps
- **Evidence**: what measurement shows
- **Root cause**: code location
- **Fix**: what changed
- **After**: evidence

