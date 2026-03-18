---
name: inp-investigation
description: INP-first workflow: isolate interaction, find long tasks, map them to code, and verify improvements with Sentry + browser profiling.
---

# INP Investigation (S-tier)

## Goal

Reduce interaction latency by removing/shortening main-thread long tasks and expensive re-renders.

## Workflow

### 1) Define the interaction

- What user gesture causes the jank (click/drag/scroll/hover)?
- Where does it happen (URL + component)?

### 2) Measure (browser first)

- Use browser tooling to capture a performance profile around the interaction.
- Identify:
  - long tasks (50ms+)
  - forced reflow/layout thrash
  - expensive JS call stacks
  - React commit spikes / repeated renders

### 3) Map to code

- Find the hot function(s)
- Determine if it’s:
  - expensive render
  - event handler doing too much
  - animation on non-compositor properties
  - synchronous parsing / JSON / layout reads

### 4) Fix (surgical)

Preferred order:

- Move work off the hot path (defer, precompute, cache)
- Make animation compositor-only (`transform`, `opacity`)
- Reduce renders (memoization, state colocation, split components)
- Reduce DOM reads/writes (batch, avoid layout thrash)

### 5) Verify (real)

- Re-profile the same interaction and compare
- If Sentry tracing/profiling is enabled, confirm the relevant transactions/spans improved

## Output format (always)

- **Interaction**: what + where
- **Before**: evidence (long task duration, stack)
- **Fix**: patch summary
- **After**: evidence (delta)

