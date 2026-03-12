# Relativistic Reader: Velocity-Responsive Design (VRD)

The **Relativistic Reader** is an experimental UI paradigm that explores content adaptation as a function of time and kinetic intent. Unlike traditional responsive design which adapts to screen dimensions, VRD adapts content density and visual presentation based on the user's scroll velocity.

## Concept: Kinetic Intent

VRD categorizes user interaction into two primary kinetic states:

1. **Deep Reading (Slow Scroll):** High-density information, serif typography, detailed code blocks. Optimized for comprehension.
2. **Skimming (Fast Scroll):** Low-density summaries, bold sans-serif typography, collapsed code signatures, and expanded generative visuals. Optimized for pattern recognition and visual anchoring.

## Core Mechanics

### Hysteresis State Machine
To prevent visual "flicker" during rapid speed changes, the system employs **hysteresis**. State transitions are stabilized by using different thresholds for entering and exiting "Skim Mode," with a configurable hold delay on exit.
- **Enter Skim:** 500 PX/S (scaled)
- **Exit Skim:** 400 PX/S (with 2.5s hold)
- Thresholds are tunable at runtime via `useDevControls` in `?debug` mode.

### Lenis-Native Velocity Tracking
Velocity is read directly from Lenis's native `velocity` property via the `useVelocityEngine` hook. Lenis owns the scroll at Tempus priority -1 through `createUnifiedScroll`.

### Generative Visuals
Instead of static images, VelocityImage renders CSS-gradient-based generative visuals driven by `normalizedVelocity`. Each visual has a deterministic color palette and responds to scroll speed, serving as "visual speed bumps" during skim mode.

### Flight Control System
A fixed bottom dashboard allows manual velocity override to calibrate transitions and visual effects.

### Reduced Motion
When `prefers-reduced-motion` is active, the experiment locks to "detailed" reading state permanently. SpeedLines canvas is disabled, all spring transitions use instant durations.

## Architecture

```
VelocityResponsiveDesign.tsx    Orchestrator: Lenis lifecycle, section composition
  VelocityContext.tsx            Thin context: devControls, reducedMotion, manual velocity
    hooks/useVelocityEngine.ts   Core engine: scroll tracking, hysteresis, normalization
    hooks/useScrollStabilizer.ts Anchor-based layout shift compensation
  VelocityText.tsx               Morphs between long-form and summaries (AnimatePresence)
  VelocityImage.tsx              Generative gradient visuals, grid-based collapse
  VelocityCodeBlock.tsx          Collapses source into implementation signatures
  SpeedLines.tsx                 Canvas particle system (Tempus priority 2)
  FlightControl.tsx              Manual velocity dashboard
  IntelligentScroller.tsx        Scroll-stabilized content container
  content.ts                     Content data (text, image seeds, code snippets)
  constants.ts                   Thresholds, timings, spring configs
```

## Tech Stack

- **React / Next.js** (App Router)
- **Lenis** + **Tempus**: Smooth scroll via `createUnifiedScroll` with unified RAF priority chain
- **Motion**: Spring-based transitions and layout animations
- **Canvas 2D**: SpeedLines particle system
- **Leva** (via `useDevControls`): Runtime parameter tuning in `?debug` mode
