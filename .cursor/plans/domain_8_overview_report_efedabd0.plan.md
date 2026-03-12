---
name: Domain 8 Overview Report
overview: Structured verification report from the Domain 8 Overview Pass agent, synthesizing findings from 4 parallel verification subagents across 7 completed documentation domains.
todos:
  - id: fix-broken-deps
    content: "Fix 5 broken cross-domain dependencies: (1) lenis-scroll.md cross-ref in toolkit.md, (2) r3f-core.md -> shader-authoring.md cross-ref, (3) tunnel-rat/maath/zustand in toolkit.md Tier 2, (4) shader-authoring.md -> creative-webgl-patterns cross-link, (5) mixed.md in AGENTS.md"
    status: completed
  - id: fix-partial-dep
    content: "Fix 1 partial dependency: Add CSS easing cross-reference from animations.md to creative-webgl-patterns"
    status: completed
  - id: fix-glsl-naming
    content: "Align GLSL function naming: rename snoise/snoise3/fbm4 -> snoise2d/snoise3d/fbm2d in glsl-library.md + update downstream callers"
    status: completed
  - id: fix-hook-naming
    content: Standardize useDeviceCapabilities name in creative-webgl-patterns SKILL.md, fix prefersReducedMotion -> isReducedMotion in mixed.md
    status: completed
  - id: fix-css-easing-values
    content: Align CSS cubic-bezier values between animations.md and creative-webgl-patterns/SKILL.md to standard Penner approximations
    status: completed
  - id: add-screenquad-guidance
    content: Add ScreenQuad vs planeGeometry trade-off guidance to shader-authoring.md fullscreen quad section
    status: completed
  - id: reduce-shader-duplication
    content: Reduce shader-authoring.md GLSL library to essentials + cross-link to portable glsl-library.md for complete set
    status: completed
  - id: soften-prescriptive-lang
    content: "Soften 3 prescriptive language items: animations.md 'never linear', r3f.md 'always error boundary', r3f-scene.md 'never blank canvas'"
    status: completed
isProject: false
---

# Domain 8: Overview Pass -- Final Verification Report

7 domain agents completed work across 32 files (+1752/-1202 lines). This report synthesizes findings from 4 parallel verification subagents.

---

## Verified Cross-Domain Dependencies (7 of 14)

- **D1 -> D2**: r3f-shader template has both `depthWrite={false}` (D2) and `tempus` prop (D1) -- no conflict
- **D1 -> D3**: `ScrollTrigger.refresh()` present in both toolkit and non-toolkit paths of scrollytelling template, coexisting with Tempus setup
- **D1 -> D4**: `r3f.tsx` cleanly composes all three props: `tempus` (D1), `adaptive` (D4), `errorFallback` (D4) -- interface at lines 14-22
- **D1 -> D6**: `import Tempus from "tempus"` present in scrollytelling template non-toolkit path (line 11 of `{{else}}` block)
- **D3 -> D5**: `animations.md` line 186 forward-references `creative-webgl-patterns` for Canvas2D noise buffer -- target content exists in portable SKILL.md (line 29+)
- **D3 -> D7**: `v2-updates-needed.md` fully reconciled and deleted; `running-findings.md` line 6 confirms all items resolved
- **D7 -> D3**: `AGENTS.md` line 97 references "full technique catalog" in `animations.md` -- catalog exists at line 59 with 10 techniques

---

## Broken Cross-Domain Dependencies (5 of 14)

These are items where one domain expected another domain to do something, and it was not done:

1. **D1 -> D7: `lenis-scroll.md` section titles in cross-references** -- BROKEN
  - `lenis-scroll.md` was restructured (Tempus now recommended, GSAP-ticker demoted, new section titles)
  - Neither `toolkit.md` nor `AGENTS.md` contain any references to `lenis-scroll.md` at all
  - **Fix**: Add cross-reference from `toolkit.md` Lenis entry to `.agent/skills/lenis-scroll.md`
2. **D2 -> D4: `r3f-core.md` references `shader-authoring` for custom materials** -- BROKEN
  - `r3f-core.md` has no cross-reference to `shader-authoring.md` for `onBeforeCompile` or custom materials
  - **Fix**: Add a line in `r3f-core.md` post-processing or materials section pointing to `shader-authoring.md` for the `onBeforeCompile` pattern
3. **D4 -> D7: `tunnel-rat`, `maath`, `zustand` added to `toolkit.md` Tier 2** -- BROKEN
  - None of these three libraries appear anywhere in `[toolkit.md](toolkit.md)`
  - They are documented in `r3f-core.md` but the toolkit reference table was never updated
  - **Fix**: Add all three to `toolkit.md` Tier 2 table with descriptions and install commands
4. **D5 -> D2: `shader-authoring.md` cross-references portable skill** -- BROKEN
  - `shader-authoring.md` (699 lines) contains zero references to `creative-webgl-patterns`
  - The plan's rule: "experiments-specific docs reference techniques briefly and point to this skill for the full portable pattern"
  - **Fix**: Add cross-link from `shader-authoring.md` GLSL library section to `~/.agents/skills/creative-webgl-patterns/references/glsl-library.md`
5. **D6 -> D7: `AGENTS.md` mentions `mixed.md` profile** -- BROKEN
  - `mixed.md` exists on disk (227 lines, comprehensive) but `AGENTS.md` has no mention of it
  - **Fix**: Add `mixed.md` to the Experiment Architecture section of `AGENTS.md`

---

## Partial Cross-Domain Dependencies (1 of 14)

- **D5 -> D3: `animations.md` cross-references portable skill for CSS easings** -- PARTIAL
  - Film grain cross-reference exists (line 186)
  - CSS Easing Variables section (lines 143-171) has NO cross-reference to the portable skill
  - **Fix**: Add a note in the CSS Easing section pointing to `creative-webgl-patterns/SKILL.md` for the complete 27-curve Penner set

---

## Multi-Touch File Conflicts

All 5 multi-touch files verified as **clean merges**:


| File                               | Domains  | Status                                                                                          |
| ---------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `src/lib/toolkit/r3f.tsx`          | D1 + D4  | Clean -- `tempus`, `adaptive`, `errorFallback` all coexist                                      |
| `scrollytelling/component.tsx.hbs` | D1 + D3  | Clean -- Tempus chain + ScrollTrigger.refresh() correctly ordered                               |
| `r3f-shader/component.tsx.hbs`     | D1 + D2  | Clean -- `tempus` on Canvas, `depthWrite` on shaderMaterial (different elements)                |
| `.agent/contexts/architecture.md`  | D6 + D7  | Clean -- mixed experiment note (line 83) + stale field fixes (lines 54-55) in separate sections |
| `agent_docs_gap_analysis.plan.md`  | Multiple | Clean -- minor cosmetic: D5 YAML says `pending` but body says `COMPLETED`                       |


---

## Named Conflicts Resolved

### 1. GLSL Function Naming

**Conflict**: `shader-authoring.md` uses `snoise2d`/`snoise3d`/`fbm2d`/`fbm3d`; portable `glsl-library.md` uses `snoise`/`snoise3`/`fbm4`/`fbm3d`.

**Recommendation**: Standardize on `snoise2d`/`snoise3d`/`fbm2d`/`fbm3d` (the shader-authoring.md convention).

- Explicit dimensionality is unambiguous at the call site
- GLSL doesn't support function overloading across parameter types, so `snoise(vec2)` vs `snoise3(vec3)` is asymmetric
- The `2d`/`3d` suffix is grep-friendly and extends consistently to `curlNoise2d`/`curlNoise3d`
- **Action**: Rename functions in `glsl-library.md` + update all downstream callers

### 2. `useDeviceCapabilities` vs `useDeviceDetection`

**Conflict**: D4 uses `useDeviceCapabilities()` (in r3f-scene.md, r3f-core.md, r3f.md, mixed.md); D5 uses `useDeviceDetection()` (in creative-webgl-patterns SKILL.md).

**Recommendation**: Standardize on `useDeviceCapabilities` (4 of 5 references already use it).

- "Capabilities" is more semantically accurate (what the device *can do*) vs "Detection" (identifying the device -- closer to user-agent sniffing which we're moving away from)
- Adopt the portable skill's richer implementation (with `gpuTier`) under the `useDeviceCapabilities` name
- **Also fix**: `mixed.md` uses `prefersReducedMotion` where all other files use `isReducedMotion`

### 3. ScreenQuad vs planeGeometry

**Conflict**: `r3f-core.md` documents `ScreenQuad` as preferred; `r3f-shader` template + profile + `shader-authoring.md` all use `<planeGeometry>`.

**Recommendation**: Document both with clear guidance on when to use each:

- `ScreenQuad` (drei): Post-processing, camera-independent effects, multi-pass rendering. Single fullscreen triangle, ignores projection.
- `<mesh><planeGeometry>`: Shader art needing scene interaction (mouse raycasting via `onPointerMove`, 3D compositing). Respects camera, supports R3F events.
- **Action**: Add trade-off note to `shader-authoring.md` fullscreen quad section. Consider adding `ScreenQuad` as a comment/alternative in the r3f-shader template.

---

## Consistency Issues


| Pattern                          | Files That Disagree                                                                                      | Canonical Version                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| GLSL noise naming                | `shader-authoring.md` (`snoise2d`) vs `glsl-library.md` (`snoise`)                                       | `snoise2d`/`snoise3d`                                                             |
| Device hook name                 | `r3f-*.md` (`useDeviceCapabilities`) vs `SKILL.md` (`useDeviceDetection`)                                | `useDeviceCapabilities`                                                           |
| `isReducedMotion`                | `mixed.md` (`prefersReducedMotion`) vs all others (`isReducedMotion`)                                    | `isReducedMotion`                                                                 |
| CSS easing `cubic-bezier` values | `animations.md` vs `SKILL.md` -- different approximations for same named curves (e.g., `--ease-in-quad`) | Align to standard Penner approximations (the portable skill values)               |
| `rAF` casing                     | Titles use `RAF` (all caps), prose uses `rAF` (camelCase)                                                | Acceptable split -- `rAF` in prose, `RAF` in compound nouns/titles. Low priority. |


Tempus priority chain (`-1`/`0`/`1`) is **fully consistent** across all files.
`frameloop` vs `frame loop` is **correctly split**: prop name vs prose concept.
`render loop` is **unanimous** -- no files use "render cycle."
No file recommends old `gsap.ticker.add` as primary -- all occurrences are labeled as legacy/fallback/cleanup.

---

## Completeness Gaps

**None found.** Every plan item across all 7 domains is accounted for in either "Completed" or "Intentional Skips" with valid reasoning. All "already done by prior work" claims from Domain 7 were verified against actual file contents.


| Domain                | Plan Items | Completed | Intentional Skips | Extra Discoveries |
| --------------------- | ---------- | --------- | ----------------- | ----------------- |
| D1 (RAF/Timing)       | 8          | 8         | 0                 | 5                 |
| D2 (Shader/GLSL)      | ~16        | ~16       | 0                 | 13                |
| D3 (Animation/Scroll) | 9          | 7         | 2 (already fixed) | 8                 |
| D4 (R3F/WebGL)        | 14         | 12        | 2 (justified)     | 8                 |
| D5 (Portable Skill)   | 10         | 10        | 0                 | 6                 |
| D6 (Templates)        | 3          | 3         | 0                 | 5                 |
| D7 (Housekeeping)     | ~12        | 5         | 7 (already done)  | 5                 |


---

## Creativity Principle Violations

**Overall: PASSES.** Documentation maintains the "patterns not mandates" principle.

3 minor items to soften (optional polish, not blockers):

1. `**animations.md` line 35**: "**Never** use `linear` for UI motion" -- contradicts its own horizontal scroll example (line 95: `ease: "none"` which is linear). Soften to "Avoid `linear` for UI motion unless scrubbing or progress indication."
2. `**r3f.md` line 68**: "Always wrap `<Canvas>` in an error boundary" -- overly strong for simple prototypes. Soften to "Wrap `<Canvas>` in an error boundary for production experiments."
3. `**r3f-scene.md` line 102**: "Never show a blank canvas" -- during prototyping, blank canvas is acceptable. Soften to "Avoid blank canvas in finished experiments."

Positive findings:

- `tempus-raf.md` lines 237-240 explicitly states "Not needed for simple experiments with a single animation system" -- directly maintains the key principle
- `mixed.md` presents patterns with flexibility, offers alternatives
- `creative-webgl-patterns/SKILL.md` has zero prescriptive language -- cleanest file from a "patterns not mandates" perspective

---

## Content Duplication Issues


| Project File                                      | Portable File                                | Issue                                                                                                                | Resolution                                                                                                        |
| ------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `shader-authoring.md` (~370 lines GLSL)           | `glsl-library.md` (428 lines GLSL)           | **Both have full implementations.** Plan says project should be brief + cross-link. This is a duplication violation. | Reduce `shader-authoring.md` GLSL to ~10 most-used snippets + cross-link to portable library for the complete set |
| `animations.md` CSS easings (12 curves, 29 lines) | `SKILL.md` CSS easings (27 curves, 60 lines) | Borderline acceptable (subset). **Missing cross-link + different cubic-bezier values for same named curves.**        | Add cross-link. Align cubic-bezier values to portable skill's standard Penner approximations.                     |
| `r3f-core.md` tunnel-rat (32 lines)               | `advanced-patterns.md` tunnel-rat (73 lines) | **Structure correct** (brief vs full). **Missing cross-link.**                                                       | Add cross-link to portable skill for full pattern including provider setup, per-page examples, pitfalls.          |


**Systemic issue**: No cross-links exist from ANY project doc to the portable `creative-webgl-patterns` skill. This was explicitly called for in the plan and flagged by Domain 5 as a cross-domain dependency, but no domain performed the cross-linking.

---

## Open Concerns Requiring Human Decision

These are the most important unresolved issues aggregated from all 7 domain handoffs:

1. `**useFrame` behavior with `frameloop="never"` is untested** (D1) -- `TempusFrameDriver` calls `gl.render()` which should trigger R3F's `useFrame` callbacks, but this hasn't been runtime-tested. If it doesn't work, fix is to call `advance()` from `@react-three/fiber` instead. **Needs manual testing.**
2. `**AdaptiveDpr`/`AdaptiveEvents` + Tempus `frameloop="never"` interaction untested** (D4) -- R3F's internal performance monitoring may not fire when Tempus drives the render loop since it relies on R3F's own frame loop. **Needs manual testing.**
3. `**maath` and `tunnel-rat` are not installed** (D4/D5) -- Both are documented extensively but require `npm install` before use. Should they be added as default dependencies, or stay as optional installs? **Human decision on dependency policy.**
4. `**announcing-v2` has `publishable: true` but no article** (D7) -- Validator warns. Should be `false` while WIP, or does `publishable` have a different meaning for showcase experiments? **Human decision on data model.**
5. **15 of 18 legacy layouts still hardcode metadata** (D7) -- Low-priority cosmetic drift. Updating them is mechanical but touches 15 files. **Human decision on prioritization.**
6. `**animations.md` grew from 46 to 200 lines** (D3) -- Still auto-loaded as a rule file on every experiment component edit, increasing context token cost. If this becomes a budget concern, scroll-driven patterns could be extracted to a separate skill file. **Monitor and decide later.**
7. **Remaining awwwards reference files with raw `requestAnimationFrame`** (D1) -- Files like `performance.md`, `text-effects.md`, `geometric-shapes.md`, etc. contain raw rAF. These are standalone demos where raw rAF is appropriate, but they lack Tempus annotations. **Low priority, human decide if worth annotating.**
8. **No automated GLSL validation** (D2) -- GLSL code in skills is manually verified. No CI step to compile-check snippets. **Future infrastructure decision.**

---

## Notable Discoveries Worth Capturing

These findings don't require immediate action but should be remembered:

- **Existing codebase duplicates noise everywhere** -- `heroShader.ts`, `mountain-transition/shaders.ts`, `ribbonShader.ts` all independently reimplement `random()`/noise. Validates the module system approach but these won't be migrated as part of docs work.
- `**Tempus.patch()` global rAF patching** is documented as an alternative to `frameloop="never"` -- simpler but affects all rAF consumers globally. Trade-offs now in `tempus-raf.md`.
- **Composable TypeScript GLSL object pattern** (not glslify) is the real production approach from tambo -- `NOISE`, `FUNCTIONS`, `BLEND` as typed const objects with template literal interpolation. Requires zero build config.
- **Web-audio template was missing `includeLeva` support** -- only profile template without it. Fixed by D6.
- **Cleanup bug in Awwwards SKILL.md** caught by D1 -- `gsap.ticker.remove(lenis?.raf)` removed a different function reference than what was added (silent no-op). Fixed by storing callback in a ref.
- `**onBeforeCompile` fragility** -- Three.js has stated they won't enhance it further. `NodeMaterial` in r165+ may replace it. Docs note to pin Three.js version.
- **CSS easing variable pattern** is documented but not actually added to the project's CSS or `tailwind.config.ts` -- it's a pattern-to-adopt, not yet adopted.
- `**fromTo` scroll interpolation** is documented as a pattern but no utility code exists at `src/lib/toolkit/interpolate.ts` -- could be promoted from pattern to implementation.

