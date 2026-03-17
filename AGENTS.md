# Razi's Experiments Lab

Creative coding lab at https://www.razisyed.cv. Isolated Next.js experiments -- shaders, 3D scenes, scroll-driven animation, interactive UI. Every experiment should be close to publishable. Fight entropy. Leave the codebase better than you found it.

## Commands

```bash
npm run dev                    # Next.js dev server
npm run build                  # posters + registry + llms-txt + next build
npm test                       # Vitest (unit tests)
npm run typecheck              # tsc --noEmit
npm run lint                   # ultracite check (Biome)
npm run fix                    # ultracite fix (Biome autofix)
```

### Experiment lifecycle

```bash
# Scaffold (AI agents -- non-interactive)
npm run new:experiment:auto -- --name "fluid sim" --profile r3f-scene --toolkit --leva
# Flags: --name (required), --profile (blank|r3f-scene|r3f-shader|scrollytelling|
#   interaction|web-audio|dom-effect|mixed), --complexity (beginner|intermediate|advanced),
#   --toolkit/--no-toolkit, --leva, --description "text"

# Scaffold (humans -- interactive)
npm run new:experiment

# Delete
npm run delete:experiment <name>        # with confirmation
npm run delete:experiment <name> --yes  # skip confirmation

# Article
npm run new:article                     # scaffold article for existing experiment (interactive)
npm run new:article:auto -- --name <slug>  # scaffold article (AI agents -- non-interactive)
npm run delete:article <slug>           # remove article content
```

### Generation and capture

```bash
npm run generate:all           # run all generators in parallel (posters + registry + llms-txt)
npm run generate:posters       # extract video first frames (skips wip)
npm run generate:registry      # build shadcn-compatible registry (skips wip)
npm run generate:llms-txt      # generate llms.txt + llms-full.txt (skips wip)
npm run validate:experiments   # validate all experiment.json files
npm run validate:site-config   # validate site-config.mjs ↔ constants.ts sync
npm run capture <slug>         # Playwright screenshot capture
npm run optimize:videos        # compress experiment preview videos
npm run analyze                # interactive bundle analyzer (localhost:4000)
npm run analyze:output         # write analysis to .next/diagnostics/analyze/
```

## Tech Stack

| Library | Version | Import |
|---------|---------|--------|
| Next.js | 16.1 | `next` -- App Router, React 19 |
| React | 19.2 | `react`, `react-dom` |
| TypeScript | ^5 | strict mode |
| Tailwind CSS | 4.2 | CSS-first config, `@tailwindcss/postcss`, shadcn/ui, class-variance-authority |
| GSAP | 3.14 | `gsap`, `gsap/ScrollTrigger`, `@gsap/react` -- always dynamic import |
| Motion | 12.x | `motion/react` -- layout animations, gestures, springs |
| Lenis | 1.3 | `lenis`, `lenis/react` -- smooth scroll |
| Tempus | 1.0-dev.17 | `tempus` -- unified RAF with priority system |
| Hamo | 1.0-dev.10 | `hamo` -- useRect, useWindowSize, useResizeObserver |
| R3F | 9.4 | `@react-three/fiber` -- React renderer for Three.js |
| Drei | 10.7 | `@react-three/drei` -- R3F helpers |
| Three.js | 0.182 | `three` -- always dynamic import |
| Zustand | 5.0 | `zustand` -- state management (getState() in useFrame) |
| Biome | 2.4 | via `ultracite` -- linting + formatting |
| Vitest | 4.0 | `vitest` -- unit tests with JSDOM |

**Toolkit integration layer** at `src/lib/toolkit/`:
- `scroll.ts` -- `createUnifiedScroll()`: Lenis (priority -1) + GSAP (priority 0) on Tempus RAF
- `raf.ts` -- Tempus re-export
- `r3f.tsx` -- `ExperimentCanvas`: Canvas wrapper with optional Tempus render (priority 1)

**Package manager**: npm

## Project Structure

Each experiment is an isolated Next.js route group with its own `<html>`/`<body>`:

```
src/app/experiments/(experiment-name)/
├── layout.tsx              # Own HTML root, metadata, dev tools
├── experiment.json         # Metadata (title, slug, profile, status, listing, tags, tech)
└── experiment-name/
    ├── page.tsx            # Imports main component
    └── error.tsx           # Error boundary

src/components/experiments/experiment-name/
├── ExperimentName.tsx      # Main component ("use client")
├── ExperimentName.test.tsx # Vitest test
└── [sub-components...]     # sections/, hooks/, shaders/

public/experiments/experiment-name/
└── [assets...]             # preview.mp4, poster.jpg, models, textures
```

**Hard rules:**
- No cross-experiment imports. No global state pollution. Shared UI is read-only.
- Always scaffold with `npm run new:experiment`. Never manually create experiment files.
- Three locations only: `src/app/experiments/(name)/`, `src/components/experiments/name/`, `public/experiments/name/`
- Each experiment layout renders its own `<html>`/`<body>` for complete CSS/JS isolation.

## Code Style

- **TypeScript**: No `any` -- use `unknown` and narrow. Prefer `interface` for objects.
- **React**: Server Components by default. `'use client'` only when needed.
- **Imports**: No barrel imports from experiment components. Dynamic import heavy deps (Three.js, GSAP). Shared infrastructure (`@/lib/toolkit`, `@/components/ui`) may use barrels.
- **Performance**: `Promise.all` for parallel fetches. Animate only `transform`/`opacity`.
- **Accessibility**: `alt` on images, `aria-label` on icon buttons, 44x44px touch targets, 4.5:1 contrast.

### Component size discipline

Target **200 lines** per component. Hard limit **300 lines** -- triggers mandatory decomposition:
1. Extract constants to `data.ts`
2. Extract hooks to dedicated files
3. Split visual sections into `sections/SectionName.tsx` -- each owns its own `useGSAP`/animation scope
4. Main component becomes a thin orchestrator: lifecycle, shared state, section composition

For the canonical decomposition pattern (orchestrator + section-owned animation scopes), see `.agents/profiles/scrollytelling.md`.

## Animation Standards

From the 12 Principles of Animation:

- **Timing**: feedback <200ms, transitions 200-500ms, choreography up to 800ms. Doherty threshold: <400ms.
- **Easing**: ease-out for entrances, ease-in for exits, ease-in-out for state changes. Never `linear` for UI.
- **Follow-through**: stagger children, spring overshoot for physicality.
- **Anticipation**: subtle cue before major actions (scale-down before scale-up).
- **Exaggeration**: amplify feedback sparingly -- error shakes, success bounces.
- **`prefers-reduced-motion`**: always respected. Use `gsap.set` for fallbacks, not early returns.
- **Motion vocabulary diversity**: each section needs a distinct motion signature. Mix `clipPath` reveals, blur transitions, scale transforms, text splitting, parallax, horizontal scroll, counter-animations. Don't repeat `opacity: 0, y: 40` everywhere.

## UX Standards

From Laws of UX:

- **Fitts's Law**: generous hit areas. `::before` pseudo-elements to expand clickable regions.
- **Hick's Law**: progressive disclosure. Show what matters now, reveal complexity when needed.
- **Miller's Law**: chunk data. Format numbers, break long content into digestible groups.
- **Doherty Threshold**: <400ms response. If slow, optimistic UI / skeleton screens.
- **Postel's Law**: accept messy input, output clean data.

## Testing

- **Framework**: Vitest + @testing-library/react, JSDOM environment
- **Location**: test files colocated with components (`ExperimentName.test.tsx`)
- **Run**: `npm test` (watch mode) or `npx vitest --run --project unit` (CI)
- **Pre-commit**: lefthook runs `ultracite check`, `tsc --noEmit`, `validate-experiments`

## Git Workflow

- **Pre-commit hooks** (lefthook, parallel):
  1. `ultracite check` -- lint+format check, full project (fails on violations, never writes)
  2. `tsc --noEmit` -- typecheck
  3. `validate-experiments.mjs` -- validate experiment.json files
- **NEVER use `stage_fixed: true`** in lefthook with any fixer/formatter. It stashes unstaged changes and can silently lose work if the pop fails. Use `check` mode and fix manually with `npm run fix`.
- **Post-commit / pre-push**: [Entire.io](https://docs.entire.io) captures agent session context as Git-native checkpoints. Metadata lives on `entire/checkpoints/v1` branch. Coexists with lefthook (which only manages `pre-commit`).
- **Commit messages**: keep them short and descriptive. Conventional Commit prefixes are a good pattern, but not enforced.
- **Commit voice**: no `Co-Authored-By` AI lines. No "Generated with" language. Entire.io tool trailers (`Entire-Checkpoint`, `Entire-Attribution`) are acceptable -- they're structured metadata, not authorship copy.

## Branching and Deploy

- **`main`** = production. Vercel auto-deploys every merge. Branch-protected: PRs required, CI must pass.
- **Feature branches** for multi-commit work: `feat/`, `fix/`, `port/`, `experiment/`.
- **Draft PRs** to get Vercel preview URLs without signaling "ready to merge".
- **Admin bypass** exists for single-commit hotfixes directly to `main`.
- Preview and production run the identical build pipeline (`generate:all && next build`). `generate:all` orchestrates posters, registry, and llms-txt in parallel. No environment-specific behavior.
- See `.agents/workflows/deploy.md` for the full lifecycle.

## Guardrails

### 2-Iteration Limit
If an approach fails after **2 attempts**, STOP:
1. Summarize what you tried and why it failed
2. Present **2-3 alternatives** with trade-offs
3. Ask which direction to take

### Visual/Spatial Honesty
For WebGL, shaders, physics, animations, canvas -- acknowledge you cannot see the output. Provide best-effort with clear TODOs. Suggest the user validate visually.

### Pre-Commit Verification
Before ANY commit: `tsc --noEmit` + build must pass. Never commit code that doesn't build.

### Bug Fix Scope
Stay confined to files directly related to the bug. No drive-by refactors, no dependency upgrades in bug fix PRs.

### Context Hygiene
When tool output exceeds ~2K tokens, write it to a scratch file and return a summary with the file path.

## Boundaries

**Always do:**
- Scaffold experiments with `npm run new:experiment`
- Run `tsc --noEmit` before commits
- Respect `prefers-reduced-motion`
- Follow SEO metadata guidelines (docs/seo.md) when creating or editing experiments and articles
- Dispose Three.js resources on unmount
- Clean up effects (listeners, timers, animation contexts)

**Ask first:**
- Adding new production dependencies
- Modifying shared UI (`src/components/ui/`)
- Changing the toolkit integration layer (`src/lib/toolkit/`)
- Modifying CI/CD configuration

**Never do:**
- Import from another experiment's component directory
- Modify legacy experiments (`legacy: true` in experiment.json)
- Commit secrets, API keys, or `.env` files
- Add experiment-specific state to global stores
- Modify `src/app/(main)/` for experiment-specific code
- Use `stage_fixed: true` in lefthook (silently loses unstaged work on stash pop failure)

## Metadata System

Two fields control visibility across all surfaces. One truth table. No exceptions.

**`status`**: `"wip"` | `"shipped"`
- `wip`: dev/preview homepage only. Excluded from registry, llms.txt, posters, articles, sitemap, RSS. `noindex`.
- `shipped`: complete. Eligible for surfaces based on `listing`.

**`listing`**: `"public"` | `"dev"` | `"registry"` (default: `"public"`)
- `public`: full public visibility. Homepage, registry, llms.txt, posters (if video), articles, sitemap, RSS. SEO indexed.
- `dev`: dev/preview homepage only. Still in registry and llms.txt. Articles exist but hidden publicly. `noindex`.
- `registry`: registry only. No homepage, no llms.txt, no posters, no articles, no sitemap. `noindex`.

**`legacy`**: boolean -- agent policy flag. Marks pre-announcing-v2 experiments. Zero runtime effect. Ask before touching.

**Dev status dashboard**: `/dev` route (dev/preview only, 404 in production) shows all experiments with truth-table-derived visibility badges.

**Environment detection**: `src/lib/env.ts` exports `isDev`, `isPreview`, `showDevContent`. Vercel preview deploys show dev content.

## Constraints

- **Legacy experiments** (`legacy: true`, `status: "shipped"`) -- ask before modifying. No layout migration, no code changes without permission.
- **Biome is deliberately permissive** -- 30+ rules disabled for legacy creative code. AGENTS.md defines stricter standards.
- **Generation scripts gate on `status` + `listing`** -- registry includes all shipped experiments, llms.txt excludes registry-only, posters only for public with video.
- **Deferred items** (don't attempt to fix): Cursor.tsx `getCursorColor` perf bug, Biome strictness tightening, ArticleLayout TOC scroll-spy.

## Reference Docs (.agents/)

Read the relevant doc BEFORE working in that domain:

| Domain | File | Read when |
|--------|------|-----------|
| Animation | `.agents/rules/animations.md` | Editing components with GSAP, Motion, or scroll-driven animation |
| R3F / 3D | `.agents/rules/r3f.md` | Editing R3F scenes, Canvas, useFrame, drei components |
| Shaders | `.agents/rules/shaders.md` | Editing .glsl/.frag/.vert files or ShaderMaterial |
| Scroll | `.agents/rules/scroll.md` | Using Lenis, ScrollTrigger, or createUnifiedScroll |
| Performance | `.agents/rules/performance.md` | Optimizing render, bundle, or runtime performance |
| Performance tooling | `docs/performance.md` | Source maps, bundle analyzer, performance monitoring |
| Experiments | `.agents/rules/experiments.md` | Creating or modifying any experiment (always read) |
| Registry | `docs/registry.md` | Editing registry pipeline, component previews, or registry docs |
| SEO / metadata | `docs/seo.md` | Editing metadata, sitemap, robots, structured data, or indexing |
| Porting | `.agents/skills/porting-demos/SKILL.md` | Porting external demos, websites, repos, or code snippets into experiments |
| Quick Component | `.agents/skills/quick-component/SKILL.md` | Porting external code or indexing libraries into collected registry |
| Content | `.agents/contexts/content-constellation.md` | Writing articles, publishing experiments, auditing content coverage |
| Automation Ops | `.agents/workflows/automation-ops.md` | Handling automation output, worktrees, and PR/deploy decisions for agent-created work |

**Profile-specific guidance**: read `experiment.json` `"profile"` field, then `.agents/profiles/<profile>.md`

**Skills** (library-specific patterns): `.agents/skills/<name>/SKILL.md`
- gsap-modern, lenis-scroll, motion-react, r3f-core, shader-authoring, tempus-raf, visual-qa, porting-demos, quick-component

**Workflows** (step-by-step procedures): `.agents/workflows/<name>.md`
- new-experiment, develop-experiment, publish-experiment, add-experiment-component, add-experiment-assets, cleanup-experiment, visual-qa, automation-ops

**Architecture reference**: `.agents/contexts/architecture.md`
**Toolkit inventory**: `.agents/contexts/toolkit.md`
**Writing voice**: `.agents/contexts/writing-voice.md`
**Content constellation**: `.agents/contexts/content-constellation.md`

**Backlog**: `.agents/backlog/README.md` -- canonical running list of all pending work (read when planning or starting a session)
**Learned memory**: `memory.md` -- auto-maintained user preferences and workspace facts (always read)

### Cursor-Native Tools (.cursor/)

Auto-inject rules, task-triggered skills, and specialized subagents for content and experiment workflows:

**Rules** (auto-inject context when matching files are open): `.cursor/rules/*.mdc`
- experiment-metadata, article-writing, experiment-components, content-docs, generation-scripts, registry-curation

**Skills** (discoverable task workflows): `.cursor/skills/<name>/SKILL.md`
- publish-content, audit-content, run-generation, continual-learning (plugin-provided hook + workspace skill override targeting `memory.md`)

**Subagents** (specialized personas): `.cursor/agents/*.md`
- content-writer, content-auditor
