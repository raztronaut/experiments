# Experiment Architecture Reference

> Quick-reference for how experiments are structured in this codebase

## Route Group Pattern

Each experiment is a Next.js route group with complete layout isolation:

```
src/app/experiments/(experiment-name)/
├── layout.tsx              # Own <html>/<body>, metadata from experiment.json, dev metrics
├── experiment.json         # Metadata (title, slug, profile, tags, tech, status, etc.)
└── experiment-name/
    ├── page.tsx            # Imports and renders the main component
    └── error.tsx           # Client error boundary with retry

src/components/experiments/experiment-name/
├── ExperimentName.tsx      # Main component ("use client")
├── ExperimentName.test.tsx     # Vitest test
└── [sub-components...]         # Additional components, hooks, shaders

public/experiments/experiment-name/
├── preview.mp4 / .gif / .png   # Preview media for dashboard
├── poster.jpg                  # Auto-generated from video
└── [assets...]                 # Models, textures, fonts, audio
```

The layout.tsx renders its own `<html>` and `<body>`, giving each experiment complete CSS/JS isolation from the main dashboard app. In dev mode, `DevToolsInjector` auto-injects `ExperimentDevMetrics` (logs FPS, heap, CLS, GSAP tweens every 2s) + `DebugOverlay` (activates with `?debug` URL param for GSDevTools, device info, and debug hotkeys). Tree-shakes to nothing in production unless `<DevToolsInjector production />` is passed (used by showcase experiments for visitor-facing `?debug` tools). R3F experiments get `R3FDevToolsInjector` inside `<Canvas>` (auto-included in R3F Plop templates, same `production` prop pattern) which provides r3f-perf metrics, scene graph inspection, and visual debug panels when `?debug` is active.

## Metadata Schema (experiment.json)

```json
{
  "title": "Experiment Title",
  "description": "One-line description",
  "slug": "kebab-case-slug",
  "created": "2026-03-06T00:00:00.000Z",
  "video": "/experiments/slug/preview.mp4",
  "profile": "r3f-scene",
  "status": "wip",
  "tags": ["3d", "shader"],
  "tech": ["r3f", "drei"],
  "complexity": "advanced",
  "inspiration": [{ "title": "Reference", "url": "https://..." }],
  "related": ["other-experiment-slug"],
  "publishable": false,
  "legacy": true
}
```

| Field | Type | Purpose |
|-------|------|---------|
| `profile` | string | Activates behavioral guidance from `.agent/profiles/`. Used by template scaffolder. |
| `status` | `wip` / `shipped` / `archived` | Used by `getExperiments()` for programmatic filtering. Generation scripts skip `wip`. |
| `tags` | string[] | Categorization for search, JSON-LD structured data, OG images, and llms.txt |
| `tech` | string[] | Libraries used (for search and context) |
| `complexity` | string | `beginner` / `intermediate` / `advanced` |
| `legacy` | boolean | Pre-V2 experiment. Not refactored, kept as-is. |
| `publishable` | boolean | Quality-reviewed, ready for public. Set at END of publish workflow (step 17). Different from `content.article` which only tracks file existence. |

## Template System

```bash
# Interactive (for humans)
npm run new:experiment

# Non-interactive (for AI agents)
npm run new:experiment:auto -- --name "my experiment" --profile r3f-scene --toolkit --leva
```

The interactive scaffolder prompts for name, description, profile, and optional feature toggles (toolkit wiring, leva debug GUI). The non-interactive path accepts all options as CLI flags: `--name` (required), `--profile`, `--complexity`, `--toolkit`/`--no-toolkit`, `--leva`, `--description`. Defaults match interactive behavior (toolkit defaults to true for scrollytelling/r3f profiles). R3F profiles auto-include `R3FDevToolsInjector`. Each profile generates a working demo component:

| Profile | Demo |
|---------|------|
| `r3f-scene` | Rotating box with orbit controls + lighting |
| `r3f-shader` | Fullscreen quad with animated gradient shader |
| `scrollytelling` | 3-section scroll with Lenis + GSAP pin + fade |
| `interaction` | Draggable card with spring physics |
| `web-audio` | Piano keys with synthesized tones |
| `dom-effect` | Text with shimmer entrance animation |
| `blank` | Minimal placeholder shell |

**Mixed experiments** (scroll + 3D + interaction): No dedicated plop profile -- scaffold with `scrollytelling` or `r3f-scene` as a base, then manually compose the other layers. See `.agent/profiles/mixed.md` for the layer-cake architecture, file structure, and state bridging patterns.

## Three-Location Rule

| Location | What Goes Here | Example |
|----------|---------------|---------|
| `src/app/experiments/(name)/` | Route files, layout, metadata | layout.tsx, experiment.json, page.tsx |
| `src/components/experiments/name/` | Components, hooks, utils, shaders, tests | MyExperiment.tsx, shader.glsl |
| `public/experiments/name/` | Static assets | preview.mp4, model.glb, texture.png |

## Import Rules

```tsx
// ALLOWED: shared UI, utils, external libraries, sibling components
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import SubComponent from './SubComponent'
import { Canvas } from '@react-three/fiber'
import { motion } from 'motion/react'
import { R3FDevToolsInjector } from '@/components/dev'

// FORBIDDEN: cross-experiment imports, global state pollution
import X from '@/components/experiments/other-experiment/X'
```

## Scaffolding
```bash
npm run new:experiment              # Interactive (humans)
npm run new:experiment:auto -- ...  # Non-interactive (AI agents) -- see Template System above
npm run delete:experiment <name>    # Safe removal with confirmation
npm run delete:experiment <name> --yes  # Skip confirmation (AI agents)
```

## File Naming
- Route groups: `(kebab-case-name)` with parentheses
- Components: `PascalCase.tsx`
- Utilities/hooks: `camelCase.ts`
- Shaders: `descriptiveName.glsl` / `.vert` / `.frag`
- Assets: `kebab-case.ext`

## Component Decomposition

When an experiment component exceeds ~200 lines, split into focused modules:

```
src/components/experiments/experiment-name/
  ExperimentName.tsx          ~120 lines  Thin orchestrator
  data.ts                     Constants, section content
  sections/                   One file per visual section
    SectionName.tsx           Own animation scope (useGSAP + scope ref)
  [hooks/, shaders/, etc.]    Extracted utilities
```

Each section component owns its own `useGSAP({ scope: ref, dependencies: [...] })`. The orchestrator handles lifecycle (Lenis, controls) and composes sections via props. See `.agent/profiles/scrollytelling.md` for the canonical pattern.

## Data Flow
```
experiment.json
  → getExperiments() in src/lib/experiments.ts (with status/tag/profile filtering)
  → Homepage renders ExperimentDrawerList
  → Each card links to /experiments/<slug>
  → Route group layout renders isolated experiment
```

## Scripts
```bash
npm run new:experiment              # Scaffold experiment (interactive)
npm run new:experiment:auto -- ...  # Scaffold experiment (non-interactive, for agents)
npm run delete:experiment <name>    # Remove experiment (interactive)
npm run delete:experiment <name> --yes  # Remove experiment (non-interactive)
npm run generate:posters            # Extract video first frames (skips wip)
npm run generate:registry           # Build shadcn-compatible registry (skips wip)
npm run generate:llms-txt           # Generate llms.txt + llms-full.txt (skips wip)
npm run capture <slug>              # Playwright screenshot capture
npm run validate:experiments        # Validate all experiment.json files
npm run build                       # Runs posters + registry + llms-txt + next build
```

Note: `generate:registry`, `generate:posters`, and `generate:llms-txt` filter out experiments with `status: "wip"` so test fixtures don't pollute production artifacts.
