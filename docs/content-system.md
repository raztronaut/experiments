# Content System

## Overview

Shipped experiments can have a **content constellation** -- 6 content formats targeting different audiences, all living inside the experiment's route group.

## The 6 Formats

| Format | File | Audience | Description |
|--------|------|----------|-------------|
| Article | `article/content.mdx` | Public | Long-form MDX article with interactive demos |
| Lab Note | `docs/lab-note.md` | Internal | Process journal (what worked, what didn't) |
| Architecture | `docs/architecture.md` | Engineers | Component tree, data flow, dependencies |
| Snippet | `docs/snippet.md` | Developers | Install command, usage example, API reference |
| Social | `docs/social.md` | Twitter/X, Discord | Thread copy, launch post, one-liner |
| Changelog | `docs/changelog.md` | Internal | Origin, iterations, current state |

## File Structure

Content lives inside the experiment route group alongside the page:

```
src/app/experiments/(slug)/slug/
├── page.tsx              # Experiment page
├── error.tsx             # Error boundary
├── article/
│   ├── page.tsx          # Article rendering (MDXRemote, JSON-LD, metadata)
│   ├── content.mdx       # Article body (YAML frontmatter + prose)
│   └── components.tsx    # "use client" interactive demos for the article
└── docs/
    ├── lab-note.md
    ├── architecture.md
    ├── snippet.md
    ├── social.md
    └── changelog.md
```

## Articles

### Scaffolding

```bash
npm run new:article              # Interactive -- prompts for experiment slug
npm run new:article:auto -- --name <slug>  # Non-interactive (AI agents)
npm run delete:article <slug>    # Removes article/ + docs/ directories
```

The scaffolder creates all 8 files (3 in `article/`, 5 in `docs/`) with template content.

### Frontmatter

Articles use YAML frontmatter parsed by `gray-matter`:

```yaml
---
title: "Velocity-Responsive Design"
description: "What if responsive design responded to how you read, not just what you read on?"
publishedAt: "2026-03-11T00:00:00.000Z"
updatedAt: "2026-03-11T00:00:00.000Z"
---
```

### Rendering

`article/page.tsx` renders the MDX using `next-mdx-remote/rsc` with shared config from `src/lib/mdx-article-config.ts`:
- **remark-gfm** for GitHub-flavored Markdown (tables, strikethrough, task lists)
- **rehype-shift-heading** (shift=1) so h1→h2, h2→h3 — ArticleLayout provides the single h1 for SEO
- **rehype-pretty-code** with Shiki for syntax highlighting
- **rehype-slug** for heading IDs (enabling deep links)

Articles with LaTeX math use `articleRemarkPluginsWithMath` and `articleRehypePluginsWithMath` (adds remark-math, rehype-katex).

The page generates JSON-LD structured data (Article + Breadcrumb schemas) for SEO and injects it via `<script type="application/ld+json">`.

### Interactive Demos

MDX articles support interactive demos, but `next-mdx-remote` does not support `import` statements in MDX. The pattern:

1. Build demos as React components in `article/components.tsx` (must be `"use client"`)
2. Import them in `article/page.tsx`
3. Pass them to `MDXRemote` via the `components` prop
4. Use them in `content.mdx` as custom JSX elements

Available demo containers:
- **`<InteractiveWidget>`** -- compound layout with `<Preview>` + `<Controls>` areas
- **`<SandpackDemo>`** -- live code editor (CodeSandbox bundler)
- **`<LiveDemo>`** -- full experiment embed via iframe

Available controls in `src/components/mdx/controls/`:
- **`<Range>`** -- styled slider with gradient fill and debounce
- **`<Checkbox>`** -- animated checkbox
- **`<Radio>`** -- animated radio group
- **`<Switch>`** -- animated toggle
- **`<ControlGroup>`** -- grid layout for controls

Content components available in MDX:
- `<BeforeAfterImage>`, `<Slideshow>`, `<Details>`, `<Pill>`, `<Fullbleed>`, `<Callout>`, `<CodeStep>`, `<CodeBlock>`

### Data Layer

`src/lib/articles.ts` provides:

| Function | Purpose |
|----------|---------|
| `getArticles()` | Scans all experiment route groups for `article/content.mdx`, parses frontmatter, enriches with experiment.json data, filters by status/listing/showDevContent, returns sorted by publishedAt |
| `getArticleContent(slug)` | Reads a specific article's MDX, returns `{ frontmatter, content, readingMinutes }` |
| `getAdjacentArticles(slug)` | Returns prev/next articles for navigation |

### Article Lenses

Articles blend three lenses in any proportion:

| Lens | Asks | Leads with |
|------|------|------------|
| Implementation | How does it work? | Code, technique layering, progressive demos |
| Concept | Why does the idea matter? | Design rationale, analogies, "what if" framing |
| Exploration | What was the journey? | Dead ends, pivots, decisions, honest uncertainty |

The `articleLenses` field in `experiment.json` records which lenses dominate. When writing with AI assistance, the agent performs a lens analysis and asks for direction before committing to a structure.

### Reference Implementations

**basketball-replay-center** and **404-not-found** have complete content constellations (all 6 formats). **velocity-responsive-design** also has a full article. Study these before writing your first article.

## RSS Feed

`/feed.xml` serves RSS 2.0 with:
- Atom self-link for feed reader compatibility
- `content:encoded` with the full article text (MDX converted to plain markdown)
- XSL stylesheet at `/feed-styles.xsl` for browser rendering
- Hourly revalidation

The feed includes articles from experiments with `status: "shipped"` and `listing: "public"`.

## Atom Feed

`/atom.xml` serves a full [Atom 1.0](https://www.ietf.org/rfc/rfc4287) feed with:
- `<content type="text">` with the full article as plain markdown
- Per-entry `<published>` and `<updated>` timestamps
- `<category term="...">` tags from the experiment's tech stack
- XSL stylesheet at `/feed-styles.xsl` for browser rendering
- Same hourly revalidation and filtering as RSS (shipped + public only)

## JSON Feed

`/feed.json` serves [JSON Feed v1.1](https://www.jsonfeed.org/version/1.1/):
- `content_text` with full article content
- `tags` from the experiment's tech stack
- Author info
- Same hourly revalidation and filtering as RSS

## llms.txt

Two files are generated by `scripts/generate-llms-txt.mjs` into `public/`:

| File | Content |
|------|---------|
| `llms.txt` | Curated summary (v1.1.1 spec): articles with markdown links, experiment list, tech stack, Content API section |
| `llms-full.txt` | Extended version with full descriptions, complexity, profile, status, created date, tech stacks, and article links per experiment |

**Filtering**: Skips `status: "wip"` and `listing: "registry"` experiments. Checks for article existence on disk.

Run `npm run generate:llms-txt` to regenerate. This runs automatically as part of `npm run build`.

## Dynamic .mdx Routes

A dynamic route at `src/app/experiments/llms.mdx/[...slug]/route.ts` serves any experiment or article as clean markdown on demand:

| URL | Content |
|-----|---------|
| `/experiments/<slug>.mdx` | Experiment metadata + source file contents + install command |
| `/experiments/<slug>/article.mdx` | Full article as markdown |

This enables LLMs to fetch structured information about any experiment via a simple HTTP request.
