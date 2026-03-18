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
| **Sentry** | Errors, tracing, profiling, replay-on-error (env-gated; see below) |
| **`?debug`** | Per-experiment metrics in production |
| **`npm run analyze:output`** | Bundle snapshots after major changes |
| **`npm run budget`** | Pre-commit or CI bundle gate |

### Sentry (error and performance monitoring)

Sentry is **optional** and env-gated: when no DSN is set, no Sentry code runs (graceful degradation).

**Full implementation (recommended for production):** set all of the following in Vercel (and optionally in `.env.local` / `.env.sentry-build-plugin` for local builds):

| Variable | Purpose | Where to set |
|----------|---------|--------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Client (browser) DSN; enables error reporting in the app. | Vercel → Environment Variables (all envs). Safe to expose. |
| `SENTRY_DSN` | Server/edge DSN; used for Node and Edge runtimes (falls back to `NEXT_PUBLIC_SENTRY_DSN` if unset). Prefer setting this so the client DSN is not the only source. | Vercel, **Sensitive** recommended. |
| `SENTRY_AUTH_TOKEN` | Source map upload at build time. Create at [sentry.io/settings/auth-tokens/](https://sentry.io/settings/auth-tokens/) with `project:releases` and `org:read`. | Vercel, **Sensitive**. Locally: `.env.sentry-build-plugin` (gitignored). |
| `SENTRY_ORG` | Sentry organization slug (required for source map upload). | Vercel or CI. |
| `SENTRY_PROJECT` | Sentry project slug (required for source map upload). | Vercel or CI. |

**Minimum:** Set `NEXT_PUBLIC_SENTRY_DSN` (or `SENTRY_DSN` for server-only) to enable error reporting. Add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` for readable stack traces via source map upload.

**Features:** Error monitoring (all runtimes), tracing (10% sample in prod), profiling (10% in prod, client), session replay only when an error occurs (replaysOnErrorSampleRate: 1.0). Logs are disabled. Tunnel route `/monitoring` bypasses ad-blockers. Source maps are uploaded on `next build` when `SENTRY_AUTH_TOKEN` is set. See [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/).

**Verification:** After deploy, open `/dev` (preview or dev only) and use **Send test to Sentry** or **Throw test error**. In production, visit any page with **`?sentry_test=prod-verify`** (e.g. `https://www.razisyed.cv/?sentry_test=prod-verify`); one test event is sent and the param is removed from the URL. Confirm the event in [Sentry Issues](https://sentry.io/issues/) within ~30s.

**No data in Sentry?**

1. **Redeploy after adding env vars** — `NEXT_PUBLIC_SENTRY_DSN` is inlined at **build time**. If you added it in Vercel after the last deploy, trigger a new deployment (e.g. push a commit or use Vercel’s “Redeploy”) so the client bundle is built with the DSN.
2. **Check build env** — In Vercel, ensure `NEXT_PUBLIC_SENTRY_DSN` is set for the environment that runs the build (e.g. Preview and Production).
3. **Enable debug** — In development, the client init sets `debug: true`; open the browser console to see Sentry SDK logs (e.g. “Sentry SDK not sending because DSN is undefined”).
4. **Ad-blockers** — Use the tunnel: we set `tunnelRoute: "/monitoring"` so events go through your origin; disable ad-blockers for your site if you still see no events.
5. **Sentry quota** — Check [Stats](https://sentry.io/orgredirect/organizations/:orgslug/stats/) and billing in case quota is exceeded.

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
