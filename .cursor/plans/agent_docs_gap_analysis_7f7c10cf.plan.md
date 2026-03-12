---
name: Agent Docs Gap Analysis
overview: "Comprehensive audit reorganized by domain for parallel agent execution. Each domain is self-contained: one agent can own it end-to-end. After all domain agents complete, an overview pass agent reviews everything for consistency."
todos:
  - id: domain-1-raf
    content: "Domain 1: Unified RAF & Timing -- Fix/add Tempus patterns across awwwards skill + refs, gsap-modern, tempus-raf, lenis-scroll, ExperimentCanvas, scrollytelling template RAF, R3F template wiring"
    status: pending
  - id: domain-2-shader
    content: "Domain 2: Shader & GLSL System -- Expand shader-authoring.md, add onBeforeCompile, fix r3f-shader template+profile depthWrite, document GLSL module system, add comprehensive GLSL utility library"
    status: completed
  - id: domain-3-animation
    content: "Domain 3: Animation & Scroll Patterns -- Add motion vocabulary diversity to animations.md, fix scrollytelling template (useDevControls, deps, ScrollTrigger.refresh), add CSS easing variables, fromTo utility, film grain docs"
    status: pending
  - id: domain-4-r3f
    content: "Domain 4: R3F & WebGL Ecosystem -- Update r3f-core.md, r3f rules, r3f-scene profile (device detection, tone mapping), ExperimentCanvas (adaptive perf, error boundary), add tunnel-rat/post-processing/loading/Activity docs"
    status: pending
  - id: domain-5-portable
    content: "Domain 5: New Portable Skill -- Create ~/.agents/skills/creative-webgl-patterns/ aggregating cross-cutting portable techniques from all domains"
    status: pending
  - id: domain-6-templates
    content: "Domain 6: Templates & Scaffolding -- Fix remaining plop template bugs not covered by other domains, add mixed-profile guidance, route-layout font comment"
    status: pending
  - id: domain-7-housekeeping
    content: "Domain 7: Docs Housekeeping -- Update STATUS.md, reconcile v2-updates-needed.md, update AGENTS.md cross-refs, fix toolkit.md + architecture.md stale content, reconcile running-findings.md"
    status: pending
  - id: domain-8-overview
    content: "Domain 8: Overview Pass -- Read all changes from domains 1-7, verify cross-domain consistency, identify contradictions/gaps/incorrect work, ensure cross-references are correct"
    status: pending
isProject: false
---

# Agent Docs Gap Analysis -- Organized by Domain

Reorganized from the original severity-based audit into **8 self-contained domains** for parallel agent execution. Each domain owns a set of files and changes end-to-end. Domains 1-7 can run in parallel; Domain 8 runs after all others complete.

**Reference repos investigated**: darkroom.engineering (sf-website + Satus), basement.studio (website-2k25), tambo-ai/tambo-landing, darkroomengineering/sf-website.

**Artifacts audited**: AGENTS.md, STATUS.md, 6 rules, 8 skills, 6 profiles, 7 workflows, 3 contexts, v2-updates-needed.md, running-findings.md, 25 plop templates, 10 scripts, toolkit source code.

**Key principle**: All improvements are additive guidance, not constraints. Skills provide patterns, not mandates. Tempus is "recommended" not "required." Profiles are behavioral modes agents can blend.

---

## Domain 1: Unified RAF & Timing

**Owner**: One agent. Covers everything related to Tempus, requestAnimationFrame unification, Lenis+GSAP timing, R3F render loop binding, delta clamping, and pausable time.

**Why this matters**: All three reference repos (darkroom, basement, tambo) use a single RAF loop driving all animation systems. Our toolkit (`createUnifiedScroll`) does this for Lenis+GSAP but the pattern is taught incorrectly in global skills, missing for R3F, and broken in templates.

### Files to Read First

- `~/.agents/skills/awwwards-animations/SKILL.md` (lines 52-96: Lenis setup)
- `~/.agents/skills/awwwards-animations/references/lenis-react.md` (lines 86-141: GSAP integration)
- `~/.agents/skills/awwwards-animations/references/advanced-patterns.md` (line 399: raw rAF)
- `.agent/skills/gsap-modern.md` (line 112: phantom function reference)
- `.agent/skills/tempus-raf.md` (entire file -- current Tempus docs)
- `.agent/skills/lenis-scroll.md` (entire file -- current Lenis docs)
- `src/lib/toolkit/scroll.ts` (the correct reference implementation)
- `src/lib/toolkit/r3f.tsx` (23 lines -- needs Tempus binding)
- `src/lib/toolkit/raf.ts` (7 lines -- just re-exports Tempus)
- `plop-templates/experiment/profiles/scrollytelling/component.tsx.hbs` (~line 100: non-toolkit RAF path)
- `plop-templates/experiment/profiles/r3f-scene/component.tsx.hbs` (no Tempus wiring)
- `plop-templates/experiment/profiles/r3f-shader/component.tsx.hbs` (no Tempus wiring)

### Changes to Make

**Bug fixes (incorrect patterns):**

1. **Awwwards SKILL.md** (lines 52-96): The "SmoothScroll" component drives Lenis from GSAP's ticker (`gsap.ticker.add(update)`). This is the old pattern. Fix: teach Tempus-unified as recommended, GSAP-ticker as fallback for projects without Tempus. Show both clearly labeled.
2. **Awwwards `references/lenis-react.md`** (lines 86-141): "Full Integration (Recommended)" section drives Lenis from GSAP's ticker. Fix: add a "Tempus Integration (Recommended)" section above it, demote GSAP-ticker to "Alternative: Without Tempus."
3. **Awwwards `references/advanced-patterns.md`** (line 399): Canvas particle example uses raw `requestAnimationFrame(animate)`. Fix: show Tempus version as primary, note raw rAF as fallback.
4. `**.agent/skills/gsap-modern.md**` line 112: References non-existent `setupUnifiedRAF`. Fix: change to `import Tempus from '@/lib/toolkit/raf'` or reference `createUnifiedScroll` directly.
5. **Scrollytelling template non-toolkit path**: When `includeToolkit` is false, creates a raw Lenis + `requestAnimationFrame` loop with no GSAP binding. Fix: at minimum drive Lenis from GSAP's ticker. Better: make toolkit default for scrollytelling, remove/deprecate the non-toolkit path.

**New documentation:**

1. `**.agent/skills/tempus-raf.md`**: Add these sections:
  - **R3F Binding**: Show `<Canvas frameloop="never">` + Tempus callback at priority 1 that calls `gl.render()`. Show the `useFrameCallback` wrapper pattern from basement.
  - **Delta Clamping**: `Math.min(delta, 1/15)` to prevent physics explosions on frame drops. (From basement's `useFrameCallback`.)
  - **Pausable Time**: Pause capability for modals/overlays, per-component elapsed time tracking. (From basement.)
2. `**src/lib/toolkit/r3f.tsx`**: Add optional `tempus` prop that sets `frameloop="never"` and registers a Tempus callback at priority 1. This is a code change, not just docs. Keep it opt-in so simple experiments aren't forced into Tempus.
3. **R3F plop templates** (r3f-scene, r3f-shader): When `includeToolkit` is true, wire Tempus for the R3F render loop via the enhanced `ExperimentCanvas`.

### What NOT to Touch (owned by other domains)

- `animations.md` rule (Domain 3)
- `r3f-core.md` non-Tempus content (Domain 4)
- `r3f-scene.md` profile device detection (Domain 4)
- Scrollytelling template `useDevControls` fix (Domain 3)

---

## Domain 2: Shader & GLSL System

**Owner**: One agent. Covers GLSL utility functions, shader authoring patterns, `onBeforeCompile` injection, GLSL module system, and shader template/profile fixes.

**Why this matters**: Our shader-authoring skill has only 6 GLSL utility functions. Reference repos use comprehensive libraries (FBM, simplex noise, curl noise, voronoi, domain warping, dithering). Basement uses a modular GLSL build pipeline (`glslify-loader`). Tambo shows `onBeforeCompile` as an alternative to full custom shaders.

### Files to Read First

- `.agent/skills/shader-authoring.md` (entire file -- 133 lines)
- `.agent/rules/shaders.md` (entire file -- 55 lines)
- `.agent/profiles/r3f-shader.md` (entire file -- 86 lines)
- `plop-templates/experiment/profiles/r3f-shader/component.tsx.hbs`
- `src/components/experiments/announcing-v2/shaders/heroShader.ts` (existing FBM usage)
- `src/components/experiments/404-not-found/Ribbon.tsx` (existing advanced shader)

### Changes to Make

**Bug fix:**

1. **r3f-shader template `component.tsx.hbs`**: Add `depthWrite={false} depthTest={false}` to the `<shaderMaterial>` on the fullscreen quad. Our own docs require this but the template omits it.
2. **r3f-shader profile `r3f-shader.md`**: Same fix -- the fullscreen quad code example is missing `depthWrite={false}`.

**Expand GLSL utilities in `.agent/skills/shader-authoring.md`:**

1. Add these GLSL functions (with copy-paste-ready code):
  - **Simplex 2D/3D noise** (proper implementation, not just hash)
  - **FBM (Fractal Brownian Motion)** with configurable octaves
  - **Domain warping** pattern: `fbm(p + fbm(p + fbm(p)))`
  - **Curl noise** for flow fields (2D and 3D)
  - **Voronoi** (cell noise with distance and ID)
  - **Rotation matrix**: `mat2 rot2d(float a)`
  - **Dithering**: `rand(fragCoord) * amount` to reduce banding
  - **Quantization**: `floor(color * levels) / levels` for posterized effects
  - **Film grain**: `fract(sin(dot(uv + time, vec2(12.9898, 78.233))) * 43758.5453)`
  - **HSL-to-RGB / RGB-to-HSL** conversion functions
  - **Gamma correction**: `pow(color, vec3(1.0/2.2))`
2. **Add `onBeforeCompile` pattern**: Show how to extend `MeshBasicMaterial` or `MeshStandardMaterial` by injecting custom GLSL via `onBeforeCompile`. This preserves Three.js built-in features while adding custom effects. (From tambo's animated gradient.)
3. **Add GLSL module system note**: Document that `glslify-loader` + `raw-loader` enables modular `.glsl` imports. Note this as an "advanced optimization" -- inline template strings work fine for most experiments but `.glsl` files enable cross-experiment reuse.
4. **Update `.agent/rules/shaders.md`**: Add reference to the expanded GLSL utility library. Add `onBeforeCompile` as an alternative approach. Add the dithering pattern as a "always add dithering to gradients" best practice.

### What NOT to Touch

- `ExperimentCanvas` (Domain 1 for Tempus, Domain 4 for other enhancements)
- Animation patterns (Domain 3)
- R3F Canvas configuration beyond shader specifics (Domain 4)

---

## Domain 3: Animation & Scroll Patterns

**Owner**: One agent. Covers motion vocabulary diversity, easing libraries, scroll-driven animation patterns, scrollytelling template fixes, film grain documentation, and lightweight scroll utilities.

**Why this matters**: The announcing-v2 experiment used identical `opacity: 0, y: 40` reveals in every section. Reference repos use varied motion signatures per section. Our `animations.md` rule documents timing/easing but not technique diversity.

### Files to Read First

- `.agent/rules/animations.md` (entire file -- 46 lines)
- `.agent/profiles/scrollytelling.md` (entire file -- 113 lines)
- `.agent/skills/motion-react.md` (entire file -- 135 lines)
- `plop-templates/experiment/profiles/scrollytelling/component.tsx.hbs`
- `src/components/ui/GrainOverlay.tsx` (if exists -- existing grain component)

### Changes to Make

**Bug fixes in scrollytelling template:**

1. `**useControls` to `useDevControls`**: Change `import { useControls } from "leva"` to `import { useDevControls } from "@/hooks/useDevControls"` and update the call. (Already noted in `v2-updates-needed.md` 2A, still unfixed.)
2. **Missing `dependencies` array in `useGSAP`**: When `includeLeva` is true, the scrub value from controls is used inside `useGSAP` but not in `dependencies`. Add `dependencies: [scrub]`. (From `v2-updates-needed.md` 2C.)
3. **Missing `ScrollTrigger.refresh()`**: Add `ScrollTrigger.refresh()` after Lenis initializes. Both darkroom and tambo do this.

**New content in `.agent/rules/animations.md`:**

1. **Motion Vocabulary Diversity section**: Add guidance that each section in a multi-section experiment should have a distinct motion signature. Include a technique catalog:
  - `clipPath` reveals (inset animation + counter-scale on inner content)
  - Blur transitions (`filter: blur()` animating from blurred to clear)
  - Scale transforms (grow-in from 0.8, with slight rotation)
  - Text splitting (per-character, per-word, per-line with different timings)
  - Parallax layers (background moves slower than foreground)
  - Horizontal scroll sections (pinned + xPercent scrub)
  - Counter-animation (parent moves one direction, child counters)
   Make clear this is *guidance for variety*, not a requirement to use all techniques.
2. **CSS Easing Variables pattern**: Document darkroom's approach of defining every Robert Penner curve as a CSS custom property. Show a Tailwind-compatible version using `theme.extend`.
3. **Film grain / noise overlay documentation**: Document the GrainOverlay pattern (if it exists as a component, document it; if not, document the Canvas2D pre-generated buffer technique from darkroom).
4. `**fromTo` scroll interpolation**: Document tambo's lightweight pattern -- a function that interpolates values from scroll progress and applies to `element.style`, bypassing GSAP for simple reveals. Useful when you want scroll-driven animation without the overhead of ScrollTrigger instances.

**Update scrollytelling profile:**

1. `**.agent/profiles/scrollytelling.md`**: Add `ScrollTrigger.refresh()` to the Toolkit Setup section after `createUnifiedScroll`. Add note about motion vocabulary diversity (cross-reference the new `animations.md` section).

### What NOT to Touch

- Tempus/RAF patterns (Domain 1)
- Shader-related animation (Domain 2)
- R3F-specific animation (Domain 4)
- Template RAF path fix (Domain 1 owns the scrollytelling RAF issue)

---

## Domain 4: R3F & WebGL Ecosystem

**Owner**: One agent. Covers Canvas configuration, post-processing, DOM-WebGL bridging (tunnel-rat), device detection, loading strategies, React 19 Activity, Zustand frame patterns, and ExperimentCanvas enhancements (non-Tempus parts).

**Why this matters**: Basement's site is one of the most technically sophisticated R3F sites in production. Our R3F docs cover basics but miss: tone mapping, color space, adaptive performance, error boundaries, DOM-WebGL bridging, post-processing pipelines, device detection, loading strategies.

### Files to Read First

- `.agent/skills/r3f-core.md` (entire file -- 112 lines)
- `.agent/rules/r3f.md` (entire file -- 53 lines)
- `.agent/profiles/r3f-scene.md` (entire file -- 73 lines)
- `src/lib/toolkit/r3f.tsx` (23 lines)
- `~/.agents/skills/r3f-best-practices/SKILL.md` (262 lines -- portable skill)

### Changes to Make

`**.agent/skills/r3f-core.md` additions:**

1. **Tone mapping and color space**: Document `THREE.NoToneMapping` + manual color management in post-processing (basement pattern). Show how `outputColorSpace` and `toneMapping` interact.
2. **Adaptive performance**: Document `<AdaptiveDpr>` and `<AdaptiveEvents>` from Drei. Show the `useThree` + `performance.current` degradation pattern.
3. **Error boundary**: Show how to wrap Canvas in an error boundary so the page degrades gracefully without WebGL.
4. `**tunnel-rat` DOM-WebGL bridge**: Document the pattern: `<WebGlTunnelIn>` in DOM components, `<WebGlTunnelOut>` inside Canvas. Explain when to use it (shared persistent canvas with page-specific 3D content). Note: `tunnel-rat` is not currently installed -- recommend it as a Tier 2 library in toolkit.md.
5. **Post-processing pipeline**: Document both `@react-three/postprocessing` (the easy way) and custom post-processing (render to FBO + fullscreen quad shader). Show per-scene animated parameters using Motion `MotionValue`.
6. **Loading strategies**: Document KTX2 texture loading (`useKTX2` from Drei, Basis Transcoder setup), Suspense loading boundaries, and `useProgress` for loading UIs. Note `@react-three/offscreen` for worker-based loading screens as advanced pattern.
7. **React 19 `<Activity>`**: Document `<Activity mode="visible"|"hidden">` for deferring WebGL updates when off-screen.
8. **Zustand in frame loops**: Document `store.getState()` for non-reactive reads inside `useFrame`. Document `createWithEqualityFn` + `shallow` for optimized subscriptions.

`**.agent/rules/r3f.md` additions:**

1. Add tone mapping configuration guidance. Add `getState()` in frame loops pattern.

`**.agent/profiles/r3f-scene.md` fixes:**

1. **Replace `navigator.userAgent`** device detection with a proper `useDeviceDetection` hook pattern (from tambo): checks `matchMedia`, `navigator.maxTouchPoints`, `prefers-reduced-motion`. Add feature gating examples (disable bloom on mobile, reduce particle count, lower DPR).

`**src/lib/toolkit/r3f.tsx` enhancements (non-Tempus parts):**

1. Add optional `adaptive` prop that includes `<AdaptiveDpr>` and `<AdaptiveEvents>`.
2. Add error boundary wrapper.
3. Add tone mapping configuration options.

**Portable skill `~/.agents/skills/r3f-best-practices/SKILL.md`:**

1. Add rules for: `tunnel-rat` bridge, delta clamping, `getState()` in frame loops, device detection, KTX2 loading.

### What NOT to Touch

- Tempus binding for R3F (Domain 1 owns this)
- Shader GLSL utilities (Domain 2)
- Scroll-driven 3D animation patterns (Domain 3 for scroll, Domain 1 for Tempus)

---

## Domain 5: New Portable Skill (`creative-webgl-patterns`) — COMPLETED

**Owner**: One agent. Creates a new skill at `~/.agents/skills/creative-webgl-patterns/` that aggregates cross-cutting creative techniques portable across any project.

**Status**: ✅ COMPLETED. All files created and verified.

### Files Created

```
~/.agents/skills/creative-webgl-patterns/
├── SKILL.md                           (404 lines)
├── references/
│   ├── glsl-library.md                (428 lines)
│   └── advanced-patterns.md           (528 lines)
```

### What Was Delivered (per plan)

1. ✅ **GLSL Utility Library** -- Simplex 2D/3D, FBM, domain warping (single + double), curl noise 2D/3D, voronoi with struct, SDF primitives + combining ops (smooth union/subtract/intersect), IQ palette, HSL↔RGB, gamma, dithering, film grain (shader), quantization, vignette, rotation matrices (2D + 3D), easing functions (quad through elastic), remap, aspect-correct UV
2. ✅ **Film Grain / Noise Overlay** -- Canvas2D pre-generated buffer technique with configurable opacity/size/mono/fps + CSS-only fallback
3. ✅ **CSS Easing Variables** -- Full Robert Penner set (sine through back) as CSS custom properties + Tailwind `transitionTimingFunction` integration
4. ✅ **Viewport-Width Sizing** -- CSS `calc()`, PostCSS functions (`desktop-vw`, `mobile-vw`, `columns`), Tailwind arbitrary values
5. ✅ `**fromTo` Scroll Interpolation** -- Lightweight interpolation function + Lenis integration
6. ✅ **Layer-Cake Pattern** -- CSS setup, React+R3F implementation, key considerations
7. ✅ `**tunnel-rat` DOM-WebGL Bridge** -- Setup, per-page usage, when to use, pitfalls
8. ✅ **Custom Post-Processing** -- FBO + fullscreen quad with bloom/vignette/dithering
9. ✅ `**onBeforeCompile` Shader Injection** -- Inline R3F pattern + when to use vs ShaderMaterial
10. ✅ **Responsive 3D / Device Detection** -- Feature detection hook (matchMedia, maxTouchPoints, GPU tier) + feature gating examples

### Additional Items Found in Transcript (Not in Original Plan)

These patterns were discovered in the [reference repo investigation](152608fd-216c-4d2e-b656-38ef8d482a25) but weren't explicitly listed in Domain 5's plan:

1. ✅ **Flowmap Simulation** -- Interactive fluid effect (FBO ping-pong, mouse-driven distortion, decay). From tambo's animated gradient shader.
2. ✅ `**maath/easing` for 3D Damping** -- Frame-rate-independent `damp3`, `dampC`, `dampE` for smooth 3D interpolation. From basement's alternative to GSAP for 3D motion.
3. ✅ **Delta Clamping / `useFrameCallback`** -- `Math.min(rawDelta, 1/15)` to prevent physics explosions on tab-return. Includes per-component elapsed time tracking pattern. From basement.
4. ✅ **Keyboard Accessibility in 3D** -- Tab-key navigation through interactive 3D elements with screen reader announcements. From basement.
5. ✅ **Animated Per-Scene Post-Processing** -- Mood shifts per page via Motion `MotionValue` + `animate()` driving bloom/vignette/exposure. From basement.
6. ✅ **GLSL Module System** -- `glslify-loader` + `raw-loader` setup for modular `.glsl` imports (advanced optimization).

### Duplication Verification

Verified clean separation with existing skills:

- **vs awwwards-animations**: No overlap. Awwwards covers animation TECHNIQUES (GSAP, Motion, timing). This skill covers visual EFFECTS and infrastructure PATTERNS.
- **vs r3f-best-practices**: No overlap. R3F skill covers CODE QUALITY (perf rules, component patterns). This skill covers creative TECHNIQUES built with R3F.
- **vs shader-authoring.md** (project-specific): Intentional overlap in GLSL utilities. The portable skill adds easing functions (elastic, back, expo), SDF combining ops, VoronoiResult struct, and aspect-correct UV. The project skill adds composable TypeScript module system, blend modes, precision guidance, and R3F-specific debugging.

### Relationship to Other Domains

- Domain 2 puts essential GLSL in `shader-authoring.md` (experiments-specific); this skill has the full portable library
- Domain 3 puts CSS easings and film grain in `animations.md` (experiments-specific); this skill has the portable patterns
- Domain 4 puts tunnel-rat and post-processing in `r3f-core.md` (experiments-specific); this skill has portable patterns

The rule: **experiments-specific docs** reference techniques briefly and point to this skill for the full portable pattern. This skill is the canonical reference that works in any project.

---

## Domain 6: Templates & Scaffolding

**Owner**: One agent. Covers plop template fixes not owned by other domains, mixed-profile guidance, route layout improvements, and profile/workflow updates.

**Why this matters**: Templates are what agents and developers touch first when creating experiments. Bugs here propagate to every new experiment.

### Files to Read First

- `plopfile.js` (entire file)
- All templates in `plop-templates/experiment/` (25 files)
- `.agent/profiles/` (all 6 files)
- `.agent/workflows/develop-experiment.md`
- `.agent/workflows/new-experiment.md`

### Changes to Make

**Template fixes (not owned by other domains):**

1. `**route-layout.tsx.hbs`**: Add a comment documenting that experiments with custom fonts must import them in their layout (since experiments have isolated `<html>`/`<body>` and don't inherit from the main app). Consider adding common font imports or a `--includeFonts` prompt. (From `v2-updates-needed.md` 2B.)

**New: Mixed Profile Guidance:**

1. **Create `.agent/profiles/mixed.md`** or add a section to `AGENTS.md`: Address experiments that combine scrollytelling + R3F + interaction (like announcing-v2). Cover:
  - Layer-cake pattern (fixed WebGL canvas + scrolling HTML DOM)
  - How to compose scrollytelling + R3F (camera driven by scroll via Tempus)
  - How to add interaction patterns (magnetic, spring) to scroll sections
  - Profile priority: when patterns conflict, which profile's guidance wins
  - Example file structure for a mixed experiment

**Workflow update:**

1. `**.agent/workflows/develop-experiment.md`**: Add a "Toolkit Integration" section that mentions `createUnifiedScroll` for scroll experiments and `ExperimentCanvas` for R3F experiments. Currently only lists basic development patterns.

### What NOT to Touch

- Scrollytelling template `useDevControls` fix (Domain 3)
- Scrollytelling template RAF path (Domain 1)
- r3f-shader template depthWrite (Domain 2)
- R3F template Tempus wiring (Domain 1)

---

## Domain 7: Docs Housekeeping

**Owner**: One agent. Covers stale tracking documents, AGENTS.md cross-references, context doc fixes, and reconciliation of known issues.

**Why this matters**: Multiple tracking documents are out of date. Known issues documented in `v2-updates-needed.md` haven't been applied. AGENTS.md is missing important cross-references.

### Files to Read First

- `.agent/STATUS.md` (58 lines)
- `.agent/v2-updates-needed.md` (134 lines)
- `.agent/running-findings.md` (626 lines)
- `.agent/AGENTS.md` (107 lines)
- `.agent/contexts/toolkit.md` (137 lines)
- `.agent/contexts/architecture.md` (160 lines)
- `.agent/skills/visual-qa.md` (122 lines)
- `.agent/workflows/visual-qa.md` (214 lines)

### Changes to Make

**STATUS.md:**

1. Update experiment count (announcing-v2 exists as WIP now)
2. Add `(status: wip)` after experiment names
3. Reconcile Known Gaps section against current codebase state
4. Note the current doc improvement effort

**v2-updates-needed.md:**

1. Go through each item (1A-1G, 2A-2C, 4A-4C) and either:
  - Mark as "Fixed by Domain N" if another domain's agent is fixing it
  - Apply the fix directly if it's a simple text change not covered by other domains
  - Items likely fixed by other domains: 1B (Domain 1), 2A (Domain 3), 2C (Domain 3)
  - Items to fix here: 1A (DevToolsInjector production prop in toolkit.md), 1C (context7 -- check if already fixed), 1D (architecture.md DevToolsInjector), 1E (visual-qa skill vs workflow discrepancy), 1F (production metrics claim), 1G (STATUS.md wip), 2B (font variables -- Domain 6)

**AGENTS.md:**

1. **Animation Standards section**: Add motion vocabulary diversity warning. Reference the expanded `animations.md` rule.
2. **Component Size Discipline section**: Cross-reference `scrollytelling.md` profile's decomposition architecture pattern.
3. Add a sentence about the visual-qa workflow for verifying visual work.

**toolkit.md:**

1. Fix stale Lenis integration text (line ~19 area) -- should reference `createUnifiedScroll` as canonical, not the old GSAP ticker pattern. (This is the text fix; Domain 1 fixes the actual skill docs.)
2. Apply DevToolsInjector `production` prop documentation update.
3. Verify context7 MCP tool entry exists (may have been fixed already).

**architecture.md:**

1. Fix DevToolsInjector `production` prop description (line ~28 area).

**visual-qa.md (skill version):**

1. Check if the Lenis scroll workaround and production metrics clarification are present in the skill version (`.agent/skills/visual-qa.md`). The workflow version (`.agent/workflows/visual-qa.md`) appears to have them but the skill may be behind.

**running-findings.md:**

1. Skim the 10 remediation phases. Add a header note if phases have been completed. Don't delete content -- it's historical. Just mark current status.

### What NOT to Touch

- Skills and rules (owned by other domains)
- Templates (Domain 6)
- Toolkit source code (Domains 1 and 4)

---

## Domain 8: Overview Pass

**Owner**: One agent, runs AFTER all domains 1-7 complete.

**Purpose**: Read all changes, verify consistency, catch contradictions, flag incorrectly done work.

### What to Do

1. **Read every file modified by domains 1-7.** For each file, verify:
  - No contradictions between documents (e.g., one doc says "use GSAP ticker" while another says "use Tempus")
  - Cross-references are correct (if `animations.md` references "see the GLSL library in `shader-authoring.md`", verify that section exists)
  - Code examples are syntactically correct and use consistent patterns
  - Terminology is consistent (same thing isn't called different names in different docs)
2. **Check for gaps between domains.** Things that fell between domain boundaries:
  - Does the new `creative-webgl-patterns` skill (Domain 5) properly reference things added by Domain 2 (shader) and Domain 4 (R3F)?
  - Does the `mixed.md` profile (Domain 6) reference Tempus patterns from Domain 1?
  - Does Domain 7's AGENTS.md update reference the new content from Domains 3 and 4?
3. **Verify the "Don't Hinder Creativity" principle.** Check that no doc has become prescriptive where it should be suggestive. Look for:
  - Language like "must" or "always" where "recommended" or "prefer" is appropriate
  - Patterns that are presented as the only way rather than the best default
  - New rules that would prevent simple experiments from being simple
4. **Check for duplicated content.** The portable skill (`creative-webgl-patterns`) and the experiments-specific docs both cover some topics. Verify the right split: portable skill has the full pattern, experiments docs have a brief reference + cross-link.
5. **Verify plop templates match updated docs.** If Domain 1 updated Tempus patterns, do the templates reflect that? If Domain 2 fixed `depthWrite`, is it also fixed in the profile?
6. **Produce a final report** listing:
  - Items correctly completed
  - Items that need correction (with specific file + line + what's wrong)
  - Items that are correct but could be better (optional improvements)
  - Any remaining gaps not addressed by domains 1-7

---

## Appendix: What's Already Good (No Changes Needed)

These were confirmed as aligned with reference implementations:

- `createUnifiedScroll()` correctly implements the darkroom Tempus pattern
- GSAP-Tempus binding is reference-counted
- MCP scroll workarounds (`__scrollToSection`, `__scrollToProgress`)
- `useDevControls` for production-safe debug GUI
- Debug system (`DevToolsInjector`, `DebugOverlay`, `R3FDevToolsInjector`, `?debug`)
- `useGSAP` with `scope` correctly taught everywhere
- Performance budgets and metrics thresholds
- Disposal patterns
- `prefers-reduced-motion` handling
- `scrollytelling.md` decomposition architecture
- `publish-experiment.md` progressive demo pattern
- `visual-qa.md` workflow (8-category review)
- `writing-voice.md` (RNDR Realm + Maxime Heckel references)
- Layout template (JSON-LD, OG tags, view transitions)
- `generate-registry.mjs` import graph walking
- `dom-effect` template correctly uses `useDevControls`
- Error boundary template
- `validate-experiments.mjs` cross-checking

