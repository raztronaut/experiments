---
description: Multi-format content generation for publishable experiments
---

# Publish Experiment Workflow

Turn a shipped experiment into a content constellation: public article, internal docs, social assets, and reusable snippets. Each format has a specific audience and purpose.

**Cursor integration:** This workflow is available as a Cursor skill at `.cursor/skills/publish-content/SKILL.md` (auto-discovered by task description). Article-writing context auto-injects via `.cursor/rules/article-writing.mdc` when editing `.mdx` files. The `content-writer` subagent at `.cursor/agents/content-writer.md` can be delegated to for article writing. System overview: `.agents/contexts/content-constellation.md`.

## Prerequisites

- Experiment is `status: "shipped"` (or close)
- Visual output validated (see visual-qa workflow)
- Code is clean and demonstrates interesting techniques
- Read `.agents/contexts/writing-voice.md` before writing anything

Prerequisite is `status: "shipped"`. The workflow's output is the article and documentation files on disk.

## Phase 1: Preparation

1. Read all source files for the experiment (`src/components/experiments/<slug>/` including README, content.ts; `src/app/experiments/(<slug>)/` including experiment.json, any docs/)
2. **Lens analysis**: Assess what's interesting across all 3 article lenses (see `writing-voice.md`):
   - **Implementation**: novel code patterns, shader techniques, animation systems, architecture decisions
   - **Concept**: conceptual README, cross-disciplinary metaphors, novel UI paradigms, design philosophy
   - **Exploration**: documented iterations, dead ends, pivots, changelog history, open questions
3. **Article Brief (USER INPUT CHECKPOINT)**: Present the lens analysis to the user. Suggest which lenses to emphasize and why. Ask: "What's the story you want to tell? Which lenses matter most? Anything specific?" **Wait for user direction before proceeding.**
4. Scaffold the content structure:

```bash
npm run new:article:auto -- --name "<slug>"
# Flags: --name (required), --description (optional)
```

This creates `article/` (page.tsx, content.mdx, components/index.ts) and `docs/` (lab-note.md, architecture.md, snippet.md, social.md, changelog.md). Article existence is detected at runtime via file presence -- no metadata flag needed.

## Phase 2: Article (Public)

**Audience**: Engineers, designers, creative coders. Anyone who might find the technique useful.

**Voice**: First-person, conversational, code-forward. Reference `.agents/contexts/writing-voice.md`.

5. **Propose section outline (USER INPUT CHECKPOINT).** Based on user direction from step 3, assemble an outline from the section building blocks in `writing-voice.md`:
   - Shared blocks (always): Hook, Full Thing (LiveDemo), Reflection
   - Implementation blocks: Basic Version + Demo, Enhancement + Demo, Key Insight
   - Concept blocks: The Core Idea, Implications / What If, Design Rationale, Broader Connections
   - Exploration blocks: Origin Story, What I Tried, The Pivot, Open Questions

   Present the outline and ask: "Does this capture it? Want to shift emphasis?"

6. **Plan interactive demos matched to sections (USER INPUT CHECKPOINT).** Demo types vary by lens:
   - Implementation sections: Canvas 2D recreations with parameter sliders, progressive layering
   - Concept sections: interactive diagrams, before/after comparisons, parameter spaces, annotated live embeds
   - Exploration sections: side-by-side version comparisons, timeline widgets, expected-vs-actual toggles

   Present the demo plan and ask: "These are the interactive elements I'd build -- any changes?"

**Important**: The `# Title` h1 in the MDX IS the visual page title. The layout header only shows a small metadata line — all visual hierarchy comes from the MDX content itself.

7. Build the demo components in `article/components/` (one `"use client"` file per demo), then wire them into `article/page.tsx`:
   - Create each demo as `article/components/DemoName.tsx`. Extract shared math/drawing helpers to `article/components/utils.ts`. Re-export all demos from `article/components/index.ts`.
   - Target 200 lines per file, hard limit 300.
   - Import in `page.tsx`: `import { Step1Demo, Step2Demo } from "./components";`
   - Merge into the MDXRemote components prop: `components={{ ...articleComponents, Step1Demo, Step2Demo }}`
   - Use directly in `content.mdx`: `<InteractiveWidget title="..."><Step1Demo /></InteractiveWidget>`
   - **Do NOT use `import` statements inside .mdx files** — `next-mdx-remote` does not support them.

   How to build the demos:
   - For **shader/WebGL experiments**: Use Canvas 2D or CSS to create simplified 2D versions of each effect layer. Use `<Range>`, `<Checkbox>`, `<Switch>` from `src/components/mdx/controls/` for parameter controls (not raw `<input>` elements). No R3F Canvas needed.
   - For **DOM/CSS experiments**: Import simplified versions of the actual components.
   - For **animation experiments**: Use CSS transitions or Motion to show the timing/easing concepts.
   - For **concept sections**: Build interactive diagrams, `<BeforeAfterImage>` for comparisons, `<Slideshow>` for multi-step visual explanations, or parameter space explorers.
   - Use compound `<InteractiveWidget>` with `layout="sidebar"` for demos that have controls: `<InteractiveWidget.Preview>` + `<InteractiveWidget.Controls>`. Use simple `<InteractiveWidget title="...">` for plain demos.
   - Use `<Details>` for collapsible supplementary content, `<Fullbleed>` for full-width hero breakouts, `<Pill>` for inline status badges.
   - Use `<SandpackDemo>` only for self-contained code that benefits from live editing (CSS tricks, small React components — NOT full WebGL setups).

8. Write the article in `content.mdx` following the confirmed outline from step 5. Reference `.agents/contexts/writing-voice.md` for voice guidance per lens.

9. Fill in the `publishedAt` and `description` fields in the MDX frontmatter.

10. Verify the article renders: visit `/experiments/<slug>/article` in the dev server.

## Phase 3: Documentation (Internal + Shareable)

**Audience**: Future you, collaborators, anyone evaluating the code.

11. **`docs/lab-note.md`**: What was learned. What didn't work. Decisions made and why. Include dead ends — they're useful context. Internal voice, stream-of-consciousness is fine.

12. **`docs/architecture.md`**: Terse technical overview. Component tree as text diagram. Key patterns as bullet list. Dependencies as table. Performance notes if relevant.

13. **`docs/snippet.md`**: The reusable extract. One install command, one minimal working example. Props/API as table. Gotchas in notes. Ready to copy-paste into another project.

14. **`docs/changelog.md`**: Idea lineage. Where it came from (tweet, conversation, reference), how it evolved through iterations, current state.

## Phase 4: Social Content

**Audience**: Twitter/X followers, Discord communities, LinkedIn.

15. **`docs/social.md`**: Write an X thread (5-8 tweets). Lead the thread with whichever lens is strongest:
    - Implementation-heavy: technique hook -> progressive reveal -> demo link -> article link
    - Concept-heavy: provocative question -> the idea explained -> experiment as proof -> article link
    - Exploration-heavy: "I tried X and it failed" -> the pivot -> what worked -> article link
    - No hashtags unless genuinely useful. No "🧵" thread emoji.

16. Write a launch post (single tweet), a one-liner caption (Discord/Slack), and an optional LinkedIn post.

## Phase 5: Finalization

17. Generate OG image: `npm run capture <slug> -- --og` for screenshot-based OG, or verify the dynamic `/api/og` route works with the experiment title. (Skip if no dev server available.)

18. Verify all content:
    - Article renders at `/experiments/<slug>/article`
    - All docs files are populated (no template placeholders remaining)
    - `article/components/` has real interactive demos (one per file), not placeholder divs

## Styling Notes

The article uses Sylph-style typography via CSS rules in `experiments.css`. The `articleComponents` MDX map intentionally does NOT override heading sizes, paragraph colors, or list styles — the CSS handles all of that. Do not add Tailwind typography overrides to the MDX component map.

## Quick Reference

| Format | File | Audience | Voice |
|--------|------|----------|-------|
| Article | `article/content.mdx` | Public | RNDR Realm + Maxime Heckel (see writing-voice.md) |
| Lab Note | `docs/lab-note.md` | Internal | Honest, reflective |
| Architecture | `docs/architecture.md` | Engineers | Terse, technical |
| Snippet | `docs/snippet.md` | Developers | Copy-paste ready |
| Social | `docs/social.md` | Twitter/X | Punchy, progressive reveal |
| Changelog | `docs/changelog.md` | Internal | Chronological, factual |
