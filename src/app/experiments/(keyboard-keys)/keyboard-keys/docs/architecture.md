# Architecture: Keyboard Keys

## Overview
A sequential keyboard shortcut validator with 3D CSS keycaps, state-driven animations, escalating error handling, and confetti celebrations. Pure React + CSS, no external animation libraries.

## Component Tree
```
KeyboardKeys (main orchestrator)
├── Key × 3 (⌘, ⇧, P)
│   ├── shadow layer (absolute, translated)
│   ├── surface layer (gradient, border, shine)
│   └── label
├── status text (conditional)
├── error messages (streak-based)
├── confetti particles (15 per key, on success)
└── lockout overlay (full-screen, countdown timer)
```

## Key Patterns
- **State machine**: `idle -> active -> completed -> success` (happy path), any state -> `error` (wrong key)
- **Sequential validation**: `currentIndex` tracks which key is expected next. Match = advance, mismatch = shake + reset.
- **Deterministic randomness**: Confetti positions use `(index * prime + offset) % 100` instead of `Math.random()` for consistent renders.
- **CSS depth illusion**: Two stacked `<span>` elements with `translate-y-1` offset. Press animation collapses the gap.
- **Escalating consequences**: Error count -> message index -> lockout at threshold 17.

## Data Flow
1. `keydown` event -> `handleKeyDown` callback
2. Compare `e.key` against `keys[currentIndex].keyCode`
3. Update `keys` array state (immutable map)
4. Key component re-renders with new `state` prop -> CSS transitions handle visuals

## Dependencies
| Package | Purpose |
|---------|---------|
| `react` | Component framework |
| `@/lib/utils` | `cn()` class merging |

Zero external animation or UI libraries.

## Performance Notes
- Confetti uses CSS `@keyframes` (compositor-thread, no JS per frame)
- 45 particles total (15 × 3 keys) is well within CSS animation budget
- `contentVisibility: auto` could be added if embedded in a scrolling page
