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

## After (Production — March 2026)

**Source**: Lighthouse on https://www.razisyed.cv (PR #17 merged)

| Metric | Before | After | Δ |
|--------|--------|------|---|
| **Performance** | 74 | **97** | **+23 (+31%)** |
| **FCP** | 1.2s | **1.0s** | −0.2s (−17%) |
| **LCP** | 3.5s | **2.4s** | **−1.1s (−31%)** |
| **TBT** | 680ms | **100ms** | **−580ms (−85%)** |
| **CLS** | 0 | 0 | — |
| **Speed Index** | 2.4s | 2.5s | +0.1s |

All Core Web Vitals now passing. LCP improved on production (real video posters) vs. preview (placeholders).

**Bundle**:
- ~939 KB total client JS reduction (19.5 MB → 18.6 MB)
- SWIPE_GESTURE_ICON: 22 KB moved from JS to static PNG

---

## Re-capture after changes

```bash
npm run lighthouse  # Outputs .lighthouse-report.html and opens in browser
```
