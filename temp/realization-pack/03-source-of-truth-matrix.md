# Source of Truth Matrix

This matrix documents where critical product facts are authored, where they are derived or re-materialized, where logic is duplicated, which surfaces consume them, and what the current risk is.

## Core matrix

| Domain fact | Authored source | Derived / re-materialized in | Duplicated logic today | Primary consumers | Risk notes |
|---|---|---|---|---|---|
| `status` (`wip` / `shipped`) | `src/app/experiments/(slug)/experiment.json` | `src/lib/experiments.ts`, `src/lib/articles.ts`, `scripts/validate-experiments.mjs`, `scripts/generate-posters.mjs`, `scripts/generate-registry-json.mjs`, `scripts/generate-llms-txt.mjs`, `/dev` page | Yes | Homepage, `/dev`, registry generation, llms generation, posters, feeds, sitemap | Canonical authoring is good; duplication is the problem. |
| `listing` (`public` / `dev` / `registry`) | `src/app/experiments/(slug)/experiment.json` | `src/lib/experiments.ts`, `src/lib/articles.ts`, `scripts/validate-experiments.mjs`, `scripts/generate-posters.mjs`, `scripts/generate-registry-json.mjs`, `scripts/generate-llms-txt.mjs`, `/dev` page | Yes | Homepage, `/dev`, registry, llms, posters, feeds, sitemap | Keep the model; centralize the interpretation. |
| `legacy` | `src/app/experiments/(slug)/experiment.json` | `/dev` page, AGENTS policy, backlog/plans | Partially | Agents, humans, `/dev` dashboard | Governance flag, not runtime logic. |
| Article presence | Filesystem presence of `src/app/experiments/(slug)/slug/article/content.mdx` | `src/lib/articles.ts`, `/dev` page, experiment layouts via `existsSync`, `scripts/generate-llms-txt.mjs` | Yes | Experiment nav, homepage writing section, feeds, llms, `/dev` | Strong candidate for a shared derived fact. |
| Article frontmatter | YAML frontmatter in `article/content.mdx` | `src/lib/articles.ts`, `getArticleContent()`, article page metadata, feeds, `scripts/generate-llms-txt.mjs` | Yes | Article pages, feeds, llms exports | Weak schema governance today. |
| Registry `featured` items | `registry.config.json` `featured` array | `scripts/generate-registry-json.mjs` writes `meta.featured`; `post-process-registry.mjs` sorts by it | Yes | Registry docs/grid/index generation | Currently not consistently published to all downstream contracts. |
| Registry `hidden` items | `registry.config.json` `hidden` array | `scripts/generate-registry-json.mjs` curation pass | Mostly centralized | Registry manifest, public registry artifacts | Reasonably centralized already. |
| Registry per-item description/category overrides | `registry.config.json` `overrides` | `scripts/generate-registry-json.mjs` curation pass | Mostly centralized | Registry manifest, docs pages, registry JSON | Good shape; keep registry-scoped. |
| Experiment metadata for SEO/OG/JSON-LD | `experiment.json` plus site constants | Per-experiment `layout.tsx`, `ExperimentJsonLd`, `src/lib/structured-data.ts`, `/api/og` route | Yes | Experiment pages, homepage JSON-LD, article pages, OG images | Site-global and experiment-local concerns are mixed correctly, but layout duplication has drifted. |
| Article SEO metadata | `experiment.json` + article frontmatter + article route page boilerplate | 4 bespoke article page files | Yes | Article pages, crawlers, social previews | Best fixed by a shared article runtime. |
| Install URL contract | `next.config.ts` rewrite `/r/:slug -> /registry/:slug.json` | Registry JSON build output in `public/registry/*.json` | Low duplication | `npx shadcn add`, external adopters, docs | Public API contract. |
| Feed eligibility | `status` + `listing` + article presence | `src/lib/articles.ts`, `feed.xml`, `feed.json`, `atom.xml` | Yes | RSS, Atom, JSON Feed | Feed logic is only as sound as `getArticles()`. |
| Sitemap eligibility | `getExperiments()` + `getArticles()` | `src/app/sitemap.ts` | Indirect duplication | `/sitemap.xml` | Depends on both experiment and article discovery remaining aligned. |
| Global `llms` eligibility | `status` + `listing` + article presence | `scripts/generate-llms-txt.mjs` | Yes | `public/llms.txt`, `public/llms-full.txt` | Strong candidate for a shared derived surface manifest. |
| Registry markdown / docs eligibility | Registry manifest + `content/registry` + Fumadocs source | `generate-registry-mdx.mjs`, `registrySource`, registry markdown routes | Yes, mostly inside registry subsystem | `/registry/docs`, `/registry/llms.txt`, `/registry/llms-full.txt`, registry search | Already more coherent than articles, but build contract is still fragmented. |
| `/dev` surface matrix | `experiment.json` + article presence + current helper logic | `src/app/(main)/dev/page.tsx` + `_components/types.ts` | Yes | Dev dashboard | Truth surface currently recomputes truth instead of consuming a shared derivation. |

## What is already strong

- `experiment.json` is a good native source model for experiments.
- `registry.config.json` is a good native source model for registry curation.
- The `status × listing` truth table is already expressive and should remain canonical.
- Fumadocs already acts as a strong derived docs/search layer for registry content.

## Where derivation should be introduced

These facts should become shared derived records instead of continuing to be rediscovered ad hoc:

- article presence
- article public eligibility
- experiment public/backstage surface eligibility
- feed/sitemap/llms inclusion
- `/dev` visibility matrix rows for experiments and articles

## What should not be forced into one source model

These should stay as domain-native authored models and only be joined later if needed:

- `experiment.json`
- article MDX/frontmatter
- collected `meta.json`
- collected `library.json`
- registry curation config

## Recommended direction

- Keep native authored models where they are.
- Add a derived experiment/article surface manifest that joins:
  - `experiment.json`
  - article presence
  - article frontmatter
  - `status × listing` policy outcomes
- Do not build a universal authored model that flattens experiments, writing, registry items, collected components, hooks, notes, and utilities into one type.
