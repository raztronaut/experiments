# T7: Nice-to-Have

Low-priority items that don't belong in another tier. Will become relevant when adjacent work creates an opportunity.

Audit date: 2026-03-11

## Code Quality

- [ ] **CSS base style extraction** -- ~45 lines duplicated between `globals.css` and `experiments.css`. Low ROI.
- [ ] **Preview media component redundancies** -- `InteractivePreviewMedia.tsx` and `StaticExperimentMedia.tsx` have overlapping DOM and dead CSS.

## Features

- [ ] **`next-view-transitions`** -- Same-document transitions for the `(main)` route group. CSS cross-document transitions already work.
- [ ] **Tier 2/3 library adoption** -- None adopted yet:
  - Tier 2: r3f-scroll-rig, react-vfx/vfx.js, StringTune, @react-three/timeline, Theatre.js
  - Tier 3: motion-primitives, animate-ui, Cambio
