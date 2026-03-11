# T7: Nice-to-Have

Low-priority items that don't belong in another tier. Will become relevant when adjacent work creates an opportunity.

Audit date: 2026-03-11

## Code Quality

- [x] **CSS base style extraction** -- `@theme` block and `@custom-variant dark` deduplicated into `shared-theme.css`. ~45 lines of shared base styles (`scrollbar`, `selection`, `text-rendering`) still duplicated between `globals.css` and `experiments.css` but differ slightly (experiments has Lenis rules, article typography). Low ROI to merge further.
- [ ] **Preview media component redundancies** -- `InteractivePreviewMedia.tsx` and `StaticExperimentMedia.tsx` have overlapping DOM and dead CSS.

## Tailwind v4 Opportunities

Migrated from v3.4 to v4.2 (2026-03-11). These leverage new v4 capabilities:

- [ ] **`@theme inline` color simplification** -- Collapse the two-layer HSL indirection (`shared-tokens.css` bare values + `shared-theme.css` `hsl()` wrappers) into single full-value CSS variables. shadcn/ui v4 uses OKLCH natively. Would also eliminate all `hsl(var(--x))` in custom CSS (scrollbar, selection, code blocks). Medium effort -- need to convert ~35 tokens across light/dark and verify color fidelity.
- [ ] **3D transform utilities** -- `rotate-x-*`, `rotate-y-*`, `perspective-*`, `translate-z-*` are built-in. Could replace inline styles in creative experiments that currently use `style={{ transform: ... }}`.
- [ ] **`@starting-style` entry animations** -- `starting:opacity-0` variant for native CSS entry animations. Potential replacement for simple `gsap.set()` initial states on fade-in elements. Not a replacement for complex GSAP timelines.
- [ ] **Container queries** -- `@container` / `@min-*` / `@max-*` variants are first-class. Useful for component-level responsive design in registry components or experiment UIs.
- [ ] **`not-*` variant** -- `not-last:mb-4` instead of manual list spacing. Quick cleanup pass on list components.
- [ ] **`inert` utility** -- Could simplify pointer-events/overflow management in Lenis scroll locking, drawer overlays, or mobile blocker.
- [ ] **shadcn/ui v4 component refresh** -- Current components have v4 class renames applied but still use `forwardRef` pattern (works fine on React 19 but dated). Re-generating with `npx shadcn@latest add --overwrite` would bring `data-slot` attributes, remove `forwardRef`, and adopt latest patterns. Low priority -- functional as-is. Preserve `GrainOverlay` in drawer and theme integration in sonner when regenerating.

## Features

- [ ] **`next-view-transitions`** -- Same-document transitions for the `(main)` route group. CSS cross-document transitions already work. Good candidate for T2 Registry page transitions too (mentioned in registry plan Phase 7).
- [ ] **Tier 2/3 library adoption** -- None adopted yet. Once the registry ships (T2), these become "consume upstream registry, fork, customize, redistribute" opportunities -- the shadcn model applied recursively.
  - Tier 2: r3f-scroll-rig, react-vfx/vfx.js, StringTune, @react-three/timeline, Theatre.js
  - Tier 3: motion-primitives, animate-ui, Cambio
  - Source: [Registry interactive docs plan -- "T7 Synergy"](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md)
