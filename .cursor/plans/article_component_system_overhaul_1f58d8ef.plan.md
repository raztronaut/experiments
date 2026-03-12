---
name: Article Component System Overhaul
overview: Port Maxime Heckel's design system components to Tailwind, redesign the LiveDemo frame, build a shared interactive control system, and update all agent documentation to reflect the expanded article MDX toolkit.
todos:
  - id: port-debounce-hook
    content: Port useDebouncedValue hook to src/hooks/useDebouncedValue.ts
    status: completed
  - id: port-range
    content: Port Range/slider component (Stitches -> Tailwind, gradient fill, debounce, styled thumb)
    status: completed
  - id: port-checkbox
    content: Port Checkbox component (CSS ::after checkmark animation, hover glow, disabled state)
    status: completed
  - id: port-switch
    content: Port Switch component (animated toggle handle, translateX slide, label layout)
    status: completed
  - id: build-controlgroup
    content: Build ControlGroup layout wrapper (1-col, 2-col grid, gap management)
    status: completed
  - id: port-pill
    content: "Port Pill/Badge component (4 semantic variants: info, success, warning, danger)"
    status: completed
  - id: port-details
    content: Port Details/Collapsible component (animated open/close, compound Summary+Content, reduced-motion)
    status: completed
  - id: port-beforeafter
    content: Port BeforeAfterImage component (drag slider, clipPath reveal, keyboard a11y, motion/react)
    status: completed
  - id: port-slideshow
    content: Port Slideshow component (keyboard nav, dot indicators, glass controls, AnimatePresence)
    status: completed
  - id: build-fullbleed
    content: Build Fullbleed component (full-width breakout from article container)
    status: completed
  - id: fix-livedemo
    content: Redesign LiveDemo -- replace ugly figcaption with integrated bottom toolbar inside frame border
    status: completed
  - id: upgrade-interactive-widget
    content: Upgrade InteractiveWidget to compound component with Preview + Controls areas (sidebar/bottom layout)
    status: completed
  - id: register-components
    content: Register all new components in articleComponents map + barrel exports
    status: completed
  - id: update-writing-voice
    content: Update .agents/contexts/writing-voice.md Interactive Component Guide with full inventory
    status: completed
  - id: update-constellation
    content: Update .agents/contexts/content-constellation.md Key Technical Patterns
    status: completed
  - id: update-article-rule
    content: Update .cursor/rules/article-writing.mdc Interactive Components section
    status: completed
  - id: update-content-writer
    content: Update .cursor/agents/content-writer.md Interactive Components section
    status: completed
  - id: update-publish-skill
    content: Update .cursor/skills/publish-content/SKILL.md Step 8 demo building guidance
    status: completed
  - id: update-publish-workflow
    content: Update .agents/workflows/publish-experiment.md Step 7 demo building guidance
    status: completed
  - id: update-toolkit
    content: Update .agents/contexts/toolkit.md Publishing Pipeline with expanded MDX component list
    status: completed
  - id: update-backlog
    content: Update .agents/backlog/t2-content-registry.md to reflect completed article controls work
    status: completed
  - id: migrate-vrd-demos
    content: Migrate VRD article demos to use shared Range/Checkbox/ControlGroup
    status: completed
  - id: migrate-404-demos
    content: Migrate 404 article demos to use shared Range/Checkbox/ControlGroup
    status: completed
  - id: migrate-basketball-demos
    content: Migrate Basketball article demos to use shared Range/Checkbox/ControlGroup
    status: completed
isProject: false
---

# Article Component System Overhaul

## Problem

1. **LiveDemo figcaption is ugly** -- "Live demo" / "Open full page" subtitle area looks tacked-on
2. **No shared control primitives** -- every article demo rebuilds `<input type="range">` / `<input type="checkbox">` inline with inconsistent styling
3. **Thin article MDX toolkit** -- only 5 custom components (Callout, CodeStep, InteractiveWidget, LiveDemo, SandpackDemo)
4. **Agent docs are stale** -- all 6 doc files that reference MDX components only list the original 3 interactive components

## Strategy: Yoink First, Modify Later

Port components from Maxime's `@maximeheckel/design-system` (Stitches) and `blog.maximeheckel.com` as faithfully as possible, adapting only the styling layer (Stitches -> Tailwind CSS). Full API and behavioral fidelity. Modifications come in a separate pass.

### Stitches -> Tailwind Translation (from porting-demos Phase 3)

The porting-demos skill maps `CSS-in-JS (styled-components, emotion)` -> `CSS file or Tailwind classes`. Same applies to Stitches:

- `styled('input', { ... })` -> Tailwind classes on native elements
- CSS custom properties (`--input-active`, etc.) -> map to existing `hsl(var(--...))` design tokens or define new ones in a co-located CSS file
- Stitches `variants` -> `cva()` (class-variance-authority, already used by shadcn badge) or conditional `cn()` classes
- `@media (hover: hover)` -> Tailwind `@hover` variant
- Compound components (`Card.Header`, `Details.Summary`) -> same pattern, just Tailwind-styled
- Complex pseudo-element animations (`::after` checkmark, toggle handle) -> co-located CSS file with Tailwind-compatible custom properties

### Porting Best Practices (from quick-component + porting-demos skills)

- **All props optional with sensible defaults** -- critical for MDX usage where components are used inline without imports
- `**"use client"` directive** on every component that uses hooks, browser APIs, or event handlers
- `**prefers-reduced-motion` handled internally** -- animated components (Details, Slideshow, BeforeAfterImage) must respect this. Use `gsap.set` equivalent (CSS `@media` or `useReducedMotion` from motion/react) to show content without animation, never leave elements invisible.
- **Component size discipline**: 200-line soft limit, 300-line hard limit. If a ported component exceeds 200 lines, extract constants/types to separate files. 300 lines triggers mandatory split.
- **CSS fidelity (porting-demos Phase 4)**: port visual properties faithfully from Maxime's Stitches styles. Don't add extra properties "for consistency".

### Leverage Existing Ecosystem

- `**cva()` from class-variance-authority** -- already used by `src/components/ui/badge.tsx`. The natural replacement for Stitches `variants`.
- **shadcn `badge.tsx`** already exists -- `Pill` should extend it with semantic color variants (`info`, `success`, `warning`, `danger`) rather than porting from scratch.
- `**motion/react` v12.x** already installed -- BeforeAfterImage and Slideshow can use `useMotionValue`, `useInView`, `AnimatePresence` directly.
- **motion-primitives** (Tier 3, not yet installed) has `image-comparison` -- evaluate during BeforeAfterImage port. Maxime's version has better a11y (ARIA slider, keyboard nav, touch) so likely prefer the port.
- **animate-ui** (Tier 3, not yet installed) has `collapsible` -- evaluate during Details port. Maxime's compound pattern (`Details.Summary` + `Details.Content`) is richer.
- **Radix primitives** available via shadcn -- could use for Collapsible if we want headless behavior.

---

## Part 1: Port Control Primitives (from design-system)

New directory: `src/components/mdx/controls/`

### 1a. `Range` (slider)

Port from [design-system/Range](https://github.com/MaximeHeckel/design-system/tree/main/src/components/Range). Key features to preserve:

- **Debounced onChange** via `useDebouncedValue` hook (port the hook to `src/hooks/useDebouncedValue.ts`)
- **CSS gradient fill** -- the `adjustSlider()` utility generates `linear-gradient` for the track background
- **Styled thumb** -- 24px circle with grab cursor, shadow, border-color transitions on hover/focus
- **Label integration** -- optional label rendered above the input
- Add `formatValue?: (v: number) => string` prop for display (not in Maxime's -- our addition for "0.40", "16 x 16" style labels like in his blog demos)

Source files: `Range.tsx`, `Range.styles.tsx`, `Range.types.ts`, `utils.ts`

### 1b. `Checkbox`

Port from [design-system/Checkbox](https://github.com/MaximeHeckel/design-system/tree/main/src/components/Checkbox). Key features:

- **Custom checkmark** via CSS `::after` pseudo-element with cubic-bezier animation on check
- **Styled 24x24 box** with border transitions, hover glow, disabled state
- **Label layout** -- Flex + Label pattern

Source files: `Checkbox.tsx`, `Checkbox.styles.tsx`, `Checkbox.types.ts`

### 1c. `Switch`

Port from [design-system/Switch](https://github.com/MaximeHeckel/design-system/tree/main/src/components/Switch). Key features:

- **Animated toggle handle** -- 18px circle sliding via `translateX` with cubic-bezier easing
- **44x24 track** with background color transition on check
- **Label layout** -- same Flex + Label pattern

Source files: `Switch.tsx`, `Switch.styles.tsx`, `Switch.types.ts`

### 1d. `useDebouncedValue` hook

Port from [design-system/hooks/useDebouncedValue](https://github.com/MaximeHeckel/design-system/tree/main/src/hooks/useDebouncedValue). Simple `useState` + `setTimeout` pattern. Place at `src/hooks/useDebouncedValue.ts`.

### 1e. `ControlGroup` (new -- not from Maxime)

Layout wrapper for arranging controls. Replaces the ad-hoc `grid grid-cols-2 gap-4` patterns in current article demos.

```tsx
<ControlGroup columns={2}>
  <Range label="Scanlines" ... />
  <Range label="Noise" ... />
  <Checkbox label="Phosphor dots" ... />
</ControlGroup>
```

---

## Part 2: Port Content Components

### 2a. `Pill` / Badge

Extend the existing [src/components/ui/badge.tsx](src/components/ui/badge.tsx) (already uses `cva()`) with Maxime's semantic color variants (`info`, `success`, `warning`, `danger`). This is cheaper than a full port -- add 4 new variant entries to `badgeVariants` and re-export as `Pill` for the MDX context. The existing `default`, `secondary`, `destructive`, `outline` variants remain untouched.

Place at: `src/components/mdx/Pill.tsx` (thin wrapper around extended Badge)

### 2b. `Details` / Collapsible

Port from [design-system/Details](https://github.com/MaximeHeckel/design-system/tree/main/src/components/Details). Key features:

- **Animated open/close** via CSS `@keyframes` (height from 0 to `--collapsible-panel-height`)
- **Compound pattern**: `Details.Summary` + `Details.Content`
- **Click hijack for close animation** -- 400ms delay before removing `open` attribute
- `**prefers-reduced-motion` respected**

Adaptation: Replace `@base-ui/react/collapsible` with native `<details>`/`<summary>` + CSS animations, or use Radix `Collapsible` (already in shadcn deps). The Maxime version renders a `<Card as="details">` which is elegant.

Place at: `src/components/mdx/Details.tsx`

### 2c. `BeforeAfterImage`

Port from [blog.maximeheckel.com/BeforeAfterImage](https://github.com/MaximeHeckel/blog.maximeheckel.com/tree/main/core/components/BeforeAfterImage). Key features:

- **Drag slider** with `motion/react` `useMotionValue` for smooth position tracking
- **CSS `clipPath: inset(...)`** for the overlay reveal
- **Keyboard accessible** -- ArrowLeft/ArrowRight move slider by 5%
- **Touch support** via `onTouchMove`
- **ARIA `role="slider"`** with value attributes

Adaptation: Replace `@maximeheckel/design-system` imports (Flex, GlassMaterial, Icon) with Tailwind equivalents. Replace `NextImage` + `cloudflareLoader` with standard `next/image`.

Place at: `src/components/mdx/BeforeAfterImage.tsx`

### 2d. `Slideshow`

Port from [blog.maximeheckel.com/Slideshow](https://github.com/MaximeHeckel/blog.maximeheckel.com/tree/main/core/components/Slideshow). Key features:

- **Keyboard navigation** -- ArrowLeft/ArrowRight (only when in view)
- **AnimatePresence transitions** between slides
- **Dot indicators** with animated active state (width expansion)
- **Glass morphism control bar** at bottom

Adaptation: Replace `useKeyboardShortcut` with a simple `useEffect` + `keydown` listener. Replace glass material with `backdrop-blur` Tailwind classes.

Place at: `src/components/mdx/Slideshow.tsx`

### 2e. `Fullbleed`

Simple but impactful -- breaks out of the article max-width container for hero images/demos.

```tsx
export function Fullbleed({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      {children}
    </div>
  );
}
```

Place at: `src/components/mdx/Fullbleed.tsx`

---

## Part 3: Fix LiveDemo Frame

Redesign [src/components/mdx/LiveDemo.tsx](src/components/mdx/LiveDemo.tsx) lines 34-43.

**Replace the dangling figcaption** with an integrated toolbar inside the frame:

```tsx
<div className="flex items-center justify-between border-border border-t px-3 py-1.5">
  <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
    Live
  </span>
  <a
    className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
    href={`/experiments/${slug}`}
  >
    Open full page
    <ExternalLinkIcon className="h-3 w-3" />
  </a>
</div>
```

This moves the actions inside the rounded border, gives a subtle "Live" indicator dot, and adds an icon to the link. Much tighter than the current floating figcaption.

---

## Part 4: Upgrade InteractiveWidget

Extend [src/components/mdx/InteractiveWidget.tsx](src/components/mdx/InteractiveWidget.tsx) to support a **compound layout** with separate preview and controls areas.

Two layout modes:

- `**sidebar`** -- controls on the left (~280px), preview on the right (matches Maxime's "Uniforms" panel pattern from screenshots)
- `**bottom`** (default) -- controls below the preview (current behavior, just formalized)

```tsx
<InteractiveWidget title="Shades of Halftone" layout="sidebar">
  <InteractiveWidget.Preview>
    <HalftoneCanvas />
  </InteractiveWidget.Preview>
  <InteractiveWidget.Controls>
    <Range label="Radius" value={radius} ... />
    <Range label="Cell Size" value={cellSize} ... />
    <Checkbox label="Display Circle Mask" ... />
    <Checkbox label="Use Pixelated UV" ... />
  </InteractiveWidget.Controls>
</InteractiveWidget>
```

Backward-compatible -- existing `<InteractiveWidget title="..."><Demo /></InteractiveWidget>` usage keeps working.

---

## Part 5: Register in MDX Component Map

Update these 3 files:

1. **[src/components/mdx/components.tsx](src/components/mdx/components.tsx)** -- add to `articleComponents`:
  - `Range`, `Checkbox`, `Switch`, `ControlGroup` (controls)
  - `Pill`, `Details`, `BeforeAfterImage`, `Slideshow`, `Fullbleed` (content)
2. **[src/components/mdx/index.ts](src/components/mdx/index.ts)** -- add barrel exports
3. Per-article `components.tsx` files remain unchanged initially -- migration is Part 7.

---

## Part 6: Update Agent Documentation (6 files)

Every file below lists the MDX components and needs the expanded set documented.

### 6a. `.agents/contexts/writing-voice.md` (lines 140-144)

Current "Interactive Component Guide" lists 3 components. Expand to include all new components with usage guidance:

- `Range`, `Checkbox`, `Switch` -- for parameter controls in demos
- `ControlGroup` -- for laying out controls
- `Pill` -- for inline semantic badges
- `Details` -- for collapsible supplementary content
- `BeforeAfterImage` -- for shader/effect comparisons
- `Slideshow` -- for multi-step visual explanations
- `Fullbleed` -- for full-width hero content

Add a "Demo Control Patterns" subsection describing the Range + ControlGroup workflow.

### 6b. `.agents/contexts/content-constellation.md` (lines 56-60)

Update "Key Technical Patterns" to mention the new control primitives and the `InteractiveWidget` compound layout. Add a bullet:

- **Shared control primitives** -- `Range`, `Checkbox`, `Switch`, `ControlGroup` provide consistent, styled controls for article demos. No more raw `<input>` elements.

### 6c. `.cursor/rules/article-writing.mdc` (lines 40-44)

Update "Interactive Components" section with the full component inventory, organized by category (interactive, content, layout).

### 6d. `.cursor/agents/content-writer.md` (lines 111-115)

Update "Interactive Components" section to match. This is the writing persona -- it needs to know about all available tools.

### 6e. `.cursor/skills/publish-content/SKILL.md` (lines 67-72)

Update Step 8 demo building guidance to reference the new controls. Replace "parameter sliders" with specific component names. Add guidance: "Use `<Range>`, `<Checkbox>`, `<Switch>` from `src/components/mdx/controls/` instead of raw HTML inputs."

### 6f. `.agents/workflows/publish-experiment.md` (lines 60-73)

Update Step 7 demo building guidance similarly. Add `<BeforeAfterImage>` to the concept section toolbox. Add `<Details>` for supplementary content.

### 6g. `.agents/contexts/toolkit.md` (lines 58-64)

Update the "Publishing Pipeline" subsection to list the expanded MDX component set. Current text at line 61 reads: "`CodeBlock`, `Callout`, `LiveDemo`, `SandpackDemo`, `InteractiveWidget`, `CodeStep` -- Individual MDX components". Expand to include the new controls and content components.

### 6h. `.agents/backlog/t2-content-registry.md`

Add a completed item noting the article control system upgrade. Remove any backlog items that this work resolves (e.g., "improve article demo consistency").

---

## Part 7: Migrate Existing Article Demos

After building the shared controls, migrate the 3 existing `article/components.tsx` files to use `Range`, `Checkbox`, `Switch`, and `ControlGroup`:

- **[VRD components](src/app/experiments/(velocity-responsive-design)/velocity-responsive-design/article/components.tsx)**: 4 range sliders, 2 checkboxes across 3 demos
- **[404 components](src/app/experiments/(404-not-found)/404-not-found/article/components.tsx)**: 4 range sliders, 2 checkboxes, 2 radios across 3 demos
- **[Basketball components](src/app/experiments/(basketball-replay-center)/basketball-replay-center/article/components.tsx)**: 3 range sliders, 1 checkbox across 2 demos

This validates the control API against real use cases and ensures visual consistency.

---

## File Structure

```
src/hooks/
└── useDebouncedValue.ts           # Port from design-system

src/components/mdx/
├── controls/
│   ├── Range.tsx                   # Port from design-system
│   ├── Checkbox.tsx                # Port from design-system
│   ├── Switch.tsx                  # Port from design-system
│   ├── ControlGroup.tsx            # New
│   └── index.ts                    # Barrel export
├── BeforeAfterImage.tsx            # Port from blog
├── Slideshow.tsx                   # Port from blog
├── Details.tsx                     # Port from design-system
├── Pill.tsx                        # Port from design-system
├── Fullbleed.tsx                   # New (trivial)
├── LiveDemo.tsx                    # Redesigned (Part 3)
├── InteractiveWidget.tsx           # Upgraded (Part 4)
├── components.tsx                  # Updated map
└── index.ts                        # Updated exports
```

## Execution Order

Parts 1-2 (port components) and Part 3 (fix LiveDemo) are independent and can be parallelized. Part 4 (InteractiveWidget upgrade) depends on Part 1 (controls exist). Part 5 (registration) depends on 1-4. Part 6 (docs) depends on knowing the final component set. Part 7 (migration) depends on 1 and 5.