---
name: Fix announcing-v2 console warnings
overview: Fix the CSS preload warnings and the 345ms long-task violation in the announcing-v2 experiment by rendering sections immediately (hidden) and staggering heavy initialization.
todos:
  - id: store-preloader
    content: Add `preloaderDone` boolean + setter to the Zustand store
    status: completed
  - id: always-render
    content: Change AnnouncingV2.tsx from conditional rendering to always-render with visibility gating, store preloaderDone in Zustand, defer ScrollTrigger.refresh()
    status: completed
  - id: gate-inversa
    content: Gate InversaSection ScrollTrigger creation on store.preloaderDone via useGSAP dependencies
    status: completed
  - id: gate-jesko
    content: Gate JeskoJetsSection ScrollTrigger creation on store.preloaderDone via useGSAP dependencies
    status: completed
  - id: gate-fiddle
    content: Gate FiddleHoverSection mouse listeners on store.preloaderDone
    status: completed
  - id: verify
    content: Run dev server, check console for warnings, verify preloader -> section reveal still works correctly
    status: completed
isProject: false
---

# Fix announcing-v2 Console Warnings

## Issues Identified

1. **CSS preload warnings (4x)** -- Next.js preloads CSS for sections that are conditionally gated behind `preloaderDone`, which takes ~8s. The CSS is never consumed until the preloader finishes.
2. `**[Violation] 'message' handler took 345ms`** -- All four sections mount simultaneously in one frame when `preloaderDone` becomes `true`, creating a long task (GSAP timelines, R3F Canvas, DOM grid generation all in one commit).
3. **Blob fetches from CRTMonitor** -- Normal GLB loading behavior, no action needed.

## Fix Strategy

### Fix 1: Render sections immediately but hidden

In `[src/components/experiments/announcing-v2/AnnouncingV2.tsx](src/components/experiments/announcing-v2/AnnouncingV2.tsx)`, change from conditional rendering (`{preloaderDone && <Sections />}`) to always-render with CSS visibility/pointer-events gating:

```tsx
<main>
  <PreloaderSection onComplete={handlePreloaderComplete} />
  <div
    style={{
      visibility: preloaderDone ? "visible" : "hidden",
      pointerEvents: preloaderDone ? "auto" : "none",
    }}
  >
    <InversaSection />
    <ShowcaseSection isMobile={isMobile} />
    <FiddleHoverSection />
    <JeskoJetsSection />
  </div>
</main>
```

This ensures:

- CSS chunks are consumed immediately at mount (fixes preload warnings)
- Sections are invisible during the preloader but their CSS is already applied
- The `overflow: hidden` on body during preload already prevents scrolling

**Trade-off**: Sections will initialize their GSAP ScrollTriggers and the R3F canvas during the preloader, which adds to initial load cost. However, this actually helps because the work is spread across the preloader's 8-second window rather than hitting all at once at the end.

### Fix 2: Defer ScrollTrigger.refresh()

The `ScrollTrigger.refresh()` in the main `useEffect` should only fire once sections are visible. Move the refresh into a separate effect that runs after `preloaderDone`:

```tsx
useEffect(() => {
  if (!preloaderDone) return;
  ScrollTrigger.refresh();
}, [preloaderDone]);
```

This ensures ScrollTrigger recalculates positions once sections become visible and measurable.

### Fix 3: Guard scroll-driven animations on preloader state

Each section's `useGSAP` creates ScrollTriggers. When sections mount hidden, the scroll triggers may fire prematurely. Add the `preloaderDone` state to the Zustand store and have sections read it to guard their ScrollTrigger creation:

- Add `preloaderDone: boolean` to the store in `[src/components/experiments/announcing-v2/store.ts](src/components/experiments/announcing-v2/store.ts)`
- In `InversaSection` and `JeskoJetsSection`, wrap the ScrollTrigger creation in an early return when `!preloaderDone`, using the `dependencies` array of `useGSAP` to re-run when it changes
- `ShowcaseSection` can mount its Canvas immediately (no ScrollTrigger), but `FiddleHoverSection` attaches mousemove listeners that should also be gated

### Alternative (simpler): Use `startTransition` for the section reveal

A lighter-touch approach that avoids restructuring the render tree:

```tsx
import { startTransition } from "react";

const handlePreloaderComplete = useCallback(() => {
  startTransition(() => setPreloaderDone(true));
}, []);
```

This marks the section mounting as a non-urgent update, allowing React to break it into smaller chunks. It won't fix the CSS preload warnings but will fix the long-task violation.

## Recommended Approach

Combine both:

- **Always render sections** (hidden via CSS) to fix CSS preload warnings
- **Gate ScrollTrigger creation** on `preloaderDone` via the store to prevent premature scroll animation
- `**ScrollTrigger.refresh()`** after visibility change to recalculate geometry

## Files to modify

- `[src/components/experiments/announcing-v2/AnnouncingV2.tsx](src/components/experiments/announcing-v2/AnnouncingV2.tsx)` -- always-render sections, pass `preloaderDone` or store it
- `[src/components/experiments/announcing-v2/store.ts](src/components/experiments/announcing-v2/store.ts)` -- add `preloaderDone` state
- `[src/components/experiments/announcing-v2/sections/InversaSection.tsx](src/components/experiments/announcing-v2/sections/InversaSection.tsx)` -- gate ScrollTrigger on `preloaderDone`
- `[src/components/experiments/announcing-v2/sections/JeskoJetsSection.tsx](src/components/experiments/announcing-v2/sections/JeskoJetsSection.tsx)` -- gate ScrollTrigger on `preloaderDone`
- `[src/components/experiments/announcing-v2/sections/FiddleHoverSection.tsx](src/components/experiments/announcing-v2/sections/FiddleHoverSection.tsx)` -- gate mouse listeners on `preloaderDone`

No changes needed for `ShowcaseSection` (Canvas can render while hidden) or `CRTMonitor` (blob fetches are normal).