---
name: Page Performance Improvements
overview: Plan derived from bundle analyzer and Lighthouse findings for razisyed.cv. Targets LCP (3.5s→<2.5s), TBT (680ms→<200ms), and render blocking (300ms). Based on experimental-analyze and production site inspection.
todos:
  - id: preconnect-vercel
    content: Add preconnect for vitals.vercel-insights.com in main layout
    status: completed
  - id: defer-analytics
    content: Defer Vercel Analytics and SpeedInsights until after hydration
    status: completed
  - id: lottie-verify
    content: Verify Lottie stays deferred (LocationStatusEnhancer + dynamic import)
    status: completed
  - id: 404-three-verify
    content: 404 page Three.js is intentional (creative 404 experiment) - no change
    status: completed
  - id: image-audit
    content: Audit plain <img> in experiments (announcing-v2, collected) for next/image
    status: pending
  - id: constants-audit
    content: Investigate 33KB constants.ts in analyzer (may be structured-data or other)
    status: completed
isProject: false
---

# Page Performance Improvements Plan

## Source

Findings from:
- **Bundle analyzer** (`npm run analyze`) — route-level module composition
- **Lighthouse** on https://razisyed.cv — Core Web Vitals
- **Network tab** — load sequence, blocking resources

---

## Current Metrics (Lighthouse)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Performance | 74 | 90+ | Needs improvement |
| FCP | 1.2s | <1.8s | Good |
| LCP | 3.5s | <2.5s | Needs improvement |
| TBT | 680ms | <200ms | Needs improvement |
| CLS | 0 | <0.1 | Excellent |
| Speed Index | 2.4s | <3.4s | Good |

---

## Bundle Composition (Homepage Route)

| Module | Compressed | Notes |
|--------|------------|-------|
| three.core.js | ~193 KB | R3F/experiments — not on homepage initial load |
| three.module.js | ~153 KB | Same |
| lottie.js | ~75 KB | Deferred via LocationStatusEnhancer + dynamic |
| gsap-core.js | ~39 KB | Cursor, waves, experiments |
| react-reconciler | ~33 KB | R3F dependency |
| motion-dom | ~100 KB | LocationStatus, UI animations |

**Key insight**: Lottie and LocationStatus load on `requestIdleCallback` (LocationStatusEnhancer). Three.js loads only on 404 page (intentional) and experiment routes. Homepage critical path is: React, Motion, GSAP (cursor/waves), Next.js runtime.

---

## Lighthouse Insights

1. **Render blocking** — 300ms savings potential
2. **Duplicated JavaScript** — 30 KB (node_modules/next, framer-motion across chunks)
3. **Legacy JavaScript** — 14 KB (polyfills)
4. **Image delivery** — 44 KB (some plain `<img>` in experiments/collected)

---

## Implemented

### 1. Preconnect for Vercel ✓
Added `<link rel="preconnect" href="https://vitals.vercel-insights.com" />` to main and registry layouts.

### 2. Defer Analytics/SpeedInsights ✓
Created `DeferredVercelAnalytics` — loads Analytics and SpeedInsights after mount via dynamic import + `useEffect`. Reduces TBT by deferring non-critical script execution.

### 3. Lottie / LocationStatus (verified)
- LocationStatusEnhancer uses `requestIdleCallback` (1.5s timeout) to load LocationStatus
- LottieWeatherIcon uses `dynamic(() => import("lottie-react"), { ssr: false })`
- Lottie is double-deferred — not on critical path

### 4. 404 Page (verified)
- not-found.tsx uses dynamic import for 404NotFound (3D experiment)
- Three.js loads only when 404 is shown — intentional design

---

## Completed (Round 2)

### Constants audit ✓
- **Root cause**: `SWIPE_GESTURE_ICON_DATA` — 22 KB base64 PNG in `src/components/ui/experiments/constants.ts`
- **Fix**: Extracted to `public/swipe-gesture-icon.png`, updated `MobileSwipeTutorialOverlay` to use URL. Removes ~22 KB from JS bundle.

### Duplicated JS ✓
- Added `framer-motion` to `optimizePackageImports` (motion is built on framer-motion; both may appear in chunks).

### Legacy JS ✓
- Updated browserslist: added `"not dead"` and `"not ie 11"` for explicit modern-only targeting.

---

## S-Tier Completeness (Round 3)

### Source maps ✓
- `X-Robots-Tag: noindex, nofollow` on `/_next/static/chunks/*.map`
- Error monitoring integration documented in `docs/performance.md`

### CI integration ✓
- Bundle size budget: `npm run budget` (fails if total > 22 MB or single > 850 KB)
- Analyze output uploaded as PR artifact
- PR template includes budget checkbox

### Documentation ✓
- `docs/performance.md` — Error monitoring, bundle budget, CI, PR checklist
- Single source of truth for performance tooling

---

### Image audit (partial) ✓
- JeskoJetsSection: sky.jpg, window.png → next/image with fill

---

## Deferred / Future

| Item | Effort | Impact | Notes |
|------|--------|--------|-------|
| Image audit (remaining) | Medium | ~40 KB | announcing-v2 PreloaderSection/ShowcaseSection, collected components |
| GSAP route-split | Medium | 39 KB | Load GSAP only on scroll/animation routes — complex |

---

## Reference

- `docs/performance.md` — Source maps, analyzer, budget, CI, error monitoring
- `.agents/rules/performance.md` — Frame budget, bundle discipline
