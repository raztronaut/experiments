---
name: run-generation
description: Run, debug, and verify the content generation pipeline (registry, posters, llms-txt). Use when the user asks to generate registry, build the site, run generation scripts, or when generation output seems wrong.
---

# Run Generation Pipeline

## Commands

| Command | What it does |
|---------|-------------|
| `npm run generate:registry` | 5-step registry pipeline (JSON → build → post-process → export component-preview slugs → MDX) |
| `npm run generate:posters` | Extract first frame from preview videos via ffmpeg |
| `npm run generate:llms-txt` | Generate `public/llms.txt` + `public/llms-full.txt` |
| `npm run generate:all` | Orchestrator: runs posters, registry, llms-txt in parallel |
| `npm run build` | `generate:all` → `next build` |

## Registry Pipeline (5 steps, sequential)

1. **generate-registry-json.mjs**: Scans 5 categories (experiments, sharedUI, collected, hooks, utilities), resolves import graphs, applies `registry.config.json` curation → `registry.json`
2. **build-registry.mjs**: Reads manifest + file contents → `public/registry/{name}.json` (shadcn-compatible)
3. **post-process-registry.mjs**: Validates all items → `public/registry/index.json` + `index-slim.json`
4. **export-component-preview-slugs.mjs**: Reads `ui-component-previews.tsx`, extracts keys of `UI_COMPONENT_PREVIEWS` → `scripts/component-preview-slugs.json` (single source of truth for which components get a live preview)
5. **generate-registry-mdx.mjs**: Generates Fumadocs MDX docs → `content/registry/**/*.mdx` (uses slug list from step 4 for component Preview sections)

## Skip Logic

- `status: "wip"` experiments are skipped by all generators

## Common Failure Modes

| Problem | Cause | Fix |
|---------|-------|-----|
| Stale items in registry | Deleted experiment still in `public/registry/` | Delete `public/registry/*.json`, re-run pipeline |
| Missing poster.jpg | No `ffmpeg` installed or no video file | `brew install ffmpeg`, add preview.mp4 |
| Wrong item count | `registry.config.json` `hidden` misconfigured | Check hidden array, re-run |
| MDX generation crash | Malformed registry.json | Fix upstream step, re-run from step 1 |
| Build fails after registry | Stale MDX in `content/registry/` | Delete `content/registry/`, re-run step 4 |

## Verification Steps

After running `generate:registry`:

1. Check item count: `node -e "const d=require('./public/registry/index-slim.json');console.log(d.length+' items')"`
2. Spot-check a generated MDX page in `content/registry/`
3. Spot-check a per-item JSON: `cat public/registry/send-button.json | head -20`

After running `generate:posters`:
- Verify poster.jpg exists in `public/experiments/<slug>/`

After running `generate:llms-txt`:
- Check `public/llms.txt` lists all shipped experiments

## Clean Build

For a full clean regeneration:

```bash
rm -rf public/registry/*.json content/registry/
npm run generate:registry
npm run generate:posters
npm run generate:llms-txt
```

## Curation

Edit `registry.config.json` to control:
- `featured`: items sorted to top of grid
- `hidden`: items excluded from all outputs
- `overrides`: patch descriptions/categories
- `scan`: toggle which directories are crawled
