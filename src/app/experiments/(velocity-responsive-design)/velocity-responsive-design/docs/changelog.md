# Changelog: Velocity-Responsive Design

## Origin

The idea started from a question: responsive design adapts to screen size, but why not to reading speed? Scroll velocity is a strong proxy for cognitive mode. A slow reader wants depth. A fast scanner wants landmarks. The experiment name came from special relativity — at high velocities, space contracts and time dilates. Same thing happens to content in VRD.

## Iterations

### v0.1 — Naive threshold (2025-12)
Single threshold at 500 px/s. Binary toggle between detailed/skim. Flickered badly — scroll velocity oscillates around any fixed point. Proved the concept but was unusable.

### v0.2 — Hysteresis state machine (2025-12)
Asymmetric enter/exit thresholds (500/400) with exit delay. Borrowed from Schmitt trigger design in electronics. Eliminated flicker entirely. Dead zone between thresholds absorbs normal velocity fluctuation.

### v0.3 — Lenis-native velocity (2026-01)
Replaced manual delta computation with Lenis's native `velocity` property. Cleaner, smoother, one line of code instead of delta tracking with timestamps.

### v0.4 — Scroll stabilizer (2026-02)
Solved the layout jump problem. When text collapses to summaries, page height drops. Anchor-based correction loop: record viewport anchor, correct scroll position for 36 frames as springs settle. Velocity lock during corrections prevents feedback loops.

### v0.5 — Content type system (2026-02)
Generalized from text-only to a typed content system: `text | image | code`. Each type has its own velocity-responsive renderer. Images use grid collapse/expand. Code blocks collapse to function signatures.

### v0.6 — SpeedLines + FlightControl (2026-03)
Canvas 2D particle system at Tempus priority 2 gives warp-speed visual feedback. FlightControl dashboard with manual velocity override — started as debug tooling, kept as a feature.

### v1.0 — Shipped (2026-03)
Full polish pass. Reduced motion support. Dev controls via leva. Content data extracted to `content.ts`. Component decomposition to meet 200-line target. Comprehensive test suite for hysteresis engine.

## Current State

Shipped. Binary state machine (detailed/skim) with hysteresis. Lenis-native velocity tracking. Anchor-based scroll stabilization. Canvas particle effects. Manual velocity override dashboard. Full `prefers-reduced-motion` support.

## Related Ideas

- **Continuous spectrum**: Replace binary states with smooth interpolation across font weight, line height, and density.
- **Touch pressure**: Use Force Touch / 3D Touch as a second velocity signal.
- **Predictive thresholds**: ML-based per-user threshold calibration from scrolling patterns.
- **Content-aware density**: Different threshold tuning for code blocks vs. prose vs. images.
- **Reading progress estimation**: Combine velocity data with scroll position to estimate reading completion.
