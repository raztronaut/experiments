---
name: audit-content
description: Audit content coverage across all experiments. Scan experiment.json files, check content flags against files on disk, identify missing content formats, report schema gaps (empty updated/inspiration/related fields), and prioritize which experiments to write content for next. Use when the user asks about content status, coverage gaps, or "what needs writing".
---

# Audit Content

Scan all experiments and produce a content health report.

## Procedure

### Step 1: Gather experiment data

Read all `experiment.json` files from `src/app/experiments/*/`:

```bash
find src/app/experiments -name "experiment.json" -type f
```

For each, extract: `slug`, `status`, `listing`, `legacy`, `updated`, `inspiration`, `related`, `tags`, `tech`.

### Step 2: Check content files on disk

Article existence is detected by file presence, not metadata flags. For each experiment, check whether these files exist:

| Content type | Expected file |
|------|---------------|
| Article | `{route}/article/content.mdx` |
| Lab note | `{route}/docs/lab-note.md` |
| Architecture | `{route}/docs/architecture.md` |
| Snippet | `{route}/docs/snippet.md` |
| Social | `{route}/docs/social.md` |
| Changelog | `{route}/docs/changelog.md` |

Note: The pre-commit validator (`scripts/validate-experiments.mjs`) catches basic coherence issues.

### Step 3: Check schema completeness

Flag experiments with empty fields that should be populated:

- `updated`: empty across most experiments (should have date of last significant change)
- `inspiration`: empty (should have `[{ title, url }]` when known)
- `related`: empty (should cross-reference related experiments)
- `tags` / `tech`: present but verify completeness

### Step 4: Assess lens-strength signals

For each non-legacy experiment, check which article lenses have strong material:

| Signal | Lens | Look for |
|--------|------|----------|
| `I` | Implementation | Novel code patterns, shader techniques, animation systems, architecture decisions |
| `C` | Concept | Rich README with conceptual language, cross-disciplinary metaphors, novel UI paradigms, design philosophy, content.ts with idea-heavy text |
| `E` | Exploration | Documented iterations, lab notes, changelog history, dead ends, pivots |

Also check `experiment.json` for an optional `articleLenses` field (advisory hint from the user).

### Step 5: Generate status report

Output a markdown table:

```markdown
## Content Coverage Report

| Experiment | Status | Listing | Article | Lab Note | Arch | Snippet | Social | Changelog | Lenses |
|------------|--------|---------|---------|----------|------|---------|--------|-----------|--------|
| slug-name  | shipped | public | x | - | - | - | - | - | **C** I |
```

Use `x` for present, `-` for missing. In the Lenses column, list `I`, `C`, `E` for whichever signals are present. Bold the strongest. Sort by: shipped+public first, then shipped+dev, then wip.

### Step 6: Prioritize next actions

Based on the report, recommend:

1. Which experiments are closest to publishable (most content already exists)
2. Which shipped experiments should get content next — consider both novelty and lens diversity (concept-rich experiments are currently underserved since all existing articles are implementation-heavy)
3. Schema fields that need bulk backfill (`updated`, `inspiration`, `related`)

Skip `legacy: true` experiments for content recommendations (they're untouchable).

## Quick Check

For a fast status check without full audit, run:

```bash
npm run validate:experiments
```

This runs the pre-commit validator which catches content flag / disk mismatches.
