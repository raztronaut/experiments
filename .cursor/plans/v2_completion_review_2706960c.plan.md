---
name: V2 Completion Review
overview: Comprehensive audit of all 13 V2 implementation plans, STATUS.md, running-findings.md, recent chat transcript, and actual on-disk state. Includes the latest content generation session (ExperimentNav, progressive demos, CodeBlock fix, basketball-replay-center regeneration).
todos:
  - id: commit-v2-work
    content: Commit the ~618 uncommitted V2 changes to git. This is the most critical item -- all V2 work exists only on disk with no safety net.
    status: completed
  - id: delete-dead-article-button
    content: Delete ExperimentArticleButton.tsx -- zero imports outside its own file, fully replaced by ExperimentNav.
    status: completed
  - id: migrate-legacy-layouts-to-nav
    content: Migrate 17 legacy experiment layouts from ExperimentBackButton to ExperimentNav. Only basketball-replay-center uses the new component.
    status: completed
  - id: backfill-metadatabase
    content: Add metadataBase to 17 legacy experiment layouts (only basketball-replay-center has it). Eliminates build warnings.
    status: completed
  - id: backfill-profile-field
    content: Add profile field to all 18 legacy experiment.json files based on their tech stack. Enables AI config profile activation.
    status: completed
  - id: add-r3f-livedemo-warning
    content: Resolved -- publish-experiment.md line 62 guides agents to use Canvas 2D/CSS simplified versions for shader/WebGL experiments instead of LiveDemo.
    status: completed
  - id: fix-plopfile-article-vars
    content: Add createdDate computed property and optional description prompt to plopfile.js article generator so scaffolded MDX has populated frontmatter.
    status: completed
  - id: cancel-template-audit-plan
    content: Mark template_audit_fixes plan as obsolete/cancelled -- all todos were superseded by the motion migration.
    status: completed
  - id: tag-tech-backfill
    content: "P3: Populate tags and tech arrays on 17 legacy experiments (only basketball-replay-center is populated)."
    status: completed
  - id: rss-feed-route
    content: "P3: Create RSS/Atom feed route using existing getArticles() infrastructure."
    status: in_progress
isProject: false
---

# V2 Platform Completion Review (Updated)

## Executive Summary

Of the 13 plan files, **11 are fully completed** (all todos marked done and verified on disk). **1 plan has real outstanding work** (v2_content_pipeline_audit -- 5 pending todos, 3-4 still relevant). **1 plan is fully obsolete** (template_audit_fixes -- superseded by the motion migration). A recent content generation session ([article system debug](49fc0aff)) added new components and patterns that introduce a small cleanup task (dead code from the old button components).

The single biggest outstanding issue is **~618 uncommitted changes** representing the entire V2 body of work sitting only on disk.

---

## What Changed in the Latest Session

The [recent chat](49fc0aff) made several system-level improvements to the content publishing pipeline:

- `**ExperimentNav`** (`src/components/ui/ExperimentNav.tsx`) -- new unified floating nav replacing the separate `ExperimentBackButton` + `ExperimentArticleButton`. Pathname-aware: swaps between "View Article" and "View Experiment". Hides inside iframes. Used in basketball-replay-center layout and the plop template. The 17 other legacy layouts still use the old `ExperimentBackButton`.
- `**CodeBlock` fix** -- outer wrapper changed from `<figure>` to `<div>` to prevent double-border from rehype-pretty-code's own `<figure>` wrapper.
- **Progressive demo pattern** -- new system-level guidance documented in `writing-voice.md`, `publish-experiment.md`, `content.mdx.hbs`, and `components.tsx.hbs`. For complex experiments (3+ techniques), agents build a progressive series of interactive demos where each adds one layer.
- **Basketball-replay-center article regenerated** -- now includes `CRTEffectDemo` (Canvas 2D CRT with scanline/noise/vignette sliders) and `BarrelDistortionDemo` (Canvas 2D distortion with chromatic aberration sliders).
- **Publish workflow rewritten** -- step 6 is now "plan interactive demos BEFORE writing content" with progressive layering pattern. Documents component wiring (page.tsx, not MDX imports).
- `**articleComponents` map stripped** -- CSS handles all typography. Only overrides: h2 (footnote filter), a (external links), pre (CodeBlock), code, blockquote, table, img.
- `**ArticleLayout` finalized** -- single-column `max-w-3xl`, TOC commented out, no motion animations, Sylph-style small title + breadcrumb.

---

## Plan-by-Plan Status

### Fully Completed Plans (11 of 13)

All todos marked completed and verified against the actual codebase:

- **experiments_platform_v2** (master plan) -- 15/15 todos done
- **ai_coding_config_overhaul** -- 8/8 todos done (Section 1)
- **creative_toolkit_foundation** -- 9/9 todos done (Section 2)
- **p1_visual_and_templates** -- 8/8 todos done (Sections 3-4)
- **p2_publishing_ci_transitions** -- 10/10 todos done (Sections 5-6)
- **biome_ultracite_migration** -- 7/7 todos done
- **v2_platform_full_audit** -- 8/8 todos done (restoration after Biome damage)
- **v2_quality_gap_fix** -- 7/7 todos done (Sylph styling, discovery, AI workflow test)
- **motion_migration_+_legacy_cleanup** -- 11/11 todos done (`framer-motion` -> `motion`)
- **status_update_+_test_guide** -- 2/2 todos done
- **article_platform_upgrade** -- 9/9 todos done (Sandpack, writing voice, article button)

### Plan with Real Outstanding Work (1 of 13)

**[v2_content_pipeline_audit](.cursor/plans/v2_content_pipeline_audit_4367f90f.plan.md)** -- 5 pending todos:


| Todo                         | Still Relevant?                                                                                                                                                          | Verified On Disk |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `fix-article-template-biome` | Likely resolved -- `page.tsx.hbs` now has double quotes and sorted imports per on-disk check. Needs a lint run to confirm.                                               | Probably done    |
| `fix-plopfile-article-vars`  | **Yes** -- article generator has no `createdDate` computed property and no `description` prompt. `content.mdx.hbs` leaves both as empty strings.                         | Still pending    |
| `update-workflow-r3f-note`   | **Resolved** -- publish-experiment.md line 62 guides agents to use Canvas 2D/CSS simplified versions for shader/WebGL experiments. Practical guidance achieves the goal. | Done             |
| `backfill-metadatabase`      | **Yes** -- only basketball-replay-center has `metadataBase`. 17 other legacy layouts do not. Causes build warnings.                                                      | Still pending    |
| `backfill-profile-field`     | **Yes** -- 0 of 18 legacy `experiment.json` files have a `profile` field.                                                                                                | Still pending    |


### Obsolete Plan (1 of 13)

**[template_audit_fixes](.cursor/plans/template_audit_fixes_ab8fd621.plan.md)** -- All 11 todos are `pending` in the plan file, but **all are obsolete**:

- `fix-interaction-template` and `fix-dom-effect-template` wanted to change `motion/react` back to `framer-motion`. The motion migration swapped to the `motion` package, making `motion/react` imports **correct**.
- `fix-flaky-test` (life-3d) is obsolete -- all 16 legacy experiment test files were deleted.
- The 8 `rerun-*` todos were a verification cycle superseded by subsequent work.

---

## New Cleanup Issue: Dead Button Components

The `ExperimentNav` component created in the latest session replaces two older components:

- `**ExperimentArticleButton.tsx`** -- **Dead code.** Zero imports outside its own file. Can be safely deleted.
- `**ExperimentBackButton.tsx`** -- **Still in use** by 17 legacy experiment layouts. Only basketball-replay-center uses `ExperimentNav`. Two options:
  - (A) Migrate all 17 layouts to `ExperimentNav` (clean, consistent, can be batched easily since the plop template already shows the pattern)
  - (B) Keep `ExperimentBackButton` for legacy layouts, only use `ExperimentNav` going forward

Option A is recommended since the migration is mechanical: replace the import and JSX in each layout with the `ExperimentNav` component, passing `articleSlug` for experiments that have articles.

---

## Immediate Priority: Uncommitted Changes

There are **~618 uncommitted changes on disk** representing the entire V2 body of work:

- ~40 new/untracked files (agent configs, plans, CI, templates, Biome config)
- ~471 modified files (source migrations, registry JSONs, templates, configs)
- ~107 deleted files (old `.agents/` directory, ESLint config, orphan templates, legacy tests)

This is the single most urgent item. All V2 work exists only on the local filesystem with no git safety net.

---

## Last Verification Results (from latest session)


| Check                      | Result                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit`             | Clean                                                                                                   |
| `npx ultracite check`      | 486 files, 0 errors                                                                                     |
| `validate-experiments.mjs` | 18 experiments valid                                                                                    |
| `npm run build`            | Success, 28 routes, 3 article routes, basketball-replay-center has CRTEffectDemo + BarrelDistortionDemo |


---

## P3 Backlog (from STATUS.md, verified on disk)

These are documented as future work and are **not blockers** for the current V2 milestone:


| Item                               | Status                                               | Notes                                                    |
| ---------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| **Tag/tech backfill**              | 17 of 18 experiments have empty `tags`/`tech` arrays | Only basketball-replay-center is populated               |
| **RSS/Atom feed**                  | Not started                                          | `getArticles()` infrastructure ready, just needs a route |
| **Lighthouse CI**                  | Not started                                          | Needs deployed preview URL                               |
| **MCP capture server**             | Not started                                          | Currently CLI-only (`scripts/capture.mjs`)               |
| **Registry V2**                    | Not started                                          | Interactive docs pages with live demos                   |
| **Article-aware homepage section** | Not started                                          | Dedicated "Writing" section (badge discovery works)      |
| **Content dashboard**              | Not started                                          | Overview of content formats per experiment               |
| **Package extraction**             | Documented only                                      | Process in publish workflow, not automated               |
| **Social asset generation**        | Foundation built                                     | OG API route exists as base                              |
| `**next-view-transitions`**        | Not needed yet                                       | For same-document transitions                            |


---

## Recommended Next Steps (Priority Order)

### 1. Commit the V2 work (Critical)

~618 uncommitted changes need to be organized into logical commits. Could be a single large `feat: v2 platform overhaul` commit or broken into thematic ones.

### 2. Clean up dead code + migrate legacy layouts (Quick wins)

- **Delete `ExperimentArticleButton.tsx`** -- dead code, zero imports
- **Migrate 17 legacy layouts** from `ExperimentBackButton` to `ExperimentNav` -- mechanical replacement, can be batched
- After migration, **delete `ExperimentBackButton.tsx`** too

### 3. Fix remaining content pipeline todos (Medium)

- **Backfill `metadataBase`** on 17 legacy experiment layouts (eliminates build warnings)
- **Backfill `profile` field** on 18 legacy experiment.json files (enables AI profile activation)
- **Add `createdDate` / `description`** to plopfile article generator (quality-of-life)

### 4. Cancel the obsolete template_audit_fixes plan

Mark all 11 todos as cancelled -- they were superseded by the motion migration.

### 5. Tag/tech backfill (P3)

17 experiments have empty `tags`/`tech` arrays. Largest metadata gap remaining.

### 6. RSS feed route (P3)

All infrastructure exists (`getArticles()`, `gray-matter`). Just needs a `/feed.xml` route.