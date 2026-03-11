---
name: Content System Concept Gap
overview: Upgrade the content/article system from a single implementation-walkthrough template to a flexible lens-based system with user input checkpoints, touching writing voice, subagents, skills, rules, and workflows across ~12 files.
todos:
  - id: writing-voice
    content: "Rewrite .agents/contexts/writing-voice.md: add 3 article lenses (implementation, concept, exploration) as blendable dimensions with section-building-block catalog and user input prompts"
    status: completed
  - id: content-constellation
    content: "Update .agents/contexts/content-constellation.md: add lenses overview, note that lenses also inform social/docs tone"
    status: completed
  - id: content-writer
    content: "Rewrite .cursor/agents/content-writer.md: replace auto-detect with user-facing brief, present lens analysis, ask user for emphasis and direction"
    status: completed
  - id: content-auditor
    content: "Update .cursor/agents/content-auditor.md: add lens-strength signals column to status reports"
    status: completed
  - id: publish-content-skill
    content: "Update .cursor/skills/publish-content/SKILL.md: add Article Brief step with user input checkpoint"
    status: completed
  - id: publish-workflow
    content: "Update .agents/workflows/publish-experiment.md: mirror publish-content skill changes"
    status: completed
  - id: audit-content-skill
    content: "Update .cursor/skills/audit-content/SKILL.md: add lens-strength signals to report"
    status: completed
  - id: article-writing-rule
    content: "Rewrite .cursor/rules/article-writing.mdc: replace hardcoded implementation structure with section catalog and lens guidance"
    status: completed
  - id: content-docs-rule
    content: "Update .cursor/rules/content-docs.mdc: add lens-aware social thread variants"
    status: completed
  - id: experiment-metadata-rule
    content: "Update .cursor/rules/experiment-metadata.mdc: document optional articleLenses field"
    status: completed
  - id: memory-backlog
    content: Update memory.md with lens system fact; update t2 backlog with lens signals per experiment
    status: completed
isProject: false
---

# Content System: Lenses, Not Templates

## The Problem

The content system assumes one article shape: the **implementation walkthrough** ("How I built X with code"). Every touchpoint reinforces this single path:

- `writing-voice.md`: "code-forward: every section shows real code"
- Article structure locked to: Hook -> Basic version + demo -> Enhancement + demo -> Key insight -> LiveDemo -> Reflection
- `content-writer.md` always: reads source -> identifies 2-3 techniques -> plans progressive code demos
- `publish-experiment.md` step 2: "Identify 2-3 most interesting/novel techniques" (assumes code techniques)
- `article-writing.mdc` injects only implementation-focused guidance

This works for shader experiments and complex animation systems. It fails for experiments like **velocity-responsive-design**, where the compelling part is the *idea* -- kinetic intent, hysteresis for UI state, cognitive bandwidth -- not the `useScroll` hook. The README already reads like a concept piece (sections on "Kinetic Intent," "Relativistic Visuals," "Theoretical Background"), but the content system would flatten it into step-by-step code.

The fix isn't to create 3 rigid archetypes that replace 1 rigid template. It's to give every article access to **3 blendable lenses** and let the writer (with the user's input) decide the mix.

## Design Principle: Lenses, Not Archetypes

Three lenses that every article can draw from, in any proportion:

- **Implementation**: how it works technically -- code-forward, progressive demos, technique layering
- **Concept**: why the idea matters -- design rationale, analogies, "what if" framing, interactive thought experiments
- **Exploration**: the journey -- dead ends, pivots, decisions, what was learned from failure

An article is a **blend**. `velocity-responsive-design` might be 60% concept / 25% implementation / 15% exploration. `404-not-found` (the existing article) is 80% implementation / 10% concept / 10% exploration. A future experiment might be pure exploration. The system provides **section building blocks** for each lens, and the writer assembles them.

### User Input Checkpoints

The system codifies asking the user at key decision points instead of auto-selecting:

1. **Article Brief** (before writing): Agent reads the experiment, presents a lens analysis with signals it found, and asks the user: "What's the story you want to tell? Which lenses matter most? Anything specific you want to emphasize?"
2. **Section Plan** (before drafting): Agent proposes an outline mixing sections from different lenses, asks: "Does this capture what you had in mind? Want to shift emphasis?"
3. **Demo Strategy** (before building): Agent proposes demo types matched to lenses, asks: "These are the interactive elements I'd build -- any changes?"

The agent never auto-commits to a single mode. It proposes, the user steers.

## Files to Change (12 files across 5 directories)

### Tier 1: Core Voice and Structure

**1. [.agents/contexts/writing-voice.md](.agents/contexts/writing-voice.md)**

Current article structure section becomes the "Implementation" lens building blocks. Add two peer sections for Concept and Exploration lenses. Restructure as:

- **Voice Characteristics** (unchanged -- conversational, first-person, no filler, no AI fingerprints apply to ALL lenses)
- **Anti-Patterns** (unchanged)
- **Article Lenses** (NEW): describe the 3 lenses as blendable dimensions, not exclusive categories. Note that most articles use 2-3 lenses with varying emphasis.
- **Section Building Blocks** (RESTRUCTURED from current "Article Structure"):
  - Shared sections (always present): Hook, Full Thing (LiveDemo), Reflection
  - Implementation sections: Basic Version + Demo, Enhancement + Demo, Key Insight (code "aha")
  - Concept sections: The Core Idea, Implications / What If, Design Rationale, How It Connects (to broader design/UX/physics)
  - Exploration sections: Origin Story, What I Tried (including dead ends), The Pivot, Open Questions
- **Demo Patterns by Lens** (RESTRUCTURED from "Progressive demo pattern"):
  - Implementation demos: Canvas 2D recreations with parameter sliders (current pattern -- keep as-is)
  - Concept demos: interactive diagrams, before/after comparisons, parameter spaces showing trade-offs, annotated live embeds with callouts
  - Exploration demos: side-by-side version comparisons, timeline widgets, "expected vs actual" toggles
  - Mixed: any combination is fine -- a concept section can have a code demo, an implementation section can include a "why this approach" rationale block
- **Interactive Component Guide** (unchanged -- InteractiveWidget, SandpackDemo, LiveDemo usage stays the same)
- Content Format Templates (unchanged -- lab note, architecture, snippet, social, changelog)

**2. [.agents/contexts/content-constellation.md](.agents/contexts/content-constellation.md)**

- Add 2-3 line "Article Lenses" mention in "Key Technical Patterns" pointing to `writing-voice.md` for full guidance
- Note that lens emphasis can also inform social content tone (concept-heavy experiment -> idea-hook thread; implementation-heavy -> technique-hook thread)
- Add note: "The agent should always present a lens analysis and ask the user for direction before committing to an article structure"

### Tier 2: Agent Personas

**3. [.cursor/agents/content-writer.md](.cursor/agents/content-writer.md)** (most significant change)

Replace the current linear workflow with a user-collaborative brief process:

**Current "Before You Write":**

> 1. Read ALL source files
> 2. Identify 2-3 most interesting/novel techniques
> 3. Plan one interactive demo per technique

**New "Before You Write":**

> 1. Read ALL source files, README, experiment.json (description, tags, inspiration), content.ts if present, and any docs/ files
> 2. **Lens Analysis**: Assess the experiment across all 3 lenses:
>   - Implementation signals: novel code patterns, shader techniques, animation systems, architecture decisions
>   - Concept signals: conceptual README, cross-disciplinary metaphors, novel UI paradigms, design philosophy
>   - Exploration signals: documented iterations, dead ends, pivots, changelog history, open questions in lab notes
> 3. **Present the brief to the user** (don't auto-commit):
>   - "Here's what I found interesting across the three lenses: [analysis]"
>   - "I'd suggest leading with [lens] because [reason], with [lens] supporting sections"
>   - "What's the story you want to tell? What should I emphasize? Anything I'm missing?"
> 4. **Wait for user direction**, then plan sections and demos accordingly
> 5. **Propose a section outline** drawn from the building blocks, ask for confirmation before drafting

Keep existing voice characteristics and anti-patterns. Add guidance for writing concept-lens sections (analogies encouraged, "what if" framing, design rationale can be 2-3 paragraphs without code between them) and exploration-lens sections (chronological OK, failure is interesting, uncertainty is honest).

**4. [.cursor/agents/content-auditor.md](.cursor/agents/content-auditor.md)**

- Add "Lens Signals" column to the status report showing which lenses have strong material:
  - `I` = implementation signals present (novel code patterns)
  - `C` = concept signals present (rich README, design philosophy, novel paradigm)
  - `E` = exploration signals present (changelog, lab notes, documented iterations)
- This helps prioritize which experiments to write about and surfaces experiments that are concept-rich but would be underserved by the current implementation-only approach

### Tier 3: Skills and Workflows

**5. [.cursor/skills/publish-content/SKILL.md](.cursor/skills/publish-content/SKILL.md)**

Insert an "Article Brief" step between current steps 2 (read source) and 3 (scaffold):

> **Step 2.5: Article Brief (user input checkpoint)**
>
> - Run lens analysis across the experiment
> - Present findings to user: strongest lenses, suggested emphasis, proposed section mix
> - Ask: "What's the story? Which lenses matter most? Anything specific?"
> - Wait for user direction before proceeding to scaffolding and writing

Update Phase 2 (Article) to reference the section building blocks from `writing-voice.md` instead of hardcoding the implementation walkthrough structure.

**6. [.agents/workflows/publish-experiment.md](.agents/workflows/publish-experiment.md)**

Mirror the publish-content skill changes:

- Add Article Brief user checkpoint at step 2.5
- Broaden step 2 from "Identify 2-3 most interesting/novel techniques" to "Identify what's interesting across implementation, concept, and exploration lenses"
- Step 5 (write article) references section building blocks instead of hardcoding the progressive-demo-only structure

**7. [.cursor/skills/audit-content/SKILL.md](.cursor/skills/audit-content/SKILL.md)**

- Add lens signal detection to the audit: when scanning experiment.json + README + docs/, flag which lenses have strong material
- Include this in the status report output so the user can see at a glance which experiments have untapped concept or exploration potential
- Add note: concept-rich experiments (like velocity-responsive-design) are currently underserved and should be prioritized

### Tier 4: Auto-Inject Rules

**8. [.cursor/rules/article-writing.mdc](.cursor/rules/article-writing.mdc)**

Replace the hardcoded implementation structure with:

- Brief mention of 3 lenses (implementation, concept, exploration) with pointer to `writing-voice.md`
- Section building blocks catalog (one-liner per block so it fits in auto-inject budget):
  - Shared: Hook, Full Thing, Reflection
  - Implementation: Basic Version + Demo, Enhancement + Demo, Key Insight
  - Concept: Core Idea, Implications, Design Rationale, Broader Connections
  - Exploration: Origin Story, What I Tried, The Pivot, Open Questions
- Note: "Ask the user which lenses to emphasize before committing to a structure. Most articles blend 2-3 lenses."
- Keep all existing MDX wiring, demo strategy, and typography guidance (unchanged)

**9. [.cursor/rules/content-docs.mdc](.cursor/rules/content-docs.mdc)**

Add lens-aware social thread variant guidance:

- Implementation-heavy articles: current template (technique hook -> progressive reveal -> link)
- Concept-heavy articles: provocative question -> the idea explained -> experiment as proof -> link
- Exploration-heavy articles: "I tried X and it failed" -> the pivot -> what worked -> link
- Mixed: writer's judgment -- lead the thread with whichever lens is strongest

### Tier 5: Schema

**10. [.cursor/rules/experiment-metadata.mdc](.cursor/rules/experiment-metadata.mdc)**

- Document optional `articleLenses` field in experiment.json: array like `["concept", "implementation"]` indicating which lenses are strong for this experiment
- Advisory only -- not enforced by validator, not required
- Content-writer and content-auditor can read this as a hint but always do their own analysis

### Tier 6: Supporting Context

**11. [memory.md](memory.md)**

- Add: "Articles use 3 blendable lenses (implementation/concept/exploration), not rigid archetypes. Agent presents lens analysis and asks user for direction before writing."
- Add: "System should be less prescriptive with guidelines and recommendations, codifying user input at key decision points"

**12. [.agents/backlog/t2-content-registry.md](.agents/backlog/t2-content-registry.md)**

- Update "Generate articles for 15 experiments" to note the lens system
- Add lens-strength signals for key experiments (observations, not prescriptions):
  - `velocity-responsive-design`: strong concept signals (kinetic intent, cognitive bandwidth, relativistic metaphor)
  - `non-euclidean-hyperbolic-workspace`: strong concept signals (non-Euclidean geometry as UI)
  - `gravity-physics-ui-layout`: strong concept signals (physics as layout engine)
  - `game-of-life-shader` / `life-3d`: strong implementation signals (shader technique, GPU compute)
  - `keyboard-keys`: strong implementation signals (CSS/DOM craft)
  - All: final emphasis decided with user input at article brief time

## What This Does NOT Change

- The 5 non-article content formats (lab note, architecture, snippet, social, changelog) -- templates stay the same
- The MDX wiring pattern (components.tsx -> page.tsx -> MDXRemote)
- The progressive demo infrastructure (InteractiveWidget, SandpackDemo, LiveDemo) -- these components work for all lens types
- The `experiment.json` validator or pre-commit hooks
- The 3 existing articles (they're implementation-heavy blends, and they're good)
- Typography, CSS, or any UI code
- Voice characteristics and anti-patterns (these are lens-agnostic)

## Validation

After implementation, verify:

- `content-writer` subagent presents a lens analysis for velocity-responsive-design that surfaces concept signals and asks the user for direction (doesn't auto-commit to implementation walkthrough)
- `article-writing.mdc` provides section building blocks from all 3 lenses when editing any content.mdx
- `audit-content` reports include lens-strength signals
- Writing voice doc reads as a flexible toolkit, not a rigid template
- All .md/.mdc files are well-formatted and within line limits

