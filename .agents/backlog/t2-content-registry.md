# T2: Content Pipeline & Registry

The largest body of remaining work. Infrastructure is complete but barely used.

## Articles

- **Generate articles for 16 experiments** -- Only `send-button` and `basketball-replay-center` have articles. The remaining 16 have `content: {}`. This is the single largest content gap.
  - Source: [V2 review `content-pipeline-execution](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)`

## Schema Fields

- **Populate `updated` field** -- Date of last significant change. Empty across all 18 experiments.
- **Populate `inspiration` field** -- Array of `{ title, url }`. Empty across all 18 experiments.
- **Populate `related` field** -- Array of slugs. Empty across all 18 experiments.
  - Source: [V2 review Section 4C](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

## Registry

- [ ] **Registry V2: Interactive Docs Explorer** -- Full plan in [`.cursor/plans/registry_interactive_docs_aaa07efa.plan.md`](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md). Registry JSON generation works (`generate-registry.mjs`) but has known bugs (duplicate files, hardcoded tailwind/cssVars, non-standard output path, no file type semantics). 7-phase build:
  1. **Hybrid pipeline** -- Split monolithic `generate-registry.mjs` into auto-discover → `shadcn build` → post-process. Add `registry.config.json` for curation. Extend to discover shared UI, hooks, utilities.
  2. **Fumadocs setup** -- `fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`, `@fumadocs/story`, `fumadocs-docgen`. Content source, shadcn CSS preset, dark theme.
  3. **Route structure** -- `(registry)` route group with Fumadocs DocsLayout. Custom overview `page.tsx` (card grid) + Fumadocs `[[...slug]]/page.tsx` for doc pages.
  4. **MDX auto-generation** -- Script generates MDX doc pages from registry JSON per item (preview embed, install command, source code blocks).
  5. **Preview system** -- iframe for experiments, `@fumadocs/story` for shared UI (inline prop controls), code-only for hooks/utilities.
  6. **Custom components** -- `RegistryGrid`, `RegistryCard`, `InstallCommand`, `ExperimentPreview`, `RegistryMeta`.
  7. **Polish** -- Theme tuning, responsive QA, loading states, umami analytics, OG images, nav link.
  - ~20 new files, ~4 modified. Partially addresses: T2 Content Dashboard, T2 Social Asset Automation (OG images), T5 Package Extraction (motivates completing it). Synergizes with T7 `next-view-transitions` (registry page transitions) and T7 Tier 2/3 library adoption (consume upstream registries, adapt, redistribute).
  - Source: [Component registry chat](4924b037-3555-402a-aac8-9b88984b0d30), [Registry interactive docs plan](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md)
- [ ] **Quick Component Collector skill** -- New skill at `.agents/skills/component-collector/SKILL.md` for rapidly adding discovered components, snippets, and effects into the registry without full experiment scaffolding. Use cases: CodePen finds, forked library components, one-off utility hooks, CSS techniques. Lighter than porting skill -- just "save this thing to my collection." Depends on: Registry V2 pipeline.
  - Source: [Registry interactive docs plan -- "Adjacent Notes"](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md)
- [ ] **Registry as personal library** -- Add `origin`/`status` fields to registry items to track collected (bookmarked), adapted (ported), and original (built from scratch) items. Flips registry from "things I distribute" to "things I know about." Optional `collections/` directory for curated external references that aren't experiments.
  - Source: [Registry interactive docs plan -- "Adjacent Notes"](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md)
- [ ] **Registry access control** -- Start with unlisted + noindex (zero code). Add basic password gate later if needed (middleware + cookie). JSON endpoints for `npx shadcn add` stay public regardless.
  - Source: [Registry interactive docs plan -- "Adjacent Notes"](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md)

## Content Infrastructure

- **Content Dashboard** -- Dev-facing overview showing which experiments have which content formats (article, lab-note, architecture, snippet, social, changelog). Helps track content status at a glance. Partially addressed by: Registry V2 overview page (above).
  - Source: STATUS.md line 173
- **ArticleLayout TOC** -- Table-of-contents component is commented out at `src/components/articles/ArticleLayout.tsx` line 74-75. Needs scroll-spy implementation + responsive design. Listed in AGENTS.md as a deferred item.
  - Source: [V2 review Section 5I](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)
- **Social Asset Automation** -- OG API route exists and is wired to article metadata. Need full per-experiment social card automation (auto-generate cards, code snippet images, short video captures). Registry V2 Phase 7 adds OG images for registry pages.
  - Source: STATUS.md line 168
- **Package Extraction Automation** -- Process documented in `publish-experiment` workflow but never automated or executed. Registry V2 is the consumption side -- visible install commands motivate completing extraction.
  - Source: STATUS.md line 167

