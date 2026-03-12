---
description: Overview of the content constellation system -- 6-format content model, tooling, lifecycle, and agent integration
---

# Content Constellation

Each experiment can have a **content constellation** -- 6 formats targeting different audiences, generated via the publish workflow.

## The 6 Formats

| Format | File | Audience | Voice |
|--------|------|----------|-------|
| Article | `article/content.mdx` | Public (engineers, designers, creative coders) | RNDR Realm + Maxime Heckel (see `writing-voice.md`) |
| Lab Note | `docs/lab-note.md` | Internal (future self, collaborators) | Honest, reflective |
| Architecture | `docs/architecture.md` | Engineers | Terse, technical |
| Snippet | `docs/snippet.md` | Developers | Copy-paste ready |
| Social | `docs/social.md` | Twitter/X, Discord | Punchy, progressive reveal |
| Changelog | `docs/changelog.md` | Internal | Chronological, factual |

## Lifecycle

```
status: "shipped"  →  publish workflow (5 phases)  →  article/content.mdx exists on disk
```

- Prerequisite: `status: "shipped"` and visual QA passed
- Article existence is detected by file presence (`article/content.mdx`), not by a metadata flag
- Articles are only publicly visible for `listing: "public"` experiments (see `.cursor/rules/experiment-metadata.mdc` for the full truth table)

## File Locations

Content lives inside the experiment route group:

```
src/app/experiments/(slug)/slug/
├── article/
│   ├── page.tsx           # MDX rendering, component wiring, JSON-LD
│   ├── content.mdx        # Article body (frontmatter + prose)
│   └── components/        # "use client" interactive demos
│       ├── index.ts       # Barrel re-export (page.tsx imports from here)
│       ├── utils.ts       # Shared math/drawing helpers (optional)
│       ├── DemoOne.tsx    # One file per demo component
│       └── DemoTwo.tsx
└── docs/
    ├── lab-note.md
    ├── architecture.md
    ├── snippet.md
    ├── social.md
    └── changelog.md
```

## Scaffolding

```bash
npm run new:article              # creates 8 files (interactive)
npm run new:article:auto -- --name <slug>  # non-interactive equivalent for AI agents
npm run delete:article <slug> # removes article/ + docs/
```

## Key Technical Patterns

- **No `import` in MDX** -- `next-mdx-remote` doesn't support it. Build demos in `components/`, export from `components/index.ts`, import in `page.tsx`, spread into `components` prop.
- **Demo component decomposition** -- one file per demo in `article/components/DemoName.tsx`. Shared math/drawing helpers go in `utils.ts`. Barrel re-export in `index.ts`. Target 200 lines per file, hard limit 300. The `page.tsx` import path (`from "./components"`) resolves to the barrel.
- **Canvas 2D / CSS for article demos** -- avoid loading Three.js in article context. For shader experiments, recreate effects in Canvas 2D with parameter sliders.
- **Shared control primitives** -- `Range`, `Checkbox`, `Switch`, `ControlGroup` (in `src/components/mdx/controls/`) provide consistent, styled controls for article demos. No raw `<input>` elements. `InteractiveWidget` supports compound layout with `Preview` + `Controls` areas.
- **Content components** -- `BeforeAfterImage` (drag comparison), `Slideshow` (image gallery), `Details` (collapsible), `Pill` (badge), `Fullbleed` (breakout) are available in the MDX component map alongside the original Callout, CodeStep, LiveDemo, and SandpackDemo.
- **Typography is CSS-first** -- `experiments.css` (Sylph port) handles all article typography. MDX component map does NOT override heading/paragraph styles.
- **Article lenses** -- articles blend three lenses (implementation, concept, exploration) in any proportion. See `writing-voice.md` for section building blocks and demo patterns per lens. The agent should present a lens analysis and ask the user for direction before committing to a structure.
- **Lens emphasis informs other formats** -- concept-heavy experiments benefit from idea-hook social threads; implementation-heavy experiments from technique-hook threads. Lab notes and changelogs naturally lean exploration. The lenses are guidance, not enforcement.

## Tooling Inventory

### Cursor-Native Tools (`.cursor/`)

**Rules** (auto-inject when matching files are open):

| Rule | Glob | Injects |
|------|------|---------|
| `experiment-metadata.mdc` | `**/experiment.json` | Schema, lifecycle, validation |
| `article-writing.mdc` | `**/article/content.mdx` | Voice, structure, MDX wiring, demo strategy |
| `experiment-components.mdc` | `src/components/experiments/**/*.tsx` | Size discipline, animation standards |
| `content-docs.mdc` | `src/app/experiments/**/docs/*.md` | Format templates |
| `generation-scripts.mdc` | `scripts/generate-*.mjs` | Pipeline architecture |
| `registry-curation.mdc` | `**/registry.config.json` | Config schema, downstream impact |

**Skills** (task-triggered workflows):

| Skill | Triggers on |
|-------|-------------|
| `publish-content` | "content constellation", "publish", "write article for" |
| `audit-content` | "content status", "coverage gaps", "what needs writing" |
| `run-generation` | "generate registry", "run generation", build pipeline |

**Subagents** (specialized personas):

| Agent | Purpose |
|-------|---------|
| `content-writer` | Lens analysis, user-collaborative brief, article writing in RNDR Realm + Maxime Heckel voice |
| `content-auditor` | Content coverage scanning, lens-strength signals, schema gap reporting |

### Agent Knowledge Base (`.agents/`)

| Doc | Role |
|-----|------|
| `workflows/publish-experiment.md` | Canonical 5-phase, 18-step publish procedure |
| `contexts/writing-voice.md` | Voice characteristics, article lenses, section building blocks, demo patterns, format templates |

### Generation Pipeline

Content feeds into these build-time generators (all skip `status: "wip"`):

| Command | Output |
|---------|--------|
| `npm run generate:registry` | `public/registry/*.json`, `content/registry/**/*.mdx` |
| `npm run generate:posters` | `public/experiments/*/poster.jpg` |
| `npm run generate:llms-txt` | `public/llms.txt`, `public/llms-full.txt` |

## Validation

The pre-commit validator (`scripts/validate-experiments.mjs`) checks enum values for `status` and `listing`, and warns about coherence issues (e.g. public experiments missing video).

Quick check: `npm run validate:experiments`

## Reference Implementation

**basketball-replay-center** and **404-not-found** -- two experiments with all 6 content types complete. Study them before writing your first article:
- Progressive Canvas 2D demos reimplementing shader techniques with interactive sliders
- Full MDX wiring pattern with custom `components/` directory
- All 5 docs formats populated with real content
