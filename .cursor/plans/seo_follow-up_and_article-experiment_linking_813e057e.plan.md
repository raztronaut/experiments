---
name: SEO Follow-up and Article-Experiment Linking
overview: Address plop, scripts, and docs that still hardcode author/URL (to stay consistent with SEO changes), and implement article–experiment cross-linking for better SEO and discoverability.
todos: []
isProject: false
---

# SEO Follow-up and Article–Experiment Linking Plan

## Part 1: Plop, Scripts, and Docs Consistency

These files still hardcode author/site values. New experiments and regenerated outputs would diverge from the centralized `constants.ts`.

### 1.1 Plop Template — New Experiments

**[plop-templates/experiment/route-layout.tsx.hbs](plop-templates/experiment/route-layout.tsx.hbs)** hardcodes:

- `metadataBase: new URL("https://www.razisyed.cv")`
- `url: \`[[[[https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``))))
- `canonical: \`[[[[https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``)](https://www.razisyed.cv/experiments/${experiment.slug}\``](https://www.razisyed.cv/experiments/${experiment.slug}\``))))
- `authors: [{ name: "Razi Syed", url: "https://www.razisyed.cv" }]`

**Change:** Import `AUTHOR_NAME`, `SITE_URL` from `@/lib/constants` and use those instead of literals. Plop generates a layout per experiment; the template must use the same constants pattern as existing layouts (e.g. [luma-morphing/layout.tsx](src/app/experiments/(luma-morphing)/layout.tsx)).

---

### 1.2 Scripts — Regenerated Content


| Script                                                                       | Issue                                                                                                                                                | Fix                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **[scripts/generate-llms-txt.mjs](scripts/generate-llms-txt.mjs)**           | `SITE_URL` hardcoded (line 16); Contact has `Twitter: https://twitter.com/razisyed` (line 145) — will overwrite the x.com/raztronaut fix on next run | Read constants via dynamic `import()` (scripts run in Node, so import `../src/lib/constants.ts` or a shared `scripts/lib/constants.mjs` that re-exports values). Update Contact to use `https://x.com/raztronaut`. |
| **[scripts/generate-registry-json.mjs](scripts/generate-registry-json.mjs)** | `ASSET_BASE_URL = "https://www.razisyed.cv"` (line 21)                                                                                               | Import or read from a shared source; use same value as `SITE_URL`.                                                                                                                                                 |
| **[scripts/build-registry.mjs](scripts/build-registry.mjs)**                 | `ASSET_BASE_URL = "https://www.razisyed.cv"` (line 11)                                                                                               | Same as above.                                                                                                                                                                                                     |


**Constraint:** Scripts are `.mjs` (ESM). TypeScript `constants.ts` can be imported via `ts-node` or we create `scripts/lib/site-config.mjs` that exports `SITE_URL` (and optionally other values) so all scripts use a single source. Simpler option: `scripts/lib/site-config.mjs` with `export const SITE_URL = "https://www.razisyed.cv";` and a comment to keep it in sync with `src/lib/constants.ts`, or use a JSON config that both consume.

---

### 1.3 Static AI Discovery Files

**[public/ai.txt](public/ai.txt)**, **[public/identity.json](public/identity.json)**, **[public/developer-ai.txt](public/developer-ai.txt)** are static. They don’t regenerate. If `constants.ts` is the source of truth, options are:

- **A:** Leave them static; document in a README or `.agents/` that these must be updated manually when identity/URL changes.
- **B:** Add a script `generate-ai-discovery.mjs` that writes ai.txt, identity.json, developer-ai.txt from constants (similar to generate-llms-txt), and run it in `generate:all`.

**Recommendation:** Option A for now (low churn). Option B if you want full automation.

---

### 1.4 Documentation

- **README.md**, **package.json** — Reference `razisyed.cv`, author. Low priority; update only if you want consistency in docs.
- **AGENTS.md**, **.cursor/plans/** — No code impact. Optional to align wording.

---

## Part 2: Article–Experiment Linking Plan

### Current State


| Surface                                 | Article → Experiment                        | Experiment → Article                      |
| --------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| ExperimentNav (experiment page)         | —                                           | "View Article" pill (when article exists) |
| ExperimentNav (article page)            | "View Experiment" pill                      | —                                         |
| WritingSection (homepage)               | "View Experiment" pill on each article card | —                                         |
| ExperimentGridCard / ExperimentListItem | —                                           | No "Read article" link                    |
| ArticleLayout                           | Prev/next articles only                     | —                                         |


**Data:** `Article` has `experimentSlug`, `experimentHref`; `Experiment` has optional `related?: string[]` (slugs). `getExperiments()` does not compute `hasArticle`; layouts use `existsSync` for `content.mdx`.

---

### 2.1 Enrich Experiments with `hasArticle`

**File:** [src/lib/experiments.ts](src/lib/experiments.ts)

When building each experiment, check for `article/content.mdx` and add `articleHref: \`/experiments/${slug}/article`(or`hasArticle: true`). This allows experiment cards to show a "Read article" link without extra I/O.

---

### 2.2 Experiment Cards — "Read article" when available

**Files:** [ExperimentGridCard.tsx](src/components/ui/experiments/ExperimentGridCard.tsx), [ExperimentListItem.tsx](src/components/ui/experiments/ExperimentListItem.tsx)

- Extend `Experiment` (or props) with `articleHref?: string`.
- When present, render a "Read article" link (or FileText icon + "Article") with descriptive anchor text: e.g. `Read: {experimentTitle} article` or `Article: {experimentTitle}`.

**UX:** Place next to tech tags or as a secondary CTA. Keep visual hierarchy clear (experiment link primary, article secondary).

---

### 2.3 Article Page — Prominent CTA to Experiment

**File:** [ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx)

ExperimentNav already provides "View Experiment". For better SEO and UX:

- Add an inline CTA above or below the article content, e.g. *"Try the {experimentTitle} experiment"* with a link to `/experiments/${experimentSlug}`.
- Use descriptive anchor text (e.g. "Try the velocity-responsive design experiment" instead of "View experiment").

---

### 2.4 Experiment Page — Strengthen "View Article" CTA

**File:** [ExperimentNav.tsx](src/components/ui/ExperimentNav.tsx)

"View Article" is already present. Optional: use descriptive label such as *"Read: {experimentTitle} article"* if `experimentTitle` can be passed. Currently only `articleSlug` is passed; adding `experimentTitle` would require layout changes.

**Recommendation:** Keep current nav label; the URL and slug are descriptive enough. Optional enhancement: pass `articleTitle` for aria-label / tooltip.

---

### 2.5 Use `related` for Cross-Experiment Links (Optional)

**Schema:** `experiment.json` supports `related: string[]` (slugs). This is not currently rendered.

**Possible addition:**

- **Article side:** "Related experiments" section at bottom, using `related` from the experiment’s `experiment.json`. Link to those experiments (and their articles if they have one).
- **Experiment side:** "Related experiments" in a footer or sidebar.

**Scope:** Implement only if you want cross-experiment discovery. Lower priority than article–experiment links.

---

### 2.6 Structured Data — Article ↔ Experiment

**File:** [src/lib/structured-data.ts](src/lib/structured-data.ts)

`generateArticleJsonLd` produces TechArticle. Add a reference to the experiment’s CreativeWork (e.g. `mainEntity` or `subjectOf`) so crawlers see the relationship. Check schema.org for TechArticle / CreativeWork association.

---

## Implementation Order

1. **Part 1.1** — Plop template (affects all new experiments)
2. **Part 1.2** — Scripts: create shared config, update generate-llms-txt, generate-registry-json, build-registry
3. **Part 2.1** — Enrich `Experiment` with `articleHref`
4. **Part 2.2** — Experiment cards "Read article" link
5. **Part 2.3** — ArticleLayout CTA to experiment
6. **Part 2.6** — JSON-LD article–experiment link (optional)
7. **Part 2.5** — `related` display (optional, lower priority)

---

## Decision: Shared Config for Scripts

Scripts are ESM and cannot directly `import` `.ts` without a loader. Options:

- **A. scripts/lib/site-config.mjs** — Export `SITE_URL`, `AUTHOR_NAME`, etc. Single source for scripts; manually keep in sync with `constants.ts`.
- **B. scripts/lib/read-constants.mjs** — Use `fs.readFileSync` + regex or a simple parser to extract values from `constants.ts`.
- **C. package.json / env** — Store `SITE_URL` in env or package.json `homepage`; scripts read from there.

**Recommendation:** A — explicit, easy to maintain. Add a comment: "Keep in sync with src/lib/constants.ts".