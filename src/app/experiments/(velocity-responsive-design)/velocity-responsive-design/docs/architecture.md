# Architecture: Velocity-Responsive Design

## Overview

A scrollytelling experiment that adapts content density based on scroll velocity. Lenis provides smooth scroll and native velocity tracking. A hysteresis state machine classifies reading mode. Motion handles animated transitions between content states. Canvas 2D renders velocity-driven particles.

## Component Tree

```
VelocityResponsiveDesign.tsx          Orchestrator: Lenis lifecycle, section composition
├── VelocityProvider (VelocityContext.tsx)   Thin React context: devControls, reducedMotion
│   └── useVelocityEngine.ts          Core engine: scroll → velocity → hysteresis → state
├── SpeedLines.tsx                    Canvas 2D particle system (Tempus priority 2)
├── IntelligentScroller.tsx           Scroll-stabilized content container
│   └── useScrollStabilizer.ts        Anchor-based layout shift compensation
│   ├── VelocityText.tsx              Morphs between long-form and summaries (AnimatePresence)
│   ├── VelocityImage.tsx             Generative gradient visuals, grid collapse
│   └── VelocityCodeBlock.tsx         Collapses source into implementation signatures
├── FlightControl.tsx                 Manual velocity dashboard (fixed bottom bar)
└── content.ts                        Content data (text, image seeds, code snippets)
    constants.ts                      Thresholds, timings, spring configs
```

## Key Patterns

- **Hysteresis state machine**: Asymmetric enter/exit thresholds (500/400 px/s) with 2.5s exit delay prevent UI flicker. Implemented in `useVelocityEngine`.
- **Lenis-native velocity**: Reads `lenis.velocity` directly instead of computing deltas. Scaled by `VELOCITY_SCALE` (10x) to map lerp-smoothed values to display range.
- **Velocity normalization**: Raw velocity clamped to `NORMALIZATION_MAX` (3000) and mapped to 0–1. Drives particle intensity, image parallax, dashboard fill.
- **Scroll stabilization**: Anchor-based correction runs 36 frames post-transition to compensate for spring animation layout shifts. Locks velocity engine during corrections to prevent feedback loops.
- **Content type system**: `ContentItem` union type (`text | image | code`) maps to velocity-responsive renderers.
- **Motion springs**: All transitions use spring configs from `constants.ts`. `AnimatePresence` with `mode="popLayout"` for text swaps.

## Data Flow

```
Lenis scroll event
  → useVelocityEngine (scale, hysteresis, normalize)
    → VelocityContext (readingState, normalizedVelocity)
      → VelocityText (content swap)
      → VelocityImage (grid collapse / expand)
      → VelocityCodeBlock (full / signature)
      → SpeedLines (particle intensity)
      → FlightControl (dashboard display)

FlightControl manual override
  → VelocityContext (manualVelocity)
    → useVelocityEngine (bypasses scroll tracking)
```

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| lenis | 1.3 | Smooth scroll, native velocity tracking |
| motion | 12.x | AnimatePresence, spring transitions, layout animations |
| tempus | 1.0-dev.17 | Unified RAF for SpeedLines (priority 2) |
| lucide-react | — | Icons (Zap, Settings, Monitor, FileCode, Terminal) |
| @/lib/toolkit/scroll | — | `createUnifiedScroll()` binding |

## Performance Notes

- SpeedLines runs at Tempus priority 2 (after Lenis at -1, GSAP at 0, R3F at 1). Only draws when `normalizedVelocity > 0.1`.
- `velocityRef` used in SpeedLines/FlightControl to avoid re-renders on every scroll event.
- `useScrollStabilizer` uses `useLayoutEffect` for synchronous DOM corrections before paint.
- Canvas DPR scaling handled once on resize, not per frame.
- `prefers-reduced-motion` disables SpeedLines entirely, locks to detailed state, and zeros all spring durations.
