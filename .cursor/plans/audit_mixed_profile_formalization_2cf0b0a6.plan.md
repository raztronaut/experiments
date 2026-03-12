---
name: Audit mixed profile formalization
overview: Assessment of the mixed profile formalization work from [formalize mixed profile](05084c96-6aeb-4f5b-a80f-8eb69afab529), comparing against best practices, profile consistency, and cross-reference completeness.
todos:
  - id: scrub-leva-pin
    content: Add scrub Leva control and pinned section example to mixed plop template, matching scrollytelling template patterns
    status: completed
  - id: reprofile-announcing-v2
    content: Change announcing-v2 experiment.json profile from 'scrollytelling' to 'mixed' (uses lenis + gsap + r3f + glsl + motion + zustand)
    status: completed
  - id: blank-profile-doc
    content: Create minimal .agents/profiles/blank.md (activation line, behavioral mode, priority ordering -- ~20 lines)
    status: completed
  - id: validate-template
    content: Scaffold a test experiment with mixed profile to verify the template compiles and renders correctly, then delete it
    status: completed
  - id: audit-reprofile-experiments
    content: "Audit and re-profile existing experiments: airplanes (scrollytelling -> mixed, has 3D + scroll + SVG), mountain-transition (r3f-shader -> mixed, has GSAP scroll + R3F + GLSL), game-of-life-shader (blank -> dom-effect, has canvas-2d + cursor). Leave legacy borderline cases (cursor-depth-explorer, transit-airport-split-flap-display) unchanged unless user confirms."
    status: completed
isProject: false
---

# Audit: Mixed Profile Formalization

## Verdict

The work is **well executed**. The agent correctly identified all touch-points, maintained consistency across 9+ files, created a functional template, and fixed the agency references with proper links. Below is a detailed breakdown of what's solid, what has minor gaps, and what could be improved.

---

## What's Solid

### 1. Cross-System Consistency (A+)

`mixed` now appears in all 3 validation arrays, the TypeScript union, the plopfile choices, TOOLKIT_DEFAULT_PROFILES, and all documentation -- perfectly synchronized:

- [scripts/validate-experiments.mjs](scripts/validate-experiments.mjs) line 24
- [scripts/create-experiment.mjs](scripts/create-experiment.mjs) lines 35, 38
- [src/lib/experiments.ts](src/lib/experiments.ts) lines 12, 26
- [plopfile.js](plopfile.js) lines 56-59, 68

### 2. Agency References (A)

The phantom names (darkroom, basement, tambo) are now properly attributed with site links AND GitHub repo links. The specific repo references are well-chosen:

- `darkroomengineering/satus` -- their starter/framework repo, most relevant for pattern study
- `basementstudio/website-2k25` -- their latest site, demonstrates the patterns in production
- `tambo-ai/tambo-landing` -- the landing page project showing layer-cake in action

Both [mixed.md](/.agents/profiles/mixed.md) line 27 and [scrollytelling.md](/.agents/profiles/scrollytelling.md) line 54 are properly fixed.

### 3. Profile Doc Quality (A)

At 227 lines, `mixed.md` is the longest profile doc -- justified by its complexity. It follows the same structural pattern as other profiles:

- Activation line (blockquote)
- Behavioral Mode (bold sentence)
- Priority Ordering (numbered list)
- Core patterns with code examples
- Gotchas table
- Pre-Implementation Checklist

It adds unique sections that other profiles don't need:

- **When to Use This Profile** -- clear decision boundaries vs scrollytelling/r3f-scene
- **Profile Priority (Conflict Resolution)** -- what wins when guidance conflicts
- **Device Adaptation table** -- degradation strategy for the heaviest profile type

### 4. Template Design (A-)

The [mixed template](plop-templates/experiment/profiles/mixed/component.tsx.hbs) properly combines patterns from scrollytelling and r3f-scene:

- Layer-cake layout: fixed Canvas at z-0, scrolling DOM at z-1
- `createUnifiedScroll` + `ScrollTrigger.refresh()` pattern
- Scroll progress passed via `useRef` (not React state -- correct for useFrame)
- Non-toolkit fallback with full manual Lenis/Tempus/GSAP wiring
- Leva gating with conditional Handlebars blocks
- `R3FDevToolsInjector` included

### 5. Documentation Updates (A)

All 5 documentation files updated:

- [AGENTS.md](AGENTS.md) -- `--profile` flag enum
- [experiment-metadata.mdc](.cursor/rules/experiment-metadata.mdc) -- profile enum
- [experiment-components.mdc](.cursor/rules/experiment-components.mdc) -- profile guidance
- [new-experiment.md](.agents/workflows/new-experiment.md) -- flag docs + selection guide
- [develop-experiment.md](.agents/workflows/develop-experiment.md) -- toolkit integration section

---

## Minor Gaps

### 1. Mixed template lacks `scrub` Leva control

The scrollytelling template exposes a `scrub` Leva control that lets devs tune scroll-coupling tightness at runtime. The mixed template hardcodes `scrub: 1`. Since mixed experiments are even more complex to tune, this control would be valuable.

**Fix**: Add `scrub` to the Leva controls block in the mixed template, matching scrollytelling's pattern.

### 2. Mixed template doesn't pin any section

The scrollytelling template demonstrates a pinned section (lines 92-98) -- a core ScrollTrigger pattern. The mixed template only does basic `fromTo` reveals. Since mixed experiments will almost certainly use pins (transparent sections where 3D shows through), the template should include at least one pinned section example.

**Fix**: Add a pinned section to the mixed template's `useGSAP` block, pinning the transparent section.

### 3. Inline styles vs CSS classes for pointer-events

The profile doc (line 55-65) shows CSS classes (`.transparent-section`, `.content-section`), but the template uses inline `pointerEvents` style. Minor inconsistency -- templates are pragmatic starting points, but it would be cleaner to match the doc.

### 4. `useGSAP` dependencies not wired for Leva

When `includeLeva` is true, the scrollytelling template passes `dependencies: [scrub]` to `useGSAP` so animations re-create when the control changes. The mixed template's `useGSAP` has no dependencies array in the Leva branch. If a scrub control were added, this would need the dependency too.

---

## Pre-Existing Gaps (Not From This Work)

### 1. No `blank.md` profile doc

The `blank` profile is valid in all 3 validators, has a plop template, and appears in all enums -- but has no `.agents/profiles/blank.md` doc. Every other profile has one. This predates the mixed work.

### 2. No experiments use `mixed` yet

Zero experiments have `"profile": "mixed"`. The profile, template, and docs are all in place but untested in production. `announcing-v2` (the experiment identified in the transcript as a natural `mixed` candidate) still uses `"profile": "scrollytelling"`.

### 3. Profiles with zero experiments: `web-audio`, `dom-effect`, `mixed`

Three profiles have docs and templates but no experiments using them. This is aspirational documentation -- fine for now, but the templates are effectively untested.

---

## Recommendations

- **P1**: Add `scrub` Leva control + pinned section to the mixed template (aligns it with scrollytelling template quality)
- **P2**: Re-profile `announcing-v2` from `scrollytelling` to `mixed` (it uses lenis, gsap, r3f, glsl, motion, zustand -- textbook mixed)
- **P3**: Create a minimal `blank.md` profile doc (even 10 lines: "minimal shell, no opinions, start from scratch")
- **P4**: Scaffold a test experiment with `npm run new:experiment:auto -- --name "mixed-template-test" --profile mixed --toolkit --leva` to validate the template compiles and runs
- **P5**: Audit and re-profile existing experiments (see table below)

---

## Experiment Re-Profiling Audit

Now that `mixed` is a first-class profile, several existing experiments have profiles that no longer best describe their tech stack. Re-profiling is metadata-only (just `experiment.json`), no code changes.

### Clear re-profiles


| Experiment            | Current          | Proposed     | Rationale                                                                                                 |
| --------------------- | ---------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `announcing-v2`       | `scrollytelling` | `mixed`      | lenis + gsap + r3f + glsl + motion + zustand -- textbook mixed across 4 domains                           |
| `airplanes`           | `scrollytelling` | `mixed`      | Scroll-driven 3D airplane with dual rendering + parallax + SVG annotations -- scroll + R3F + DOM layers   |
| `mountain-transition` | `r3f-shader`     | `mixed`      | R3F + GLSL + GSAP scroll-driven transitions -- bridges scrollytelling + r3f-shader                        |
| `game-of-life-shader` | `blank`          | `dom-effect` | Canvas 2D + web workers + cursor interaction -- not blank, fits dom-effect (shader effects on canvas DOM) |


### Borderline cases (leave unchanged unless user confirms)


| Experiment                           | Current          | Why it could be mixed                    | Why to leave it                                                                                              |
| ------------------------------------ | ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `velocity-responsive-design`         | `scrollytelling` | Lenis + Motion + Canvas 2D + generative  | Canvas 2D is not R3F -- scroll + DOM canvas fits scrollytelling better than mixed's layer-cake pattern       |
| `cursor-depth-explorer`              | `r3f-shader`     | Shader + cursor/tilt interaction         | Interaction is input-only (mouse/tilt uniforms), not a separate gesture/spring layer -- fits r3f-shader      |
| `transit-airport-split-flap-display` | `web-audio`      | Motion + Web Audio + CSS -- multi-domain | Audio is the defining pillar; Motion is just entrance animations. Mixed implies scroll + 3D which this lacks |
| `rabbithole-chat-preloader`          | `r3f-shader`     | Three.js + GLSL + Motion                 | Motion is just loading transitions, not a core interaction layer -- shader is the experiment                 |
| `basketball-replay-center`           | `r3f-shader`     | R3F + GLSL + GSAP                        | GSAP is timeline animation, not scroll-driven -- stays r3f-shader                                            |


Note: `mountain-transition` and `game-of-life-shader` are `legacy: true`. Re-profiling is metadata-only and does not violate the "no code changes to legacy experiments" guardrail.