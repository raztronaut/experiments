## Domain 3: Registry Components

**Scope**: Build the custom registry UI components used by Domain 2's pages.
**Complexity**: architecture

### Context to Read First

- `AGENTS.md` -- code style, component conventions, animation standards, accessibility
- `src/components/ui/` -- existing shared UI components for reference (patterns, naming)
- `src/app/shared-tokens.css` -- CSS custom properties (dark theme values matter most since registry is dark-only)
- `src/lib/utils.ts` -- `cn()` utility for className merging
- `.cursor/plans/registry_interactive_docs_aaa07efa.plan.md` (lines 946-999) -- component specs, card anatomy, hover-to-play pattern, InstallCommand simplification

### Changes to Make

1. **`src/components/registry/RegistryCard.tsx`**: Client component for the grid overview card:
   - `"use client"` (needs mouse events for hover-to-play)
   - Props interface:
     ```typescript
     interface RegistryCardProps {
       slug: string;
       title: string;
       description: string;
       poster?: string;
       video?: string;
       tags: string[];
       tech: string[];
       category: string;
     }
     ```
   - Wraps a `<Link>` to `/registry/${slug}`
   - **Preview media area** (~60% height): `<img>` for poster, `<video>` that plays on hover
   - **Title** (truncated to 1 line)
   - **Description** (truncated to 2 lines via `line-clamp-2`)
   - **Tech pills**: small badges showing tech stack items
   - Styling: rounded-lg border, bg-card, hover:border-muted-foreground/30 transition
   - Accessibility: `alt` on poster image, `aria-label` on the link

2. **`src/components/registry/InstallCommand.tsx`**: Client component for the install command:
   - `"use client"` (needs clipboard API)
   - Props: `{ slug: string }`
   - Renders: `npx shadcn add https://www.razisyed.cv/r/${slug}`
   - Terminal-style block with copy button
   - Visual feedback: icon changes from Copy to Check for 2 seconds
   - Use `lucide-react` icons: `Copy`, `Check`

3. **`src/components/registry/ExperimentPreview.tsx`**: Client component for iframe experiment preview:
   - `"use client"` (needs state for loading)
   - Props: `{ slug: string; title: string }`
   - Outer container with `aspect-video` and rounded border
   - Loading skeleton, lazy iframe with `sandbox="allow-scripts allow-same-origin allow-popups"`
   - Error handling with "Preview unavailable" fallback
   - "Open Full Page ↗" link

4. **`src/components/registry/RegistryMeta.tsx`**: Server component for metadata display:
   - Props: `{ dependencies, registryDependencies, tags, tech, fileCount }`
   - File count badge, dependency count, tech pills, tag badges
   - Clean flex-wrap layout

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/generate-registry.mjs` -- owned by Domain 1 (Script Overhaul)
- `src/app/(registry)/**` -- owned by Domain 2 (Route & Pages)
- `next.config.ts` -- owned by Domain 4 (Config & Integration)
- `package.json` -- owned by Domain 4 (Config & Integration)
- `src/components/ui/**` -- existing shared UI, do not modify

### Cross-Domain Notes

- **Depends on**: none (component interfaces are pre-defined in the orchestration plan)
- **Produces**: 4 components that Domain 2 imports. The interfaces MUST match the contracts above exactly.
- **Known interactions**: Domain 2 imports these components by path `@/components/registry/ComponentName`. Export each component as a named export.
