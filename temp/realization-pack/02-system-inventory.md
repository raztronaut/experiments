# System Inventory

This inventory records the current system surfaces in the clean-main baseline, along with their source of truth, primary consumers, visibility, and major risks.

## Inventory table

| Surface | Current source of truth | Primary consumers | Visibility | Major risks / notes |
|---|---|---|---|---|
| Experiment runtime pages | `src/app/experiments/(slug)/layout.tsx`, `page.tsx`, `experiment.json`, component dirs, public assets | Visitors, preview drawer, article embeds, SEO | Public / dev / registry depending on metadata | Strong isolation model. Risk is duplicated layout/meta logic and drift between v2 and legacy. |
| Experiment metadata | `src/app/experiments/(slug)/experiment.json` | Homepage, `/dev`, registry pipeline, llms generation, posters, feeds, sitemap | Internal source model | Good native source of truth. Main problem is duplicated interpretation across consumers. |
| Public articles | `src/app/experiments/(slug)/slug/article/content.mdx` + article page boilerplate | Visitors, feeds, llms exports, SEO | Public only when shipped + public | Separate MDX system from registry docs. Presence is rediscovered multiple ways. |
| Content constellation docs | `src/app/experiments/(slug)/slug/docs/*.md` | Internal authoring, publish workflow, future self, collaborators | Internal | Valuable system already exists. Current location couples authored docs to runtime tree. |
| Homepage / portfolio shell | `src/app/(main)/page.tsx`, `(main)/layout.tsx`, `getExperiments()`, `getArticles()` | Public visitors | Public | Public identity is broader than “experiments list,” but architecture still leans heavily on experiment/article scanners. |
| `/dev` dashboard | `src/app/(main)/dev/*` + direct experiment scanning | Internal / preview | Dev and preview only | Supposed to be the truth surface, but currently re-derives truth itself. |
| Registry JSON install surface | `registry.json`, `public/registry/*.json`, `/r/:slug` rewrite | `npx shadcn add`, docs, internal browsing | Backstage but public | Public API contract. Pipeline is powerful but fragmented. |
| Registry docs | `content/registry/**/*`, Fumadocs source, `(registry)` routes | Advanced visitors, you, adopters | Backstage but public | Already sophisticated. Build contract and grid/index relationship need clarification. |
| Registry search | `registrySource` + `/api/registry-search` | Registry docs UI | Backstage but public | Bound to Fumadocs-generated source and current registry docs shape. |
| Feeds (`feed.xml`, `feed.json`, `atom.xml`) | `getArticles()` + article content | Feed readers, discovery tools | Public | Depends on current article discovery model. |
| Sitemap / robots | `getExperiments()`, `getArticles()`, metadata routes | Search engines, AI crawlers | Public | Must stay aligned with canonical route decisions. |
| Markdown / llms exports | `scripts/generate-llms-txt.mjs`, experiment markdown route, registry markdown routes | LLMs, browsers, internal tooling | Public / backstage | Global llms script rediscovering experiments/articles separately is a key drift point. |
| Scaffolding: experiments | `plopfile.js`, `scripts/create-experiment.mjs`, templates | Humans, AI agents | Internal workflow | Critical part of the system. Path changes must update scaffolding immediately. |
| Scaffolding: articles | `scripts/create-article.mjs`, plop article templates | Humans, AI agents | Internal workflow | Tied directly to current article/content constellation locations. |
| Scaffolding: collected | `scripts/create-collected.mjs`, templates | Humans, AI agents | Internal workflow | Registry-facing and lower risk than article migration, but still path-sensitive. |
| `.agents/` knowledge base | `.agents/contexts`, `.agents/rules`, `.agents/workflows`, `.agents/backlog` | AI agents, humans | Internal | Deeply coupled to current paths and conventions. Must be migrated with architecture changes. |
| `.cursor/` rules, skills, agents | `.cursor/rules`, `.cursor/skills`, `.cursor/agents`, `.cursor/plans` | Cursor and agent workflows | Internal | Also path-sensitive. Especially important for article/content moves. |
| CI / build / verification | `package.json`, `lefthook.yml`, `.github/workflows/ci.yml`, scripts | Humans, CI, agents | Internal / operational | Verification is fragmented; build prerequisites are not fully owned by one command path. |

## Surface-specific notes

### Experiments runtime

- Count: 21 experiments
- Legacy: 17
- Shipped: 19
- WIP: 2
- Listings:
  - `public`: 17
  - `dev`: 3
  - `registry`: 1

This is still the core product engine. The main thing to preserve is isolation.

### Writings and content constellation

- Public article count: 4
- Content constellation docs on disk: 20 markdown files across the 4 experiments with complete constellations

This system is real and valuable already. The restructuring should incorporate it, not overwrite it conceptually.

### Registry/docs/search

- `public/registry/*.json` files: 108 in the clean-main generated state
- `content/registry`: generated MDX docs for Fumadocs
- `.source/`: generated runtime files for Fumadocs

This is already a serious derived surface. It is probably the most operationally complex subsystem in the repo.

### Scaffolding and agent workflow

The repo is not just code plus scripts. It is code plus:

- scaffolding
- docs
- agent rules
- Cursor rules
- workflow docs

These are part of the operating system of the lab and must be treated as architectural surfaces.

## Component-level migration inventory

These are the most important component surfaces that article/content migration will affect directly:

| Component / module | Why it matters |
|---|---|
| `src/components/ui/ExperimentNav.tsx` | Article navigation assumes `/experiments/:slug/article`. Route migration breaks link semantics and nearby article-presence assumptions. |
| `src/components/ui/WritingSection.tsx` | Homepage writing surface tied to current article shape and URLs. |
| `src/components/ui/ContentSection.tsx` | Main homepage composition point for experiments vs writing. |
| `src/components/ui/ArticleLayout.tsx` | Current bespoke article wrapper with nav, metadata, and typography assumptions. |
| `src/components/mdx/` | Article-facing MDX components that must move into or be bridged into the final Fumadocs article component map. |
| `src/components/mdx/controls/` | Control primitives for interactive article demos; must survive article runtime migration. |

### MDX component library inventory

Current reusable content/UI components the article migration must carry:

- `BeforeAfterImage`
- `Slideshow`
- `Details`
- `Pill`
- `Fullbleed`
- `Callout`
- `CodeStep`
- `CodeBlock`
- `SandpackDemo`
- `LiveDemo`
- `InteractiveWidget`
- control primitives: `Range`, `Checkbox`, `Switch`, `Button`, `Radio`, `ControlGroup`

## Dev tools ecosystem inventory

Architecturally relevant runtime tooling in `src/components/dev/`:

- `DevToolsInjector`
- `R3FDevToolsInjector`
- `DebugOverlay`
- `ExperimentDevMetrics`
- `DebugCamera`
- `R3FSceneInspector`

Supporting hooks:

- `useDebug`
- `useGSAPDebug`
- `useDevControls`

Runtime globals:

- `window.__experimentMetrics`
- `?debug` query-param activation path

## API route inventory

| Route | Role | Notable coupling |
|---|---|---|
| `/api/experiments` | Public experiment JSON API | Depends on `getExperiments()` shape and experiment discovery. |
| `/api/og` | Dynamic OG image generator | References local font assets and query params; SEO/social-sensitive. |
| `/api/registry-search` | Registry docs search API | Bound to Fumadocs registry source generation. |
| `/feed.xml`, `/feed.json`, `/atom.xml` | Feed routes | ISR, depend on article discovery and markdown conversion. |
| `/experiments/llms.mdx/[...slug]` | Experiment/article markdown export | Depends on experiment/article source conventions. |
| `/registry/llms*` routes | Registry markdown/text exports | Bound to Fumadocs source and generated docs. |

## Current overall shape

The repo is best understood as four stacked systems:

1. **Runtime experiment platform**
2. **Authored content system**
3. **Derived registry/docs system**
4. **Agent/scaffolding/verification operating system**

The main restructuring risk is changing one layer without carrying the others with it.
