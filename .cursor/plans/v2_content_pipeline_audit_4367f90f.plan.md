---
name: V2 Content Pipeline Audit
overview: Comprehensive audit of the V2 content generation pipeline after the basketball-replay-center publish test -- what was done, what passed verification, and what gaps remain in the plans and implementation.
todos:
  - id: fix-article-template-biome
    content: "Fix plop-templates/article/page.tsx.hbs for Biome compliance: double quotes, sorted imports, sorted JSX attributes"
    status: completed
  - id: fix-plopfile-article-vars
    content: Add createdDate computed property and optional description prompt to the article generator in plopfile.js
    status: completed
  - id: update-workflow-r3f-note
    content: Add note to publish-experiment.md about R3F/WebGL experiments not supporting LiveDemo inline -- suggest screenshot/video/link instead
    status: completed
  - id: backfill-metadatabase
    content: Add metadataBase to all 18 legacy experiment layouts to eliminate build warnings
    status: completed
  - id: backfill-profile-field
    content: Add profile field to legacy experiment.json files based on their tech stack
    status: completed
isProject: false
---

# V2 Content Pipeline Audit: Basketball Replay Center Test

## What I Did (Step-by-Step)

Following `[.agent/workflows/publish-experiment.md](.agent/workflows/publish-experiment.md)` phases 1-5:

**Phase 1 (Preparation):**

- Read all 6 source files for the experiment (BasketballReplayCenter, ReplayGrid, ScreenPanel, ReplayPreloader, DistortionPass, usePreloaderTimeline)
- Read `[.agent/contexts/writing-voice.md](.agent/contexts/writing-voice.md)` for RNDR Realm voice
- Identified the 3 most interesting techniques: CRT screen shader, GSAP proxy objects for uniform animation, barrel distortion post-processing
- Ran `npm run new:article` which scaffolded 8 files

**Phase 2 (Article):**

- Rewrote `article/content.mdx` with full technical walkthrough in RNDR Realm voice (hook, basic version, 4 enhancement sections, key insight, reflection)
- Rewrote `article/page.tsx` to fix Biome compliance (double quotes, sorted imports, sorted JSX attributes)
- Wrote `article/components.tsx` with placeholder demos (WebGL requires Canvas context, can't inline)

**Phase 3 (Documentation):**

- Wrote all 5 docs files: lab-note.md, architecture.md, snippet.md, social.md, changelog.md

**Phase 4 (Social):**

- social.md contains: 7-tweet X thread, launch post, one-liner, LinkedIn post

**Phase 5 (Finalization):**

- Updated experiment.json with `publishable: true`, `content` flags (all 6 true), `tags`, `tech`
- Skipped OG generation (no dev server running, Playwright not available in this context)

---

## Verification Results (All Pass)

- `tsc --noEmit` -- **clean** (0 errors)
- `npx ultracite check` -- **482 files, 0 errors**
- `node scripts/validate-experiments.mjs` -- **18 experiments valid**
- `npx vitest --run --project unit` -- **2 files, 5/5 tests pass**
- `npm run build` -- **success**, `/experiments/basketball-replay-center/article` appears in route table
- `getArticles()` will discover the article (scans for `article/content.mdx` with frontmatter)
- `sitemap.xml` will include the article URL (uses `getArticles()`)
- Discovery UI (FileText badge, "Read Article" drawer button) will work (checks `content?.article === true`)

---

## Assessment Against the V2 Plans

### What's Working Well

1. **The publish workflow is smooth end-to-end.** Scaffold -> read source -> write content -> update metadata -> verify. The workflow doc is clear, the templates exist, the pipeline compiles. This is the 3rd article generated (after send-button manual + keyboard-keys AI-generated).
2. **The writing voice guide produces consistent output.** The article matches the RNDR Realm tone -- first-person, code-forward, progressive disclosure, no filler. The guide at `.agent/contexts/writing-voice.md` is effective.
3. **The plop scaffolder works correctly.** `npm run new:article` creates all 8 files in the right directories, validates the experiment exists first.
4. **Discovery is fully wired.** Article badge on cards, drawer link, sitemap inclusion, prev/next navigation -- all implemented per the V2 Quality Gap Fix plan.
5. **Build infrastructure catches real problems.** Typecheck, lint, experiment validation, and full build all pass. The CI pipeline (`[.github/workflows/ci.yml](.github/workflows/ci.yml)`) would catch regressions.

### Gaps and Issues Found

#### Issue 1: Plop Article Template Has Biome Violations (Medium)

The scaffolded `article/page.tsx` from `plop-templates/article/page.tsx.hbs` generates code with:

- Single quotes (Biome requires double quotes)
- Unsorted imports (Biome `organizeImports`)
- Unsorted JSX attributes (Biome `useJsxSortedAttributes` -- `title` before `description` instead of alphabetical)

I had to manually rewrite the entire file. The experiment templates were already fixed (referenced in STATUS.md: "14 plop templates rewritten for Biome-clean output"), but **the article template was missed in that pass**.

**Fix needed in:** `[plop-templates/article/page.tsx.hbs](plop-templates/article/page.tsx.hbs)` -- double quotes, sorted imports, sorted JSX attributes.

#### Issue 2: Plop Template Uses Undefined Variables (Low)

`[plop-templates/article/content.mdx.hbs](plop-templates/article/content.mdx.hbs)` uses `{{createdDate}}` and `{{description}}` but the article generator in `[plopfile.js](plopfile.js)` only prompts for `name` -- no `description` prompt, no `createdDate` computed property. Result: scaffolded MDX has empty `publishedAt`, `updatedAt`, and `description` frontmatter.

Not blocking (the agent fills these in), but the template should either add these prompts to the plopfile or use static placeholders.

#### Issue 3: Legacy Layouts Missing metadataBase (Low)

Build output shows: "metadataBase property in metadata export is not set..." for 2 routes. The plop template includes `metadataBase` but the 18 legacy experiment layouts do not. Basketball-replay-center's `[layout.tsx](src/app/experiments/(basketball-replay-center)`/layout.tsx) is one of them.

This is documented in the V2 Quality Gap Fix plan as a known issue but was only fixed in the plop template, not backfilled to legacy layouts.

#### Issue 4: No Profile Field on Legacy Experiments (Low)

Basketball-replay-center's experiment.json has no `profile` field. It's `legacy: true` so the AI config system doesn't know which profile to activate. The V2 plan says legacy experiments aren't refactored, but the `profile` field could be backfilled without changing any code.

#### Issue 5: LiveDemo Not Usable for R3F Experiments (Design Gap)

The publish workflow says to use `<LiveDemo slug="..." />` to embed the experiment, but R3F/WebGL experiments require a full Canvas context and can't be meaningfully inlined into an MDX article. The `components.tsx` for this article is just placeholder divs.

The workflow should acknowledge this and provide guidance: for R3F/WebGL experiments, use a screenshot or link instead of LiveDemo.

#### Issue 6: OG Image Not Generated (Skipped Step)

Phase 5 step 13 says to generate an OG image via `npm run capture <slug> -- --og`. This was skipped because it requires a running dev server and Playwright. Not a bug in the pipeline, but the workflow should note this as a step that may need to be done separately.

### What's Missing From the Plans (P3 Backlog)

These are documented as P3 in `[STATUS.md](.agent/STATUS.md)` and are accurate:

- **RSS/Atom feed** -- `getArticles()` infrastructure built, just needs a `/feed.xml` route
- **Content dashboard** -- no overview of which experiments have which content formats
- **Article-aware homepage section** -- no dedicated "Writing" section (badge discovery works though)
- **Tag/tech backfill** -- 18 legacy experiments have empty `tags`/`tech` arrays
- **MCP capture server** -- still CLI-only (`scripts/capture.mjs`), not an MCP tool
- **Registry V2** -- no interactive docs pages
- **Lighthouse CI** -- not started (needs deployed preview URL)

### Recommendations

1. **Fix the article plop template for Biome compliance** -- This is the highest-value fix. Every future article generated via the workflow will need manual cleanup otherwise.
2. **Add a note to publish-experiment.md about R3F/WebGL experiments** -- LiveDemo doesn't work for Canvas-based experiments. Suggest linking to the experiment or embedding a screenshot/video instead.
3. **Backfill metadataBase on legacy layouts** -- A simple find-and-replace across 18 layouts. Eliminates build warnings permanently.
4. **Backfill profile field on legacy experiments** -- Adding `"profile": "r3f-scene"` (or appropriate value) to legacy experiment.json files enables the AI config system to activate the right rules/skills even when working on older experiments.
5. **Fix plopfile article generator** -- Add `createdDate` computed value and optionally a `description` prompt so the scaffolded MDX has populated frontmatter.

