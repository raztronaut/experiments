---
name: AI Coding Config Overhaul
overview: Overhaul the AI coding configuration from a flat, verbose structure to a layered, token-efficient system modeled on darkroom cc-settings v8, with path-conditioned rules, experiment-type profiles, concise skills, and updated workflows that reference the creative toolkit.
todos:
  - id: agents-md
    content: Create AGENTS.md with cross-tool portable standards (~1500 tokens)
    status: completed
  - id: rules-experiments
    content: Create rules/experiments.md (always-on) replacing current rules file
    status: completed
  - id: rules-domain
    content: "Create domain rules: r3f.md, shaders.md, animations.md, scroll.md, performance.md"
    status: completed
  - id: profiles
    content: "Create 5 profiles: r3f-scene, shader-art, scrollytelling, interaction, dom-effect"
    status: completed
  - id: skills-new
    content: "Create 7 new focused skills: lenis-scroll, gsap-modern, r3f-core, shader-authoring, motion-react, visual-qa, tempus-raf"
    status: completed
  - id: workflows-update
    content: Update new-experiment and develop-experiment workflows; create visual-qa and publish-experiment workflows
    status: completed
  - id: contexts
    content: Create contexts/toolkit.md and contexts/architecture.md
    status: completed
  - id: migrate-cleanup
    content: Remove old .agents/skills/ symlinks, consolidate into .agent/
    status: completed
isProject: false
---

# Section 1: AI Coding Configuration Overhaul

## Context

The current config is split across two directories with overlapping concerns:

- `.agent/` -- 1 always-on rule + 5 workflows
- `.agents/skills/` -- 8 symlinked skills (many verbose, overlapping, 10K+ tokens each)

The cc-settings v8 architecture proves that **layered, token-efficient config** dramatically improves agent effectiveness. Their base cost dropped from ~5K to ~2.7K tokens per spawn by loading config contextually. We adapt this approach for an experiment-centric creative coding lab.

## Target Architecture

```
.agent/
  AGENTS.md                          # ~1500 tokens. Cross-tool portable standards
  rules/
    experiments.md                   # Always-on: isolation, scaffolding, architecture
    r3f.md                           # Path: src/components/experiments/**/*, *.tsx with R3F imports
    shaders.md                       # Path: *.glsl, *.frag, *.vert, shader utils
    animations.md                    # Path: GSAP/Motion patterns, timing/easing standards
    scroll.md                        # Path: Lenis/scroll-driven work
    performance.md                   # Path: any experiment component
  profiles/
    r3f-scene.md                     # R3F 3D scene experiments
    shader-art.md                    # Pure shader / generative art
    scrollytelling.md                # Lenis + GSAP ScrollTrigger + pinning
    interaction.md                   # Motion + gesture + spring experiments
    dom-effect.md                    # VFX.js, CSS animations, DOM shader effects
  workflows/
    new-experiment.md                # Updated: template-aware, profile-setting
    develop-experiment.md            # Updated: toolkit-aware, dev metrics
    visual-qa.md                     # NEW: screenshot capture, metrics validation
    publish-experiment.md            # NEW: article generation, social assets
  skills/
    lenis-scroll.md                  # Lenis setup, GSAP ScrollTrigger integration
    gsap-modern.md                   # useGSAP, ScrollTrigger, timelines, dynamic import
    r3f-core.md                      # Canvas config, useFrame, cleanup, instancing
    shader-authoring.md              # ShaderMaterial, uniforms, GLSL patterns
    motion-react.md                  # Motion layout animations, gestures, springs
    visual-qa.md                     # How AI validates visual output
    tempus-raf.md                    # Tempus RAF, priority, Lenis+GSAP integration
  contexts/
    toolkit.md                       # All available creative libraries + versions
    architecture.md                  # Experiment architecture quick-reference
```

## Detailed File Specifications

### AGENTS.md (~1500 tokens)

The portable, cross-tool coding standards file. Adapted from cc-settings but tuned for creative coding:

- **Philosophy**: "This is a creative coding lab. Every experiment should be close to publishable. Tooling enables creativity, never limits it."
- **Guardrails**: 2-iteration limit, bug fix scope, pre-commit verification (`tsc --noEmit`), visual/spatial honesty (acknowledge inability to see WebGL/shader/animation output), context hygiene (offload >2K token tool output to scratch files), stealth mode (no AI fingerprints)
- **Tech Stack**: Next.js 16 App Router, React 19, Tailwind CSS, GSAP + Motion for animation, Lenis for scroll, Tempus for RAF, Hamo for perf hooks, R3F for 3D
- **Experiment Architecture**: Route group isolation pattern, three-location rule (route, component, public), no cross-experiment imports
- **Coding Standards**: TypeScript strict (no `any`), Server Components default, `'use client'` only when needed, conventional commits, accessibility minimums (alt text, aria-label, 44x44 touch targets)
- **Animation Standards**: Drawn from Raphael Salaja's 12 Principles -- honor anticipation, follow-through, timing (<300ms for interactions, <400ms Doherty threshold), easing (never linear for UI), `prefers-reduced-motion` always respected
- **UX Standards**: From Laws of UX -- Fitts's Law (generous hit areas, `::before` padding), Hick's Law (progressive disclosure), Miller's Law (chunk data), Postel's Law (liberal inputs, strict outputs)

### Path-Conditioned Rules

Each rule is ~500 tokens, loaded only when editing matching files:

`**rules/experiments.md`** (always-on)

- Adapted from the existing `new-experiment-process-and-rules.md` but tightened
- Three-location rule, scaffolding-first, cleanup discipline
- Profile detection: read `experiment.json` profile field to load the right profile

`**rules/r3f.md`** (path: `**/experiments/**/*.tsx` when R3F imports detected)

- From cc-settings webgl.md priorities: frame rate > memory > correctness > performance > responsiveness
- Dispose geometries/materials/textures on unmount
- Use instancing for repeated objects
- Dynamic DPR based on device (mobile: 1-1.5, desktop: 1-2)
- `r3f-perf` in dev only
- Performance budgets: Low-poly <10K tris, Medium 10-50K, High 50-200K
- Never `setState` in `useFrame` (from r3f-best-practices skill)

`**rules/shaders.md`** (path: `*.glsl, *.frag, *.vert`)

- ShaderMaterial setup pattern with typed uniforms
- GLSL utility patterns (noise, SDF, easing)
- Uniform naming conventions
- Performance: minimize texture lookups, avoid branching in fragment shaders

`**rules/animations.md`** (path: experiment components)

- GSAP: always dynamic import (`{ ssr: false }`), always `useGSAP` hook, always `gsap.context()` for cleanup
- Motion: layout animations for shared element transitions, `AnimatePresence` for exit animations, spring physics defaults
- Timing standards from 12 Principles: interaction feedback <200ms, transitions 200-500ms, complex choreography up to 800ms
- Easing: ease-out for entrances (snappy), ease-in for exits, ease-in-out for state changes. Never `linear` for UI.
- Follow-through: stagger child elements (overlapping action), spring overshoot for physicality
- `prefers-reduced-motion`: mandatory check, provide `motion="reduced"` fallback

`**rules/scroll.md`** (path: Lenis-using experiments)

- Lenis + GSAP ScrollTrigger integration pattern (the canonical wiring)
- Lenis + Tempus unification
- ScrollTrigger pinning, scrub, snap patterns
- Performance: debounce scroll callbacks, use `will-change: transform` sparingly

`**rules/performance.md`** (path: any experiment)

- Frame budget: 16.67ms at 60fps, safe JS budget ~10ms
- Animate only `transform` and `opacity` (compositor properties)
- Bundle: dynamic import heavy deps (Three.js, GSAP)
- Memory: dispose Three.js resources, clean up event listeners
- Metrics: FPS >55 acceptable, >50 warning, <50 problem

### Profiles

Each ~800-1200 tokens. Activated by `"profile"` field in `experiment.json`:

`**profiles/r3f-scene.md`**

- Behavioral mode: performance-obsessed, frame-rate-aware, GPU-conscious
- Toolkit: R3F Canvas with responsive DPR, Drei, Tempus-driven render loop, r3f-perf in dev
- Pattern: Canvas config template, camera setup, lighting defaults, OrbitControls
- Gotchas table (from cc-settings webgl.md): hydration errors, memory leaks, scroll jank, low mobile FPS, too many draw calls

`**profiles/shader-art.md`**

- Behavioral mode: visual fidelity first, mathematical precision
- Toolkit: R3F + custom ShaderMaterial, or standalone WebGL canvas
- Pattern: fullscreen quad setup, uniform wiring (time, resolution, mouse), GLSL utilities
- Reference: noise functions, SDF primitives, color manipulation

`**profiles/scrollytelling.md`**

- Behavioral mode: scroll UX first, smooth transitions, narrative pacing
- Toolkit: Lenis + GSAP ScrollTrigger + Tempus
- Pattern: pinned sections, scrub animations, scroll-to navigation, progress indicators
- Reference: the canonical Lenis + ScrollTrigger wiring code
- UX: Doherty threshold (<400ms perceived response), progressive disclosure (Hick's Law)

`**profiles/interaction.md`**

- Behavioral mode: tactile, responsive, spring-physics-driven
- Toolkit: Motion + @use-gesture/react
- Pattern: draggable elements with spring-back, magnetic effects, hover states
- Reference: 12 Principles -- squash/stretch for feedback, anticipation before actions, exaggeration for emphasis
- UX: Fitts's Law (generous hit areas), Postel's Law (accept messy input)

`**profiles/dom-effect.md`**

- Behavioral mode: visual enhancement of existing DOM
- Toolkit: VFX.js for shader effects on DOM, CSS animations, Motion for layout
- Pattern: glitch/shimmer/RGB-shift on text/images, progressive blur, text effects
- Reference: motion-primitives component patterns

### Skills Overhaul

Each skill under 5K tokens. Replace the current 8 verbose/overlapping skills:


| Current Skill                 | Disposition                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `frontend-design`             | Keep concept, distill into AGENTS.md UX/animation standards    |
| `gsap-react`                  | Replace with `gsap-modern.md` (merged with scrolltrigger)      |
| `gsap-scrolltrigger`          | Merge into `gsap-modern.md`                                    |
| `r3f-best-practices`          | Replace with `r3f-core.md` (merged with fundamentals)          |
| `r3f-fundamentals`            | Merge into `r3f-core.md`                                       |
| `threejs-3d-graphics`         | Absorb key patterns into `r3f-core.md` + `shader-authoring.md` |
| `threejs-pro`                 | Absorb decision framework into `r3f-core.md`                   |
| `vercel-react-best-practices` | Keep as-is (well-structured, from Vercel Engineering)          |


New skills to create:

- `**lenis-scroll.md`** -- Lenis v1.3.x setup, `<ReactLenis root>`, `useLenis` hook, GSAP ScrollTrigger integration (the canonical pattern from cc-settings webgl.md), Tempus unification, `scrollTo`, configuration options
- `**gsap-modern.md`** -- `useGSAP` hook pattern, dynamic import with `{ ssr: false }`, ScrollTrigger (pin, scrub, snap, batch), timeline composition, `gsap.context()` cleanup, Tempus integration
- `**r3f-core.md`** -- Canvas config (responsive DPR, Suspense, loader), `useFrame` with delta, disposal patterns, instancing with `<Instances>`, Drei essentials (Environment, OrbitControls, useProgress), performance budgets
- `**shader-authoring.md`** -- ShaderMaterial setup, typed uniform object pattern, common GLSL utilities (noise, SDF, easing, color), fullscreen quad pattern, debugging approach
- `**motion-react.md`** -- Motion v12+ API, layout animations, `AnimatePresence`, spring physics, `useScroll`/`useTransform`, gesture integration, `motion.div` variants, `prefers-reduced-motion`
- `**visual-qa.md**` -- How AI agents validate visual output: screenshot capture workflow, console metrics reading, R3F scene inspection, multi-frame animation validation, expected vs. actual description pattern
- `**tempus-raf.md**` -- Tempus singleton, `Tempus.add()` with priority, `useTempus` hook, integration wiring (Lenis + GSAP + Three.js unified under Tempus), FPS targeting, idle callbacks

### Workflows Update

`**workflows/new-experiment.md**` (updated)

- Add template selection step (r3f-scene, shader-art, scrollytelling, interaction, dom-effect, blank)
- Template sets `"profile"` in experiment.json automatically
- Template scaffolds with correct toolkit imports (Lenis, Tempus, R3F Canvas, etc.)
- Reference the enriched metadata schema

`**workflows/develop-experiment.md**` (updated)

- Add: "Check experiment.json profile field, load the matching profile"
- Add: "Dev metrics are available at the layout level automatically, check terminal output"
- Add: "For R3F experiments, r3f-perf overlay is in the top-left corner in dev"
- Reference toolkit integration layer

`**workflows/visual-qa.md**` (new)

- Step-by-step process for AI visual validation
- Screenshot capture (Playwright script or MCP tool)
- Console metrics check (FPS, draw calls, memory)
- R3F scene inspector (text representation of scene graph)
- Multi-frame capture for animations
- Expected vs. actual description + iteration

`**workflows/publish-experiment.md**` (new, stub for Section 5)

- Placeholder referencing the content publishing pipeline (Section 5)

### Contexts

`**contexts/toolkit.md**`

- Comprehensive list of all available libraries with versions, import paths, and when to use each
- Tier 1 (always available): Lenis 1.3.x, Tempus 0.0.x, Hamo 0.6.x, GSAP, Motion 12.x
- Tier 2 (per-experiment): r3f-scroll-rig, vfx.js, StringTune, @react-three/timeline, Theatre.js
- Tier 3 (copy-paste): motion-primitives, animate-ui, Cambio
- Shared UI: shadcn/ui components in `src/components/ui/`

`**contexts/architecture.md**`

- Quick-reference for the experiment architecture: route group pattern, three-location rule, isolation guarantees
- Metadata schema reference
- File naming conventions
- Import rules

## Migration Approach

1. **Preserve**: Keep `.agent/workflows/add-experiment-component.md`, `add-experiment-assets.md`, `cleanup-experiment.md` (useful, not covered by new structure)
2. **Replace**: `.agent/rules/new-experiment-process-and-rules.md` -> `rules/experiments.md`
3. **Replace**: All 8 skills in `.agents/skills/` -> 7 new focused skills in `.agent/skills/` (keep `vercel-react-best-practices` as-is)
4. **Update**: Both existing workflows
5. **Create**: AGENTS.md, 5 rules, 5 profiles, 2 new workflows, 2 contexts, 7 new skills

## Key Design Decisions

- **Single `.agent/` directory**: Consolidate `.agent/` and `.agents/` into one `.agent/` tree. The `.agents/` directory with symlinked skills is replaced.
- **Token budget**: AGENTS.md ~1500 tokens, each rule ~500, each profile ~1000, each skill <5000. Base load (AGENTS.md + experiments rule) is ~2000 tokens. Full profile activation adds ~1500.
- **Path conditioning**: Rules use file path globs to auto-activate. Profiles activate via explicit `experiment.json` field.
- **Skills stay in `.agent/`**: Not at global `~/.cursor/` level. Project-specific, versioned with the repo.
- **Existing experiments untouched**: No changes to the 18 existing experiments. They work as-is. Optionally tag with `"legacy": true`.

