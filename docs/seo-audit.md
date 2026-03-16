# SEO Audit Report

Comprehensive audit of experiment articles, cards, home page, and adjacent SEO surfaces. Aligned with [personal SEO best practices](https://blog.huntyourtribe.com/personal-seo-how-to-optimize-your-personal-website-for-search-engines/) and Google Rich Results Test findings.

---

## Executive Summary

| Area | Status | Priority |
|------|--------|----------|
| ProfilePage dateCreated/dateModified | ✅ Fixed (ISO 8601) | — |
| Meta descriptions (length) | ✅ Fixed (~155 chars) | — |
| Site description content | ✅ No portfolio tech stack; focus on experiments | — |
| H1–H6 hierarchy | ✅ remark-heading-shift + section h2 + card h3 | — |
| ItemList structured data | ✅ Implemented | — |
| Hreflang | ⚪ N/A (single locale) | — |
| Article-specific metadata | ✅ Prefer frontmatter.description | — |

---

## 1. Structured Data (Google Rich Results Test)

### 1.1 ProfilePage dateCreated / dateModified — Fixed

**Was:** `2025-01-01` (date-only, invalid per Google). **Now:** `2025-01-01T00:00:00Z` (full ISO 8601) in `src/lib/structured-data.ts`.

### 1.2 ItemList — OK

ItemList for experiments is implemented on the home page (`generateExperimentListJsonLd`). Semrush/Google can parse it. No changes needed.

### 1.3 Person / WebSite / TechArticle — OK

Person schema with `sameAs` (GitHub, X) is strong for personal SEO. TechArticle has speakable, breadcrumbs, dates. Article dates use ISO format when from frontmatter.

---

## 2. Meta Descriptions

### 2.1 Site-Level (Main Layout)

**Fixed.** SITE_DESCRIPTION is ~155 chars, focuses on experiments (WebGL shaders, 3D scenes, scroll-driven animation, interactive UI) and example experiments ("From CRT effects to hyperbolic spaces"). **Content strategy:** Do not expose portfolio tech stack (Next.js, R3F, GSAP) in site-level metadata; reserve tech details for experiment/article descriptions.

### 2.2 Article Pages

**Fixed.** All article pages use `generateMetadata()` and prefer `frontmatter.description ?? experiment.description` for meta and JSON-LD.

### 2.3 Experiment Pages

Per-experiment metadata from `experiment.json` is used. Descriptions vary; ensure they are 120–160 chars where possible.

---

## 3. Title Formatting

### 3.1 Site Template

Current: `%s | ${SITE_TITLE}` → e.g. "Basketball Replay Center | Razi's Experiments Lab"

**OK.** Pipe separator is standard. Consider whether experiment pages need the full site title or a shorter suffix.

### 3.2 Article Pages

Current: `${experiment.title} — Article` (e.g. "Basketball Replay Center — Article")

**Consider:** "Article: {title}" or "{title} – Article" for consistency. Em dash (—) vs en dash (–) is minor. Main improvement: ensure title is descriptive and under ~60 chars.

---

## 4. H1–H6 Hierarchy

### 4.1 Home Page — Fixed

- **h1:** "razi's experiments" ✓
- **Section:** sr-only h2 for "Experiments" or "Writing" (ContentSection)
- **Cards:** ExperimentListItem and ExperimentGridCard both use h3 (h1 → h2 → h3)

### 4.2 Article Pages — Fixed

- **ArticleLayout:** Renders `<h1>` with article title ✓
- **MDX content:** `rehype-shift-heading` (shift=1) demotes h1→h2, h2→h3, etc. Single h1 per page.
- **Config:** `src/lib/mdx-article-config.ts` centralizes plugins; all article pages and plop template use it.

### 4.3 Experiment Cards — Fixed

Both grid and list use h3 for card titles. Section h2 is sr-only (no UI change).

---

## 5. Hreflang

**Status:** Not implemented. For a single-locale (en-US) site, hreflang is optional. Add only if you introduce multiple languages or regional variants.

---

## 6. Sitemap

**Status:** OK. Includes homepage, experiments, articles, feeds. Uses `lastModified`, `images`, `videos` where applicable. No hreflang in sitemap (not required for single locale).

---

## 7. Additional Recommendations

### 7.1 Article JSON-LD Dates

Article `datePublished` and `dateModified` from frontmatter use ISO format (e.g. `2026-03-06T00:00:00.000Z`). ✓

### 7.2 Open Graph / Twitter

OG and Twitter metadata are set. Ensure `og:image` and `twitter:image` use absolute URLs (metadataBase handles this).

### 7.3 Canonical URLs

Canonical URLs are set for main layout, experiments, and articles. ✓

### 7.4 Personal SEO (from Hunt Your Tribe)

- **sameAs:** GitHub, X (Twitter) in Person schema ✓
- **jobTitle:** "Design Engineer" ✓
- **alternateName:** Razi, raztronaut ✓
- **Entity consolidation:** Person + ProfilePage + WebSite graph ✓

---

## 8. Implementation Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Fix ProfilePage dateCreated/dateModified to ISO 8601 | ✅ |
| 2 | Expand site meta description; no portfolio tech stack | ✅ |
| 3 | Prefer frontmatter.description for article metadata | ✅ |
| 4 | Add section h2 for Experiments/Writing on home | ✅ |
| 5 | Normalize card heading: h2 section + h3 card titles | ✅ |
| 6 | Fix duplicate h1 via rehype-shift-heading | ✅ |
| 7 | Shared MDX config (mdx-article-config.ts) | ✅ |

---

## 9. AEO (AI Engine Optimization)

| Surface | Status |
|---------|--------|
| llms.txt | ✓ AI Visibility v1.1.1 spec |
| ai.txt, identity.json, developer-ai.txt | ✓ Per docs/seo.md |
| TechArticle speakable | ✓ cssSelector for voice/answer-box |
| Structured data (Person, WebSite, ItemList) | ✓ Machine-readable entity graph |
| SITE_DESCRIPTION | ✓ No portfolio tech; experiment-focused for AI summarization |

---

## 10. Main layout constants (follow-up)

Webmention, pingback, and sr-only h-card URLs now use `SITE_URL`, `GITHUB_URL`, `TWITTER_URL`, `LINKEDIN_URL`, and `AUTHOR_NAME` from `src/lib/constants.ts`. Webmention.io URLs are built as `https://webmention.io/${new URL(SITE_URL).host}/webmention` (and `/xmlrpc` for pingback) so a single constant change updates all surfaces.

---

## 11. Investigation notes (gaps and best-practice checks)

| Item | Finding |
|------|--------|
| **generateMetadata + getArticleContent** | Article pages call `getArticleContent(slug)` in both `generateMetadata()` and the page component. `getArticleContent` is wrapped in React `cache()` in `src/lib/articles.ts`, so the same request is deduplicated within the render pass; no double read. |
| **Article date format** | Article JSON-LD and `<time dateTime>` use frontmatter/experiment dates as-is. Schema.org and HTML5 accept date-only (e.g. `2025-01-01`). For strictest Google Rich Results, full ISO 8601 (e.g. `2025-01-01T00:00:00Z`) in frontmatter is recommended; plop uses `{{createdDate}}` (often date-only). No code bug; authors can use full ISO in frontmatter. |
| **Plop content.mdx.hbs** | Frontmatter already has `description: "{{description}}"`. The plop fix commit "add related and getRelatedSlugs" refers to the **layout** prop `related={getRelatedSlugs(experiment)}` in the article page template, not frontmatter. New articles get both a frontmatter description and the Related section when `experiment.json` has a `related` array. |
| **Registry JSON** | `public/registry/*.json` changes in the PR come from regenerating with `npm run generate:all` (or build pipeline) after component updates (e.g. ContentSection h2). Regenerate after layout/component changes to keep registry in sync. |
| **Poster binaries** | Poster.jpg changes are from "regenerate registry and posters from build pipeline" commit. Expect binary diffs when posters are re-captured or the pipeline runs; no action unless a specific poster is wrong. |
| **404 article** | The 404-not-found article page on this branch passes `related={getRelatedSlugs(experiment)}` to ArticleLayout (same as other article pages). Hierarchy and metadata are consistent. |

---

## 12. References

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org dateModified](https://schema.org/dateModified)
- [Personal SEO: Optimize Your Personal Website](https://blog.huntyourtribe.com/personal-seo-how-to-optimize-your-personal-website-for-search-engines/)
- [Google Search Central: Meta descriptions](https://developers.google.com/search/docs/appearance/snippet)
- [docs/seo.md](./seo.md) — existing SEO reference
