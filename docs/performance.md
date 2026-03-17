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
npm run build          # Required before analyze/budget
npm run analyze        # Interactive (localhost:4000)
npm run analyze:output # Write to .next/diagnostics/analyze/
npm run budget         # Fail if over bundle size thresholds
```

---

## 7. PR Checklist (Performance)

Before merging performance-sensitive changes:

- [ ] `npm run budget` passes
- [ ] `npm run analyze` — no new large modules on critical paths
- [ ] LCP target < 2.5s (check Lighthouse on preview)
- [ ] No new barrel imports or static heavy deps on homepage

---

## 8. Implemented Optimizations

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
