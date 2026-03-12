# Experiments

## Lifecycle

```
scaffold  ->  develop  ->  ship  ->  publish content (optional)  ->  delete (optional)
```

1. **Scaffold**: `npm run new:experiment` creates the route group, component, and asset directories
2. **Develop**: Build the experiment. Status remains `"wip"` -- visible only in dev/preview
3. **Ship**: Set `"status": "shipped"` in `experiment.json`. Now eligible for public surfaces
4. **Publish content**: Optionally scaffold an article (`npm run new:article`) and the full content constellation
5. **Delete**: `npm run delete:experiment <slug>` removes all files cleanly

## Profiles

Each experiment has a `profile` field in `experiment.json` that determines the scaffolding template and provides behavioral guidance for AI agents.

| Profile | Use case | Template demo |
|---------|----------|--------------|
| `blank` | Minimal starting point | Empty shell |
| `r3f-scene` | 3D scenes with React Three Fiber | Rotating box + orbit controls + lighting |
| `r3f-shader` | Custom GLSL shaders in R3F | Fullscreen quad + animated gradient shader |
| `scrollytelling` | Scroll-driven narrative animations | 3-section scroll with Lenis + GSAP pin + fade |
| `interaction` | Gesture-based interactive UI | Draggable card with spring physics |
| `web-audio` | Audio synthesis and visualization | Piano keys with synthesized tones |
| `dom-effect` | CSS/DOM visual effects | Text with shimmer entrance animation |
| `mixed` | Multi-technique (scroll + 3D + interaction) | Scaffolds as blank shell; use scrollytelling or r3f-scene as base. Extensive guidance in `.agents/profiles/mixed.md`. |

Profile-specific guidance for AI agents lives in `.agents/profiles/<profile>.md`.

## Metadata System

Two fields control experiment visibility across all surfaces. One truth table, no exceptions.

### `status`

| Value | Meaning |
|-------|---------|
| `"wip"` | Work in progress. Dev/preview homepage only. Excluded from registry, llms.txt, posters, articles, sitemap, RSS. `noindex`. |
| `"shipped"` | Complete. Eligible for surfaces based on `listing`. |

### `listing`

| Value | Meaning |
|-------|---------|
| `"public"` | Full public visibility. Homepage, registry, llms.txt, posters, articles, sitemap, RSS. SEO indexed. |
| `"dev"` | Dev/preview homepage only. Still in registry and llms.txt. Articles exist but hidden publicly. `noindex`. |
| `"registry"` | Registry only. No homepage, no llms.txt, no posters, no articles, no sitemap. `noindex`. |

### Visibility Truth Table

| status | listing | Homepage | Registry | llms.txt | Posters | Articles | Sitemap | RSS |
|--------|---------|----------|----------|----------|---------|----------|---------|-----|
| wip | any | dev/preview only | No | No | No | No | No | No |
| shipped | public | Yes | Yes | Yes | Yes (if video) | Yes (if exists) | Yes | Yes |
| shipped | dev | dev/preview only | Yes | Yes | No | Hidden | No | No |
| shipped | registry | No | Yes | No | No | No | No | No |

### `legacy`

A boolean agent policy flag. Marks pre-V2 experiments (those created before the V2 platform rebuild). Has zero runtime effect -- it only tells AI agents to ask before modifying these experiments. There are 18 legacy experiments with `legacy: true, status: "shipped"`.

## experiment.json Schema

Full schema with all supported fields:

```json
{
  "title": "Experiment Title",
  "description": "One-line description of what this experiment does",
  "slug": "kebab-case-slug",
  "created": "2026-03-06T00:00:00.000Z",
  "updated": "2026-03-11T00:00:00.000Z",
  "status": "shipped",
  "listing": "public",
  "profile": "scrollytelling",
  "complexity": "intermediate",
  "tags": ["scroll", "animation", "ui"],
  "tech": ["lenis", "gsap", "motion"],
  "image": "/experiments/slug/preview.png",
  "video": "/experiments/slug/preview.mp4",
  "legacy": false,
  "inspiration": [{ "title": "Reference Site", "url": "https://example.com" }],
  "related": ["other-experiment-slug"],
  "articleLenses": ["concept", "implementation"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Human-readable name |
| `description` | string | Yes | One-line summary |
| `slug` | string | Yes | URL-safe identifier (kebab-case) |
| `created` | ISO date | Yes | Creation timestamp |
| `updated` | ISO date | No | Last significant update |
| `status` | `"wip"` \| `"shipped"` | Yes | Lifecycle stage |
| `listing` | `"public"` \| `"dev"` \| `"registry"` | No | Visibility tier (default: `"public"`) |
| `profile` | string | Yes | Experiment archetype (see Profiles above) |
| `complexity` | `"beginner"` \| `"intermediate"` \| `"advanced"` | No | Difficulty level |
| `tags` | string[] | No | Categorization for search, JSON-LD, OG images |
| `tech` | string[] | No | Libraries used |
| `image` | string | No | Preview image path |
| `video` | string | No | Preview video path |
| `legacy` | boolean | No | Pre-V2 experiment (agent policy flag) |
| `inspiration` | array | No | Reference links (`{ title, url }`) |
| `related` | string[] | No | Slugs of related experiments |
| `articleLenses` | string[] | No | Dominant lenses for the article (`"implementation"`, `"concept"`, `"exploration"`) |

## /dev Dashboard

The `/dev` route (accessible only in development and Vercel preview deploys, returns 404 in production) provides a comprehensive status dashboard:

- **Experiment list** with status badges, listing badges, and legacy indicators
- **Per-experiment details**: which surfaces each experiment appears on, completeness scores, missing fields
- **Aggregate stats**: total count, shipped vs. wip, legacy count, articles count, video count, profile distribution
- **Validation warnings**: missing required fields, enum mismatches, coherence issues (e.g., public experiments without video)

The dashboard reads all `experiment.json` files at build time and applies the same truth table used by the generation scripts.

## Component Decomposition

When an experiment component exceeds ~200 lines (hard limit: 300 lines), decompose:

```
src/components/experiments/experiment-name/
├── ExperimentName.tsx      # ~120 lines, thin orchestrator
├── data.ts                 # Constants, section content
├── sections/
│   ├── HeroSection.tsx     # Own useGSAP scope and animation
│   └── ScrollSection.tsx   # Own useGSAP scope and animation
├── hooks/
│   └── useExperimentState.ts
└── shaders/
    └── effect.glsl
```

Each section component owns its own `useGSAP({ scope: ref })`. The orchestrator handles lifecycle (Lenis, controls) and composes sections via props.
