<!-- read_when: Using Lenis, ScrollTrigger, or createUnifiedScroll -->

# Scroll Animation Rules

## createUnifiedScroll (Canonical)
```tsx
import { createUnifiedScroll } from "@/lib/toolkit/scroll";
import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll";

// In useLayoutEffect:
const handle = createUnifiedScroll({ debug: isDebug });
// handle.lenis for direct access
// handle.destroy() in cleanup
```

Drives Lenis from Tempus (priority -1), GSAP from Tempus (priority 0). GSAP-Tempus binding is reference-counted. Pass `{ debug: true }` (gated behind `?debug`) to expose MCP scroll helpers.

## Legacy: Lenis + GSAP Ticker (pre-V2)
```tsx
// Superseded by createUnifiedScroll. Only for reference when reading legacy experiments.
const lenisRef = useRef()
useEffect(() => {
  function update(time) { lenisRef.current?.lenis?.raf(time * 1000) }
  gsap.ticker.add(update)
  return () => gsap.ticker.remove(update)
}, [])
<ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
```

## Lenis + MCP Scroll

Lenis intercepts programmatic scroll -- `pinchtab_scroll`, `interaction_scroll`, and browser devtools scroll commands don't work reliably. Use `createUnifiedScroll({ debug: true })` which attaches:
- `window.__scrollToSection(index)` -- scroll to nth `section[aria-label]`
- `window.__scrollToProgress(progress)` -- scroll to 0-1 progress value
- `window.__lenis` -- direct Lenis instance

Call via MCP eval: `eval("window.__scrollToSection(2)")` or `eval("window.__scrollToProgress(0.5)")`.

## ScrollTrigger Patterns
- **Pin**: `{ pin: true, scrub: 1 }` -- element stays fixed while scroll drives animation
- **Scrub**: `scrub: true` (instant) or `scrub: 1` (1s smoothing) -- ties animation progress to scroll
- **Snap**: `snap: 1 / (sections - 1)` -- snaps to section boundaries
- **Batch**: `ScrollTrigger.batch('.item', { onEnter: ... })` -- staggered reveal on scroll

## Performance
- Debounce scroll callbacks that trigger layout reads
- Use `will-change: transform` sparingly and remove after animation completes
- Avoid scroll-linked `setState` -- use refs or GSAP/Motion scroll utilities
- For scroll progress indicators, use CSS scroll-driven animations or `useScroll` from Motion

## Scroll UX
- Respect `prefers-reduced-motion`: disable smooth scroll, use instant jumps
- Provide visual scroll progress cues for long-form content
- Lenis `prevent` option to skip smoothing on form inputs and scrollable nested containers
