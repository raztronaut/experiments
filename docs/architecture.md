# Architecture

## Isolation Model

Every experiment runs in its own Next.js route group with a dedicated `<html>` and `<body>` element. This gives each experiment complete CSS and JavaScript isolation from the main dashboard and from every other experiment.

```
src/app/experiments/(experiment-name)/
├── layout.tsx              # Own <html>/<body>, metadata, dev tools
├── experiment.json         # Metadata (title, slug, profile, status, listing, tags, tech)
└── experiment-name/
    ├── page.tsx            # Imports and renders the main component
    └── error.tsx           # Client error boundary with retry
```

The parenthesized directory name `(experiment-name)` is a Next.js route group -- it creates layout isolation without affecting the URL path. The actual URL is `/experiments/experiment-name`.

## Three-Location Rule

Every experiment has files in exactly three directories. No exceptions.

| Location | What goes here | Examples |
|----------|---------------|---------|
| `src/app/experiments/(name)/` | Route files, layout, metadata | `layout.tsx`, `experiment.json`, `page.tsx` |
| `src/components/experiments/name/` | Components, hooks, utils, shaders, tests | `MyExperiment.tsx`, `shader.glsl` |
| `public/experiments/name/` | Static assets | `preview.mp4`, `model.glb`, `texture.png` |

Cross-experiment imports are forbidden. Each experiment's components are self-contained.

## Layout Hierarchy

The codebase has several independent layout trees:

```
src/app/
├── (main)/                          # Dashboard, homepage, /dev status
│   └── layout.tsx                   # Main app shell (Tailwind, shadcn, global nav)
├── (registry)/                      # Component registry + Fumadocs docs
│   └── layout.tsx                   # Registry shell (Fumadocs layout)
├── (collected-preview)/             # Collected component preview routes
│   └── layout.tsx                   # Minimal isolated shell for iframe embeds
└── experiments/
    └── (experiment-name)/
        └── layout.tsx               # Fully isolated HTML root per experiment
```

Each layout tree renders its own `<html>` and `<body>`. The main dashboard uses Tailwind and shadcn/ui. Experiments can use any styling approach without interference.

## Environment Detection

`src/lib/env.ts` exports three values:

| Export | Condition | Purpose |
|--------|-----------|---------|
| `isDev` | `NODE_ENV === 'development'` | Local development |
| `isPreview` | `VERCEL_ENV === 'preview'` | Vercel preview deploys |
| `showDevContent` | `isDev \|\| isPreview` | Show WIP experiments, /dev dashboard |

The `/dev` dashboard route returns 404 in production. Preview deploys (from PRs) show all dev content.

## Data Flow

Experiment metadata flows from `experiment.json` through a central data layer to multiple output surfaces:

```
experiment.json (per experiment)
    │
    ▼
getExperiments() — src/lib/experiments.ts
    │   Reads all experiment.json files from disk
    │   Filters by status + listing + showDevContent
    │
    ├─► Homepage — ExperimentDrawerList (card grid with preview drawer)
    ├─► /dev dashboard — full status table with completeness scores
    ├─► generate:registry — shadcn JSON files in public/registry/
    ├─► generate:llms-txt — public/llms.txt + llms-full.txt
    ├─► generate:posters — poster.jpg from preview.mp4 first frame
    ├─► RSS feed — /feed.xml (articles from shipped+public experiments)
    ├─► JSON feed — /feed.json (same source as RSS)
    ├─► Sitemap — /sitemap.xml
    └─► OG images — /api/og?title=...&tags=...
```

Generation scripts (`generate:posters`, `generate:registry`, `generate:llms-txt`) all filter out `status: "wip"` experiments so test fixtures and in-progress work never appear in production artifacts.

## Import Rules

```tsx
// Allowed
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import SubComponent from './SubComponent'
import { Canvas } from '@react-three/fiber'
import { motion } from 'motion/react'

// Forbidden
import X from '@/components/experiments/other-experiment/X'
```

Shared infrastructure (`@/lib/toolkit`, `@/components/ui`, `@/components/dev`) is read-only from experiments. Heavy dependencies (Three.js, GSAP) must use dynamic imports to avoid pulling them into experiments that don't need them.

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Route groups | `(kebab-case-name)` | `(velocity-responsive-design)` |
| Components | `PascalCase.tsx` | `ExperimentName.tsx` |
| Utilities/hooks | `camelCase.ts` | `useDevControls.ts` |
| Shaders | `descriptiveName.glsl` | `gradient.frag` |
| Assets | `kebab-case.ext` | `preview.mp4` |
| Data files | `camelCase.ts` | `data.ts` |
