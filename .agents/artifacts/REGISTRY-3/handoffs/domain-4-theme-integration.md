## Domain 4: Theme & Integration -- Handoff Summary

**Status**: DONE

### Completed (plan items done)

- 1: Added GrainOverlay component to registry layout as first child in `<body>` with `fixed inset-0 z-50` -- `src/app/(registry)/layout.tsx`
- 2: Added minimal footer with "Built by Razi Syed" credit and GitHub repo link, using border-top separator -- `src/app/(registry)/layout.tsx`
- 3: Added `::selection` color refinement (hardcoded light-on-dark for dark-only registry), `@keyframes registry-fade-in` on `<main>` with `prefers-reduced-motion` fallback -- `src/app/(registry)/registry.css`
- 4: Added Content-Security-Policy header to the existing `/registry/:path*` headers block with all directives from the plan spec -- `next.config.ts`
- 5: Added "Browse Registry →" pill link on main site homepage after the description paragraph, wrapped in `WithHover`, with `data-umami-event="registry_link_click"` -- `src/app/(main)/page.tsx`
- 6: Added `data-umami-event="registry_nav_home"` and `data-umami-event="registry_nav_back"` to the two header links -- `src/app/(registry)/layout.tsx`

### Extra Discoveries (things found not in the plan)

- `Link` from `next/link` was not previously imported in `src/app/(main)/page.tsx` -- added import

### Extra Changes (files modified beyond the plan)

- None

### Intentional Skips (plan items NOT done, with reasoning)

- None

### Judgment Calls (deviations from the plan)

- Selection colors in `registry.css`: plan said "ensure `::selection` colors work well." The original used CSS custom properties (`--selection-foreground`/`--selection-background`). Since the registry is dark-only, I hardcoded concrete HSL values (`hsl(0 0% 98%)` foreground, `hsl(240 5% 30%)` background) for reliable contrast. If the custom properties are already defined in `shared-tokens.css` and work well, this can be reverted to use them.
- Footer GitHub link: used `https://github.com/raztronaut/experiments` as the repo URL based on the `raztronaut` GitHub handle found in the main site's social links.

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain 3 should: verify the `registry-fade-in` animation on `<main>` doesn't conflict with any entrance animations they add to the detail page content.
- Domain 2 should: verify the `registry-fade-in` animation on `<main>` doesn't conflict with any filtering/grid animations on the registry index page.

### Open Concerns (unresolved issues)

- The CSP header includes `'unsafe-inline' 'unsafe-eval'` for `script-src` which is permissive. This was specified in the plan and is needed for Next.js inline scripts and Vercel Analytics/Umami, but should be tightened with nonces in a future pass.
- The GrainOverlay at `z-50` is `pointer-events-none` (set in the component), so it won't block interactions, but visually it sits above everything -- verify it doesn't interfere with any high-z-index modals or dropdowns from other domains.

### Files Touched (complete list)

- `src/app/(registry)/layout.tsx` -- modified (GrainOverlay, footer, analytics attributes)
- `src/app/(registry)/registry.css` -- modified (selection colors, fade-in animation)
- `next.config.ts` -- modified (CSP header for registry routes)
- `src/app/(main)/page.tsx` -- modified (Browse Registry link + Link import)

### Learnings (reusable insights for future work)

- The GrainOverlay component defaults to `absolute` positioning with `z-[-1]` -- when used in a layout with scrolling content, override to `fixed inset-0 z-50` so it covers the full viewport regardless of scroll position.
- Biome's CSS class sorting is strict -- always run `biome check --write` after adding Tailwind classes to catch ordering issues.
