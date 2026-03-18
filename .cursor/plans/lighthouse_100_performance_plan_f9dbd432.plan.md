---
name: Lighthouse 100 Performance Plan
overview: A plan to run full Lighthouse and performance-trace audits (mobile + desktop) via Chrome DevTools MCP, fix every finding (a11y 97→100, performance 86→100), use production source maps for trace analysis, and harden docs and automation for sustained 100s.
todos: []
isProject: false
---

# Ultimate Lighthouse and performance audit plan (100 across mobile + desktop)

## Audit results summary (Chrome DevTools MCP)

**Lighthouse (a11y, SEO, best practices)**  

- **Desktop**: Accessibility 97, Best Practices 100, SEO 100. **2 failed audits** (accessibility).  
- **Mobile**: Same scores and 2 failed a11y audits.  
- **Performance**: Not included in `lighthouse_audit`; use `performance_start_trace` for CWV and long tasks.

**Performance trace (production, no throttling)**  

- LCP 196 ms, CLS 0.  
- **LCP Discovery**: LCP element = first experiment card image (`IMG.z-0.object-cover`, poster from `/experiments/404-not-found/poster.jpg`). Checks: **fetchpriority=high FAILED**, **lazy load not applied FAILED** (i.e. the LCP image was treated as lazy/low priority). Discoverable in initial document: PASSED.  
- **Render-blocking**: Two CSS chunks (`37210930ead7319d.css`, `567a1e8ca5af4222.css`), ~67–73 ms each.  
- **Third parties**: open-meteo.com, umami.dev (small transfer); insight recommends deferring.

**Existing platform setup**  

- [next.config.ts](next.config.ts): `productionBrowserSourceMaps: true`, `optimizePackageImports`, no `inlineCss`.  
- [DeferredVercelAnalytics](src/components/analytics/DeferredVercelAnalytics.tsx): Analytics/Speed Insights loaded after mount.  
- [UmamiScript](src/components/analytics/UmamiScript.tsx): `strategy="lazyOnload"`.  
- [StaticExperimentMedia](src/components/ui/experiments/StaticExperimentMedia.tsx): `priority` and `fetchPriority={priority ? "high" : "auto"}`; [ExperimentDrawerList](src/components/ui/ExperimentDrawerList.tsx) passes `priority={index === 0}` for grid.  
- [docs/performance.md](docs/performance.md), [docs/performance-metrics.md](docs/performance-metrics.md), [.agents/rules/performance.md](.agents/rules/performance.md) define budgets and practices.

---

## 1. Identify and fix the 2 accessibility failures (97 → 100)

**Problem**: Lighthouse reports 2 failed a11y audits; IDs are not in the MCP summary.

**Actions**:

- **Obtain failed audit IDs**: Run `lighthouse_audit` with `outputDirPath` set to a workspace path and parse the generated report (e.g. `report.json`) for `audits` where `score !== 1` or `score === null`. Alternatively run `npm run lighthouse` (or Lighthouse CLI) and open the HTML report to list failures.
- **Typical 97-score failures**: Contrast, tap target size (< 44×44px), missing `aria-*` or form labels, or duplicate IDs. Search the codebase for the specific audit IDs (e.g. `color-contrast`, `tap-targets`, `aria-*`).
- **Fix**: Address each failure in the relevant components (e.g. [src/app/(main)/page.tsx](src/app/(main)/page.tsx) social buttons, [ContentSection](src/components/ui/ContentSection.tsx) tabs, [ExperimentDrawerList](src/components/ui/ExperimentDrawerList.tsx) cards). Re-run Lighthouse until Accessibility = 100 on both mobile and desktop.

---

## 2. LCP: Ensure first-card image is high priority and not lazy (performance)

**Problem**: Performance insight reports the LCP image did not have `fetchpriority=high` and failed the “lazy load not applied” check (image had network Priority: Low).

**Root cause**: [ExperimentDrawerList](src/components/ui/ExperimentDrawerList.tsx) already passes `priority={index === 0}` to [ExperimentGridCard](src/components/ui/experiments/ExperimentGridCard.tsx) → [StaticExperimentMedia](src/components/ui/experiments/StaticExperimentMedia.tsx). Next.js `Image` with `priority` should set `fetchpriority="high"` and omit `loading="lazy"`. Possible causes: (1) default view is grid but first experiment order can vary; (2) Next.js may not always emit the attribute in the built HTML; (3) list view uses [ExperimentListItem](src/components/ui/experiments/ExperimentListItem.tsx) + InteractivePreviewMedia (no `priority` prop there).

**Actions**:

- **Verify DOM**: After deploy/preview, inspect the first experiment card’s `<img>` (or wrapper) in DevTools: confirm `fetchpriority="high"` and absence of `loading="lazy"` for the LCP image. If missing, ensure the first **visible** card (grid index 0) gets `priority` and that Next.js version supports it (see Next.js Image docs).
- **Explicit priority on Image**: In [StaticExperimentMedia.tsx](src/components/ui/experiments/StaticExperimentMedia.tsx), when `priority === true`, explicitly pass `fetchPriority="high"` (already done) and rely on Next.js `priority` to disable lazy loading; if the built output still shows lazy, consider a single preload in the (main) layout for the first experiment’s poster URL (from server data) to force early discovery.
- **List view**: If list view can be the default on mobile and its first item is LCP, add a `priority` (or equivalent) path for the first list item’s preview image in [ExperimentListItem](src/components/ui/experiments/ExperimentListItem.tsx) / InteractivePreviewMedia so the LCP image is never lazy there either.

---

## 3. Render-blocking CSS (performance)

**Problem**: Two render-blocking CSS chunks add ~67–73 ms to the critical path.

**Options (choose one and document trade-offs)**:

- **Next.js experimental `inlineCss`**: In [next.config.ts](next.config.ts), add `experimental: { inlineCss: true }`. This inlines CSS and can remove render-blocking; with Tailwind/atomic CSS, bundle size per request is manageable. **Trade-off**: Full CSS in every HTML response; cached separate CSS no longer used for first load (see [Next.js inlineCss](https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss)).
- **Critical CSS**: If `inlineCss` is not acceptable (e.g. cache or size concerns), evaluate critical-CSS extraction (e.g. critters) compatible with App Router and document why inlineCss was not used.
- **Measure**: Re-run performance trace and Lighthouse after the change; confirm “Eliminate render-blocking resources” improves and LCP/FCP do not regress.

---

## 4. Performance traces with throttling and source maps

**Goal**: Reproduce the ~86 performance score (mobile) and use traces + source maps to find long tasks and bottlenecks.

**Workflow**:

- **Throttled trace**: In Chrome DevTools MCP, set mobile viewport (`emulate` with viewport e.g. `390x844x2,mobile,touch`), then optionally `emulate` with `cpuThrottlingRate: 4` and `networkConditions: "Slow 4G"`. Navigate to `https://www.razisyed.cv`, then run `performance_start_trace` with `reload: true`, `autoStop: true`, and `filePath` set to a path in the repo (e.g. `./.next/trace-mobile.json` or similar). Repeat for desktop (no or light throttling) and save a second trace.
- **Analyze with source maps**: Open the saved trace in Chrome DevTools (Performance tab → Load profile). With `productionBrowserSourceMaps: true`, DevTools will map minified frames to source (when maps are served). Identify: long tasks (> 50 ms), layout/paint storms, heavy script from specific files. Use MCP `performance_analyze_insight` for the returned insight sets (e.g. `RenderBlocking`, `LCPBreakdown`, `ThirdParties`, `NetworkDependencyTree`) to get actionable summaries.
- **Act on findings**: Defer or split heavy scripts, reduce main-thread work for above-the-fold path, and ensure no new render-blocking or large synchronous bundles. Re-run traces after changes.

---

## 5. Third parties and scripts

**Current**: Umami uses `lazyOnload`; Vercel Analytics/Insights are deferred in [DeferredVercelAnalytics](src/components/analytics/DeferredVercelAnalytics.tsx). open-meteo is used (e.g. [LocationStatusEnhancer](src/components/ui/LocationStatusEnhancer.tsx)); trace showed small transfer.

**Actions**:

- Keep third-party scripts deferred. If open-meteo or any other script runs before LCP, load it after LCP (e.g. requestAnimationFrame after first paint or after a short timeout) so TBT and LCP are not hurt.
- Document in [docs/performance.md](docs/performance.md) that third-party scripts must be deferred or lazy-loaded and that production source maps are used for trace analysis.

---

## 6. Automation and documentation

- **Lighthouse scripts**: Extend [package.json](package.json) `lighthouse` script to run both mobile and desktop (e.g. `--preset=desktop` and `--preset=mobile`) and write separate reports (e.g. `.lighthouse-desktop.html`, `.lighthouse-mobile.html`) so both can be checked post-deploy. Optionally add `lighthouse:ci` that fails if any category < 100.
- **Docs**: In [docs/performance.md](docs/performance.md): (1) Add a “Chrome DevTools MCP” section: how to run `lighthouse_audit` (a11y, SEO, BP) and `performance_start_trace` for mobile/desktop, and how to use `performance_analyze_insight` with the reported insight set IDs. (2) Note that traces should be analyzed in DevTools with production source maps enabled. (3) Add “Lighthouse 100” to the PR checklist: run Lighthouse for mobile and desktop and confirm Performance, Accessibility, Best Practices, SEO all 100 (or document exceptions).
- **Metrics**: Update [docs/performance-metrics.md](docs/performance-metrics.md) with a “Target: 100 across all categories (mobile + desktop)” and note that `npm run lighthouse` (or MCP audits) should be run after major changes.

---

## 7. Implementation order (recommended)

1. **Get the 2 a11y failure IDs** (report parsing or manual Lighthouse) and fix them → Accessibility 100.
2. **Verify and fix LCP image priority** (DOM check, then preload or list-view priority if needed).
3. **Evaluate and enable `inlineCss`** (or document alternative) and re-measure render-blocking.
4. **Run throttled performance traces**, analyze with source maps, and fix long tasks / heavy scripts.
5. **Defer any remaining third-party work until after LCP** if needed.
6. **Add lighthouse automation and docs** (mobile + desktop, MCP workflow, PR checklist).

---

## 8. Out of scope / guardrails

- No changes to shared UI or toolkit without prior approval (per AGENTS.md).  
- No removal of `productionBrowserSourceMaps`; it is required for trace analysis.  
- Performance work stays confined to performance-related files; no broad refactors in a “performance-only” pass.

