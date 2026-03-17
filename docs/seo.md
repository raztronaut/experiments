# SEO and AI Visibility

Comprehensive reference for search engine and AI system visibility at the Experiments Lab. Covers metadata, structured data, feeds, llms.txt, site-config, IndieWeb, and validation.

---

## 1. Overview

| Layer | Purpose |
|-------|---------|
| **Metadata** | Page titles, descriptions, OG/Twitter cards, canonical URLs |
| **Structured data** | Schema.org JSON-LD (Person, WebSite, ItemList, TechArticle, etc.) |
| **Feeds** | RSS, Atom, JSON Feed for content discovery |
| **llms.txt** | AI Visibility v1.1.1 spec for AI/LLM systems |
| **AI Discovery Files** | ai.txt, identity.json, developer-ai.txt, etc. |
| **Site config** | Single source for SITE_URL, SITE_TITLE, AUTHOR_NAME — kept in sync via validation |

---

## 2. Surface Preview

What appears when the site is shared or indexed across Google, Twitter/X, Facebook, LinkedIn, etc.

### Homepage (`https://www.razisyed.cv/`)

| Surface | Title | Description | Image |
|---------|-------|-------------|-------|
| **Google** | Razi's Experiments Lab | SITE_DESCRIPTION (~155 chars) | — |
| **Twitter/X** | Razi's Experiments Lab | SITE_DESCRIPTION | og-image.png (1200×630) |
| **Facebook/LinkedIn** | Same via Open Graph | Same | Same |
| **Rich results** | ProfilePage + Person + WebSite + ItemList (experiments) | — | — |

### Experiment pages (e.g. `/experiments/basketball-replay-center`)

| Surface | Title | Description | Image |
|---------|-------|-------------|-------|
| **Google** | {experiment.title} \| Razi's Experiments Lab | experiment.json description | — |
| **Twitter/X** | experiment.title | experiment.description | poster.jpg or og-image.png |
| **Facebook/LinkedIn** | Same via Open Graph | Same | Same |
| **Rich results** | CreativeWork schema | — | — |

### Article pages (e.g. `/experiments/basketball-replay-center/article`)

Article pages use full site chrome: breadcrumb, article content, Related experiments (once), prev/next nav, SiteFooter, and AIWidget. Experiment pages (e.g. `/experiments/basketball-replay-center`) show only the top-left nav (Return / Go to article) and the experiment; no Related section, footer, or widget. Theming (light/dark) applies to article content and to embedded demos (LiveDemo iframes and component-preview iframes receive theme via URL and sync on load).

| Surface | Title | Description | Image |
|---------|-------|-------------|-------|
| **Google** | {title} — Article \| Razi's Experiments Lab | frontmatter.description ?? experiment.description | — |
| **Twitter/X** | {title} — Article | Same | /api/og?title=...&tags=... |
| **Facebook/LinkedIn** | Same via Open Graph | Same | Same |
| **Rich results** | TechArticle + BreadcrumbList | — | — |

### Quick reference

| URL type | Title pattern | Description source |
|----------|---------------|--------------------|
| Homepage | Razi's Experiments Lab | SITE_DESCRIPTION |
| Experiment | {title} \| Razi's Experiments Lab | experiment.json |
| Article | {title} — Article \| Razi's Experiments Lab | frontmatter.description ?? experiment.description |

---

## 3. Metadata and Layouts

### 3.1 Main Layout

**File:** `src/app/(main)/layout.tsx`

| Field | Value / Source |
|-------|----------------|
| metadataBase | `https://www.razisyed.cv` |
| title | SITE_TITLE |
| description | SITE_DESCRIPTION (~155 chars; no portfolio tech stack; focus on experiments) |
| authors, creator, publisher | AUTHOR_NAME |
| applicationName | SITE_TITLE |
| category | technology |
| canonical | `/` |
| alternates.types | feed.xml, atom.xml, feed.json |
| openGraph | title, description, url, siteName, images (og-image.png), locale |
| twitter | summary_large_image, creator @raztronaut, images |
| robots | index, follow; googleBot max-video-preview, max-image-preview, max-snippet |
| keywords | Next.js, React, Three.js, Razi Syed, Razi, raztronaut, etc. |

### 3.2 Experiment Layouts

Per-experiment metadata from `experiment.json` and `AUTHOR_NAME`, `SITE_URL` from constants. Poster or video used for OG images. Public experiments: `index: true, follow: true`; WIP/dev: noindex.

**Plop template:** `plop-templates/experiment/route-layout.tsx.hbs` — uses constants for consistency.

---

## 4. Structured Data (JSON-LD)

**File:** `src/lib/structured-data.ts`

| Schema | Location | Purpose |
|--------|----------|---------|
| **Person** | Main layout | Entity: name, givenName, familyName, alternateName (Razi, raztronaut), url, sameAs (GitHub, X), jobTitle |
| **WebSite** | Main layout | Site name, url, description, author ref |
| **ProfilePage** | Main layout | mainEntity = Person |
| **ItemList** | Experiments tab | List of experiments with names, descriptions, URLs |
| **CreativeWork** | Per-experiment layout | name, description, url, creator, isAccessibleForFree |
| **TechArticle** | Article pages | headline, description, datePublished, about (experiment URL), author, publisher, speakable (cssSelector: .p-name, .e-content) |
| **BreadcrumbList** | Various | Navigation breadcrumbs |

Speakable on TechArticle uses `cssSelector: [".p-name", ".e-content"]` for voice/answer-box optimization.

---

## 5. Sitemap

**File:** `src/app/sitemap.ts`

- **Homepage** — priority 1, changeFrequency weekly
- **Experiments** — priority 0.7, changeFrequency monthly; images (poster) and videos when present
- **Articles** — priority 0.8, changeFrequency monthly
- **Feeds** — feed.xml, atom.xml, feed.json; priority 0.3

Revalidate: 3600s. Uses `getExperiments()` and `getArticles()` from lib.

---

## 6. Robots

**File:** `src/app/robots.ts`

| Rule | Value |
|------|-------|
| Disallow | /dev, /mdx-preview, /u/, /api/experiments, /api/registry-search |
| Allow | / (for all listed user agents) |
| Sitemap | `https://www.razisyed.cv/sitemap.xml` |

**User agents:** Googlebot, bingbot, DuckDuckBot; GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider; ChatGPT-User, Claude-SearchBot, PerplexityBot, YouBot, ai-crawler; Amazonbot, Applebot, Twitterbot, Meta-ExternalAgent; fallback `*`.

`/llms.txt` is not disallowed — AI crawlers can access it.

---

## 7. Feeds

| Feed | URL | Format | XSL |
|------|-----|--------|-----|
| RSS 2.0 | /feed.xml | application/rss+xml | feed-styles.xsl |
| Atom | /atom.xml | application/atom+xml | — |
| JSON Feed | /feed.json | application/feed+json | JSON Feed 1.1 |

All three in sitemap. Autodiscovery via main layout `alternates.types`.

---

## 8. llms.txt (AI Visibility v1.1.1)

**Spec:** [ai-visibility.org.uk/specifications/llms-txt](https://www.ai-visibility.org.uk/specifications/llms-txt/)

**Generated by:** `npm run generate:llms-txt` → `public/llms.txt`, `public/llms-full.txt`

### Sections

| Section | Purpose |
|---------|---------|
| `# [Title]` | H1 — business/project name |
| `> [Summary]` | Blockquote — 1–3 sentence description |
| `## Articles` | Published article links with descriptions |
| `## Experiments` | All shipped experiments (non-registry-only) |
| `## Technical Details` | Tech stack summary |
| `## Content API` | MDX routes, Accept header, registry links |
| `## AI Discovery Files` | sitemap.xml, feed.xml, feed.json, llms.txt, registry/docs |
| `## Contact` | Email, GitHub, X (Twitter), Website |

### Spec Compliance

| Requirement | Status |
|-------------|--------|
| H1 first | ✓ |
| Blockquote after H1 | ✓ |
| Contact (real info) | ✓ Email, GitHub, X, Website |
| AI Discovery Files | ✓ |
| Recommended: What We Do Not Do | Optional — not implemented |

### Compatibility

- **llm.txt** — 301 redirect from `/llm.txt` to `/llms.txt` in `next.config.ts`
- **llms-full.txt** — Extended version with full experiment metadata, tech stacks, article links

---

## 9. AI Discovery Files

**AI Visibility tiers** ([specs](https://www.ai-visibility.org.uk/specifications/)):

| Tier | File | Status | Purpose |
|------|------|--------|---------|
| Essential | llms.txt | ✓ | Identity, experiments, contact |
| Essential | ai.txt | ✓ | AI interaction permissions |
| Recommended | identity.json | ✓ | Structured identity |
| Recommended | developer-ai.txt | ✓ | Developer-focused identity |
| Complete | llm.txt | ✓ Redirect | Compatibility variant → llms.txt |
| Complete | llms.html | — | Optional human-readable HTML |
| Complete | ai.json | — | Optional machine AI guidance |
| Complete | brand.txt | — | Optional brand naming |
| Complete | faq-ai.txt | — | Optional Q&A for AI |
| Complete | robots-ai.txt | — | Optional AI crawler directives |

**File locations:** `public/llms.txt`, `public/llms-full.txt`, `public/ai.txt`, `public/identity.json`, `public/developer-ai.txt`

---

## 10. Site Config and Constants

Two sources; overlapping keys must stay in sync.

| Source | Used by | Keys |
|--------|---------|------|
| `scripts/lib/site-config.mjs` | Build scripts (generate-llms-txt, build-registry, generate-registry-json) | SITE_URL, SITE_TITLE, AUTHOR_NAME, GITHUB_URL, TWITTER_URL |
| `src/lib/constants.ts` | App (layouts, metadata, structured data) | SITE_URL, SITE_TITLE, SITE_DESCRIPTION, AUTHOR_NAME, AUTHOR_DISPLAY, GITHUB_URL, TWITTER_URL |

**Sync keys:** SITE_URL, SITE_TITLE, AUTHOR_NAME, GITHUB_URL, TWITTER_URL.

**Validation:** `npm run validate:site-config` — runs in pre-commit. See [Scripts](scripts.md).

---

## 11. IndieWeb and Social

| Item | Location | Implementation |
|------|----------|----------------|
| h-card | ArticleLayout | `sr-only h-card p-author` with AUTHOR_DISPLAY |
| h-entry | ArticleLayout | `h-entry` on article container; `.p-name`, `.dt-published`, `.dt-updated`, `.u-url`, `.p-category` |
| h-feed | WritingSection | `h-feed` + `role="feed"` on Writing tab grid |
| webmention | Main layout | `rel="webmention"` to webmention.io |
| rel="me" | SocialPills | All three links: GitHub, X, LinkedIn use `rel="me noopener noreferrer"` |

**SocialPills file:** `src/components/ui/location/SocialPills.tsx` — GitHub, X, LinkedIn.

---

## 12. Naming Strategy

**Goal:** Visible UI uses "Razi" (mononym); schema, feeds, and machine-readable surfaces use "Razi Syed" and "raztronaut" for SEO across all variants.

| Surface | Name used |
|---------|-----------|
| constants.ts AUTHOR_NAME | Razi Syed |
| constants.ts AUTHOR_DISPLAY | Razi |
| Person schema | name: "Razi Syed", givenName: "Razi", familyName: "Syed", alternateName: ["Razi", "raztronaut"] |
| Layout metadata (authors, creator, publisher) | AUTHOR_NAME (Razi Syed) |
| ArticleLayout byline | AUTHOR_DISPLAY (Razi) |
| llms.txt, identity.json | Full name + alternateName |
| Twitter creator | @raztronaut |
| Keywords | Razi Syed, Razi, raztronaut |

---

## 13. Canonical Host and Redirects

| Redirect | Implementation |
|----------|----------------|
| Canonical host (www vs apex) | Vercel Domain redirect — no middleware |
| /experiments → / | next.config.ts redirects (permanent) |
| /llm.txt → /llms.txt | next.config.ts redirects (permanent) |

**Note:** Next.js 16 deprecates middleware for proxy; canonical host handled via Vercel config.

---

## 14. Security and Performance

### Security Headers (next.config.ts)

- X-DNS-Prefetch-Control
- Strict-Transport-Security (HSTS)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy (camera, microphone, geolocation disabled)
- Content-Security-Policy

### Accessibility

- **prefers-reduced-motion** — `src/app/(main)/globals.css` includes `@media (prefers-reduced-motion: reduce)` with animation/transition overrides (0.01ms, iteration 1)

---

## 15. Favicons and Manifest

- **manifest.ts** — References icon-192.png, icon-512.png
- **og-image.png** — 1200×630 for OG/Twitter
- **themeColor** — Light/dark via viewport in main layout

---

## 16. Article–Experiment Linking

- **articleHref** — `getExperiments()` sets `articleHref` when `content.mdx` exists
- **Related experiments** — `getRelatedSlugs(experiment)` uses `experiment.json` `related` array
- **Experiment cards** — "Read article" link when `articleHref` present
- **ArticleLayout CTA** — "Try the {experimentTitle} experiment" links to experiment page
- **RelatedExperimentsSection** — Links experiment + article; rendered in layouts that follow plop pattern
- **TechArticle.about** — Links to experiment URL for structured data

---

## 17. Related Experiments

`experiment.json` may include `related: ["slug1", "slug2"]`. Layouts using the plop pattern render `RelatedExperimentsSection` when `getRelatedSlugs(experiment)?.length > 0`. See [Experiments](experiments.md) for schema.

---

## 18. Validation

| Script | Command | Purpose |
|--------|---------|---------|
| validate-experiments | `npm run validate:experiments` | experiment.json schema, enums, slugs, related array |
| validate-site-config | `npm run validate:site-config` | site-config.mjs ↔ constants.ts sync |

Both run in lefthook pre-commit. See [Scripts](scripts.md).

---

## 19. Keyword Strategy and Flow

**Where keywords live:**

- **Main layout** (`src/app/(main)/layout.tsx`): Static `keywords` array (Next.js, React, Three.js, Shaders, Razi Syed, raztronaut, WebGL, GSAP, Design Engineering, etc.) — site-wide only.
- **Experiment pages:** No HTML meta keywords in layout by default; **JSON-LD** (CreativeWork) gets `keywords` from `experiment.tags` in `src/lib/structured-data.ts`. Optional: add `metadata.keywords` from `tags` + `tech` in plop template for parity.
- **Article pages:** **JSON-LD** (TechArticle) gets `keywords` from `params.tags` (experiment.tags). Optional: add `metadata.keywords` in article page from experiment.tags + tech.

**Data flow:** Experiment `tags` (and optionally `tech`) feed CreativeWork and TechArticle JSON-LD, and llms.txt / llms-full.txt (Experiments section and per-experiment blocks). Single source: `experiment.json`. Google largely ignores meta keywords; Bing and some AI systems may use them. Adding per-page meta keywords from tags+tech keeps surfaces consistent.

---

## 20. Experiment Metadata for SEO

**Description:**

- **Length:** 120–160 characters for experiment pages. Used in meta description, OG/Twitter, CreativeWork schema, sitemap, and llms.txt.
- **Content:** State what the experiment is and one concrete technique or outcome (e.g. "Interactive 3D CRT monitor with custom scanline shader, chromatic aberration, and mouse-follow tilt").
- **Validation:** `validate-experiments.mjs` can warn when length is outside 100–180 chars (soft band). See [Validation and audit](#26-validation-and-audit).

**Tags and tech:**

- **tags:** Topic/theme (e.g. scroll, shader, 3d, crt, interactive). Flow to JSON-LD `keywords` and llms.txt. Use consistent casing where it matters (e.g. "3D", "CRT").
- **tech:** Stack (e.g. r3f, three.js, gsap, glsl). Flow to llms-full.txt and optional meta keywords. Prefer common casing: "R3F", "Three.js", "GSAP", "GLSL".
- Populate both for shipped/public experiments so search and AI surfaces are complete.

---

## 21. Article Content SEO

**Frontmatter:**

- **title:** Clear, unique; aligns with the single H1 (MDX # Title).
- **description:** 120–155 characters; used for meta and TechArticle; unique per article and compelling for CTR.
- **publishedAt / updatedAt:** ISO 8601; set `updatedAt` when making meaningful content changes (E-E-A-T).
- **keywords (optional):** Article-specific long-tail terms; if present, can be merged with experiment.tags for JSON-LD.

**Prose:**

- **First 100–150 words:** State the topic, experiment name, and 1–2 key techniques or outcomes. Snippet-friendly: answer "What is this?" so search and AI can extract a clear summary. Avoid filler ("In this article we'll…").
- **H2/H3:** Descriptive of the section; support discoverability. No keyword stuffing; voice per writing-voice.md.
- **In-body:** Natural use of experiment name, technique names, and stack. Internal links to related experiments/articles where relevant; external links to authoritative docs/specs where helpful.
- **Depth:** Articles should be substantive (e.g. 400–600+ words for indexable articles); each article is the definitive piece for that experiment.

See [.agents/contexts/writing-voice.md](.agents/contexts/writing-voice.md) (SEO and discoverability) and [.cursor/rules/article-writing.mdc](.cursor/rules/article-writing.mdc) (SEO checklist).

---

## 22. Internal Linking

- **Experiment → article:** "Read article" on cards; article CTA "Try the {experimentTitle} experiment" links back to experiment.
- **Article → experiment:** CTA and breadcrumb (Home > Experiment > Article).
- **Related:** `experiment.json` `related: ["slug1", "slug2"]` drives RelatedExperimentsSection on experiment and article pages. Use genuine topical overlap.
- **In-body:** Link to related experiments or articles in prose where it adds value. No pillar/category pages unless you add them later; the graph is experiment ↔ article + related experiments.

---

## 23. Title and Description Length

| Surface | Guidance |
|--------|----------|
| **Page title (title tag)** | ~50–60 characters to avoid truncation in Google. Pattern: `{page} \| Razi's Experiments Lab` or `{title} — Article \| …`. |
| **Experiment meta description** | 120–160 chars (from experiment.json). |
| **Article meta description** | 120–155 chars (from frontmatter.description ?? experiment.description). |

Audit script can flag title length > 60 and description outside these bands.

---

## 24. Image SEO

- **Experiment posters:** Used as OG/Twitter image and in sitemap. Ensure poster exists for experiments with video; fallback is og-image.png. Alt text for experiment cards: use experiment title or a short descriptive phrase (e.g. "Basketball Replay Center — CRT grid preloader").
- **Article images (MDX):** Use meaningful `alt` on all images (screenshots, diagrams, before/after). Alt should describe the image for accessibility and image search.
- **OG/dynamic images:** `/api/og` generates article OG images; no separate alt policy for the image API output beyond title/tags in the image.

---

## 25. Visible Breadcrumbs

Article pages include **visible breadcrumb navigation** (e.g. Home > {experimentTitle} > Article) in addition to BreadcrumbList JSON-LD. Implemented in `ArticleLayout` (or article page wrapper) with `<nav aria-label="Breadcrumb">`; link order matches JSON-LD. Last item is current page (text only or `aria-current="page"`). Improves UX and reinforces hierarchy for crawlers.

---

## 26. Validation and Audit

| Script / command | Purpose |
|------------------|---------|
| **validate-experiments** | `npm run validate:experiments` — schema, enums, slugs, related; optional soft warning for description length outside 100–180 chars and empty tags/tech for shipped+public. |
| **audit-seo** | `npm run audit:seo` (or validate:seo) — reads all experiment.json and article content.mdx; reports description lengths, duplicate titles/descriptions, title length > 60, missing tags/tech; writes `docs/audits/seo-keywords-content-YYYY-MM.md`. Optional: exit non-zero on critical issues (e.g. duplicate titles) for CI. |

Align with [.cursor/skills/audit-content/SKILL.md](.cursor/skills/audit-content/SKILL.md) so content coverage and SEO tuning can be reviewed together.

---

## 27. Indexing (Google, Bing)

Submit the sitemap so search engines discover all pages; request indexing only for a few key URLs.

| Step | Where | Action |
|------|--------|--------|
| Verify site | [Google Search Console](https://search.google.com/search-console) | Add property (URL prefix `https://www.razisyed.cv`), verify via HTML tag or DNS |
| Submit sitemap | GSC → Sitemaps | Submit `https://www.razisyed.cv/sitemap.xml` |
| Verify site | [Bing Webmaster Tools](https://www.bing.com/webmasters) | Add site, verify |
| Submit sitemap | Bing → Sitemaps | Submit same sitemap URL |
| Optional | GSC or Bing URL Inspection | Request indexing for homepage and 1–2 key pages; don’t submit every URL |

robots.txt already allows crawlers and references the sitemap. After submission, indexing can take days to weeks. Monitor in GSC (Pages, Sitemaps) and Bing (URL Inspection, Sitemaps).

---

## 28. Optional / Out of Scope

| Item | Notes |
|------|-------|
| llms.html | Optional human-readable HTML variant |
| ai.json, brand.txt, faq-ai.txt, robots-ai.txt | Optional AI Visibility Complete tier |
| AI Visibility Directory | Manual submit at ai-visibility.org.uk/submit |
| ExperimentNav aria-label | Low priority; pass experiment title when available |
| What We Do Not Do (llms.txt) | Optional exclusion section |
| IndexNow | Optional; speeds up Bing/Yandex discovery of new URLs |

---

## 29. References

- [llms.txt Specification v1.1.1](https://www.ai-visibility.org.uk/specifications/llms-txt/)
- [AI Visibility Specifications](https://www.ai-visibility.org.uk/specifications/)
- [AI Visibility Directory / Checker](https://www.ai-visibility.org.uk/submit/)
- [Schema.org](https://schema.org/)
- [JSON Feed 1.1](https://jsonfeed.org/)
