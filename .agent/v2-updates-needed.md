# V2 Platform -- Updates Needed

> Tracking doc for issues found during the kinetic-typography-scroll experiment build and improvement sessions.
> Source conversations: [V2 experiment creation](7bf74b2d), [V2 experiment polish](fab069f4), V2 experiment improvement (current session).

---

## 1. Agent Doc Inaccuracies

### 1A. `toolkit.md` -- DevToolsInjector description is wrong (line 37)

**Current text:**
> `DevToolsInjector` -- Auto-injected in all experiment layouts. Loads `ExperimentDevMetrics` + `DebugOverlay` in dev mode. **Tree-shakes to nothing in production.**

**Problem:** `DevToolsInjector` now accepts a `production` prop (added in the improvement session). When `production={true}`, it dynamically imports debug components even in production builds. The text should document this escape hatch -- it's the same pattern `useDevControls` uses.

**Same issue on line 40 for `R3FDevToolsInjector`:** The text implies R3F dev tools are only gated behind `?debug`, but they were actually gated behind `NODE_ENV === "development"` first, then `?debug` second. Now `production={true}` bypasses the NODE_ENV gate.

**Fix:** Update lines 37 and 40 to note the `production` prop and that showcase experiments (like kinetic-typography-scroll) use it.

### 1B. `toolkit.md` -- Stale Lenis + GSAP integration pattern (line 19)

**Current text:**
> **Lenis + GSAP**: Set `autoRaf: false` on Lenis, drive from GSAP ticker. See `skills/lenis-scroll.md`.

**Problem:** This describes the old pattern. The V2 way is `createUnifiedScroll()` which drives Lenis from Tempus (priority -1), not the GSAP ticker. The `createUnifiedScroll` section below (line 26) describes this correctly, but line 19 contradicts it.

**Fix:** Update line 19 to reference `createUnifiedScroll()` as the canonical pattern, note the old GSAP ticker approach is superseded.

### 1C. `toolkit.md` -- Missing context7 from MCP tools list (line 48-51)

**Problem:** Lists pinchtab, Browser DevTools MCP, and mcp-three, but omits **context7** which is available and useful for looking up library documentation (GSAP, Lenis, Drei, etc.) before writing code.

**Fix:** Add context7 entry with `resolve-library-id` + `query-docs` tools.

### 1D. `architecture.md` -- Repeats DevToolsInjector misconception (line 28)

**Current text:**
> In dev mode, `DevToolsInjector` auto-injects `ExperimentDevMetrics`...

**Problem:** Same issue as 1A. Should note the `production` prop escape hatch.

**Fix:** Add note about `production` prop.

### 1E. `visual-qa.md` + `skills/visual-qa.md` -- No mention of Lenis scroll problem

**Problem:** Both docs suggest `pinchtab scroll down` for scrolling through experiments, but Lenis intercepts programmatic scroll and breaks scroll-driven GSAP animations. The previous two sessions spent significant time failing to scroll via MCP tools before discovering the workaround.

**Fix:** Add a "Known Limitation: Lenis Scroll Interception" section documenting:
- `pinchtab_scroll` and `interaction_scroll` don't work reliably with Lenis
- Workaround: use `run_js-in-browser` / `pinchtab_eval` calling `lenis.scrollTo(target, { immediate: true })`
- Experiments using `createUnifiedScroll` should expose `window.__scrollToSection` behind `?debug`

### 1F. `visual-qa.md` + `skills/visual-qa.md` -- Claim metrics are "auto-injected in all layouts"

**Problem:** `ExperimentDevMetrics` is only loaded when `NODE_ENV === "development"` (unless `production` prop is used). Console metrics and `window.__experimentMetrics` are completely absent in production builds. The docs should clarify this.

**Fix:** Add note: "In production, DevToolsInjector tree-shakes to nothing unless `production` prop is passed."

### 1G. `STATUS.md` -- Doesn't note kinetic-typography-scroll is WIP

**Current text (line 20):**
> 1 V2 experiment (`kinetic-typography-scroll`) -- first real experiment built on the V2 stack

**Problem:** Doesn't mention `status: "wip"`. Since generation scripts skip WIP experiments, this is relevant context.

**Fix:** Add "(status: wip)" after the experiment name.

---

## 2. Plop Template Issues

### 2A. Scrollytelling template uses `useControls` directly, not `useDevControls`

**File:** `plop-templates/experiment/profiles/scrollytelling/component.tsx.hbs` line 14

**Current:**
```hbs
{{#if includeLeva}}
import { useControls } from "leva";
{{/if}}
```

**Problem:** Imports from `leva` directly instead of the project's `useDevControls` wrapper. Consequences:
- No dead-code elimination in production (leva always bundled ~40KB)
- No `{ production: true }` option for showcase experiments
- Test mocking needs `vi.mock("leva")` instead of `vi.mock("@/hooks/useDevControls")`

**Fix:** Change to `import { useDevControls } from "@/hooks/useDevControls"` and update the `useControls` call to `useDevControls("Scroll", schema)`.

### 2B. Route layout template has no font variables

**File:** `plop-templates/experiment/route-layout.tsx.hbs` line 38

**Current:**
```hbs
<body>
```

**Problem:** Experiments have isolated `<html>`/`<body>` and don't inherit fonts from the main app. kinetic-typography-scroll had to manually add `replica` and `testDieGrotesk` font imports to its layout. Other experiments needing custom fonts face the same gap.

**Fix:** Either include common font imports in the template, or add a comment documenting that experiments needing display fonts must import them in their layout. Consider adding a `--includeFonts` plop flag.

### 2C. Scrollytelling template `useGSAP` has no `dependencies` array

**File:** `plop-templates/experiment/profiles/scrollytelling/component.tsx.hbs` line 90

**Current:**
```hbs
  }, { scope: containerRef });
```

**Problem:** When `includeLeva` is true, the `scrub` value from `useControls` is used inside `useGSAP` but not listed in `dependencies`. Changing the scrub slider in leva won't re-run the GSAP setup. The kinetic-typography-scroll experiment correctly has `dependencies: [effectiveScrub, stagger, ...]`.

**Fix:** Add `dependencies: [scrub]` when leva is included.

---

## 3. Platform-Level Gaps (Discovered During This Work)

### 4A. No automated way to verify Lenis-based scroll experiments via MCP

Every Lenis experiment will face the same MCP scroll problem. The `window.__scrollToSection` helper was added ad-hoc to kinetic-typography-scroll. This should be a standard pattern in the scroll toolkit or documented in the visual-qa workflow.

**Suggested:** Add `window.__scrollHelpers` to `createUnifiedScroll()` itself (behind `?debug` check) rather than requiring each experiment to wire it up manually.

### 4B. `useDevControls` has `{ production: true }` but injectors didn't match

This was fixed in this session, but the mismatch existed since the S-Tier Performance Overhaul created `useDevControls`. The lesson: when creating an escape-hatch pattern, ensure all related components share the same mechanism.

### 4C. R3F Environment preset requires CDN

Drei's `<Environment preset="night" />` loads HDRI assets from GitHub CDN at runtime. The docs note this is not recommended for production. If the experiment ships to production, these should be self-hosted in `public/experiments/kinetic-typography-scroll/`.
