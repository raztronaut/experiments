# Automation Scripts

All scripts live in `scripts/` and are invoked via npm run commands.

## Scaffolding

### create-experiment.mjs

Non-interactive experiment scaffolder for AI agents and scripts.

```bash
npm run new:experiment:auto -- --name "fluid sim" --profile r3f-scene --toolkit --leva
```

| Flag | Required | Values | Default |
|------|----------|--------|---------|
| `--name` | Yes | Any string (becomes kebab-case slug) | -- |
| `--profile` | No | `blank`, `r3f-scene`, `r3f-shader`, `scrollytelling`, `interaction`, `web-audio`, `dom-effect`, `mixed` | `blank` |
| `--complexity` | No | `beginner`, `intermediate`, `advanced` | `beginner` |
| `--toolkit` / `--no-toolkit` | No | Boolean | `true` for scrollytelling/r3f profiles |
| `--leva` | No | Flag | `false` |
| `--description` | No | String | Empty |

Creates files in three directories: route group, component directory, and public assets directory.

The interactive version (`npm run new:experiment`) uses Plop.js and prompts for the same options.

### create-article.mjs

Non-interactive article scaffolder.

```bash
npm run new:article:auto -- --name <slug>
```

Creates 8 files: `article/page.tsx`, `article/content.mdx`, `article/components.tsx`, and 5 docs files (`lab-note.md`, `architecture.md`, `snippet.md`, `social.md`, `changelog.md`).

The interactive version (`npm run new:article`) uses Plop.js with an experiment selection prompt.

### create-collected.mjs

Non-interactive collected component scaffolder.

```bash
npm run new:collected:auto
```

Creates `ComponentName.tsx`, `meta.json`, and `styles.css` in `src/components/collected/<name>/`.

The interactive version (`npm run new:collected`) uses Plop.js.

## Deletion

### delete-experiment.mjs

Removes all files for an experiment across all three directories.

```bash
npm run delete:experiment <slug>        # with confirmation prompt
npm run delete:experiment <slug> --yes  # skip confirmation (AI agents)
```

### delete-article.mjs

Removes article and docs directories for an experiment.

```bash
npm run delete:article <slug>
```

## Generation

All generation scripts filter out `status: "wip"` experiments.

### generate-posters.mjs

Extracts the first frame from `preview.mp4` files as `poster.jpg`. Requires ffmpeg installed on the system.

```bash
npm run generate:posters
```

Skips experiments with `status: "wip"`. Only processes experiments that have a `video` field in `experiment.json` and a corresponding `.mp4` file. The poster is used as a placeholder before the video loads on the homepage to prevent layout shifts.

### generate-registry-json.mjs

The main registry scanner (~1200 lines). Scans source directories, resolves import trees, categorizes dependencies, and outputs `registry.json` in the shadcn registry schema.

```bash
node scripts/generate-registry-json.mjs
```

This is the first step of the 5-script registry pipeline. It reads curation rules from `registry.config.json`.

### build-registry.mjs

Reads `registry.json` and builds individual JSON files into `public/registry/`:

```bash
node scripts/build-registry.mjs
```

Outputs: `<slug>.json` per item, `index.json`, `index-slim.json`.

### post-process-registry.mjs

Post-processes registry output. Handles `razi-style` shared style propagation and metadata enrichment.

```bash
node scripts/post-process-registry.mjs
```

### export-component-preview-slugs.mjs

Reads `src/components/registry/ui-component-previews.tsx`, extracts the keys of `UI_COMPONENT_PREVIEWS`, and writes `scripts/component-preview-slugs.json`. The next step (generate-registry-mdx.mjs) uses this to know which component docs get a live preview iframe.

```bash
node scripts/export-component-preview-slugs.mjs
```

### generate-registry-mdx.mjs

Generates Fumadocs MDX documentation into `content/registry/`. Files with a `.generated` marker are regenerated on each build; hand-authored files are preserved.

```bash
node scripts/generate-registry-mdx.mjs
```

### Full Registry Pipeline

All five run in sequence:

```bash
npm run generate:registry
# Equivalent to:
# node scripts/generate-registry-json.mjs &&
# node scripts/build-registry.mjs &&
# node scripts/post-process-registry.mjs &&
# node scripts/export-component-preview-slugs.mjs &&
# node scripts/generate-registry-mdx.mjs
```

### generate-llms-txt.mjs

Generates LLM discovery files into `public/`.

```bash
npm run generate:llms-txt
```

| Output | Content |
|--------|---------|
| `public/llms.txt` | Curated summary (v1.1.1 spec): articles, experiments, tech stack, Content API |
| `public/llms-full.txt` | Extended: full descriptions, complexity, profile, status, created date, tech, article links |

Filtering: skips `status: "wip"` and `listing: "registry"` experiments. Checks for article existence on disk.

## Validation

### validate-experiments.mjs

Validates all `experiment.json` files across the codebase.

```bash
npm run validate:experiments
```

Checks:
- Required fields present (`title`, `description`, `slug`, `created`, `profile`, `status`)
- Enum values valid (`status`, `listing`, `profile`, `complexity`)
- No duplicate slugs
- Coherence warnings (e.g., public experiments missing video)

Runs as a pre-commit hook via lefthook.

### validate-site-config.mjs

Validates that `scripts/lib/site-config.mjs` and `src/lib/constants.ts` stay in sync on overlapping keys (SITE_URL, SITE_TITLE, AUTHOR_NAME, GITHUB_URL, TWITTER_URL).

```bash
npm run validate:site-config
```

Checks:
- All five keys present in both files
- Values match exactly; exits 1 on mismatch

Runs as a pre-commit hook via lefthook (no glob — runs every commit).

## Capture and Optimization

### capture.mjs

Playwright-powered screenshot capture.

```bash
npm run capture <slug> [options]
```

| Option | Purpose | Default |
|--------|---------|---------|
| `--delay <ms>` | Wait before capture | -- |
| `--scroll <%>` | Scroll position | 0 |
| `--viewport <WxH>` | Viewport size | 1280x720 |
| `--full-page` | Capture full page | false |
| `--og` | OG image dimensions | false |

For interactive visual QA, the pinchtab MCP tool is preferred over this script.

### optimize-videos.mjs

Compresses experiment preview videos.

```bash
npm run optimize:videos
```

## Other Scripts

### generate-registry.mjs (legacy)

Legacy registry generation script. Kept for reference but not used in the current build pipeline.

```bash
npm run generate:registry:legacy
```

### patch-r3f-perf.mjs

Patches `r3f-perf` for compatibility. Runs automatically via the `postinstall` npm hook.

## Build Pipeline Integration

`npm run build` calls `generate:all` then `next build`:

```bash
npm run generate:all && next build
```

### generate-all.mjs

Orchestrator that runs the three generation phases in parallel:

- **posters** (`generate-posters.mjs`) -- independent, writes to `public/experiments/*/poster.jpg`
- **registry** (4-step sequential pipeline) -- writes to `registry.json`, `public/registry/`, `content/registry/`
- **llms-txt** (`generate-llms-txt.mjs`) -- independent, writes to `public/llms.txt` + `public/llms-full.txt`

Wall-clock time is `max(posters, registry, llms-txt)` instead of their sum. Prints per-phase timing on completion. All scripts use `writeIfChanged` to skip writes when output is identical, preserving file timestamps and avoiding unnecessary git diffs.

This runs on every Vercel deploy (both preview and production).
