# AI Coding Configuration -- Status & Dependencies

> Read this first. It tells you what's working now, what's planned, and where the forward references are.
> Source of truth for the V2 platform plan: `.cursor/plans/experiments_platform_v2_d73b9769.plan.md`

---

## Platform Overview

This is a creative coding lab. Every experiment lives in its own isolated route group with its own `<html>`/`<body>`. The platform exists to scaffold, build, and publish experimental UI/shaders/pages/components -- for personal use, client work, and sharing publicly via articles. V2 made AI agents the primary builders, with systems optimized for agent-driven development and publishing.

---

## What Was Done

### Section 1: AI Coding Config

The AI coding configuration was overhauled into a layered, token-efficient system modeled on [darkroom.engineering/cc-settings](https://github.com/darkroomengineering/cc-settings) v8.

#### File Inventory

| Category | Count | Files |
|----------|-------|-------|
| **Standards** | 1 | `AGENTS.md` -- cross-tool portable coding standards (~605 words) |
| **Rules** | 6 | `experiments.md` (always-on), `r3f.md`, `shaders.md`, `animations.md`, `scroll.md`, `performance.md` (path-conditioned) |
| **Profiles** | 5 | `r3f-scene.md`, `shader-art.md`, `scrollytelling.md`, `interaction.md`, `dom-effect.md` |
| **Skills** | 8 | `lenis-scroll.md`, `gsap-modern.md`, `r3f-core.md`, `shader-authoring.md`, `motion-react.md`, `visual-qa.md`, `tempus-raf.md`, `vercel-react-best-practices.md` |
| **Workflows** | 7 | `new-experiment.md`, `develop-experiment.md`, `visual-qa.md`, `publish-experiment.md`, `add-experiment-component.md`, `add-experiment-assets.md`, `cleanup-experiment.md` |
| **Contexts** | 3 | `toolkit.md` (library inventory + install status), `architecture.md` (experiment structure reference), `writing-voice.md` (RNDR Realm-style content voice) |

### Section 2: Creative Toolkit Foundation

Tier 1 libraries installed, integration layer built, custom hooks migrated. Lenis 1.3.18, Tempus 1.0.0-dev.17, Hamo 1.0.0-dev.10, @gsap/react 2.1.2. Integration layer at `src/lib/toolkit/`. Hook migration: `useElementSize` -> Hamo's `useResizeObserver`.

### Section 3: Visual Feedback Bridge

Playwright capture script (`scripts/capture.mjs` with --delay, --scroll, --viewport, --full-page, --og flags). Console-piped dev metrics (ExperimentDevMetrics, R3FDevMetrics, R3FSceneInspector). All in `src/components/dev/`.

### Section 4: Experiment Architecture V2

Enriched `experiment.json` with V2 fields (profile, status, tags, tech, complexity, content, etc.). 18 experiments backfilled with `status: "shipped"` and `legacy: true`. `getExperiments()` with filtering by status/tags/tech/profile. 7 profile-based templates via Plop (`npm run new:experiment`). Homepage filtering by status/tags via `ExperimentFilters` component.

### Section 5: Content Publishing Pipeline

MDX article infrastructure using `next-mdx-remote/rsc` (Sylph-inspired pattern). Zero next.config changes needed. Article styling ported from [Sylph](https://github.com/raphaelsalaja/sylph) for visual parity.

| Component | File(s) | Purpose |
|-----------|---------|---------|
| **Shared CSS tokens** | `src/app/shared-tokens.css` | `:root`/`.dark` design tokens imported by both `globals.css` and `experiments.css` -- all routes get valid theme variables |
| **Article typography** | `src/app/experiments/experiments.css` | Sylph-ported: 24px vertical rhythm, heading coupling, dual-theme code blocks, line numbers, kbd-style inline code, TOC highlight animation |
| **Article rendering** | `next-mdx-remote/rsc` + rehype/remark plugins | MDX compilation with dual-theme syntax highlighting (`github-light`/`github-dark`), GFM, heading IDs |
| **MDX components** | `src/components/mdx/` | Minimal articleComponents map (Sylph-style: CSS handles typography). CodeBlock, Callout, LiveDemo, SandpackDemo, InteractiveWidget, CodeStep. TOC exists but commented out. |
| **Article layout** | `src/components/ui/ArticleLayout.tsx` | Sylph-style: small semibold title, `>` breadcrumb, single-column, prev/next nav. TOC commented out. No motion animations. |
| **Experiment nav** | `src/components/ui/ExperimentNav.tsx` | Unified nav component: "Return to Experiments" + context-aware "View Article"/"View Experiment" toggle. Replaces separate ExperimentBackButton + ExperimentArticleButton. |
| **Article listing** | `src/lib/articles.ts` | `getArticles()` -- scans for article/content.mdx, parses frontmatter with gray-matter |
| **Article discovery** | `ExperimentGridCard`, `ExperimentListItem`, `ExperimentPreviewDrawer` | `FileText` badge on cards/list items when `content.article === true`, "Read Article" button in drawer |
| **Sitemap** | `src/app/sitemap.ts` | Includes both experiment URLs and article URLs via `getArticles()` |
| **Content model** | `experiment.json` `content` field | Tracks which content formats exist per experiment (`article`, `labNote`, `architecture`, `snippet`, `social`, `changelog`) |
| **Writing voice** | `.agent/contexts/writing-voice.md` | RNDR Realm + Maxime Heckel voice guide. Includes progressive demo pattern for complex experiments. |
| **Docs templates** | `docs/` per experiment | lab-note.md, architecture.md, snippet.md, social.md, changelog.md |
| **OG images** | `scripts/capture.mjs --og` + `/api/og` route | Screenshot-based (Playwright) + dynamic (ImageResponse, edge runtime) |
| **Plop generator** | `npm run new:article` | Scaffolds article/ + docs/ for existing experiments (8 files, with `node:` imports, dual-theme code, prev/next nav) |
| **Publish workflow** | `.agent/workflows/publish-experiment.md` | 5-phase content generation guide. Documents progressive demo pattern, component wiring (page.tsx, not MDX imports), interactive element planning. Validated on keyboard-keys + basketball-replay-center. |

**Published articles** (3):
- `/experiments/send-button/article` -- manually authored during restoration
- `/experiments/keyboard-keys/article` -- AI-generated via publish workflow (full content constellation: article + 5 docs)
- `/experiments/basketball-replay-center/article` -- AI-generated with upgraded voice + interactive Sandpack demos

### Section 6: Quality Infrastructure

| Component | File(s) | Purpose |
|-----------|---------|---------|
| **Biome (Ultracite)** | `biome.jsonc`, `ultracite` | Linting + formatting via Biome. Replaces ESLint. `npm run lint` = `ultracite check`, `npm run fix` = `ultracite fix` |
| **CI** | `.github/workflows/ci.yml` | lint -> typecheck -> unit tests -> build on push/PR to main |
| **Type checking** | `npm run typecheck` | `tsc --noEmit` |
| **Experiment validation** | `scripts/validate-experiments.mjs` | Validates experiment.json: required fields, enum values, array types for tags/tech, date format for created, object structure for content, no duplicate slugs |
| **Pre-commit hooks** | `lefthook.yml` | Parallel: ultracite fix (staged), typecheck, validate experiments |
| **View Transitions** | `@view-transition` in globals.css + experiments.css | Cross-document transitions between homepage and experiments |
| **Navigation** | `ExperimentDrawerList.tsx` | Same-tab default (Cmd/Ctrl+click for new tab), enables view transitions |
| **Transition names** | `ExperimentGridCard`, `ExperimentNav`, layout template | Matching `view-transition-name` for morphing between pages |
| **Homepage filtering** | `ExperimentFilters` + `ExperimentDrawerList` | Status toggles only (All/Shipped/WIP). Tag filters removed. |
| **Build hardening** | `next.config.ts` | `ignoreBuildErrors` removed -- type errors now fail the build. `metadataBase` in plop layout template. |

---

## Automation & Scripts

| Command | What It Does |
|---------|-------------|
| `npm run new:experiment` | Scaffold a new experiment with profile selection (7 profiles), V2 experiment.json, dev metrics injection, preview.gif copy |
| `npm run new:article` | Scaffold article + docs for an existing experiment (8 files: page.tsx, content.mdx, components.tsx, 5 doc templates) |
| `npm run delete:experiment <name>` | Interactive deletion of route group, components, public assets, registry JSON |
| `npm run capture <slug>` | Playwright screenshot with --delay, --scroll, --viewport, --full-page, --og flags |
| `npm run validate:experiments` | Validate all experiment.json files (required fields, enums, types, no duplicates) |
| `npm run generate:registry` | Generate shadcn-compatible registry JSON for all experiments |
| `npm run generate:posters` | Extract poster JPGs from experiment videos via ffmpeg |
| `npm run optimize:videos` | Re-encode large experiment videos via ffmpeg (CRF 26, 1280px max) |
| `npm run lint` / `npm run fix` | Biome linting/formatting via Ultracite |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest test suite |
| `npm run build` | Poster generation + registry generation + Next.js build |

---

## What's Fully Working Now

All agent config files are functional with zero forward dependencies:

**Profiles** (5 of 5): all fully functional
**Rules** (6 of 6): all fully functional
**Skills** (8 of 8): all fully functional
**Workflows** (7 of 7): all fully functional -- publish-experiment validated end-to-end (keyboard-keys article + full docs constellation)
**Contexts** (3 of 3): all fully functional (including writing-voice)
**Articles** (3 of 3): send-button, keyboard-keys, and basketball-replay-center -- all build as static routes with Sylph-quality typography, dual-theme code blocks, and full discovery (badges, drawer links, sitemap). Sandpack (`@codesandbox/sandpack-react`) now available for interactive in-browser code playgrounds in articles.

---

## V2 Plan Progress

| Section | Status | Notes |
|---------|--------|-------|
| **1. AI Coding Config** | **DONE** | All completed |
| **2. Creative Toolkit** | **DONE** | All completed |
| **3. Visual Feedback Bridge** | **DONE** | All completed |
| **4. Experiment Architecture V2** | **DONE** | All completed |
| **5. Content Publishing** | **DONE** | Infrastructure complete, 3 articles shipped, AI publish workflow validated end-to-end, Sandpack interactive demos available |
| **6. Quality Infrastructure** | **DONE** | CI, linting, view transitions, homepage filtering, build hardening, validator tightening |

### Priority Order (from V2 plan)
1. **P0**: DONE (Sections 1-2)
2. **P1**: DONE (Sections 3-4)
3. **P2**: DONE (Sections 5-6)
4. **P3** (next): MCP capture server, Tier 2/3 library adoption, Registry V2, Lighthouse CI

---

## Verification Results (last run: 2026-03-06)

| Check | Result |
|-------|--------|
| `npx ultracite check` | 486 files, 0 errors |
| `npm run typecheck` | Clean |
| `npx vitest --run --project unit` | 2 files, 5/5 tests pass |
| `node scripts/validate-experiments.mjs` | 18 experiments valid |
| `npm run build` | Success, 28 routes, 3 article routes |
| Test 1: scaffold + verify + delete (interaction) | All 13 checks PASS |

Full test results: `.agent/running-findings.md`

---

## Placeholders for P3

| What | Status | Notes |
|------|--------|-------|
| Lighthouse CI | Not started | Needs deployed preview URL; add as separate GitHub Actions workflow |
| Package extraction | Documented | Process described in publish-experiment workflow, not automated |
| RSS/Atom feed | Infrastructure ready | `getArticles()` + gray-matter built, just needs feed route |
| Social asset generation | Foundation built | OG API route is the base for cards/images |
| `next-view-transitions` | Not needed yet | For same-document transitions in `(main)` route group |
| Registry V2 | Not started | Interactive docs pages with live demos |
| MCP capture server | Not started | Full MCP tool (currently CLI script) |
| Storybook browser tests in CI | Not started | Needs Playwright browser setup |
| Tag/tech backfill | Not started | 18 legacy experiments have empty `tags`/`tech` arrays (status/legacy already backfilled) |
| Article-aware homepage section | Not started | Dedicated "Writing" section using `getArticles()` (discovery via badges/drawer already works) |
| Content dashboard | Not started | Overview of which experiments have which content formats |
| `framer-motion` -> `motion/react` migration | **DONE** | Swapped `framer-motion` package for `motion`, all 24 source files migrated to `motion/react` imports |
| `@codesandbox/sandpack-react` | **Installed** | Interactive in-browser code playgrounds for MDX articles, used via SandpackDemo + InteractiveWidget components |

---

## Uncommitted Changes

There are extensive uncommitted changes on disk from the V2 quality gap fix pass + test suite session. The next step is a cleanup commit. Key changes include:

**Previous (V2 quality gap fix)**:
- `.agents/` directory fully removed (79 files git rm'd)
- `eslint.config.mjs` removed
- `.agent/rules/new-experiment-process-and-rules.md` removed
- V1 orphan plop templates removed
- `shared-tokens.css` created, both CSS entry points updated
- Sylph article typography ported to `experiments.css`
- `ArticleLayout.tsx` rewritten (breadcrumb, mobile TOC, prev/next, staggered animations)
- `CodeBlock.tsx` updated (theme-aware, no hardcoded bg)
- `TableOfContents.tsx` updated (data-highlight pattern)
- Article discovery wired (GridCard, ListItem, PreviewDrawer, sitemap)
- keyboard-keys article + full docs constellation created
- `next.config.ts` hardened (ignoreBuildErrors removed)
- `validate-experiments.mjs` tightened (tags, tech, created, content validation)
- Plop templates updated (node: imports, dual-theme, metadataBase, prev/next)

**Article platform upgrade**:
- ArticleLayout rewritten to match Sylph (removed hero header, tags/tech, motion animations)
- Sandpack installed, SandpackDemo + InteractiveWidget MDX components created
- ExperimentArticleButton component added to experiment layouts
- Homepage tag filters removed
- Writing voice expanded with Maxime Heckel reference and interactive element guidance
- h2/h3 CSS readability fix in experiments.css
- Plop templates updated (article page.tsx.hbs Biome compliance, route-layout.tsx.hbs article button)

**This session (article system debug + quality polish)**:
- `articleComponents` MDX map stripped to match Sylph: removed h1/h3/p/ul/ol overrides that were fighting CSS typography rules. CSS handles all typography now.
- ArticleLayout rewritten: TOC commented out, single-column `max-w-3xl`, no motion animations
- `ExperimentNav` component created: unified nav replacing separate ExperimentBackButton + ExperimentArticleButton. Flex container, pathname-aware (swaps "View Article"/"View Experiment" based on route). Used in basketball-replay-center layout + plop template.
- `CodeBlock` fixed: changed outer wrapper from `<figure>` to `<div>` to prevent double-border from rehype-pretty-code's own `<figure>` wrapper
- Homepage tag filters removed from ExperimentFilters + ExperimentDrawerList
- Writing voice expanded: Maxime Heckel reference, **progressive demo pattern** (one interactive widget per major technique, each building on the last), SandpackDemo/InteractiveWidget/LiveDemo usage patterns
- Publish workflow rewritten: step 6 is now "plan interactive demos BEFORE writing content" with progressive layering pattern. Documents component wiring (import in page.tsx, merge into components prop, NOT MDX import).
- Plop article templates improved: content.mdx.hbs has progressive demo structure guide + wiring instructions, components.tsx.hbs documents the progressive demo pattern with concrete examples, page.tsx.hbs documents the next-mdx-remote component wiring pattern
- Basketball-replay-center content regenerated: article has CRTEffectDemo + BarrelDistortionDemo interactive widgets with parameter sliders, wired through page.tsx
- Critical bug found + fixed: next-mdx-remote does NOT support MDX import statements — article-specific components must be imported in page.tsx and passed via the components prop

**Previous session (test suite + migration)**:
- `framer-motion` -> `motion` package swap (package.json, package-lock.json)
- 24 source files migrated from `framer-motion` to `motion/react` imports
- 11 import-ordering fixes for Biome compliance post-migration
- 16 legacy experiment test files deleted
- 14 plop templates rewritten for Biome-clean output (sorted imports, sorted Tailwind classes, sorted JSX attributes, double quotes, proper indentation)
- `plopfile.js` updated (experiment.json trailing newline)
- AGENTS.md, toolkit.md, STATUS.md, README.md updated for `motion/react`
- `.agent/running-findings.md` created (test results documentation)

---

## How to Use This Config

1. **AGENTS.md** loads automatically in any AI tool that supports the standard
2. **Rules** load based on file paths being edited (Cursor reads the `file_patterns` frontmatter)
3. **Profiles** activate when you read `experiment.json` and find a `profile` field -- then read `.agent/profiles/<profile>.md`
4. **Skills** are referenced on demand when working on specific technologies
5. **Workflows** are step-by-step processes to follow for specific tasks
6. **Contexts** are background reference documents for quick lookups
7. **This file** (`STATUS.md`) is the meta-document -- read it first to know what's real vs. planned
