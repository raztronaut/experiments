---
name: Performance Round 2
overview: Second-pass performance overhaul focused on the main app (not individual experiments). Targets three critical bundle leaks where experiment/heavy code bleeds into main-app routes, SSR streaming for faster homepage paint, static generation, dead dependency pruning, font cleanup, and runtime micro-optimizations.
todos:
  - id: notfound-r3f-leak
    content: "P0: Dynamic-import the 404 R3F experiment in not-found.tsx -- currently pulls three.js (~600KB) + R3F into the app-level 404 bundle"
    status: completed
  - id: sandpack-mdx-leak
    content: "P0: Lazy-load SandpackDemo in the MDX component map -- currently every article page bundles @codesandbox/sandpack-react (~150-200KB)"
    status: completed
  - id: homepage-streaming
    content: "P0: Restructure homepage for SSR streaming -- extract data-dependent sections into async server components wrapped in Suspense with skeleton fallbacks so hero renders instantly"
    status: completed
  - id: loading-tsx
    content: "P0: Add loading.tsx to src/app/(main)/ for instant navigation feedback"
    status: completed
  - id: feed-sitemap-revalidate
    content: "P0: Add export const revalidate = 3600 to feed.xml/route.ts and sitemap.ts"
    status: completed
  - id: dynamic-lottie
    content: "P1: Dynamic import lottie-react in LottieWeatherIcon.tsx (~30KB gzip in homepage bundle)"
    status: completed
  - id: lazy-console-egg
    content: "P1: Lazy-load ConsoleEasterEgg with next/dynamic ssr:false in root layout"
    status: completed
  - id: umami-lazyonload
    content: "P1: Change Umami analytics strategy from afterInteractive to lazyOnload"
    status: completed
  - id: optimize-three
    content: "P1: Add three and @react-three/fiber to optimizePackageImports in next.config.ts (helps experiment route bundles)"
    status: completed
  - id: font-cleanup
    content: "P2: Fix spaceGrotesk --font-app variable conflict, evaluate instrumentSerif necessity, convert replica OTF to WOFF2"
    status: completed
  - id: transition-all
    content: "P3: Replace transition-all with specific property transitions in main-app UI components"
    status: completed
  - id: memo-list-item
    content: "P3: Wrap ExperimentListItem in React.memo"
    status: completed
  - id: hoist-configs
    content: "P3: Hoist inline WithHover config objects to module-level constants in page.tsx and SiteFooter.tsx"
    status: completed
  - id: wave-touchmove
    content: "P3: Remove touchmove preventDefault in wave-background for mobile scroll perf"
    status: completed
  - id: timepill-interval
    content: "P3: Align TimePill interval to minute boundaries instead of 1s polling"
    status: completed
  - id: console-leak
    content: "P3: Fix ConsoleEasterEgg interval leak on unmount"
    status: completed
isProject: false
---

# Performance Round 2: Main App Focus

The first overhaul addressed the biggest CPU/rendering bottlenecks: Waves Canvas2D migration, IntersectionObserver, cursor idle RAF, video preload, parallel fetches, Suspense, CSS scoping, font `display:"swap"`, LocationStatus dot animations, toolkit barrel safety, and dev tools gating.

**Scope:** This plan targets the **main app only** (homepage, layout, navigation, shared components, article pages). Individual experiments are isolated in their own `<html>` documents via iframes and separate route trees -- their internal performance does not affect the main app. The exception is when experiment code **leaks into** main-app bundles, which is the case for three critical items below.

## Isolation Verification

An audit confirmed experiments are properly isolated:

- `ExperimentDrawerList` uses `next/dynamic` for sub-components and iframes for previews
- Dev tools are behind `dynamic()` + `NODE_ENV` guards, only imported by experiment layouts
- Toolkit barrel is minimal and only consumed by experiment code
- **Three leaks found** where experiment/heavy code enters main-app bundles (items 1-2 below)

---

## P0: Critical Bundle Leaks and SSR Streaming

### 1. `not-found.tsx` pulls in three.js + R3F (~600KB+)

**File:** [src/app/not-found.tsx](src/app/not-found.tsx) line 3

The app-level 404 page directly imports `NotFound404` from `@/components/experiments/404-not-found/404NotFound`, which statically imports `three`, `@react-three/fiber`, `@react-three/drei`, plus custom shaders and geometry. Every unmatched route across the entire app loads 600KB+ of 3D libraries.

**Fix:** Use `next/dynamic` with `ssr: false` and a lightweight fallback (the "404" text + return link render instantly, the 3D scene loads after):

```tsx
const NotFound404 = dynamic(
  () => import("@/components/experiments/404-not-found/404NotFound"),
  { ssr: false, loading: () => <div className="h-full w-full bg-white" /> }
);
```

### 2. `SandpackDemo` in MDX component map bloats all article pages

**File:** [src/components/mdx/components.tsx](src/components/mdx/components.tsx) line 8

`SandpackDemo` is statically imported and included in the `articleComponents` map. Since `MDXRemote` resolves component names at runtime, the bundler cannot tree-shake it. Every article page bundles `@codesandbox/sandpack-react` (~150-200KB gzipped) even if the article doesn't use `<SandpackDemo>`.

**Fix:** Replace the static import with a dynamic wrapper:

```tsx
import dynamic from "next/dynamic";
const SandpackDemo = dynamic(() =>
  import("./SandpackDemo").then((mod) => mod.SandpackDemo)
);
```

### 3. Homepage Streaming -- Hero renders instantly, data sections stream in

**File:** [src/app/(main)/page.tsx](src/app/(main)/page.tsx)

The `Home` component `await`s both `getExperiments()` and `getArticles()` at the top (line 25-28), blocking the **entire page** -- including the hero section (title, LocationStatus, waves) which needs none of that data. The `<Suspense>` wrappers (lines 117-122) are no-ops because data is already resolved.

**Fix:** Extract data-dependent sections into async server components that fetch their own data, wrapped in Suspense with skeleton fallbacks:

```tsx
async function WritingSectionAsync() {
  const articles = await getArticles();
  return <WritingSection articles={articles} />;
}

async function ExperimentListAsync() {
  const experiments = await getExperiments();
  return <ExperimentDrawerList experiments={experiments} />;
}

export default function Home() {
  return (
    <div>
      {/* Hero renders instantly -- no data dependency */}
      <GrainOverlay />
      <ThemeAwareWaves />
      <main>
        <LocationStatus />
        <h1>...</h1>
        {/* Data sections stream in when ready */}
        <Suspense fallback={<WritingSkeleton />}>
          <WritingSectionAsync />
        </Suspense>
        <Suspense fallback={<ExperimentsSkeleton />}>
          <ExperimentListAsync />
        </Suspense>
      </main>
    </div>
  );
}
```

### 4. Add `loading.tsx` for instant navigation feedback

No `loading.tsx` files exist anywhere. Users see a blank screen during server rendering when navigating between routes. Add a minimal skeleton `loading.tsx` to `src/app/(main)/`.

### 5. Add `revalidate` to feed.xml and sitemap

- [src/app/feed.xml/route.ts](src/app/feed.xml/route.ts) has a response-level `Cache-Control` header but no Next.js `export const revalidate`. It re-reads all article MDX on every uncached hit.
- [src/app/sitemap.ts](src/app/sitemap.ts) has no revalidation at all.

Add `export const revalidate = 3600` to both.

---

## P1: Bundle Size -- Deferred Loading

### 6. Dynamic import `lottie-react` for weather icon

[src/components/ui/LottieWeatherIcon.tsx](src/components/ui/LottieWeatherIcon.tsx) line 3 statically imports `lottie-react` (~30KB gzipped) into the homepage bundle. The component only renders after weather data resolves, so it can be `next/dynamic` imported with a tiny placeholder.

### 8. Lazy-load `ConsoleEasterEgg`

[src/app/(main)/layout.tsx](src/app/(main)/layout.tsx) line 112 statically imports `ConsoleEasterEgg` -- a side-effect-only client component that just runs `console.log`. Use `next/dynamic` with `ssr: false`.

### 9. Umami analytics: `afterInteractive` to `lazyOnload`

[src/components/analytics/UmamiScript.tsx](src/components/analytics/UmamiScript.tsx) line 16. Analytics are non-essential. `lazyOnload` defers until the browser is idle, improving TTI/TBT.

### 10. Add `three` and `@react-three/fiber` to `optimizePackageImports`

[next.config.ts](next.config.ts) lists `@react-three/drei` but not `three` itself or `@react-three/fiber`. While these primarily affect experiment route bundles (not the main app directly), adding them helps tree-shake the ~600KB three.js library across the entire app -- including the dynamically-imported 404 page from item 1.

---

## P2: Font Optimization

### 11. Remove/fix `spaceGrotesk` font conflict

[src/lib/fonts.ts](src/lib/fonts.ts) lines 40-44: `spaceGrotesk` (Google Font, ~20-40KB woff2) uses `variable: "--font-app"` -- the **same CSS variable** as `testDieGrotesk`. This creates a conflict and downloads an unnecessary Google Font on every page. It's only used in `LocationStatus.tsx` via `spaceGrotesk.className`.

**Fix:** Either give `spaceGrotesk` its own CSS variable (e.g., `--font-space`), or replace its usage in LocationStatus with the active app font.

### 12. Evaluate `instrumentSerif` loading

[src/lib/fonts.ts](src/lib/fonts.ts) lines 46-51: `instrumentSerif` (Google Font) is only imported by `LocationStatus.tsx`. It downloads for every page load but only renders in one component on the homepage.

### 13. Convert `replica` OTF to WOFF2

The previous plan noted this but it was never executed. [src/lib/fonts.ts](src/lib/fonts.ts) lines 23-38 still reference `.otf` files. WOFF2 is typically 30-50% smaller.

---

## P3: Runtime Micro-Optimizations

### 14. Replace `transition-all` with specific properties in main-app components

`transition-all` causes the browser to watch every CSS property change. Replace in shared UI components only:

- `ExperimentListItem.tsx` -> `transition-colors`
- `ExperimentGridCard.tsx` -> `transition-colors transition-shadow`
- `WritingSection.tsx` -> `transition-colors`
- `InteractivePreviewMedia.tsx` -> `transition-colors transition-opacity`
- `AIWidget.tsx` -> `transition-colors transition-opacity`

### 15. Memoize `ExperimentListItem`

[src/components/ui/experiments/ExperimentListItem.tsx](src/components/ui/experiments/ExperimentListItem.tsx) is not wrapped in `React.memo`, unlike `ExperimentGridCard` which is. In list mode, hover state changes cause all items to re-render.

### 16. Hoist inline `config` objects on `WithHover`

[src/app/(main)/page.tsx](src/app/(main)/page.tsx) lines 49 and 60 create `config={{ scale: 1.5 }}` inline. Hoist to module-level constants. Same for `SiteFooter.tsx` with `config={{ hoverOffset: 2 }}`.

### 17. Wave background: remove mobile touchmove `preventDefault`

[src/components/ui/wave-background.tsx](src/components/ui/wave-background.tsx) calls `e.preventDefault()` on touchmove with `passive: false`. This blocks the browser's scroll optimization on mobile for a background decoration. Remove `preventDefault()` and switch to `passive: true`.

### 18. TimePill: align interval to minute boundaries

[src/components/ui/location/TimePill.tsx](src/components/ui/location/TimePill.tsx) fires an interval every 1000ms but only checks minute changes. 59 of 60 ticks are wasted. Use a `setTimeout` that reschedules to the next minute boundary.

### 19. ConsoleEasterEgg: fix interval leak

[src/components/ui/ConsoleEasterEgg.tsx](src/components/ui/ConsoleEasterEgg.tsx) lines 79-83: The cleanup function clears `initTimer` but doesn't call `_stopSurprise()` to clear a running cat animation interval on unmount.

---

## Constraints

- Individual experiment code is out of scope (isolated in their own `<html>` documents)
- Legacy experiments (`legacy: true`) are untouchable
- `ExperimentCanvas` in `@/lib/toolkit/r3f` is V2 infrastructure, not dead code
- `@react-spring/three`, `@theatre/core`, `@theatre/r3f`, `hamo` are V2 dependencies awaiting consumers -- not dead weight
- Leva in production for kinetic-typography-scroll is intentional
- The wave background visual and cursor interaction must remain identical
- The cursor snap/morph/exit behavior must be preserved exactly

