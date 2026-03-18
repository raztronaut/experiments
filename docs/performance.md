# Performance and Bundle Analysis

S-tier reference for production performance: source maps, bundle analysis, CI gating, and monitoring. Designed so a 1000x dev can audit, debug, and optimize with confidence.

---

## 1. Production Browser Source Maps

**Config**: `productionBrowserSourceMaps: true` in `next.config.ts`

### What It Does

Next.js emits `.map` files alongside production JS chunks. Browsers and error-reporting services map minified stack traces to original source files.

### How to Use

| Use Case | How |
|----------|-----|
| **Chrome DevTools** | DevTools → Sources. Minified files show "original source" links. |
| **Error reporting** | Sentry, LogRocket, Vercel overlay: symbolicate production errors when maps are available. |
| **Performance profiling** | DevTools Performance tab shows readable function names instead of `chunk.js:1:2345`. |

### Error Monitoring Integration

With source maps enabled, configure your error service to fetch maps from production:

- **Sentry**: Set `dist` and `release`; upload source maps at build time or allow Sentry to fetch from `/_next/static/chunks/*.map`.
- **LogRocket**: Automatically symbolicates when maps are served.
- **Vercel**: Built-in error overlay uses maps when available.

Ensure `productionBrowserSourceMaps: true` is set before deploying.

### Security and Hygiene

- **X-Robots-Tag**: `noindex, nofollow` is set on `/_next/static/chunks/*.map` in `next.config.ts` so search engines don't index minified source structure.
- **Exposure**: Maps reveal original source layout. For sensitive logic, restrict access or disable for specific routes.

### Verification

After deploy: DevTools → Network → filter "JS" → open a chunk in Sources. A `.map` request should appear when you view the file.

---

## 2. Bundle Analysis (`next experimental-analyze`)

**Scripts**: `npm run analyze` (interactive) | `npm run analyze:output` (disk) | `npm run budget` (CI gate)

Next.js 16.1+ built-in analyzer. No `@next/bundle-analyzer` needed.

### Interactive Mode

```bash
npm run analyze
```

- Server at `http://localhost:4000`
- Requires prior `npm run build`
- **Features**: Client/server split, import chain tracing, route filter, treemap by size

### Output Mode (CI / Sharing)

```bash
npm run analyze:output
```

- Writes to `.next/diagnostics/analyze/`
- CI uploads as artifact on PRs (see `.github/workflows/ci.yml`)

### Bundle Size Budget

```bash
npm run budget
```

- Runs after build. Fails if:
  - Total client chunks > 22 MB (uncompressed)
  - Any single chunk > 850 KB
- Thresholds in `scripts/bundle-size-budget.mjs`
- CI runs this automatically; adjust budgets as the app evolves

### Workflow

1. **Before optimization**: `analyze:output`, save for comparison.
2. **After changes**: Run again, compare treemaps.
3. **Targets**: Large modules, duplicate deps, heavy libs that could be dynamic-imported or tree-shaken.

---

## 3. CI Integration

The main CI workflow (`.github/workflows/ci.yml`) runs:

1. Lint, typecheck, validate, test
2. Build
3. **Bundle size budget** — fails if over thresholds
4. **Analyze** — `analyze:output`
5. **Upload artifact** — PRs get `bundle-analysis-{sha}` artifact

Download the artifact and open `index.html` to inspect bundle composition for any PR.

---

## 4. Performance Rules Reference

See `.agents/rules/performance.md`:

- Frame budget (60fps, ~10ms JS per frame)
- Compositor-only animation (`transform`, `opacity`)
- Bundle discipline (dynamic imports, no barrels)
- Memory (Three.js disposal, listener cleanup)
- Dev metrics (ExperimentDevMetrics, R3F metrics, `?debug`)

---

## 5. Ongoing Monitoring

| Tool | Purpose |
|------|---------|
| **Vercel Speed Insights** | Real-user LCP, FCP, CLS, INP, TTFB |
| **Vercel Analytics** | Page views, referrers |
| **`?debug`** | Per-experiment metrics in production |
| **`npm run analyze:output`** | Bundle snapshots after major changes |
| **`npm run budget`** | Pre-commit or CI bundle gate |

---

## 6. Quick Commands

```bash
npm run build            # Required before analyze/budget
npm run analyze          # Interactive (localhost:4000)
npm run analyze:output   # Write to .next/diagnostics/analyze/
npm run budget           # Fail if over bundle size thresholds
npm run lighthouse       # Single run, opens report
npm run lighthouse:mobile  # Mobile preset, .lighthouse-mobile.html
npm run lighthouse:desktop # Desktop preset, .lighthouse-desktop.html
```

---

## 6a. Chrome DevTools MCP (Lighthouse + performance traces)

When using the **Chrome DevTools MCP** server:

1. **Lighthouse (a11y, SEO, best practices)** — does *not* include Performance; use for Accessibility, Best Practices, SEO:
   - `navigate_page` to the target URL (e.g. production or localhost).
   - `lighthouse_audit` with `device: "desktop"` or `device: "mobile"`, `mode: "navigation"`. Optionally set `outputDirPath` to a workspace path (e.g. `.next/lighthouse-reports`) to read `report.json` and get failed audit IDs.
2. **Performance (CWV, long tasks)** — use **performance traces**:
   - `navigate_page` to the URL, then `performance_start_trace` with `reload: true`, `autoStop: true`. Optionally pass `filePath` to save the trace (e.g. `.next/trace.json`) for later analysis in DevTools.
   - For throttled mobile: use `emulate` with `viewport` (e.g. `390x844x2,mobile,touch`), `cpuThrottlingRate: 4`, `networkConditions: "Slow 4G"` before starting the trace.
3. **Drill into trace insights**: After a trace, the tool returns **insight set IDs** (e.g. `NAVIGATION_0`). Use `performance_analyze_insight` with `insightSetId` and `insightName` (e.g. `RenderBlocking`, `LCPBreakdown`, `ThirdParties`, `LCPDiscovery`) to get detailed, actionable summaries.
4. **Analyze with source maps**: Open the saved trace in Chrome DevTools (Performance → Load profile). With `productionBrowserSourceMaps: true`, production serves source maps; DevTools maps minified frames to original source for long-task and script attribution.

---

## 7. PR Checklist (Performance)

Before merging performance-sensitive changes:

- [ ] `npm run budget` passes
- [ ] `npm run analyze` — no new large modules on critical paths
- [ ] LCP target < 2.5s (check Lighthouse on preview)
- [ ] No new barrel imports or static heavy deps on homepage
- [ ] **Lighthouse 100**: Run `npm run lighthouse:mobile` and `npm run lighthouse:desktop` (or Chrome DevTools MCP audits) and confirm Performance, Accessibility, Best Practices, SEO all 100 on both; document exceptions if any.

---

## 8. Performance Metrics

See `docs/performance-metrics.md` for before/after Lighthouse metrics. Run `npm run lighthouse` (or `npm run lighthouse:mobile` / `npm run lighthouse:desktop`) after merge to capture post-deploy numbers.

---

## 8a. Performance Traces and Source Maps

**Goal**: Reproduce throttled mobile/desktop load, find long tasks and bottlenecks, and attribute them to source files.

**Workflow**:

1. **Capture a trace**: Use Chrome DevTools MCP (`performance_start_trace`) or DevTools Performance tab: navigate to the page (optionally with CPU/network throttling and mobile viewport), record, stop. Save the trace to a file (e.g. `.next/trace-mobile.json`).
2. **Analyze with source maps**: Open the trace in Chrome DevTools (Performance → Load profile). With `productionBrowserSourceMaps: true`, production serves `.map` files; DevTools maps minified call frames to original source (file:line). Identify long tasks (> 50 ms), layout/paint cost, and heavy scripts.
3. **Act**: Defer or split heavy scripts, reduce main-thread work on the above-the-fold path. Re-run traces after changes.

Third-party scripts must stay deferred or lazy-loaded so they do not run before LCP; see `DeferredVercelAnalytics` and Umami `strategy="lazyOnload"`.

---

## 9. Render-Blocking CSS and inlineCss

**Config**: `experimental.inlineCss: true` in `next.config.ts`

Next.js inlines CSS into the HTML instead of separate stylesheet requests, removing the usual render-blocking `<link rel="stylesheet">` chain. This improves FCP and LCP, especially on slow connections.

**Trade-off**: Inlined styles are not cached separately; each HTML response includes the CSS. With Tailwind (atomic CSS), bundle size per page is manageable. If you disable `inlineCss`, consider critical-CSS extraction (e.g. critters) compatible with App Router and document the choice.

---

## 10. Implemented Optimizations

| Item | Status |
|------|--------|
| Source maps | Enabled, noindex on .map |
| Defer Analytics/SpeedInsights | `DeferredVercelAnalytics` |
| Preconnect Vercel | `vitals.vercel-insights.com` |
| Constants audit | SWIPE_GESTURE_ICON → static PNG |
| optimizePackageImports | motion, framer-motion, lucide, etc. |
| Browserslist | Modern-only (not dead, not ie 11) |
| Font loading | `display: 'swap'` on local fonts |
| Bundle budget | CI gate in `scripts/bundle-size-budget.mjs` |
| inlineCss | Enabled to eliminate render-blocking CSS |
