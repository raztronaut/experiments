# Motion (Framer Motion) for React

> Motion v12+ API: layout animations, springs, gestures, scroll transforms

## Core Animation
```tsx
import { motion } from 'motion/react'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
/>
```

## Variants (Orchestrated Children)
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i} variants={item} />)}
</motion.ul>
```

## AnimatePresence (Exit Animations)
```tsx
import { AnimatePresence } from 'motion/react'

<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    />
  )}
</AnimatePresence>
```
`mode="wait"` waits for exit to complete before enter. `mode="popLayout"` for layout animations.

## Layout Animations
```tsx
<motion.div layout layoutId="shared-card">
  {isExpanded ? <ExpandedContent /> : <CompactContent />}
</motion.div>
```
`layout` animates size/position changes. `layoutId` morphs between two components across the tree.

## Spring Physics
```tsx
// Spring (default, most natural)
transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 1 }}

// Tween (duration-based)
transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}

// Inertia (after drag)
transition={{ type: 'inertia', velocity: 200, power: 0.8 }}
```
Springs don't need `duration` -- they resolve naturally. Higher stiffness = snappier. Higher damping = less bounce.

## Scroll-Linked Animation
```tsx
import { useScroll, useTransform, motion } from 'motion/react'

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, -200])

  return <motion.div style={{ opacity, y }} />
}
```

### Element-Scoped Scroll
```tsx
const ref = useRef()
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ['start end', 'end start']
})
```

## Gestures
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  dragElastic={0.2}
/>
```

## useSpring (Imperative)
```tsx
import { useSpring, motion } from 'motion/react'

const x = useSpring(0, { stiffness: 300, damping: 30 })
x.set(100)  // animates to 100

<motion.div style={{ x }} />
```

## Reduced Motion
```tsx
import { useReducedMotion } from 'motion/react'

const prefersReduced = useReducedMotion()

<motion.div
  animate={{ opacity: 1, y: prefersReduced ? 0 : 20 }}
  transition={prefersReduced ? { duration: 0 } : { type: 'spring' }}
/>
```

## Performance
- `motion.div` adds minimal overhead (~0.5KB per component type)
- Use `layout` sparingly on large lists (each item recalculates on change)
- `layoutScroll` on scrollable parents of layout-animated children
- Animate `transform` and `opacity` only -- Motion handles this by default
- `useMotionValueEvent` instead of `onChange` for value subscriptions
