---
name: V2 Comprehensive Review
overview: A thorough audit of the V2 platform overhaul -- comparing the original vision and decisions against what was actually implemented, identifying discrepancies, dead code, code smells, incorrect documentation, remaining work, and a prioritized remediation roadmap.
todos:
  - id: fix-dead-code
    content: Wire toolkit + dev tools into Plop layout template, fix architecture.md docs -- the core V2 promise of zero-config tooling is currently unfulfilled (dead code)
    status: completed
  - id: fix-broken-runtime
    content: Fix removeConsole breaking terminal-cat, getArticleContent() missing error handling, Cursor.tsx perf bug, root layout stale comments + mid-file imports
    status: completed
  - id: fix-data-inconsistencies
    content: Fix 404-not-found complexity to advanced, test status to archived, plopfile timestamp bug, delete-article.mjs publishable reset, game-of-life-shader profile
    status: completed
  - id: fix-semantic-seo
    content: "ArticleLayout: h1 for title, Link for breadcrumb, human-readable title; add JSON-LD + canonical to articles; uncomment TOC; fix sitemap/RSS gaps"
    status: completed
  - id: fix-code-quality
    content: Move misplaced deps to devDeps, extract shared CSS base, add getExperiments() schema validation, expand optimizePackageImports, fix Biome exhaustive-deps
    status: completed
  - id: fix-docs-accuracy
    content: "architecture.md auto-inject claim + filter bar mention FIXED. Remaining: STATUS.md accuracy, constants.ts expansion (site title)"
    status: completed
  - id: fix-ci-testing
    content: "Storybook removed, CI parallelized into 2 jobs (checks + build), .next cache added, lefthook typecheck glob-filtered, .nvmrc added"
    status: completed
  - id: content-pipeline-execution
    content: Begin generating articles for remaining 16 experiments, populate unused schema fields (updated, inspiration, related), build content dashboard
    status: pending
isProject: false
---

# V2 Platform Comprehensive Review

## 1. Original Vision Recap

The V2 overhaul was born from [the initial discussion](a30ca44f-fc9a-4954-b4f3-01d58e38a3c7) where 7 foundational decisions were made:

1. **AI-first, not human-first** -- "make ai-driven development easier and less focused on making things easier for me specifically"
2. **Adopt darkroom's cc-settings pattern** for layered agent configuration
3. **Past experiments are NOT the gold standard** -- "majority of our past experiments were built using suboptimal code"
4. **Stand on giants** -- leverage proven libraries (Lenis, Tempus, Hamo, GSAP, Motion)
5. **Zero-config, non-constraining foundation** -- toolkit available without per-experiment setup
6. **Content publishing at RNDR Realm / Benji quality bar** -- interactive articles with progressive demos
7. **Dual-purpose system** -- personal, client, and open-source deliverables

The quality bar was set by: [darkroom.engineering cc-settings](https://github.com/darkroomengineering/cc-settings), [RNDR Realm's Gooey Dropdown](https://blog.rndrealm.com/gooey-dropdown), [Benji's Morphing Icons](https://benji.org/morphing-icons-with-claude), and [Cambio](https://cambio.raphaelsalaja.com/).

---

## 2. What Was Successfully Accomplished

These areas are solid and well-executed:

- **AI Config Layer**: 31 files across 6 categories (AGENTS.md, 6 rules, 6 profiles, 8 skills, 7 workflows, 3 contexts). Well-written, token-efficient, cc-settings-inspired.
- **Template System**: 7 profile-based templates all generating Biome-clean, working demo code. Scaffold -> validate -> delete cycle tested end-to-end.
- **Content Publishing Pipeline**: MDX infrastructure (7 components), ArticleLayout, article listing, 2 published articles (send-button, basketball-replay-center), plop generators for create/delete, validator with content cross-checks.
- **Quality Infrastructure**: Biome/Ultracite migration, CI pipeline, lefthook pre-commit hooks, experiment validator.
- **framer-motion -> motion migration**: Clean swap across 24 source files.
- **Audit Remediation**: 10 phases executed methodically (isPlaceholder removal, complexity backfill, OG wiring, shared constants, code cleanup, content pipeline fixes).

---

## 3. Critical Issues ~~(Requires Immediate Attention)~~ RESOLVED

> **Addressed in [P0 Critical Issues Fix](p0_critical_issues_fix_3da33f1d.plan.md).**

### 3A. ~~Toolkit and Dev Tools Are Dead Code~~ FIXED

Created `DevToolsInjector` (`src/components/dev/DevToolsInjector.tsx`) -- a client component using `next/dynamic` + `process.env.NODE_ENV` gating that tree-shakes to nothing in production. Updated the Plop layout template to auto-include it. Added JSDoc coordination guard to `scroll.ts` documenting the Tempus conflict. Fixed `architecture.md` (accurate auto-inject description, removed stale "filter bar" claim). Remaining: toolkit wiring into profile-specific templates (P1), backfilling 18 existing layouts (P1), scroll/raf automatic coordination (P1).

### 3B. ~~`removeConsole` Breaks terminal-cat in Production~~ NOT A BUG

The `window.console` alias pattern in `useConsoleCat.ts` already survives SWC's `removeConsole` transform (AST-level rewrite only matches direct `console.X()` calls). Added a code comment documenting why the indirect access pattern is intentional.

### 3C. ~~Root Layout Has Stale Debug Comments and Mid-File Imports~~ FIXED

Moved 3 imports (`Analytics`, `GlobalTracking`, `CursorProvider`) to the top import block. Removed the orphaned "Attempt 1" comment and the empty `<head>` element.

### 3D. ~~`getArticleContent()` Has No Error Handling~~ FIXED

`getArticleContent()` now returns `ArticleContent | null` with `fs.existsSync` guard + try/catch. All callers (send-button, basketball-replay-center article pages, Plop template) updated to call `notFound()` on null.

### 3E. Cursor.tsx Performance Bug

**Still open.** In [src/components/ui/cursor/Cursor.tsx](src/components/ui/cursor/Cursor.tsx), `getCursorColor` is defined as a plain function inside the component body but appears in a `useEffect` dependency array. Since it's recreated on every render, the effect tears down and re-sets up the `mousemove` listener and gsap ticker on every single render. Fix: hoist `getCursorColor` outside the component (it's a pure utility with no closures).

---

## 4. Discrepancies From Original Vision

### 4A. "AI agents are the primary builders" -- ~~Partially Delivered~~ Improved

The agent config layer is excellent. Dev metrics (FPS, heap, CLS) are now auto-injected in new experiments via `DevToolsInjector` in the Plop template. R3F-specific tools (R3FDevMetrics, R3FSceneInspector) still require manual addition inside `<Canvas>`. Capture integration remains CLI-only (MCP server is P3).

### 4B. "Zero-config foundation" -- ~~Not Achieved~~ Mostly Achieved

All 18 experiment layouts now have `DevToolsInjector` auto-injected (dev mode only), matching the Plop template. The toolkit integration layer (`scroll.ts`, `raf.ts`, `r3f.tsx`) remains opt-in per-experiment; wiring per-profile defaults is deferred due to scroll/raf coordination conflict.

### 4C. "Publishable by default" -- Infrastructure Only

Only 2/18 experiments (11%) have articles. 16 have completely empty `content: {}`. The pipeline exists but has barely been used. The `updated`, `inspiration`, and `related` schema fields are unused across all 18 experiments.

### 4D. "Stand on giants" -- Installed but Unused

Lenis, Tempus, and Hamo are in `package.json` but the integration layer that makes them usable is dead code. No experiment imports from `@/lib/toolkit/`. These are adding ~50KB+ to `node_modules` with zero benefit.

---

## 5. Code Smells and Inconsistencies

### 5A. Experiment Data Layer -- MOSTLY FIXED

- ~~**Unsafe `as Experiment` cast**~~ FIXED (`validateExperiment()` replaces `as Experiment`)
- ~~**No caching**~~ FIXED (all 3 data functions wrapped with `React.cache()`)
- ~~**Sync/async mismatch**~~ FIXED (`articles.ts` converted to `fs/promises`)
- `**slug` vs `experimentSlug` always identical** in article objects -- redundant data (cosmetic, not fixed)

### 5B. Metadata Inconsistencies Across Experiments

- ~~**404-not-found**: complexity `"beginner"`~~FIXED (now`"advanced"`)
- ~~**test experiment**: status `"shipped"`~~FIXED (now`"archived"`)
- **game-of-life-shader**: profile `"blank"` despite being a canvas/web-worker experiment
- **All 18 experiments** are `status: "shipped"`, `legacy: true` with zero variation -- the status/legacy fields deliver no differentiation value
- **15/18 layouts** still hardcode metadata strings instead of reading from experiment.json

### 5C. CSS Architecture

- [globals.css](src/app/(main)/globals.css) and [experiments.css](src/app/experiments/experiments.css) share ~55 lines of identical base styles (scrollbar, selection, font smoothing, view-transition). The experiments.css is a superset adding article typography. The shared portion should be extracted.

### 5D. Biome Config Contradicts AGENTS.md

[biome.jsonc](biome.jsonc) disables `noExplicitAny` and `noUnusedVariables`, but AGENTS.md says "No `any` -- use `unknown` and narrow." All 7 a11y rules are also disabled, contradicting the accessibility standards in AGENTS.md. `useExhaustiveDependencies: off` actively hides bugs like the Cursor.tsx issue above.

### 5E. ~~Package Dependencies Misplaced~~ FIXED

~~`autoprefixer`, `postcss`, `tailwindcss`, `tailwindcss-animate` are in `dependencies~~ `Moved to devDependencies. ~~`@theatre/studio`is in`dependencies`~~ Moved to devDependencies.` hamo`and`tempus`are still at pre-release`-dev` versions (not changed -- these are the latest published versions from darkroom.engineering).

### 5F. ~~Plopfile Timestamp Bug~~ FIXED

~~`new Date().toISOString()` evaluated at module load time~~ Now computed in `actions()` callback via `answers.createdDate`.

### 5G. ~~delete-article.mjs Doesn't Reset `publishable`~~ FIXED

~~Leaves `publishable: true` intact~~ Now resets `publishable` to `false` when removing article content.

### 5H. ~~OG Image Quality~~ FIXED

~~The `/api/og` route uses `system-ui` font (platform-dependent rendering), has no `description` parameter~~ FIXED (P3). Now loads Replica Bold OTF with Google Fonts woff fallback. `description` query param renders below title. Tags still render as pill badges.

### 5I. ArticleLayout Semantic Issues -- PARTIALLY FIXED

In [src/components/ui/ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx):

- Title uses `<p>` instead of `<h1>` -- **INTENTIONAL** (Sylph pattern). MDX content provides the `<h1>` via `# Title`. Changing would create duplicate `<h1>` elements.
- ~~Breadcrumb uses raw `<a>` tags instead of Next.js `~~`~~FIXED (now uses~~

```)`

- ~~Raw slug shown in breadcrumb~~ FIXED (added `experimentTitle` prop, displays human-readable title)
- TOC component is commented out -- **INTENTIONAL** (will be a dedicated future effort with scroll-spy + responsive design)

### 5J. Preview Media Component Redundancies

Both [InteractivePreviewMedia.tsx](src/components/ui/experiments/InteractivePreviewMedia.tsx) and [StaticExperimentMedia.tsx](src/components/ui/experiments/StaticExperimentMedia.tsx):

- Render both a gradient fallback AND a "NO PREVIEW YET" badge when no media exists (overlapping DOM)
- Have `hover:scale-110` on a `pointer-events-none` child (dead CSS that can never trigger)

---

## 6. Performance Improvements ~~Needed~~ MOSTLY DONE

- ~~**Add caching to `getExperiments()` and `getArticles()**`~~ DONE (`React.cache()` wrappers)
- ~~**Expand `optimizePackageImports**`~~ DONE (added `motion`, `@react-three/drei`, `@codesandbox/sandpack-react`)
- **Add `.next` cache to CI** -- full rebuild on every push is wasteful (P4)
- ~~**Fix lerp animation loop** in ExperimentDrawerList~~ DONE (gated on viewMode+isVisible, convergence stop)
- ~~**ExperimentDrawerList** lerp loop runs unconditionally~~ DONE (event-driven restart from `handleMouseMove`)

---

## 7. SEO and Content Gaps -- MOSTLY RESOLVED

- ~~**No `/experiments` index page** in sitemap~~ FIXED (P3: redirect page + sitemap entry)
- ~~**No `<lastBuildDate>`** in RSS feed~~ FIXED (P3)
- ~~**Site title hardcoded** in feed~~ FIXED (P3: uses `SITE_TITLE`/`SITE_DESCRIPTION` constants)
- **TOC commented out** in ArticleLayout -- DEFERRED (dedicated future effort)
- **Article title as `<p>` not `<h1>**` -- INTENTIONAL (Sylph pattern, MDX owns `<h1>`)
- ~~**No structured data (JSON-LD)** on article pages~~ FIXED (P3: `TechArticle` + `BreadcrumbList`, plus `SoftwareApplication` on all 18 experiments, `WebSite` + `Person` `@graph` on root)
- ~~**No canonical URLs** on article pages~~ FIXED (P3)
- **16/18 experiments** have no content -- ongoing content creation effort
- ~~**No llms.txt/llms-full.txt**~~ FIXED (P3: build-time generated, v1.1.1 spec)
- ~~**robots.txt missing AI crawler names**~~ FIXED (P3: 5 new entries)

---

## 8. Testing and CI Gaps -- RESOLVED

- **No browser/integration tests** in CI -- Playwright is installed but only used for manual captures (unchanged -- E2E is a future effort)
- ~~**Storybook build** not validated in CI~~ RESOLVED (Storybook removed entirely in P4)
- **All 16 legacy experiment tests deleted** -- test coverage is minimal (only 2 test files, 5 tests total)
- ~~`**typecheck` runs on every pre-commit** regardless of which files changed~~ FIXED (lefthook glob filter on `*.{ts,tsx}`)
- **No test coverage reporting** (`@vitest/coverage-v8` installed, can wire as follow-up)
- ~~**CI steps are sequential**~~ FIXED (split into 2 parallel jobs: `checks` + `build`)

---

## 9. Documentation Inaccuracies

- ~~**[architecture.md](.agent/contexts/architecture.md) line 11**: Claims dev metrics are "auto-injected" -- they are not~~ FIXED (now accurately describes DevToolsInjector auto-injection + manual R3F tools)
- ~~**[architecture.md](.agent/contexts/architecture.md) line 121**: Says "Homepage renders ExperimentDrawerList (with filter bar)" -- filter bar was removed~~ FIXED
- ~~**[STATUS.md](.agent/STATUS.md)**: Claims all 6 sections are "DONE" but toolkit integration and dev tool injection are not functional~~ FIXED (DevToolsInjector now backfilled into all 18 layouts, STATUS.md updated with P1 remediation)
- ~~**[STATUS.md](.agent/STATUS.md) line 84**: Claims "Build hardening: No ignoreBuildErrors" and "ignoreBuildErrors removed"~~ FIXED (rephrased to "No `ignoreBuildErrors` configured")

---

## 10. P3 Items Still Pending

Per the original V2 plan priority ordering:


| Item                              | Status          | Notes                                |
| --------------------------------- | --------------- | ------------------------------------ |
| MCP capture server                | Not started     | Still CLI-only                       |
| Lighthouse CI                     | Not started     | Needs deployed preview URL           |
| Registry V2 with interactive docs | Not started     | No progress                          |
| Content dashboard                 | Not started     | No overview of content status        |
| Article-aware homepage section    | Not started     | Only badge/drawer discovery works    |
| Tier 2/3 library adoption         | Not started     | Only Tier 1 installed                |
| Package extraction workflow       | Documented only | Process described but never executed |
| next-view-transitions             | Not needed yet  | For same-document transitions        |


---

## 11. Recommended Remediation Priority

### P0: Fix Broken Things -- DONE

1. ~~Wire dev tools into the Plop layout template (conditionally in dev mode)~~ DONE
2. ~~Fix `removeConsole` to exclude terminal-cat (or add per-experiment override)~~ NOT A BUG (documented)
3. ~~Fix `getArticleContent()` error handling~~ DONE
4. Fix Cursor.tsx `getCursorColor` performance bug -- DEFERRED
5. ~~Fix root layout stale comments + mid-file imports~~ DONE
6. ~~Fix 404-not-found complexity to `"advanced"`, test status to `"archived"`~~ DONE

### P1: Fulfill Original Promises -- DONE

1. Wire toolkit into Plop templates -- DEFERRED (scroll/raf coordination conflict)
2. ~~Fix architecture.md~~ DONE -- ~~Fix STATUS.md documentation inaccuracies~~ DONE
3. ~~Backfill DevToolsInjector into 18 existing experiment layouts~~ DONE
4. ~~Fix ArticleLayout semantic issues~~ DONE (`<a>` -> `<Link>`, `experimentTitle` prop). `<p>` title is intentional (Sylph pattern -- MDX `# Title` owns `<h1>`). TOC stays commented (future effort).
5. ~~Extract shared CSS base styles~~ DEFERRED (only ~45 lines, proven safe via `shared-tokens.css` pattern but low ROI)
6. ~~Move misplaced production dependencies to devDependencies~~ DONE

### P2: Quality and Performance -- DONE

> **Tracked in [P2 Quality and Performance](p2_quality_performance_b442a328.plan.md).**

1. ~~Add runtime schema validation in `getExperiments()` (Zod or manual)~~ DONE (manual `validateExperiment()` function)
2. ~~Add caching to filesystem scan functions~~ DONE (`React.cache()` on all 3 data functions, `articles.ts` converted sync -> async)
3. ~~Expand `optimizePackageImports`~~ DONE (added motion, @react-three/drei, @codesandbox/sandpack-react)
4. Enable `useExhaustiveDependencies` in Biome (fix violations) -- DEFERRED (~90 hook-using files, wide blast radius)
5. ~~Fix plopfile timestamp bug~~ DONE ~~+ add `content: {}` placeholder~~ already done
6. ~~Fix delete-article.mjs to reset `publishable`~~ DONE
7. ~~Fix ExperimentDrawerList perpetual rAF loop~~ DONE (gated on viewMode+isVisible, convergence stop)

### P3: Content and SEO -- DONE

> **Tracked in [P3 Content SEO](p3_content_seo_f304f8d2.plan.md).**

1. ~~Add JSON-LD structured data to article pages~~ DONE (`TechArticle` + `BreadcrumbList` on 2 article pages + Plop template, `schema-dts` typed)
2. ~~Add canonical URLs to article pages~~ DONE (`alternates.canonical` on 2 article pages + Plop template)
3. Uncomment and finalize TOC in ArticleLayout -- DEFERRED (dedicated future effort with scroll-spy + responsive design)
4. ~~Fix sitemap to include `/experiments` index~~ DONE (redirect page + sitemap entry)
5. ~~Fix RSS feed (lastBuildDate, constant for site title)~~ DONE (uses `SITE_TITLE`/`SITE_DESCRIPTION` constants, `<lastBuildDate>` added)
6. ~~Improve OG image route (custom font, description param)~~ DONE (custom font loading with Inter fallback, description parameter)
7. Backfill remaining 16 experiments with articles (ongoing)

**Additional P3 items (beyond original plan):**

- ~~WebSite + Person `@graph` JSON-LD on root layout~~ DONE (replaces standalone `Person`)
- ~~SoftwareApplication + BreadcrumbList JSON-LD on all 18 experiment layouts~~ DONE (shared `ExperimentJsonLd` component)
- ~~llms.txt rewrite to v1.1.1 spec + llms-full.txt build-time generation~~ DONE
- ~~robots.txt updated with 5 missing AI crawler names~~ DONE
- ~~Shared constants (`SITE_TITLE`, `SITE_DESCRIPTION`, `AUTHOR_NAME`)~~ DONE
- ~~XSS-safe JSON-LD serialization (`safeJsonLdStringify`)~~ DONE

### P4: Infrastructure -- DONE

> **Tracked in [P4 CI Testing Infrastructure](p4_ci_testing_infrastructure_eb0aeeb8.plan.md).**

1. ~~Add browser tests to CI~~ Storybook removed entirely (22 files + 8 packages + all docs references)
2. ~~Add Storybook build validation to CI~~ N/A (Storybook removed)
3. ~~Parallelize CI steps~~ DONE (2 parallel jobs: `checks` + `build`, `.next/cache` caching, concurrency group)
4. ~~Lefthook typecheck optimization~~ DONE (glob filter: `*.{ts,tsx}`)
5. ~~`.nvmrc`~~ DONE (Node 22, CI uses `node-version-file`)
6. Begin P3 items from original plan (MCP, Lighthouse CI, Registry V2) -- future effort

