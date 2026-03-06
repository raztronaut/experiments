---
trigger: file_match
file_patterns:
  - "src/components/experiments/**/*.tsx"
description: Loads when editing experiment components that may use animation
---

# Animation Rules

## GSAP
- **Always** dynamic import: `const gsapModule = await import('gsap')` or use `next/dynamic` with `{ ssr: false }`
- **Always** use `useGSAP` hook (from `@gsap/react`) for React integration
- **Always** use `gsap.context()` for cleanup -- kills all tweens/timelines created within
- Register plugins once at module level: `gsap.registerPlugin(ScrollTrigger)`

## Motion (Framer Motion)
- Use `layout` prop for shared element transitions
- `AnimatePresence` wraps components that mount/unmount with exit animations
- Spring physics for natural motion: `{ type: "spring", stiffness: 300, damping: 30 }`
- `useScroll` + `useTransform` for scroll-linked values

## Timing (from 12 Principles)
| Category | Duration | Examples |
|----------|----------|----------|
| Micro-feedback | <100ms | Button press, toggle |
| Interaction response | 100-200ms | Hover state, tooltip appear |
| Transition | 200-500ms | Panel slide, card flip, modal open |
| Complex choreography | 500-800ms | Multi-step reveal, page transition |
| Doherty threshold | <400ms | Anything above this feels sluggish |

## Easing
- **Entrances**: `ease-out` / `power2.out` -- starts fast, decelerates (snappy)
- **Exits**: `ease-in` / `power2.in` -- accelerates away
- **State changes**: `ease-in-out` / `power2.inOut`
- **Never** use `linear` for UI motion -- feels mechanical and lifeless
- Springs are preferred over duration-based easing when physicality matters

## Follow-Through & Overlapping Action
Stagger child elements with 30-80ms delays. Don't animate everything simultaneously -- cascade reveals for natural flow. Spring overshoot adds physicality.

## Reduced Motion
```tsx
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```
Always provide a fallback: instant transitions, opacity-only fades, or no animation. Motion's `useReducedMotion()` hook handles this automatically.
