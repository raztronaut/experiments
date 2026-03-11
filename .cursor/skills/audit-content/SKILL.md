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

For each, extract: `slug`, `status`, `legacy`, `publishable`, `content`, `updated`, `inspiration`, `related`, `tags`, `tech`.

### Step 2: Cross-check content flags vs disk

For each experiment, verify the `content` object matches actual files:

| Flag | Expected file |
|------|---------------|
| `article` | `{route}/article/content.mdx` |
| `labNote` | `{route}/docs/lab-note.md` |
| `architecture` | `{route}/docs/architecture.md` |
| `snippet` | `{route}/docs/snippet.md` |
| `social` | `{route}/docs/social.md` |
| `changelog` | `{route}/docs/changelog.md` |

Report mismatches: flag says `true` but file missing, or file exists but flag not set.

Note: The pre-commit validator (`scripts/validate-experiments.mjs`) also does this check -- reference it for the canonical validation logic.

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

| Experiment | Status | Article | Lab Note | Arch | Snippet | Social | Changelog | Lenses | Publishable |
|------------|--------|---------|----------|------|---------|--------|-----------|--------|-------------|
| slug-name  | shipped | x | - | - | - | - | - | **C** I | false |
```

Use `x` for present, `-` for missing. In the Lenses column, list `I`, `C`, `E` for whichever signals are present. Bold the strongest. Sort by: publishable first, then shipped, then wip.

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
