# DOM Effect Profile

> Activate when `experiment.json` has `"profile": "dom-effect"`

## Behavioral Mode
**Visual enhancement of existing DOM elements.** The DOM content is primary; shader effects, CSS animations, and motion components add polish and delight on top.

## Priority Ordering
1. Content readability (effects never obscure text or UI)
2. Performance (GPU-composited effects, no layout thrashing)
3. Visual impact (the effect should be striking)
4. Progressive enhancement (works without effects, better with)
5. Accessibility (reduced motion, contrast preservation)

## Toolkit Options

### VFX.js (Shader Effects on DOM)
```tsx
import * as VFX from 'react-vfx'

<VFX.VFXProvider>
  <VFX.VFXImg src="photo.png" shader="rgbShift" />
  <VFX.VFXSpan shader="glitch">Glitched Text</VFX.VFXSpan>
</VFX.VFXProvider>
```
Built-in shaders: `rainbow`, `rgbShift`, `glitch`, `halftone`, `duotone`, `pixelate`.
Custom GLSL shaders supported with `uTime`, `uScroll`, `uResolution` uniforms.

### Motion for Layout Effects
```tsx
import { motion, AnimatePresence } from 'motion/react'

<motion.div
  layout
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

### CSS-Only Effects
For lightweight effects, prefer CSS:
- `backdrop-filter: blur()` for glass effects
- `mix-blend-mode` for color blending
- `clip-path` animations for reveals
- CSS `@keyframes` for simple looping effects
- `scroll-driven animations` (CSS native) for scroll-linked effects

### motion-primitives Components
Install via `npx motion-primitives@latest add <name>`:
- `text-effect` -- text reveal/scramble animations
- `text-shimmer` / `text-shimmer-wave` -- shimmer effects on text
- `progressive-blur` -- depth-of-field style blur
- `spotlight` -- cursor-following spotlight
- `magnetic` -- magnetic hover attraction
- `tilt` -- parallax tilt on hover
- `border-trail` -- animated border trace

## Text Effects Hierarchy
1. **Entrance**: fade-up, slide-in, character-by-character reveal
2. **Emphasis**: shimmer, glow, color shift
3. **Interaction**: scramble on hover, magnetic pull
4. **Background**: gradient animation, noise texture, halftone

## Progressive Enhancement
The content must work without JavaScript effects. Effects are additive:
```tsx
<h1 className="text-4xl font-bold">
  {supportsWebGL ? (
    <VFX.VFXSpan shader="shimmer">Title</VFX.VFXSpan>
  ) : (
    'Title'
  )}
</h1>
```

## Performance
- VFX.js renders DOM elements to a WebGL canvas -- be mindful of the re-render cost
- Limit VFX elements to hero sections, not entire page content
- CSS effects are always cheaper than WebGL -- use them when sufficient
- `will-change: transform` only during active animation, remove after
