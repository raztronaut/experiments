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

**Lenis + GSAP (canonical)**: Use `createUnifiedScroll()` from `@/lib/toolkit/scroll`. Drives Lenis from Tempus (priority -1), GSAP from Tempus (priority 0). The old `gsap.ticker.add` pattern is superseded. See `.agents/skills/lenis-scroll/SKILL.md` for detailed integration patterns and `useTempus` hook usage.

**Tempus unification**: Put Lenis (priority -1), GSAP (priority 0), and Three.js rendering (priority 1) under one RAF loop. See `skills/tempus-raf.md`.

**Hamo lazy mode**: `useRect({ lazy: true, callback })` for animation-safe measurements that don't trigger re-renders.

### Integration Layer (`src/lib/toolkit/`)
- `src/lib/toolkit/scroll.ts` -- `createUnifiedScroll(options?)` returns `{ lenis, destroy() }`. Lenis + GSAP + Tempus unified RAF (priority -1 Lenis, 0 GSAP, 1 Three.js). GSAP-Tempus binding is reference-counted across instances. `destroy()` disposes Tempus callbacks, kills only ScrollTriggers created by that instance, and restores GSAP's own ticker only when the last instance is destroyed. Accepts `{ debug: true }` to attach `window.__lenis`, `window.__scrollToSection(index)`, `window.__scrollToProgress(0-1)` for MCP browser tool scrolling (Lenis intercepts programmatic scroll).
- `src/lib/toolkit/raf.ts` -- `Tempus` re-export
- `src/lib/toolkit/r3f.tsx` -- `ExperimentCanvas` -- Canvas wrapper with `dpr={[1,2]}`, Suspense, Preload. Import directly from `@/lib/toolkit/r3f` (not via the barrel, to avoid pulling R3F into non-3D experiments).
- `src/lib/toolkit/index.ts` -- barrel re-exports `Tempus`, `createUnifiedScroll`, `UnifiedScrollHandle`. Does NOT re-export `ExperimentCanvas` (use direct import from `r3f.tsx`).

These are thin integration layers, not abstractions. Experiments import directly from the libraries for everything else.

### Hooks
- `src/hooks/useDevControls.ts` -- `useDevControls(folder, schema, options?)` -- Leva controls wrapper with dead-code elimination. Returns static defaults in production by default (leva tree-shaken from bundle). Pass `{ production: true }` to keep leva in production for showcase experiments that expose debug tools to visitors.

### Dev Tools (`src/components/dev/`)
- `DevToolsInjector` -- Auto-injected in all experiment layouts. Loads `ExperimentDevMetrics` + `DebugOverlay` in dev mode. Tree-shakes to nothing in production. Pass `production` prop to keep dev tools in production builds (used by showcase experiments for `?debug` visitor access).
- `ExperimentDevMetrics` -- Logs FPS, heap, CLS, GSAP active tween count every 2s via `console.warn` (warn level for MCP visibility). Also writes structured data to `window.__experimentMetrics` for programmatic querying.
- `DebugOverlay` -- Activates when `?debug` is in the URL (basement.studio Daylight pattern). Keyboard shortcuts: D (device info), L (leva panel toggle). GSDevTools loads automatically for GSAP experiments (H to hide, SPACE play/pause, I/O in/out markers).
- `R3FDevToolsInjector` -- Canvas-level companion to `DevToolsInjector`. Auto-injected in R3F Plop templates. Tree-shakes to nothing in production unless `production` prop is passed. All R3F dev tools (`R3FMetricsPiper`, `R3FSceneInspector`, r3f-perf panel, `DebugCamera`) are gated behind `?debug`. When `?debug` active: R3F metrics piped to `window.__experimentMetrics.r3f` and `.scene`, r3f-perf visual panel, camera helpers (O=Orbit, G=Grid).
- `DebugCamera` -- R3F camera helpers behind `?debug`. O key toggles orbit mode (free camera + gizmo), G key toggles grid helper.
- `R3FSceneInspector` -- Scene graph text tree logged via `console.warn` on mount + every 10s. Only active when `?debug` is in the URL.
- `src/hooks/useDebug.ts` -- `useDebug()` hook returns true when `?debug` is in the URL
- `src/hooks/useGSAPDebug.ts` -- `useGSAPDebug(timeline, id)` links a specific GSAP timeline to GSDevTools when `?debug` active (per official docs best practice)

**Queryable metrics for AI agents**: All dev metrics are written to `window.__experimentMetrics` (structured JSON with `fps`, `fpsMin`, `heap`, `cls`, `gsapTweens`, `r3f`, `scene`, `timestamp`). Agents using pinchtab or browser-devtools can query on demand: `eval("JSON.stringify(window.__experimentMetrics)")`.

### MCP Tools (configured in `.cursor/mcp.json`)
- **pinchtab** -- AI-optimized browser automation. `pinchtab nav/text/screenshot/snap/click`. Token-efficient (~800 tokens/page). Primary tool for QA and debugging.
- **Browser DevTools MCP** -- React DevTools, console capture, network, Web Vitals, annotated screenshots
- **context7** -- Library documentation lookup. `resolve-library-id` to find a library, then `query-docs` to fetch up-to-date docs and code examples (GSAP, Lenis, Drei, Three.js, etc.). Use before writing code with unfamiliar APIs.
- **basement mcp-three** -- GLTF/GLB to R3F JSX conversion (`gltfjsx`) + model structure analysis

### Scripts
- `scripts/capture.mjs` -- Playwright CLI screenshot: `npm run capture <slug> [--delay ms] [--scroll %] [--viewport WxH] [--full-page] [--og]` (CI/scripting fallback, pinchtab preferred for interactive use)
- `scripts/validate-experiments.mjs` -- Validates all experiment.json files (required fields, enum values, no duplicate slugs)

### Publishing Pipeline (`src/components/mdx/`, `src/components/ui/ArticleLayout.tsx`, `src/lib/articles.ts`)
- `ArticleLayout` -- Sylph-style single-column article layout: small semibold title, `>` breadcrumb, prev/next nav. TOC commented out. No motion animations.
- `articleComponents` -- MDX component map (CSS handles typography). Overrides: h2 (footnote filter), a (external links), pre (CodeBlock), code, blockquote, table, img. Custom components listed below.
- **Demo containers**: `LiveDemo` (iframe embed with integrated toolbar), `InteractiveWidget` (compound layout with `Preview` + `Controls` areas, sidebar/bottom modes), `SandpackDemo` (live code editor)
- **Demo controls** (`src/components/mdx/controls/`): `Range` (styled slider with debounce, gradient fill), `Checkbox` (animated checkmark), `Switch` (animated toggle), `ControlGroup` (grid layout for controls)
- **Content components**: `BeforeAfterImage` (drag-to-compare), `Slideshow` (image gallery with keyboard nav), `Details` (animated collapsible), `Pill` (semantic badge), `Fullbleed` (full-width breakout), `Callout` (info/warning/tip), `CodeStep` (numbered walkthrough), `CodeBlock` (syntax highlighted)
- `ExperimentNav` -- Unified floating nav: "Return to Experiments" + pathname-aware "View Article"/"View Experiment" toggle.
- `WritingSection` -- Homepage "Writing" section. Server component rendering article cards in a 2-column grid with reading time, analytics, and deep-link anchor (`/#writing`).
- `getArticles()` -- Scans experiments for `article/content.mdx`, parses frontmatter with gray-matter, computes reading time
- `getAdjacentArticles(slug)` -- Returns prev/next articles for article page navigation
- `next-mdx-remote/rsc` -- Renders MDX at build time via `src/lib/mdx-article-config.ts`: remark-gfm, rehype-shift-heading (SEO h1 hierarchy), rehype-pretty-code, rehype-slug
- Dynamic OG route at `/api/og?title=...&tags=...` -- Edge runtime ImageResponse
- RSS feed at `/feed.xml` -- RSS 2.0 via `getArticles()`
- Article plop generator: `npm run new:article` scaffolds article/ + docs/ directories (now prompts for description, auto-populates dates)

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
| **tunnel-rat** | latest | `tunnel-rat` | DOM-WebGL portal bridge for layer-cake patterns (persistent Canvas + page-specific 3D). `npm i tunnel-rat` |
| **maath** | latest | `maath/easing` | Frame-rate-independent damping for R3F (`damp3`, `dampE`, `dampC`). `npm i maath` |
| **zustand** | latest | `zustand` | Lightweight state management for R3F frame loops (`getState()` for non-reactive reads in `useFrame`). `npm i zustand` |

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
- Experiment list UI with preview drawer (`experiments/`)
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
| `rehype-shift-heading` | ^2.0.0 | Demotes MDX headings (h1→h2) so ArticleLayout h1 is sole h1 |
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

**Note**: ESLint, eslint-config-next, eslint-plugin-storybook, and Storybook have been removed. Biome handles all JS/TS/JSX/TSX/JSON/CSS linting and formatting.
