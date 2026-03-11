## Domain 2: Registry Route & Pages

**Scope**: Create the `(registry)` route group with its own HTML root, CSS, and all page-level server components (overview grid, detail page, OG image).
**Complexity**: architecture

### Context to Read First

- `AGENTS.md` -- project structure conventions, especially isolated route group pattern
- `src/app/(main)/layout.tsx` -- reference layout pattern (own `<html>/<body>`, fonts, analytics, metadata)
- `src/app/(main)/globals.css` -- reference CSS pattern (shared-tokens import, tailwind, shared-theme)
- `src/app/shared-tokens.css` -- CSS custom properties for light/dark themes
- `src/app/shared-theme.css` -- Tailwind `@theme` color registration
- `src/lib/fonts.ts` -- font exports (activeFont = testDieGrotesk, replica, spaceGrotesk)
- `public/registry/index.json` -- current registry output (to understand existing schema)
- `src/app/experiments/(send-button)/experiment.json` -- example experiment.json
- `.cursor/plans/registry_interactive_docs_aaa07efa.plan.md` (lines 77-130) -- Lean Architecture spec

### Changes to Make

1. **`src/app/(registry)/registry.css`**: Create the route group CSS following the established pattern:
   - Import `shared-tokens.css` in base layer
   - Import `tailwindcss`
   - Import `tw-animate-css`
   - Import `shared-theme.css`
   - Add `@custom-variant dark`
   - Add base styles: `border-border`, scrollbar styling, selection colors
   - Import path to shared-tokens/shared-theme uses relative `../../` (same depth as experiments.css)

2. **`src/app/(registry)/layout.tsx`**: Create the registry layout with its own `<html>/<body>`:
   - Import and apply `activeFont` from `@/lib/fonts` (same as main layout)
   - Force dark mode via `className="dark"` on `<html>` (registry is dark-only like the experiments)
   - Import `./registry.css`
   - Include `<Analytics />` from `@vercel/analytics/next` and `<SpeedInsights />` from `@vercel/speed-insights/next`
   - Include `UmamiScript` from `@/components/analytics/UmamiScript`
   - Metadata: title template `"%s | Razi's Registry"`, description, metadataBase, robots `noindex, nofollow`
   - Keep it minimal -- no CursorProvider, no ThemeProvider (dark-only), no ConsoleEasterEgg
   - Simple layout: a `<header>` with "razi's registry" link to `/registry` + back link to main site, then `{children}`

3. **`src/app/(registry)/registry/page.tsx`**: Server component for the grid overview:
   - Read `public/registry/index-slim.json` via `fs.readFile` (works at build time in `next build`)
   - Use `import { readFile } from 'node:fs/promises'` and `import { join } from 'node:path'`
   - Path: `join(process.cwd(), 'public', 'registry', 'index-slim.json')`
   - Filter out items where `status === 'wip'` (safety net)
   - Render a responsive grid (3-col desktop, 2-col tablet, 1-col mobile) of `RegistryCard` components
   - Add a simple heading: "Registry" with description "Installable experiments, components, and hooks."
   - Show total item count
   - Export metadata: `{ title: 'Registry', description: 'Browse and install experiments...' }`
   - **IMPORTANT**: If `index-slim.json` doesn't exist yet (domain 1 hasn't run), gracefully handle with try/catch and fall back to reading `index.json` (which exists now). Strip file contents if using full index.

4. **`src/app/(registry)/registry/[slug]/page.tsx`**: Server component for the detail page:
   - Read `public/registry/{slug}.json` via `fs.readFile`
   - Implement `generateStaticParams()` that reads the registry directory and returns all slugs (filter out `index.json`, `index-slim.json`, `razi-style.json`)
   - Render: title (h1), description, `ExperimentPreview` iframe, `InstallCommand`, `RegistryMeta`, and source code sections
   - For source code: render each file from the item's `files` array in a collapsible `<details>` element with syntax-highlighted code using Shiki (already in the project as a dependency). Use a simple `<pre><code>` with appropriate styles if Shiki integration is complex.
   - Export `generateMetadata()` for dynamic title/description per item
   - Include a "Back to Registry" link

5. **`src/app/(registry)/registry/[slug]/opengraph-image.tsx`**: Dynamic OG image per registry item:
   - Use `ImageResponse` from `next/og`
   - `export const runtime = 'edge'`
   - Size: 1200x630
   - Dark background matching site colors (`hsl(240, 8.25%, 6.84%)`)
   - Show item title (large), description (smaller), and `razisyed.cv/r/{slug}` at bottom
   - Use the site's system font stack (loading custom fonts in edge runtime is optional -- use a web-safe fallback)

### Component Interfaces (import from Domain 3)

Import these components from `@/components/registry/`:

```typescript
// RegistryCard -- used in overview grid
import { RegistryCard } from '@/components/registry/RegistryCard';
<RegistryCard
  slug={item.name}
  title={item.title}
  description={item.description}
  poster={item.poster}
  video={item.video}
  tags={item.tags}
  tech={item.tech}
  category={item.category}
/>

// InstallCommand -- used in detail page
import { InstallCommand } from '@/components/registry/InstallCommand';
<InstallCommand slug={slug} />

// ExperimentPreview -- used in detail page
import { ExperimentPreview } from '@/components/registry/ExperimentPreview';
<ExperimentPreview slug={slug} title={item.title} />

// RegistryMeta -- used in detail page
import { RegistryMeta } from '@/components/registry/RegistryMeta';
<RegistryMeta
  dependencies={item.dependencies}
  registryDependencies={item.registryDependencies}
  tags={metadata.tags}
  tech={metadata.tech}
  fileCount={item.files.length}
/>
```

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/generate-registry.mjs` -- owned by Domain 1 (Script Overhaul)
- `src/components/registry/**` -- owned by Domain 3 (Components) -- only import, don't create
- `next.config.ts` -- owned by Domain 4 (Config & Integration)
- `package.json` -- owned by Domain 4 (Config & Integration)
- `src/app/(main)/**` -- owned by nobody in this orchestration, do not touch

### Cross-Domain Notes

- **Depends on**: Domain 3 (component interfaces -- documented above). Domain 1 (index-slim.json schema). Both run in parallel but the contracts are pre-defined.
- **Produces**: The route structure that imports Domain 3's components. The pages that read Domain 1's JSON output.
- **Known interactions**: If `index-slim.json` doesn't exist, fall back to `index.json` with content stripping. The detail page reads individual `{slug}.json` files which already exist in the current codebase.
