---
name: Homepage Writing Section
overview: Add the missing "Writing" section to the homepage, fix article infrastructure code quality issues (unnecessary client directive, duplicated utility, date bug), and update STATUS.md.
todos:
  - id: enrich-article-data
    content: Add readingMinutes to Article interface; in getArticles() destructure content alongside data and call readingTime() (already imported, one-line change)
    status: completed
  - id: extract-adjacent-articles
    content: Move duplicated getAdjacentArticles() to src/lib/articles.ts as shared cache()-wrapped export; update both article pages and plop template to import it
    status: completed
  - id: fix-article-layout-client
    content: Remove 'use client' from ArticleLayout.tsx; fix formatDate() to use timeZone:'UTC' to prevent off-by-one day bug when rendered on server
    status: completed
  - id: writing-section
    content: Create WritingSection server component with horizontal 2-card layout, WithHover, analytics, id='writing' anchor; add to homepage above ExperimentDrawerList
    status: completed
  - id: update-agent-docs
    content: Update STATUS.md to mark Writing section complete; clean stale ExperimentArticleButton refs in toolkit.md
    status: completed
isProject: false
---

# Homepage Writing Section + Article System Finish

## Current State

The article infrastructure is **mature and complete** -- built across 6+ plans (P2 Publishing, V2 Quality Gap, Article Platform Upgrade, Content Pipeline Audit, Phase 10, P3 SEO). The missing piece is the homepage "Writing" section, plus a few code-quality issues accumulated over the incremental build process.

**What exists and works:**

- MDX pipeline: `next-mdx-remote`, `rehype-pretty-code`, `shiki`, `gray-matter`, `reading-time-estimator`
- 7 MDX components in `[src/components/mdx/](src/components/mdx/)`: CodeBlock, Callout, LiveDemo, SandpackDemo, InteractiveWidget, CodeStep, TableOfContents
- `[src/components/ui/ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx)` -- Sylph-style single-column layout with breadcrumbs, prev/next nav
- `[src/lib/articles.ts](src/lib/articles.ts)` -- `getArticles()` and `getArticleContent()`, both `cache()`-wrapped
- Article scaffolding (`npm run new:article`) and deletion (`npm run delete:article`)
- Content validation in `[scripts/validate-experiments.mjs](scripts/validate-experiments.mjs)` cross-checks flags vs files
- Article discovery: FileText icon badge on grid/list cards, "Read Article" in preview drawer
- SEO: JSON-LD (TechArticle + BreadcrumbList), canonical URLs, sitemap entries, RSS feed, OG images
- 2 published articles: **send-button** and **basketball-replay-center**
- Writing voice guide at `[.agent/contexts/writing-voice.md](.agent/contexts/writing-voice.md)`

**What is missing or broken:**

1. **No "Writing" section on homepage** -- the only content section is `ExperimentDrawerList`
2. **ArticleLayout is `"use client"` unnecessarily** -- zero client-side interactivity (no state, no effects, no event handlers), forces entire article subtree into client JS bundle
3. `**formatDate()` timezone bug (latent)** -- uses `new Date(iso).toLocaleDateString()` without explicit timezone; currently masked by `"use client"` running in browser, but will produce off-by-one dates on server (e.g. "2024-12-15" midnight UTC renders as Dec 14 in US server regions)
4. `**getAdjacentArticles()` duplicated** -- copy-pasted identically into every article `page.tsx` and the plop template
5. `**getArticles()` doesn't return `readingMinutes`** -- the raw content is already read (for frontmatter), but only `{ data }` is destructured; `readingTime()` is imported but unused in this function
6. **Stale `ExperimentArticleButton` references** in `.agent/contexts/toolkit.md` (dead code already deleted, refs linger)

**Explicitly deferred (out of scope):**

- **TableOfContents re-enablement** -- built and functional but commented out. With only 2 short articles (59 and 144 lines), TOC adds no value. Re-enabling requires a layout restructure (single-column to two-column grid + responsive collapse). Defer until articles are longer/more numerous.
- **Dedicated `/writing` index page** -- unnecessary with 2 articles; the homepage section is sufficient. Revisit when article count exceeds ~6.
- **Content generation for remaining 16 experiments** -- content work, not engineering work.

---

## Implementation Plan

### 1. Enrich `getArticles()` with reading time

`[src/lib/articles.ts](src/lib/articles.ts)` line 52: change `const { data } = matter(raw)` to `const { data, content } = matter(raw)` and add `readingMinutes: readingTime(content).minutes` to the pushed article object. The `readingTime` import already exists on line 5. Add `readingMinutes` to the `Article` interface.

This is a one-line destructure change + one field addition. Cost: `readingTime()` is just word-counting -- essentially free. Runs only at build/ISR (every 3600s), not per-visitor.

### 2. Extract `getAdjacentArticles()` to shared utility

The function is identically copy-pasted in both article `page.tsx` files and the plop template:

```tsx
async function getAdjacentArticles() {
  const articles = await getArticles();
  const idx = articles.findIndex((a) => a.experimentSlug === experiment.slug);
  return { prev: idx > 0 ? articles[idx - 1] : undefined, next: idx < articles.length - 1 ? articles[idx + 1] : undefined };
}
```

Add to `[src/lib/articles.ts](src/lib/articles.ts)`:

```tsx
export const getAdjacentArticles = cache(async (experimentSlug: string) => {
  const articles = await getArticles();
  const idx = articles.findIndex((a) => a.experimentSlug === experimentSlug);
  return {
    prev: idx > 0 ? articles[idx - 1] : undefined,
    next: idx < articles.length - 1 ? articles[idx + 1] : undefined,
  };
});
```

Update consumers:

- `[src/app/experiments/(send-button)/send-button/article/page.tsx](src/app/experiments/(send-button)`/send-button/article/page.tsx) -- delete local function, import from `@/lib/articles`, call with `experiment.slug`
- `[src/app/experiments/(basketball-replay-center)/basketball-replay-center/article/page.tsx](src/app/experiments/(basketball-replay-center)`/basketball-replay-center/article/page.tsx) -- same
- `[plop-templates/article/page.tsx.hbs](plop-templates/article/page.tsx.hbs)` -- same

### 3. Fix ArticleLayout: remove `"use client"` + fix date timezone bug

`[src/components/ui/ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx)` is marked `"use client"` but contains zero hooks, state, effects, or event handlers. It's pure JSX with `Link` and lucide-react SVG icons (both server-safe). Removing the directive:

- Eliminates the component from the client JS bundle
- Lets article content stream as server-rendered HTML

**Critical fix required alongside this change:** The `formatDate()` helper uses `new Date(iso).toLocaleDateString("en-US", ...)` without a timezone. When this runs client-side (current), the browser uses the user's timezone. When moved server-side, Vercel's runtime uses the region's timezone. For dates stored as `"2024-12-15"` (parsed as midnight UTC), a server in UTC-8 would render "December 14, 2024" -- off by one day.

Fix:

```tsx
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
```

### 4. Create the "Writing" homepage section

Create `src/components/ui/WritingSection.tsx` as a **Server Component**:

- Accepts `articles: Article[]` prop
- Returns `null` when array is empty (section disappears gracefully)
- Section element with `id="writing"` for deep-linking (`/#writing`)
- Heading "Writing" using `replica` font class (matching homepage h1 style)
- **Horizontal card layout** -- 2 cards side-by-side on md+ (`grid grid-cols-1 md:grid-cols-2 gap-4`). With only 2 articles this looks intentional, not sparse. Scales naturally to 4+ articles in a grid.
- Each card shows: title, experiment name as subtitle, published date (`font-mono`), reading time, description (line-clamped)
- Card links to `article.href`
- `WithHover` integration for custom cursor interaction
- `data-umami-event="article_click"` analytics attribute
- RSS feed link subtly placed near the heading (small icon/text)
- Visual language: border, rounded-lg, hover:border-foreground/20 (matching experiment card hover pattern)

**Placement in homepage** (`[src/app/(main)/page.tsx](src/app/(main)`/page.tsx)):

```tsx
import { getArticles } from "@/lib/articles";
import { WritingSection } from "@/components/ui/WritingSection";

export default async function Home() {
  const experiments = await getExperiments();
  const articles = await getArticles();
  // ...
  <WritingSection articles={articles} />
  <ExperimentDrawerList experiments={experiments} />
}
```

Writing above experiments -- higher-signal content first. Both `getArticles()` and `getExperiments()` scan `src/app/experiments/` but are independent `cache()`-wrapped functions; React deduplicates within the request, and ISR (revalidate=3600) means this runs once per hour, not per visitor.

### 5. Update agent docs

- `[.agent/STATUS.md](.agent/STATUS.md)` -- mark "Article-aware homepage section" as complete
- `[.agent/contexts/toolkit.md](.agent/contexts/toolkit.md)` -- remove stale `ExperimentArticleButton` references

---

## Risks and Mitigations


| Risk                                                   | Severity   | Mitigation                                                               |
| ------------------------------------------------------ | ---------- | ------------------------------------------------------------------------ |
| `formatDate()` off-by-one when removing `"use client"` | High       | Add `timeZone: "UTC"` explicitly (step 3)                                |
| `lucide-react` icons in server component               | Low        | ChevronLeft/ChevronRight are pure SVG, no hooks -- verified compatible   |
| Writing section looks sparse with 2 articles           | Medium     | Horizontal 2-column grid looks intentional at 2 items vs a vertical list |
| Sequential filesystem I/O in `getArticles()`           | None (now) | Runs at build/ISR only; revisit if article count exceeds ~50             |


## Files to Create/Modify

- **Create**: `src/components/ui/WritingSection.tsx`
- **Modify**: `[src/app/(main)/page.tsx](src/app/(main)`/page.tsx) -- add `getArticles()` + `<WritingSection />`
- **Modify**: `[src/lib/articles.ts](src/lib/articles.ts)` -- add `readingMinutes` to Article, extract `getAdjacentArticles()`
- **Modify**: `[src/components/ui/ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx)` -- remove `"use client"`, fix `formatDate()` timezone
- **Modify**: `[src/app/experiments/(send-button)/send-button/article/page.tsx](src/app/experiments/(send-button)`/send-button/article/page.tsx) -- use shared `getAdjacentArticles()`
- **Modify**: `[src/app/experiments/(basketball-replay-center)/basketball-replay-center/article/page.tsx](src/app/experiments/(basketball-replay-center)`/basketball-replay-center/article/page.tsx) -- use shared `getAdjacentArticles()`
- **Modify**: `[plop-templates/article/page.tsx.hbs](plop-templates/article/page.tsx.hbs)` -- use shared `getAdjacentArticles()`
- **Modify**: `[.agent/STATUS.md](.agent/STATUS.md)` -- update completion status
- **Modify**: `[.agent/contexts/toolkit.md](.agent/contexts/toolkit.md)` -- remove dead refs

