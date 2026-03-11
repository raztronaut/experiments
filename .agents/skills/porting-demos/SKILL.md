---
name: porting-demos
description: "Ports external demos, websites, repos, snippets, and components into the experiments lab. Source analysis, profile selection, tech stack transformation (vanilla JS/GSAP/Three.js to React/useGSAP/R3F), CSS fidelity enforcement, and visibility bug prevention. Use when porting external code, replicating demos, or adapting Codegrid/Awwwards/CodePen/Framer examples into experiments."
---

# Porting Demos & External Code

> Source analysis, classification, tech stack transformation, CSS fidelity enforcement, and validation for porting external demos into the experiments lab.

## When to Use

**Use this skill when:**
- Porting a Codegrid, Awwwards, CodePen, or CodeSandbox demo into an experiment
- Replicating a website effect or landing page animation
- Adapting code from an external repo, gist, or snippet
- Combining multiple external demos into a single showcase experiment

**Do NOT use for:**
- Building experiments from scratch (use `.agents/workflows/new-experiment.md`)
- Modifying an existing experiment (use `.agents/workflows/develop-experiment.md`)
- Publishing or writing about an experiment (use `.agents/workflows/publish-experiment.md`)

## Entry Points

- **Starting fresh** with external source code: Phase 0 through Phase 8 sequentially.
- **Already scaffolded**, need transformation patterns: Jump to Phase 3.
- **Port done but visual bugs**: Jump to Phase 4 (CSS Fidelity) then Phase 8 (Validation).
- **Adding a section to existing showcase**: Phase 1 (multi-demo pattern) then Phase 3.
- **Porting only part of a demo** (e.g., just the scroll effect): Phase 0 to analyze, then Phase 3 for the specific transformation.

## Prerequisites

Read before starting any port:
- `.agents/rules/experiments.md` -- isolation rules, decomposition, cleanup
- `.agents/profiles/<profile>.md` -- profile-specific guidance (after choosing profile in Phase 1)

## Phase 0: Analyze the Source

Before writing any code, thoroughly understand the original.

### Reading strategy

1. **Entry point**: Find `index.html` or the app's root route. Note the DOM structure -- elements, nesting, classes.
2. **CSS**: Read every selector and property. Note stacking order (`z-index`), positioning, overflow, and background colors. This is the #1 source of porting bugs.
3. **JavaScript/animation**: Trace execution order. What runs on load? On scroll? On interaction? Map the timeline of events.
4. **Assets**: List every image, model, font, and video. Note paths and formats.
5. **Dependencies**: List every library with version. Check which exist in the toolkit (see `.agents/contexts/toolkit.md`).

### Browser-based analysis

If the original has a live URL, use browser tools to observe:
- Animation sequence and timing (load -> preloader -> reveal -> scroll sections)
- Scroll behavior (smooth scroll, pinned sections, parallax)
- Interaction model (hover effects, click targets, drag)
- Responsive behavior at different viewport sizes

### Dependency inventory

Map source dependencies to experiment equivalents:

| Source Dependency | Experiment Equivalent | Skill Reference |
|---|---|---|
| `gsap` (vanilla) | `gsap` + `@gsap/react` (`useGSAP`) | `.agents/skills/gsap-modern/SKILL.md` |
| `gsap/ScrollTrigger` | Same, with `createUnifiedScroll` | `.agents/skills/lenis-scroll/SKILL.md` |
| `lenis` (standalone) | `createUnifiedScroll` from `@/lib/toolkit/scroll` | `.agents/skills/lenis-scroll/SKILL.md` |
| `three` (vanilla) | `@react-three/fiber` + `@react-three/drei` | `.agents/skills/r3f-core/SKILL.md` |
| `three` shaders | R3F `<shaderMaterial>` + TS template strings | `.agents/skills/shader-authoring/SKILL.md` |
| `requestAnimationFrame` | `useFrame` (R3F) or Tempus | `.agents/skills/tempus-raf/SKILL.md` |
| `framer-motion` | `motion/react` (same library, renamed) | `.agents/skills/motion-react/SKILL.md` |
| jQuery / vanilla DOM | React refs + `useGSAP` or `useEffect` | -- |
| CSS animations | Keep as CSS, or migrate to GSAP for complex sequencing | `.agents/rules/animations.md` |

### Animation timeline mapping

Document the sequence before implementing:
```
load -> counter preloader (0-100, 2s)
     -> clip-path reveal on hero bg (0.8s, power4.inOut)
     -> SplitText char reveal stagger (0.6s, 0.02s stagger)
     -> nav fade in (0.4s)
scroll -> section 1 pin (start: "top top", end: "+=200%")
       -> section 2 parallax (scrub: true)
```

### Content-to-timing coupling

Scroll-driven animations calibrate phase breakpoints (progress thresholds like 0.4, 0.5, 0.75) to the original's content block count. The scroll distance is typically `blockCount * viewportHeight`, so each block maps to a fixed progress range. Adding or removing content blocks changes the denominator, misaligning every phase.

Before implementing, verify:
1. How many content blocks does the original have?
2. What is the scroll distance (`end` value in ScrollTrigger)?
3. Which phase breakpoints align with which content blocks?

If the port changes the content structure, ALL phase breakpoints must be recalibrated.

## Phase 1: Classify and Choose Profile

### Source type classification

| Source Type | What to Extract | Notes |
|---|---|---|
| **Standalone demo** (Vite, CodeSandbox, Codegrid) | HTML structure, CSS file(s), JS entry point | Often vanilla or minimal framework. Map DOM to React JSX. |
| **Website / landing page** | Sections, animations, assets | Identify scroll vs timeline vs interaction patterns. |
| **Repo** (Next.js, Vite, Astro) | Entry routes, components, styles, public assets | May have build steps; extract what runs in browser. |
| **Snippet** (Gist, tweet, CodePen) | Isolated effect or component | Often missing context; infer stacking and dependencies. |
| **Component** (shadcn, Radix, custom) | Props API, styles, behavior | May need adaptation to experiment isolation. |

### Profile decision matrix

| Source Characteristics | Profile | Toolkit |
|---|---|---|
| Scroll-driven animation, Lenis, ScrollTrigger pins | `scrollytelling` | `--toolkit` |
| Three.js scene with models, lights, camera movement | `r3f-scene` | `--toolkit` |
| Fullscreen shader, ShaderMaterial, fragment-only art | `r3f-shader` | `--toolkit` |
| Hover effects, drag, springs, gesture-driven | `interaction` | `--no-toolkit` |
| CSS effects, Canvas 2D, DOM manipulation | `dom-effect` | `--no-toolkit` |
| Audio synthesis, Web Audio API | `web-audio` | `--no-toolkit` |
| DOM + GSAP timeline only, no scroll tooling | `blank` | `--no-toolkit` |
| Scroll + 3D + interaction combined | `scrollytelling` (base) | `--toolkit` |

For mixed experiments (scroll + 3D, scroll + interaction), scaffold with `scrollytelling` as base and add layers. Read `.agents/profiles/mixed.md` for the layer-cake architecture.

### Multi-demo showcase pattern

When porting N demos into sections of a single experiment (e.g., a showcase page), use the orchestrator + sections decomposition from `.agents/rules/experiments.md`:

```
src/components/experiments/<name>/
  <Name>.tsx                 Thin orchestrator: scroll setup, section composition
  data.ts                    Content constants for ALL sections
  store.ts                   Zustand store for cross-section state (if needed)
  hooks.ts                   Shared hooks (usePrefersReducedMotion, etc.)
  sections/
    DemoOneSection.tsx        Port of demo 1 -- own refs, own useGSAP scope
    DemoTwoSection.tsx        Port of demo 2 -- own refs, own useGSAP scope
    ...
  canvas/                    R3F components (if any section uses 3D)
  shaders/                   GLSL shader strings (if any section uses shaders)
```

Each section is a self-contained port. The orchestrator handles scroll initialization (`createUnifiedScroll`) and section composition -- no animation code in the orchestrator.

## Phase 2: Scaffold and Structure

Scaffold first via `.agents/workflows/new-experiment.md`. Extract all hardcoded text, labels, and config values from the source into `data.ts` immediately. Name magic numbers as constants. Copy assets to `public/experiments/<name>/` and transform all paths (see Phase 5).

## Phase 3: Tech Stack Transformations

The core of porting: converting source patterns to experiment equivalents. Each transformation has a before/after code example and cross-references the relevant skill.

See [transformations.md](transformations.md) for the full reference with code examples. Key transformations:

- **Vanilla GSAP -> `useGSAP`**: `DOMContentLoaded` + `gsap.to()` becomes `useGSAP(() => { ... }, { scope, dependencies })`. See `.agents/skills/gsap-modern/SKILL.md`.
- **`DOMContentLoaded` -> React lifecycle**: the `dependencies: [ready]` pattern with `requestAnimationFrame`-delayed ready state.
- **Vanilla Lenis -> `createUnifiedScroll`**: remove source's Lenis + ticker integration, call `createUnifiedScroll()` once in orchestrator. See `.agents/skills/lenis-scroll/SKILL.md`.
- **Vanilla Three.js -> R3F**: `new Scene()` + camera + renderer becomes `<ExperimentCanvas>`. `GLTFLoader` -> `useGLTF`. Render loop -> `useFrame`. See `.agents/skills/r3f-core/SKILL.md`.
- **Vanilla shaders -> R3F ShaderMaterial**: keep GLSL verbatim, wrap in TS template strings, `useMemo` for uniforms, `useFrame` for updates. See `.agents/skills/shader-authoring/SKILL.md`.
- **Imperative DOM -> React refs**: `querySelector` -> `useRef`, `element.remove()` -> `gsap.set(ref.current, { autoAlpha: 0 })`. Keep imperative patterns inside `useEffect` when fundamentally procedural.
- **Global CSS -> scoped CSS**: prefix every class with `<slug>-`. Use imported `.css` file or `<style>` JSX.

## Phase 4: CSS Fidelity

**This is the #1 source of porting bugs.** Do not add properties the original does not have. Diff every selector.

### Line-by-line comparison

1. List every selector and property in the original CSS.
2. For each property, ask: "Does the original have this?"
3. **Do not add** `background-color`, `opacity`, `z-index`, or layout properties "for consistency" unless the original has them.

### Stacking context

`z-index: -1` puts an element *behind* its stacking context. If the parent has `background-color`, that background paints *on top* of the child -- the image/effect becomes invisible.

**Before** (bug):
```css
.hero { position: relative; background-color: #000; }
.hero-bg { position: absolute; z-index: -1; }
/* .hero-bg is BEHIND .hero's background -- invisible */
```

**After** (fix):
```css
.hero { position: relative; }
.hero-bg { position: absolute; z-index: 0; }
.hero-content { position: relative; z-index: 1; }
```

Either remove the parent's `background-color` (if the original doesn't have it), or raise the child to `z-index: 0` and put content at `z-index: 1+`.

### Hide-until-reveal

`translateX(100%)` / `translateY(100%)` moves elements but may still allow peeking depending on viewport, overflow, and stacking.

**Prefer `clip-path`** for fully invisible until reveal:
```tsx
gsap.set(wrapperRef.current, { clipPath: "inset(0 100% 0 0)" })

gsap.to(wrapperRef.current, {
  clipPath: "inset(0 0% 0 0)",
  duration: 0.8,
  ease: "power4.inOut",
})
```

Combine with SplitText char/word animation for staggered text reveals.

### Class name scoping

Prefix every class with the experiment slug:

| Original Class | Ported Class |
|---|---|
| `.hero` | `.<slug>-hero` |
| `.nav` | `.<slug>-nav` |
| `.container` | `.<slug>-container` |

In multi-section ports, each section can use its own prefix (`<slug>-section1-`, `<slug>-section2-`) or a shorter unique prefix per section.

## Phase 5: Common Pitfalls

| Pitfall | Cause | Fix |
|---|---|---|
| Image/background not visible | Parent has `background-color` + child has `z-index: -1` | Remove parent bg or raise child z-index; match original structure |
| Text peeking behind preloader | `translateX(100%)` insufficient in new layout | Use `clip-path: inset(0 100% 0 0)` on wrapper |
| Animation never runs | Refs null when `useGSAP` callback runs | Add `dependencies: [ready]` with `ready` state set in `useEffect` + `requestAnimationFrame` |
| Styles leak between sections | Global CSS without scoping | Prefix all class names with experiment slug |
| SplitText/GSAP errors | Plugin not registered or DOM not ready | `gsap.registerPlugin(SplitText)` at module level; run SplitText after refs exist |
| Lenis double-initialization | Source creates its own Lenis + parent calls `createUnifiedScroll` | Remove source's Lenis instantiation; use `createUnifiedScroll` once in orchestrator |
| GSAP plugin not found | Plugin imported but not registered | Register all plugins (`ScrollTrigger`, `SplitText`, `CustomEase`) at module level before use |
| Asset 404 | Paths still reference source structure (e.g., `/hero.jpg`) | Transform all paths to `/experiments/<name>/file.ext` |
| Three.js memory leak in R3F | Resources not disposed on unmount | Use `useEffect` cleanup to dispose geometries, materials, textures; R3F auto-disposes declarative objects |
| `<style>` JSX specificity conflict | Multiple sections embed overlapping selectors | Use unique prefixes per section or consolidate into a single CSS file |
| Animation phases misaligned | Port adds/removes content blocks without recalibrating scroll breakpoints | Verify original block count matches port; recalibrate all phase thresholds if structure changes (see Phase 0 "Content-to-timing coupling") |
| `position: fixed` elements flash wrong state | Pinned section sits below preloader/other sections; fixed children visible before ScrollTrigger activates | Set initial animation states via `gsap.set` before `ScrollTrigger.create`; see `scrollytelling.md` "Fixed-Position Elements" |
| Lenis not active when ScrollTrigger created | Orchestrator uses `useEffect` for `createUnifiedScroll`; child `useGSAP` fires first | Use `useLayoutEffect` in orchestrator (see `scroll.md` canonical pattern) |

## Phase 6: Reduced Motion

Follow `.agents/rules/animations.md` reduced motion standards. Critical for ports: use `gsap.set` to reveal all content when motion is reduced. Never `if (reduced) return` before setting content visible -- this leaves `opacity: 0` elements invisible. For scroll-pinned sections: skip the pin, set all content visible, maintain readable scroll position.

## Phase 7: Assets

Transform all paths from source: `/hero.jpg` -> `/experiments/<name>/hero.jpg`. Use raw `<img>` (not Next.js `<Image>`) for GSAP-animated images. Full asset guidelines (formats, size limits, 3D models, fonts, video): `.agents/workflows/add-experiment-assets.md`.

## Phase 8: Dev Tooling

`<DevToolsInjector />` is auto-included by the scaffolder. Wire up the porting-specific pieces:

- **Scroll ports**: Pass `debug: isDebug` to `createUnifiedScroll()` (exposes `window.__lenis`, `__scrollToSection`, `__scrollToProgress` for MCP browser scroll).
- **R3F ports**: Add `<R3FDevToolsInjector />` inside Canvas if you added a Canvas to a non-R3F scaffold.
- **Tweakable params**: Wrap ported magic numbers with `useDevControls` for live tweaking via `?debug`.
- **Timeline debugging**: Connect complex ported timelines with `useGSAPDebug(tl.current, "label")`.

Full dev tooling reference: `.agents/workflows/develop-experiment.md` step 7. Metrics and QA: `.agents/skills/visual-qa/SKILL.md`.

## Phase 9: Porting Checklist

Before calling the port complete (highest-risk items first):

- [ ] **CSS fidelity**: every property in ported styles exists in the original. No added `background-color`, `z-index`, or layout.
- [ ] **Stacking**: image/background elements visible. No solid layers obscuring effects.
- [ ] **Hide-until-reveal**: elements use `clip-path` or equivalent, not just `translate`.
- [ ] **Class scoping**: all class names prefixed with experiment slug.
- [ ] **Refs/timing**: `useGSAP` runs when refs are set. Use `dependencies: [ready]` if needed.
- [ ] **Reduced motion**: `gsap.set` reveals all content. No early returns leaving elements invisible.
- [ ] **Assets**: all in `public/experiments/<name>/`, paths transformed.
- [ ] **Dev tooling**: scroll debug wired, R3F injector added (if applicable), tweakable params exposed.
- [ ] **Content extraction**: all text and config in `data.ts`.

## Phase 10: Validation

You cannot see the output. After porting:

1. Ask user to validate at `/experiments/<name>`: layers visible, no peeking, animation timing matches, scroll behavior matches, responsive at mobile/tablet.

2. **Debug cycle** when user reports issues:
   a. Classify symptom: invisible elements -> Phase 4 (stacking). Content peeking -> Phase 4 (hide-until-reveal). Animation wrong -> [transformations.md](transformations.md). Performance -> Phase 8 (dev metrics).
   b. Apply the fix from the referenced phase.
   c. Ask user to re-validate the specific symptom.
   d. If not resolved after 2 attempts, follow AGENTS.md 2-iteration limit: summarize what was tried, present 2-3 alternatives.

3. For structured visual review: `.agents/skills/visual-qa/SKILL.md`.

## Quick Reference: Original -> Experiment

| Original | Experiment |
|---|---|
| `body { background }` | Page/layout wrapper or `body` in experiment layout |
| `section.hero` | `<section>` in component, styles in scoped CSS |
| `img src="/hero.jpg"` | `src="/experiments/<name>/hero.jpg"` in `public/experiments/<name>/` |
| `document.querySelector(".el")` | `useRef<HTMLDivElement>(null)` + `ref={elRef}` |
| `DOMContentLoaded` callback | `useGSAP(() => { ... }, { scope, dependencies: [ready] })` |
| `gsap.to(...)` | Same API, wrapped in `useGSAP` with scoped container |
| `SplitText.create(el, ...)` | Same API, using refs. Ensure refs exist before create. |
| `new Lenis({ ... })` | `createUnifiedScroll()` in orchestrator's `useEffect` |
| `gsap.ticker.add(lenis.raf)` | Handled by `createUnifiedScroll` automatically |
| `new THREE.Scene()` | `<ExperimentCanvas>` (scene, camera, renderer all implicit) |
| `new GLTFLoader().load(url)` | `useGLTF("/experiments/<name>/model.glb")` |
| `requestAnimationFrame(loop)` | `useFrame((state, delta) => { ... })` |
| `element.remove()` | `gsap.set(ref.current, { autoAlpha: 0 })` |
| Global CSS file | `import "./styles.css"` in component; prefix all selectors with `<slug>-` |
