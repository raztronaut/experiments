---
name: V2 Quality Gap Fix
overview: "The restoration was structurally successful (all verification commands pass, 40/40 tests), but falls short of S-tier. Four systemic gaps: (1) article pages have broken theme + no real typography, (2) articles are completely undiscoverable -- zero navigation paths, (3) the AI-native publish workflow has never been tested end-to-end, (4) polish and consistency gaps. This plan fixes everything to match the Sylph reference bar and validates the full AI agent workflow."
todos:
  - id: fix-css-tokens
    content: Extract CSS custom properties (:root/.dark) into shared-tokens.css, import in both globals.css and experiments.css. Fixes broken theme on all experiment routes including articles.
    status: completed
  - id: article-typography
    content: "Port Sylph's article styling directly: main.css typography rules, dual-theme code blocks, line numbers, inline code pills, staggered fade-in animations, TOC highlight. Replace dead `article-prose` class. Goal is visual parity with Sylph."
    status: completed
  - id: article-discovery
    content: "Wire article navigation: badge on cards/list items, 'Read Article' in drawer + experiment pages, article URLs in sitemap. Populate `content` field in experiment.json. Wire getArticles() into at least one surface."
    status: completed
  - id: ai-workflow-test
    content: "End-to-end test of the AI-native publish workflow on a second experiment: scaffold article via plop, generate all content formats (article, lab-note, architecture, snippet, social, changelog) following publish-experiment workflow + writing-voice context. Validates the entire V2 AI-native content pipeline."
    status: completed
  - id: commit-git-cleanup
    content: git rm 79 .agents/ files + orphan rule + eslint.config.mjs. Delete 2 orphan V1 plop templates. Commit.
    status: completed
  - id: fix-scripts-config
    content: Add optimize:videos npm script. Tighten validate-experiments.mjs (created date, tags/tech arrays, content field). Remove ignoreBuildErrors from next.config.ts. Add metadataBase to experiment layouts.
    status: completed
  - id: article-polish
    content: Prev/next article navigation + breadcrumb. Mobile TOC solution. View transition morph improvements.
    status: completed
isProject: false
---

# V2 Quality Gap Fix Plan

## Corrections From Previous Audit

Several claims in the previous audit were **wrong**. Corrected here:


| Previous Claim                                       | Reality                                                                                                                                                                                                  | Impact                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| "`public/experiments/no-preview.gif` does not exist" | **It DOES exist** (14KB, created Dec 2025). The plopfile's copy step works fine.                                                                                                                         | Remove from fix list                                                            |
| "`article/page.tsx` template has hardcoded path"     | The **plop template** correctly uses `\{{dashCase name}}` (dynamic Handlebars). Only the **manually-authored** send-button article has a hardcoded path because it was hand-written, not plop-generated. | Not a template bug; just means send-button's article wasn't scaffolded via plop |
| "2 orphan plop templates should be deleted"          | `plop-templates/experiment/route-page.tsx.hbs` and `component.tsx.hbs` at root level ARE orphans -- the V2 plopfile uses profile-specific templates exclusively. But they're harmless V1 artifacts.      | Low priority cleanup                                                            |
| "generate-registry.mjs hardcodes CDN URL"            | `ASSET_BASE_URL = "https://www.razisyed.cv"` is hardcoded. This is the production URL and correct, but not configurable for staging/preview deploys.                                                     | Nice-to-have, not a bug                                                         |


---

## The Big Picture: What V2 Was Supposed To Be

Reading back through [the initial V2 conversation](cbc224bb) and [the ideation session](a30ca44f), the user's vision is clear:

> **"AI agents are the primary builders -- everything should make agents more effective, not just humans."**

The V2 upgrade was never just about tooling. It was about building a **system** where:

1. An AI agent scaffolds an experiment with `npm run new:experiment` (profile-aware, toolkit pre-wired, dev metrics injected)
2. The agent develops it using profiles, rules, and skills that load contextually (minimal token overhead)
3. The agent validates visually using capture scripts, console metrics, and scene inspection
4. The agent publishes by following the `publish-experiment.md` workflow -- generating a full "content constellation" (article, lab note, architecture, snippet, social, changelog) in the RNDR Realm voice
5. The content is **automatically discoverable** -- articles appear in navigation, sitemap, OG images, social cards

**What actually works today**: Steps 1-3 are structurally complete. Step 4 has all the infrastructure (templates, workflow doc, writing voice) but has **never been tested end-to-end by an AI agent**. Step 5 is completely missing -- zero discovery paths exist.

The entire AI-native content pipeline -- the crown jewel of V2 -- has never been exercised. This plan fixes that.

---

## Critical Finding 1: Article Pages Have Broken Theme + No Typography

The article at `/experiments/send-button/article` inherits the experiment layout which imports only [experiments.css](src/app/experiments/experiments.css). That file contains **only** Tailwind directives + a `@view-transition` rule -- 7 lines total. The CSS custom property definitions (`--background`, `--foreground`, `--muted-foreground`, `--border`, etc.) live exclusively in [globals.css](src/app/(main)/globals.css), imported only by the `(main)` route group.

**Result**: Every `hsl(var(--background))` / `hsl(var(--foreground))` reference on experiment pages (including articles) resolves to invalid/empty values. The send-button experiment works visually because it has its own `ThemeProvider` that injects class-based dark mode, but the article inherits this without any token definitions. Additionally, the `article-prose` class on the `<article>` element in [ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx) has **zero CSS definition** -- it's dead markup.

**Compared to [Sylph](https://next-sylph-portfolio.vercel.app/)**:

- Sylph hand-crafts article typography: consistent 24px vertical rhythm, lobotomized-owl `margin-top` only, specific `h1 + h2` / `h1 + p` spacing rules
- Dual-theme code blocks (`github-light` + `github-dark`) that switch via CSS variables
- Line numbers via CSS counters, highlight-on-click for TOC headings, staggered fade-in animations
- `text-wrap: pretty`, `font-variant-ligatures: common-ligatures`, custom scrollbar, selection colors
- Despite having `@tailwindcss/typography` installed, Sylph does NOT use `prose` classes -- all article styling is hand-crafted

### Fix: Port Sylph's Article Styling

**Goal: visual parity with [Sylph](https://next-sylph-portfolio.vercel.app/).** Port its CSS and component patterns directly from [the repo](https://github.com/raphaelsalaja/sylph) (MIT licensed). Adapt to fit our design tokens and existing component structure.

**A. Shared CSS tokens** -- Extract the `:root` / `.dark` custom property block from `globals.css` into a shared file. Import in both `globals.css` and `experiments.css`. All routes get valid theme variables.

**B. Port Sylph's `styles/main.css` article rules** -- Bring over directly:

- 24px vertical rhythm (lobotomized owl, top-margin only)
- Heading-to-paragraph coupling (`h1 + h2` = 4px, `h1/h2 + p` = 8px, `p + h1` = 48px)
- 14px base font, 21px line-height, `-0.09px` letter-spacing
- `text-wrap: pretty`, `font-variant-ligatures`, `text-rendering: optimizelegibility`
- Custom scrollbar, themed selection colors
- Code block styling: `<figure>` wrapper with border-radius, line numbers via CSS counters, inline `<code>` as keyboard-style pills
- Adapt Radix color references to our existing HSL design tokens
- Kill dead `article-prose` class, use real `article` element selectors

**C. Port dual-theme code blocks** -- `rehype-pretty-code` with `theme: { light: "github-light", dark: "github-dark" }`, `keepBackground: false`. Port Sylph's CSS switching (`--shiki-light`/`--shiki-dark` variables). Remove hardcoded `bg-[#0d1117]` from CodeBlock.

**D. Port TOC highlight** -- Sylph's `data-highlight` pattern on heading click (yellow flash via CSS `::before`, 2s transition).

**E. Port staggered fade-in entrances** -- Spring-physics animations (`opacity`, `y`, `blur`) with `staggerChildren` using framer-motion (already installed).

**F. Add prev/next article navigation** -- Port Sylph's `post-navigation` pattern for linking between articles. Add breadcrumb on article pages.

---

## Critical Finding 2: Articles Are Completely Undiscoverable

[getArticles()](src/lib/articles.ts) is **dead code** -- defined but never imported anywhere in the codebase. There is zero navigation to articles:

- **Homepage**: No article section. No article indicators on experiment cards or list items.
- **Experiment preview drawer**: No "Read Article" button. Even send-button's drawer has no link.
- **Experiment detail pages**: No link to the article. ExperimentBackButton only goes home.
- **Sitemap**: [sitemap.ts](src/app/sitemap.ts) only includes experiment URLs, not article URLs.
- **No article index/listing page** exists.

The **only** way to reach `/experiments/send-button/article` is by manually typing the URL.

The article page itself has a "Back to experiment" link -- so navigation FROM article TO experiment works. But the reverse direction is a dead end.

### Fix

**A. Populate `content` field** -- Set `"content": { "article": true }` in send-button's `experiment.json`. This field exists in the TypeScript interface but no experiment uses it.

**B. Article badge on cards** -- In [ExperimentGridCard.tsx](src/components/ui/experiments/ExperimentGridCard.tsx) and [ExperimentListItem.tsx](src/components/ui/experiments/ExperimentListItem.tsx), show a small article icon/badge when `experiment.content?.article === true`.

**C. "Read Article" in drawer** -- In [ExperimentPreviewDrawer.tsx](src/components/ui/experiments/ExperimentPreviewDrawer.tsx), add a link to `/experiments/${slug}/article` when the experiment has an article.

**D. Article link on experiment pages** -- Add a small "Read the article" link somewhere accessible from the experiment page (e.g., in the layout, near the back button, or as a floating element).

**E. Sitemap** -- In [sitemap.ts](src/app/sitemap.ts), import and call `getArticles()`, add article URLs alongside experiment URLs.

**F. Future: Homepage article section** -- When more articles exist, add a "Writing" section to the homepage using `getArticles()`. Infrastructure is ready, just needs the UI.

---

## Critical Finding 3: AI-Native Publish Workflow Never Tested

This is the **most important gap**. The entire V2 vision was "AI agents are the primary builders" and "publishable by default." The infrastructure is all there:

- [publish-experiment.md](/.agent/workflows/publish-experiment.md) -- comprehensive 5-phase workflow
- [writing-voice.md](/.agent/contexts/writing-voice.md) -- RNDR Realm voice guide
- `npm run new:article` -- scaffolds article/ + docs/ directories
- [ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx) -- two-column article layout
- [articleComponents](src/components/mdx/components.tsx) -- MDX component map
- Plop templates for all 8 content files

But **none of this has ever been tested end-to-end by an AI agent**. The one existing article (send-button) was manually authored during the restoration pass, not generated via the workflow.

### Fix: AI Workflow End-to-End Test

After fixing the theme/typography/discovery issues, test the full publish pipeline on a SECOND experiment (e.g., `keyboard-keys` or `mountain-transition`):

1. **Scaffold**: Run `npm run new:article` for the chosen experiment
2. **Generate article**: Follow Phase 2 of `publish-experiment.md` -- read the experiment source, identify key techniques, write `content.mdx` in the RNDR Realm voice per `writing-voice.md`
3. **Generate docs**: Follow Phase 3 -- write all 5 docs files (lab-note, architecture, snippet, social, changelog)
4. **Finalize**: Follow Phase 5 -- update `experiment.json` with `content` field, verify article renders at the correct URL with proper typography
5. **Verify navigation**: Confirm the article appears in the drawer, on cards, and in the sitemap

This validates that the entire AI-native content pipeline works smoothly. If there are friction points (confusing workflow steps, missing context, broken rendering), fix them.

### What "smooth" looks like

The publish workflow should be something an AI agent can execute start-to-finish with **zero blockers and zero ambiguity**. Currently:

- The `publish-experiment.md` workflow references `writing-voice.md` but doesn't specify exactly how to use it (inject as system context? read before writing?)
- The article template's content structure matches the writing voice guide -- good
- The plop article template generates a correct dynamic path (Handlebars `\{{dashCase name}}`)
- The send-button article was hand-written and has a hardcoded path -- future articles scaffolded via plop won't have this issue

---

## Finding 4: Script/Automation Gaps

### Scripts that work correctly:

- `npm run new:experiment` -- 7 profiles, all templates exist, generates V2 experiment.json with profile/status/tags/tech
- `npm run new:article` -- scaffolds 8 files (article/ + docs/), validates experiment exists first
- `npm run delete:experiment` -- interactive deletion of all experiment files (route, components, public, registry)
- `npm run capture` -- Playwright screenshot with `--delay`, `--scroll`, `--viewport`, `--full-page`, `--og`
- `npm run validate:experiments` -- validates required fields + status/profile enums
- `npm run generate:registry` -- shadcn-compatible registry JSON
- `npm run generate:posters` -- ffmpeg poster extraction from video
- Default preview copy (`no-preview.gif`) -- **works correctly** (file exists at 14KB)

### Gaps to fix:

1. `**scripts/optimize-videos.mjs` has no npm script** -- exists but undiscoverable. Add `"optimize:videos": "node scripts/optimize-videos.mjs"`.
2. `**validate-experiments.mjs` is too lenient** -- Only validates `title`, `description`, `slug` (required) + `status`/`profile` (optional enums). Does NOT validate: `created` (date format), `tags`/`tech` (array type), `content` (object structure). The publish workflow references `publishable` and `content` fields that aren't validated.
3. **79 `.agents/` files still tracked in git** -- deleted from disk but never committed. Along with orphan rule file and `eslint.config.mjs`. Need one cleanup commit.
4. **2 orphan V1 plop templates** -- `plop-templates/experiment/route-page.tsx.hbs` and `plop-templates/experiment/component.tsx.hbs` at root level are unreferenced by the V2 plopfile (it uses profile-specific templates). Low priority but should be cleaned up.

---

## Additional Issues (from initial audit, still valid)

- `**metadataBase` missing on experiment layouts** -- 18 experiment layouts export `metadata` without `metadataBase`, causing build warnings. The `(main)` layout has `metadataBase: new URL("https://www.razisyed.cv")` but experiment layouts don't. Plop template also lacks it.
- `**ignoreBuildErrors: true` in [next.config.ts](next.config.ts)** -- Silently masks type regressions at build time. `tsc --noEmit` passes clean and runs in CI, so this is a false safety net.
- `**framer-motion` vs `motion/react`** -- 23 source files use old import path. Both work (v12+), but inconsistent with documented standard in AGENTS.md and toolkit.md. Not blocking.
- **View transition morph doesn't morph** -- `view-transition-name` values on cards (`experiment-media-${slug}`) have no matching elements on experiment pages. Only browser-default crossfade occurs. No `::view-transition-`* CSS customization.

---

## Implementation Phases

### Phase A: Make Articles Look Like Sylph

1. Create shared CSS tokens file, import in both route groups (fixes broken theme on experiment routes)
2. Port Sylph's `styles/main.css` article typography rules (vertical rhythm, spacing, font settings)
3. Port dual-theme code blocks (`{ light, dark }` + CSS switching + line numbers + inline code pills)
4. Kill dead `article-prose` class, replace with real `article` element selectors
5. Remove hardcoded `bg-[#0d1117]` from CodeBlock, let theme handle it
6. Port TOC heading highlight animation
7. Port staggered fade-in entrance animations

### Phase B: Make Articles Discoverable

1. Populate `content` field in send-button's experiment.json
2. Article badge/indicator on ExperimentGridCard + ExperimentListItem
3. "Read Article" link in ExperimentPreviewDrawer
4. Article link accessible from experiment pages
5. Article URLs in sitemap
6. Prev/next article navigation + breadcrumb on article pages

### Phase C: Test the AI-Native Publish Workflow

1. Scaffold article for a second experiment via `npm run new:article`
2. Follow `publish-experiment.md` end-to-end: generate article content (RNDR Realm voice), lab note, architecture, snippet, social, changelog
3. Verify article renders with Sylph-quality theme, typography, code blocks
4. Verify discovery works (badge appears, drawer links, sitemap updated)
5. Fix any friction points in the workflow

### Phase D: Cleanup + Harden

1. `git rm` 79 `.agents/` files + orphan rule + `eslint.config.mjs` and commit
2. Delete 2 orphan V1 plop templates
3. Add `optimize:videos` npm script
4. Tighten `validate-experiments.mjs` (arrays, dates, content field)
5. Remove `ignoreBuildErrors: true` from next.config.ts
6. Add `metadataBase` to experiment layout plop template
7. View transition morph improvements (matching names + CSS customization)
8. Mobile TOC solution (currently hidden below `xl` with no alternative)

