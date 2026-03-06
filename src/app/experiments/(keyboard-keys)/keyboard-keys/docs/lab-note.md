# Lab Note: Keyboard Keys

## Context
Wanted to explore making keyboard shortcut prompts feel physical and interactive. Most shortcut UIs are flat labels -- "Press ⌘+⇧+P" as text. The idea was: what if the keys themselves were interactive objects with depth, state, and personality?

## What I Tried
- **3D transforms with perspective**: Too complex for simple keycaps. The parallax looked wrong at certain angles.
- **SVG keys**: Vector-based approach. Clean but hard to animate the press depth convincingly.
- **CSS pseudo-layer stacking**: Two overlapping rounded rects with offset. Simple, performant, and the translate animation sells the press.

## What Worked
- The two-layer depth trick (shadow + surface) is dead simple and convincing. No 3D context needed.
- State-driven color mapping (5 states -> 5 color schemes) keeps the logic clean. Each Key component is pure render, no internal state.
- Escalating error messages with a lockout threshold. The personality makes people want to intentionally fail to see all the messages.
- Deterministic confetti (seeded by index) means no layout jank or inconsistent re-renders.

## What I'd Do Differently
- Use `e.code` instead of `e.key` for keyboard events. The current approach requires `.toLowerCase()` workarounds for Shift-modified keys.
- Extract the confetti into a reusable component. The inline style calculation is too coupled to the key layout.
- Add haptic feedback via the Vibration API on mobile for the press animation.
- The lockout timer should persist in localStorage so refreshing doesn't reset it.

## Open Questions
- Would this work as a CAPTCHA-like interaction? The lockout mechanic is already there.
- Could the key component be generalized into a keyboard renderer that takes any layout?
