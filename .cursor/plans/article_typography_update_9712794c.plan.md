---
name: Article typography update
overview: Update article CSS defaults, then rebuild the typography debug panel as a full typography workbench -- sliders, presets, visual guides, copy CSS -- activated via ?typography in both dev and production.
todos:
  - id: css-defaults
    content: "Update experiments.css: text-align: left, hyphens: none, text-wrap: stable; remove redundant heading text-align"
    status: completed
  - id: rebuild-panel
    content: Rebuild TypographyDebugPanel with full feature set (sliders, presets, copy CSS, visual guides) at src/components/dev/
    status: completed
  - id: wire-article-layout
    content: Update ArticleLayout to import from new location; keep ?typography activation for prod access
    status: completed
isProject: false
---

# Article Typography Update + Debug Panel

## 1. Update article CSS defaults

In [src/app/experiments/experiments.css](src/app/experiments/experiments.css) lines 90-99, change three properties:

```css
article {
  font-size: 14px;
  line-height: 21px;
  letter-spacing: -0.09px;
  text-align: left;       /* was: justify */
  hyphens: none;           /* was: auto */
  text-wrap: stable;       /* was: pretty */
  font-variant-ligatures: common-ligatures;
  text-rendering: optimizeLegibility;
}
```

Remove `text-align: left` from the h1-h6 override block (now inherited). Keep `hyphens: manual` on headings as a safety net for explicit `&shy;`.

## 2. Rebuild the typography debug panel

Move from `src/components/ui/TypographyDebugPanel.tsx` to `src/components/dev/TypographyDebugPanel.tsx`.

### Production gating decision

**Keep `?typography` as a standalone query param, separate from `?debug`.** Rationale:

- The `DevToolsInjector` dual-path pattern (compile-time tree-shaking + runtime `?debug` escape hatch) exists because it loads heavy deps (Leva, GSDevTools, r3f-perf). The typography panel has **zero external deps** -- pure React + inline styles.
- A `"use client"` component that checks `useSearchParams().has("typography")` and renders `null` otherwise is already production-safe. The JS chunk cost is negligible.
- Keeping it on its own param means anyone (designers, you on your phone) can toggle it without also activating the full debug suite (FPS counter, Leva, GSAP scrubber).
- The panel lives in `src/components/dev/` for organizational consistency, imported directly in `ArticleLayout` inside a `<Suspense>` boundary (needed for `useSearchParams` in a Server Component tree).

### Feature set

The panel has three sections, organized as collapsible groups:

**A. Toggle buttons** (same as current, updated defaults)

- `text-align`: left, justify, start
- `hyphens`: none, auto, manual
- `text-wrap`: stable, pretty, balance, wrap
- `word-break`: normal, break-all, keep-all
- `overflow-wrap`: normal, break-word, anywhere

**B. Range sliders** (new)

- `font-size`: 10-24px, step 1px, default 14px
- `line-height`: 1.0-2.5, step 0.05, default 1.5 (= 21/14)
- `letter-spacing`: -0.5 to 0.5px, step 0.01px, default -0.09px
- `max-width`: 480-1080px, step 10px, default 768px -- targets the `.h-entry` container parent
- `paragraph-spacing`: 8-48px, step 2px, default 24px -- injects a `<style>` tag overriding `article p:not(:first-child) { margin-top }` etc.

**C. Presets** (new) -- one-tap named combos that set all values at once

- **Current** -- the new defaults (left, none, stable, 14/21/-0.09, 768, 24)
- **Book** -- justify, auto hyphens, pretty, 15/24/-0.05, 640, 28
- **Blog** -- left, none, stable, 16/26/0, 720, 24
- **iA Writer** -- left, none, balance, 18/32/0, 640, 32
- **NYT** -- justify, auto, pretty, 16/26/-0.01, 600, 24

**D. Utilities** (new)

- **Copy CSS** button -- copies the current state as a CSS `article { ... }` block to clipboard, with a "Copied!" toast
- **Baseline grid toggle** -- overlays horizontal lines at the current line-height interval using a repeating-linear-gradient on the article element
- **Measure indicator** -- shows current container width in px and approximate character count (via `ch` measurement) as a small badge above the article

### DOM targeting

- Toggle buttons and font sliders: apply to `document.querySelector("article")` via `element.style`
- Max-width slider: apply to `document.querySelector(".h-entry")` (the ArticleLayout container)
- Paragraph spacing: inject/update a `<style id="typo-debug-spacing">` element with the override rule
- Baseline grid: toggle a repeating-linear-gradient on the article's `backgroundImage`

### Panel UI

- Collapsible to an "Aa" pill button (bottom-right, 44px touch target)
- When expanded: scrollable panel (max-height 70vh) with grouped sections
- Each section header is tappable to collapse/expand (sliders hidden by default on mobile to save space, toggles visible)
- Dark theme matching current panel style (inline styles, no external CSS)

## 3. Update ArticleLayout

In [src/components/ui/ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx):

- Update import path from `@/components/ui/TypographyDebugPanel` to `@/components/dev/TypographyDebugPanel`
- Keep the `<Suspense>` wrapper (required for `useSearchParams`)

## 4. Clean up

- Delete `src/components/ui/TypographyDebugPanel.tsx` (moved to `src/components/dev/`)

## File changes summary

- **[src/app/experiments/experiments.css](src/app/experiments/experiments.css)** -- update 3 CSS property values, remove 1 redundant heading override line
- **[src/components/dev/TypographyDebugPanel.tsx](src/components/dev/TypographyDebugPanel.tsx)** -- new file (full rewrite with sliders, presets, copy CSS, visual guides)
- **[src/components/ui/ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx)** -- update import path
- **Delete** `src/components/ui/TypographyDebugPanel.tsx`

