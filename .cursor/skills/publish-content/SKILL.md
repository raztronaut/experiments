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

1. Read all source files: `src/components/experiments/<slug>/` (including README, content.ts), `src/app/experiments/(<slug>)/` (including experiment.json, any docs/)
2. **Verify layout has ThemeProvider.** Check `src/app/experiments/(<slug>)/layout.tsx` for `ThemeProvider` wrapping children, `suppressHydrationWarning` on `<html>`, and `font-canvas antialiased` on `<body>`. Legacy layouts (pre-2026-03) lack these -- modernize to match the `basketball-replay-center` layout pattern before writing article content, or the article will be stuck in light mode.
3. **Lens analysis**: Assess what's interesting across all 3 lenses:
   - **Implementation**: novel code patterns, shader techniques, animation systems, architecture decisions
   - **Concept**: conceptual README, cross-disciplinary metaphors, novel UI paradigms, design philosophy
   - **Exploration**: documented iterations, dead ends, pivots, changelog history, open questions
4. **Article Brief (USER INPUT CHECKPOINT)**: Present the lens analysis to the user. Suggest which lenses to emphasize and why. Ask: "What's the story you want to tell? Which lenses matter most? Anything specific?" **Wait for user direction before proceeding.**
5. Scaffold content structure:

```bash
npm run new:article
# Enter the experiment slug when prompted
```

This creates 8 files: `article/page.tsx`, `article/content.mdx`, `article/components.tsx`, `docs/lab-note.md`, `docs/architecture.md`, `docs/snippet.md`, `docs/social.md`, `docs/changelog.md`. Auto-sets `content.article: true` in experiment.json.

### Phase 2: Article (Public)

**Audience**: Engineers, designers, creative coders.

6. **Propose section outline (USER INPUT CHECKPOINT).** Based on user direction from step 4, assemble an outline from the section building blocks in `.agents/contexts/writing-voice.md`:
   - Shared blocks (always): Hook, Full Thing (LiveDemo), Reflection
   - Implementation blocks: Basic Version + Demo, Enhancement + Demo, Key Insight
   - Concept blocks: The Core Idea, Implications / What If, Design Rationale, Broader Connections
   - Exploration blocks: Origin Story, What I Tried, The Pivot, Open Questions

   Present the outline and ask: "Does this capture it? Want to shift emphasis?"

7. **Plan demos matched to sections (USER INPUT CHECKPOINT).** Demo types vary by lens:
   - Implementation sections: Canvas 2D recreations with parameter sliders, progressive layering
   - Concept sections: interactive diagrams, before/after comparisons, parameter spaces, annotated live embeds
   - Exploration sections: side-by-side version comparisons, timeline widgets, expected-vs-actual toggles

   Present the demo plan and ask: "These are the interactive elements I'd build -- any changes?"

8. **Build demos** in `article/components.tsx` (`"use client"`):
   - For shader/WebGL: Use Canvas 2D or CSS to recreate effects with parameter sliders. No R3F.
   - For DOM/CSS: Import simplified component versions.
   - For animation: Use CSS transitions or Motion for timing/easing concepts.
   - For concept sections: Build interactive diagrams, comparison toggles, or parameter space explorers.
   - Wrap in `<InteractiveWidget title="...">` for consistent styling.

9. **Wire demos** into `article/page.tsx`:

```tsx
import { Step1Demo, Step2Demo } from "./components";
// In MDXRemote: components={{ ...articleComponents, Step1Demo, Step2Demo }}
```

**CRITICAL**: Do NOT use `import` in MDX files -- `next-mdx-remote` doesn't support it.

10. **Write the article** in `content.mdx` following the confirmed outline from step 6. Reference `.agents/contexts/writing-voice.md` for voice guidance per lens.

11. Fill in `publishedAt` and `description` in MDX frontmatter.

**Quality gate**: Article renders at `/experiments/<slug>/article`.

### Phase 3: Documentation

12. **`docs/lab-note.md`**: Context, what was tried (including dead ends), what worked, reflection, open questions. Internal voice.
13. **`docs/architecture.md`**: Overview, component tree (text diagram), key patterns, data flow, dependencies table, performance notes.
14. **`docs/snippet.md`**: Install command, minimal working example, props/API table, gotchas.
15. **`docs/changelog.md`**: Origin, iterations (versioned), current state, related ideas.

**Quality gate**: All docs populated, no template placeholders remaining.

### Phase 4: Social

16. **`docs/social.md`**: X thread (5-8 tweets). Lead the thread with whichever lens is strongest:
    - Implementation-heavy: technique hook -> progressive reveal -> demo link -> article link
    - Concept-heavy: provocative question -> the idea explained -> experiment as proof -> article link
    - Exploration-heavy: "I tried X and it failed" -> the pivot -> what worked -> article link
17. Also write: launch post (single tweet), one-liner caption (Discord/Slack).

### Phase 5: Finalization

18. Generate OG image: `npm run capture <slug> -- --og` (skip if no dev server).
19. Update `experiment.json`:

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

20. Final verification:
    - Article renders with interactive demos
    - All 5 docs populated
    - `components.tsx` has real demos, not placeholders

## Reference Implementation

`basketball-replay-center` is the gold standard -- all 6 content types, progressive Canvas 2D demos (CRT + barrel distortion), full publish workflow executed. Study it before starting.

## Typography Note

Article typography is CSS-first via `experiments.css` (Sylph port). The MDX component map does NOT override heading/paragraph styles -- the CSS handles it.
