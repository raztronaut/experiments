---
name: Collected Components Review
overview: Build a preview harness for the 14 ported collected components, then run a systematic visual + code + registry review against the original Codegrid demos, using browser automation for side-by-side comparison.
todos:
  - id: preview-harness
    content: Build preview route at /registry/preview/[slug] with component map, index page, and special handling for Matter.js/Three.js/asset-dependent components
    status: pending
  - id: run-originals
    content: Install deps and run 14 original Codegrid demos from ~/Downloads/ in batches for comparison
    status: pending
  - id: visual-review-complex
    content: Browser-automate visual comparison for the 6 complex components (curved-text, fibonacci-orb, physics-tags, counter-flip, clip-path, scroll-frame-canvas)
    status: pending
  - id: visual-review-medium
    content: Browser-automate visual comparison for the 5 medium components (image-explosion, feature-convergence, split-card-flip, spotlight-image-stack, custom-video-player)
    status: pending
  - id: visual-review-simple
    content: Browser-automate visual comparison for the 3 sticky-cards variants (tilt, scale, fold)
    status: pending
  - id: code-quality-audit
    content: Run the Phase 4 checklist across all 14 components -- props, cleanup, reduced-motion, line count, meta.json, console errors
    status: pending
  - id: registry-pipeline-verify
    content: Run generate:registry, verify file counts, meta propagation, MDX generation, and test shadcn install for 1-2 components
    status: pending
  - id: summary-report
    content: Compile per-component fidelity scores, functional issues, system-level findings, and prioritized action items
    status: pending
isProject: false
---

# Collected Components Full Verification

## Context

[The porting session](0dd385b6-43e2-47d9-8857-7faee4112f2c) produced 14 collected components in `src/components/collected/`, all ported from Codegrid demos in `~/Downloads/`. A remediation pass fixed pipeline issues (CSS in registry, meta propagation) and code issues (reduced-motion, ScrollTrigger cleanup, line count). But **no visual smoke test was ever performed** -- the backlog item in [t2-content-registry.md](.agents/backlog/t2-content-registry.md) explicitly calls this out.

The fundamental blocker: **collected components have no preview route.** Unlike experiments (which live at `/experiments/<slug>`), collected components are only viewable as source code on `/registry/docs/collected/<slug>`. You literally cannot see them rendered.

## Phase 1: Preview Harness

Build a lightweight preview route that can render any collected component in the browser.

**Route:** `src/app/(registry)/registry/preview/[slug]/page.tsx`

- Dynamic import from `src/components/collected/<slug>/` using a slug-to-component map
- Full-viewport wrapper with scroll space (many components need 3-7x viewport height for ScrollTrigger)
- Own `<html>/<body>` inherited from the `(registry)` layout
- Load each component's `styles.css` alongside the TSX
- Dev-only -- can be gated behind `process.env.NODE_ENV === 'development'` or left as unlisted

**Component map approach:** Since Next.js can't truly dynamic-import by variable, build a static map:

```typescript
const COMPONENTS: Record<string, () => Promise<{ default: ComponentType }>> = {
  'sticky-cards-tilt': () => import('@/components/collected/sticky-cards-tilt/StickyCardsTilt'),
  'sticky-cards-scale': () => import('@/components/collected/sticky-cards-scale/StickyCardsScale'),
  // ... all 14
}
```

**Index page:** `src/app/(registry)/registry/preview/page.tsx` -- grid of links to all 14 previews for quick navigation.

**Special handling needed:**

- `physics-tag-cloud` -- expects Matter.js on `window`; needs a `<script>` tag for the CDN
- `fibonacci-image-orb`, `curved-text-scroll` -- dynamic Three.js imports (should work as-is)
- `scroll-frame-canvas` -- needs frame image URLs passed as props (or uses defaults)
- `custom-video-player` -- needs a video URL prop (or uses default)

## Phase 2: Run Originals for Comparison

All 14 source repos exist in `~/Downloads/`. Fire up the originals so we can compare side-by-side:


| Type           | Repos                                                                                                       | How to Run                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Next.js (4)    | sticky-cards-nextjs, sticky-cards-ashfall, image-explosion, asset-orb-next                                  | `npm install && npm run dev` on different ports |
| Vite (8)       | phive-sticky-cards, konpo-lp-reveal, capsules, split-card, senseitech, deepjudge, playable-objects, adaline | `npm install && npm run dev` on different ports |
| Plain HTML (2) | cg-video-player, cg-wodniack-work-section-scroll                                                            | `npx serve` or open directly                    |


Run them in batches of 3-4 at a time to avoid port/memory contention. We don't need all 14 running simultaneously.

## Phase 3: Visual Comparison (Browser Automation)

Use pinchtab/browser-devtools to:

1. Navigate to each ported preview (`/registry/preview/<slug>`)
2. Screenshot at key scroll positions (top, 25%, 50%, 75%, 100%)
3. Navigate to the matching original
4. Screenshot at the same positions
5. Compare: layout, colors, typography, animation timing, scroll behavior

**Priority order** (most complex / most likely to have issues first):

1. `curved-text-scroll` -- Three.js + GSAP + canvas dot grid (most complex, already had issues)
2. `fibonacci-image-orb` -- Three.js Fibonacci sphere
3. `physics-tag-cloud` -- Matter.js physics (window global dependency)
4. `counter-flip-reveal` -- GSAP Flip + SplitText (premium plugins)
5. `clip-path-reveal` -- SplitText + clipPath mask
6. `scroll-frame-canvas` -- Canvas frame sequence (needs image assets)
7. `image-explosion` -- Custom physics sim
8. `feature-convergence` -- Progress-based interpolation
9. `split-card-flip` -- 3D transforms + matchMedia
10. `spotlight-image-stack` -- Staggered scroll stack

11-14. Three sticky-cards variants + `custom-video-player` (simpler patterns)

## Phase 4: Code Quality Checklist (Per Component)

For each of the 14:

- `"use client"` directive present
- Props interface with sensible defaults (no required external data)
- `prefers-reduced-motion` handled (never leaves elements invisible)
- Cleanup: ScrollTrigger killed, Three.js resources disposed, RAF cancelled, listeners removed
- CSS scoped with component-specific prefix (no global namespace pollution)
- Line count under 300
- No hardcoded absolute paths or localhost URLs
- `meta.json` has source, author, license, tags, tech
- Component renders without errors in dev console

## Phase 5: Registry Pipeline Verification

1. Run `npm run generate:registry` -- confirm all 14 appear with 2 files each (TSX + CSS)
2. Spot-check 3 individual JSONs in `public/registry/` -- confirm `meta` block is populated
3. Check generated MDX in `content/registry/collected/` -- confirm docs exist for all 14
4. Verify `/registry/docs/collected/<slug>` loads in browser with correct content
5. Test install command: `npx shadcn add https://localhost:3000/r/<slug>` for 1-2 components

## Phase 6: Summary Report

Compile findings into a structured report:

- Per-component: visual fidelity score (matches original?), functional issues, code quality notes
- System-level: pipeline health, preview harness usability, gaps found
- Action items: concrete fixes needed, prioritized

## Known Issues to Verify (from porting session)

- `feature-convergence` and `curved-text-scroll` dropped custom fonts -- check visual impact
- `counter-flip-reveal` has a `@ts-ignore` for GSAP Flip import casing -- still needed?
- No test files exist for any of the 14 -- note but don't block on this
- `physics-tag-cloud` expects Matter.js on `window` -- will it error gracefully if missing?

