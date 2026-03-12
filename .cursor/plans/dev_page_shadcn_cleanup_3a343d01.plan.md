---
name: Dev Page shadcn Cleanup
overview: Refactor the `/dev` dashboard to use existing and new shadcn/ui components, fix type safety issues (listing vocabulary divergence from canonical types), deduplicate code, and comprehensively improve code quality across all 12 files.
todos:
  - id: install-shadcn
    content: "Install new shadcn components: tabs, table, input, tooltip, progress, toggle-group"
    status: completed
  - id: fix-types
    content: Fix ExperimentListing type divergence -- align dashboard vocabulary with canonical types (experiment/collected/unlisted), fix unsafe casts in page.tsx
    status: completed
  - id: dashboard-tabs
    content: Refactor Dashboard.tsx to use shadcn Tabs with URL sync
    status: completed
  - id: badges-rewrite
    content: Rewrite badges.tsx on top of shadcn Badge + cn()
    status: completed
  - id: filter-bar
    content: Refactor FilterBar.tsx with shadcn Input, Button, cn()
    status: completed
  - id: experiment-table
    content: Refactor ExperimentTable.tsx + ExperimentTableRow.tsx with shadcn Table, Tooltip, Link, deduplicate CompletenessBar
    status: completed
  - id: stats-bar
    content: Refactor StatsBar.tsx with shadcn Card, Progress
    status: completed
  - id: content-health
    content: Refactor ContentHealth.tsx with shadcn Card/Table, import shared CompletenessBar
    status: completed
  - id: surface-matrix
    content: Refactor SurfaceMatrix.tsx with shadcn Table, Tooltip
    status: completed
  - id: warnings-list
    content: Refactor WarningsList.tsx with shadcn Card, Link
    status: completed
  - id: cross-cutting
    content: Replace all <a> with Next.js Link, use cn() everywhere, verify typecheck passes
    status: completed
isProject: false
---

# Dev Page shadcn Migration and Code Quality Overhaul

## Current State

12 files (~1,984 lines) under `src/app/(main)/dev/` implementing a dev-only experiment status dashboard. Currently uses 100% raw Tailwind utility classes with zero shadcn/ui components despite having 7 shadcn primitives available (Button, Badge, Card, Separator, ScrollArea, Drawer, Popover).

## Install New shadcn Components

Install these via `npx shadcn@latest add`:

- **Tabs** -- direct replacement for the hand-rolled tab bar in `Dashboard.tsx` (lines 100-116)
- **Table** -- structured table primitives for all three data tables (`ExperimentTable`, `ContentHealth`, `SurfaceMatrix`)
- **Input** -- replace the raw `<input>` in `FilterBar.tsx` (line 123)
- **Tooltip** -- replace raw `title` attributes across all table cells and interactive elements
- **Progress** -- replace the 3+ hand-rolled progress bar implementations

## Adopt Existing shadcn Components

- **Badge** (`src/components/ui/badge.tsx`) -- replace the 5 custom badge components in `badges.tsx` with the shadcn `Badge` using `className` overrides via `cn()` for color variants. The current badges already share an identical base pattern (`inline-flex rounded px-2 py-0.5 font-medium text-xs`).
- **Card** (`src/components/ui/card.tsx`) -- replace all manual `rounded-lg border border-zinc-800 bg-zinc-900/50 p-4` card patterns in `StatsBar.tsx` (StatCard), `ContentHealth.tsx`, and `Dashboard.tsx`.
- **Button** (`src/components/ui/button.tsx`) -- replace all raw `<button>` elements (filter chips, sort toggle, clear button, expand toggle, tab buttons) with `Button` variant="ghost"/"outline" as appropriate.

## Fix Type Safety Issues (Critical)

The dashboard uses a completely divergent listing vocabulary from the canonical types in `[src/lib/experiments.ts](src/lib/experiments.ts)`:


| Dashboard uses | Canonical type  | Meaning                |
| -------------- | --------------- | ---------------------- |
| `"public"`     | `"experiment"`  | Full public visibility |
| `"dev"`        | (no equivalent) | Dev-only               |
| `"registry"`   | `"collected"`   | Registry-only          |


**Fix**: Align the dashboard to use the canonical `ExperimentListing` type (`"experiment" | "collected" | "unlisted"`). This affects:

- `page.tsx` line 71: `raw.listing ?? "public"` should be `raw.listing ?? "experiment"`
- `types.ts` `getSurfaces()`: references to `"public"`, `"dev"`, `"registry"` must use canonical values
- `FilterBar.tsx` line 177: hardcoded `["public", "dev", "registry"]` must use canonical values
- `badges.tsx` `ListingBadge`: color mapping uses non-canonical values

Additionally fix unsafe casts:

- `page.tsx` line 78: `raw.profile as ExperimentRow["profile"]` -- validate against `VALID_PROFILES` or leave as `string | undefined`
- `page.tsx` line 79: `raw.complexity as ExperimentRow["complexity"]` -- same treatment

## Deduplicate Code

- **CompletenessBar**: Defined in `ExperimentTableRow.tsx` (line 34), but `ContentHealth.tsx` (lines 215-229) reimplements the identical progress bar inline. Extract to a shared file or import the existing export.
- **Progress bar pattern**: Three different implementations of the same `h-1.5 rounded-full bg-zinc-800` pattern across `StatsBar.tsx` (ProgressRow), `ExperimentTableRow.tsx` (CompletenessBar), and `ContentHealth.tsx`. Unify using the shadcn `Progress` component.

## Code Quality Improvements

**Per file:**

- `**Dashboard.tsx`** -- Replace hand-built tabs with shadcn `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`. Keep `useTabState` hook for URL sync but wire it to the shadcn `onValueChange` callback.
- `**FilterBar.tsx**` -- Use shadcn `Input` for search, `Button` variant="outline" for chips and sort toggle. Use `cn()` for conditional active/inactive styling instead of template literal ternaries.
- `**ExperimentTable.tsx**` -- Use shadcn `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`. Use `Button` variant="ghost" for sort headers.
- `**ExperimentTableRow.tsx**` -- Use shadcn `TableRow`/`TableCell`. Use `Tooltip` for content indicators (L/V/A). Replace `colSpan={100}` with a proper column count constant (13). Use `cn()` for expand arrow rotation instead of inline `style`.
- `**ContentHealth.tsx**` -- Import `CompletenessBar` instead of reimplementing. Use `Card` for section containers. Use shadcn `Table` for the ranked list.
- `**StatsBar.tsx**` -- Use `Card`/`CardContent` for stat cards. Use `Progress` for coverage bars.
- `**SurfaceMatrix.tsx**` -- Use shadcn `Table` family. Use `Tooltip` for surface rule explanations instead of `title`.
- `**WarningsList.tsx**` -- Use `Card` for the empty state and warning groups.
- `**badges.tsx**` -- Rewrite to use shadcn `Badge` with `cn()` for color overrides. Reduce from 5 components to thinner wrappers.
- `**types.ts**` -- Fix listing vocabulary. Add a `TABLE_COLUMN_COUNT = 13` constant.
- `**filter-utils.ts**` -- Clean, no structural changes needed.
- `**page.tsx**` -- Fix listing default. Add proper validation for profile/complexity instead of unsafe casts. Consider reusing `getExperiments()` from `@/lib/experiments` + extending with completeness/article data.

**Cross-cutting:**

- Replace all `<a href>` with Next.js `<Link>` for client-side navigation (15+ occurrences)
- Use `cn()` from `@/lib/utils` everywhere instead of template literal class concatenation
- Ensure consistent import ordering (React, Next, shadcn, local)

## File Change Summary


| File                     | Changes                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `page.tsx`               | Fix listing default, validate profile/complexity, proper types |
| `types.ts`               | Align listing vocab, add column count constant                 |
| `Dashboard.tsx`          | shadcn Tabs, cn()                                              |
| `FilterBar.tsx`          | shadcn Input, Button, cn()                                     |
| `ExperimentTable.tsx`    | shadcn Table, Button                                           |
| `ExperimentTableRow.tsx` | shadcn TableRow/Cell, Tooltip, Link, cn(), fix colSpan         |
| `ContentHealth.tsx`      | Import CompletenessBar, shadcn Card/Table/Progress             |
| `StatsBar.tsx`           | shadcn Card, Progress                                          |
| `SurfaceMatrix.tsx`      | shadcn Table, Tooltip                                          |
| `WarningsList.tsx`       | shadcn Card, Link                                              |
| `badges.tsx`             | Rewrite on top of shadcn Badge                                 |
| `filter-utils.ts`        | Minor: no structural changes                                   |


