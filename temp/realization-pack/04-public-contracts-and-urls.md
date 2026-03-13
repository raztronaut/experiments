# Public Contracts and URLs

This document records the public-facing routes, APIs, rewrites, redirects, metadata surfaces, and install contracts that must be treated as migration-sensitive.

## Highest-risk public contracts

These are the contracts most likely to break external consumers or search/discovery if changed casually:

1. **Install contract**: `/r/:slug`
2. **Experiment canonical URLs**: `/experiments/:slug`
3. **Article URLs**: `/experiments/:slug/article`
4. **Registry docs URLs**: `/registry/docs/...`
5. **Feed URLs**: `/feed.xml`, `/feed.json`, `/atom.xml`
6. **Machine-readable markdown URLs**: `/experiments/:slug.mdx`, `/experiments/:slug/article.mdx`, `/registry/llms.txt`, `/registry/llms-full.txt`, `/registry/llms.mdx/...`
7. **Search API**: `/api/registry-search`
8. **OG routes**: `/api/og`, `/registry/:slug/opengraph-image`
9. **Crawler/SEO surfaces**: `/sitemap.xml`, `/robots.txt`

## URL and API contract inventory

| Contract | Defined by | Current behavior | External dependency risk | Migration note |
|---|---|---|---|---|
| `/` | `(main)` homepage route | Main public landing page | High | Public shell may change IA, but `/` remains the root identity surface. |
| `/dev` | `(main)/dev/page.tsx` + `showDevContent` gate | Dev/preview-only dashboard, 404 in production | Low public risk, high internal workflow risk | Can move or redesign, but preview-only behavior is important. |
| `/experiments` | `next.config.ts` redirect | Permanently redirects to `/` | Medium | Already a public redirect contract. |
| `/experiments/:slug` | Experiment route groups | Canonical experiment runtime pages | High | Must remain stable or be redirected. |
| `/experiments/:slug/article` | Per-experiment article pages | Current canonical article pages | High | If articles move, add permanent redirects and update feeds/metadata. |
| `/experiments/:slug.mdx` | markdown export route + rewrite | Experiment markdown summary endpoint | Medium | Preserve or redirect. |
| `/experiments/:slug/article.mdx` | rewrite to markdown export route | Article markdown endpoint | Medium | Preserve or redirect. |
| `/registry` | `(registry)/registry/page.tsx` | Redirects to `/registry/docs` | Medium | Could change later if grid/index becomes first-class again. |
| `/registry/docs` | Fumadocs registry docs | Canonical browsable registry documentation | High | Serious backstage public surface. |
| `/registry/docs/:category/:slug` | Fumadocs source tree + generated MDX | Canonical docs pages per registry item | High | Preserve or redirect. |
| `/r/:slug` | `next.config.ts` rewrite | Public install URL -> `/registry/:slug.json` | Very high | Must stay stable. |
| `/registry/:slug.json` | Generated artifact in `public/registry` | Install payload for shadcn CLI | High | Directly consumed by automation and installs. |
| `/registry/llms.txt` | Registry Fumadocs `llms` route | Registry docs index as markdown/text | Medium | Preserve if registry docs/search stay on Fumadocs. |
| `/registry/llms-full.txt` | Registry full export route | Full registry docs text export | Medium | Preserve or provide equivalent. |
| `/registry/llms.mdx/:slugPath` | Registry markdown route | Per-page registry markdown output | Medium | Machine-readable contract. |
| `/api/registry-search` | Fumadocs search server route | Registry docs search index API | Medium | Public JS clients depend on it. |
| `/api/experiments` | JSON API from `getExperiments()` | Public experiment listing API | Medium | Not loudly documented, but public once exposed. |
| `/api/og` | Dynamic OG route | Experiment/article OG image generator | Medium | Social/SEO surface. |
| `/registry/:slug/opengraph-image` | Registry item OG route | Registry-specific OG image generator | Low-to-medium | Preserve if registry docs remain public/backstage. |
| `/feed.xml` | RSS route | RSS 2.0 feed | High | Feed readers and discovery depend on this path. |
| `/feed.json` | JSON Feed route | JSON Feed v1.1 | Medium | Explicit public surface. |
| `/atom.xml` | Atom route | Atom feed | Medium | Explicit public surface. |
| `/sitemap.xml` | Metadata route | Sitemap generated from experiments + articles + feed URLs | High | Must reflect canonical URLs. |
| `/robots.txt` | Metadata route | Robots policy + sitemap URL | High | Crawler/SEO-sensitive. |
| `/u/:path*` | `next.config.ts` rewrite | Umami analytics proxy | Low user-facing, medium operational risk | Internal analytics contract. |
| `/collected/:slug` | Collected preview route group | Isolated preview routes for ported components | Medium | Useful backstage/runtime surface; preserve if registry previews depend on it. |
| `/mdx-preview/:slug` | MDX preview route group | Preview/debug surface | Low public, medium internal risk | Docs/tooling may depend on it. |

## Metadata and structured-data contracts

| Surface | Current source(s) | Current contract |
|---|---|---|
| Site-level WebSite/ProfilePage/Person JSON-LD | `src/lib/structured-data.ts` + `src/lib/constants.ts` + `(main)/layout.tsx` | Homepage identity surface |
| Experiment CreativeWork JSON-LD | `ExperimentJsonLd.tsx` + `structured-data.ts` + `experiment.json` | Each experiment page emits CreativeWork + breadcrumb |
| Article TechArticle JSON-LD | Per-article `page.tsx` + `structured-data.ts` + `experiment.json` + article frontmatter | Each article page emits TechArticle + breadcrumb |
| Homepage ItemList JSON-LD | `(main)/page.tsx` + `generateExperimentListJsonLd()` | Search-visible list of experiments |
| OG image semantics for experiments/articles | `/api/og` + query params | Title/description/tags social card surface |
| OG image semantics for registry docs | `/registry/:slug/opengraph-image` + generated registry JSON | Registry-specific social card surface |

## Routing behaviors that must be preserved deliberately

- `/experiments` currently redirects to `/`.
- `/r/:slug` currently rewrites to `/registry/:slug.json`.
- `/experiments/:slug.mdx` and `/experiments/:slug/article.mdx` currently rewrite into the markdown export route.
- Registry root currently redirects to `/registry/docs`.
- `Accept: text/markdown` behavior is implemented via proxy rewriting for article and registry-docs routes and should be treated as part of the machine-readable surface behavior.

## Route-behavior contracts outside normal routes

### `src/proxy.ts`

This repo uses `src/proxy.ts` instead of the more common but deprecated `middleware.ts`.

Current responsibilities:

- canonical host redirect to `www.razisyed.cv`
- trailing-slash removal
- `Accept: text/markdown` content negotiation for article and registry-docs requests

This file is path-sensitive and explicitly references `/experiments/` and `/registry/`. Any route migration must update proxy behavior in the same pass.

## `next.config.ts` path-dependent contracts

- `outputFileTracingIncludes` explicitly includes `src/app/experiments/**/*` and `public/registry/**/*`
- security and CORS headers are applied to `/experiments/:path*`
- long-lived cache headers are applied to `/experiments/:path*` media assets
- analytics proxy rewrite exists at `/u/:path*`
- article/experiment markdown rewrites are path-specific

## Migration cautions

### Article route migration

If moving from `/experiments/:slug/article` to `/articles/:slug`, preserve:

- canonical links
- feed URLs or redirect behavior
- JSON-LD `mainEntityOfPage`
- article markdown endpoint compatibility

### Registry contract migration

`/r/:slug` and `/registry/:slug.json` must remain valid even if internals change.

### Search and docs split

If registry docs/search source generation changes, `/registry/docs`, `/api/registry-search`, `/registry/llms.txt`, and `/registry/llms-full.txt` need to stay consistent.

### SEO and feed continuity

Sitemap, robots, RSS, Atom, JSON Feed, OG, and JSON-LD must be checked together after any content path migration.

## Contract-preservation defaults

- Preserve all current public paths unless there is a strong product reason to change them.
- If changing a public path, add an explicit permanent redirect and update all structured-data/feed/sitemap references in the same pass.
- Treat `/r/:slug` as immutable unless you are intentionally versioning the install contract.
