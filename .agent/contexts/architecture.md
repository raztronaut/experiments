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
├── ExperimentName.stories.tsx  # Storybook story
├── ExperimentName.test.tsx     # Vitest test
└── [sub-components...]         # Additional components, hooks, shaders

public/experiments/experiment-name/
├── preview.mp4 / .gif / .png   # Preview media for dashboard
├── poster.jpg                  # Auto-generated from video
└── [assets...]                 # Models, textures, fonts, audio
```

The layout.tsx renders its own `<html>` and `<body>`, giving each experiment complete CSS/JS isolation from the main dashboard app. In dev mode, `ExperimentDevMetrics` is auto-injected to log FPS, heap, and CLS to the console.

## Metadata Schema (experiment.json)

```json
{
  "title": "Experiment Title",
  "description": "One-line description",
  "slug": "kebab-case-slug",
  "created": "2026-03-06T00:00:00.000Z",
  "video": "/experiments/slug/preview.mp4",
  "isPlaceholder": false,
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
| `status` | `wip` / `shipped` / `archived` | Controls homepage filtering. Archived experiments are hidden by default. |
| `tags` | string[] | Enables tag-based filtering on homepage |
| `tech` | string[] | Libraries used (for search and context) |
| `complexity` | string | `beginner` / `intermediate` / `advanced` |
| `legacy` | boolean | Pre-V2 experiment. Not refactored, kept as-is. |
| `publishable` | boolean | Ready for article generation (Section 5) |

## Template System

```bash
npm run new:experiment
```

The scaffolder prompts for name, description, and **profile**. Each profile generates a working demo component:

| Profile | Demo |
|---------|------|
| `r3f-scene` | Rotating box with orbit controls + lighting |
| `r3f-shader` | Fullscreen quad with animated gradient shader |
| `scrollytelling` | 3-section scroll with Lenis + GSAP pin + fade |
| `interaction` | Draggable card with spring physics |
| `web-audio` | Piano keys with synthesized tones |
| `dom-effect` | Text with shimmer entrance animation |
| `blank` | Minimal placeholder shell |

## Three-Location Rule

| Location | What Goes Here | Example |
|----------|---------------|---------|
| `src/app/experiments/(name)/` | Route files, layout, metadata | layout.tsx, experiment.json, page.tsx |
| `src/components/experiments/name/` | Components, hooks, utils, shaders, stories, tests | MyExperiment.tsx, shader.glsl |
| `public/experiments/name/` | Static assets | preview.mp4, model.glb, texture.png |

## Import Rules

```tsx
// ALLOWED: shared UI, utils, external libraries, sibling components
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import SubComponent from './SubComponent'
import { Canvas } from '@react-three/fiber'
import { motion } from 'motion/react'
import { R3FSceneInspector } from '@/components/dev'

// FORBIDDEN: cross-experiment imports, global state pollution
import X from '@/components/experiments/other-experiment/X'
```

## Scaffolding
```bash
npm run new:experiment    # Interactive generator (name, description, profile)
npm run delete:experiment # Safe removal with confirmation
```

## File Naming
- Route groups: `(kebab-case-name)` with parentheses
- Components: `PascalCase.tsx`
- Utilities/hooks: `camelCase.ts`
- Shaders: `descriptiveName.glsl` / `.vert` / `.frag`
- Assets: `kebab-case.ext`

## Data Flow
```
experiment.json
  → getExperiments() in src/lib/experiments.ts (with status/tag/profile filtering)
  → Homepage renders ExperimentDrawerList (with filter bar)
  → Each card links to /experiments/<slug>
  → Route group layout renders isolated experiment
```

## Scripts
```bash
npm run new:experiment         # Scaffold new experiment (Plop, profile-based)
npm run delete:experiment      # Remove experiment files
npm run generate:posters       # Extract video first frames
npm run generate:registry      # Build shadcn-compatible registry
npm run capture <slug>         # Playwright screenshot capture
npm run build                  # Runs posters + registry + next build
```
