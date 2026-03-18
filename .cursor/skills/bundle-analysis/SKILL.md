---
name: bundle-analysis
description: Repeatable next experimental-analyze workflow with budgets, before/after snapshots, and actionable recommendations.
---

# Bundle Analysis (next experimental-analyze)

## When to use

- Bundle unexpectedly grew
- Route is slow to load, TTI regressed, or INP worsened after a change
- “What’s making this page heavy?”

## Workflow

### 1) Snapshot baseline

Run:

- `npm run build`
- `npm run analyze:output`

Save the artifact in `.next/diagnostics/analyze/` for comparison.

### 2) Identify the culprit

- Compare client vs server bundles
- Find the largest chunks and their import chains
- Check for duplicates (same lib included multiple times)

### 3) Fix patterns (preferred order)

- Move heavy libs behind dynamic import
- Avoid barrel imports on hot paths
- Prefer `optimizePackageImports` targets (already configured)
- Split “experiment-only” code from `(main)` routes

### 4) Budget gate

- Run `npm run budget`
- If it fails: identify the single chunk or aggregate client size causing the failure, then fix *that* first.

## Output format (always)

- **Baseline vs after**: what changed (MB, biggest chunk deltas)
- **Root cause**: module(s) and import chain(s)
- **Fix plan**: 1–3 surgical changes
- **Verification**: analyze output + budget pass

