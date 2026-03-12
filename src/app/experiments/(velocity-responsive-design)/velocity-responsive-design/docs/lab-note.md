# Lab Note: Velocity-Responsive Design

## Context

Responsive design adapts to screen size. What if it adapted to scroll speed? The hypothesis: scroll velocity is a signal for cognitive mode — slow scroll means deep reading, fast scroll means skimming. The UI should serve different content densities for each.

## What I Tried

**Naive threshold switching.** Single threshold at 500 px/s. Flickered constantly — scroll velocity oscillates around any fixed point. Unusable.

**Hysteresis state machine.** Borrowed from Schmitt triggers. Asymmetric enter/exit thresholds (500/400) with a 2.5s exit delay. Eliminated flicker entirely. The dead zone between thresholds absorbs normal velocity fluctuation.

**Raw velocity computation via scroll deltas.** Computed velocity from `scrollTop` differences across frames. Noisy, frame-rate dependent, and duplicated work that Lenis already does. Switched to reading Lenis's native `velocity` property directly — cleaner, smoother, and one line of code.

**Layout shift compensation.** When text collapses from paragraphs to summaries, the page height drops by thousands of pixels and the viewport jumps. First tried `scrollTo` with a saved position — didn't account for the spring animation duration. Landed on an anchor-based correction loop: record the nearest element's viewport offset before transition, then run 36 frames of `scrollBy` corrections to chase the anchor as springs settle. Brute force but effective.

**Velocity lock during corrections.** The `scrollBy` calls from the stabilizer registered as scroll events, which fed the velocity engine, which could trigger another state transition. Added a velocity lock that suppresses tracking for 800ms during programmatic scrolls.

## What Worked

- Hysteresis from control systems theory is the right abstraction for UI state transitions that need stability.
- Lenis-native velocity is smoother than manual delta computation.
- The 36-frame correction loop is ugly but solves a genuinely hard problem — compensating for layout shifts during ongoing spring animations.
- FlightControl manual override started as a debug tool and became the best way to experience the experiment. Users can sweep through the velocity range without actually scrolling.

## What I'd Do Differently

- Continuous spectrum instead of binary states. Font weight, line height, and density varying smoothly with normalized velocity.
- View Transitions API for layout shift management instead of the brute-force correction loop.
- Touch pressure as an additional signal (available on Force Touch / 3D Touch devices).
- Content-aware thresholds — different threshold tuning based on content type (code blocks vs. prose vs. images).

## Open Questions

- Does velocity-responsive design generalize beyond text? What about data dashboards, image galleries, video feeds?
- Is the skim state better served by a different layout entirely (horizontal scroll? card stack?) rather than just condensed text?
- Could ML predict the optimal threshold values per-user based on their scrolling patterns over time?
- How does this interact with accessibility? The `prefers-reduced-motion` fallback locks to detailed mode, but is that sufficient?
