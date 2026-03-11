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

Note: `publishable: true` is the OUTPUT of this workflow (set in step 17), not an input gate. Prerequisite is `status: "shipped"`, output is `publishable: true`.

## Phase 1: Preparation

1. Read all source files for the experiment (`src/components/experiments/<slug>/`, `src/app/experiments/(<slug>)/`)
2. Identify the **2-3 most interesting/novel techniques** worth sharing
3. Scaffold the content structure:

```bash
npm run new:article:auto -- --name "<slug>"
# Flags: --name (required), --description (optional)
```

This creates `article/` (page.tsx, content.mdx, components.tsx) and `docs/` (lab-note.md, architecture.md, snippet.md, social.md, changelog.md).

## Phase 2: Article (Public)

**Audience**: Engineers, designers, creative coders. Anyone who might find the technique useful.

**Voice**: First-person, conversational, code-forward. Reference `.agents/contexts/writing-voice.md`.

4. Open `article/content.mdx`. The scaffolded file has an MDX comment listing all available components and the article structure. Follow it.

**Important**: The `# Title` h1 in the MDX IS the visual page title. The layout header only shows a small metadata line — all visual hierarchy comes from the MDX content itself.

5. Write the article following the structure in writing-voice.md:
   - **Hook**: 1-2 paragraphs. What it is, why it's interesting.
   - **Basic version**: Simplest working code. Show it, explain it.
   - **Enhancement**: Layer on the key technique step by step.
   - **Key insight**: The non-obvious part. The "aha" moment.
   - **Full thing**: Embed the live experiment with `<LiveDemo slug="<slug>" height="500px" />`.
   - **What I'd do differently**: Honest reflection, dead ends, trade-offs.

6. **Plan interactive demos BEFORE writing content.** For each major technique identified in step 2, plan one interactive demo component. Complex experiments (3+ techniques) should have a progressive series where each demo adds one layer:
   - `Step1Demo` → basic effect only (e.g., just scanlines)
   - `Step2Demo` → basic + next layer (e.g., scanlines + noise + vignette)
   - `Step3Demo` → adds the next technique (e.g., barrel distortion)
   - `<LiveDemo>` → the full experiment at the end

   Each demo should have sliders/controls for the parameters introduced in that section.

7. Build the demo components in `article/components.tsx`, then wire them into `article/page.tsx`:
   - Import the components in `page.tsx`: `import { Step1Demo, Step2Demo } from "./components";`
   - Merge into the MDXRemote components prop: `components={{ ...articleComponents, Step1Demo, Step2Demo }}`
   - Use directly in `content.mdx`: `<InteractiveWidget title="..."><Step1Demo /></InteractiveWidget>`
   - **Do NOT use `import` statements inside .mdx files** — `next-mdx-remote` does not support them.

   How to build the demos:
   - For **shader/WebGL experiments**: Use Canvas 2D or CSS to create simplified 2D versions of each effect layer with parameter sliders. No R3F Canvas needed.
   - For **DOM/CSS experiments**: Import simplified versions of the actual components.
   - For **animation experiments**: Use CSS transitions or Motion to show the timing/easing concepts.
   - Wrap all demos in `<InteractiveWidget title="...">` for consistent styling.
   - Use `<SandpackDemo>` only for self-contained code that benefits from live editing (CSS tricks, small React components — NOT full WebGL setups).

8. Fill in the `publishedAt` and `description` fields in the MDX frontmatter.

9. Verify the article renders: visit `/experiments/<slug>/article` in the dev server.

## Phase 3: Documentation (Internal + Shareable)

**Audience**: Future you, collaborators, anyone evaluating the code.

10. **`docs/lab-note.md`**: What was learned. What didn't work. Decisions made and why. Include dead ends — they're useful context. Internal voice, stream-of-consciousness is fine.

11. **`docs/architecture.md`**: Terse technical overview. Component tree as text diagram. Key patterns as bullet list. Dependencies as table. Performance notes if relevant.

12. **`docs/snippet.md`**: The reusable extract. One install command, one minimal working example. Props/API as table. Gotchas in notes. Ready to copy-paste into another project.

13. **`docs/changelog.md`**: Idea lineage. Where it came from (tweet, conversation, reference), how it evolved through iterations, current state.

## Phase 4: Social Content

**Audience**: Twitter/X followers, Discord communities, LinkedIn.

14. **`docs/social.md`**: Write an X thread (5-8 tweets):
    - Tweet 1: Hook with visual media (video/gif of the experiment)
    - Tweet 2-3: The basic version and key technique
    - Tweet 4-5: The non-obvious insight
    - Tweet 6: Full demo link
    - Last: What was learned, link to article
    - No hashtags unless genuinely useful. No "🧵" thread emoji.

15. Write a launch post (single tweet), a one-liner caption (Discord/Slack), and an optional LinkedIn post.

## Phase 5: Finalization

16. Generate OG image: `npm run capture <slug> -- --og` for screenshot-based OG, or verify the dynamic `/api/og` route works with the experiment title. (Skip if no dev server available.)

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

18. Verify all content:
    - Article renders at `/experiments/<slug>/article`
    - All docs files are populated (no template placeholders remaining)
    - `article/components.tsx` has real interactive demos, not placeholder divs

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
