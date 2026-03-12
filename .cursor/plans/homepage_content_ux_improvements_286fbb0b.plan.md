---
name: Homepage Content UX Improvements
overview: Unify the Writing and Experiments homepage sections into a tabbed content area, and upgrade card quality for both experiments and articles with tech pills, better article indicators, and richer metadata.
todos:
  - id: content-section-tabs
    content: Create ContentSection.tsx with tab bar (Experiments | Writing), integrate ViewModeToggle into tab bar row, default to Experiments tab
    status: completed
  - id: homepage-integration
    content: Update page.tsx to use ContentSection, pass both articles[] and experiments[] from server component wrappers
    status: completed
  - id: experiment-tech-pills
    content: Add tech pills to ExperimentGridCard and ExperimentListItem (cap at 3, +N overflow)
    status: completed
  - id: experiment-article-pill
    content: Replace FileText icon with 'Article' pill badge on experiment cards (primary/10 color scheme)
    status: completed
  - id: article-data-enrichment
    content: Extend Article interface with tech[] and poster from parent experiment.json, update getArticles()
    status: completed
  - id: writing-card-upgrade
    content: Add 'View Experiment' pill, tech pills, and optional poster thumbnail to WritingSection article cards
    status: completed
  - id: strip-section-headings
    content: Remove standalone section headings and RSS link from WritingSection/ExperimentDrawerList (absorbed by tab bar)
    status: completed
isProject: false
---

# Homepage Content UX Improvements

## Current State

The homepage renders two **separate, stacked sections** with no shared navigation:

1. **Writing** (`WritingSection.tsx`) -- 2-column grid of article cards (currently **2 articles**)
2. **Experiments** (`ExperimentDrawerList.tsx`) -- grid/list toggle with 19 experiment cards

Key gaps:

- **Experiment cards** have `tags[]` and `tech[]` data (every experiment has both) but **neither is rendered**. The only metadata shown is date, title, description, and a tiny `FileText` icon for articles.
- **Article cards** show the raw experiment slug as plain text (`article.experimentSlug`) with no visual affordance -- no pill, no link to the live experiment, no tech context.
- The existing `Badge` component (`src/components/ui/badge.tsx`) is **unused on any card**. `RegistryCard` already renders tech pills with `rounded-full bg-accent` -- a proven pattern in this codebase.

## Plan

### 1. Unified Tabbed Content Section

Replace the two separate sections (Writing h2 + Experiments h2) with a single content area that has a **tab bar** at the top:

```
[ Experiments (19) ]  [ Writing (2) ]     [grid/list toggle]
```

- Default tab: **Experiments** (the primary content)
- The grid/list `ViewModeToggle` moves into the tab bar row, right-aligned (only visible when Experiments tab is active)
- Tab styling follows the existing `RegistryGrid` pattern: pill-shaped buttons with count badges, active state `bg-foreground text-background`
- The RSS feed link moves into the Writing tab header area

**Architecture**: Create a new `ContentSection` client component in `src/components/ui/ContentSection.tsx` that wraps both `ExperimentDrawerList` and `WritingSection`. It owns the tab state and passes down the active tab. The homepage `page.tsx` fetches both datasets in parallel (already does this) and passes them to `ContentSection`.

**Key files:**

- New: `[src/components/ui/ContentSection.tsx](src/components/ui/ContentSection.tsx)` -- tab state, layout orchestration
- Edit: `[src/app/(main)/page.tsx](src/app/(main)`/page.tsx) -- replace two Suspense blocks with one ContentSection
- Edit: `[src/components/ui/ExperimentDrawerList.tsx](src/components/ui/ExperimentDrawerList.tsx)` -- remove its own section heading, accept external view mode controls
- Edit: `[src/components/ui/WritingSection.tsx](src/components/ui/WritingSection.tsx)` -- remove its own heading/RSS, render just the card grid

### 2. Experiment Card Tech Pills

Add tech pills to both `ExperimentGridCard` and `ExperimentListItem`, using the existing `RegistryCard` pattern:

```tsx
<div className="flex flex-wrap gap-1">
  {experiment.tech?.slice(0, 3).map((t) => (
    <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-[10px] text-accent-foreground" key={t}>
      {t}
    </span>
  ))}
  {(experiment.tech?.length ?? 0) > 3 && (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
      +{experiment.tech!.length - 3}
    </span>
  )}
</div>
```

- **Grid card**: Pills go below the description, capped at 3 with "+N" overflow
- **List item**: Pills go after the description on the same line (desktop) or below on mobile, capped at 2-3

**Key files:**

- `[src/components/ui/experiments/ExperimentGridCard.tsx](src/components/ui/experiments/ExperimentGridCard.tsx)` -- add tech pills below description
- `[src/components/ui/experiments/ExperimentListItem.tsx](src/components/ui/experiments/ExperimentListItem.tsx)` -- add tech pills inline

### 3. Better Article Indicators on Experiment Cards

Replace the current tiny `FileText` icon with a more visible pill:

```tsx
{experiment.content?.article && (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-[10px] text-primary">
    <FileText className="h-3 w-3" />
    Article
  </span>
)}
```

This pill goes in the tech pills row, making it discoverable alongside the tech context. It uses `bg-primary/10 text-primary` to visually distinguish it from tech pills (`bg-accent`).

**Key files:** Same as above -- `ExperimentGridCard.tsx` and `ExperimentListItem.tsx`.

### 4. Richer Writing/Article Cards

Upgrade article cards in `WritingSection.tsx`:

- **Replace raw slug text** with a "View Experiment" pill that visually connects the article to its experiment:

```tsx
  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">
    View Experiment
  </span>
  

```

- **Add tech pills** from the parent experiment (requires passing experiment data to WritingSection, or enriching the Article type with tech/tags from the parent experiment at data-fetch time)
- **Optional**: Add a small thumbnail from the experiment's poster image as a subtle visual element in the card

To get tech data onto article cards, enrich `getArticles()` in `[src/lib/articles.ts](src/lib/articles.ts)` to also read the parent `experiment.json` and include `tech` and `tags` on the `Article` interface. This keeps the data fetch in the server component layer.

**Key files:**

- `[src/lib/articles.ts](src/lib/articles.ts)` -- add `tech?: string[]` and `poster?: string` to `Article`, read from sibling `experiment.json`
- `[src/components/ui/WritingSection.tsx](src/components/ui/WritingSection.tsx)` -- render tech pills, "View Experiment" pill, optional poster thumbnail

## Visual Summary

```
BEFORE:                              AFTER:
┌──────────────────────┐            ┌──────────────────────┐
│ Writing              │            │ [Experiments(19)] [Writing(2)]  [grid|list] │
│ ┌─────┐ ┌─────┐     │            │                                             │
│ │card │ │card │      │            │ ┌──────────────────────┐                    │
│ └─────┘ └─────┘      │            │ │ [poster/video]       │                    │
├──────────────────────┤            │ │ Mar 11, 2026         │                    │
│ Experiments  [g|l]   │            │ │ Basketball Replay    │                    │
│ ┌────┐┌────┐┌────┐   │            │ │ description...       │                    │
│ │    ││    ││    │   │            │ │ [r3f] [glsl] [gsap] [Article]│            │
│ │    ││    ││    │   │            │ └──────────────────────┘                    │
│ └────┘└────┘└────┘   │            └──────────────────────────────────┘          │
└──────────────────────┘
```

## Constraints / Notes

- Tab state is client-side only (no URL params needed for now; could add later with `searchParams`)
- The `ExperimentDrawerList` is already a client component, so wrapping it in a client `ContentSection` is fine
- `WritingSection` is currently a server component -- it would need to become part of the client tree for tab switching (the actual data fetching stays server-side via the async wrappers in `page.tsx`)
- The `Badge` component from shadcn exists but its styling (rounded-md, heavier weight) doesn't match the rounded-full pill aesthetic used in RegistryCard. Recommend using inline pill spans (matching RegistryCard) rather than the Badge component, unless we also update Badge to support a `pill` variant.
- Article data enrichment in `getArticles()` should gracefully handle missing experiment.json (already validated elsewhere)

