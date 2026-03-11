---
description: Writing voice, article lenses, section building blocks, and content format templates
---

# Writing Voice

> Two references define the voice for this lab:
> - [RNDR Realm's Gooey Dropdown](https://blog.rndrealm.com/gooey-dropdown) — conversational, process-oriented, code-forward
> - [Maxime Heckel's shader articles](https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/) — deep technical walkthroughs with interactive demos, progressive complexity, and playable code
>
> Every piece of content should sound like it was written by someone who builds things for a living, not someone writing about building things. And where the technique is visual or parametric, readers should be able to *play with it* inline.

## Voice Characteristics

These apply to **all** article lenses — implementation, concept, and exploration alike.

- **First-person, conversational**: "I posted this on Twitter" / "I figured I'd write about it" / "a few people asked how I built it"
- **Process-oriented**: walk through the thinking, not just present the final result
- **Casual confidence**: "Nothing fancy here" / "That's it" / "It already looks pretty good on its own"
- **Short paragraphs**: rarely more than 3 sentences per block
- **Progressive disclosure**: basic version first, then layer complexity
- **Interactive where possible**: use `<SandpackDemo>` for editable code, `<InteractiveWidget>` for parameter sliders/visualizers/diagrams, `<LiveDemo>` for full experiment embeds
- **Trade-off explanations**: "If you animate all the properties at the same time it feels stiff"
- **No filler**: every sentence earns its place
- **No AI fingerprints**: never say "let's dive in," "in this article we'll explore," "without further ado," "it's worth noting that"

## Anti-Patterns

- Don't over-explain obvious code. If the variable name says what it does, move on.
- Don't hedge. Say "this works" not "this should work" or "this might help."
- Don't summarize what you're about to say. Just say it.
- Don't use em-dashes for drama. Use them for parenthetical info only.
- Don't structure as FAQ. Structure as narrative.
- Don't write walls of text between code blocks or between ideas. Short explanation, then evidence (code, diagram, demo), then short explanation.

---

## Article Lenses

Every article draws from three lenses in whatever proportion fits the experiment. These are **blendable dimensions**, not exclusive categories. Most articles lead with one lens and weave in the others.

| Lens | Asks | Leads with |
|------|------|------------|
| **Implementation** | How does it work? | Code, technique layering, progressive demos |
| **Concept** | Why does the idea matter? | Design rationale, analogies, "what if" framing |
| **Exploration** | What was the journey? | Dead ends, pivots, decisions, honest uncertainty |

A `velocity-responsive-design` article might be mostly concept (kinetic intent, cognitive bandwidth) with implementation sections for key code and a brief exploration of what didn't work. A `404-not-found` article is mostly implementation (wave deformation, dual-face shader) with a concept paragraph on the mutable ref pattern and exploration in the reflection. A future experiment might be pure exploration. **The writer decides the mix — the system provides the building blocks.**

### User Input Checkpoints

When writing with AI assistance, the agent should pause and ask the user at three points:

1. **Article Brief**: Agent reads the experiment, presents a lens analysis, and asks: "What's the story you want to tell? Which lenses matter most? Anything specific?"
2. **Section Plan**: Agent proposes an outline assembled from the building blocks below, asks: "Does this capture it? Want to shift emphasis?"
3. **Demo Strategy**: Agent proposes interactive elements matched to the sections, asks: "These are the demos I'd build — any changes?"

The agent never auto-commits to a structure. It proposes, the user steers.

---

## Section Building Blocks

Assemble articles from these blocks. Every article uses the shared blocks; the rest are picked based on lens emphasis and the story being told.

### Shared (always present)

- **Hook** (1-2 paragraphs): What it is and why it's interesting. Mention where it came from if there's a story.
- **Full thing**: `<LiveDemo slug="..." />` embedding the complete experiment. Usually near the end.
- **Reflection**: Honest retrospective. Dead ends, trade-offs, future ideas, what you'd do differently.

### Implementation Blocks

Use when explaining *how* something works technically.

- **Basic Version + Demo**: Simplest working concept. Show code, explain it, give readers an interactive widget.
- **Enhancement + Demo**: Layer on the next technique. Show code, explain, provide a demo that builds on the previous one.
- **Key Insight**: The non-obvious code "aha" — an architectural decision, a performance trick, or a pattern worth extracting.

Multiple Enhancement blocks can chain to create the progressive demo pattern (see Demo Patterns below).

### Concept Blocks

Use when explaining *why* an idea matters or what it means.

- **The Core Idea**: The central concept, explained with analogies or first principles. No code required — lead with the mental model.
- **Implications / What If**: Where the idea leads. "What if scroll speed determined information density?" Design space exploration.
- **Design Rationale**: Why specific design decisions were made. Trade-offs, alternatives considered, principles applied. Can be 2-3 paragraphs without code between them.
- **Broader Connections**: How this connects to other domains — UX laws, physics analogies, cognitive science, other experiments in the lab.

### Exploration Blocks

Use when the journey is as interesting as the destination.

- **Origin Story**: Where the idea came from. A tweet, a conversation, a reference, a random observation.
- **What I Tried**: Approaches taken, including ones that didn't work. Failure is interesting — explain why it failed, not just that it failed.
- **The Pivot**: The moment something changed direction. What triggered it, what the new direction was.
- **Open Questions**: Unresolved ideas, things left unexplored, future directions.

---

## Demo Patterns by Lens

### Implementation Demos

Progressive layering — each demo adds one technique on top of the previous:

```
Step1Demo  → basic effect only (e.g., scanlines)
Step2Demo  → basic + next layer (e.g., scanlines + noise + phosphor)
Step3Demo  → adds another technique (e.g., barrel distortion)
<LiveDemo> → the full experiment with everything
```

Each demo has sliders/controls for the parameters introduced in that section. Build with Canvas 2D, CSS, or simplified renderings — avoid loading Three.js in article context.

### Concept Demos

Interactive elements that illustrate ideas, not just recreate effects:

- **Before/after comparisons**: toggle between two approaches to show why one matters
- **Parameter spaces**: sliders that explore a trade-off landscape (e.g., scroll speed vs. information density)
- **Interactive diagrams**: visual explanations of a mental model (state machines, flow charts, force diagrams)
- **Annotated live embeds**: the experiment itself with callouts highlighting the concept in action

### Exploration Demos

Elements that show the journey:

- **Side-by-side versions**: compare iteration N with iteration N+1
- **Timeline widgets**: scrub through the evolution of the experiment
- **"Expected vs actual" toggles**: show what you thought would happen vs. what did

### Mixing

Any section can use any demo type. A concept section can include a code demo if the code illustrates the idea. An implementation section can include a rationale block explaining *why* this approach. Don't let the lens labels restrict demo choice.

---

## Interactive Component Guide

- **`<InteractiveWidget>`**: The primary tool. Build custom React components in `article/components.tsx` with Canvas 2D, CSS, or simplified renderings. Wrap in `<InteractiveWidget title="...">`. Works for all lens types.
- **`<SandpackDemo>`**: When readers benefit from editing code and seeing results. Best for self-contained techniques (a single shader, a CSS trick, a small React component). Runs in-browser via CodeSandbox's bundler.
- **`<LiveDemo>`**: The full experiment with all its dependencies. Embeds via iframe. Use once, usually near the end, for the "full thing" section.

---

## Content Format Templates

### Lab Note
Internal. Stream-of-consciousness is fine. Sections: Context, What I Tried, What Worked, What I'd Do Differently, Open Questions.

### Architecture
For engineers. Terse. Sections: Overview (1 paragraph), Component Tree (text diagram), Key Patterns (bullet list), Data Flow, Dependencies (table), Performance Notes.

### Snippet
For copy-paste. Sections: Install (one command), Usage (minimal working example), Props/API (table), Notes (gotchas).

### Social (X Thread)
5-8 tweets. Progressive reveal. Lead the thread with whichever lens is strongest:
- Implementation-heavy: technique hook → progressive reveal → demo link → article link
- Concept-heavy: provocative question → the idea explained → experiment as proof → article link
- Exploration-heavy: "I tried X and it failed" → the pivot → what worked → article link

No hashtags unless genuinely useful.

### Changelog
Idea lineage. Where it came from, how it evolved. Sections: Origin, Iterations (versioned), Current State, Related Ideas.
