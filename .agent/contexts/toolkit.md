# Creative Toolkit Reference

> All available libraries, versions, and when to use each

## Tier 1: Core Infrastructure (always available)

| Library | Version | Import | Purpose | Installed? |
|---------|---------|--------|---------|------------|
| **Lenis** | 1.3.18 | `lenis`, `lenis/react` | Smooth scroll, `<ReactLenis>`, `useLenis` | YES |
| **Tempus** | 1.0.0-dev.17 | `tempus`, `tempus/react` | Unified RAF manager, priority system, `useTempus` | YES |
| **Hamo** | 1.0.0-dev.10 | `hamo` | Performance hooks: `useRect`, `useWindowSize`, `useResizeObserver`, `useLazyState` | YES |
| **GSAP** | 3.14.x | `gsap`, `gsap/ScrollTrigger`, `@gsap/react` | Animation engine, ScrollTrigger, `useGSAP` hook | YES |
| **Motion** | 12.x | `motion/react` | React animations, layout, gestures, springs, `useScroll` | YES |
| **R3F** | latest | `@react-three/fiber` | React renderer for Three.js | YES |
| **Drei** | latest | `@react-three/drei` | R3F helpers (Environment, OrbitControls, Text, Html, etc.) | YES |

### Key Integration Patterns

**Lenis + GSAP**: Set `autoRaf: false` on Lenis, drive from GSAP ticker. See `skills/lenis-scroll.md`.

**Tempus unification**: Put Lenis (priority -1), GSAP (priority 0), and Three.js rendering (priority 1) under one RAF loop. See `skills/tempus-raf.md`.

**Hamo lazy mode**: `useRect({ lazy: true, callback })` for animation-safe measurements that don't trigger re-renders.

### Integration Layer (`src/lib/toolkit/`)
- `src/lib/toolkit/scroll.ts` -- `createLenisScroll(options?)` / `destroyLenisScroll(lenis)` -- Lenis + GSAP ScrollTrigger wiring
- `src/lib/toolkit/raf.ts` -- `Tempus` re-export + `setupUnifiedRAF()` -- puts GSAP under Tempus's RAF loop
- `src/lib/toolkit/r3f.tsx` -- `ExperimentCanvas` -- Canvas wrapper with `dpr={[1,2]}`, Suspense, Preload
- `src/lib/toolkit/index.ts` -- barrel re-exports all of the above

These are thin integration layers, not abstractions. Experiments import directly from the libraries for everything else.

### Dev Tools (`src/components/dev/`)
- `ExperimentDevMetrics` -- Console-piped FPS, heap, CLS (auto-injected in new experiment layouts)
- `R3FDevMetrics` -- Console-piped draw calls, triangles, geometries, textures (inside Canvas)
- `R3FSceneInspector` -- Scene graph text tree logged to console (inside Canvas)
- `scripts/capture.mjs` -- Playwright screenshot: `npm run capture <slug> [--delay ms] [--scroll %] [--viewport WxH] [--full-page] [--og]`
- `scripts/validate-experiments.mjs` -- Validates all experiment.json files (required fields, enum values, no duplicate slugs)

### Publishing Pipeline (`src/components/mdx/`, `src/components/ui/ArticleLayout.tsx`, `src/lib/articles.ts`)
- `ArticleLayout` -- Two-column article layout with header, reading time, sticky TOC sidebar
- `articleComponents` -- MDX component map for article rendering (headings, code blocks, tables, callouts, live demos)
- `CodeBlock`, `Callout`, `LiveDemo`, `CodeStep`, `TableOfContents` -- Individual MDX components
- `getArticles()` -- Scans experiments for `article/content.mdx`, parses frontmatter with gray-matter
- `next-mdx-remote/rsc` -- Renders MDX at build time with rehype-pretty-code, remark-gfm, rehype-slug
- Dynamic OG route at `/api/og?title=...&tags=...` -- Edge runtime ImageResponse
- Article plop generator: `npm run new:article` scaffolds article/ + docs/ directories

## Tier 2: Domain Libraries (import per-experiment)

| Library | Version | Import | When to Use |
|---------|---------|--------|-------------|
| **r3f-scroll-rig** | 8.15.x | `@14islands/r3f-scroll-rig` | DOM-synced WebGL, shared `<GlobalCanvas>` across pages |
| **react-vfx / vfx.js** | 0.13.x / 0.8.x | `react-vfx`, `@vfx-js/core` | Shader effects on DOM elements (glitch, RGB shift, halftone) |
| **StringTune** | 1.1.x | `@fiddle-digital/string-tune` | Attribute-based scroll effects, parallax, magnetic cursor |
| **@react-three/timeline** | 0.3.x | `@react-three/timeline` | Generator-based 3D animation composition (pre-1.0) |
| **r3f-perf** | latest | `r3f-perf` | R3F performance monitoring (dev only) |
| **@react-three/postprocessing** | latest | `@react-three/postprocessing` | Post-processing effects (bloom, DOF, vignette) |
| **@react-three/rapier** | latest | `@react-three/rapier` | Physics engine for R3F |
| **Theatre.js** | latest | `@theatre/core`, `@theatre/r3f` | Visual animation timeline editor |
| **leva** | latest | `leva` | Debug GUI for parameter tweaking |
| **@use-gesture/react** | latest | `@use-gesture/react` | Gesture recognition (drag, pinch, scroll, hover) |

### Notes on Tier 2
- **r3f-scroll-rig**: pinned to R3F v8 -- may need migration for R3F v9+
- **@react-three/timeline**: pre-1.0, API still evolving. Scroll-binding feature not yet implemented.
- **StringTune**: vanilla JS, not React-specific. Needs refs and manual lifecycle in React.

## Tier 3: UI Component Primitives (copy-paste, shadcn-style)

| Library | Install | Components Available |
|---------|---------|---------------------|
| **motion-primitives** | `npx motion-primitives@latest add <name>` | text-effect, text-shimmer, text-scramble, magnetic, tilt, spotlight, progressive-blur, morphing-dialog, border-trail, image-comparison, infinite-slider, scroll-progress |
| **animate-ui** | `npx shadcn@latest add "https://animate-ui.com/r/<name>"` | Animated tabs, accordion, tooltip, sliding-number, collapsible, animated Lucide icons |
| **Cambio** | `npm i cambio` | Shared element animations (trigger-to-popup morphing). Requires React 19 + Base UI beta. Early stage. |

## Existing Shared UI

Located in `src/components/ui/`:
- shadcn/ui components (button, card, drawer, badge, scroll-area, separator)
- Custom cursor system (`cursor/`)
- Experiment list UI with filters (`experiments/`)
- Location/weather display components
- GrainOverlay, ThemeAwareWaves, ScrambleTicker

---

## Publishing Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next-mdx-remote` | ^6.0.0 | RSC-compatible MDX rendering |
| `remark-gfm` | ^4.0.1 | GitHub Flavored Markdown |
| `rehype-pretty-code` | ^0.14.3 | Syntax highlighting in articles |
| `shiki` | ^4.0.1 | Highlighting engine |
| `rehype-slug` | ^6.0.0 | Heading IDs for TOC |
| `gray-matter` | ^4.0.3 | YAML frontmatter parsing |
| `reading-time-estimator` | ^2.1.1 | Reading time in article headers |
| `@tailwindcss/typography` | ^0.5.19 | Prose styling (wired into tailwind.config.ts) |
| `@codesandbox/sandpack-react` | latest | Interactive in-browser code playgrounds for MDX articles, used via SandpackDemo component |

## Quality Infrastructure

| Tool | Purpose |
|------|---------|
| **Biome** (via Ultracite) | Linting + formatting. Replaces ESLint + Prettier. Rust-speed, single tool. |
| `ultracite check` / `ultracite fix` | CLI commands for lint + format (aliased as `npm run lint` / `npm run fix`) |
| `biome.jsonc` | Config extending `ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/next` |
| `lefthook` | Pre-commit hooks (ultracite fix with stage_fixed, typecheck, validate experiments) |
| `.github/workflows/ci.yml` | GitHub Actions CI (lint, typecheck, unit tests, build) |
| `scripts/validate-experiments.mjs` | experiment.json validation |
| View Transitions API | CSS `@view-transition { navigation: auto; }` in globals.css and experiments.css, `view-transition-name` on experiment cards and back button |

**Note**: ESLint, eslint-config-next, and eslint-plugin-storybook have been removed. Biome handles all JS/TS/JSX/TSX/JSON/CSS linting and formatting.
