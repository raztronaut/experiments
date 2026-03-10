---
description: Writing voice and content structure for experiment articles and documentation
---

# Writing Voice

> Two references define the voice for this lab:
> - [RNDR Realm's Gooey Dropdown](https://blog.rndrealm.com/gooey-dropdown) — conversational, process-oriented, code-forward
> - [Maxime Heckel's shader articles](https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/) — deep technical walkthroughs with interactive demos, progressive complexity, and playable code
>
> Every piece of content should sound like it was written by someone who builds things for a living, not someone writing about building things. And where the technique is visual or parametric, readers should be able to *play with it* inline.

## Voice Characteristics

- **First-person, conversational**: "I posted this on Twitter" / "I figured I'd write about it" / "a few people asked how I built it"
- **Process-oriented**: walk through building step-by-step, not just present the final result
- **Casual confidence**: "Nothing fancy here" / "That's it" / "It already looks pretty good on its own"
- **Short paragraphs**: rarely more than 3 sentences per block
- **Code-forward**: every section shows real code, then explains what it does and *why*
- **Progressive disclosure**: basic version first, then layer complexity
- **Interactive where possible**: use `<SandpackDemo>` for editable code, `<InteractiveWidget>` for parameter sliders/visualizers, `<LiveDemo>` for full experiment embeds
- **Trade-off explanations**: "If you animate all the properties at the same time it feels stiff"
- **No filler**: every sentence earns its place
- **No AI fingerprints**: never say "let's dive in," "in this article we'll explore," "without further ado," "it's worth noting that"

## Anti-Patterns

- Don't over-explain obvious code. If the variable name says what it does, move on.
- Don't hedge. Say "this works" not "this should work" or "this might help."
- Don't summarize what you're about to say. Just say it.
- Don't use em-dashes for drama. Use them for parenthetical info only.
- Don't structure as FAQ. Structure as narrative.
- Don't write walls of text between code blocks. Short explanation, then code, then short explanation.

---

## Article Structure

1. **Hook** (1-2 paragraphs): What it is and why it's interesting. Mention where it came from if there's a story.
2. **Basic version** + interactive demo: Simplest working concept. Show code, explain it, and give readers an interactive widget to play with just this one layer.
3. **Enhancement** + interactive demo: Layer on the next technique. Show code, explain, and provide a demo that adds this layer on top of the previous one.
4. **Repeat for each major technique**: Each section gets its own demo that progressively builds the full effect. Readers experience the same build-up you did.
5. **Key insight**: The non-obvious part. The "aha" moment.
6. **Full thing**: `<LiveDemo slug="..." />` embedding the complete experiment.
7. **What I'd do differently**: Honest reflection. Dead ends, trade-offs, future ideas.

### Progressive demo pattern (critical for complex experiments)

For experiments with 3+ interesting techniques, build a **series of interactive demos** in `article/components.tsx` where each one adds one layer to the previous:

```
Step1Demo  → shows only the basic effect (e.g., scanlines)
Step2Demo  → adds the next layer (e.g., scanlines + noise + phosphor)
Step3Demo  → adds the next layer (e.g., barrel distortion)
...
<LiveDemo> → the full experiment with everything
```

Each demo should have sliders/controls for the parameters introduced in that section. Readers can see exactly what each layer contributes by tweaking its parameters in isolation, then see how it compounds in later demos.

For simple experiments (1-2 techniques), a single interactive widget is fine. For complex ones (shaders, physics, multi-phase animations), plan one demo per major section.

### When to use each interactive component

- **`<InteractiveWidget>`**: The primary tool. Build custom React components in `article/components.tsx` with Canvas 2D, CSS, or simplified renderings. Wrap in `<InteractiveWidget title="...">`. Use for every major technique section.
- **`<SandpackDemo>`**: When readers benefit from editing code and seeing results. Best for self-contained techniques (a single shader, a CSS trick, a small React component). Runs in-browser via CodeSandbox's bundler.
- **`<LiveDemo>`**: The full experiment with all its dependencies. Embeds via iframe. Use once, at the end, for the "full thing" section.

---

## Content Format Templates

### Lab Note
Internal. Stream-of-consciousness is fine. Sections: Context, What I Tried, What Worked, What I'd Do Differently, Open Questions.

### Architecture
For engineers. Terse. Sections: Overview (1 paragraph), Component Tree (text diagram), Key Patterns (bullet list), Data Flow, Dependencies (table), Performance Notes.

### Snippet
For copy-paste. Sections: Install (one command), Usage (minimal working example), Props/API (table), Notes (gotchas).

### Social (X Thread)
5-8 tweets. Progressive reveal — each tweet adds a layer. Tweet 1 is the hook with media. Last tweet links to the article. No hashtags unless they're genuinely useful.

### Changelog
Idea lineage. Where it came from, how it evolved. Sections: Origin, Iterations (versioned), Current State, Related Ideas.
