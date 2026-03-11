# T8: Architecture Restructuring

Cross-cutting restructuring to unify the content system, clean up dead dependencies, and consolidate the build pipeline. Driven by the dual-MDX system pain (Fumadocs for registry, next-mdx-remote for articles) and the @fumadocs/story barrel export breaking Turbopack.

Full plan: [architecture_restructuring_investigation](../../.cursor/plans/architecture_restructuring_investigation_79b46e55.plan.md)

Provenance: [Architecture restructuring investigation](CURRENT_SESSION)

Core principle: **Content is content, experiments are apps.** All authored content (articles, registry docs) belongs in `content/`, managed by one MDX system (Fumadocs). Experiments remain isolated creative sandboxes with their own HTML roots.

## Phase A: Foundation (no user-visible changes)

- [ ] **Remove @fumadocs/story** -- Dependency, `src/lib/story.ts`, `@import "@fumadocs/story/css/preset.css"` in `registry.css`. Keep `.story.tsx` files as standalone dev artifacts. The barrel export pulls `node:fs/promises` which breaks Turbopack client bundling -- this is the root cause of the "story imports in MDX" build error.
- [ ] **Audit unused heavy dependencies** -- Check if any shipped experiment imports `@theatre/core`, `@theatre/r3f`, `@theatre/studio`, or `@react-spring/three`. Remove if unused. Each adds to install size and potential version conflicts.
- [ ] **Consolidate CSS tokens** -- Update `generate-registry-json.mjs` to parse `shared-tokens.css` + `shared-theme.css` at build time instead of maintaining ~85 lines of hardcoded `SHARED_TAILWIND` + `SHARED_CSS_VARS` constants. Single source of truth for design tokens. Related: T7 `@theme inline` color simplification (complementary, not blocking).
- [ ] **Fix lefthook quoting** -- Already tracked in T6. Prerequisite for clean commits during restructuring.

## Phase B: Content Unification (the big change)

Unify on Fumadocs MDX. Eliminate next-mdx-remote.

- [ ] **Add `content/articles/` Fumadocs collection** -- New `articleDocs` in `source.config.ts` with typed frontmatter schema (title, description, publishedAt, updatedAt, experiment slug). Adds remark/rehype plugins (remarkGfm, rehypeSlug, rehypePrettyCode) to Fumadocs MDX config.
- [ ] **Move 3 existing articles to `content/articles/`** -- Migrate `content.mdx` from `src/app/experiments/(<slug>)/<slug>/article/` to `content/articles/<slug>.mdx`. Preserve frontmatter, adjust any relative paths.
- [ ] **Build lazy article demo registry** -- `src/lib/article-demos.ts` maps slug to per-article custom components (BarrelDistortionDemo, CRTEffectDemo, WaveDeformationDemo, etc.) via dynamic imports. Generic `<ArticleDemo name="..." />` MDX component does the lazy lookup. Same pattern as collected component `_map.ts`.
- [ ] **Create dynamic article route** -- Single `src/app/(main)/articles/[slug]/page.tsx` replaces 3 bespoke article pages. Renders via Fumadocs `<MDXContent>`, generates metadata/JSON-LD/OG from frontmatter + experiment.json, computes prev/next navigation from collection. Articles live under `(main)` layout for site chrome (ThemeProvider, CursorProvider, Analytics, footer).
- [ ] **URL migration** -- Add redirects from `/experiments/[slug]/article` to `/articles/[slug]` in `next.config.ts`. Remove `article/` directories from experiment route groups. Move demo components to `src/components/experiments/[slug]/article-demos/`.
- [ ] **Remove old article infrastructure** -- Delete per-experiment `article/page.tsx` files. Remove `next-mdx-remote`, `gray-matter`, `reading-time-estimator` from dependencies. Keep `src/components/mdx/` article component map for reuse in Fumadocs rendering.
- [ ] **Update article data layer** -- Rewrite `getArticles()` in `src/lib/articles.ts` to read from Fumadocs `articleDocs` collection instead of filesystem scanning. Update home page `ContentSectionAsync`, `WritingSection`, and `feed.xml/route.ts` RSS feed.

## Phase C: Pipeline Consolidation

- [ ] **Merge registry scripts** -- Combine `generate-registry-json.mjs`, `build-registry.mjs`, `post-process-registry.mjs`, `generate-registry-mdx.mjs` into single `generate-registry.mjs` with 4 internal phases. Shared in-memory state, proper error propagation, single summary log. Add `--phase=docs` flag for dev iteration. Simplify npm scripts.
- [ ] **Graceful ffmpeg detection** -- `generate-posters.mjs` should skip with a warning if ffmpeg is not on PATH instead of crashing the build. CI environments may not have it.
- [ ] **Verify downstream consumers** -- After pipeline changes, verify home page, RSS feed, `llms.txt`, registry docs, and `npx shadcn add` install flow all work correctly.

## Phase D: Tooling Updates (ongoing, after B+C ship)

- [ ] **Update article scaffolding** -- `npm run new:article` / `npm run new:article:auto` should create in `content/articles/` + scaffold demo component convention in `src/components/experiments/[slug]/article-demos/`.
- [ ] **Update agent tooling** -- Content-writer subagent (`.cursor/agents/content-writer.md`), publish-content skill (`.cursor/skills/publish-content/SKILL.md`), content-auditor (`.cursor/skills/audit-content/SKILL.md`), article-writing rule (`.cursor/rules/article-writing.mdc`), and content-constellation doc (`.agents/contexts/content-constellation.md`) all reference old article file locations. Update to new paths.
- [ ] **Enable cross-content search** -- With articles and registry both on Fumadocs, extend the search API at `/api/registry-search` to include articles, or add a unified search route.

## Dependencies

- Phase A is independent (can start immediately)
- Phase B depends on Phase A (clean foundation first)
- Phase C is independent of Phase B (can run in parallel)
- Phase D depends on Phase B (new file locations must be settled)
- T6 lefthook fix should ship before or with Phase A
- T7 `@theme inline` color simplification is complementary to Phase A CSS consolidation but not blocking
- T2 article generation (15 experiments) should wait for Phase B (write articles in new system, not old)
