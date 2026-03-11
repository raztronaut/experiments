# Relativistic Reader: Velocity-Responsive Design (VRD)

The **Relativistic Reader** is an experimental UI paradigm that explores content adaptation as a function of time and kinetic intent. Unlike traditional responsive design which adapts to screen dimensions, VRD adapts content density and visual presentation based on the user's scroll velocity.

## Concept: Kinetic Intent

VRD categorizes user interaction into two primary kinetic states:

1. **Deep Reading (Slow Scroll):** High-density information, serif typography, detailed code blocks, and static imagery. Optimized for comprehension.
2. **Skimming (Fast Scroll):** Low-density summaries, bold sans-serif typography, collapsed "file signatures" for code, and expanded hero imagery. Optimized for pattern recognition and visual anchoring.

## Core Mechanics

### Motion Persistence and Hysteresis
To prevent visual "flicker" during rapid speed changes, the system employs **Hysteresis**. State transitions are stabilized by using different thresholds for entering and exiting "Skim Mode," ensuring the UI feels deliberate and physical.
- **Enter Skim:** 2500 PX/S
- **Exit Skim:** 400 PX/S (with 2.5s hold)
- Thresholds are tunable at runtime via `useDevControls` in `?debug` mode.

### Lenis-Native Velocity Tracking
Velocity is read directly from Lenis's native `velocity` property via `useLenis()`. Lenis owns the scroll at Tempus priority -1 through `createUnifiedScroll`, making its velocity the most reliable and frame-synchronized source.

### Relativistic Visuals
Inspired by special relativity, the interface simulates physical effects of high-velocity travel:
- **Length Contraction:** Text blocks reorganize and scale to accommodate higher travel speeds.
- **Mass Increase:** Imagery gains visual weight, expanding to fill the viewport as "visual speed bumps."
- **Warp Depth:** A canvas-based `SpeedLines` component creates a radiating depth effect that intensifies with velocity.

### Flight Control System
A manual "Flight Control" dashboard allows developers to bypass physical scrolling and manually slide through velocity vectors to calibrate transitions and visual effects.

### Reduced Motion
When `prefers-reduced-motion` is active, the experiment locks to "detailed" reading state permanently. SpeedLines canvas is disabled, and all spring transitions use instant durations. The interaction UI remains functional.

## Components

- **`VelocityProvider`**: React Context tracking scroll velocity via Lenis, with hysteresis state machine, `useDevControls`, and `useReducedMotion`.
- **`FlightControl`**: Fixed bottom velocity control bar with spring-physics slider and manual override.
- **`IntelligentScroller`**: Scroll position stabilizer using anchor-based layout shift compensation via `useScrollStabilizer` hook.
- **`VelocityText`**: Morphs between long-form text and summaries using Motion's `AnimatePresence` with `popLayout`.
- **`VelocityImage`**: Dynamically scales and adjusts focal depth based on scroll momentum.
- **`VelocityCodeBlock`**: Collapses source code into a minimal "implementation signature" during high-speed travel.
- **`SpeedLines`**: Canvas overlay simulating astronomical warp speed (progressive enhancement -- disabled in reduced motion).

## Tech Stack

- **React / Next.js** (App Router)
- **Lenis** + **Tempus**: Smooth scroll via `createUnifiedScroll` with unified RAF priority chain.
- **Motion**: Spring-based transitions and layout animations.
- **Canvas 2D**: SpeedLines particle system.
- **Leva** (via `useDevControls`): Runtime parameter tuning in `?debug` mode.
