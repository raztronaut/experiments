# Defensive Programming Report

_Read-only audit of error-hiding `try/catch`, silent `.catch()`, and fallback (`??` / `||`) patterns across `src/`. No source files were modified._

## Critical Assessment

This codebase is unusually disciplined about defensive code. Almost every `try/catch` wraps a genuine failure boundary: Node `fs` reads at build/render time, `fetch` to external APIs, `JSON.parse` of on-disk/remote JSON, `localStorage` access, Web Audio node creation, dynamic `import()` of dev-only GSAP plugins, browser feature detection, and `next/og` `ImageResponse` generation. These are exactly the places where throwing untrusted/environmental code should be contained.

Key observations:

- **No fabricated-success fallbacks.** I found no `try/catch` that returns a fake "good" value to mask a real failure. Fallbacks return honest empties (`[]`, `null`) or environment defaults (`"public"`, `"C"`, `"wip"`).
- **Good framework hygiene.** `src/app/api/experiments/route.ts` calls `unstable_rethrow(error)` before its 500 response, so Next.js control-flow errors (redirect/notFound) are not swallowed. This is the correct pattern and should be the model for other route handlers.
- **A reporting helper exists but is barely used outside boundaries.** `src/lib/sentry.ts` exposes `captureExperimentError` (env-gated, no-op without DSN). Several legitimate-but-silent catches in shared/runtime code could route through it without changing user-facing behavior.
- **Minor inconsistency, not a bug.** `usePreferences.ts` logs one `localStorage` failure via `console.error` but silently swallows two others. Harmless, but inconsistent.
- **The one true smell is in a legacy experiment.** `cursor-depth-explorer` wraps a pure `typeof` feature-detection block in `try/catch "for safety"` — `typeof` cannot throw, so the guard hides nothing and can only mask a future real bug introduced inside the block.

Counts: **~34 `try/catch` blocks**, **~9 silent `.catch(() => {})`** promise swallows, **2 inline-`<script>` string try/catch** (anti-FOUC / iframe detection — not real call sites). Recommend remove/simplify: **2 (all Low confidence)**. Keep: **~32 `try/catch` + all 9 silent `.catch` + both inline scripts**.

Net: this is a "leave it alone, with two tiny tidy-ups" report, not a cleanup target.

## Recommendations

### Remove / simplify

**Confidence: Low** — `src/components/experiments/cursor-depth-explorer/CursorDepthExplorer.tsx:305-321`

The `try/catch` only contains `typeof (DeviceOrientationEvent as any)` checks plus a `setTimeout` that calls `setState`. `typeof` on an undefined global never throws, and the `setTimeout` callback runs later (its body is not protected by this `try` anyway). The catch therefore guards nothing real and the inline comment (`// wrapping in try-catch for safety`) is the classic error-hiding tell. Cleaner version — drop the wrapper:

```tsx
useEffect(() => {
  const doe = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<PermissionState>;
  };
  const isIOS = typeof doe?.requestPermission === "function";
  const id = setTimeout(() => {
    if (isIOS) setNeedsPermissionButton(true);
    else setHasPermission(true);
  }, 0);
  return () => clearTimeout(id);
}, []);
```

Confidence is **Low only because this is a legacy creative experiment** (per AGENTS.md, legacy experiments require asking before modifying). It is not an external-input path — removal cannot break a real failure boundary — but defer to the legacy policy.

**Confidence: Low** — `src/hooks/usePreferences.ts:38, 50` (silent `localStorage` catches)

Not error-hiding in the dangerous sense (a blocked `localStorage` genuinely should fall back to a default), but the file is internally inconsistent: line 25 logs the failure, lines 38 and 50 swallow it silently. Pick one convention. Conservative fix: keep the fallback values, but make all three consistent (either all silent, or all `console.error`). Do **not** let these throw — Safari private mode / storage-disabled browsers make `localStorage` a real untrusted boundary.

### Keep (legitimate)

All of the following guard genuinely untrusted/external/environmental input or async I/O. **Keep as-is.** Where a silent catch sits in shared runtime code, an optional, conservative enhancement is noted — none change user-facing behavior.

**Build/render-time filesystem + JSON (Node, untrusted on-disk data):**

- `src/lib/experiments.ts:171-209` (per-experiment `readFile` + `JSON.parse`, logs `console.warn`), `:187-192` (`fs.access` for article presence — expected-miss), `:258-261` (outer dir read, `console.error` + `[]`). Keep.
- `src/lib/articles.ts:56-99`, `:64-76`, `:117-119`, `:153-161` (MDX `readFile`, `gray-matter`, `experiment.json` enrichment, content load). All return honest `null`/`[]`. Keep.
- `src/app/(main)/dev/page.tsx:88-150`, `:100-105` (per-dir config parse + article `fs.access`). Keep.
- `src/app/(registry)/registry/[slug]/opengraph-image.tsx:35-45` and `src/app/experiments/llms.mdx/[...slug]/route.ts:26-34` (`readFile` + `JSON.parse`, fall back to slug / `null`). Keep.
- `src/app/api/og/route.tsx:6-18, 20-42, 48-152` (local font fetch → Google Fonts fallback → render without font; outer `ImageResponse` guard returning a 500 Response). Keep — classic graceful-degradation chain.

**Network / fetch (external I/O):**

- `src/hooks/useWeather.ts:40-57` — fetch open-meteo; correctly re-checks `AbortError` and returns, logs others. Keep. _(Optional: route the non-abort `console.error` through `captureExperimentError` so weather-API outages are visible.)_
- `src/components/registry/RegistrySourceCode.tsx:64-79` — fetch registry JSON, surfaces error into component state (`setError`). Keep — this is the right pattern (error is shown, not hidden).
- `src/components/ui/LottieWeatherIcon.tsx:127-137` — fetch Lottie asset, `console.error`. Keep.
- `src/components/mdx/PageActions.tsx:16-28` — fetch markdown, surfaces `"error"` UI state. Keep.
- `src/app/api/experiments/route.ts:8-17` — `unstable_rethrow` + 500. Keep (reference pattern).

**Browser/runtime untrusted boundaries:**

- `src/components/analytics/GlobalTracking.tsx:18-36` — `new URL(anchor.href)` can throw on malformed/`javascript:` hrefs; comment documents intent. Keep.
- `src/components/experiments/transit-airport-split-flap-display/useFlapSound.ts:90, 248-250` — Web Audio node creation/scheduling can throw (suspended context, hardware limits); `console.warn`. Keep.
- `src/components/experiments/rabbithole-chat-gallery-explore/VisualiserLogic.ts:136-154` — fetch image → fallback to `HTMLImageElement` with `crossOrigin` (real CORS fallback, not error-hiding); `:396-400` empty `catch {}` around `releasePointerCapture` (DOM throws on stale pointer id). Keep.
- `src/components/dev/ExperimentDevMetrics.tsx:41-61` (GSAP global probe), `:97-112` (`PerformanceObserver` layout-shift feature detection). Keep — feature detection.
- `src/hooks/useGSAPDebug.ts:36-57` and `src/components/dev/DebugOverlay.tsx:61-77` — dynamic `import("gsap/GSDevTools")` for dev-only tooling. Keep.

**Inline `<script>` strings (not real call sites, intentional):**

- `src/app/(main)/layout.tsx:163-167` — pre-hydration touch detection setting `data-cursor-hidden`; must not throw during head execution. Keep.
- `src/components/ui/ExperimentNav.tsx:29` — `window.self !== window.top` iframe check in injected string. Keep.

**Silent `.catch(() => {})` on fire-and-forget browser promises (all legitimate):**

These swallow `HTMLMediaElement.play()` autoplay rejections and `navigator.clipboard` rejections — both are expected, user-gesture/policy-driven rejections that must not surface as errors:

- `src/components/ui/experiments/StaticExperimentMedia.tsx:46`, `InteractivePreviewMedia.tsx:65`, `src/components/registry/RegistryCard.tsx:173`, `src/components/experiments/basketball-replay-center/ScreenPanel.tsx:207` (`video.play()`).
- `src/components/mdx/CodeBlock.tsx:21`, `src/components/mdx/HeadingLink.tsx:25` (`navigator.clipboard.writeText`).
- `src/components/dev/R3FDevTools.tsx:66, 116` (dev tooling), `src/components/ui/LocationStatusEnhancer.tsx:37`, `src/components/ui/DeferredAIWidget.tsx:34` (deferred/optional widget init).

Keep all — none of these hide internal logic errors; they absorb known-benign async rejections.

**Honest fallback defaults (`??` / `||`) — keep:**

`exp.listing ?? "public"` (`experiments.ts`), `validateEnum(...) ?? "wip"` / `?? "public"` (`dev/page.tsx`), `data.title || name` and the `publishedAt` chain in `articles.ts`, and `tempUnit` defaults in `usePreferences.ts` are all legitimate defaults for genuinely-optional metadata, not papering over values that "should always exist."
