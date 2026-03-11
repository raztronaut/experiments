---
name: publish-content
description: Generate a content constellation (article, lab note, architecture doc, snippet, social content, changelog) for a shipped experiment. Use when publishing an experiment, writing an article, creating experiment documentation, or when the user mentions "content constellation", "publish", or "write article for".
---

# Publish Content

Turn a shipped experiment into a content constellation. Adapted from `.agents/workflows/publish-experiment.md`.

## Prerequisites

- Experiment has `status: "shipped"` (or close)
- Visual output validated
- Read `.agents/contexts/writing-voice.md` before writing

Note: `publishable: true` is the OUTPUT of this workflow, not an input gate.

## Workflow

Copy this checklist and track progress:

```
- [ ] Phase 1: Preparation
- [ ] Phase 2: Article
- [ ] Phase 3: Documentation
- [ ] Phase 4: Social
- [ ] Phase 5: Finalization
```

### Phase 1: Preparation

1. Read all source files: `src/components/experiments/<slug>/` and `src/app/experiments/(<slug>)/`
2. **Verify layout has ThemeProvider.** Check `src/app/experiments/(<slug>)/layout.tsx` for `ThemeProvider` wrapping children, `suppressHydrationWarning` on `<html>`, and `font-canvas antialiased` on `<body>`. Legacy layouts (pre-2026-03) lack these -- modernize to match the `basketball-replay-center` layout pattern before writing article content, or the article will be stuck in light mode.
3. Identify **2-3 most interesting/novel techniques** worth sharing
4. Scaffold content structure:

```bash
npm run new:article
# Enter the experiment slug when prompted
```

This creates 8 files: `article/page.tsx`, `article/content.mdx`, `article/components.tsx`, `docs/lab-note.md`, `docs/architecture.md`, `docs/snippet.md`, `docs/social.md`, `docs/changelog.md`. Auto-sets `content.article: true` in experiment.json.

### Phase 2: Article (Public)

**Audience**: Engineers, designers, creative coders.

5. **Plan demos BEFORE writing.** For each technique from step 3, plan one interactive demo. Complex experiments (3+ techniques) get a progressive series:
   - `Step1Demo` → basic effect only
   - `Step2Demo` → basic + next layer
   - `Step3Demo` → adds another technique
   - `<LiveDemo>` → full experiment at the end

6. **Build demos** in `article/components.tsx` (`"use client"`):
   - For shader/WebGL: Use Canvas 2D or CSS to recreate effects with parameter sliders. No R3F.
   - For DOM/CSS: Import simplified component versions.
   - For animation: Use CSS transitions or Motion for timing/easing concepts.
   - Wrap in `<InteractiveWidget title="...">` for consistent styling.

7. **Wire demos** into `article/page.tsx`:

```tsx
import { Step1Demo, Step2Demo } from "./components";
// In MDXRemote: components={{ ...articleComponents, Step1Demo, Step2Demo }}
```

**CRITICAL**: Do NOT use `import` in MDX files -- `next-mdx-remote` doesn't support it.

8. **Write the article** in `content.mdx` following the structure:
   - **Hook** (1-2 paragraphs): What and why
   - **Basic version** + `<InteractiveWidget>` demo
   - **Enhancement** + demo per technique
   - **Key insight**: The "aha" moment
   - **Full thing**: `<LiveDemo slug="<slug>" height="500px" />`
   - **What I'd do differently**: Honest reflection

9. Fill in `publishedAt` and `description` in MDX frontmatter.

**Quality gate**: Article renders at `/experiments/<slug>/article`.

### Phase 3: Documentation

10. **`docs/lab-note.md`**: Context, what was tried (including dead ends), what worked, reflection, open questions. Internal voice.
11. **`docs/architecture.md`**: Overview, component tree (text diagram), key patterns, data flow, dependencies table, performance notes.
12. **`docs/snippet.md`**: Install command, minimal working example, props/API table, gotchas.
13. **`docs/changelog.md`**: Origin, iterations (versioned), current state, related ideas.

**Quality gate**: All docs populated, no template placeholders remaining.

### Phase 4: Social

14. **`docs/social.md`**: X thread (5-8 tweets):
    - Tweet 1: Hook with visual media
    - Tweets 2-3: Basic version and key technique
    - Tweets 4-5: Non-obvious insight
    - Tweet 6: Full demo link
    - Last: What was learned, article link
15. Also write: launch post (single tweet), one-liner caption (Discord/Slack).

### Phase 5: Finalization

16. Generate OG image: `npm run capture <slug> -- --og` (skip if no dev server).
17. Update `experiment.json`:

```json
{
  "publishable": true,
  "content": {
    "article": true,
    "labNote": true,
    "architecture": true,
    "snippet": true,
    "social": true,
    "changelog": true
  }
}
```

18. Final verification:
    - Article renders with interactive demos
    - All 5 docs populated
    - `components.tsx` has real demos, not placeholders

## Reference Implementation

`basketball-replay-center` is the gold standard -- all 6 content types, progressive Canvas 2D demos (CRT + barrel distortion), full publish workflow executed. Study it before starting.

## Typography Note

Article typography is CSS-first via `experiments.css` (Sylph port). The MDX component map does NOT override heading/paragraph styles -- the CSS handles it.
