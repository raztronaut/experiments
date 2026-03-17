---
name: ""
overview: ""
todos: []
isProject: false
---

# SEO Deep Pass — Comprehensive Plan (Expert-Grade)

**Goal:** After implementation, an SEO expert and a 10x developer would conclude the setup is immaculate and impeccable. Every touchpoint is documented, validated where possible, and kept in sync via single sources of truth and foundational agent/plop updates.

**Scope:** Keywords strategy, experiment metadata quality, article content and prose, internal linking, structured data completeness, visible UX (breadcrumbs), validation/audit tooling, and **foundational updates** (agent docs, plop prompts/templates, workflows) so all future content and experiments are SEO-compliant by default.

---

## Part A: What’s Already Done (No Rework)

[docs/seo.md](docs/seo.md) and [docs/seo-audit.md](docs/seo-audit.md) cover: metadata (titles, descriptions, canonical, OG/Twitter), structured data (Person, WebSite, ItemList, CreativeWork, TechArticle, BreadcrumbList), sitemap/robots/feeds, llms.txt/AEO, H1–H6 hierarchy, frontmatter.description for articles, naming strategy. Sitemap uses `getExperiments()` / `getArticles()` which respect `showDevContent` — production sitemap lists only indexable URLs. Deslop audit was code quality, not SEO.

---

## Part B: SEO Expert–Level Gaps (Addressed Below)


| Area                              | Current gap                                                                         | Action in this plan                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Title tag length**              | No doc or validation; Google truncates ~50–60 chars                                 | Document; optional validation (warn) in audit                                      |
| **Meta description length**       | Experiment/article lengths not enforced                                             | Document 120–160 (exp), 120–155 (article); validate/audit                          |
| **Visible breadcrumbs**           | Only JSON-LD BreadcrumbList; no visible nav                                         | Add visible breadcrumb nav to article pages (Home > Experiment > Article)          |
| **Duplicate titles/descriptions** | Risk of cannibalization or thin differentiation                                     | Audit script: flag duplicate page titles and meta descriptions                     |
| **Image SEO**                     | No documented alt policy for posters, MDX images, OG                                | Document alt requirements; ensure experiment cards and article images use alt      |
| **Keyword flow**                  | Only main layout has meta keywords; experiments/articles use only JSON-LD from tags | Document flow; add per-page meta keywords from tags+tech (optional but consistent) |
| **E-E-A-T / freshness**           | Dates in schema; no “last reviewed” or guidance                                     | Document; ensure dateModified is set when content changes                          |
| **Featured snippet / speakable**  | Speakable present; no prose guidance for snippet-friendly intro                     | Add “first paragraph” and heading guidance in writing-voice + article rule         |
| **Topic clusters**                | related[] exists; no pillar model                                                   | Document internal linking strategy; no pillar pages unless you add them later      |
| **Structured data completeness**  | TechArticle has no wordCount; CreativeWork could reference image                    | Optional: wordCount from reading time; image in CreativeWork when poster exists    |


---

## Part C: 10x Developer–Level (Single Source of Truth + Automation)

**Data flow (document and enforce):**

- **Experiment:** `experiment.json` (description, tags, tech, title, slug) → experiment layout metadata, `ExperimentJsonLd` (CreativeWork), llms.txt, sitemap via `getExperiments()`. No second copy of experiment metadata in app code.
- **Article:** `article/content.mdx` frontmatter (title, description, publishedAt, updatedAt, optional keywords) → `generateMetadata()`, `generateArticleJsonLd()`, sitemap via `getArticles()`. Experiment fallback for description/tags when frontmatter missing.
- **Site:** `src/lib/constants.ts` + `scripts/lib/site-config.mjs` (validated sync) → main layout, feeds, llms.txt.

**Validation and automation:**

- **validate-experiments.mjs:** Add soft warning when description length outside 100–180 chars. Optional: warn when tags/tech empty for shipped+public.
- **New: validate-seo or audit-seo script:** Report (and optionally fail CI) on: duplicate page titles, duplicate meta descriptions, title length > 60 chars, experiment description outside band, article description outside 120–155, missing tags/tech for indexable experiments. Output: `docs/audits/seo-keywords-content-YYYY-MM.md` plus console table.
- **Pre-commit / CI:** Keep `validate:experiments`; add `npm run validate:seo` (or `audit:seo`) as optional pre-push or CI step.

**Plop and scaffolding:**

- **plopfile.js (new experiment):** Prompt for “Short description” should say “120–160 chars for SEO (meta + JSON-LD)”. Optional: add prompts for initial tags/tech or leave empty arrays with comment.
- **plopfile.js (new article):** “Article description” prompt should say “120–155 chars for meta and JSON-LD”.
- **plop-templates/experiment/route-layout.tsx.hbs:** Add `keywords: [...(experiment.tags ?? []), ...(experiment.tech ?? [])]` to metadata (dedupe if desired).
- **plop-templates/article/page.tsx.hbs:** Add `keywords: [...(experiment.tags ?? []), ...(experiment.tech ?? [])]` to `generateMetadata()`.
- **plop-templates/article/content.mdx.hbs:** In frontmatter comment, state “description: 120–155 chars”. Optional: add `keywords` or `tags` array in frontmatter and wire to article JSON-LD (fallback to experiment.tags).

---

## Part D: Article Text and Prose (Comprehensive)

**Frontmatter (enforced by template + audit):**

- **title:** Clear, unique; aligns with H1 (rehype-shift-heading makes MDX # Title the visual H1).
- **description:** 120–155 chars; used for meta and TechArticle; must be unique per article and compelling for CTR.
- **publishedAt / updatedAt:** ISO 8601; updatedAt set when making meaningful content changes (E-E-A-T).
- **keywords (optional):** Article-specific long-tail terms; if present, merge with or override experiment.tags for JSON-LD.

**Prose (document in writing-voice + article rule):**

- **First 100–150 words:** State the topic, experiment name, and 1–2 key techniques or outcomes. Snippet-friendly: answer “What is this?” so search and AI can extract a clear summary. No filler (“In this article we’ll…”).
- **H1:** Single per page; match or tightly align with article title. Already enforced by layout + rehype-shift-heading.
- **H2/H3:** Descriptive of the section; support discoverability (e.g. “How the effect works”, “Key implementation detail”). No keyword stuffing; voice per writing-voice.md.
- **In-body:** Natural use of experiment name, technique names, and stack (e.g. GSAP, R3F) where it fits. Internal links to related experiments/articles where relevant; external links to authoritative docs/specs where helpful.
- **Depth:** Articles should be substantive (e.g. 400–600+ words for indexable articles); avoid thin or duplicate content. Each article is the definitive piece for that experiment.
- **Before-publish checklist (in article-writing.mdc):** Description length 120–155; title and H1 aligned; first paragraph states topic and value; headings descriptive; no duplicate title/description with another article.

**Where this is documented:**

- [.agents/contexts/writing-voice.md](.agents/contexts/writing-voice.md): New subsection **“SEO and discoverability”** (first para, headings, internal/external links, depth, no stuffing).
- [.cursor/rules/article-writing.mdc](.cursor/rules/article-writing.mdc): New **“SEO checklist”** (description, first para, headings, optional keywords; link to docs/seo.md).

---

## Part E: Foundational Agent Docs and Rules (So Everything Stays in Sync)


| Document                                  | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AGENTS.md**                             | In Reference Docs table add row: “SEO / metadata” → docs/seo.md. In “Always do” add: “Follow SEO metadata guidelines (docs/seo.md) when creating or editing experiments and articles.”                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **docs/seo.md**                           | New sections: **Keyword strategy and flow** (where keywords live; tags/tech → JSON-LD and llms.txt; optional meta keywords). **Experiment metadata for SEO** (description 120–160 chars; tags = topic/theme; tech = stack; preferred casing). **Article content SEO** (frontmatter, first para, headings, internal linking). **Internal linking** (related, CTA, in-body links). **Title and description length** (title ~50–60 chars; meta 120–155). **Image SEO** (alt for posters, MDX images). **Visible breadcrumbs** (article nav). **Validation and audit** (validate-experiments + validate-seo/audit-seo). |
| **.cursor/rules/experiment-metadata.mdc** | Add: “SEO: description 120–160 chars; include tags and tech for JSON-LD and llms.txt. See docs/seo.md.”                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **.agents/rules/experiments.md**          | Add one line: “Experiment metadata (description, tags, tech) drives SEO surfaces; see docs/seo.md and .cursor/rules/experiment-metadata.mdc.”                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **.agents/workflows/new-experiment.md**   | Add step or note: “After scaffolding, fill description (120–160 chars) and tags/tech for SEO and llms.txt.”                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **.agents/contexts/writing-voice.md**     | New subsection: “SEO and discoverability” (see Part D).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **.cursor/rules/article-writing.mdc**     | New “SEO checklist” (see Part D); reference docs/seo.md.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |


---

## Part F: Visible Breadcrumbs and Schema Alignment

- **Article pages:** Add visible breadcrumb navigation (e.g. Home > {experimentTitle} > Article) in [ArticleLayout](src/components/ui/ArticleLayout.tsx) or in the article page wrapper. Use `<nav aria-label="Breadcrumb">` and links that match the order in BreadcrumbList JSON-LD. Improves UX and reinforces hierarchy for crawlers.
- **Markup:** Use a list or inline links; ensure the last item is current page (text only or `aria-current="page"`). No need to change BreadcrumbList JSON-LD.

---

## Part G: Optional Structured Data and Meta Enhancements

- **TechArticle:** Add `wordCount` if easily derivable (e.g. from reading time × average WPM). Helps some rich result tests.
- **CreativeWork:** When `poster` or experiment image exists, add `image: SITE_URL + poster` to CreativeWork JSON-LD.
- **Experiment and article meta keywords:** Implement in plop templates as in Part C so every new experiment/article gets meta keywords from tags+tech without manual duplication.

---

## Part H: Audit and Reporting

- **One-off / recurring report:** Script (e.g. `scripts/audit-seo.mjs`) that:
  - Reads all experiment.json and all article content.mdx (frontmatter).
  - Builds a table: slug, status, listing, description length, tags/tech present, has article, article description length, article title.
  - Flags: description < 100 or > 180 (exp), > 155 (article); empty tags/tech for indexable experiments; duplicate titles; duplicate meta descriptions; title > 60 chars.
  - Writes `docs/audits/seo-keywords-content-YYYY-MM.md` and prints summary to console.
- **Integration:** Optional `npm run validate:seo` or `audit:seo` that runs this and exits with non-zero if critical issues (e.g. duplicate titles) are found. Can be added to CI or pre-push.
- **Cross-reference:** Align with [.cursor/skills/audit-content/SKILL.md](.cursor/skills/audit-content/SKILL.md) so “what needs writing” and “what needs SEO tuning” can be reviewed together.

---

## Part I: Implementation Order (Comprehensive)

1. **Documentation (docs/seo.md)**
  Add all new sections from Part B and E: keyword strategy, experiment metadata for SEO, article content SEO, internal linking, title/description length, image SEO, visible breadcrumbs, validation/audit. No code changes yet.
2. **Agent docs and rules**
  Update AGENTS.md, experiment-metadata.mdc, experiments.md, new-experiment.md, writing-voice.md, article-writing.mdc as in Part E and D.
3. **Plop prompts**
  Update plopfile.js: experiment description prompt “120–160 chars for SEO”; article description prompt “120–155 chars for meta and JSON-LD”.
4. **Plop templates**
  Experiment layout: add metadata.keywords from tags+tech. Article page: add metadata.keywords from experiment.tags+tech. Article content.mdx.hbs: frontmatter comment with length guidance; optional keywords/tags in frontmatter.
5. **Validation (scripts)**
  validate-experiments.mjs: soft warning for description length outside 100–180. Add scripts/audit-seo.mjs (or extend validate) for duplicate titles/descriptions, length checks, missing tags/tech; output audit report. Optional npm run validate:seo.
6. **Visible breadcrumbs**
  Add breadcrumb nav to ArticleLayout (or article page) for article pages only; match BreadcrumbList order.
7. **Optional schema/meta**
  TechArticle wordCount; CreativeWork image when poster exists; article frontmatter keywords → JSON-LD if implemented.
8. **Run audit and backfill**
  Run audit script; produce docs/audits/seo-keywords-content-YYYY-MM.md; fix critical issues (duplicates, egregious length); backfill description/tags/tech where missing for key experiments (optional, can be iterative).

---

## Part J: Files to Touch (Checklist)

**Documentation**

- docs/seo.md — all new sections
- docs/audits/seo-keywords-content-YYYY-MM.md — generated by audit script

**Agent docs / rules**

- AGENTS.md — SEO reference + Always do
- .cursor/rules/experiment-metadata.mdc — SEO requirement
- .cursor/rules/article-writing.mdc — SEO checklist
- .agents/rules/experiments.md — one-line SEO reference
- .agents/contexts/writing-voice.md — SEO and discoverability
- .agents/workflows/new-experiment.md — SEO note after scaffold

**Plop**

- plopfile.js — experiment and article description prompts
- plop-templates/experiment/route-layout.tsx.hbs — metadata.keywords
- plop-templates/article/page.tsx.hbs — metadata.keywords
- plop-templates/article/content.mdx.hbs — frontmatter comment; optional keywords

**App code**

- src/components/ui/ArticleLayout.tsx — visible breadcrumb nav (or article page wrapper)
- src/lib/structured-data.ts — optional: TechArticle wordCount, CreativeWork image

**Scripts**

- scripts/validate-experiments.mjs — description length warning
- scripts/audit-seo.mjs — new (or extend validate) — audit report + optional CI fail
- package.json — optional script validate:seo or audit:seo

---

## Part K: Success Criteria (Expert-Grade)

- **SEO expert:** Clear playbook (docs/seo.md); every surface (meta, JSON-LD, llms.txt, sitemap) traceable to a single source; no duplicate titles/descriptions; descriptions in range; visible breadcrumbs; image alt policy; snippet-friendly article intros and headings; internal linking documented and implemented.
- **10x dev:** One source of truth per entity (experiment.json, article frontmatter, constants); plop and validation enforce defaults; audit script catches drift; agent docs and rules make SEO the default for new experiments and articles; implementation order is clear and checklist complete.

This plan is exhaustive and implementation-ready. Execute in the order of Part I and use Part J as the file checklist; Part A confirms what to leave unchanged.