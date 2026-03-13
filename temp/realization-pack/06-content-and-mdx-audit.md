# Content And MDX Audit

## Executive summary

The repo currently runs **two real MDX systems**:

1. **Fumadocs MDX**
   - used for registry docs
   - build-time compiled
   - searchable
   - backed by generated `content/registry` and `.source`
2. **`next-mdx-remote` MDX**
   - used for public experiment articles
   - runtime-rendered
   - frontmatter parsed with `gray-matter`
   - article metadata and eligibility rediscovered through filesystem scanning

This dual system is the clearest content architecture fault line in the repo.

## What already uses Fumadocs

- registry docs at `/registry/docs`
- registry markdown exports
- registry search at `/api/registry-search`
- `mdx-components.tsx` as the Fumadocs component layer
- `source.config.ts` and `src/lib/registry-source.ts`

## What still uses `next-mdx-remote`

- article pages under `/experiments/:slug/article`
- article metadata/frontmatter parsing
- article adjacency and feed content loading via `src/lib/articles.ts`
- article markdown exports

## MDX behavior change to watch carefully

### Current article model

With `next-mdx-remote`:

- article MDX cannot use native `import` statements
- components are injected through the `components` prop
- demo-component wiring lives in route-level boilerplate

## Public content vs internal content

### Public authored content today

- 4 articles:
  - `404-not-found`
  - `basketball-replay-center`
  - `non-euclidean-hyperbolic-workspace`
  - `velocity-responsive-design`

These are public only when experiment `status` and `listing` allow it.

### Internal authored content today

Each of those 4 article-bearing experiments also has a full content constellation:

- `docs/lab-note.md`
- `docs/architecture.md`
- `docs/snippet.md`
- `docs/social.md`
- `docs/changelog.md`

This is already a meaningful internal authoring system and should not be ignored during migration.

## Current strengths

- The content constellation idea is good and already operational.
- Article demos being near experiment code is often beneficial.
- Registry docs are already on a stronger content plane.
- Public article count is still low enough that migration is tractable.

## Current weaknesses

- article presence is a filesystem fact rediscovered multiple times
- article page runtime is duplicated across 4 bespoke route files
- article frontmatter lacks a strong shared schema
- article MDX and registry MDX have different component/runtime assumptions
- articles are not on the same search/docs plane as the registry
- internal authored docs are coupled to the experiment route tree

## CSS and typography migration risk

This is one of the highest visual-regression risks in the whole pass.

Articles currently render inside experiment layouts, which load `experiments.css` at `src/app/experiments/experiments.css`. That stylesheet carries:

- article typography (font sizing, line height, hyphenation, heading styles)
- code block styling (dual-theme Shiki syntax highlighting, line numbers)
- TOC heading highlight animations (`[data-highlight]` pseudo-element)
- Lenis smooth scroll rules
- view-transition utilities

If articles move under `(main)` or a new `(articles)` tree, they lose that stylesheet unless it is intentionally split or migrated.

### Required decision

Before article migration, decide:

- where article typography CSS will live
- whether `experiments.css` should be split into experiment-runtime and content-typography concerns
- whether article styles become a shared content stylesheet
- whether view-transition behavior should remain for article routes

## Migration smoke-test targets

Use these as first validation targets:

- `basketball-replay-center`
- `404-not-found`

They are the best smoke targets because they already have complete content constellations and non-trivial article behavior.

## Migration recommendation

### What should move in this clean pass

- public article MDX files should move to a Fumadocs-backed article collection, such as `content/articles/`
- public article routing should move to a shared dynamic article route
- article frontmatter and article eligibility should become part of a derived experiment/article surface manifest

### What can stay temporarily

- internal content constellation docs may remain co-located with experiments in the first clean pass if:
  - that lowers migration risk
  - scaffolding remains simpler
  - the public article migration is already enough work

This is the preferred compromise for the first pass.

### What must be preserved

- interactive article demos
- article metadata and structured data
- feed generation
- article markdown export behavior
- content-writing workflows and scaffolding ergonomics

## Realistic migration scope

### In-scope for the clean pass

- move public article source to one coherent content collection
- replace bespoke article route pages with one shared article runtime
- keep or standardize a per-article demo registration convention
- update article discovery, feeds, and markdown exports accordingly

### Out-of-scope for the first step

- moving every internal constellation doc into a new global content tree immediately
- redesigning the content model for all possible future writing/system content at once

## Decision

The clean pass should treat **public articles** as the main content-unification target and **internal constellation docs** as a staged follow-up decision.
