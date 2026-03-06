---
name: STATUS Update + Test Guide
overview: Update STATUS.md to accurately reflect the current state (including the quality gap fixes just completed), and produce a structured real-world testing prompt the user can paste into a new AI agent chat to exercise every V2 system end-to-end.
todos:
  - id: update-status-md
    content: "Rewrite .agent/STATUS.md to reflect current state: quality gap fixes completed, 2 articles shipped, AI publish workflow tested, shared CSS tokens, Sylph styling, discovery UI, build hardening. Add uncommitted changes warning."
    status: completed
  - id: write-test-prompt
    content: Write a standalone testing prompt (markdown file or direct output) with 7 structured tests that the user can paste into a new AI agent chat to exercise every V2 system end-to-end.
    status: completed
isProject: false
---

# STATUS.md Update + Real-World Test Guide

## Part 1: STATUS.md Rewrite

The current [STATUS.md](.agent/STATUS.md) is stale -- it was written before the quality gap fix pass and still claims things like "needs first real article to validate e2e" (we now have 2 articles). It also doesn't mention the Sylph-ported article styling, the discovery UI, or the shared CSS tokens system.

### What to update:

**Section 5 (Content Publishing)** -- now truly complete:

- Two real articles exist and build as static routes: `send-button` and `keyboard-keys`
- Article styling ported from [Sylph](https://github.com/raphaelsalaja/sylph): vertical rhythm, dual-theme code blocks, line numbers, kbd-style inline code, TOC heading highlight, staggered fade-in animations
- Article discovery wired: `FileText` badge on cards/list items, "Read Article" button in preview drawer, article URLs in sitemap via `getArticles()`
- Shared CSS tokens (`src/app/shared-tokens.css`) imported by both route groups -- all experiment pages (including articles) now have valid theme variables
- `ArticleLayout` has breadcrumb, mobile TOC (collapsible below xl), prev/next article navigation
- AI-native publish workflow tested end-to-end on `keyboard-keys` (all 6 content formats generated)

**Section 6 (Quality Infrastructure)** -- additions:

- `ignoreBuildErrors: true` removed from `next.config.ts`
- `metadataBase` added to plop experiment layout template
- `validate-experiments.mjs` now validates `tags`/`tech` (array), `created` (date), `content` (object)
- `optimize:videos` npm script added
- V1 orphan plop templates deleted

**"What's Fully Working Now"** -- update counts:

- Workflows: 7 of 7 (publish-experiment validated end-to-end, not just written)
- Articles: 2 shipped (send-button, keyboard-keys), with full content constellations
- Add a note that the AI-native publish pipeline has been successfully tested

**P3 Placeholders table** -- update:

- "Article-aware homepage" still not started (but discovery via badges/drawer IS done)
- "Tag/tech backfill" still not started
- Remove "needs first real article to validate e2e" -- that's done now

**New section: "V2 Quality Gap Fixes"** -- document what was done:

- Shared CSS tokens system
- Sylph article styling port
- Article discovery UI
- Build config hardening (ignoreBuildErrors removed)
- Validator tightening

**Uncommitted changes note** -- add a clear warning:

- 79+ `.agents/` file deletions, `eslint.config.mjs` deletion, and all quality gap work are on disk but NOT committed to git. Next step is a cleanup commit.

### What NOT to change:

- Sections 1-4 are accurate as-is
- File inventory tables are correct
- The "How to Use This Config" section at the bottom is fine
- The `framer-motion` vs `motion/react` situation (24 source files use old path) is documented in agent docs; not a STATUS item

---

## Part 2: Real-World Testing Prompt

The user wants a structured prompt they can paste into a **new AI agent chat** to exercise every V2 system. Here is the structure:

### Test 1: Scaffold a New Experiment (interaction profile)

- Agent runs `npm run new:experiment`, enters "magnetic-card" with profile "interaction"
- Verify: 9 files created (layout, page, error, experiment.json, .gitkeep, preview.gif copy, component, stories, test)
- Verify: `experiment.json` has `"profile": "interaction"`, `"status": "wip"`, `"tags": []`, `"tech": []`
- Verify: Component imports from `framer-motion` and uses gesture/spring patterns
- Verify: Layout has `metadataBase`, `viewTransitionName`, imports `experiments.css`
- Verify: `npm run typecheck` passes, `npx vitest --run --project unit` passes (new test file)
- Cleanup: `npm run delete:experiment magnetic-card` (answer y)

### Test 2: Scaffold Article + Generate Content (AI publish workflow)

- Agent picks `gravity-physics-ui-layout` (has interesting physics/matter.js techniques)
- Agent runs `npm run new:article`, enters "gravity-physics-ui-layout"
- Verify: 8 files created (article/page.tsx, article/content.mdx, article/components.tsx, 5 docs files)
- Agent reads `.agent/workflows/publish-experiment.md` and `.agent/contexts/writing-voice.md`
- Agent reads experiment source (`src/components/experiments/gravity-physics-ui-layout/`)
- Agent writes `content.mdx` following RNDR Realm voice (hook, basic version, enhancement, key insight, full thing, context)
- Agent writes all 5 docs files (lab-note, architecture, snippet, social, changelog)
- Agent updates `experiment.json` with `"content": { "article": true, ... }`
- Verify: `npm run build` passes, `/experiments/gravity-physics-ui-layout/article` appears in route table
- Verify: `FileText` badge appears on homepage grid card for this experiment
- Verify: Drawer shows "Read Article" button

### Test 3: Visual QA of Articles

- Start dev server (`npm run dev`)
- Visit `http://localhost:3000/experiments/send-button/article`
  - Verify: Page has proper dark background (not white/broken), themed text
  - Verify: Breadcrumb shows "Home / send-button / Article"
  - Verify: Title animates in with staggered spring fade
  - Verify: Code blocks have syntax highlighting that works in both light/dark mode
  - Verify: Inline `code` renders as keyboard-style pills
  - Verify: TOC sidebar visible on desktop; on mobile, collapsible "On this page" button works
  - Verify: Clicking a TOC item scrolls to heading and flashes a yellow highlight
  - Verify: Prev/next article links appear at the bottom
- Visit `http://localhost:3000/experiments/keyboard-keys/article` -- same checks

### Test 4: Homepage Discovery

- Visit `http://localhost:3000`
  - Verify: Send-button and keyboard-keys cards show `FileText` icon next to title
  - Verify: Clicking send-button card opens drawer; drawer has "Read Article" button
  - Verify: Clicking "Read Article" navigates to the article page
  - Verify: Filter UI (All/Shipped/WIP) works; selecting WIP shows empty state

### Test 5: OG Image Route

- Visit `http://localhost:3000/api/og?title=Send+Button&tags=animation,react`
  - Verify: Returns a 1200x630 dark-themed image

### Test 6: Delete Experiment

- Agent scaffolds a throwaway experiment: `npm run new:experiment` with name "test-deletion"
- Agent verifies files exist
- Agent runs `npm run delete:experiment test-deletion` (answer y)
- Verify: Route group, components, public dir, and registry JSON are all gone
- Verify: `npm run validate:experiments` still passes

### Test 7: Full Verification Suite

- `npx ultracite check` -- 0 errors
- `npm run typecheck` -- clean
- `npx vitest --run --project unit` -- 40/40 (or 41+ if new test added)
- `node scripts/validate-experiments.mjs` -- all valid
- `npm run build` -- all routes build, both article routes present, no errors

This prompt should be self-contained -- the agent should be able to execute all 7 tests without any additional context from you, using only the codebase and agent docs.