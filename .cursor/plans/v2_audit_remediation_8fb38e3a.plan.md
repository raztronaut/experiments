---
name: V2 Audit Remediation
overview: Execute the refined V2 audit remediation -- fixing bugs, removing dead systems, backfilling schema gaps, cleaning code smells, and tightening agent config. Incorporates all user decisions from the audit review.
todos:
  - id: remove-filters
    content: Delete ExperimentFilters.tsx, remove filtering state/logic/JSX from ExperimentDrawerList.tsx, replace filteredExperiments with experiments
    status: completed
  - id: delete-keyboard-keys-article
    content: Create delete:article script (+ npm script), use it to delete keyboard-keys article/docs and remove content block from experiment.json
    status: completed
  - id: backfill-complexity
    content: Add complexity field to all 18 experiment.json files, add prompt to plopfile.js, add validation to validate-experiments.mjs
    status: completed
  - id: replace-isPlaceholder
    content: Make badge media-derived (show when no video+image), stop copying placeholder GIF in plopfile, remove isPlaceholder from interface and all experiment.json files
    status: completed
  - id: fix-profile-mismatch
    content: Rename shader-art.md to r3f-shader.md and update trigger. Create web-audio.md profile. Update STATUS.md inventory.
    status: completed
  - id: clarify-barrel-rule
    content: Update AGENTS.md imports rule to scope 'no barrels' to experiment components, explicitly allow shared infrastructure barrels
    status: completed
  - id: wire-og-images
    content: Add openGraph.images metadata to article pages and plop template pointing to /api/og route
    status: completed
  - id: extract-shared-utils
    content: Create SITE_URL constant, extract getArticleContent() to shared utility, fix articles.ts error handling, fix sitemap dates, fix send-button publishedAt
    status: completed
  - id: code-cleanup
    content: Remove unused deps, move @types to devDeps, clean dev comments, fix drawer import, fix duplicate disconnect, fix dynamic Tailwind, fix CodeBlock clipboard, fix stale workflow heading
    status: completed
  - id: backfill-content-field
    content: Add empty content:{} to 16 experiment.json files missing it (incl keyboard-keys after Phase 2), update stale v2_content_pipeline_audit plan todos
    status: completed
  - id: content-pipeline-fixes
    content: Implement publishable field properly (backfill, validate, document semantics), auto-update experiment.json on article scaffold, extend validator to cross-check all content flags, add already-exists guard to article scaffold
    status: completed
isProject: false
---

# V2 Audit Remediation

Revised plan after user review. Items explicitly ignored: wave-background perf (#3), test experiment (#6), accessibility gaps (#7), React Compiler rule (#9), TableOfContents unused (#11).

**Execution note:** Phases 3, 4, and 9 (content backfill) all modify experiment.json files and plopfile.js. During execution, combine these edits into a single pass per file to avoid editing each file 3 times.

---

## Phase 1: Remove Homepage Filtering

Delete the entire filtering system. All experiments should show without status toggles.

**Files to change:**

- **Delete** `[src/components/ui/experiments/ExperimentFilters.tsx](src/components/ui/experiments/ExperimentFilters.tsx)` entirely
- `**[src/components/ui/ExperimentDrawerList.tsx](src/components/ui/ExperimentDrawerList.tsx)`:** Remove `ExperimentFilters` import, `statusFilter` / `setStatusFilter` state, `filteredExperiments` useMemo, and the `<ExperimentFilters ... />` JSX. Replace all `filteredExperiments` references with `experiments` directly. This also **fixes the Critical #1 bug** (wrong preview when filter active) since there's no more filtered vs unfiltered array mismatch.
- Remove `ExperimentStatus` import from `ExperimentDrawerList` if no longer used after filter removal.

---

## Phase 2: Create `delete:article` Script + Delete Keyboard-Keys Article

### 2A: Create `scripts/delete-article.mjs`

Companion to `npm run new:article`. Mirrors the pattern of `delete-experiment.mjs`.

**Behavior:**

1. Accept a slug argument: `npm run delete:article keyboard-keys`
2. Resolve the route group directory `src/app/experiments/(<slug>)/<slug>/`
3. Check if `article/` and/or `docs/` directories exist
4. Prompt for confirmation (like delete-experiment does)
5. Delete `article/` directory (page.tsx, content.mdx, components.tsx)
6. Delete `docs/` directory (lab-note.md, architecture.md, snippet.md, social.md, changelog.md)
7. Update `experiment.json`: remove the `content` block entirely (read JSON, delete `content` key, write back)
8. Print summary of what was deleted

**Files to create/update:**

- **Create** `scripts/delete-article.mjs` (modeled on `delete-experiment.mjs`)
- **Update** `package.json`: add `"delete:article": "node scripts/delete-article.mjs"` script

### 2B: Run it on keyboard-keys

```bash
npm run delete:article keyboard-keys
```

This deletes 8 files (3 article + 5 docs), removes the `content` block from experiment.json, and leaves the experiment itself intact.

Note: The keyboard-keys `layout.tsx` already dynamically derives `articleSlug` from `content?.article ? experiment.slug : undefined`. Removing the `content` block from experiment.json is sufficient -- the layout auto-adapts (no nav link to article).

---

## Phase 3: Backfill `complexity` Field

Add `complexity` to all 18 experiment.json files and update the scaffolding.

**Classification approach** (based on tech stack and implementation depth):

- **beginner**: blank profile, single-technique experiments (terminal-cat, test, 404-not-found)
- **intermediate**: interaction/dom-effect experiments, single-shader experiments (send-button, keyboard-keys, velocity-responsive-design, transit-airport-split-flap-display, game-of-life-shader, bugged-out-game-of-life-shader)
- **advanced**: multi-technique, R3F, physics, hyperbolic geometry (life-3d, basketball-replay-center, gravity-physics-ui-layout, non-euclidean-hyperbolic-workspace, cursor-depth-explorer, mountain-transition, shader-landing, rabbithole-chat-preloader, rabbithole-chat-gallery-explore)

**Files to update:**

- All 18 `experiment.json` files: add `"complexity": "beginner|intermediate|advanced"`
- `[plopfile.js](plopfile.js)`: Add complexity prompt (list: beginner/intermediate/advanced) to experiment generator, include in experiment.json template
- `[scripts/validate-experiments.mjs](scripts/validate-experiments.mjs)`: Add `complexity` to required fields with enum validation

---

## Phase 4: Replace `isPlaceholder` with Media-Derived Badge

Remove the manual `isPlaceholder` boolean entirely. The "NO PREVIEW YET" badge becomes automatic -- it shows when an experiment has no real preview media (no `video` AND no `image`). This means:

- A new WIP experiment with no preview → badge shows (correct)
- A WIP experiment with a recorded preview video → no badge, preview plays (correct)
- A shipped experiment → no badge, preview plays (correct)

### 4A: Update scaffold to stop faking media

- `**[plopfile.js](plopfile.js)`:** Remove the `no-preview.gif` copy action (lines 89-111). Change experiment.json template: set `"image": ""` and `"video": ""` instead of pointing to the placeholder GIF. Remove `"isPlaceholder": true` from the template.
- The `public/experiments/no-preview.gif` file can stay (harmless) or be deleted.

### 4B: Make badge media-derived in components

- `**[InteractivePreviewMedia.tsx](src/components/ui/experiments/InteractivePreviewMedia.tsx)`** line 121: Replace `experiment.isPlaceholder` with `!experiment.video && !experiment.image` (the badge shows when there's genuinely no media)
- `**[StaticExperimentMedia.tsx](src/components/ui/experiments/StaticExperimentMedia.tsx)`** line 125: Same change

### 4C: Clean up interface and data

- `**[src/lib/experiments.ts](src/lib/experiments.ts)`** line 25: Remove `isPlaceholder?: boolean` from the `Experiment` interface
- **All 15 experiment.json files with `"isPlaceholder": false`:** Remove the field (they have real media, badge won't show)
- `**(test)/experiment.json`:** Remove `"isPlaceholder": true"`, set `"image": ""` (its current `preview.gif` is the copied placeholder, not a real preview)
- `**(terminal-cat)/experiment.json`:** Remove `"isPlaceholder": true` but KEEP `"image"` as-is (its preview.gif is a real ASCII art animation GIF, not the placeholder)

---

## Phase 5: Fix Agent Profile Mismatch

7 experiments use `"profile": "r3f-shader"` but the guidance file is named `shader-art.md` and activates on `"profile": "shader-art"` (which no experiment uses). Also, `web-audio` profile (used by 1 experiment) has no guidance file.

**Files to change:**

- **Rename** `.agent/profiles/shader-art.md` to `.agent/profiles/r3f-shader.md`
- Update the activation trigger inside the file from `"profile": "shader-art"` to `"profile": "r3f-shader"`
- **Create** `.agent/profiles/web-audio.md` with behavioral guidance for audio-focused experiments (Web Audio API, tone generation, audio visualization patterns)
- Update `[STATUS.md](/.agent/STATUS.md)` profiles inventory: change `shader-art.md` to `r3f-shader.md`, add `web-audio.md`, update count from 5 to 6

---

## Phase 6: Clarify AGENTS.md Barrel Import Rule

Update the rule to be precise about scope.

**File:** `[.agent/AGENTS.md](.agent/AGENTS.md)`

Change the imports line from:

```
- **Imports**: No barrel imports. Dynamic import heavy deps (Three.js, GSAP).
```

To something like:

```
- **Imports**: No barrel imports from experiment components. Shared infrastructure (`@/components/mdx`, `@/lib/toolkit`) may use barrels for public API surfaces. Dynamic import heavy deps (Three.js, GSAP).
```

---

## Phase 7: Wire OG Images to Page Metadata

The `/api/og` route exists but nothing references it. Articles and experiments need `openGraph.images` in their metadata exports.

**Files to update:**

- Both remaining article `page.tsx` files (send-button, basketball-replay-center): Add `openGraph.images` to the `metadata` export, pointing to `/api/og?title=...&tags=...`
- `[plop-templates/article/page.tsx.hbs](plop-templates/article/page.tsx.hbs)`: Add `openGraph` to the metadata template so future articles get it automatically
- Optionally update the 3 experiment layouts that read from experiment.json (send-button, basketball-replay-center, keyboard-keys) to use `/api/og` for `openGraph.images` instead of the static poster path

---

## Phase 8: Extract Shared Article Utilities and Constants

**Shared `SITE_URL` constant:**

- Create a constant in `src/lib/constants.ts` (or similar): `export const SITE_URL = "https://www.razisyed.cv"`
- Update `[feed.xml/route.ts](src/app/feed.xml/route.ts)`, `[sitemap.ts](src/app/sitemap.ts)`, `[api/og/route.tsx](src/app/api/og/route.tsx)`, and the 2 remaining article pages to import from it

**Shared `getArticleContent()` utility:**

- Extract the duplicated function from the 2 remaining article `page.tsx` files into `[src/lib/articles.ts](src/lib/articles.ts)`
- Accept a `slug` parameter and derive the path dynamically instead of hardcoding
- Update all article pages and plop template to use the shared function

**Fix `articles.ts` error handling:**

- Line 63: Add `console.warn` to the empty `catch {}` block
- Line 58: Replace `new Date().toISOString()` fallback with a deterministic fallback (e.g., epoch date or throw)

**Fix sitemap dates:**

- `[sitemap.ts](src/app/sitemap.ts)`: Use `experiment.created` / `article.publishedAt` for `lastModified` instead of `new Date()`

**Fix send-button date:**

- Update `send-button/article/content.mdx` frontmatter: change `publishedAt` to be on or after `2025-12-23` (the experiment's `created` date)

---

## Phase 9: Code Cleanup

**Remove unused npm dependencies:**

```
npm uninstall @next/bundle-analyzer summarize-with-ai cross-env
```

Move `@types/matter-js` and `@types/three` to `devDependencies`.

**Clean stream-of-consciousness comments:**

- `[ExperimentDrawerList.tsx](src/components/ui/ExperimentDrawerList.tsx)` lines 279-284: Remove the 5 thinking-out-loud comment lines
- `[cursor/Provider.tsx](src/components/ui/cursor/Provider.tsx)` lines 3-14: Remove "Attempt" history notes
- `[cursor/Cursor.tsx](src/components/ui/cursor/Cursor.tsx)` lines 10-12, 50-53: Remove "Attempt" debug notes
- `[drawer.tsx](src/components/ui/drawer.tsx)` line 48-50: Fix misplaced `GrainOverlay` import and remove stale comment
- `[cursor/Provider.tsx](src/components/ui/cursor/Provider.tsx)` lines 120-121: Remove duplicate `observer.disconnect()`

**Fix dynamic Tailwind class bug:**

- `[DesktopIcon.tsx](src/components/experiments/gravity-physics-ui-layout/DesktopIcon.tsx)` line 93: Replace `w-[${width}px] h-[${height}px]` with inline `style={{ width, height }}` since Tailwind can't generate dynamic classes

**Fix `CodeBlock.tsx` clipboard:**

- Add `.catch(() => {})` to `navigator.clipboard.writeText` call

**Fix stale agent config:**

- `[.agent/workflows/new-experiment.md](.agent/workflows/new-experiment.md)`: Change "Using Framer Motion" heading to "Using Motion"

**Remove finding #32 from plan** (Next.js 16+ is accurate -- was noise in the audit).

**Backfill `content` field on 16 experiments:**

- Add `"content": {}` (empty object) to the 16 experiment.json files missing it (15 original + keyboard-keys after Phase 2 removes its content block), so the schema is consistent and the validator can cross-check declarations against disk

**Update stale `v2_content_pipeline_audit` plan:**

- Mark all 5 pending todos as completed (they were resolved by v2_completion_review)

---

## Phase 10: Content Pipeline Fixes (V2 Plan Gaps)

These are items from the V2 plans that were designed but never fully implemented or closed out.

### 10A: Implement `publishable` field properly

The master V2 plan designed `publishable` as a quality stamp: "`publishable` gates the content pipeline." It's semantically different from `content.article: true` (which just means files exist on disk). `publishable: true` means "this experiment has been through the full publish workflow, content is quality-reviewed, and it's ready for the world." This was step 7 in the publish workflow and was intended to gate the P3 discovery surfaces.

The infrastructure was built but the gating was never wired up because the focus was on getting the pipeline working. Only `basketball-replay-center` has it set. Now implement the intended behavior:

**Backfill:**

- `**(send-button)/experiment.json`:** Add `"publishable": true` (has a real published article)
- `**[plopfile.js](plopfile.js)`:** Add `"publishable": false` to the experiment.json template

**Validate:**

- `**[scripts/validate-experiments.mjs](scripts/validate-experiments.mjs)`:** Add consistency checks:
  - If `publishable: true` but no `content.article`, warn
  - If `content.article: true` + all docs exist but `publishable` not set, warn (nudge to finalize)

**Document semantics:**

- `**[.agent/contexts/architecture.md](.agent/contexts/architecture.md)`:** Clarify in the field table: `publishable` = "Quality-reviewed, ready for public. Set at END of publish workflow, not a prerequisite. Different from `content.article` which only tracks file existence."
- `**[.agent/workflows/publish-experiment.md](.agent/workflows/publish-experiment.md)`:** Add note in Phase 1 that `publishable` is the output of this workflow (step 17), not an input gate. Prerequisite is `status: "shipped"`, output is `publishable: true`.

### 10B: Auto-update experiment.json on article scaffold

Currently `npm run new:article` creates 8 files but doesn't touch experiment.json. Our `delete:article` script (Phase 2) DOES update it. Make them symmetrical.

- `**[plopfile.js](plopfile.js)`:** Add a custom action to the article generator that reads experiment.json, sets `"content": { "article": true }` (merging with any existing content), and writes it back. This means:
  - `npm run new:article` → creates files + sets content flag
  - `npm run delete:article` → deletes files + removes content block

### 10C: Extend validator to cross-check all content flags

The validator currently only cross-checks `content.article` vs `article/content.mdx`. The 5 docs flags are unchecked.

- `**[scripts/validate-experiments.mjs](scripts/validate-experiments.mjs)`:** Add cross-checks for:
  - `content.labNote` vs `docs/lab-note.md`
  - `content.architecture` vs `docs/architecture.md`
  - `content.snippet` vs `docs/snippet.md`
  - `content.social` vs `docs/social.md`
  - `content.changelog` vs `docs/changelog.md`

Same warn-not-fail pattern as the article check: warn if file exists but flag is false, warn if flag is true but file missing.

### 10D: Add "already exists" guard to article scaffold

- `**[plopfile.js](plopfile.js)`:** In the article generator's `validate` function, after checking the experiment exists, also check if `article/page.tsx` already exists. If so, return a clear error: `"Article already exists for this experiment. Delete it first with 'npm run delete:article <slug>'."`

