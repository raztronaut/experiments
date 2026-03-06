# Changelog: Keyboard Keys

## Origin
Inspired by macOS keyboard shortcut prompts and mechanical keyboard aesthetics. The standard approach (flat label text) doesn't communicate that you should actually press the keys. Wanted the visual to imply interactivity.

## Iterations

### v1: Basic key rendering
- Single `div` with border-radius and gradient
- No depth, no press animation
- Looked flat and generic

### v2: Two-layer depth
- Added shadow layer offset by 4px
- Press animation collapses the offset
- Immediately felt physical and satisfying

### v3: Sequential validation
- State machine for tracking key sequence
- Color transitions per state (green/red/neutral)
- Shake animation on error using CSS keyframes

### v4: Personality layer
- Escalating error messages based on failure count
- 5-minute lockout at threshold
- Confetti burst on success with per-key particle spawning
- Deterministic particle positions for consistent renders

## Current State
Shipped. Works on desktop (keyboard events) and mobile (touch targets on keys). The lockout timer resets on page refresh (could persist via localStorage as a future improvement).

## Related Ideas
- Full keyboard layout renderer (not just shortcut sequences)
- CAPTCHA-style interaction using the lockout mechanic
- Haptic feedback via Vibration API on mobile
