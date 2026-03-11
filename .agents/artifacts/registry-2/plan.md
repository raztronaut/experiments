# Orchestration Plan: Registry Pipeline (Phase 1)

## Goal

Split the monolithic `scripts/generate-registry.mjs` (541 lines) into a 3-step pipeline, add curation config, and extend scanning beyond experiments to shared UI/hooks/utils.

## Current State

- `scripts/generate-registry.mjs` -- monolithic script doing discovery + build + index generation
- 18 experiments registered in `public/registry/`
- Only scans `src/app/experiments/` and `src/components/experiments/`
- Does NOT scan `src/components/ui/` (28 components), `src/hooks/` (11 hooks), or `src/lib/` (7 utils)
- No curation config (featured, hidden, overrides)
- `registry.json` manifest doesn't exist (only individual per-item JSON files + indices)

## Target State

3-step pipeline:
1. `scripts/generate-registry-json.mjs` -- discover all sources → `registry.json` manifest
2. `scripts/build-registry.mjs` -- read manifest → inline content → per-item JSON files
3. `scripts/post-process-registry.mjs` -- read built items → indices + validation

Plus:
- `registry.config.json` -- curation rules (featured, hidden, overrides, scan scope)
- `package.json` -- updated `generate:registry` script chaining all 3 steps
- `scripts/generate-registry.mjs` -- kept as fallback (renamed comment at top)

## I/O Contracts

### registry.json (Domain 1 output → Domain 2 input)

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "razi-experiments",
  "homepage": "https://www.razisyed.cv",
  "items": [
    {
      "name": "send-button",
      "type": "registry:block",
      "title": "Send Button",
      "description": "A cool animated send button animation",
      "category": "experiments",
      "registryDependencies": ["razi-style"],
      "dependencies": ["motion", "lucide-react"],
      "files": [
        {
          "path": "src/components/experiments/send-button/SendButton.tsx",
          "type": "registry:component"
        }
      ],
      "meta": {
        "tags": ["animation", "ui"],
        "tech": ["motion"],
        "status": "shipped",
        "poster": "/experiments/send-button/poster.jpg",
        "video": "/experiments/send-button/preview.mp4"
      }
    },
    {
      "name": "razi-style",
      "type": "registry:style",
      "title": "Razi Style",
      "description": "Shared design tokens and CSS variables"
    }
  ]
}
```

### Per-item JSON (Domain 2 output → Domain 3 input)

Same format as current `public/registry/{slug}.json` with `$schema`, inlined `content` in files, asset URLs rewritten to absolute.

### index.json (Domain 3 output)

Array of items with `content` stripped from files (current format).

### index-slim.json (Domain 3 output)

Array of lightweight items: name, title, description, tags, tech, status, poster, video, category, fileCount, dependencyCount (current format).

### registry.config.json (Domain 4 output → Domain 1 input)

```json
{
  "$schema": "./schemas/registry-config.schema.json",
  "categories": ["experiments", "components", "hooks", "utilities", "styles"],
  "featured": ["send-button", "404-not-found", "keyboard-keys"],
  "hidden": ["test"],
  "overrides": {},
  "scan": {
    "experiments": true,
    "sharedUI": true,
    "hooks": true,
    "utilities": ["src/lib/utils.ts", "src/lib/fonts.ts"]
  }
}
```

## Domain Decomposition

| # | Domain | Complexity | Files Owned | Batch |
|---|--------|-----------|-------------|-------|
| 1 | Discovery Script | architecture | `scripts/generate-registry-json.mjs` | 1 |
| 2 | Build Script | architecture | `scripts/build-registry.mjs` | 1 |
| 3 | Post-Process Script | integration | `scripts/post-process-registry.mjs` | 1 |
| 4 | Config & Integration | mechanical | `registry.config.json`, `package.json` (scripts only) | 1 |

All 4 domains run in Batch 1 (parallel). No sequential dependencies since I/O contracts are specified above.

## File Ownership

| File | Owner |
|------|-------|
| `scripts/generate-registry-json.mjs` | Domain 1 |
| `scripts/build-registry.mjs` | Domain 2 |
| `scripts/post-process-registry.mjs` | Domain 3 |
| `registry.config.json` | Domain 4 |
| `package.json` | Domain 4 |
| `scripts/generate-registry.mjs` | NONE (read-only reference, not modified) |
