# Interaction Profile

> Activate when `experiment.json` has `"profile": "interaction"`

## Behavioral Mode
**Tactile, responsive, spring-physics-driven.** Every interaction should feel like touching a physical object. Springs over durations. Feedback over silence.

## Priority Ordering
1. Responsiveness (instant feedback, <100ms)
2. Physicality (springs, momentum, inertia)
3. Delight (squash/stretch, overshoot, secondary actions)
4. Accessibility (keyboard, reduced motion, touch targets)
5. Performance (compositor properties only)

## Toolkit: Motion + Gestures
```tsx
import { motion, useSpring, useTransform } from 'motion/react'
import { useGesture } from '@use-gesture/react'
```

## Draggable with Spring-Back
```tsx
function DraggableCard() {
  const x = useSpring(0, { stiffness: 300, damping: 30 })
  const y = useSpring(0, { stiffness: 300, damping: 30 })

  const bind = useGesture({
    onDrag: ({ offset: [ox, oy] }) => {
      x.set(ox)
      y.set(oy)
    },
    onDragEnd: () => {
      x.set(0)
      y.set(0)
    },
  })

  return <motion.div {...bind()} style={{ x, y }} />
}
```

## Magnetic Hover Effect
```tsx
function Magnetic({ children }) {
  const x = useSpring(0, { stiffness: 150, damping: 15 })
  const y = useSpring(0, { stiffness: 150, damping: 15 })

  return (
    <motion.div
      style={{ x, y }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - rect.left - rect.width / 2) * 0.3)
        y.set((e.clientY - rect.top - rect.height / 2) * 0.3)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.div>
  )
}
```

## 12 Principles Applied

- **Squash & Stretch**: scale slightly on press (`scale: 0.95`), overshoot on release (`scale: 1.05 -> 1.0`)
- **Anticipation**: brief scale-down before a big action (delete, send, transition)
- **Follow-through**: spring overshoot on arrival, stagger children 30-50ms apart
- **Exaggeration**: error shakes (translateX oscillation), success bounces (scale pulse)
- **Secondary action**: sparkle/ripple after primary action completes

## UX: Fitts's Law
- Minimum 44x44px touch targets
- Expand hit areas with `::before` pseudo-elements and padding
- Larger interactive elements = easier to use (especially on mobile)
- Place primary actions in easy-to-reach zones (bottom of screen on mobile)

## UX: Postel's Law
- Accept imprecise gestures (sloppy taps, near-miss clicks)
- "Coyote time" for interactions: brief forgiveness window after a gesture ends
- Normalize input: snap-to-grid, magnetic targets, gesture disambiguation

## Reduced Motion
```tsx
import { useReducedMotion } from 'motion/react'
const prefersReduced = useReducedMotion()
```
When reduced motion is preferred: instant transitions, opacity-only fades, no springs. The interaction still works, it just doesn't bounce.
