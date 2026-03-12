---
name: Metadata Redesign Audit
overview: Audit of the Metadata System Redesign plan execution -- what was completed, what was missed, and what bugs were introduced.
todos:
  - id: fix-registry-json-default
    content: "Fix generate-registry-json.mjs line 446: change listing default from \"experiment\" to \"public\" and align categorization logic with generate-registry.mjs"
    status: completed
  - id: fix-delete-article
    content: Remove publishable reset from scripts/delete-article.mjs (writes a dead field back into experiment.json)
    status: completed
  - id: fix-architecture-md
    content: "Update .agents/contexts/architecture.md: remove publishable from example JSON and field table, remove \"archived\" from status enum"
    status: completed
  - id: fix-audit-content-skill
    content: "Update .cursor/skills/audit-content/SKILL.md: remove publishable/content extraction and Publishable column"
    status: completed
  - id: fix-content-auditor-agent
    content: "Update .cursor/agents/content-auditor.md: remove publishable sorting and column references"
    status: completed
  - id: fix-plop-template
    content: "Update plop-templates/experiment/route-layout.tsx.hbs: add isPublic const, conditional robots metadata, computed posterPath"
    status: completed
  - id: fix-velocity-poster
    content: "Fix velocity-responsive-design layout: replace hardcoded poster path with computed posterPath pattern"
    status: completed
isProject: false
---

# Metadata System Redesign -- Completion Audit

## Overall Verdict

The plan was **substantially completed** -- all 13 todos were executed and the core system works correctly. The new 3-field schema (`status`, `listing`, `legacy`) is in place, dead fields are removed from all 21 experiment.json files, filtering logic is env-aware, and the dev dashboard exists. However, the audit reveals **1 bug, 4 missed files, 2 template gaps, and 2 minor inconsistencies** that represent incomplete edge-case coverage.

---

## What Was Completed Successfully

All 13 plan items were addressed:

- `**src/lib/env.ts`** -- created with `isDev`, `isPreview`, `showDevContent`
- `**src/lib/experiments.ts`** -- new type enums, `publishable`/`content` removed from interface, `includeArchived` removed from filter, `getExperiments()` uses two-phase WIP+listing gate with `showDevContent`
- `**src/lib/articles.ts**` -- `Article` enriched with `status`/`listing` from parent experiment.json, `getArticles()` filters WIP always + non-public in production
- **All 21 experiment.json files** -- migrated to new schema: `publishable`, `content`, `poster` removed; correct `status`/`listing` values set; `legacy: true` on pre-announcing-v2 experiments
- **All 21 experiment layouts** -- `content?.article` replaced with `fs.existsSync`; conditional `robots` metadata added; `content` field casts removed
- **4 generation scripts** -- registry, llms-txt, posters, validation all updated with new gates
- **plopfile.js** -- `publishable`/`poster`/`content.article` removed, new listing choices added
- **Dev dashboard** at `/dev` -- 362-line server component with truth-table badges, warnings, 404 in production
- **5 documentation files** -- AGENTS.md, experiment-metadata.mdc, content-constellation.md, publish-experiment.md, publish-content SKILL.md all updated

---

## Issues Found

### Bug

1. `**generate-registry-json.mjs` line 446** -- defaults listing to `"experiment"` instead of `"public"`. The string `"experiment"` is an old listing value that no longer exists in the type system. `generate-registry.mjs` correctly defaults to `"public"` with `listing === "registry" ? "collected" : "experiments"`, but `generate-registry-json.mjs` uses the stale fallback. Works by accident for categorization but semantically wrong and will break if anyone relies on the listing value downstream.

### Missed Files (not in the plan's docs list, but contain `publishable`/`content` references)

1. **[scripts/delete-article.mjs](scripts/delete-article.mjs)** -- still resets `publishable` to `false` at runtime. Writes a field that no longer exists in the schema. This means deleting an article re-introduces the dead `publishable` field into experiment.json.
2. **[.agents/contexts/architecture.md](.agents/contexts/architecture.md)** -- still documents `publishable` in its example JSON and field table, and lists `"archived"` as a valid status value. Stale architecture documentation that contradicts the redesigned system.
3. **[.cursor/skills/audit-content/SKILL.md](.cursor/skills/audit-content/SKILL.md)** -- still extracts `publishable` and `content` from experiment.json; report table includes a "Publishable" column. The content auditor subagent would reference fields that no longer exist.
4. **[.cursor/agents/content-auditor.md](.cursor/agents/content-auditor.md)** -- report format sorts by "publishable first" and includes a "Publishable" table column. Same issue as above -- stale agent instructions.

### Template Gaps

1. **[plop-templates/experiment/route-layout.tsx.hbs](plop-templates/experiment/route-layout.tsx.hbs)** -- missing three things the hand-updated layouts all have:
  - No `isPublic` const derivation
  - No conditional `robots` metadata (newly scaffolded experiments would lack SEO protection)
  - Uses `experiment.image` for OG/Twitter images instead of computed `posterPath` from `experiment.video`
   Any experiment scaffolded after this redesign would need manual patching to match the pattern.

### Minor Inconsistencies

1. `**velocity-responsive-design` layout** -- only layout with a hardcoded poster path (`"/experiments/velocity-responsive-design/poster.jpg"`) instead of the computed `posterPath` pattern used by the other 4 layouts that have poster references.
2. `**velocity-responsive-design` experiment.json** -- missing `legacy: true`. Created 2025-12-31, which is before announcing-v2 (created 2026-03-10). The plan's migration map listed it under "Post-legacy experiments" without legacy, so this matches the plan's intent -- but it's arguably inconsistent since all other experiments created before announcing-v2 have `legacy: true`.

---

## Summary Table


| Category             | Count       | Items                                                                                   |
| -------------------- | ----------- | --------------------------------------------------------------------------------------- |
| Completed as planned | 13/13 todos | All core todos done                                                                     |
| Bug                  | 1           | `generate-registry-json.mjs` stale default                                              |
| Missed files         | 4           | `delete-article.mjs`, `architecture.md`, `audit-content/SKILL.md`, `content-auditor.md` |
| Template gap         | 1           | Plop layout template missing robots/posterPath/isPublic                                 |
| Minor inconsistency  | 2           | velocity-responsive-design poster + legacy                                              |


---

## Recommended Fixes

If you want to close these gaps, the work is small -- roughly 30 minutes of targeted edits across 6 files plus the plop template.