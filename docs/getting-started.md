# Getting Started

## Prerequisites

- **Node.js** v20 or higher
- **npm** v10 or higher
- **ffmpeg** (optional, required for `generate:posters` to extract video first frames)

## Installation

```bash
git clone <repo-url>
cd experiments
npm install
```

The `postinstall` script patches `r3f-perf` automatically. The `prepare` script installs lefthook pre-commit hooks.

## Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the main dashboard. Experiments are at `/experiments/<slug>`.

The `/dev` route (only available in development and Vercel preview deploys) shows a status dashboard with all experiments, their metadata, completeness scores, and visibility badges.

## Creating Your First Experiment

### Interactive (recommended for humans)

```bash
npm run new:experiment
```

You'll be prompted for:
1. **Name** -- becomes the slug (e.g., "fluid sim" -> `fluid-sim`)
2. **Description** -- one-line summary
3. **Profile** -- determines the starter template and behavioral guidance
4. **Toolkit wiring** -- whether to include the Lenis/GSAP/Tempus integration layer
5. **Leva** -- whether to include debug GUI controls

### Non-interactive (for AI agents and scripts)

```bash
npm run new:experiment:auto -- --name "fluid sim" --profile r3f-scene --toolkit --leva
```

Available flags:
| Flag | Required | Values | Default |
|------|----------|--------|---------|
| `--name` | Yes | Any string | -- |
| `--profile` | No | `blank`, `r3f-scene`, `r3f-shader`, `scrollytelling`, `interaction`, `web-audio`, `dom-effect`, `mixed` | `blank` |
| `--complexity` | No | `beginner`, `intermediate`, `advanced` | `beginner` |
| `--toolkit` / `--no-toolkit` | No | Boolean | `true` for scrollytelling/r3f profiles |
| `--leva` | No | Boolean flag | `false` |
| `--description` | No | String | Empty |

### What gets created

The scaffolder creates files in three locations:

```
src/app/experiments/(fluid-sim)/
├── layout.tsx              # Isolated HTML root with metadata
├── experiment.json         # Metadata (status: "wip", listing: "public")
└── fluid-sim/
    ├── page.tsx            # Imports the main component
    └── error.tsx           # Error boundary

src/components/experiments/fluid-sim/
├── FluidSim.tsx            # Main component with working demo
└── FluidSim.test.tsx       # Vitest test

public/experiments/fluid-sim/
                            # (empty, ready for assets)
```

Each profile generates a working demo component:

| Profile | Demo |
|---------|------|
| `r3f-scene` | Rotating box with orbit controls and lighting |
| `r3f-shader` | Fullscreen quad with animated gradient shader |
| `scrollytelling` | 3-section scroll with Lenis + GSAP pin + fade |
| `interaction` | Draggable card with spring physics |
| `web-audio` | Piano keys with synthesized tones |
| `dom-effect` | Text with shimmer entrance animation |
| `mixed` | Blank shell (scaffolds minimal); extensive guidance in `.agents/profiles/mixed.md` |
| `blank` | Minimal placeholder shell |

## Adding Assets

Place preview media and static assets in `public/experiments/<slug>/`:

```
public/experiments/fluid-sim/
├── preview.mp4             # Dashboard hover preview video
├── poster.jpg              # Auto-generated from video first frame
├── model.glb               # 3D model (if applicable)
└── texture.png             # Textures, images
```

Update `experiment.json` with the paths:

```json
{
  "video": "/experiments/fluid-sim/preview.mp4",
  "image": "/experiments/fluid-sim/preview.png"
}
```

Run `npm run generate:posters` to auto-extract `poster.jpg` from any `preview.mp4` files (requires ffmpeg).

## Shipping an Experiment

When the experiment is ready:

1. Set `"status": "shipped"` in `experiment.json`
2. Choose a `listing` value:
   - `"public"` -- visible everywhere (homepage, registry, feeds, sitemap, SEO indexed)
   - `"dev"` -- visible in dev/preview only, but included in registry and llms.txt
   - `"registry"` -- registry only, no homepage or feeds
3. Ensure there's a `preview.mp4` or `preview.png` for the dashboard card
4. Run `npm run validate:experiments` to verify the metadata
5. Commit and push

See [experiments.md](experiments.md) for the full metadata system and visibility truth table.

## Deleting an Experiment

```bash
npm run delete:experiment <slug>        # with confirmation prompt
npm run delete:experiment <slug> --yes  # skip confirmation
```

This removes all files across the three locations (route group, components, public assets). The experiment automatically disappears from the dashboard since the registry is dynamic.

## Running Tests

```bash
npm test                    # watch mode
npm test -- --run           # single run
```

Tests are colocated with components as `ExperimentName.test.tsx` files, using Vitest with `@testing-library/react` in a JSDOM environment.

## Next Steps

- Read [experiments.md](experiments.md) for the metadata system and profiles in depth
- Read [toolkit.md](toolkit.md) if your experiment uses animation or 3D
- Read [content-system.md](content-system.md) when you're ready to write an article
