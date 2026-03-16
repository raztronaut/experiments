# SEO Audit Report

Comprehensive audit of experiment articles, cards, home page, and adjacent SEO surfaces. Aligned with [personal SEO best practices](https://blog.huntyourtribe.com/personal-seo-how-to-optimize-your-personal-website-for-search-engines/) and Google Rich Results Test findings.

---

## Executive Summary

| Area | Status | Priority |
|------|--------|----------|
| ProfilePage dateCreated/dateModified | ❌ Invalid format | High |
| Meta descriptions (length) | ⚠️ Suboptimal | High |
| Title formatting | ⚠️ Could improve | Medium |
| H1–H6 hierarchy | ⚠️ Issues in articles, cards | Medium |
| ItemList structured data | ✅ Implemented | — |
| Hreflang | ⚪ N/A (single locale) | — |
| Article-specific metadata | ⚠️ Prefer frontmatter | Medium |

---

## 1. Structured Data (Google Rich Results Test)

### 1.1 ProfilePage dateCreated / dateModified — Invalid

**Issue:** Google flags "Invalid datetime value" for `dateCreated` and `dateModified`. Current values use `2025-01-01` (date-only). Google expects full ISO 8601 datetime, e.g. `2025-01-01T00:00:00Z`.

**Location:** `src/lib/structured-data.ts` lines 76–77

**Fix:** Use full datetime format. Options:
- Build-time: `new Date().toISOString()` at build (non-deterministic)
- Static: `2025-01-01T00:00:00Z` (valid format, fixed date)
- From constants: Add `SITE_LAUNCH_DATE` in constants.ts

### 1.2 ItemList — OK

ItemList for experiments is implemented on the home page (`generateExperimentListJsonLd`). Semrush/Google can parse it. No changes needed.

### 1.3 Person / WebSite / TechArticle — OK

Person schema with `sameAs` (GitHub, X) is strong for personal SEO. TechArticle has speakable, breadcrumbs, dates. Article dates use ISO format when from frontmatter.

---

## 2. Meta Descriptions

### 2.1 Site-Level (Main Layout)

| Field | Current | Recommended | Notes |
|-------|---------|-------------|-------|
| description | "A playground for exploring UI interactions, shaders, and modern web techniques." (~60 chars) | 150–160 chars | Too short; Google may truncate or auto-generate |
| SITE_DESCRIPTION (constants) | "Creative coding experiments — shaders, 3D, animation, and interaction design." (~65 chars) | 150–160 chars | Used in structured data; consider expanding |

**Best practice:** Meta description should be 150–160 characters, include primary keywords (creative coding, Razi Syed, experiments, shaders, 3D), and a clear value proposition.

### 2.2 Article Pages

Articles use `experiment.description` for meta. When `frontmatter.description` exists, it is often more specific and better for the article URL. Prefer `frontmatter.description ?? experiment.description`.

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

### 4.1 Home Page

- **h1:** "razi's experiments" ✓
- **Section:** No explicit h2 for "Experiments" or "Writing" tab
- **Cards:** ExperimentListItem uses h2, ExperimentGridCard uses h3

**Issue:** Hierarchy jumps from h1 to h2/h3 without a section h2. Recommended: add a visually hidden or tab-associated h2 for the active section (e.g. "Experiments", "Writing").

### 4.2 Article Pages

- **ArticleLayout:** Renders `<h1>` with article title ✓
- **MDX content:** Many articles start with `# Title` (another h1)

**Issue:** Duplicate h1. Articles like basketball-replay-center, 404-not-found, velocity-responsive-design have both:
1. ArticleLayout h1 (title)
2. MDX `# Title` (same or similar)

**Fix:** Either:
- Remove the leading `#` from article content and start with `##` (recommended), or
- Use a remark plugin to demote the first heading level in MDX

**Good example:** non-euclidean-hyperbolic-workspace article starts with prose, then `##`, so no duplicate h1.

### 4.3 Experiment Cards (Grid vs List)

- **Grid:** h1 (page) → h3 (card titles). Missing h2 for "Experiments" section.
- **List:** h1 (page) → h2 (each item). Semantically acceptable but many h2s as siblings.

**Recommendation:** Add a single h2 for the section ("Experiments" / "Writing") and use h3 for card titles in both views.

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

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 1 | Fix ProfilePage dateCreated/dateModified to ISO 8601 | structured-data.ts | Low |
| 2 | Expand site meta description to 150–160 chars | layout.tsx, constants.ts | Low |
| 3 | Prefer frontmatter.description for article metadata | article/page.tsx (per experiment) | Low |
| 4 | Add section h2 for Experiments/Writing on home | ContentSection, ExperimentDrawerList | Medium |
| 5 | Normalize card heading: h2 section + h3 card titles | ExperimentGridCard, ExperimentListItem, WritingSection | Medium |
| 6 | Fix duplicate h1 in articles (MDX # vs ArticleLayout) | content.mdx files + optional remark plugin | Medium |
| 7 | Consider longer SITE_DESCRIPTION for structured data | constants.ts | Low |

---

## 9. References

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org dateModified](https://schema.org/dateModified)
- [Personal SEO: Optimize Your Personal Website](https://blog.huntyourtribe.com/personal-seo-how-to-optimize-your-personal-website-for-search-engines/)
- [Google Search Central: Meta descriptions](https://developers.google.com/search/docs/appearance/snippet)
- [docs/seo.md](./seo.md) — existing SEO reference
