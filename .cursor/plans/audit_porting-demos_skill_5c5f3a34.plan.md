---
name: Audit porting-demos skill
overview: "Refine porting-demos SKILL.md: eliminate duplication with existing agent docs, apply progressive disclosure, add scenario routing, fix description format, and add feedback loop. Multi-agent compatible (Cursor, Antigravity, Codex, Claude Code)."
todos:
  - id: rewrite-skill
    content: "Rewrite SKILL.md: reference-not-repeat for Phases 2/6/7/8, add entry points, fix description, add debug loop, compress to ~350 lines"
    status: completed
  - id: extract-transformations
    content: Extract Phase 3 to transformations.md (~130 lines) with trimmed before/after code examples
    status: completed
  - id: verify-refs
    content: Verify all cross-references from SKILL.md and transformations.md resolve to real files
    status: completed
isProject: false
---

# Refine porting-demos Skill

## Core Problem: Reference, Don't Repeat

The skill currently **duplicates** content that already lives in AGENTS.md, rules, and workflows. Per Anthropic's [best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): "Only add context Claude doesn't already have."

Every agent (Cursor, Antigravity, Codex, Claude Code) reads AGENTS.md as their universal source of truth. When AGENTS.md says "2-iteration limit" or `.agents/rules/animations.md` says "always respect `prefers-reduced-motion`", the skill doesn't need to restate it -- it needs to **reference** the canonical location.

### What the skill duplicates today


| Content in SKILL.md                                                         | Already lives in                                                      | Action                                                                              |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Phase 2: three-location rule, scaffold command, file structure              | `.agents/rules/experiments.md`, `.agents/workflows/new-experiment.md` | Compress to 4-line summary + reference                                              |
| Phase 6: full `usePrefersReducedMotion` hook code, reduced motion rules     | `.agents/rules/animations.md` "prefers-reduced-motion" section        | Replace with 2-line reference                                                       |
| Phase 7: asset directory, path transforms, asset type table                 | `.agents/workflows/add-experiment-assets.md`                          | Replace with 2-line reference                                                       |
| Phase 8: dev tooling (DevToolsInjector, useDevControls, useGSAPDebug, etc.) | `.agents/workflows/develop-experiment.md` step 7                      | Keep -- porting adds unique context (what to wire beyond what the scaffolder gives) |
| Phase 9 checklist: cleanup, tsc, no cross-imports                           | AGENTS.md boundaries + guardrails                                     | Keep only porting-specific items                                                    |
| Phase 10: 2-iteration limit                                                 | AGENTS.md guardrails                                                  | Reference, don't restate                                                            |


### What's genuinely unique to porting (keep and sharpen)

- **Phase 0**: Source analysis methodology -- no other doc covers this
- **Phase 1**: Profile selection from source characteristics, multi-demo showcase pattern
- **Phase 3**: Tech stack transformation before/after code -- the core value
- **Phase 4**: CSS fidelity, stacking context, hide-until-reveal -- the #1 bug source
- **Phase 5**: Porting-specific pitfalls table
- **Quick Reference table**: Original -> Experiment mapping

## Changes

### 1. Rewrite `[.agents/skills/porting-demos/SKILL.md](.agents/skills/porting-demos/SKILL.md)`

Target: ~350 lines (down from 652). Structure:

**Frontmatter**: Fix description to third person per best practices ("Ports external demos..." not "Port external demos...").

**When to Use**: Keep as-is (good).

**Entry Points** (NEW): Scenario routing so the skill works at any lifecycle stage:

```markdown
## Entry Points

- **Starting fresh** with external source code: Phase 0 through 8 sequentially.
- **Already scaffolded**, need transformation patterns: Jump to Phase 3.
- **Port done but visual bugs**: Jump to Phase 4 (CSS Fidelity) then Phase 8.
- **Adding a section to existing showcase**: Phase 1 (multi-demo pattern) then Phase 3.
```

**Prerequisites**: Keep. Brief references to experiments.md and profiles.

**Phase 0: Analyze the Source**: Keep as-is (~45 lines). Unique to porting, good depth, includes dependency inventory table and animation timeline mapping.

**Phase 1: Classify and Choose Profile**: Keep as-is (~40 lines). Unique profile decision matrix and multi-demo showcase pattern.

**Phase 2: Scaffold and Structure**: Compress from 15 lines to ~6 lines. Remove the three-location list and scaffold command (already in `.agents/rules/experiments.md` and `.agents/workflows/new-experiment.md`). Keep only porting-specific guidance: "Extract content to `data.ts` immediately" and "Copy assets, transform paths per Phase 5."

**Phase 3: Tech Stack Transformations**: Replace body with summary + link to `transformations.md`. Keep the dependency inventory table (Phase 0) as the routing mechanism. ~8 lines in SKILL.md:

```markdown
## Phase 3: Tech Stack Transformations

The core of porting. Each transformation has a before/after code example.
See [transformations.md](transformations.md) for the full reference. Key transformations:

- Vanilla GSAP -> `useGSAP` (see `.agents/skills/gsap-modern/SKILL.md`)
- `DOMContentLoaded` -> `useGSAP` with `dependencies: [ready]` pattern
- Vanilla Lenis -> `createUnifiedScroll` (see `.agents/skills/lenis-scroll/SKILL.md`)
- Vanilla Three.js -> R3F declarative (see `.agents/skills/r3f-core/SKILL.md`)
- Vanilla shaders -> R3F ShaderMaterial (see `.agents/skills/shader-authoring/SKILL.md`)
- Global CSS -> scoped CSS with `<slug>-` prefix
```

**Phase 4: CSS Fidelity**: Keep as-is (~60 lines). This is the #1 bug source and unique to porting. The stacking context explanation, hide-until-reveal pattern, and class scoping rules are all high-value, porting-specific content.

**Phase 5: Common Pitfalls**: Keep as-is (~15 lines). The 10-row table is unique porting knowledge.

**Phase 6: Reduced Motion**: Compress from ~40 lines to ~4 lines. The hook code and rules already live in `.agents/rules/animations.md`. Keep only the porting-specific note:

```markdown
## Phase 6: Reduced Motion

Follow `.agents/rules/animations.md` reduced motion standards. Critical for ports: use `gsap.set` to reveal all content when motion is reduced. Never `if (reduced) return` before setting content visible -- leaves `opacity: 0` elements invisible. For scroll-pinned sections: skip the pin, reveal content.
```

**Phase 7: Asset Management**: Compress from ~25 lines to ~4 lines. Full asset guidelines live in `.agents/workflows/add-experiment-assets.md`. Keep only the porting-specific path transformation reminder:

```markdown
## Phase 7: Assets

Transform all paths: source `/hero.jpg` -> `/experiments/<name>/hero.jpg`. Use raw `<img>` (not Next.js `<Image>`) for GSAP-animated images. Full guidelines: `.agents/workflows/add-experiment-assets.md`.
```

**Phase 8: Dev Tooling**: Compress from ~110 lines to ~15 lines. The scaffolder setup and debug tools are covered by `.agents/workflows/develop-experiment.md` step 7. Keep only what's porting-specific: the "what you wire up beyond what the scaffolder gives" guidance. Drop the keyboard shortcuts table, metrics thresholds table, and `window.__experimentMetrics` section (all in `.agents/skills/visual-qa/SKILL.md`):

```markdown
## Phase 8: Dev Tooling

`<DevToolsInjector />` is auto-included by the scaffolder. Wire up the porting-specific pieces:

- **Scroll ports**: Pass `debug: isDebug` to `createUnifiedScroll()` (exposes `window.__lenis`, `__scrollToSection`, `__scrollToProgress`).
- **R3F ports**: Add `<R3FDevToolsInjector />` inside Canvas if you added a Canvas to a non-R3F scaffold.
- **Tweakable params**: Wrap ported magic numbers with `useDevControls` for live tweaking via `?debug`.
- **Timeline debugging**: Connect complex ported timelines with `useGSAPDebug(tl.current, "label")`.

Full dev tooling reference: `.agents/workflows/develop-experiment.md` step 7.
Metrics and QA: `.agents/skills/visual-qa/SKILL.md`.
```

**Phase 9: Porting Checklist**: Keep only porting-specific items (~10 lines). Remove items that duplicate AGENTS.md guardrails (tsc, cleanup, no cross-imports -- agents already know these). Keep: CSS fidelity, stacking, hide-until-reveal, class scoping, refs/timing, reduced motion, assets, dev tooling, content extraction.

**Phase 10: Validation**: Enhance with structured debug feedback loop (~15 lines):

```markdown
## Phase 8: Validation

You cannot see the output. After porting:

1. Ask user to validate at `/experiments/<name>`: layers visible, no peeking, animation timing matches, scroll behavior matches, responsive at mobile/tablet.

2. **Debug cycle** (when user reports issues):
   a. Classify: invisible elements -> Phase 4 stacking. Content peeking -> Phase 4 hide-until-reveal. Animation wrong -> Phase 3 transformation. Performance -> Phase 7 dev metrics.
   b. Apply fix from referenced phase.
   c. Ask user to re-validate the specific symptom.
   d. If not resolved after 2 attempts, follow AGENTS.md 2-iteration limit: summarize, present alternatives.

3. For structured visual review: `.agents/skills/visual-qa/SKILL.md`.
```

**Quick Reference table**: Keep as-is (~20 lines). High-value lookup, unique to porting.

### 2. New file: `[.agents/skills/porting-demos/transformations.md](.agents/skills/porting-demos/transformations.md)`

Phase 3 content extracted. ~130 lines after trimming:

- **Remove** the full `usePrefersReducedMotion` hook (Claude knows matchMedia)
- **Remove** the full vanilla Three.js "before" boilerplate (Claude knows Scene/Camera/Renderer)
- **Trim** "Imperative DOM -> React Refs" to only non-obvious rows (`element.remove()` -> `gsap.set(autoAlpha: 0)`, keep-imperative-when-procedural guidance)
- **Keep** the `useGSAP` before/after, the `dependencies: [ready]` pattern, the `createUnifiedScroll` before/after, the R3F `useGLTF`/`useFrame` after example, the shader `useMemo` + `useFrame` pattern, and the two CSS scoping approaches

No `dev-tooling.md` needed -- the compressed Phase 8 in SKILL.md is sufficient (4 bullet points + 2 references).

### 3. Verify cross-references

After writing, verify every `See ...` and reference link resolves to a real file. Check both directions: SKILL.md -> transformations.md, and the existing references from AGENTS.md, experiments.md, develop-experiment.md, new-experiment.md -> SKILL.md.