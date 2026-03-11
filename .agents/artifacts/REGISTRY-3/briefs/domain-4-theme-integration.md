## Domain 4: Theme & Integration

**Scope**: Add grain overlay to registry layout, refine CSS theme, add CSP headers, add analytics tracking attributes, and add a registry link from the main site.
**Complexity**: integration

### Context to Read First

- `AGENTS.md` -- project conventions (always read)
- `src/app/(registry)/layout.tsx` (all) -- registry layout with own `<html>/<body>`, dark-only, header with "razi's registry" + "back to site" link, Vercel Analytics/SpeedInsights, UmamiScript.
- `src/app/(registry)/registry.css` (all) -- Tailwind + shared tokens/theme + scrollbar + Shiki styles.
- `next.config.ts` (all) -- security headers, optimizePackageImports, outputFileTracingIncludes, rewrites, registry noindex headers.
- `src/components/ui/GrainOverlay.tsx` (all) -- existing grain overlay component used on the main site. Uses `/grain.gif` background image.
- `src/app/(main)/page.tsx` (all) -- main site homepage. Has hero section with "razi's experiments" title. No explicit nav header. Has `GrainOverlay`, social links (mobile), `ExperimentDrawerList`, `WritingSection`, `SiteFooter`.
- `src/app/(main)/layout.tsx` (all) -- main site layout. Has `ThemeProvider`, `CursorProvider`, analytics scripts.
- `.cursor/plans/registry_interactive_docs_aaa07efa.plan.md` (lines 1037-1156) -- Phase 7 Polish specs including theme tuning, fonts, grain overlay, responsive QA, analytics, nav link, CSP headers.

### Changes to Make

1. **`src/app/(registry)/layout.tsx`**: Add the `GrainOverlay` component from `@/components/ui/GrainOverlay`. Place it inside `<body>` as the first child (before header), matching the main site's pattern. Ensure it has `fixed` positioning and covers the full viewport:
   ```tsx
   <GrainOverlay className="fixed inset-0 z-50" />
   ```

2. **`src/app/(registry)/layout.tsx`**: Add a subtle footer at the bottom with:
   - "Built by Razi Syed" or similar credit line
   - Link to GitHub repo
   - The footer should be minimal — just a `<footer>` with centered small text.

3. **`src/app/(registry)/registry.css`**: Add CSS custom properties for the grain overlay and any additional theme refinements. Ensure the `::selection` colors work well. Add a subtle animation for page load (optional — a simple fade-in on the `<main>` element using `@keyframes`).

4. **`next.config.ts`**: Add Content-Security-Policy header for registry routes. Use the spec from the plan:
   ```
   source: "/registry/:path*"
   headers: [
     { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.razisyed.cv; font-src 'self'; frame-src 'self'; connect-src 'self' https://cloud.umami.is; frame-ancestors 'self'" }
   ]
   ```
   Add this to the existing `/registry/:path*` headers block (which already has `X-Robots-Tag`).

5. **`src/app/(main)/page.tsx`**: Add a subtle "Registry" link in the hero section, near the description text. Place it after the description paragraph and before the mobile social links. Style it as a small pill/button that matches the site's aesthetic:
   ```tsx
   <Link href="/registry" className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
     Browse Registry →
   </Link>
   ```
   Import `Link` from `next/link`. Use `WithHover` wrapper for consistency.

6. **`src/app/(registry)/layout.tsx`**: Add Umami analytics data attributes to the header links:
   - "razi's registry" link: `data-umami-event="registry_nav_home"`
   - "back to site" link: `data-umami-event="registry_nav_back"`

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/build-registry.mjs` -- owned by Domain 1 (Pipeline Full Catalog)
- `scripts/post-process-registry.mjs` -- owned by Domain 1 (Pipeline Full Catalog)
- `scripts/generate-registry-json.mjs` -- owned by Domain 1 (Pipeline Full Catalog)
- `src/app/(registry)/registry/page.tsx` -- owned by Domain 2 (Grid Filtering)
- `src/components/registry/RegistryCard.tsx` -- owned by Domain 2 (Grid Filtering)
- `src/app/(registry)/registry/[slug]/page.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/registry/ExperimentPreview.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/registry/InstallCommand.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/registry/RegistryMeta.tsx` -- owned by Domain 3 (Detail Multi-Type)
- `src/components/ui/GrainOverlay.tsx` -- shared UI component, read-only (import it, don't modify it)
- `src/app/(main)/layout.tsx` -- main site layout, do NOT modify

### Cross-Domain Notes

- **Depends on**: none
- **Produces**: Visual polish (grain overlay, theme refinement) and integration (main site link, analytics, CSP). No other domains depend on this output.
- **Known interactions**: Domain 3 may need custom CSS for the viewport toggle or code display. If Domain 3 flags CSS needs in its handoff, note them for post-orchestration follow-up (Domain 4 owns `registry.css`). The main site page (`src/app/(main)/page.tsx`) is a sensitive file — make minimal changes (just the registry link).
