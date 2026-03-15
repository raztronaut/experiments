---
name: SEO Comprehensive Guide
overview: SEO implementation guide covering metadata, structured data, feeds, AI discovery files, and naming consistency (Razi / Razi Syed / raztronaut) for multi-query SEO.
todos: []
isProject: false
---

# SEO, AEO, and Off-Page: Comprehensive Guide

A consolidated guide covering Phase 9 (Off-Page SEO) and all adjacent/pending upgrades. Includes a full audit of current state.

---

## Part 0: Current State Audit (Investigation Results)

### Metadata and Layout


| Item                    | Status  | Location                                                                                                       |
| ----------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| Main layout metadata    | OK      | [src/app/(main)/layout.tsx](src/app/(main)/layout.tsx)                                                         |
| metadataBase            | OK      | `https://www.razisyed.cv`                                                                                      |
| canonical               | OK      | `/` in alternates                                                                                              |
| Feed autodiscovery      | OK      | feed.xml, atom.xml, feed.json in alternates.types                                                              |
| OG/Twitter cards        | OK      | /og-image.png, summary_large_image, creator @raztronaut                                                        |
| Keywords, category      | OK      | technology, design engineering, etc.                                                                           |
| robots meta             | OK      | index, follow, googleBot max-*                                                                                 |
| **Title inconsistency** | **Gap** | layout uses "Razi's Experiments", constants use "Razi's Experiments Lab" — OG/twitter say "Razi's Experiments" |


### Structured Data (JSON-LD)


| Schema                        | Status | Location                                          |
| ----------------------------- | ------ | ------------------------------------------------- |
| Person                        | OK     | structured-data.ts, layout                        |
| WebSite                       | OK     | structured-data.ts                                |
| ProfilePage                   | OK     | structured-data.ts                                |
| ItemList (experiments)        | OK     | page.tsx, generateExperimentListJsonLd            |
| CreativeWork (per experiment) | OK     | generateCreativeWorkJsonLd                        |
| TechArticle (articles)        | OK     | generateArticleJsonLd                             |
| BreadcrumbList                | OK     | generateBreadcrumbJsonLd                          |
| Speakable                     | OK     | articles have cssSelector for .p-name, .e-content |


### Sitemap and Robots


| Item                          | Status | Notes                                         |
| ----------------------------- | ------ | --------------------------------------------- |
| sitemap.xml                   | OK     | Dynamic, experiments + articles + feeds       |
| Sitemap images                | OK     | Experiments with poster have images array     |
| Sitemap videos                | OK     | Experiments with video have videos array      |
| feed.xml, atom.xml in sitemap | OK     | feed.json not in sitemap                      |
| robots.ts                     | OK     | Sitemap URL, AI bots allowed, /dev disallowed |
| llms.txt allowed              | OK     | Not in DISALLOWED                             |


### Feeds


| Feed               | Status | XSL                              |
| ------------------ | ------ | -------------------------------- |
| feed.xml (RSS 2.0) | OK     | References feed-styles.xsl       |
| atom.xml           | OK     | No XSL ref                       |
| feed.json          | OK     | JSON Feed 1.1                    |
| feed-styles.xsl    | OK     | Exists at public/feed-styles.xsl |


### Favicons and Manifest


| Item                    | Status  | Notes                                   |
| ----------------------- | ------- | --------------------------------------- |
| manifest.ts             | OK      | References /icon-192.png, /icon-512.png |
| icon.png                | Unknown | Next.js convention — check src/app/     |
| favicon.ico, apple-icon | Unknown | Manifest references icon-192, icon-512  |
| og-image.png            | OK      | Referenced in layout                    |


### llms.txt and AI Discovery


| File                             | Status  |
| -------------------------------- | ------- |
| llms.txt                         | OK      |
| llms-full.txt                    | OK      |
| **Entity inconsistency**         | **Gap** |
| llm.txt, llms.html, ai.txt, etc. | Missing |


### IndieWeb and Social


| Item                     | Status      |
| ------------------------ | ----------- |
| h-card (layout)          | OK          |
| h-entry (ArticleLayout)  | OK          |
| h-feed                   | Missing     |
| webmention, pingback     | OK          |
| SiteFooter rel="me"      | OK          |
| **SocialPills rel="me"** | **Missing** |
| page.tsx mobile social   | OK          |


### Headings and Semantics


| Item                | Status |
| ------------------- | ------ |
| ArticleLayout title | OK     |
| Homepage h1         | OK     |
| Experiment layouts  | Mixed  |


### Performance and A11y


| Item                   | Status  |
| ---------------------- | ------- |
| prefers-reduced-motion | Partial |
| Security headers       | OK      |
| dns-prefetch           | OK      |
| Security.txt           | OK      |


### Redirects and Canonical


| Item                   | Status |
| ---------------------- | ------ |
| /experiments redirect  | OK     |
| Vercel domain redirect | Done   |
| Canonical host         | OK     |


### Off-Page (Done)

GSC, Bing, IndieLogin, IndieWeb wiki — all configured and verified.

---

## Part 1: Remaining Foundations

### 1.1 Social Link `rel="me"` Verification

**Current state:**

- SiteFooter, layout h-card, and page.tsx mobile links already have `rel="me"`
- SocialPills.tsx (desktop header) uses only `rel="noopener noreferrer"` — missing `rel="me"`

**Code change:** Add `rel="me"` to all three links in [src/components/ui/location/SocialPills.tsx](src/components/ui/location/SocialPills.tsx). Use `rel="me noopener noreferrer"`.

---

### 1.2 Directory Registration and Cross-Links

**Directories:**

- **AI Visibility Directory:** [ai-visibility.org.uk/submit](https://www.ai-visibility.org.uk/submit/) — validates llms.txt and provides dofollow backlinks
- **Creative coding:** CodePen (demos), Awwwards, CSS Design Awards, personal site aggregators

**Cross-linking:**

- Link between articles and experiments
- Use descriptive anchor text (e.g. “velocity-responsive design”)
- Add related-experiment links where relevant

---

## Part 2: Adjacent and Pending SEO Upgrades

### A. robots.txt — llms.txt Reference

**Current:** [src/app/robots.ts](src/app/robots.ts) lists sitemap only.

**Change:** Add explicit Sitemap for llms.txt (or Host + Sitemap). robots.txt can include:

```
Sitemap: https://www.razisyed.cv/sitemap.xml
# Optional: some specs suggest robots can reference llms.txt — not yet standard
```

Robots spec does not define llms.txt; focus on Sitemap. Ensure `/llms.txt` is not disallowed. Current rules allow it.

---

### B. llms.txt — Spec Alignment (AI Visibility v1.1.1)

**Spec:** [ai-visibility.org.uk/specifications/llms-txt](https://www.ai-visibility.org.uk/specifications/llms-txt/)

**Required structure:**

1. H1 heading (project name) as first content
2. Blockquote summary immediately after H1
3. `## Contact` with real contact info (required)

**Current [public/llms.txt](public/llms.txt) gaps:**


| Spec requirement                     | Current                      | Fix                                                 |
| ------------------------------------ | ---------------------------- | --------------------------------------------------- |
| H1 first                             | H1 is first                  | OK                                                  |
| Blockquote after H1                  | Blockquote present           | OK                                                  |
| Contact section                      | Has GitHub, Twitter, Website | Add email or confirm contact details are sufficient |
| Recommended: `## AI Discovery Files` | Missing                      | Add links to sitemap, feed, registry/llms.txt       |
| Recommended: `## What We Do Not Do`  | Missing                      | Add brief exclusions for creative coding scope      |


**Recommended additions (optional but useful for AEO):**

- `## AI Discovery Files` with links to sitemap.xml, feed.xml, llms.txt, registry docs
- Keep under ~50KB and ~100 lines
- Consider [AI Visibility Directory](https://www.ai-visibility.org.uk/submit/) registration for backlinks

**Entity consistency fix:** llms.txt has `Twitter: https://twitter.com/razisyed`; constants and site use `https://x.com/raztronaut`. Align to one — use `https://x.com/raztronaut` in llms.txt for consistency.

---

### B2. AI Discovery Files (AI Visibility Checker)

The [AI Visibility Checker](https://www.ai-visibility.org.uk/) checks 10 files. Current: **llms.txt** ✓ Found; all others Missing.

**Spec:** [AI Visibility Specifications](https://www.ai-visibility.org.uk/specifications/)


| Tier        | Files                                                 | Status                        |
| ----------- | ----------------------------------------------------- | ----------------------------- |
| Essential   | llms.txt, ai.txt                                      | llms.txt done; ai.txt missing |
| Recommended | + ai.json, identity.json, brand.txt, faq-ai.txt       | All missing                   |
| Complete    | + llm.txt, llms.html, developer-ai.txt, robots-ai.txt | All missing                   |


**File-by-file:**


| File             | Purpose               | Priority                            |
| ---------------- | --------------------- | ----------------------------------- |
| llms.txt         | Identity, context     | Done                                |
| llm.txt          | Compatibility variant | Low — 301 redirect to llms.txt      |
| llms.html        | Human-readable HTML   | Optional                            |
| ai.txt           | AI usage permissions  | **Essential**                       |
| ai.json          | Machine AI guidance   | Recommended                         |
| identity.json    | Structured identity   | Recommended — derive from constants |
| brand.txt        | Brand naming          | Recommended                         |
| faq-ai.txt       | Q&A for AI            | Recommended                         |
| developer-ai.txt |                       |                                     |
| robots-ai.txt    | AI crawler directives | Optional                            |


**Order to implement:** ai.txt → llm.txt redirect → identity.json → developer-ai.txt

---

### C. Sitemap — Optional Additions

**Current:** [src/app/sitemap.ts](src/app/sitemap.ts) includes feed.xml, atom.xml. No feed.json or llms.txt.

**Options:**

- Add `feed.json` and `llms.txt` if they’re important for discovery
- Sitemap for llms.txt is non-standard; prioritize in llms.txt’s AI Discovery Files section

---

### D. AEO / AI SEO Enhancements (2025)

**What helps AI citation (studies/reports):**

- **Schema:** 81%+ of cited content uses schema
- **FAQPage:** Strong impact on AI-referred sessions
- **Article + speakable:** Better answer box usage
- **Organization/Person:** Entity clarity for linking

**What’s already done:**

- ItemList, CreativeWork, Person, TechArticle, BreadcrumbList
- Speakable on articles (`cssSelector` for `.p-name`, `.e-content`)

**Optional next steps:**

- **Entity consistency:** Same name/URL/description across site, llms.txt, and third parties (see naming pass below)

---

### E. Canonical Host (www vs apex) — Use Vercel, Not Middleware

**Note:** Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`. For canonical host redirects, do not add middleware/proxy.

**Recommendation:** Use **Vercel Domain redirect** — Dashboard → Project → Domains → `razisyed.cv` → configure redirect:

- If www is canonical (Option A): redirect `razisyed.cv` → `www.razisyed.cv`
- If apex is canonical: redirect `www.razisyed.cv` → `razisyed.cv`

Vercel handles this at the edge; no code changes.

---

### F. Naming Consistency Pass — Razi / Razi Syed / raztronaut

**Goal:** Most visible places show "Razi" (first name only); full name "Razi Syed" and handle "raztronaut" reserved for SEO and structured data. Maintain strong SEO for all three queries.

**Current usage (from codebase scan):**


| Location                                      | Current     | Target                             |
| --------------------------------------------- | ----------- | ---------------------------------- |
| constants.ts `AUTHOR_NAME`                    | Razi Syed   | Keep for schema; add display var   |
| layout metadata (authors, creator, publisher) | Razi Syed   | Razi (visible) — schema stays full |
| ArticleLayout byline                          | AUTHOR_NAME | Razi (display)                     |
| Structured data (Person, author)              | AUTHOR_NAME | Razi Syed + alternateName          |
| Feeds (RSS, atom, feed.json)                  | AUTHOR_NAME | Razi Syed (machine-readable)       |
| llms.txt, identity.json                       | —           | Razi Syed + alternateName          |
| Twitter creator                               | @raztronaut | Keep                               |
| layout keywords                               | Razi Syed   | Add Razi, raztronaut               |
| luma-morphing layout (hardcoded)              | Razi Syed   | Use constant                       |


**SEO strategy for three name variants:**

1. **"Razi Syed"** — Strong (easiest): Full name in schema.org `Person.name`, `givenName` + `familyName`, and `alternateName`. Use in JSON-LD, feeds, llms.txt Contact. Google links full name to entity.
2. **"Razi"** — Harder (common first name): Add `alternateName: ["Razi"]` to Person schema so Google associates "Razi" with your entity. Use "Razi" in visible display (layout metadata `authors`, ArticleLayout byline, maybe homepage). Keywords and page content mentioning "Razi" help.
3. **"raztronaut"** — Medium: Already in `sameAs` (GitHub, Twitter) and `creator: @raztronaut`. Add `alternateName: ["raztronaut"]` to Person schema. Handle appears in social links; schema ties it to the Person entity.

**Implementation:**

- Add to `constants.ts`: `AUTHOR_DISPLAY = "Razi"` (for visible UI), keep `AUTHOR_NAME = "Razi Syed"` (for schema, feeds).
- Extend Person schema: `name: "Razi Syed"`, `givenName: "Razi"`, `familyName: "Syed"`, `alternateName: ["Razi", "raztronaut"]`.
- Layout metadata `authors`, `creator`, `publisher`: use `AUTHOR_DISPLAY` ("Razi") for visible fields if desired, or keep full name — layout metadata is often consumed by crawlers; both work. For human-facing only (e.g. ArticleLayout byline), use "Razi".
- llms.txt, identity.json: full name + alternateName.
- Audit: grep for "Razi Syed", "Razi", "raztronaut" and ensure each surface follows the rule: display = Razi, schema/feeds = Razi Syed + alternateName, social = raztronaut.

---

## Part 3: Implementation Checklist

### Code changes

1. **SocialPills.tsx:** add `rel="me"` to GitHub, X, LinkedIn
2. **llms.txt:** fix Twitter URL (x.com/raztronaut), add AI Discovery Files
3. **globals.css:** add global prefers-reduced-motion
4. **AI Discovery Files:** ai.txt, llm.txt redirect, identity.json, developer-ai.txt
5. **Layout title:** align Experiments vs Experiments Lab
6. **Naming consistency pass:** AUTHOR_DISPLAY ("Razi"), Person alternateName, audit all surfaces
7. **sitemap:** add feed.json (optional)
8. **h-feed:** wrap Writing tab (optional)

### Manual steps

- AI Visibility Directory: submit site

### Ongoing

- Cross-link articles ↔ experiments
- Refresh llms.txt when scope or content changes (e.g. quarterly)

---

## Part 4: Decision Summary


| Decision       | Recommendation                                                               |
| -------------- | ---------------------------------------------------------------------------- |
| llms.txt       | Align with spec, add AI Discovery Files, register in AI Visibility Directory |
| Canonical host | Vercel Domain redirect — Done; no middleware (Next 16 deprecates it)         |
| Naming         | Display "Razi" where visible; schema/feeds "Razi Syed" + alternateName       |


---

## References

- [llms.txt Specification v1.1.1](https://www.ai-visibility.org.uk/specifications/llms-txt/)
- [AI Visibility Specifications](https://www.ai-visibility.org.uk/specifications/)
- [AI Visibility Directory / Checker](https://www.ai-visibility.org.uk/submit/)

