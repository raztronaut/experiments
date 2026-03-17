# Performance and Bundle Analysis

Reference for production performance tooling: source maps, bundle analysis, and ongoing optimization workflows.

---

## 1. Production Browser Source Maps

**Config**: `productionBrowserSourceMaps: true` in `next.config.ts`

### What It Does

Next.js emits `.map` files alongside production JS chunks. Browsers and error-reporting services can map minified stack traces back to original source files.

### How to Use

| Use Case | How |
|----------|-----|
| **Chrome DevTools** | Open DevTools → Sources tab. Minified files show "original source" links. Click to see TypeScript/JSX. |
| **Error reporting** | Services like Sentry, LogRocket, or Vercel's built-in error overlay can symbolicate production errors when source maps are available. |
| **Performance profiling** | DevTools Performance tab shows readable function names and file paths instead of `chunk-abc123.js:1:2345`. |

### Security Note

Source maps are served from `/_next/static/chunks/*.map`. They expose your original source structure. If you have sensitive logic, consider restricting map access (e.g. via Vercel's `x-robots-tag: noindex` or auth) or disabling for specific routes. For a public portfolio, the trade-off is usually acceptable for better debugging.

### Verification

After deploy, open any production page, DevTools → Network, filter by "JS". Find a chunk (e.g. `dabbe1938f49ee34.js`). A corresponding `dabbe1938f49ee34.js.map` should be requested when you open that file in the Sources tab.

---

## 2. Bundle Analysis (`next experimental-analyze`)

**Script**: `npm run analyze` (interactive) | `npm run analyze:output` (write to disk)

Next.js 16.1+ includes a built-in bundle analyzer. No `@next/bundle-analyzer` package needed.

### Interactive Mode

```bash
npm run analyze
```

- Starts a local server at `http://localhost:4000`
- Requires a prior `npm run build` (analyzes `.next/` output)
- **Features**:
  - Separate client vs server bundle views
  - Import chain tracing (why a module is included)
  - Filter by route, environment, file type
  - Treemap: module size = rectangle area

### Output Mode (CI / Sharing)

```bash
npm run analyze:output
```

- Writes static files to `.next/diagnostics/analyze/`
- Use for: CI artifact upload, PR comparisons, historical tracking
- Output includes `index.html` (viewable in browser) and `.txt` summaries

### Workflow

1. **Before optimization**: Run `analyze:output`, save or commit the output path for comparison.
2. **After changes**: Run again, diff or compare treemaps.
3. **Targets**: Look for large single modules, duplicate dependencies, heavy libraries that could be dynamic-imported or tree-shaken.

### Example Findings

From real optimizations:

- **optimizePackageImports**: Lucide, Motion, Leva, Three.js, R3F, Drei, etc. are in `next.config.ts`. Verify tree-shaking in the treemap.
- **Dynamic imports**: Heavy deps (GSAP, Three.js, R3F) should appear in lazy chunks, not the main page bundle.
- **Barrel imports**: Can pull in entire packages. Prefer direct file imports.

---

## 3. Performance Rules Reference

See `.agents/rules/performance.md` for:

- Frame budget (60fps, ~10ms JS per frame)
- Compositor-only animation (`transform`, `opacity`)
- Bundle discipline (dynamic imports, no barrels)
- Memory (Three.js disposal, listener cleanup)
- Dev metrics (ExperimentDevMetrics, R3F metrics, `?debug`)

---

## 4. Ongoing Monitoring

| Tool | Purpose |
|------|---------|
| **Vercel Speed Insights** | Real-user LCP, FCP, CLS, INP, TTFB. Visible in Vercel dashboard. |
| **Vercel Analytics** | Page views, referrers. |
| **`?debug`** | Per-experiment dev metrics (FPS, heap, CLS) in production. Append to any experiment URL. |
| **`npm run analyze:output`** | Bundle size snapshots. Run after major dependency or layout changes. |

---

## 5. CI / PR Workflow

To track bundle size over time or compare before/after a change:

```bash
npm run build && npm run analyze:output
```

The output at `.next/diagnostics/analyze/` can be:
- **Uploaded as a CI artifact** (e.g. GitHub Actions `actions/upload-artifact`)
- **Compared** by opening `index.html` from two builds side-by-side
- **Archived** for historical reference (e.g. before major dependency upgrades)

Example GitHub Actions step:

```yaml
- run: npm run build && npm run analyze:output
- uses: actions/upload-artifact@v4
  with:
    name: bundle-analysis
    path: .next/diagnostics/analyze/
```

---

## 6. Quick Commands

```bash
npm run build          # Required before analyze
npm run analyze        # Interactive bundle analyzer (localhost:4000)
npm run analyze:output # Write analysis to .next/diagnostics/analyze/
```

---

## 7. Further Improvements to Consider

| Improvement | Effort | Impact | Notes |
|-------------|--------|--------|-------|
| **Defer Analytics** | Low | Low | Wrap `@vercel/analytics` and `@vercel/speed-insights` in a client component that loads after hydration. Risk: hydration mismatch if not done carefully. |
| **Preconnect Vercel** | Low | Low | Add `<link rel="preconnect" href="https://vitals.vercel-insights.com" />` if Speed Insights is a major early request. |
| **Route-level code splitting** | Medium | Medium | Ensure experiment routes use `dynamic()` for heavy components (R3F, GSAP). Already in place for most experiments. |
| **Image optimization** | Low | Medium | `next/image` with AVIF/WebP is configured. Verify `sizes` prop on responsive images. |
| **Font loading** | Done | — | `display: 'swap'` on local fonts per S-Tier plan. |
