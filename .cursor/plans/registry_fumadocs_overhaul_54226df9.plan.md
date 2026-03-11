---
name: Registry Fumadocs Overhaul
overview: "Overhaul the fumadocs registry: remove home page registry button, switch to flux layout + solar theme, fix theme toggle, clean up CSS bridge, remove grain overlay, fix sidebar tab order, and migrate RegistryMeta to fd-* classes."
todos:
  - id: remove-registry-button
    content: Remove 'Browse Registry' button from home page (src/app/(main)/page.tsx lines 103-111)
    status: completed
  - id: switch-solar-theme
    content: "In registry.css: replace neutral.css with solar.css, remove the @theme fd-* override block"
    status: completed
  - id: switch-flux-layout
    content: "In docs layout: switch import to fumadocs-ui/layouts/flux, use githubUrl prop, move 'back to site' to sidebar footer, fix tab order to match meta.json"
    status: completed
  - id: switch-flux-page
    content: "In docs page: switch import to fumadocs-ui/layouts/flux/page, use built-in EditOnGitHub component"
    status: completed
  - id: fix-theme-toggle
    content: "In registry root layout: remove hardcoded className='dark' on html, enable theme on RootProvider, remove GrainOverlay"
    status: completed
  - id: fix-registrymeta-colors
    content: Migrate RegistryMeta.tsx from shared Tailwind classes (border-primary, bg-accent, etc.) to fd-* classes for consistency with solar theme
    status: completed
  - id: remove-experiments-separator
    content: Remove '---' separator from content/registry/experiments/meta.json
    status: completed
  - id: verify-build
    content: Run tsc --noEmit and dev server to verify everything builds and renders correctly
    status: completed
isProject: false
---

# Registry Fumadocs Overhaul

## Context

### Recent Changes (Registry Quality Audit)

The [registry quality audit](src/.cursor/plans/registry_quality_audit_6bfc1214.plan.md) just landed these changes that interact with this plan:

- `**RegistrySourceCode.tsx**` -- now uses `DynamicCodeBlock` (fumadocs component, uses fd-* internally). Compatible with solar theme.
- `**InstallCommand.tsx`** -- now uses `DynamicCodeBlock`. Compatible.
- `**ComponentPreview.tsx*`* -- consolidated from ExperimentPreview + CollectedPreview. No color dependencies. Compatible.
- `**RegistryMeta.tsx**` -- redesigned with shared Tailwind classes (`border-primary/30`, `bg-accent`, `text-muted-foreground`). **NEEDS MIGRATION** to fd-* classes since we're removing the @theme bridge.
- **Hand-authored MDX files** in `content/registry/components/` -- inline previews use component imports, no color class dependencies. Compatible.

### Root Cause of Sidebar Jankiness

Two problems:

1. **Dual-state sidebar** (classic docs layout behavior): On `/registry/docs` (no tab active), tabs render as expandable collapsible sections with page lists underneath, banner above tabs. On `/registry/docs/experiments/*` (tab active), the active tab becomes a dropdown selector at top, banner moves below it, only that tab's pages show. This jarring transition is by design in `fumadocs-ui/layouts/docs`. The **flux layout** uses a persistent TabDropdown that stays consistent regardless of page.
2. **Color system conflict**: `registry.css` imports `neutral.css` then overrides every `--color-fd-*` variable with shared token mappings. This replaces fumadocs' tuned color relationships and breaks built-in components like the theme toggle (shows but does nothing since `theme.enabled: false`).

## Changes

### 1. Remove "Browse Registry" button from home page

Delete the `<WithHover><Link href="/registry">Browse Registry</Link></WithHover>` block in [src/app/(main)/page.tsx](src/app/(main)/page.tsx) (lines 103-111).

### 2. Switch to Solar theme + remove color bridge

**[src/app/(registry)/registry.css](src/app/(registry)/registry.css):**

- Replace `fumadocs-ui/css/neutral.css` with `fumadocs-ui/css/solar.css`
- **Remove the entire `@theme` block** (lines 12-29) that overrides `--color-fd-*` variables. Let solar.css own the fumadocs palette natively. The `shared-tokens.css` and `shared-theme.css` imports stay for non-fd Tailwind utilities used by custom components.
- Color palette will diverge from main site (accepted) -- the registry is its own space.

### 3. Switch to Flux layout

**[src/app/(registry)/registry/docs/layout.tsx](src/app/(registry)/registry/docs/layout.tsx):**

- Change import from `fumadocs-ui/layouts/docs` to `fumadocs-ui/layouts/flux`
- Use `githubUrl` prop instead of the manual `GithubIcon` component + icon link
- Move "back to site" to sidebar footer alongside "Built by Razi Syed"
- Remove the `links` array (clean up top nav)
- Delete the `GithubIcon` inline component (no longer needed)
- **Fix sidebar tab order** to match root meta.json: Experiments, Components, Collected, Hooks, Utilities

### 4. Switch to Flux page components

**[src/app/(registry)/registry/docs/[[...slug]]/page.tsx](src/app/(registry)/registry/docs/[[...slug]]/page.tsx):**

- Change import from `fumadocs-ui/layouts/docs/page` to `fumadocs-ui/layouts/flux/page`
- Use the built-in `EditOnGitHub` component exported by flux/page instead of the manual `<a>` tag

### 5. Fix theme toggle + clean up root layout

**[src/app/(registry)/layout.tsx](src/app/(registry)/layout.tsx):**

- Remove `className="dark"` from `<html>` (let `next-themes` manage it via `suppressHydrationWarning`)
- Change `theme` prop from `{ defaultTheme: "dark", enabled: false }` to `{ defaultTheme: "dark" }` -- keeps dark as default but allows toggling
- **Remove `GrainOverlay`** import and component -- keep the registry minimal/clean
- Remove unused `GrainOverlay` import

### 6. Migrate RegistryMeta to fd-* classes

**[src/components/registry/RegistryMeta.tsx](src/components/registry/RegistryMeta.tsx):**

The component currently uses shared Tailwind color classes that will diverge from the fd-* palette after removing the bridge:

- `border-primary/30` -> `border-fd-primary/30`
- `bg-primary/10` -> `bg-fd-primary/10`
- `text-primary` -> `text-fd-primary`
- `border-accent` -> `border-fd-accent`
- `bg-accent/50` -> `bg-fd-accent/50`
- `text-accent-foreground` -> `text-fd-accent-foreground`
- `border-border` -> `border-fd-border`
- `text-muted-foreground` -> `text-fd-muted-foreground`

### 7. Remove experiments separator + fix tab order

**[content/registry/experiments/meta.json](content/registry/experiments/meta.json):**

- Remove the `"---"` separator on line 10. All experiments become a flat alphabetical list.

**Sidebar tab order** in layout.tsx to match root meta.json:

```
Experiments, Components, Collected, Hooks, Utilities
```

### Summary of files changed


| File                                                    | Change                                        |
| ------------------------------------------------------- | --------------------------------------------- |
| `src/app/(main)/page.tsx`                               | Remove registry button                        |
| `src/app/(registry)/registry.css`                       | solar.css + remove @theme bridge              |
| `src/app/(registry)/layout.tsx`                         | Enable theme, remove grain, remove dark class |
| `src/app/(registry)/registry/docs/layout.tsx`           | Flux layout, githubUrl, footer, tab order     |
| `src/app/(registry)/registry/docs/[[...slug]]/page.tsx` | Flux page, EditOnGitHub                       |
| `src/components/registry/RegistryMeta.tsx`              | fd-* color classes                            |
| `content/registry/experiments/meta.json`                | Remove separator                              |


