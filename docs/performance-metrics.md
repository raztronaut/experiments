# Performance Metrics — Before / After

Baseline and comparison for the page performance overhaul (PR #17).

---

## Before (Production — March 2026)

**Source**: Lighthouse audit on https://www.razisyed.cv (pre-PR #17)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Performance Score** | 74 | 90+ | Needs improvement |
| **FCP** (First Contentful Paint) | 1.2s | <1.8s | Good |
| **LCP** (Largest Contentful Paint) | 3.5s | <2.5s | Needs improvement |
| **TBT** (Total Blocking Time) | 680ms | <200ms | Needs improvement |
| **CLS** (Cumulative Layout Shift) | 0 | <0.1 | Excellent |
| **Speed Index** | 2.4s | <3.4s | Good |

**Bundle (from analyzer, pre-PR)**:
- Total client chunks: ~19.5 MB (uncompressed)
- Largest chunk: ~764 KB
- Notable: SWIPE_GESTURE_ICON_DATA 22 KB in JS (now extracted to static PNG)

**Bundle (post-PR, from `npm run budget`)**:
- Total client chunks: 18,573 KB (uncompressed) — **~939 KB reduction**
- Largest chunk: 762 KB
- Constants extraction, framer-motion optimizePackageImports, browserslist

---

## After (Post-merge)

**To capture**: Run Lighthouse on production after PR #17 is merged and deployed.

```bash
npm run lighthouse  # Outputs .lighthouse-report.html and opens in browser
```

Or use Chrome DevTools → Lighthouse → Performance → Run.

**Measured (bundle)**:
- ~900 KB total client JS reduction (19.5 MB → 18.6 MB)
- SWIPE_GESTURE_ICON: 22 KB moved from JS to static PNG

**Expected (Lighthouse, once deployed)**:
- **TBT**: Deferred analytics → less main-thread blocking
- **LCP**: JeskoJetsSection next/image (AVIF/WebP) on announcing-v2 route

---

## Delta (to fill after merge)

| Metric | Before | After | Δ |
|--------|--------|------|---|
| Performance | 74 | — | — |
| FCP | 1.2s | — | — |
| LCP | 3.5s | — | — |
| TBT | 680ms | — | — |
| CLS | 0 | — | — |
| Speed Index | 2.4s | — | — |

**How to update**: After merge, run `npm run lighthouse`, then paste the metrics into the After column and compute Δ.
