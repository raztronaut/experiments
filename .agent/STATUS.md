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
| **Profiles** | 6 | `r3f-scene.md`, `r3f-shader.md`, `scrollytelling.md`, `interaction.md`, `dom-effect.md`, `web-audio.md` |
| **Skills** | 8 | `lenis-scroll.md`, `gsap-modern.md`, `r3f-core.md`, `shader-authoring.md`, `motion-react.md`, `visual-qa.md`, `tempus-raf.md`, `vercel-react-best-practices.md` |
| **Workflows** | 7 | `new-experiment.md`, `develop-experiment.md`, `visual-qa.md`, `publish-experiment.md`, `add-experiment-component.md`, `add-experiment-assets.md`, `cleanup-experiment.md` |
| **Contexts** | 3 | `toolkit.md` (library inventory + install status), `architecture.md` (experiment structure reference), `writing-voice.md` (RNDR Realm-style content voice) |

### Section 2: Creative Toolkit Foundation

Tier 1 libraries installed, integration layer built, custom hooks migrated. Lenis 1.3.18, Tempus 1.0.0-dev.17, Hamo 1.0.0-dev.10, @gsap/react 2.1.2. Integration layer at `src/lib/toolkit/`. Hook migration: `useElementSize` -> Hamo's `useResizeObserver`.

### Section 3: Visual Feedback Bridge

Playwright capture script (`scripts/capture.mjs` with --delay, --scroll, --viewport, --full-page, --og flags). Console-piped dev metrics (ExperimentDevMetrics, R3FDevMetrics, R3FSceneInspector) in `src/components/dev/`. `DevToolsInjector` component auto-injects `ExperimentDevMetrics` in dev mode (tree-shakes to nothing in production). Wired into the Plop layout template and backfilled into all 18 existing experiment layouts -- every experiment now gets dev metrics in dev mode. R3F-specific tools (R3FDevMetrics, R3FSceneInspector) must be added manually inside `<Canvas>`.

### Section 4: Experiment Architecture V2

Enriched `experiment.json` with V2 fields (profile, status, tags, tech, complexity, content, etc.). 18 experiments backfilled with `status: "shipped"` and `legacy: true`. `getExperiments()` with filtering by status/tags/tech/profile. 7 profile-based templates via Plop (`npm run new:experiment`). Homepage shows all experiments without filtering (filter system removed during V2 audit remediation).

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
| **Article listing** | `src/lib/articles.ts` | `getArticles()` and `getArticleContent(slug)` -- async `fs/promises`, wrapped with `React.cache()` for per-request deduplication. Scans for article/content.mdx, parses frontmatter with gray-matter. Returns `ArticleContent | null` with `fs.access` guard + try/catch (callers `await` + use `notFound()` on null). |
| **Article discovery** | `ExperimentGridCard`, `ExperimentListItem`, `ExperimentPreviewDrawer` | `FileText` badge on cards/list items when `content.article === true`, "Read Article" button in drawer |
| **Sitemap** | `src/app/sitemap.ts` | Includes both experiment URLs and article URLs via `getArticles()`. Uses `SITE_URL` from `@/lib/constants`. `lastModified` uses real dates (`exp.updated \|\| exp.created`, `article.updatedAt \|\| article.publishedAt`). |
| **Content model** | `experiment.json` `content` field | Tracks which content formats exist per experiment (`article`, `labNote`, `architecture`, `snippet`, `social`, `changelog`). All 18 experiments have the field (empty `{}` when no content exists). |
| **Writing voice** | `.agent/contexts/writing-voice.md` | RNDR Realm + Maxime Heckel voice guide. Includes progressive demo pattern for complex experiments. |
| **Docs templates** | `docs/` per experiment | lab-note.md, architecture.md, snippet.md, social.md, changelog.md |
| **OG images** | `scripts/capture.mjs --og` + `/api/og` route | Screenshot-based (Playwright) + dynamic (ImageResponse, edge runtime). Article pages + plop template wire `openGraph.images` to `/api/og`. Experiment layouts use static poster/preview images. |
| **Shared constants** | `src/lib/constants.ts` | `SITE_URL` constant used by feed.xml, sitemap, robots.ts. Single source of truth for the production URL. |
| **Plop generator** | `npm run new:article` | Scaffolds article/ + docs/ for existing experiments (8 files, with `node:` imports, dual-theme code, prev/next nav) |
| **Publish workflow** | `.agent/workflows/publish-experiment.md` | 5-phase content generation guide. Documents progressive demo pattern, component wiring (page.tsx, not MDX imports), interactive element planning. Validated on keyboard-keys + basketball-replay-center. |

**Published articles** (2):
- `/experiments/send-button/article` -- manually authored during restoration
- `/experiments/basketball-replay-center/article` -- AI-generated with upgraded voice + interactive Sandpack demos

*Note: keyboard-keys article was removed during V2 audit remediation (placeholder content, not publication-quality). The experiment itself remains.*

### Section 6: Quality Infrastructure

| Component | File(s) | Purpose |
|-----------|---------|---------|
| **Biome (Ultracite)** | `biome.jsonc`, `ultracite` | Linting + formatting via Biome. Replaces ESLint. `npm run lint` = `ultracite check`, `npm run fix` = `ultracite fix` |
| **CI** | `.github/workflows/ci.yml` | lint -> typecheck -> unit tests -> build on push/PR to main |
| **Type checking** | `npm run typecheck` | `tsc --noEmit` |
| **Experiment validation** | `scripts/validate-experiments.mjs` | Validates experiment.json: required fields, enum values (status, profile, complexity), array types for tags/tech, date format for created, object structure for content, no duplicate slugs |
| **Pre-commit hooks** | `lefthook.yml` | Parallel: ultracite fix (staged), typecheck, validate experiments |
| **View Transitions** | `@view-transition` in globals.css + experiments.css | Cross-document transitions between homepage and experiments |
| **Navigation** | `ExperimentDrawerList.tsx` | Same-tab default (Cmd/Ctrl+click for new tab), enables view transitions |
| **Transition names** | `ExperimentGridCard`, `ExperimentNav`, layout template | Matching `view-transition-name` for morphing between pages |
| **Homepage listing** | `ExperimentDrawerList` | All experiments shown without filtering. `ExperimentFilters` removed during V2 audit remediation. |
| **Build hardening** | `next.config.ts` | No `ignoreBuildErrors` configured -- type errors fail the build. `metadataBase` in plop layout template. `removeConsole` strips `console.*` except `error` in production (terminal-cat uses `window.console` alias to survive this). |

---

## Automation & Scripts

| Command | What It Does |
|---------|-------------|
| `npm run new:experiment` | Scaffold a new experiment with complexity + profile selection (7 profile choices, 6 with guidance files), V2 experiment.json, DevToolsInjector auto-included in layout |
| `npm run new:article` | Scaffold article + docs for an existing experiment (8 files: page.tsx, content.mdx, components.tsx, 5 doc templates) |
| `npm run delete:experiment <name>` | Interactive deletion of route group, components, public assets, registry JSON |
| `npm run delete:article <name>` | Interactive deletion of article/ + docs/ directories, removes `content` block from experiment.json, resets `publishable` to false |
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

**Profiles** (6 of 6): all fully functional
**Rules** (6 of 6): all fully functional
**Skills** (8 of 8): all fully functional
**Workflows** (7 of 7): all fully functional -- publish-experiment validated end-to-end (basketball-replay-center article + full docs constellation)
**Contexts** (3 of 3): all fully functional (including writing-voice)
**Articles** (2): send-button and basketball-replay-center -- both build as static routes with Sylph-quality typography, dual-theme code blocks, and full discovery (badges, drawer links, sitemap). Sandpack (`@codesandbox/sandpack-react`) now available for interactive in-browser code playgrounds in articles.

---

## V2 Plan Progress

| Section | Status | Notes |
|---------|--------|-------|
| **1. AI Coding Config** | **DONE** | All completed |
| **2. Creative Toolkit** | **DONE** | All completed |
| **3. Visual Feedback Bridge** | **DONE** | All completed. DevToolsInjector now auto-injects ExperimentDevMetrics in dev mode via Plop template. |
| **4. Experiment Architecture V2** | **DONE** | All completed |
| **5. Content Publishing** | **DONE** | Infrastructure complete, 2 articles shipped (send-button, basketball-replay-center), AI publish workflow validated, Sandpack interactive demos available |
| **6. Quality Infrastructure** | **DONE** | CI, linting, view transitions, homepage filtering, build hardening, validator tightening |

### Priority Order (from V2 plan)
1. **P0**: DONE (Sections 1-2)
2. **P1**: DONE (Sections 3-4)
3. **P2**: DONE (Sections 5-6)
4. **P3** (next): MCP capture server, Tier 2/3 library adoption, Registry V2, Lighthouse CI

### Post-V2 Remediation (from [comprehensive review](../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md))
- **P0 Critical Issues**: DONE -- DevToolsInjector wired into Plop template, `getArticleContent()` error handling, root layout cleanup, `removeConsole` documented. Metadata inconsistencies fixed (404-not-found -> advanced, test -> archived). Remaining: Cursor.tsx perf bug (deferred).
- **P1 Fulfill Original Promises**: DONE -- DevToolsInjector backfilled into all 18 layouts, ArticleLayout breadcrumbs use `<Link>` + human-readable titles, 5 misplaced deps moved to devDependencies, plopfile timestamp bug fixed, delete-article resets publishable. CSS base style extraction deferred (low priority, ~45 lines, proven safe via shared-tokens.css pattern but not worth the effort).
- **P2 Quality and Performance**: DONE -- Tracked in `.cursor/plans/p2_quality_performance_b442a328.plan.md`. Runtime schema validation in `getExperiments()`, `articles.ts` converted from sync to async `fs/promises`, all 3 data functions wrapped with `React.cache()`, `optimizePackageImports` expanded (motion, @react-three/drei, @codesandbox/sandpack-react), ExperimentDrawerList rAF loop gated on viewMode+isVisible with convergence stop. Deferred: Cursor.tsx perf bug, `useExhaustiveDependencies`, Biome a11y rules, `noExplicitAny`/`noUnusedVariables`.
- **P3 Content, SEO, and AI Discoverability**: DONE -- Tracked in `.cursor/plans/p3_content_seo_f304f8d2.plan.md`. `schema-dts` typed JSON-LD across the entire site: `WebSite` + `Person` `@graph` on root layout, `SoftwareApplication` + `BreadcrumbList` on all 18 experiment layouts (via `ExperimentJsonLd` component), `TechArticle` + `BreadcrumbList` + canonical URLs on article pages. `llms.txt` rewritten to v1.1.1 spec with build-time generation (`scripts/generate-llms-txt.mjs`) for both `llms.txt` and `llms-full.txt`. `robots.txt` updated with 5 additional AI crawler names (ChatGPT-User, Claude-SearchBot, Claude-User, Applebot-Extended, Bytespider). RSS feed uses shared constants + `<lastBuildDate>`. OG image route loads custom font with Inter fallback + description parameter. Sitemap includes `/experiments` (redirect to `/`). Shared constants (`SITE_TITLE`, `SITE_DESCRIPTION`, `AUTHOR_NAME`, `GITHUB_URL`, `TWITTER_URL`). XSS-safe JSON-LD serialization. Deferred: TOC in ArticleLayout (dedicated effort with scroll-spy + responsive design).
- **P4**: Pending. See comprehensive review for full roadmap.

---

## Verification Results (last run: 2026-03-07, post-P3)

| Check | Result |
|-------|--------|
| `npm run typecheck` | Clean |
| `node scripts/validate-experiments.mjs` | 18 experiments valid |
| `npx vitest --run --project unit` | 2 files, 5/5 tests pass |
| `npm run build` | Success, all routes present, 2 article routes, llms.txt + llms-full.txt generated, /experiments redirect works |

Full test results: `.agent/running-findings.md`

---

## Placeholders for P3

| What | Status | Notes |
|------|--------|-------|
| Lighthouse CI | Not started | Needs deployed preview URL; add as separate GitHub Actions workflow |
| Package extraction | Documented | Process described in publish-experiment workflow, not automated |
| Social asset generation | Partially done | OG API route wired to article metadata (`openGraph` + `twitter`). Plop template auto-includes. Experiment layouts use static images. Full social card automation (auto-generate per-experiment) not yet built. |
| `next-view-transitions` | Not needed yet | For same-document transitions in `(main)` route group |
| Registry V2 | Not started | Interactive docs pages with live demos |
| MCP capture server | Not started | Full MCP tool (currently CLI script) |
| Article-aware homepage section | Not started | Dedicated "Writing" section using `getArticles()` (discovery via badges/drawer already works) |
| Content dashboard | Not started | Overview of which experiments have which content formats |
| Legacy layout metadata | Low priority | 15/18 layouts hardcode metadata strings instead of reading experiment.json. 3 layouts (basketball-replay-center, send-button, keyboard-keys) use the dynamic pattern. New experiments use it automatically via plop template. Cosmetic only -- no functional bugs. |
| Validator enhancements | **DONE** | Cross-checks all 6 content flags (`article`, `labNote`, `architecture`, `snippet`, `social`, `changelog`) vs. files on disk. Publishable consistency checks (publishable vs content.article, full constellation nudge). Runs in CI + pre-commit. |

### Completed P3 Items

| What | Status | Notes |
|------|--------|-------|
| JSON-LD structured data (full site) | **DONE** | `schema-dts` typed. Root: `WebSite` + `Person` `@graph`. 18 experiment layouts: `SoftwareApplication` + `BreadcrumbList` via `ExperimentJsonLd` component. 2 article pages: `TechArticle` + `BreadcrumbList`. XSS-safe serialization (`safeJsonLdStringify`). |
| Canonical URLs on article pages | **DONE** | `alternates.canonical` on send-button + basketball-replay-center article pages + Plop template |
| llms.txt + llms-full.txt | **DONE** | Build-time generation via `scripts/generate-llms-txt.mjs`. `llms.txt` follows v1.1.1 spec. `llms-full.txt` has full experiment details. Added to `npm run build` chain. |
| robots.txt AI crawler update | **DONE** | Added ChatGPT-User, Claude-SearchBot, Claude-User, Applebot-Extended, Bytespider with `allow: "/"` |
| Shared constants | **DONE** | `src/lib/constants.ts` now exports `SITE_TITLE`, `SITE_DESCRIPTION`, `AUTHOR_NAME`, `GITHUB_URL`, `TWITTER_URL` |
| Sitemap `/experiments` index | **DONE** | Redirect page at `src/app/experiments/page.tsx`, sitemap entry with priority 0.9 |
| RSS feed improvements | **DONE** | Uses `SITE_TITLE`/`SITE_DESCRIPTION` constants, `<lastBuildDate>` element from latest article |
| OG image improvements | **DONE** | Custom font loading (Test Die Grotesk with Inter fallback), `description` query parameter |
| `framer-motion` -> `motion/react` migration | **DONE** | Swapped `framer-motion` package for `motion`, all 24 source files migrated to `motion/react` imports |
| `@codesandbox/sandpack-react` | **Installed** | Interactive in-browser code playgrounds for MDX articles, used via SandpackDemo + InteractiveWidget components |
| RSS/Atom feed | **DONE** | `src/app/feed.xml/route.ts` -- serves RSS 2.0 feed via `getArticles()` |
| Tag/tech backfill | **DONE** | All 18 experiments have populated `tags` and `tech` arrays |
| Profile backfill | **DONE** | All 18 experiments have `profile` field based on their tech stack |
| metadataBase backfill | **DONE** | All 18 experiment layouts have `metadataBase: new URL("https://www.razisyed.cv")` |
| ExperimentNav migration | **DONE** | All 18 layouts use unified `ExperimentNav`. Old `ExperimentBackButton` + `ExperimentArticleButton` deleted. |
| Plopfile article vars | **DONE** | Article generator now prompts for `description` and auto-populates `createdDate` in frontmatter |
| Validator content checks | **DONE** | `validate-experiments.mjs` cross-checks `content.article` vs. `article/content.mdx` on disk |
| Dynamic articleSlug | **DONE** | send-button + keyboard-keys layouts derive `articleSlug` from `content?.article` instead of hardcoding |
| Complexity backfill | **DONE** | All 18 experiments classified (3 beginner, 6 intermediate, 9 advanced). Plopfile prompts for complexity on scaffold. Validator enforces enum. |
| Content field backfill | **DONE** | All 18 experiments have `content` field in experiment.json (empty `{}` for 16, populated for send-button + basketball-replay-center) |
| Code cleanup | **DONE** | Removed 3 unused deps (`@next/bundle-analyzer`, `summarize-with-ai`, `cross-env`), moved `@types/matter-js` + `@types/three` to devDeps, cleaned debug comments (cursor/Provider, cursor/Cursor, ExperimentDrawerList), fixed duplicate observer.disconnect, fixed misplaced drawer import, fixed DesktopIcon dynamic Tailwind bug, fixed CodeBlock clipboard catch, fixed stale "Framer Motion" heading |
| DevToolsInjector backfill | **DONE** | All 18 existing experiment layouts now have DevToolsInjector (was only in Plop template) |
| ArticleLayout semantics | **DONE** | Breadcrumb `<a>` -> `<Link>`, added `experimentTitle` prop. Title stays as `<p>` (Sylph pattern). TOC stays commented (future effort). |
| Dependency cleanup | **DONE** | Moved `autoprefixer`, `postcss`, `tailwindcss`, `tailwindcss-animate`, `@theatre/studio` to devDependencies |
| Plopfile timestamp fix | **DONE** | `created` field now computed in `actions()` callback, not at module load time |
| delete-article publishable | **DONE** | `delete-article.mjs` now resets `publishable: false` when removing article content |
| Metadata fixes | **DONE** | 404-not-found complexity -> "advanced", test experiment status -> "archived" |

---

## Git History

All V2 work is committed. Two commits on `main`:

**`735a7ac` -- `feat: v2 platform overhaul`** (686 files changed)
- Complete V2 implementation: AI config, creative toolkit, visual feedback bridge, experiment architecture, content publishing pipeline, quality infrastructure
- framer-motion -> motion migration, Biome/Ultracite migration, 3 published articles
- All agent config files, plop templates, CI, pre-commit hooks

**`8ebaad1` -- `refactor: v2 cleanup -- unified nav, metadata backfills, RSS feed`** (42 files changed)
- All 18 layouts migrated to unified ExperimentNav (old buttons deleted)
- metadataBase backfilled on all 17 legacy layouts
- profile field added to all 18 experiment.json files
- tags/tech arrays populated on all 18 experiments
- RSS feed at /feed.xml
- Plopfile article generator: createdDate + description prompt
- template_audit_fixes plan cancelled (superseded by motion migration)

---

## How to Use This Config

1. **AGENTS.md** loads automatically in any AI tool that supports the standard
2. **Rules** load based on file paths being edited (Cursor reads the `file_patterns` frontmatter)
3. **Profiles** activate when you read `experiment.json` and find a `profile` field -- then read `.agent/profiles/<profile>.md`
4. **Skills** are referenced on demand when working on specific technologies
5. **Workflows** are step-by-step processes to follow for specific tasks
6. **Contexts** are background reference documents for quick lookups
7. **This file** (`STATUS.md`) is the meta-document -- read it first to know what's real vs. planned
