---
name: P3 Content SEO
overview: "Comprehensive SEO and AI discoverability overhaul: schema-dts typed JSON-LD (WebSite, TechArticle, BreadcrumbList, SoftwareApplication on all 18 experiments), canonical URLs, llms.txt + llms-full.txt, robots.txt AI crawler update, sitemap fix, RSS feed improvements, OG image upgrades, and JSON-LD XSS hardening. TOC deferred."
todos:
  - id: deps
    content: Install schema-dts (types-only, 0kb runtime). Expand src/lib/constants.ts with SITE_TITLE, SITE_DESCRIPTION, AUTHOR_NAME, GITHUB_URL, TWITTER_URL
    status: completed
  - id: structured-data-utils
    content: "Create src/lib/structured-data.ts with schema-dts typed generators: generateWebSiteJsonLd(), generateArticleJsonLd(), generateBreadcrumbJsonLd(), generateExperimentJsonLd(), plus safeJsonLdStringify()"
    status: completed
  - id: website-schema
    content: Add WebSite + Person JSON-LD @graph to root layout (src/app/(main)/layout.tsx), replacing raw JSON.stringify
    status: completed
  - id: experiment-jsonld
    content: Create ExperimentJsonLd server component, add to all 18 experiment layouts (SoftwareApplication + BreadcrumbList), refactor mountain-transition to use shared component
    status: completed
  - id: article-jsonld
    content: Add TechArticle + BreadcrumbList JSON-LD + alternates.canonical to 2 article pages + Plop template
    status: completed
  - id: llms-txt
    content: Rewrite public/llms.txt (v1.1.1 spec), create scripts/generate-llms-txt.mjs for build-time llms.txt + llms-full.txt generation
    status: completed
  - id: robots-txt
    content: "Update robots.txt with missing AI crawler names: ChatGPT-User, Claude-SearchBot, Claude-User, Applebot-Extended, Bytespider"
    status: completed
  - id: sitemap
    content: Add /experiments redirect page + sitemap entry
    status: completed
  - id: rss
    content: "RSS feed: use constants, add lastBuildDate"
    status: completed
  - id: og-image
    content: "OG route: load custom font (Test Die Grotesk or Inter fallback), add description param"
    status: completed
  - id: verify
    content: Run typecheck, lint, build, validate JSON-LD output, test llms.txt accessibility
    status: completed
  - id: docs
    content: Update comprehensive review plan, STATUS.md, running-findings.md
    status: completed
isProject: false
---

# P3: Content, SEO, and AI Discoverability

Following the completed P0-P2 remediation, this plan addresses P3 from the [V2 Comprehensive Review](v2_comprehensive_review_9100ae49.plan.md) (Section 11, lines 265-273) **plus** modern AI discoverability standards (llms.txt, BreadcrumbList for AI Overviews, WebSite schema, experiment-level structured data, schema-dts type safety). The TOC (Item 3) is deferred to a dedicated effort. Content backfill (Item 7) is ongoing.

---

## Current State


| Area           | Status                                                                                 | Gap                                                                                       |
| -------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| JSON-LD        | `Person` on root layout, `SoftwareApplication` on mountain-transition only (1/18)      | No `WebSite`, `Article`, or `BreadcrumbList`. 17/18 experiments have zero structured data |
| Canonical URLs | Set on experiment layouts, missing on article pages                                    | Articles have no canonical                                                                |
| llms.txt       | Exists but stale (references "Framer Motion", no experiment/article links, not v1.1.1) | Full rewrite + llms-full.txt needed                                                       |
| robots.txt     | Allows all AI crawlers, but missing newer bot names                                    | Add ChatGPT-User, Claude-SearchBot, Claude-User, Applebot-Extended, Bytespider            |
| Sitemap        | Homepage + experiments + articles. No `/experiments` index                             | One entry missing                                                                         |
| RSS            | Working, missing `<lastBuildDate>`, hardcoded title                                    | Quick fixes                                                                               |
| OG images      | system-ui font, no description param                                                   | Custom font + description param                                                           |


---

## Prerequisite: Dependencies and Constants

### Install `schema-dts`

Google-maintained TypeScript types for Schema.org vocabulary. Zero runtime overhead (types only, 0kb bundle). Provides `WithContext<T>`, `Graph`, and discriminated unions for all schema.org types. 100K+ weekly npm downloads.

```bash
npm install schema-dts
```

### Expand `[src/lib/constants.ts](src/lib/constants.ts)`

Currently exports only `SITE_URL`. Multiple files hardcode the site title and author inconsistently (RSS feed: "Razi's Experiments Lab", root layout metadata: "Razi's Experiments", JSON-LD: "Razi Syed").

```typescript
export const SITE_URL = "https://www.razisyed.cv";
export const SITE_TITLE = "Razi's Experiments Lab";
export const SITE_DESCRIPTION =
  "Creative coding experiments — shaders, 3D, animation, and interaction design.";
export const AUTHOR_NAME = "Razi Syed";
export const GITHUB_URL = "https://github.com/raztronaut";
export const TWITTER_URL = "https://twitter.com/razisyed";
```

Consumed by: RSS feed, JSON-LD schemas, OG route, llms.txt generator.

---

## Item 1: Structured Data Utility Layer

Create `[src/lib/structured-data.ts](src/lib/structured-data.ts)` with `schema-dts` typed generators and a safe serializer.

### 1A. `safeJsonLdStringify(data)`

Wraps `JSON.stringify()` with XSS prevention -- replaces `<` with `\u003c` to prevent script injection via `dangerouslySetInnerHTML`. The existing mountain-transition layout and root layout both use raw `JSON.stringify()` which is a latent XSS vector. All JSON-LD rendering in the project will use this.

### 1B. `generateWebSiteJsonLd(): WithContext<WebSite>`

`WebSite` schema for the root layout. Fields: `name`, `url`, `description`, `author` (linked Person via `@id`).

Rendered in `[src/app/(main)/layout.tsx](src/app/(main)`/layout.tsx) as a `@graph` array combining `Person` + `WebSite` (replacing the current standalone `Person` script).

### 1C. `generateArticleJsonLd(params): WithContext<TechArticle>`

`TechArticle` schema for article pages. Fields:

- `headline`, `description`, `datePublished`, `dateModified`
- `author` / `publisher` (Person, linked to SITE_URL)
- `image` (OG image URL), `url` (canonical URL)
- `keywords` (from experiment tags), `mainEntityOfPage` (canonical URL)

### 1D. `generateBreadcrumbJsonLd(items): WithContext<BreadcrumbList>`

`BreadcrumbList` schema. In 2026, this is the structural blueprint for AI Overviews (Google removed visible breadcrumbs from mobile results, making the JSON-LD more important).

Used on both article pages (Home > Experiment > Article) and experiment pages (Home > Experiment).

### 1E. `generateExperimentJsonLd(params): WithContext<SoftwareApplication>`

`SoftwareApplication` schema for experiment pages. Fields:

- `name`, `description`, `applicationCategory: "MultimediaApplication"`
- `operatingSystem: "Any"`, `offers` (free)
- `author` (Person), `url`, `keywords`

Matches the pattern already on mountain-transition, but generalized and type-safe.

**Files to create/edit:**

- Create `[src/lib/structured-data.ts](src/lib/structured-data.ts)`
- `[src/app/(main)/layout.tsx](src/app/(main)`/layout.tsx) -- replace raw `Person` script with `@graph` (Person + WebSite), use `safeJsonLdStringify()`
- Refactor `[src/app/experiments/(mountain-transition)/layout.tsx](src/app/experiments/(mountain-transition)`/layout.tsx) -- migrate from inline JSON-LD to shared `generateExperimentJsonLd()`

---

## Item 2: Experiment-Level JSON-LD (All 18 Layouts)

**Gap:** 17/18 experiment layouts have zero structured data.

**Approach:** Create a shared `ExperimentJsonLd` server component that takes `title`, `description`, `slug`, and `tags` props and renders `SoftwareApplication` + `BreadcrumbList` `<script>` tags. Add one import + one JSX line to each layout.

The layouts are extremely uniform (all follow the same `<html><body>` pattern), making this a mechanical, low-risk change.

```tsx
// src/components/seo/ExperimentJsonLd.tsx
import { generateBreadcrumbJsonLd, generateExperimentJsonLd, safeJsonLdStringify } from "@/lib/structured-data";

interface Props {
  title: string;
  description: string;
  slug: string;
  tags?: string[];
}

export function ExperimentJsonLd({ title, description, slug, tags }: Props) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(generateExperimentJsonLd({ title, description, slug, tags })),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(generateBreadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: title, url: `${SITE_URL}/experiments/${slug}` },
          ])),
        }}
        type="application/ld+json"
      />
    </>
  );
}
```

**For the 3 layouts that import experiment.json** (send-button, basketball-replay-center, keyboard-keys): pass `experiment.title`, `experiment.description`, `experiment.slug`, `experiment.tags`.

**For the 15 hardcoded layouts:** pass the hardcoded title/description strings and slug. The metadata is already there; we just need to also pass it to the component.

**Files to create/edit:**

- Create `[src/components/seo/ExperimentJsonLd.tsx](src/components/seo/ExperimentJsonLd.tsx)`
- Edit all 18 experiment `layout.tsx` files (1 import + 1 JSX line each)
- Refactor mountain-transition to use the shared component (removing its inline JSON-LD)

---

## Item 3: Article JSON-LD + Canonical URLs

For each article `page.tsx` (server component):

1. **Add `alternates.canonical`** to the `metadata` export:

```typescript
   alternates: {
     canonical: `${SITE_URL}/experiments/${experiment.slug}/article`,
   },
   

```

1. **Render `TechArticle` + `BreadcrumbList` JSON-LD** via `<script>` tags in the component JSX (not in ArticleLayout -- it's a client component).

**Files to edit:**

- `[src/app/experiments/(send-button)/send-button/article/page.tsx](src/app/experiments/(send-button)`/send-button/article/page.tsx)
- `[src/app/experiments/(basketball-replay-center)/basketball-replay-center/article/page.tsx](src/app/experiments/(basketball-replay-center)`/basketball-replay-center/article/page.tsx)
- `[plop-templates/article/page.tsx.hbs](plop-templates/article/page.tsx.hbs)`

---

## Item 4: llms.txt + llms-full.txt

### 4A. Rewrite `public/llms.txt`

Current file is stale (references "Framer Motion", no experiment/article links, doesn't follow v1.1.1 spec). Rewrite to v1.1.1 with proper sections: title, blockquote summary, Articles, Experiments (all 18 with one-line descriptions), Technical Details, Contact.

### 4B. Build-time `llms-full.txt` generator

Create `scripts/generate-llms-txt.mjs` that reads all `experiment.json` files and article frontmatter to generate both `public/llms.txt` and `public/llms-full.txt`. The full version includes complete experiment descriptions, tech stacks, complexity ratings, and article summaries.

Add to `npm run build` chain (same pattern as existing `generate:registry` and `generate:posters`).

**Files to create/edit:**

- Create `[scripts/generate-llms-txt.mjs](scripts/generate-llms-txt.mjs)`
- Delete hand-maintained `[public/llms.txt](public/llms.txt)` (now generated)
- Update `package.json` build script to include the generator

---

## Item 5: robots.txt Update

The current `[src/app/robots.ts](src/app/robots.ts)` explicitly allows AI crawlers but is missing several newer bot names from 2025-2026. The `*` wildcard covers them functionally, but explicit entries are best practice for signaling intent to AI companies that monitor robots.txt compliance.

**Add:**

- `ChatGPT-User` (OpenAI real-time browsing -- drives referral traffic via citations)
- `Claude-SearchBot` (Anthropic search -- citations with links)
- `Claude-User` (Anthropic real-time browsing)
- `Applebot-Extended` (Apple AI/Siri training)
- `Bytespider` (ByteDance/TikTok)

All with `allow: "/"` (public creative lab -- maximum visibility is the goal).

---

## Item 6: Sitemap -- `/experiments` Index

No `src/app/experiments/page.tsx` exists. `/experiments` returns 404.

**Approach:** Add a minimal `src/app/experiments/page.tsx` with `redirect("/")`. Add `/experiments` to the sitemap with priority 0.9.

---

## Item 7: RSS Feed Fixes

Two changes to `[src/app/feed.xml/route.ts](src/app/feed.xml/route.ts)`:

1. Import and use `SITE_TITLE`, `SITE_DESCRIPTION` from constants
2. Add `<lastBuildDate>` using the most recent article's `publishedAt`

---

## Item 8: OG Image Improvements

Rework `[src/app/api/og/route.tsx](src/app/api/og/route.tsx)`:

1. **Custom font**: Load Test Die Grotesk (`public/fonts/Test Die Grotesk/test-die-grotesk-vf-roman.woff2`) via `fetch()` + `ArrayBuffer` in edge runtime. If Satori can't handle the variable font, fall back to Inter from Google Fonts CDN.
2. **Description parameter**: New optional `description` query param. Renders below the title in 18px muted text, truncated to ~120 chars.

---

## Verification

After all changes:

- `npm run typecheck` -- clean (schema-dts types validate all JSON-LD objects)
- `npm run lint` -- 0 errors
- `npm run build` -- success, all routes present, llms.txt + llms-full.txt generated
- Curl `/llms.txt` and `/llms-full.txt` -- valid markdown, correct content, all 18 experiments listed
- View page source of any experiment -- `SoftwareApplication` + `BreadcrumbList` script tags
- View page source of article pages -- `TechArticle` + `BreadcrumbList` script tags
- View page source of homepage -- `Person` + `WebSite` in `@graph` array
- Visit `/api/og?title=Test&description=A+test+description&tags=shader,3d` -- custom font, description visible
- Visit `/experiments` -- redirects to `/`
- Optional: validate JSON-LD at [https://validator.schema.org/](https://validator.schema.org/)

---

## Documentation Updates

- Mark P3 items as DONE in `[v2_comprehensive_review_9100ae49.plan.md](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)`
- Add P3 section to `[.agent/STATUS.md](.agent/STATUS.md)`
- Add P3 verification results to `[.agent/running-findings.md](.agent/running-findings.md)`

---

## What's NOT in Scope


| Item                              | Reason                                                                |
| --------------------------------- | --------------------------------------------------------------------- |
| TOC in ArticleLayout              | Deferred -- dedicated effort with scroll-spy + responsive design      |
| Content backfill (16 experiments) | Ongoing content creation, not infrastructure                          |
| OG image visual redesign          | User decision -- keep current dark theme, only add font + description |


