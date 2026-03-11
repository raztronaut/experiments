# Registry 2: Pipeline Split Orchestration

**Date**: 2026-03-11
**Skill**: parallel-orchestration (4 domain agents, 1 batch)
**Plan reference**: `.cursor/plans/registry_interactive_docs_aaa07efa.plan.md` Phase 1 (registry-pipeline)

## What was done

Split the monolithic `scripts/generate-registry.mjs` (541 lines) into a 3-step pipeline, added curation config, and extended scanning to shared UI/hooks/utils.

## Domains

| # | Domain | Status | Model | Files Created/Modified |
|---|--------|--------|-------|----------------------|
| 1 | Discovery Script | DONE (aborted before handoff) | default | `scripts/generate-registry-json.mjs` (734 lines) |
| 2 | Build Script | DONE | default | `scripts/build-registry.mjs` (162 lines) |
| 3 | Post-Process Script | DONE | default | `scripts/post-process-registry.mjs` (183 lines) |
| 4 | Config & Integration | DONE | fast | `registry.config.json`, `package.json` (scripts) |

## Pipeline

```
generate:registry = generate-registry-json.mjs && build-registry.mjs && post-process-registry.mjs
```

1. **Discover** → `registry.json` manifest (experiments + shared UI + hooks + selected utils)
2. **Build** → per-item JSON in `public/registry/` (inline content, rewrite URLs)
3. **Post-process** → `index.json` + `index-slim.json` (indices for UI)

## Notes

- Domain 1 agent was aborted mid-execution but the script was fully written (734 lines, complete `main()` function)
- Domain 1 handoff was reconstructed manually from script inspection
- Legacy script kept as `generate:registry:legacy` in package.json
- `registry.config.json` controls featured/hidden/overrides/scan scope
- Verification pass and integration testing still pending
