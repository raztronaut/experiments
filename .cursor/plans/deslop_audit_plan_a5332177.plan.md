---
name: Deslop audit plan
overview: A phased, thorough audit of the experiments codebase against the Cursor deslop skill criteria (comments, defensive try/catch, type casts, deep nesting, style inconsistency), producing an actionable inventory and remediation order while respecting AGENTS.md guardrails and legacy boundaries.
todos: []
isProject: false
---

# Deep deslop audit plan (experiments codebase)

Audit the **single repo** at [experiments](src/) (~453 TS/TSX/JS/JSX files) using the [Cursor deslop skill](https://github.com/cursor/plugins/blob/e2a9918787654e001453044ea742eed826287064/cursor-team-kit/skills/deslop/SKILL.md) criteria. No edits in this phase—deliver an inventory and remediation plan.

---

## Deslop criteria (from skill)


| Category           | What to flag                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Comments**       | Extra or unnecessary; inconsistent with local style (e.g. heavy JSDoc where file is terse, or vice versa). |
| **Defensive code** | try/catch on trusted code paths; abnormal null/undefined checks.                                           |
| **Type casts**     | `as any` or `as unknown as T` used only to bypass type issues (not for legitimate bridging).               |
| **Nesting**        | Deep nesting that could be simplified with early returns or extraction.                                    |
| **Inconsistency**  | Patterns that don’t match the file or surrounding codebase.                                                |


**Guardrails**: Keep behavior unchanged unless fixing a clear bug; prefer minimal, focused edits; keep summaries concise (1–3 sentences).

---

## Scope and boundaries

- **In scope**: `src/` only (app, components, hooks, lib). Include scripts in repo root only if they are part of the same “product” (e.g. `validate-experiments.mjs`).
- **Out of scope**: `node_modules`, generated files (registry JSON, llms.txt), `public/` assets, other workspace roots (codegrid-*, cg-*).
- **Legacy**: Experiments with `legacy: true` in [experiment.json](src/app/experiments/) — audit and list in report, but **do not remediate** without explicit approval (per [AGENTS.md](AGENTS.md)).
- **Baseline style**: Derive “local style” per zone (see below); flag deviations, don’t impose a single global style.

---

## Phase 1: Establish local style baseline

Define what “consistent” looks like in each zone so “inconsistent” can be judged.

1. **Sample 2–3 “clean” files per zone** (no obvious slop, stable patterns):
  - **lib**: [experiments.ts](src/lib/experiments.ts), [env.ts](src/lib/env.ts), [toolkit/scroll.ts](src/lib/toolkit/scroll.ts)
  - **app**: one layout, one page (e.g. [layout.tsx](src/app/(main)/layout.tsx), a simple experiment page)
  - **components/ui**: [ExperimentNav.tsx](src/components/ui/ExperimentNav.tsx), [tooltip.tsx](src/components/ui/tooltip.tsx)
  - **components/experiments**: Pick one small experiment (e.g. [luma-morphing](src/components/experiments/luma-morphing/)) and one larger one (e.g. [cursor-depth-explorer](src/components/experiments/cursor-depth-explorer/))
2. **Document per zone** (short bullets):
  - Comment density (none / section-only `// ---` / inline)
  - Use of try/catch (none / only for I/O or abort)
  - Use of `any` or `as unknown as` (none / rare with comment)
  - Typical nesting depth and early-return usage
3. **Output**: One “Style baseline” section in the audit report (e.g. `docs/audits/deslop-YYYY-MM.md` or `.cursor/plans/deslop-audit-report.md`).

---

## Phase 2: Automated inventory (grep / scripts)

Run targeted searches **only in** `/Users/razisyed/Developer/experiments` (single repo).

1. **Type casts**
  - `as any` and `: any` → already found: [VisualiserLogic.ts](src/components/experiments/rabbithole-chat-gallery-explore/VisualiserLogic.ts) (comment + usage), [setupTests.ts](src/setupTests.ts), [ConsoleEasterEgg.tsx](src/components/ui/ConsoleEasterEgg.tsx).
  - `as unknown as` → [experiments.ts](src/lib/experiments.ts), [TypographyDebugPanel.tsx](src/components/dev/TypographyDebugPanel.tsx), [registry-search route](src/app/api/registry-search/route.ts), [InteractiveWidget.tsx](src/components/mdx/InteractiveWidget.tsx). Classify each: legitimate (e.g. React symbol hack) vs bypass.
2. **try/catch**
  - List every file with `try {` and the corresponding `catch` (empty vs logging vs rethrow). Known: [experiments.ts](src/lib/experiments.ts) (FS), [articles.ts](src/lib/articles.ts) (nested try for experiment.json), [layout.tsx](src/app/(main)/layout.tsx) (empty catch in script), [ExperimentNav.tsx](src/components/ui/ExperimentNav.tsx) (inline script), [useWeather.ts](src/hooks/useWeather.ts) (AbortError). Flag: empty catches, catch-all on trusted paths.
3. **Comment density**
  - Count `//` and `/`* lines per file (e.g. with `grep -c` or a small script). Flag files with ratio above zone baseline (e.g. >1 comment per 10 lines in a typically terse zone).
4. **File length and structure**
  - List files over 200 lines (or 300 for orchestrators per [.agents/rules/experiments.md](.agents/rules/experiments.md)). Flag those that also have nesting depth >3 (manual or simple AST/indent heuristic).
5. **Optional: defensive patterns**
  - Grep for `?.` or `&&` chains that span many lines or repeat the same check; note only where clearly redundant or inconsistent with the rest of the file.

**Output**: Structured list (table or markdown) per category: file path, line(s), one-line note, “remediate / document-only / legacy”.

---

## Phase 3: Manual review by category

Go through each category and apply deslop judgment (no edits yet).

1. **Comments**
  - For each file above the comment-density threshold, decide: remove, reduce, or align with zone style. Note TypographyDebugPanel’s `// ─── Section ───` as intentional style; don’t flag as slop if the rest of the file matches.
2. **Defensive try/catch**
  - For each try/catch: trusted path (e.g. sync config read) → flag as candidate for removal or simplification. I/O or fetch/abort → keep; note if catch is empty or too broad.
3. **Casts**
  - For each `as any` / `as unknown as`: justify (e.g. Canvas/React symbol hack, DOM type) or mark “replace with proper type or narrow”.
4. **Deep nesting**
  - For files over line budget and/or high nesting: suggest early returns or extract function/component; reference [.agents/rules/experiments.md](.agents/rules/experiments.md) section decomposition.
5. **Inconsistency**
  - Spot-check 5–10 experiment components vs baseline: naming, export style, comment usage, error handling. Note outliers.

**Output**: For each finding: severity (low/medium/high), suggested action (remove/simplify/refactor/document), and whether it’s in a legacy experiment (remediation blocked unless approved).

---

## Phase 4: Prioritization and remediation order

1. **Tiers**
  - **Tier 1 (shared)**: `src/lib/`, `src/hooks/`, `src/components/ui/`, `src/app/(main)/`, `src/components/mdx/` — highest impact, fix first.
  - **Tier 2 (experiments, non-legacy)**: Experiment components and app routes for experiments without `legacy: true`.
  - **Tier 3 (legacy)**: List only; remediation only with explicit approval.
  - **Tier 4 (test/tooling)**: `setupTests.ts`, scripts — lower priority; document `any` and empty catch where acceptable.
2. **Remediation order**
  - Within each tier: sort by severity (high first) then by file path for predictability.
  - Recommend small PRs per file or per experiment to keep diffs reviewable and behavior unchanged.
3. **Report summary**
  - Total counts per category and per tier.
  - One paragraph per category: what was found, what to do first.
  - Explicit “do not change” list (legacy experiments, behavior-changing “improvements”).

---

## Deliverables

1. **Audit report** (single document):
  - Style baseline (per zone).
  - Inventory tables (casts, try/catch, comment-heavy files, long/deep files).
  - Manual review notes (severity + action per finding).
  - Prioritized remediation order and “do not change” list.
2. **Optional**: Checklist or script to re-run the automated part (greps + file-length list) for follow-up audits.
3. **No code changes** in this audit phase; remediation is a separate phase with its own PRs.

---

## Execution notes

- **Tooling**: Grep and simple scripts (Node or shell) are enough; no need for custom AST tools unless you want nesting depth.
- **Time**: Phase 1 ~30 min, Phase 2 ~45 min, Phase 3 ~1–2 h (depends on number of flagged files), Phase 4 ~20 min.
- **Single codebase**: All paths and counts refer to `/Users/razisyed/Developer/experiments` only; ignore duplicate results from other workspace roots in grep.

