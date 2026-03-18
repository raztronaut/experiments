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
| **Sentry** | Error monitoring + tracing + replay-on-error (env-gated; see below) |
| **`?debug`** | Per-experiment metrics in production |
| **`npm run analyze:output`** | Bundle snapshots after major changes |
| **`npm run budget`** | Pre-commit or CI bundle gate |

### Sentry (error and performance monitoring)

Sentry is **optional** and env-gated: when `NEXT_PUBLIC_SENTRY_DSN` is not set, no Sentry code runs (graceful degradation).

**Environment variables:**

- `NEXT_PUBLIC_SENTRY_DSN` — Enables client, server, and edge Sentry. Set in Vercel and optionally in `.env.local` for local testing.
- `SENTRY_DSN` — Optional; used for server/edge when set (falls back to `NEXT_PUBLIC_SENTRY_DSN` if unset).
- `SENTRY_AUTH_TOKEN` — For source map upload at build time. Create at [sentry.io/settings/auth-tokens/](https://sentry.io/settings/auth-tokens/) with `project:releases` and `org:read`. Set in Vercel (and optionally in `.env.sentry-build-plugin` locally; that file is gitignored).
- `SENTRY_ORG`, `SENTRY_PROJECT` — Optional; required for source map upload when using the build plugin. Set in Vercel or CI.

**Features:** Error monitoring (all runtimes), tracing (10% sample in prod), session replay only when an error occurs (replaysOnErrorSampleRate: 1.0). Tunnel route `/monitoring` bypasses ad-blockers. Source maps are uploaded on `next build` when `SENTRY_AUTH_TOKEN` is set. See [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/).

**Verification:** After deploy, trigger a test error (e.g. throw in a server action or API route), confirm the event appears in [Sentry Issues](https://sentry.io/issues/) with a readable stack trace within ~30s, then remove the test.

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

## 8. Performance Metrics

See `docs/performance-metrics.md` for before/after Lighthouse metrics. Run `npm run lighthouse` after merge to capture post-deploy numbers.

---

## 9. Implemented Optimizations

| Item | Status |
|------|--------|
| Source maps | Enabled, noindex on .map |
| Defer Analytics/SpeedInsights | `DeferredVercelAnalytics` |
| Preconnect Vercel | `vitals.vercel-insights.com` |
| Sentry (optional) | Env-gated; errors + tracing + replay-on-error; tunnel `/monitoring`; preconnect `o0.ingest.sentry.io` |
| Constants audit | SWIPE_GESTURE_ICON → static PNG |
| optimizePackageImports | motion, framer-motion, lucide, etc. |
| Browserslist | Modern-only (not dead, not ie 11) |
| Font loading | `display: 'swap'` on local fonts |
| Bundle budget | CI gate in `scripts/bundle-size-budget.mjs` |
