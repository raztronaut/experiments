# V2 Vs Legacy Boundary

## Current repo truth

- Total experiments: 21
- Legacy experiments: 17
- Non-legacy experiments: 4

### Current v2 experiments

- `3d-crt-display`
- `airplanes`
- `announcing-v2`
- `velocity-responsive-design`

### Current legacy experiments

- `404-not-found`
- `basketball-replay-center`
- `bugged-out-game-of-life-shader-experiment`
- `cursor-depth-explorer`
- `game-of-life-shader`
- `gravity-physics-ui-layout`
- `keyboard-keys`
- `life-3d`
- `mountain-transition`
- `non-euclidean-hyperbolic-workspace`
- `rabbithole-chat-gallery-explore`
- `rabbithole-chat-preloader`
- `send-button`
- `shader-landing`
- `terminal-cat`
- `test`
- `transit-airport-split-flap-display`

## What the boundary means

`legacy: true` is not just a label. In this repo it already acts as:

- a human caution signal
- an agent-policy boundary
- a restructuring limiter
- a statement that not every old experiment must be normalized into the v2 platform

## What can be standardized

### Safe to standardize for v2

- layout/meta helper patterns
- shared surface-policy derivation
- shared article/content integration
- shared dev-tooling expectations
- build/verification assumptions
- stronger runtime isolation checks

### Document-only standardization for legacy

- visibility policy interpretation
- `/dev` dashboard presentation
- inventory/reporting
- high-level metadata validation

### Do not broadly standardize into legacy right now

- mass layout rewrites
- runtime architecture rewrites
- toolkit retrofits
- component decomposition sweeps
- new article runtime assumptions unless explicitly migrated

## Why this boundary should remain

The lab is not one homogeneous experiment platform. It is:

- a modern v2 platform path
- plus a frozen archive of older work

The realization pass should make that explicit rather than pretending every experiment must conform to the same implementation contract.

## Standardization rule for the clean pass

If a change touches:

- shared policy
- shared metadata derivation
- feeds / llms / sitemap logic
- docs / scaffolding / workflows

it may apply repo-wide.

If a change touches:

- experiment runtime architecture
- per-experiment layouts
- toolkit assumptions
- rendering/performance structure

it should apply to v2 first unless there is a very strong reason otherwise.

## Recommendation

Treat the clean pass as:

- **formalizing the v2 platform**
- **preserving the legacy archive**

not as a repo-wide runtime normalization effort.
