# SEO Structure Audit Report

**Date:** March 16, 2026  
**Scope:** Work in `cursor/pages-seo-structure-ee14`, current branch `cursor/codebase-seo-audit-661f`, and full codebase SEO implementation  
**Reference:** `docs/seo.md` (canonical SEO documentation)

---

## 1. Branch Relationship Summary

| Branch | Base | SEO Work Status |
|--------|------|-----------------|
| `main` | — | **No SEO infrastructure** — `structured-data.ts` does not exist |
| `cursor/codebase-seo-audit-661f` (current) | main | Has SEO remediation merge (PR #13) — full structured data, llms.txt, feeds, etc. |
| `cursor/pages-seo-structure-ee14` | main | **3 commits ahead** of current branch with additional SEO fixes |

### Commits in `pages-seo-structure-ee14` NOT in current branch

1. **ad60f91** — fix(seo): ProfilePage ISO 8601 dates, meta descriptions, article metadata, heading hierarchy  
2. **2fdb49e** — chore: regenerate registry and posters from build pipeline  
3. **c9a3fbc** — refactor(seo): foundation fixes — rehype-shift-heading, shared MDX config, content strategy  

**Recommendation:** Merge `cursor/pages-seo-structure-ee14` into the current branch (or main) to capture these improvements.

---

## 2. SEO Implementation Inventory

### 2.1 Metadata (Implemented ✓)

| Location | Implementation |
|----------|----------------|
| **Main layout** (`src/app/(main)/layout.tsx`) | `metadataBase`, `SITE_TITLE`, `SITE_DESCRIPTION`, `AUTHOR_NAME`, `applicationName`, `category`, `alternates`, `openGraph`, `twitter`, `robots`, `keywords`, `viewport` (themeColor) |
| **Experiment layouts** (`plop-templates/experiment/route-layout.tsx.hbs`) | Per-experiment metadata from `experiment.json`; `robots: index/follow` for public, `noindex` for wip/dev |
| **Article pages** | Canonical, OG, Twitter from frontmatter + experiment.json |
| **Constants** | `src/lib/constants.ts` — SITE_URL, SITE_TITLE, SITE_DESCRIPTION, AUTHOR_NAME, AUTHOR_DISPLAY, GITHUB_URL, TWITTER_URL |

**Gap:** Main layout uses hardcoded description string instead of `SITE_DESCRIPTION` constant in `layout.tsx` (lines 28–29).

### 2.2 Structured Data (JSON-LD)

| Schema | Location | Status |
|--------|----------|--------|
| **Person** | Main layout | ✓ Full name, givenName, familyName, alternateName, url, sameAs, jobTitle |
| **WebSite** | Main layout | ✓ name, url, description, author ref, inLanguage |
| **ProfilePage** | Main layout | ⚠️ **Gap:** `dateCreated`/`dateModified` use `"2025-01-01"` instead of ISO 8601 (`"2025-01-01T00:00:00Z"`) — fixed in pages-seo branch |
| **ItemList** | Homepage (ContentSection) | ✓ Experiments with name, description, url |
| **CreativeWork** | Per-experiment layout | ✓ name, description, url, creator, isAccessibleForFree, keywords |
| **TechArticle** | Article pages | ✓ headline, description, datePublished, dateModified, about, author, publisher, image, speakable, keywords |
| **BreadcrumbList** | Experiment + Article pages | ✓ Home → Experiment → Article |

**XSS safety:** `safeJsonLdStringify()` escapes `<` in JSON-LD — ✓

### 2.3 Sitemap & Robots

| File | Purpose |
|------|---------|
| `src/app/sitemap.ts` | Homepage (priority 1), experiments (0.7), articles (0.8), feeds (0.3); images/videos for experiments; revalidate 3600s |
| `src/app/robots.ts` | Disallow `/dev`, `/mdx-preview`, `/u/`, `/api/experiments`, `/api/registry-search`; Sitemap URL; user agents for Google, Bing, DuckDuckGo, AI bots (GPTBot, ClaudeBot, etc.), social bots |

**Filtering:** `getExperiments()` and `getArticles()` filter by `showDevContent` and `listing` — production sitemap includes only public experiments/articles. ✓

### 2.4 Feeds

| Feed | Route | Format | Autodiscovery |
|------|-------|--------|---------------|
| RSS 2.0 | `/feed.xml` | application/rss+xml | ✓ `alternates.types` in main layout |
| Atom | `/atom.xml` | application/atom+xml | ✓ |
| JSON Feed | `/feed.json` | application/feed+json | ✓ |

All three in sitemap. XSL stylesheet for RSS at `public/feed-styles.xsl`.

### 2.5 AI Visibility (llms.txt v1.1.1)

| File | Purpose |
|------|---------|
| `public/llms.txt` | AI Visibility spec — H1, blockquote, Articles, Experiments, Technical Details, Content API, AI Discovery Files, Contact |
| `public/llms-full.txt` | Extended with full experiment metadata |
| `public/ai.txt` | AI usage permissions |
| `public/identity.json` | Structured identity (name, alternateName, url, sameAs, jobTitle) |
| `public/developer-ai.txt` | Developer-focused AI guidance |

**Redirect:** `/llm.txt` → `/llms.txt` (next.config.ts) ✓

**Generation:** `npm run generate:llms-txt` — gates on `status` and `listing` (skips wip, excludes registry-only).

### 2.6 IndieWeb & Microformats

| Item | Location |
|------|----------|
| **h-card** | Main layout (sr-only, hidden) — p-name, u-url, p-job-title, rel="me" for GitHub, X, LinkedIn |
| **h-entry** | ArticleLayout — h-entry, p-name, dt-published, dt-updated, u-url, p-category, e-content |
| **h-feed** | WritingSection — h-feed + role="feed" |
| **webmention** | Main layout — rel="webmention" to webmention.io |
| **pingback** | Main layout — rel="pingback" |
| **rel="me"** | SocialPills, h-card links |

### 2.7 Redirects & Canonical

| Redirect | Implementation |
|----------|----------------|
| `/experiments` → `/` | next.config.ts (permanent) |
| `/llm.txt` → `/llms.txt` | next.config.ts (permanent) |
| Canonical host | Vercel domain config (no middleware) |

### 2.8 Security & Performance

- **Security headers** (next.config.ts): X-DNS-Prefetch-Control, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP
- **Registry** (`/registry/*`): X-Robots-Tag: noindex, nofollow
- **prefers-reduced-motion**: globals.css override
- **dns-prefetch**: cloud.umami.is in layout

---

## 3. Gaps & Inconsistencies

### 3.1 Current Branch vs. pages-seo-structure-ee14

| Gap | Current | pages-seo-structure-ee14 |
|-----|---------|--------------------------|
| ProfilePage dates | `"2025-01-01"` | `"2025-01-01T00:00:00Z"` (ISO 8601) |
| rehype-shift-heading | Not present | Demotes MDX h1→h2 for single h1 per page |
| Shared MDX config | Per-article inline config | `src/lib/mdx-article-config.ts` shared across all article pages |
| SITE_DESCRIPTION in main layout | Hardcoded string | Uses constant (pages-seo may have this) |
| Plop article template | Missing `related` prop, `getRelatedSlugs` | May include related experiments |

### 3.2 Plop Article Template

- `plop-templates/article/page.tsx.hbs` does **not** pass `related={getRelatedSlugs(experiment)}` to ArticleLayout.
- Existing article pages (404-not-found, basketball-replay-center, etc.) do pass `related`.
- **Fix:** Add `related` and `getRelatedSlugs` to plop template for new articles.

### 3.3 Main Layout Description

- `layout.tsx` lines 28–29 use a hardcoded description instead of `SITE_DESCRIPTION`.
- **Fix:** `description: SITE_DESCRIPTION` (already in constants).

### 3.4 Pending Items (from seo_work_audit_remediation plan)

- single-source-config (site-config.json) — **pending**
- FAQPage schema for articles with faq frontmatter — **pending**
- llms.txt "What We Do Not Do" section — **pending**
- Organization schema in generateWebSiteJsonLd — **pending**

---

## 4. Effectiveness Assessment

### 4.1 Strengths

1. **Comprehensive structured data** — Person, WebSite, ProfilePage, ItemList, CreativeWork, TechArticle, BreadcrumbList
2. **AI Visibility** — llms.txt, ai.txt, identity.json, developer-ai.txt; spec-compliant
3. **Feeds** — RSS, Atom, JSON Feed with autodiscovery
4. **IndieWeb** — h-card, h-entry, h-feed, webmention, rel="me"
5. **Robots** — Explicit rules for search and AI crawlers; disallow dev/preview routes
6. **Sitemap** — Dynamic, includes images/videos, correct filtering
7. **Experiment coverage** — All 21 experiment layouts use ExperimentJsonLd + RelatedExperimentsSection (plop template)
8. **Article JSON-LD** — TechArticle with speakable, about (experiment link), proper dates
9. **Site-config validation** — `npm run validate:site-config` ensures constants sync

### 4.2 Areas for Improvement

1. **Merge pages-seo-structure-ee14** — Capture ISO 8601 dates, rehype-shift-heading, shared MDX config
2. **Use SITE_DESCRIPTION in main layout** — Remove hardcoded string
3. **Plop article template** — Add `related` prop for RelatedExperimentsSection
4. **ProfilePage dates** — Use full ISO 8601 format
5. **Heading hierarchy** — rehype-shift-heading ensures single h1 per page (SEO best practice)

### 4.3 Documentation

- `docs/seo.md` — Comprehensive 19-section reference; accurate and up-to-date
- `docs/seo-audit-report.md` — This report

---

## 5. Recommendations

1. **Immediate:** Merge `cursor/pages-seo-structure-ee14` into the current branch to get:
   - ProfilePage ISO 8601 dates
   - rehype-shift-heading for heading hierarchy
   - Shared MDX config (`src/lib/mdx-article-config.ts`)
   - SITE_DESCRIPTION and content strategy updates

2. **Quick fixes (current branch):**
   - Replace hardcoded description in main layout with `SITE_DESCRIPTION`
   - Update ProfilePage dates to `"2025-01-01T00:00:00Z"` in `structured-data.ts`
   - Add `related` and `getRelatedSlugs` to plop article template

3. **Backlog:** single-source-config, FAQPage schema, Organization schema, llms.txt "What We Do Not Do" (per docs/seo.md optional items)

---

## 6. File Reference

| File | Role |
|------|------|
| `src/lib/structured-data.ts` | All JSON-LD generators |
| `src/lib/constants.ts` | SITE_*, AUTHOR_*, etc. |
| `scripts/lib/site-config.mjs` | Build scripts (generate-llms-txt, etc.) — must stay in sync |
| `src/components/seo/ExperimentJsonLd.tsx` | CreativeWork + BreadcrumbList for experiments |
| `src/app/api/og/route.tsx` | Dynamic OG image generation |
| `plop-templates/experiment/route-layout.tsx.hbs` | Experiment template with ExperimentJsonLd, RelatedExperimentsSection |
| `plop-templates/article/page.tsx.hbs` | Article template — needs `related` |
