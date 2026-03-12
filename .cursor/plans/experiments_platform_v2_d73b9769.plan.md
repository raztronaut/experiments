---
name: Experiments Platform V2
overview: Rebuild the experiments platform's foundations to be AI-native, standing on proven creative engineering toolkits, with visual feedback systems that let AI agents "see" their work, publishable-by-default experiments, and a cc-settings-inspired configuration layer that makes AI-driven development the primary mode of operation.
todos:
  - id: ai-config-agents-md
    content: "Write new AGENTS.md with portable coding standards (cc-settings inspired): 2-iteration limit, visual honesty, pre-commit verification, context hygiene, stealth mode, tech stack declaration"
    status: completed
  - id: ai-config-rules
    content: "Create path-conditioned rules: r3f.md, shaders.md, animations.md, scroll.md, performance.md (each <2K tokens, loads only when relevant)"
    status: completed
  - id: ai-config-profiles
    content: "Create experiment profiles: r3f-scene.md, shader-art.md, scrollytelling.md, interaction.md, dom-effect.md (modeled on darkroom's webgl.md)"
    status: completed
  - id: ai-config-skills-overhaul
    content: "Replace 8 verbose skills with 8 focused skills (<5K tokens each): lenis-scroll, gsap-modern, r3f-core, shader-authoring, motion-react, tempus-raf, visual-qa, vercel-react-best-practices"
    status: completed
  - id: ai-config-workflows
    content: "Update existing workflows + add new ones: visual-qa.md, publish-experiment.md"
    status: completed
  - id: toolkit-tier1-install
    content: "Install and configure Tier 1 libs: Lenis, Tempus, Hamo. Create integration layer in src/lib/toolkit/ (scroll.ts, raf.ts, r3f.ts)"
    status: completed
  - id: toolkit-replace-hooks
    content: Replace custom hooks with Hamo equivalents where appropriate (useElementSize -> useRect, etc.)
    status: completed
  - id: metadata-v2
    content: Expand experiment.json schema with profile, status, tags, tech, complexity, inspiration, related, publishable fields. Update getExperiments() + homepage filtering
    status: completed
  - id: template-system-v2
    content: Build 7 experiment templates (r3f-scene, r3f-shader, scrollytelling, interaction, web-audio, dom-effect, blank) with toolkit integration + working demos
    status: completed
  - id: visual-capture-script
    content: Build Playwright-based capture script (scripts/capture.mjs) that takes experiment screenshots. Usable by AI agents via shell command.
    status: completed
  - id: dev-metrics-component
    content: Build ExperimentDevMetrics component that logs FPS, memory, draw calls to console in dev mode. Inject at layout level in experiment templates.
    status: completed
  - id: r3f-scene-inspector
    content: Build scene graph serializer for R3F experiments that outputs text description of 3D scene to console (objects, geometries, materials, camera)
    status: completed
  - id: visual-qa-workflow
    content: "Write .agent/workflows/visual-qa.md teaching AI agents systematic visual validation: capture, inspect metrics, verify scene, iterate"
    status: completed
  - id: publishing-pipeline
    content: Set up MDX article architecture alongside experiments. Create publish-experiment workflow for AI-generated technical articles.
    status: completed
  - id: github-actions-ci
    content: "Set up GitHub Actions: lint, type check, test, build, Lighthouse CI on recent experiments"
    status: completed
  - id: view-transitions
    content: Add View Transitions API for homepage-to-experiment navigation (CSS-only, minimal code)
    status: completed
isProject: false
---

# Experiments Platform V2: AI-Native Creative Engineering Lab

This is a ground-up rethinking. The previous plan focused on human convenience (CLI, extracting from past code). This plan focuses on:

- **AI agents are the primary builders** -- everything should make agents more effective, not just humans
- **Stand on giants** -- adopt proven libraries, don't reinvent
- **Publishable by default** -- every experiment should be close to an article, package, or client deliverable
- **Zero-config foundation** -- tooling at the layout/infra level, not per-experiment setup
- **Non-constraining** -- the foundation enables creativity, never limits it

---

## 1. AI Coding Configuration (cc-settings-Inspired)

**This is the single highest-leverage change.** Modeled on [darkroom.engineering/cc-settings](https://github.com/darkroomengineering/cc-settings) but adapted for an experiment-centric creative coding lab.

### Layered Config Architecture

Replace the current flat `.agent/` structure with a layered system that minimizes token overhead:

```
.agent/
  AGENTS.md                    # ~1500 tokens. Portable coding standards for all AI tools
  rules/
    experiments.md             # Always-on: isolation architecture, scaffolding
    r3f.md                     # Path-conditioned: loads when touching R3F files
    shaders.md                 # Path-conditioned: loads for .glsl, shader utils
    animations.md              # Path-conditioned: GSAP/Motion patterns
    scroll.md                  # Path-conditioned: Lenis/scroll-driven work
    audio.md                   # Path-conditioned: Web Audio API patterns
  profiles/
    r3f-scene.md               # Activates for R3F experiments
    shader-art.md              # Activates for pure shader experiments
    scrollytelling.md          # Lenis + GSAP ScrollTrigger + pinning
    interaction.md             # Motion + gesture + spring experiments
    web-audio.md               # Audio synthesis experiments
  workflows/
    new-experiment.md          # Updated: template-aware, profile-setting
    develop-experiment.md      # Updated: toolkit-aware, visual QA integrated
    publish-experiment.md      # NEW: article generation + social assets
    ship-experiment.md         # NEW: quality gates, registry, metadata finalization
    visual-qa.md               # NEW: how AI validates visual output
  skills/                      # Replaced with higher-quality, concise skills
  contexts/
    toolkit.md                 # Documents all available creative libraries + versions
    architecture.md            # Experiment architecture overview for fast onboarding
```

### Key Principles to Adopt from cc-settings AGENTS.md

- **2-iteration limit**: If an approach fails twice, STOP. Present 2-3 alternatives with trade-offs.
- **Visual/spatial honesty**: For WebGL, shaders, physics, animations -- acknowledge limitations upfront. Provide best-effort with clear TODOs. Suggest the user validate visually.
- **Pre-commit verification**: `tsc --noEmit` + build + tests must pass before any commit.
- **Bug fix scope**: Stay confined to files directly related to the bug. No drive-by refactors.
- **Context hygiene**: Offload large tool outputs to scratch files instead of carrying them in context.
- **Stealth mode**: No AI fingerprints in git history or PR descriptions.

### Profile System

Each experiment type gets a profile (like [darkroom's webgl.md](https://raw.githubusercontent.com/darkroomengineering/cc-settings/main/profiles/webgl.md)). A profile contains:

1. Behavioral mode (what to optimize for)
2. Priority ordering (frame rate > memory > correctness > ...)
3. Toolkit setup patterns (Lenis + GSAP wiring, R3F Canvas config, etc.)
4. Common gotchas and fixes
5. Pre-implementation checklist

AI agents activate the right profile based on the `profile` field in `experiment.json` or by detecting the experiment type from imports.

### Skills Overhaul

Replace the current 8 symlinked skills (many are verbose and overlap) with focused, concise skills modeled on cc-settings' approach. Each skill should be under 5K tokens. Focus areas:


| Skill              | What It Teaches                                                                      |
| ------------------ | ------------------------------------------------------------------------------------ |
| `lenis-scroll`     | Lenis setup, Lenis + GSAP ScrollTrigger integration, scroll-to, React wrapper        |
| `gsap-modern`      | useGSAP hook, ScrollTrigger, timelines, context cleanup, dynamic import (no SSR)     |
| `r3f-core`         | Canvas config, useFrame, cleanup/disposal, instancing, responsive DPR                |
| `r3f-scroll-3d`    | Scroll-driven 3D with Lenis + R3F, r3f-scroll-rig patterns                           |
| `shader-authoring` | ShaderMaterial setup, uniform management, GLSL utility patterns                      |
| `motion-react`     | Motion (Framer Motion) layout animations, AnimatePresence, spring physics, gestures  |
| `web-audio`        | AudioContext, oscillators, gain nodes, procedural synthesis, interaction triggers    |
| `tempus-raf`       | Tempus unified RAF, priority system, integration with Lenis and GSAP                 |
| `visual-qa`        | How to validate visual output as an AI agent (screenshot, metrics, scene inspection) |
| `publishing`       | How to structure an experiment for article generation and sharing                    |


---

## 2. Creative Toolkit Foundation (Standing on Giants)

Instead of building custom micro-libraries, adopt proven ones and pre-configure them. The goal: when any experiment is scaffolded, the creative toolkit is available with zero setup.

### Tier 1: Core Infrastructure (always installed, pre-configured)


| Library                                                                | Purpose                                                                         | Replaces                                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **[Lenis](https://github.com/darkroomengineering/lenis)** (10K+ stars) | Smooth scroll                                                                   | Native scroll, custom scroll handlers                                          |
| **[Tempus](https://github.com/darkroomengineering/tempus)**            | Unified RAF manager                                                             | Scattered `requestAnimationFrame` calls                                        |
| **[Hamo](https://github.com/darkroomengineering/hamo)**                | Performance hooks (`useRect`, `useWindowSize`, `useFrame`, `useResizeObserver`) | Custom `useElementSize`, `useMediaQuery`                                       |
| **GSAP**                                                               | Animation engine                                                                | Already used, but needs consistent patterns (dynamic import, useGSAP, cleanup) |
| **Motion** (Framer Motion)                                             | React animations, layout, gestures                                              | Already used, standardize patterns                                             |


### Tier 2: Domain Libraries (imported per-experiment)


| Library                                                           | Purpose                                                    | When to Use                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------- |
| **[@react-three/timeline](https://github.com/pmndrs/timeline)**   | Composable 3D animation stories with async/yield           | Sequenced 3D animations, cinematics          |
| **[r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig)** | DOM-synced WebGL, progressive enhancement                  | Experiments mixing DOM and 3D in scroll      |
| **[react-vfx / vfx.js](https://amagi.dev/vfx-js/)**               | WebGL shader effects on DOM elements                       | Glitch, RGB shift, halftone on HTML elements |
| **[StringTune](https://string-tune.fiddle.digital/)**             | Attribute-based scroll effects, parallax, magnetic, cursor | Rapid scroll-driven DOM effects              |
| **r3f-perf**                                                      | R3F performance monitoring                                 | All R3F experiments in dev                   |
| **Theatre.js**                                                    | Visual animation timeline editor                           | Complex animation choreography               |


### Tier 3: UI Component Primitives (copy-paste, shadcn-style)


| Library                                                     | Purpose                                                                                     | When to Use                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **[motion-primitives](https://motion-primitives.com/docs)** | Morphing dialog, text effects, magnetic, progressive blur, infinite slider, spotlight, tilt | When building polished UI interactions      |
| **[animate-ui](https://animate-ui.com/)**                   | Animated Radix/Base UI primitives, animated Lucide icons                                    | When you need animated UI components        |
| **[Cambio](https://cambio.raphaelsalaja.com/)**             | Shared element animations (trigger -> popup morphing)                                       | Shared animation transitions between states |


### Integration Layer

Create a thin `src/lib/toolkit/` that wires these together:

- `src/lib/toolkit/scroll.ts` -- Lenis + GSAP ScrollTrigger integration (the pattern from darkroom's webgl.md profile)
- `src/lib/toolkit/raf.ts` -- Tempus instance, exported for experiments to subscribe to
- `src/lib/toolkit/r3f.ts` -- Standard Canvas wrapper with responsive DPR, dev perf overlay, Suspense + loader

These are NOT abstractions that hide the libraries. They're thin integration layers that prevent repetitive wiring. Experiments import directly from the libraries for everything else.

---

## 3. Visual Feedback Bridge (Solving AI Blindness)

**This is the most novel section.** AI agents write shaders, 3D scenes, and animations but cannot see the output. This section creates bridges so agents can validate their work.

### A. Experiment Capture MCP Tool

A lightweight MCP server (built with [xmcp](https://xmcp.dev/) from basement studio, or a simpler custom one) that AI agents call from within Cursor/Claude:

```
captureExperiment(slug)                    -> Returns screenshot PNG
captureExperimentAt(slug, scrollPercent)   -> Screenshot at scroll position
captureExperimentAfter(slug, delayMs)      -> Screenshot after waiting (for animations to settle)
describeScene(slug)                        -> For R3F: serialized scene graph as text
```

Implementation: A Next.js API route that uses Playwright to navigate to `localhost:3000/experiments/[slug]`, optionally performs actions, and returns a screenshot or scene description. AI agents call this via MCP or via a shell command like `node scripts/capture.mjs [slug]`.

### B. Console-Piped Dev Metrics

Since AI agents CAN read terminal output, pipe performance data to the console automatically in dev mode. An `ExperimentDevMetrics` component injected at the layout level (not the experiment level) that logs:

- FPS (average/min over 2-second windows)
- For R3F: draw calls, triangles, textures, programs, geometries
- For animations: active GSAP tweens count, timeline progress
- Memory usage (JS heap)
- Any layout shift warnings

This component is in the experiment layout template, not in individual experiment code. It runs in dev only. The AI agent reads the dev server terminal to check these numbers.

### C. R3F Scene Inspector

For Three.js/R3F experiments, a utility that serializes the scene graph to text:

```
Scene (3 children)
  ├── AmbientLight (intensity: 0.5)
  ├── DirectionalLight (position: [10, 10, 5])
  └── Group "main" (2 children)
      ├── Mesh "hero" (BoxGeometry 1x1x1, MeshStandardMaterial color:#ff6600)
      └── Mesh "floor" (PlaneGeometry 10x10, MeshStandardMaterial color:#333333)
Camera: PerspectiveCamera (fov:50, position:[0,0,5])
Stats: 2 meshes, 2 geometries, 2 materials, 24 triangles
```

AI agents call this via the MCP tool or read it from console output. This gives them a "text representation" of the 3D scene they're building.

### D. Visual QA Workflow

A documented workflow (`.agent/workflows/visual-qa.md`) that teaches AI agents a systematic visual validation process:

1. Build the component
2. Ensure dev server is running
3. Capture screenshot via MCP tool or Playwright script
4. Check console metrics for performance issues (FPS < 55 = problem)
5. For R3F: run scene inspector, verify expected objects exist
6. For animations: capture multiple frames at different points to verify motion
7. If something looks wrong, describe what was expected vs. what the screenshot shows, and iterate

This is the "eyes" that AI agents currently lack. Even imperfect screenshots dramatically improve output quality.

---

## 4. Experiment Architecture V2

### Enriched Metadata Schema

```json
{
  "title": "...",
  "description": "...",
  "slug": "...",
  "created": "2026-03-06T00:00:00.000Z",
  "updated": "2026-03-06T00:00:00.000Z",
  "status": "wip",
  "profile": "r3f-scene",
  "tags": ["3d", "shader", "scroll"],
  "tech": ["r3f", "gsap", "lenis"],
  "complexity": "advanced",
  "inspiration": [{ "title": "...", "url": "..." }],
  "related": ["other-slug"],
  "publishable": false,
  "video": "...",
  "poster": "...",
  "isPlaceholder": true
}
```

The `profile` field is critical -- it tells AI agents which profile to activate. `status` enables filtering (wip/shipped/archived). `tags` and `tech` enable search and filtering on the homepage. `publishable` gates the content pipeline.

### Template System V2

Upgrade Plop (or replace with a script in `scripts/`) to support template variants. Each template scaffolds with the right toolkit imports, a working "hello world" for that type, and sets the correct profile:


| Template         | Scaffolds With                                              | Working Demo                                   |
| ---------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `r3f-scene`      | R3F Canvas, Drei, responsive camera, Tempus, r3f-perf (dev) | Rotating box with orbit controls and lighting  |
| `r3f-shader`     | R3F + custom ShaderMaterial, uniform wiring                 | Animated gradient shader on fullscreen quad    |
| `scrollytelling` | Lenis + GSAP ScrollTrigger, pinned sections                 | 3-section scroll with pin and fade transitions |
| `interaction`    | Motion + useGesture, spring physics                         | Draggable card with spring-back animation      |
| `web-audio`      | AudioContext, oscillator pattern                            | Click-triggered procedural sound               |
| `dom-effect`     | vfx.js or Motion, Tailwind animations                       | Text with glitch/shimmer effect                |
| `blank`          | Minimal shell only                                          | Empty component with tailwind                  |


Each template includes dev metrics at the layout level automatically. Each template sets `profile` in `experiment.json`. AI agents can scaffold by running the generator with a template flag.

### Layout-Level Dev Foundation

The experiment layout template (generated by Plop) automatically includes, with zero per-experiment setup:

```tsx
{process.env.NODE_ENV === 'development' && <ExperimentDevMetrics />}
```

For R3F templates, the Canvas wrapper also includes:

```tsx
{process.env.NODE_ENV === 'development' && <Perf position="top-left" />}
```

The experiment component file is a clean creative canvas. Tooling wraps it, never invades it.

---

## 5. Content Publishing Pipeline

Inspired by [RNDR Realm's gooey dropdown article](https://blog.rndrealm.com/gooey-dropdown), [Benji's morphing icons](https://benji.org/morphing-icons-with-claude), and [Cambio](https://cambio.raphaelsalaja.com/). Every experiment can optionally become a publishable piece.

### Article Architecture

MDX-based articles that live alongside experiments:

```
src/app/experiments/(my-experiment)/
  article/
    page.mdx           # The article content
    components.tsx      # Article-specific interactive demos (step-by-step builds)
```

Or a top-level `/articles/[slug]` route if articles should have separate URL structure.

The article format follows the RNDR Realm / Benji pattern:

- **Interactive live demos** embedded in the article (the experiment itself or simplified versions)
- **Step-by-step code progression** (show the basic version, then layer on complexity)
- **Clean, minimal presentation** -- code is the star, not prose
- **Sandboxed code blocks** for key patterns

### AI Article Generation Workflow

A workflow (`.agent/workflows/publish-experiment.md`) that an AI agent follows:

1. Read all source files for the experiment
2. Identify the 2-3 most interesting/novel techniques
3. Structure a step-by-step article (basic -> intermediate -> final)
4. Write MDX with embedded component imports for live demos
5. Extract shareable code snippets
6. Generate OG image via Playwright screenshot of the experiment
7. Set `publishable: true` in experiment.json

### Shareable Outputs

For experiments that become significant enough (like Cambio):

- **npm package extraction**: A workflow to isolate an experiment into a standalone package with proper `package.json`, exports, README, and examples
- **Registry entry**: Already have the shadcn-compatible registry; enhance it with interactive documentation pages
- **Social assets**: Auto-generated OG images, code snippet cards, short video captures

---

## 6. Quality Infrastructure

### GitHub Actions (Minimal but Meaningful)

```yaml
on: [push, pull_request]
jobs:
  quality:
    steps:
      - Lint + type check
      - Run tests
      - Build (includes registry + poster generation)
  lighthouse:
    steps:
      - Lighthouse CI on 3 most recent experiments
      - Performance score > 80 required
```

### Pre-commit Verification

Add a pre-commit hook (via lefthook or simple git hook):

- Type check (`tsc --noEmit`)
- Lint
- Validate all `experiment.json` files against schema

### View Transitions API

Add cross-document View Transitions for navigation between homepage and experiments. This is a CSS-only change using `@view-transition` at-rule and `view-transition-name` properties on experiment cards and layouts. Minimal code, high visual polish.

---

## 7. Tech Stack Decisions

### Adopt Now


| Current                                         | Replace With                                               | Why                                                      |
| ----------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| Custom `useElementSize` / `useMediaQuery` hooks | **Hamo** (`useRect`, `useWindowSize`, `useResizeObserver`) | Battle-tested, maintained by darkroom                    |
| Scattered `requestAnimationFrame`               | **Tempus**                                                 | Single RAF loop, priority system, auto-pause             |
| Native scroll                                   | **Lenis** (where smooth scroll desired)                    | Industry standard, integrates with GSAP ScrollTrigger    |
| ESLint 9                                        | Consider **Biome** (evaluate first)                        | Faster, simpler config. But only if migration is smooth. |
| Current skills (8, verbose, overlapping)        | New focused skills (10, concise, <5K tokens each)          | Less token overhead, more actionable                     |


### Keep

- **Next.js 16 App Router** -- already modern
- **Tailwind CSS** -- fine, consider v4 migration later
- **shadcn/ui** -- good component foundation
- **Storybook + Vitest** -- good testing/dev story
- **GSAP + Motion** -- both have their place (GSAP for scroll/timeline, Motion for React layout)

### Add

- **Tier 2 libraries** as documented in Section 2 (installed but imported only when used)
- **motion-primitives / animate-ui** components copied into `src/components/ui/` as needed
- **Playwright** for the visual capture pipeline (already a dependency via Storybook)

---

## 8. Migration Strategy

### Existing Experiments

Do NOT refactor. They are shipped portfolio pieces. Optionally add `"legacy": true` to their `experiment.json` so the system knows they predate the new toolkit.

### Going Forward

All new experiments use:

1. The new template system (scaffolded with toolkit)
2. The new AI coding config (profiles, rules, skills)
3. The new dev metrics foundation (layout-level, zero config)
4. The enriched metadata schema

### Skills Migration

1. Remove current `.agents/skills/` (verbose, overlapping)
2. Install new focused skills based on cc-settings patterns
3. Update `.agent/rules/` with path-conditioned rules
4. Add profiles for each experiment type
5. Update workflows to reference the toolkit

---

## Priority Ordering


| Priority | What                                                                       | Why First                                                         |
| -------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **P0**   | AI Coding Config overhaul (Section 1)                                      | Foundation for everything else. Every future experiment benefits. |
| **P0**   | Creative Toolkit installation + integration layer (Section 2, Tier 1 only) | Establishes the quality baseline for new experiments.             |
| **P1**   | Template System V2 with toolkit integration (Section 4)                    | Ensures new experiments start right.                              |
| **P1**   | Enriched metadata schema (Section 4)                                       | Low effort, enables filtering/search/AI context.                  |
| **P1**   | Visual Feedback Bridge - capture script + dev metrics (Section 3A + 3B)    | Immediately makes AI-driven development better.                   |
| **P2**   | Content publishing pipeline (Section 5)                                    | Start generating articles from experiments.                       |
| **P2**   | R3F Scene Inspector + Visual QA workflow (Section 3C + 3D)                 | Deeper AI visual validation.                                      |
| **P2**   | GitHub Actions CI (Section 6)                                              | Safety net for quality.                                           |
| **P3**   | MCP Server for experiment capture (Section 3A, full version)               | Richer AI integration.                                            |
| **P3**   | View Transitions API (Section 6)                                           | Polish.                                                           |
| **P3**   | Tier 2 + 3 library adoption (Sections 2)                                   | As experiments need them.                                         |
| **P3**   | Registry V2 with interactive docs (Section 5)                              | When there are enough good new experiments to showcase.           |


