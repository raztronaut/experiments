# Razi's Experiments Lab

Creative coding lab at [razisyed.cv](https://www.razisyed.cv). Isolated Next.js experiments exploring shaders, 3D scenes, scroll-driven animation, and interactive UI.

## Quick Start

```bash
npm install
npm run dev                         # http://localhost:3000
npm run new:experiment              # scaffold a new experiment
npm run new:experiment:auto -- --name "my idea" --profile scrollytelling
```

## Tech Stack

| Library | Version | Import |
|---------|---------|--------|
| Next.js | 16.1 | `next` (App Router, React 19) |
| React | 19.2 | `react`, `react-dom` |
| TypeScript | ^5 | strict mode |
| Tailwind CSS | 4.2 | CSS-first config, `@tailwindcss/postcss`, shadcn/ui |
| GSAP | 3.14 | `gsap`, `gsap/ScrollTrigger`, `@gsap/react` |
| Motion | 12.x | `motion/react` |
| Lenis | 1.3 | `lenis`, `lenis/react` |
| Tempus | 1.0-dev.17 | `tempus` (unified RAF with priority system) |
| Hamo | 1.0-dev.10 | `hamo` (useRect, useWindowSize, useResizeObserver) |
| R3F | 9.4 | `@react-three/fiber` |
| Drei | 10.7 | `@react-three/drei` |
| Three.js | 0.182 | `three` (always dynamic import) |
| Zustand | 5.0 | `zustand` |
| Fumadocs | 16.6 | Registry documentation system |
| Biome | 2.4 | via `ultracite` (linting + formatting) |
| Vitest | 4.0 | `vitest` (unit tests with JSDOM) |

See [docs/toolkit.md](docs/toolkit.md) for the full animation/3D stack and integration patterns.

## Project Structure

Each experiment is an isolated Next.js route group with its own `<html>`/`<body>`:

```
src/
├── app/
│   ├── (main)/                    # Dashboard, homepage, /dev status
│   ├── (registry)/                # Component registry + Fumadocs docs
│   └── experiments/
│       └── (experiment-name)/     # Route group (isolated layout)
│           ├── layout.tsx         # Own HTML root, metadata, dev tools
│           ├── experiment.json    # Metadata (status, listing, profile, tags, tech)
│           └── experiment-name/
│               ├── page.tsx       # Imports main component
│               ├── error.tsx      # Error boundary
│               ├── article/       # MDX article (optional)
│               └── docs/          # Lab note, architecture, snippet, social, changelog
├── components/
│   ├── ui/                        # Shared dashboard components (shadcn)
│   ├── experiments/               # Experiment-specific components
│   ├── collected/                 # Ported external components for registry
│   └── mdx/                      # Article rendering components
├── lib/
│   └── toolkit/                   # Animation integration layer
│       ├── scroll.ts              # createUnifiedScroll() (Lenis + GSAP + Tempus)
│       ├── raf.ts                 # Tempus re-export
│       └── r3f.tsx                # ExperimentCanvas wrapper
├── hooks/                         # Shared hooks (useDevControls, useDebug)
content/
│   └── registry/                  # Generated Fumadocs MDX (build-time)
scripts/                           # Automation (scaffolding, generation, validation)
public/
│   ├── experiments/               # Per-experiment assets (preview.mp4, poster.jpg, models)
│   └── registry/                  # Generated registry JSON files
```

Three locations per experiment, no exceptions: route group, component directory, public assets. No cross-experiment imports.

## Key Concepts

### Experiments

Every experiment is scaffolded via CLI, lives in three directories, and is controlled by `experiment.json` metadata. The `status` field (`wip`/`shipped`) and `listing` field (`public`/`dev`/`registry`) form a truth table that controls visibility across all surfaces -- homepage, registry, feeds, llms.txt, sitemap.

See [docs/experiments.md](docs/experiments.md) for the full lifecycle, profiles, and metadata system.

### Content System

Shipped experiments can have a **content constellation**: a long-form MDX article, lab note, architecture doc, snippet, social copy, and changelog. Articles power the RSS feed (`/feed.xml`), JSON feed (`/feed.json`), and appear in llms.txt. Dynamic `.mdx` routes serve any experiment or article as clean markdown for LLMs.

See [docs/content-system.md](docs/content-system.md) for the article system, feeds, and llms.txt.

### Component Registry

A [shadcn-compatible registry](https://www.razisyed.cv/registry) lets anyone install experiments and components into their own projects:

```bash
npx shadcn@latest add https://www.razisyed.cv/r/send-button
```

The registry catalogs 100+ items across experiments, components, collected ports, hooks, and utilities. Fumadocs powers browsable documentation at `/registry/docs`.

See [docs/registry.md](docs/registry.md) for the generation pipeline, collected components, and curation.

### Animation Toolkit

A thin integration layer at `src/lib/toolkit/` unifies Lenis smooth scroll, GSAP animations, and Three.js rendering under a single Tempus RAF loop with a priority chain: -1 (scroll), 0 (animation), 1 (render).

See [docs/toolkit.md](docs/toolkit.md) for the priority system, dynamic import patterns, and library-specific guidance.

## Commands

### Development

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Full build (posters + registry + llms-txt + next build) |
| `npm test` | Vitest (watch mode) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Biome check via ultracite |
| `npm run fix` | Biome autofix via ultracite |

### Experiment Lifecycle

| Command | Purpose |
|---------|---------|
| `npm run new:experiment` | Scaffold experiment (interactive) |
| `npm run new:experiment:auto -- --name "name" --profile r3f-scene` | Scaffold experiment (non-interactive) |
| `npm run delete:experiment <name>` | Delete experiment (with confirmation) |
| `npm run delete:experiment <name> --yes` | Delete experiment (skip confirmation) |
| `npm run new:article` | Scaffold article for existing experiment |
| `npm run new:article:auto -- --name <slug>` | Scaffold article (non-interactive) |
| `npm run delete:article <slug>` | Remove article content |
| `npm run new:collected` | Scaffold collected component (interactive) |
| `npm run new:collected:auto` | Scaffold collected component (non-interactive) |

### Generation and Capture

| Command | Purpose |
|---------|---------|
| `npm run generate:posters` | Extract video first frames (skips wip) |
| `npm run generate:registry` | Build shadcn-compatible registry (skips wip) |
| `npm run generate:llms-txt` | Generate llms.txt + llms-full.txt (skips wip) |
| `npm run validate:experiments` | Validate all experiment.json files |
| `npm run capture <slug>` | Playwright screenshot capture |
| `npm run optimize:videos` | Compress experiment preview videos |

See [docs/scripts.md](docs/scripts.md) for detailed documentation on every script.

## Deploy

Vercel auto-deploys every merge to `main`. PRs get preview deploys with the identical build pipeline:

```
generate:posters -> generate:registry -> generate:llms-txt -> next build
```

Lefthook pre-commit hooks run lint, typecheck, and experiment validation in parallel. [Entire.io](https://docs.entire.io) captures agent session context as Git-native checkpoints on post-commit/pre-push.

See [docs/deploy.md](docs/deploy.md) for the full CI/CD workflow, branching strategy, and hook ownership.

## Contributing

Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). Biome handles all linting and formatting. TypeScript strict mode, no `any`. Components target 200 lines (hard limit 300). `prefers-reduced-motion` always respected.

See [docs/contributing.md](docs/contributing.md) for code style, testing, accessibility, and git conventions.

## AI-Assisted Development

The `.agents/` directory contains rules, profiles, skills, and workflows that give AI coding assistants deep context about the codebase. Cursor-specific integration lives in `.cursor/rules/`, `.cursor/skills/`, and `.cursor/agents/` with auto-injecting rules and specialized subagents for content writing and auditing.

See [docs/ai-development.md](docs/ai-development.md) for the full AI integration architecture.

## Documentation

All guides live in [`docs/`](docs/):

| Guide | Covers |
|-------|--------|
| [Architecture](docs/architecture.md) | Isolation model, route groups, data flow |
| [Getting Started](docs/getting-started.md) | Setup, first experiment, file anatomy |
| [Experiments](docs/experiments.md) | Lifecycle, profiles, metadata system |
| [Content System](docs/content-system.md) | Articles, feeds, llms.txt |
| [Registry](docs/registry.md) | Shadcn registry, collected components, Fumadocs |
| [Toolkit](docs/toolkit.md) | Animation stack, 3D, priority chain |
| [Deploy](docs/deploy.md) | CI/CD, Vercel, lefthook, Entire.io |
| [Scripts](docs/scripts.md) | All automation scripts |
| [Contributing](docs/contributing.md) | Code style, testing, git conventions |
| [AI Development](docs/ai-development.md) | Agent integration, Cursor, MCP tools |

## License

MIT
