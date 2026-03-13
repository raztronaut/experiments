# Performance And Runtime Isolation

## Executive summary

Runtime isolation is one of the strongest architectural properties in the repo today. The clean pass should preserve it aggressively.

The main performance/isolation questions are not whether experiments should remain isolated. They should. The questions are:

- where isolation is currently broken
- which shared helpers are safe
- which shared helpers are risky at scale
- how registry/docs and previews interact with experiment runtimes

## Per-experiment `<html>/<body>`: keep

### Benefits

- full CSS isolation from the main shell
- freedom to force theme and typography
- safer WebGL / custom scroll / pinned-section behavior
- lower risk of experiment-specific global CSS leaking into the main app
- clearer mental model for “experiments are apps”

### Costs

- duplicated layout/meta boilerplate
- repeated nav/SEO/runtime shell code
- harder to apply shared fixes unless helpers or templates are introduced

### Decision

Keep this pattern. It is worth the duplication cost.

## Current isolation breaches

### Confirmed breach

- ~~`rabbithole-chat-gallery-explore` references frames from `rabbithole-chat-preloader`~~

This breach is now addressed in main.

### Potential structural breach class

Any experiment that depends on another experiment’s files or asset paths without a formal shared layer breaks the isolation contract even if there is no TypeScript import.

## Shared helper safety

### Safe shared layers

- UI primitives in `src/components/ui/`
- toolkit helpers in `src/lib/toolkit/`
- shared utilities
- dev tooling

These are acceptable as long as they do not create hidden runtime coupling between experiments.

### Risky shared layer

`createUnifiedScroll()` currently monkey-patches `ScrollTrigger.create`. That is acceptable in a one-owner experiment model, but it is not infinitely scalable if multiple scroll owners or concurrent preview/runtime contexts become more common.

This is not an immediate blocker, but it should be documented as a design constraint.

## File-size hotspots

Large experiment files indicate where maintainability and performance reasoning are likely to be weakest.

Top current hotspots include:

- `rabbithole-chat-gallery-explore/VisualiserLogic.ts` — 597 lines
- `keyboard-keys/KeyboardKeys.tsx` — 540 lines
- `cursor-depth-explorer/CursorDepthExplorer.tsx` — 448 lines
- `transit-airport-split-flap-display/TransitAirportSplitFlapDisplay.tsx` — 390 lines
- `rabbithole-chat-preloader/Gallery.ts` — 366 lines

These do not all need immediate surgery, but they are where future complexity will accumulate first.

## Registry/docs outside experiment runtimes

### Current state

- Registry docs live under a separate `(registry)` layout tree.
- Collected previews live under `(collected-preview)`.
- Experiment previews often use iframes or isolated layouts.

### Assessment

This is a good split.

Registry/docs should remain **outside** experiment runtime trees because:

- they are a different product surface
- they should not inherit experiment runtime assumptions
- they benefit from a docs-specific shell and search system
- they can remain backstage-but-reachable without being runtime-coupled to individual experiments

## Iframe and preview considerations

The repo already uses iframes for:

- preview drawers
- live demos
- collected previews

This is consistent with the isolation-first design. It is acceptable as long as:

- navigation hides appropriately in embeds
- preview routes stay lightweight
- experiment runtimes do not assume top-level window ownership

## Telemetry and dev-tools split

Current split:

- `(main)` layout uses Vercel Analytics, Speed Insights, and Umami
- experiment layouts use Umami only (no Vercel Analytics or Speed Insights)
- `?debug`-driven runtime metrics and overlays are part of the experiment platform, not the main shell

This split should be preserved or redesigned consciously, not accidentally changed during layout standardization.

## Performance-sensitive dependency classes

The clean pass should explicitly review:

- `@fumadocs/story` — In use (`src/lib/story.ts`, `src/app/(registry)/registry.css`) but slated for removal. T8 Phase A targets it because its barrel export pulls `node:fs/promises` which breaks Turbopack client bundling.
- `@theatre/*` — Dead dependency. Zero imports in `src/`. Safe to remove.
- `@react-spring/three` — Dead dependency. Zero imports in `src/`. Safe to remove.
- heavy registry docs payload behaviors
- output file tracing breadth
- `r3f-perf` — Active dev tool with postinstall patch (`scripts/patch-r3f-perf.mjs`) for Turbopack compat.

## Recommendation

- Preserve experiment runtime isolation.
- Remove explicit isolation breaches.
- Standardize only v2-safe shared helpers.
- Keep registry/docs and collected previews outside experiment runtime trees.
- Treat large-file hotspots and scroll monkey-patching as important design warnings, not necessarily first-move refactors.
