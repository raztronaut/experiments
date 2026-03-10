---
name: V2 Platform Activation
overview: Turn the V2 platform from a well-documented blueprint into a working system by fixing genuine blockers, closing the feedback loop, and proving it through real use. Informed by exhaustive investigation of all 57 prior transcripts and 25 plan files.
todos:
  - id: phase-0-validate
    content: Run Test 6.2 validation pipeline (validate:experiments, typecheck, lint, vitest, build). Add wip filter to generation scripts.
    status: completed
  - id: phase-1a-scaffolding
    content: Create scripts/create-experiment.mjs with named CLI flags calling Plop Node API. Add --yes flag to delete-experiment.mjs.
    status: completed
  - id: phase-1b-destroy-bug
    content: "Fix createUnifiedScroll destroy() in scroll.ts: restore GSAP ticker, call gsapTempusDispose(), reset gsapTakenOver"
    status: completed
  - id: phase-1c-autoraf
    content: "Fix scrollytelling template toolkit=N path: autoRaf:false + gsap.ticker Lenis wiring"
    status: completed
  - id: phase-1d-deprecated
    content: Remove createLenisScroll and destroyLenisScroll from scroll.ts and index.ts
    status: completed
  - id: phase-2a-queryable-metrics
    content: Add window.__experimentMetrics global + console.warn upgrade + document eval pattern for MCPs
    status: completed
  - id: phase-2b-exhaustive-deps
    content: Enable useExhaustiveDependencies in biome.jsonc, auto-suppress existing violations, fix Cursor.tsx getCursorColor bug
    status: completed
  - id: phase-3a-first-experiment
    content: Build first real V2 experiment using full stack (scrollytelling profile recommended)
    status: completed
isProject: false
---

# V2 Platform Activation

## The Situation

The V2 platform is fully built (all 6 plan sections marked DONE) but has **never been used to build a real experiment**. All 18 experiments are pre-V2 legacy. The 8 `vfb-test-`* fixtures validated wiring but aren't real creative work.

- **Toolkit** (`scroll.ts`, `raf.ts`, `r3f.tsx`): Architecturally sound, validated by vfb-test fixtures, awaiting first real experiment. Has an incomplete destroy cleanup bug.
- **Metrics** (`ExperimentDevMetrics`, `R3FSceneInspector`): Genuinely novel, but one-way fire-and-forget
- **Agent config** (33 files): Excellent documentation, ~70% guidance with no enforcement
- **Scaffolding** (Plop): Works for humans, blocks AI agents (interactive prompts)

**Strategy**: Fix only what blocks real usage, then build something real. Zero placeholder work.

---

## Prior Work Investigation Summary

Every item was cross-referenced against 57 agent transcripts and 25 plan files:


| Item                     | Prior Work                                                                                                                                                                                       | Finding                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| 1A. Scaffolding          | V2 plan assumed "template flag" mode but nobody built it. Never identified as friction.                                                                                                          | **Fresh -- genuinely unaddressed gap**  |
| 1B. Destroy bug          | [VFB review](b6f43f2e) identified Bug 2, prescribed fix, but implementation missed GSAP ticker restoration                                                                                       | **Finish incomplete fix**               |
| 1C. autoRaf              | Never flagged. VFB testing passed it as "internal difference"                                                                                                                                    | **Fresh -- newly discovered**           |
| 1D. Deprecated exports   | Superseded by `createUnifiedScroll`. Confusing to have two conflicting APIs in the same module.                                                                                                  | **API cleanup**                         |
| 2A. Queryable metrics    | console.log issue found in [VFB testing](cdb27886). `window.__experimentMetrics` proposed in [V2 reassessment](c728d6b5) but never built                                                         | **Fresh -- proposed never implemented** |
| 2B. Exhaustive deps      | **Deferred 3x** by user in [Biome migration](41f1fcd8), [P2 planning](168ba07c), and [pending inventory](b6f43f2e). Cursor.tsx bug identified 3x, deferred 3x. "Dedicated pass" never scheduled. | **Breaking the defer cycle**            |
| 3A. First experiment     | Identified as critical in [V2 reassessment](c728d6b5). Zero V2 experiments ever built despite all infra being DONE.                                                                              | **The whole point**                     |
| ~~3B. Migration script~~ | Removed -- legacy experiments must not be touched. They work as-is and any changes risk breaking shipped portfolio pieces.                                                                       | **Removed**                             |


---

## Phase 0: Health Check (Test 6.2)

Run the validation pipeline with vfb-test experiments present. Establish baseline.

```bash
npm run validate:experiments   # 26 experiments (18 real + 8 vfb-test)
npm run typecheck              # Known risk: missing type decls for tempus, lenis, gray-matter
npm run lint
npx vitest --run --project unit
npm run build                  # Known risk: generation scripts include wip experiments
```

**New risk found**: `generate-registry.mjs`, `generate-posters.mjs`, and `generate-llms-txt.mjs` do NOT filter `status: "wip"` experiments. Running `npm run build` with vfb-test experiments will pollute the public registry, `llms.txt`, and site listing. Add `status !== "wip"` filter to all three scripts as part of this phase.

**Known pre-existing issues** (not caused by this work):

- `useCursor` SSR crash on homepage (HTTP 500) -- `WithHover` requires `CursorProvider` context missing in SSR
- Missing type declarations for `tempus`, `lenis`, `gray-matter` (may cause typecheck failures)

---

## Phase 1: Unblock Autonomous Agent Building

Without these, "AI agents are primary builders" is aspirational, not real.

### 1A. Non-Interactive Scaffolding

**The problem**: [plopfile.js](plopfile.js) uses 6 interactive prompts. AI agents can't scaffold experiments autonomously. This was implicitly assumed solved since the V2 plan (which said "with a template flag") but was never built. Never identified as friction in any of 25 plan files or 57 transcripts -- a blind spot.

**Prior art**: The [V2 ideation](a30ca44f) said *"tailoring [CLI] so that you can do things more effectively."* The workflow doc assumes interactive: *"Run `npm run new:experiment`... When prompted..."*

**The fix**:

1. Create `scripts/create-experiment.mjs` using Plop's `nodePlop` API with named flags:

```bash
   npm run new:experiment:auto -- --name "foo" --profile r3f-scene --toolkit --leva
   

```

1. Defaults match interactive behavior (toolkit defaults to true for scrollytelling/r3f, leva defaults to false)
2. Keep `npm run new:experiment` for interactive human use
3. Add `--yes` flag to `scripts/delete-experiment.mjs` to skip confirmation
4. Update `.agent/workflows/new-experiment.md` to teach agents the non-interactive path

### 1B. Fix `createUnifiedScroll` Destroy Bug

**The problem**: [VFB review](b6f43f2e) identified Bug 2 (memory leak + global side effect) in [scroll.ts](src/lib/toolkit/scroll.ts). The prescribed fix created `createUnifiedScroll` with a `destroy()` handle, but the implementation was incomplete: `gsapTempusDispose` is captured but never called, GSAP's ticker is never restored, `gsapTakenOver` is never reset. After `destroy()`, GSAP is left "headless."

**The fix**: Complete the destroy reversal:

```typescript
destroy() {
  lenisDispose?.();
  lenis.destroy();
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (gsapTempusDispose) {
    gsapTempusDispose();
    gsapTempusDispose = undefined;
  }
  gsap.ticker.add(gsap.updateRoot);
  gsapTakenOver = false;
}
```

### 1C. Fix Scrollytelling Template `autoRaf` Contradiction

**The problem**: The scrollytelling profile says `autoRaf: false`. The Plop template for toolkit=N generates `autoRaf: true`. VFB testing passed this as "Same visual, different wiring" without flagging the GSAP sync gap -- Lenis runs its own RAF while GSAP runs its own ticker, unsynchronized.

**The fix**: In [component.tsx.hbs](plop-templates/experiment/profiles/scrollytelling/component.tsx.hbs), the non-toolkit path should use `autoRaf: false` with GSAP ticker wiring:

```typescript
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### 1D. Remove Deprecated Exports

Remove `createLenisScroll` and `destroyLenisScroll` from [scroll.ts](src/lib/toolkit/scroll.ts) and [index.ts](src/lib/toolkit/index.ts). These are superseded by `createUnifiedScroll` and having two conflicting scroll APIs in the same module is confusing. The deprecated functions drive Lenis from `gsap.ticker` directly, which conflicts with the Tempus-based unification. Keeping them invites accidental use of the wrong API.

---

## Phase 2: Close the Feedback Loop

### 2A. Queryable Metrics Surface

**The problem**: Metrics are one-way `console.log()`. Discovered during [VFB testing](cdb27886) (Issue 1): invisible to `cursor-ide-browser` MCP (only captures warn/error) and filtered in Chrome default view. In [V2 reassessment](c728d6b5), `console.warn` alone was classified as a bandaid. User chose "lightweight" queryable approach.

**The upgrade** (single cohesive change across [ExperimentDevMetrics.tsx](src/components/dev/ExperimentDevMetrics.tsx) and [R3FDevTools.tsx](src/components/dev/R3FDevTools.tsx)):

1. **Write to `window.__experimentMetrics`** alongside console output:

```typescript
window.__experimentMetrics = {
  timestamp: Date.now(),
  fps: 58.3, fpsMin: 52,
  heap: "23.4MB", cls: 0.001, gsapTweens: 3,
  r3f: { calls: 2, triangles: 14, geometries: 13, textures: 4 },
  scene: "..." // latest scene inspector text
};
```

1. **Upgrade `console.log` to `console.warn`** -- ensures visibility across all MCP browser tools
2. **Document eval pattern** for MCPs: `eval("JSON.stringify(window.__experimentMetrics)")` gives agents structured metrics on demand

The `console.warn` change is no longer a standalone bandaid -- it's part of a layered approach where the window global is the primary queryable interface and console output is the passive fallback.

### 2B. Enable `useExhaustiveDependencies`

**The problem**: Disabled during [Biome migration](41f1fcd8) (504 errors, 38 rules turned off wholesale). User deferred it in [P2 planning](168ba07c) and it has been in an acknowledge-and-defer cycle across 6+ plan files. The Cursor.tsx `getCursorColor` bug (function recreated every render, causing useEffect churn) was identified 3 separate times and deferred 3 times. The "dedicated pass" was never scheduled.

**Why this time is different**: Previous proposals were "fix all ~90 violations" -- overwhelming scope. This approach is incremental: enable the rule, auto-suppress everything existing, fix one real bug as proof, and let the rule prevent new bugs going forward. Zero mass-refactor required.

**The approach**:

1. Enable `useExhaustiveDependencies` in `biome.jsonc`
2. Run Biome to surface all violations
3. Auto-add `// biome-ignore` suppression to each existing violation via script -- this preserves all legacy experiment code exactly as-is
4. Fix Cursor.tsx manually: hoist `getCursorColor` outside the component body (this is a shared platform component, not a legacy experiment)
5. All future code must comply -- new suppressions require justification

**Critical constraint**: Legacy experiment code in `src/components/experiments/` must NOT be modified beyond adding suppression comments. The suppression-only approach ensures old experiments stay safe while new code gets the protection.

**Files known to have had ESLint exhaustive-deps suppressions** (removed during Biome migration): `wave-background.tsx`, `DesktopWindow.tsx`, `DesktopIcon.tsx`, `useCachedTexture.ts`, `Ribbon.tsx`, `ScreenPanel.tsx`.

---

## Phase 3: Build and Prove

### 3A. Build the First Real V2 Experiment

This is the most important item. Everything before it is in service of making this possible.

Use the V2 platform to build a real creative experiment end-to-end. This validates every layer simultaneously: non-interactive scaffolding (1A), toolkit wiring (1B/1C), queryable metrics (2A), profile guidance, `?debug` mode, the full pipeline.

**Recommended profile**: Scrollytelling -- exercises Lenis + Tempus + GSAP ScrollTrigger, validates the toolkit fixes, and makes a strong portfolio piece.

**Creative direction** (from [V2 ideation](a30ca44f) and existing portfolio): Dark, minimal, cinematic. Darkroom/basement/14islands quality bar. The user's portfolio already has 6 shaders, 4 interactions, 2 R3F scenes, 2 scrollytelling, 2 dom-effects, 2 web-audio -- a scrollytelling piece would strengthen that category.

---

## What This Plan Does NOT Do

Items explicitly excluded:

- **Touching legacy experiments** -- All 18 pre-V2 experiments stay exactly as they are. No layout migration, no code changes, no refactoring. They are shipped portfolio pieces. Any V2-era additions to them (articles, Gen 2 layout upgrades on basketball-replay-center/send-button) were part of testing and are already in place.
- Changing `game-of-life-shader` profile string (cosmetic, zero impact)
- Documenting the Biome-AGENTS.md contradiction (papering over a problem with words)
- Full MCP capture server (lightweight queryable metrics in 2A is sufficient)
- Tier 2/3 library adoption (will emerge when building real experiments)
- Content pipeline for old experiments (content work, not platform work)
- Profile-template coupling enrichment (agents add libraries as needed, templates stay minimal)

---

## Execution Order

```
Phase 0 (15 min): Validation baseline + wip filter for generation scripts
Phase 1A (30 min): Non-interactive scaffolding script
Phase 1B (10 min): Fix toolkit destroy bug
Phase 1C (10 min): Fix autoRaf contradiction
Phase 1D (5 min): Remove deprecated scroll API
Phase 2A (20 min): Queryable metrics surface
Phase 2B (30 min): Enable exhaustive-deps + fix Cursor.tsx bug
Phase 3A (ongoing): First real V2 experiment
```

Phases 1-2 are the infrastructure runway (~2 hours). Phase 3 is where value is created. Every minute of infrastructure work is in service of making Phase 3 effective.

**Guardrail**: No changes to files under `src/app/experiments/(slug)/` or `src/components/experiments/slug/` for any of the 18 legacy experiments. Only new V2 experiments, platform-level files (`src/components/dev/`, `src/lib/toolkit/`, `plop-templates/`, `scripts/`, `biome.jsonc`), and the shared `Cursor.tsx` component are in scope.