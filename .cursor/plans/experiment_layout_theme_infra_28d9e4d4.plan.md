---
name: experiment layout theme infra
overview: Fix the systemic ThemeProvider gap in experiment layouts -- update the scaffold template to prevent future issues, fix the 404-not-found layout for the article we just created, and document which other legacy layouts need the same treatment when they get articles.
todos:
  - id: fix-template
    content: Update plop-templates/experiment/route-layout.tsx.hbs to include ThemeProvider, suppressHydrationWarning, font-canvas antialiased
    status: completed
  - id: fix-404-layout
    content: "Modernize (404-not-found)/layout.tsx: ThemeProvider, experiment.json import, articleSlug, tags, suppressHydrationWarning, font-canvas"
    status: completed
  - id: update-skill
    content: Add ThemeProvider layout check to .cursor/skills/publish-content/SKILL.md Phase 1
    status: completed
  - id: verify
    content: Run tsc --noEmit and validate:experiments, visually verify article renders with dark mode support
    status: completed
isProject: false
---

# Experiment Layout Theme Infrastructure Fix

## Problem

15 of 19 experiment layouts lack `ThemeProvider`, meaning any article rendered inside them is stuck in light mode. The scaffold template (`route-layout.tsx.hbs`) also lacks it, so every future experiment inherits the same gap.

### Current state (19 experiments)

- **Fully modern (ThemeProvider + all features):** basketball-replay-center (1)
- **Partial ThemeProvider:** send-button (custom provider, slightly different pattern)
- **Has experiment.json but no ThemeProvider:** keyboard-keys, announcing-v2 (hardcodes `dark` class)
- **Fully legacy (hardcoded everything, no ThemeProvider):** 15 experiments including 404-not-found

### What breaks without ThemeProvider

- Body/text colors locked to light palette (`.dark` class never applied to `<html>`)
- Shiki code blocks always show light syntax theme (`html.dark` selector in [experiments.css](src/app/experiments/experiments.css) never matches)
- Highlight, kbd, selection CSS custom properties stuck on light values

No runtime crashes -- `useTheme` is not called in article rendering paths.

## Fix: Three layers

### 1. Fix the scaffold template (prevents all future issues)

Update [plop-templates/experiment/route-layout.tsx.hbs](plop-templates/experiment/route-layout.tsx.hbs) to include:

- `import { ThemeProvider } from "@/components/ui/ThemeProvider"`
- `<html lang="en" suppressHydrationWarning>` (required by next-themes)
- `<body className={cn("font-canvas antialiased", activeFont.variable)}>` (article typography baseline)
- `<ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>` wrapping `UmamiScript`, `ExperimentNav`, and `{children}`

The template already has `articleSlug` on ExperimentNav and `tags` on ExperimentJsonLd -- those are fine.

Reference pattern: [basketball-replay-center/layout.tsx](src/app/experiments/(basketball-replay-center)/layout.tsx)

### 2. Fix the 404-not-found layout (immediate article need)

Update [src/app/experiments/(404-not-found)/layout.tsx](src/app/experiments/(404-not-found)/layout.tsx) to the modern pattern:

- Import `ThemeProvider` from `@/components/ui/ThemeProvider`
- Import `experiment.json` instead of hardcoded metadata
- Add `suppressHydrationWarning` to `<html>`
- Add `font-canvas antialiased` to `<body>`
- Wrap children in `ThemeProvider`
- Pass `articleSlug` to `ExperimentNav`
- Pass `tags` to `ExperimentJsonLd`

This is route infrastructure, not experiment component code, so it's safe to change on a `legacy: true` experiment.

### 3. Flag other layouts that need fixing when they get articles

The remaining 14 legacy experiments have `content: {}` -- no articles exist yet. When any of them gets a content constellation in the future, their layout will need the same ThemeProvider treatment. Rather than updating all 15 now (risk of unintended visual side effects on experiments that have their own dark backgrounds or custom body styles), we fix them on-demand.

Add a note to the [publish-content skill](/.cursor/skills/publish-content/SKILL.md) Phase 1 checklist: verify the experiment's layout has ThemeProvider before writing article content.

## Files changed


| File                                             | Change                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| `plop-templates/experiment/route-layout.tsx.hbs` | Add ThemeProvider, suppressHydrationWarning, font-canvas antialiased |
| `src/app/experiments/(404-not-found)/layout.tsx` | Modernize to match basketball-replay-center pattern                  |
| `.cursor/skills/publish-content/SKILL.md`        | Add layout ThemeProvider check to Phase 1                            |


