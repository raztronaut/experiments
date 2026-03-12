<!-- read_when: Editing components with GSAP, Motion, or scroll-driven animation -->

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
- Avoid `linear` for UI motion unless scrubbing or progress indication -- it feels mechanical
- Springs are preferred over duration-based easing when physicality matters

## Follow-Through & Overlapping Action
Stagger child elements with 30-80ms delays. Don't animate everything simultaneously -- cascade reveals for natural flow. Spring overshoot adds physicality.

## Reduced Motion
```tsx
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```
Always provide a fallback: instant transitions, opacity-only fades, or no animation. Motion's `useReducedMotion()` hook handles this automatically.

In section-based experiments, use `gsap.set` to reveal elements (not `return` early) so reduced-motion users still see content:
```tsx
if (reducedMotion) {
  gsap.set(elements, { opacity: 1, y: 0, clearProps: "all" });
  return;
}
```

## Motion Vocabulary Diversity

Multi-section experiments need **distinct motion signatures per section**. Identical `opacity: 0, y: 40` reveals across every section create visual monotony. Vary the *type* of reveal, not just the timing.

**Technique catalog** (pick different ones per section):

| Technique | Pattern | Best for |
|-----------|---------|----------|
| Clip-path reveal | `clipPath: "inset(0 100% 0 0)"` → `"inset(0 0% 0 0)"` | Split-screen, before/after, editorial |
| Blur transition | `filter: "blur(12px)", opacity: 0` → clear | Atmospheric, hero subtitles, dreamy |
| Scale-in | `scale: 0.85, opacity: 0` → `scale: 1` | Cards, CTAs, focal elements |
| Horizontal slide | `x: -40, opacity: 0` → `x: 0` | Manifesto lines, lists, timelines |
| Text splitting | Per-char/word/line stagger with SplitText or manual | Headlines, statements, emphasis |
| Parallax layers | Background `y` at 0.5× scroll speed | Depth, atmosphere, hero backgrounds |
| Horizontal scroll | Pin section + `x: -totalWidth` scrub | Showcases, card carousels, galleries |
| Counter-animation | Parent moves right, child counters left | Layered reveals, depth illusion |
| Rotation | `rotation: -5` → `0` with slight overshoot | Playful, energetic, call-to-action |
| Line/border grow | `scaleX: 0` or `scaleY: 0` → `1` with `transform-origin` | Dividers, progress indicators |

**Also vary easing per section** — don't use `power2.out` everywhere. Mix `back.out(1.5)` for bouncy CTAs, `power3.inOut` for editorial sweeps, `none` for scrubbed progress bars.

## Scroll-Driven Patterns

### ScrollTrigger.batch (Grid/List Items)
Use `ScrollTrigger.batch` for elements that enter in groups (grid cards, list items) rather than creating individual ScrollTrigger instances per element:
```tsx
gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
ScrollTrigger.batch(cards, {
  onEnter: (batch) =>
    gsap.to(batch, { opacity: 1, y: 0, scale: 1, stagger: 0.08, ease: "power2.out" }),
  start: "top 85%",
});
```

### Horizontal Scroll Section
Pin a section and scrub its inner track horizontally:
```tsx
const totalWidth = trackRef.current.scrollWidth - window.innerWidth;
gsap.to(trackRef.current, {
  x: -totalWidth,
  ease: "none",
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "top top",
    end: () => `+=${totalWidth}`,
    pin: true,
    scrub: 1,
    anticipatePin: 1, // prevents visual jump when pin activates
  },
});
```

### Timeline Sequencing (Multi-Step Reveals)
For sequential reveals (pipelines, step-by-step processes), use a timeline so elements activate one after another:
```tsx
const tl = gsap.timeline({
  scrollTrigger: { trigger: container, start: "top 70%", end: "top 25%", scrub: 1 },
});
nodes.forEach((node, i) => {
  tl.to(node, { opacity: 1, scale: 1, duration: 0.3 });
  if (connectors[i]) {
    tl.to(connectors[i], { scaleX: 1, duration: 0.2 }, "-=0.15");
  }
});
```

### ScrollTrigger.refresh After Lenis Init
Always call `ScrollTrigger.refresh()` after initializing Lenis (or `createUnifiedScroll`). Lenis changes scroll behavior, so ScrollTrigger needs to recalculate trigger positions:
```tsx
const handle = createUnifiedScroll({ debug: isDebug });
ScrollTrigger.refresh();
```

### anticipatePin
Add `anticipatePin: 1` to pinned sections to prevent the visual jump when a pin activates. Especially important for horizontal scroll sections and full-viewport pins.

## FOUC Prevention

Elements animated from invisible → visible should start hidden in **CSS**, not `gsap.set`. This avoids a flash of content before JS hydrates.

Prefer CSS classes:
```html
<div className="panel-content opacity-0 translate-y-12">
```
Then animate from those values. If the animated state differs from CSS, use `gsap.fromTo` (not just `gsap.from`) to explicitly set the start state.

Only use `gsap.set` for initial states when the values are dynamic or computed at runtime.

## CSS Easing Variables

Define Robert Penner easing curves as CSS custom properties for reuse across CSS transitions and JS. Darkroom engineering uses this pattern extensively. For the complete 27-curve set (including sine, quart, quint, and back families), see `~/.agents/skills/creative-webgl-patterns/SKILL.md` "CSS Easing Variables" section.

```css
:root {
  --ease-in-quad: cubic-bezier(0.11, 0, 0.5, 0);
  --ease-out-quad: cubic-bezier(0.5, 1, 0.89, 1);
  --ease-in-out-quad: cubic-bezier(0.45, 0, 0.55, 1);
  --ease-in-cubic: cubic-bezier(0.32, 0, 0.67, 0);
  --ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-in-expo: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
  --ease-in-circ: cubic-bezier(0.55, 0, 1, 0.45);
  --ease-out-circ: cubic-bezier(0, 0.55, 0.45, 1);
  --ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1);
}
```

Integrate with Tailwind via `theme.extend.transitionTimingFunction`:
```ts
transitionTimingFunction: {
  "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
  "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
  "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
}
```

## Film Grain / Noise Overlay

Adds analog texture and visual warmth. Two approaches:

**1. GIF overlay (simple, zero JS):**
Our `GrainOverlay` component uses a static grain GIF at low opacity:
```tsx
import { GrainOverlay } from "@/components/ui/GrainOverlay";
<GrainOverlay className="z-10 opacity-[0.04]" />
```
Good enough for most experiments. `mix-blend-multiply` + `pointer-events-none`.

**2. Canvas2D noise buffer (configurable, darkroom pattern):**
Pre-generate a noise image buffer once, redraw at random offset each frame. Configurable opacity, grain size, color vs monochrome. Use when you need dynamic grain that responds to time or scene parameters. See the `creative-webgl-patterns` portable skill for the full implementation.

## `fromTo` Scroll Interpolation (Lightweight)

For simple scroll-driven value changes without GSAP overhead, tambo uses a lightweight interpolation pattern. A function takes scroll progress (0–1) and interpolates between start/end values, applying directly to `element.style`:

```tsx
function fromTo(element: HTMLElement, progress: number, from: number, to: number, property: string, unit = "px") {
  const value = from + (to - from) * Math.max(0, Math.min(1, progress));
  element.style.setProperty(property, `${value}${unit}`);
}
```

Useful when you want scroll-driven animation without `ScrollTrigger` instances — e.g., in a `Lenis` scroll callback for simple parallax or opacity fades. Not a replacement for GSAP timelines or complex choreography.
