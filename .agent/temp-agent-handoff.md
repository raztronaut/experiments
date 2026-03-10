## Domain 1: Unified RAF & Timing -- Handoff Summary

### Completed (plan items done)
- **1**: Fixed Awwwards SKILL.md Lenis+GSAP ticker pattern → Tempus-first with GSAP-ticker fallback -- `~/.agents/skills/awwwards-animations/SKILL.md`
- **2**: Fixed Awwwards `lenis-react.md` "Full Integration (Recommended)" → Tempus as recommended, GSAP-ticker demoted -- `~/.agents/skills/awwwards-animations/references/lenis-react.md`
- **3**: Fixed Awwwards `advanced-patterns.md` raw `requestAnimationFrame` → Tempus with delta clamping + rAF fallback snippet -- `~/.agents/skills/awwwards-animations/references/advanced-patterns.md`
- **4**: Fixed `gsap-modern.md` phantom `setupUnifiedRAF` → references `createUnifiedScroll()` and `@/lib/toolkit/raf` -- `.agent/skills/gsap-modern.md`
- **5**: Fixed scrollytelling template non-toolkit path → uses Tempus priority chain instead of GSAP ticker -- `plop-templates/experiment/profiles/scrollytelling/component.tsx.hbs`
- **6**: Added R3F Binding, Delta Clamping, Pausable Time, `useFrameCallback`, `Tempus.patch()` trade-offs to tempus-raf.md -- `.agent/skills/tempus-raf.md`
- **7**: Enhanced `ExperimentCanvas` with optional `tempus` prop (auto `frameloop="never"` + `TempusFrameDriver`) -- `src/lib/toolkit/r3f.tsx`
- **8**: Wired `tempus` prop in R3F plop templates when `includeToolkit` is true -- `plop-templates/experiment/profiles/r3f-scene/component.tsx.hbs`, `plop-templates/experiment/profiles/r3f-shader/component.tsx.hbs`

### Extra Discoveries (things found that weren't in the plan)
- **SKILL.md cleanup bug**: The SmoothScroll example added `(time) => lenis.raf(time * 1000)` to GSAP's ticker but cleanup called `gsap.ticker.remove(lenis?.raf)` -- a different function reference, so removal silently failed -- `~/.agents/skills/awwwards-animations/SKILL.md` -- fixed by storing callback in a ref
- **`lenis-scroll.md` mislabeling**: GSAP-ticker approach was labeled "Canonical Pattern" while Tempus was a secondary section, sending the wrong signal about which is preferred -- `.agent/skills/lenis-scroll.md` -- reversed ordering, Tempus now recommended
- **`README.md` stale snippet**: Quick reference in the README still showed old `gsap.ticker.add((time) => lenis.raf(time * 1000))` pattern -- `~/.agents/skills/awwwards-animations/README.md` -- updated to Tempus priority chain
- **`Tempus.patch()` vs explicit binding undocumented**: Global rAF patching would auto-capture R3F's internal loop (simpler alternative to `frameloop="never"`), but the trade-off wasn't documented anywhere -- `.agent/skills/tempus-raf.md` -- added dedicated section
- **`useTempus` hook absent from integration examples**: Only documented in isolation in `tempus-raf.md` React section, never shown in Lenis/GSAP integration contexts -- `.agent/skills/lenis-scroll.md` -- added `useTempus` example

### Extra Changes (files modified beyond the plan)
- `~/.agents/skills/awwwards-animations/README.md` -- Updated Lenis+GSAP quick reference from old GSAP-ticker to Tempus pattern, since this is a high-visibility entry point agents read
- `.agent/skills/lenis-scroll.md` -- Restructured GSAP integration section: Tempus elevated to recommended, GSAP-ticker demoted, added `useTempus` hook reference and `ScrollTrigger.refresh()` call. This file wasn't explicitly listed in the plan but is clearly Domain 1 scope

### Intentional Skips (plan items NOT done, with reasoning)
- None. All Domain 1 plan items were completed.

### Judgment Calls (deviations from the plan's exact instructions)
- **Plan said**: "Show both [Tempus and GSAP-ticker] clearly labeled" in SKILL.md. **Done**: Showed both, but also fixed the cleanup bug in the GSAP-ticker fallback (stored callback in a `useRef` instead of the broken `lenis?.raf` removal). The plan didn't call this out but it was a genuine bug in the code example.
- **Plan said**: Add optional `tempus` prop to `ExperimentCanvas` that "sets `frameloop="never"` and registers a Tempus callback at priority 1". **Done**: Implemented as a `TempusFrameDriver` child component that uses `useThree` selectors for `gl`, `scene`, `camera` rather than accessing `state.gl` in a single call. This approach avoids unnecessary re-renders from the R3F store and follows drei conventions.
- **Plan said**: Scrollytelling non-toolkit path fix should "at minimum drive Lenis from GSAP's ticker. Better: make toolkit default". **Done**: Went with the middle ground -- replaced GSAP ticker with Tempus in the non-toolkit path (since Tempus is a standalone npm package, not part of the toolkit). This preserves the opt-out-of-toolkit choice while still getting unified RAF. Did NOT remove/deprecate the non-toolkit path entirely.
- **Plan said**: "Show `<Canvas frameloop="never">` + Tempus callback at priority 1 that calls `gl.render()`" for R3F binding in tempus-raf.md. **Done**: Showed both the manual pattern AND the `ExperimentCanvas tempus` prop shorthand, giving agents two paths depending on whether they're in the experiments app or a standalone project.

### Cross-Domain Dependencies (things another domain needs to know)
- **Domain 2** should: Verify that the `r3f-shader` template's new `tempus` prop doesn't conflict with any shader-specific timing (e.g., `state.clock.elapsedTime` in `useFrame` still works when `frameloop="never"` -- R3F's internal clock still ticks from the manual render call). Also, Domain 2 still needs to add `depthWrite={false}` to the shader template's fullscreen quad.
- **Domain 3** should: Note that the scrollytelling template now has `ScrollTrigger.refresh()` in both toolkit and non-toolkit paths. Domain 3's plan item to add `ScrollTrigger.refresh()` may already be done for this file -- verify before making duplicate changes. Domain 3 still owns `useDevControls` fix and `dependencies: [scrub]` fix in this same template file.
- **Domain 4** should: The `ExperimentCanvas` now accepts a `tempus` prop. Domain 4's planned enhancements to `ExperimentCanvas` (adaptive DPR, error boundary, tone mapping) need to be additive to the current implementation, not replace it. The `TempusFrameDriver` component calls `gl.render(scene, camera)` directly -- if Domain 4 adds post-processing, the render call may need to go through an effect composer instead.
- **Domain 6** should: The scrollytelling template's non-toolkit path now imports `Tempus from "tempus"`. If Domain 6 modifies template imports or the non-toolkit code path, they need to preserve this import.
- **Domain 7** should: The `lenis-scroll.md` skill was restructured (Tempus now recommended, GSAP-ticker demoted). If Domain 7 is updating cross-references in `toolkit.md` or `AGENTS.md`, they should note the new section titles in `lenis-scroll.md`.
- **Domain 8** (overview) should: Verify that the Tempus priority chain is consistently documented as `-1` (Lenis), `0` (GSAP), `1` (rendering) across all files. Check that no file still recommends the old GSAP-ticker-drives-Lenis pattern as the primary approach.

### Open Concerns (unresolved issues or uncertainties)
- **`useFrame` behavior with `frameloop="never"`**: When `ExperimentCanvas` sets `frameloop="never"`, R3F's `useFrame` callbacks should still fire because `TempusFrameDriver` calls `gl.render()`, which triggers the R3F loop internally. However, this hasn't been runtime-tested. If `useFrame` stops working, the fix would be to call `advance()` from `@react-three/fiber` instead of `gl.render()` directly.
- **Multiple `TempusFrameDriver` instances**: If someone nests `ExperimentCanvas tempus` components (unlikely but possible), multiple Tempus callbacks at priority 1 would be registered. The current implementation doesn't guard against this.
- **Other awwwards reference files with raw rAF**: Files like `performance.md`, `text-effects.md`, `geometric-shapes.md`, `algorithmic-art.md`, `audio-reactive.md`, and `design-philosophy.md` all contain `requestAnimationFrame` examples. These are mostly self-contained demos (fractal trees, physics, audio) where raw rAF is appropriate because they're standalone components. I didn't modify them since the plan only called out the particle canvas in `advanced-patterns.md`. Domain 8 should decide if these need Tempus annotations too.
- **Magnetic cursor in SKILL.md** (line ~133) still uses `gsap.ticker.add(() => {...})` for the cursor smoothing loop. This is intentional -- the cursor runs independently of scroll/rendering and doesn't need Tempus coordination. But it could cause a secondary RAF if GSAP's ticker has been removed elsewhere. Might warrant a comment.

### Files Touched (complete list)
- `~/.agents/skills/awwwards-animations/SKILL.md` -- modified (Tempus-first SmoothScroll, cleanup bug fix)
- `~/.agents/skills/awwwards-animations/references/lenis-react.md` -- modified (Tempus recommended, GSAP-ticker demoted)
- `~/.agents/skills/awwwards-animations/references/advanced-patterns.md` -- modified (Tempus particle canvas, rAF fallback)
- `~/.agents/skills/awwwards-animations/README.md` -- modified (updated quick reference snippet)
- `.agent/skills/gsap-modern.md` -- modified (fixed phantom `setupUnifiedRAF`)
- `.agent/skills/tempus-raf.md` -- modified (R3F binding, delta clamping, pausable time, `useFrameCallback`, `Tempus.patch()`, expanded unification section)
- `.agent/skills/lenis-scroll.md` -- modified (Tempus elevated to recommended, `useTempus` hook, section renaming)
- `src/lib/toolkit/r3f.tsx` -- modified (added `tempus` prop, `TempusFrameDriver` component)
- `plop-templates/experiment/profiles/scrollytelling/component.tsx.hbs` -- modified (non-toolkit path uses Tempus, added Tempus import)
- `plop-templates/experiment/profiles/r3f-scene/component.tsx.hbs` -- modified (added `tempus` to `ExperimentCanvas`)
- `plop-templates/experiment/profiles/r3f-shader/component.tsx.hbs` -- modified (added `tempus` to `ExperimentCanvas`)

## Domain 2: Shader & GLSL System -- Handoff Summary

### Completed (plan items done)
- **Bug fix 1**: Added `depthWrite={false} depthTest={false}` to r3f-shader template fullscreen quad -- `plop-templates/experiment/profiles/r3f-shader/component.tsx.hbs`
- **Bug fix 2**: Added `depthWrite={false} depthTest={false}` to r3f-shader profile fullscreen quad code example -- `.agent/profiles/r3f-shader.md`
- **Expand 1**: Added simplex 2D/3D noise (proper gradient-based implementations) -- `.agent/skills/shader-authoring.md`
- **Expand 2**: Added FBM with configurable octaves (2D and 3D variants) -- `.agent/skills/shader-authoring.md`
- **Expand 3**: Added domain warping pattern (single and double level) -- `.agent/skills/shader-authoring.md`
- **Expand 4**: Added curl noise for flow fields (2D and 3D) -- `.agent/skills/shader-authoring.md`
- **Expand 5**: Added voronoi / cell noise with distance and ID -- `.agent/skills/shader-authoring.md`
- **Expand 6**: Added rotation matrix `rot2d` -- `.agent/skills/shader-authoring.md`
- **Expand 7**: Added dithering (standard + alpha-strength variant) -- `.agent/skills/shader-authoring.md`
- **Expand 8**: Added quantization / posterize -- `.agent/skills/shader-authoring.md`
- **Expand 9**: Added film grain -- `.agent/skills/shader-authoring.md`
- **Expand 10**: Added HSL-to-RGB and RGB-to-HSL conversion functions -- `.agent/skills/shader-authoring.md`
- **Expand 11**: Added gamma correction (both directions) -- `.agent/skills/shader-authoring.md`
- **New section**: Added `onBeforeCompile` class-based material injection pattern (from tambo's `AnimatedGradientMaterial`) -- `.agent/skills/shader-authoring.md`
- **New section**: Added GLSL module system documentation (composable TS objects as primary, glslify-loader as advanced) -- `.agent/skills/shader-authoring.md`
- **Rule update**: Added GLSL utility library reference, `onBeforeCompile` as alternative approach, dithering as default practice -- `.agent/rules/shaders.md`

### Extra Discoveries (things found that weren't in the plan)
- **Blend modes completely absent** -- tambo has a full `BLEND` module (screen, color dodge, add, lighten, normal) with opacity overloads. Zero coverage in our docs. -- Added complete blend mode section to `shader-authoring.md` and referenced in `shaders.md`
- **Composable TS object pattern is the real recommendation, not glslify** -- tambo's actual approach uses typed `const` objects (`NOISE`, `FUNCTIONS`, `BLEND`) with `/* glsl */` template literal interpolation, not a glslify build pipeline. Far more practical for Next.js. -- Documented TS pattern as recommended, glslify as advanced alternative
- **3D vs 2D noise temporal distinction undocumented** -- `snoise3d(vec3(uv, time))` produces smoother temporal evolution than `snoise2d(uv + time)`. Our own `heroShader.ts` uses the inferior 2D pattern. -- Added as "Patterns Worth Knowing" section
- **Precision qualifiers not mentioned anywhere** -- `heroShader.ts` uses `precision mediump float;` but no guidance on when to use different levels. -- Added dedicated section
- **`mapRange` / `remap01` utilities missing** -- Basic but essential, from tambo's `FUNCTIONS` module. -- Added to utility functions section
- **`greyscale()` utility missing** -- Simple but frequently needed. -- Added to color space conversions
- **`sdRoundedBox` SDF missing** -- Plan only listed basic SDFs; rounded variant is the most commonly needed. -- Added
- **Existing codebase duplicates noise everywhere** -- mountain-transition, heroShader, and ribbonShader all independently reimplement `random()`/noise. Validates the module system approach. -- No code change; documents the problem the module pattern solves
- **Vignette and aspect ratio correction patterns undocumented** -- Both used in existing experiments but never documented. -- Added as copy-paste patterns
- **`extend()` + R3F integration for onBeforeCompile classes** -- Plan mentioned onBeforeCompile but not how to use class-based materials in R3F's declarative JSX via `extend()`. -- Added complete usage pattern
- **Tambo's `RANDOM` function used for dithering at end of alpha** -- `alpha -= rand(fragCoord) * 0.05` pattern specifically for transparency gradients. -- Added as `ditherAlpha` variant
- **Injection point reference table missing** -- Knowing which Three.js shader chunks to replace is critical for onBeforeCompile. -- Added table of common injection points with purpose

### Extra Changes (files modified beyond the plan)
- None. All changes were to files explicitly listed in the Domain 2 plan scope.

### Intentional Skips (plan items NOT done, with reasoning)
- None. All plan items were completed.

### Judgment Calls (deviations from the plan's exact instructions)
- **Plan said**: "Add simplex 2D/3D noise (proper implementation, not just hash)" as a single item. **Actually done**: Added both `snoise2d` and `snoise3d` as separate, fully self-contained implementations with different helper function names (`permute` vs `permute4`) to avoid redefinition conflicts when both are included in the same shader. The plan didn't specify conflict avoidance.
- **Plan said**: "Document that `glslify-loader` + `raw-loader` enables modular `.glsl` imports." **Actually done**: Documented the composable TS object pattern as the **recommended** approach and glslify as an "advanced" alternative. This deviates from the plan's framing, which positioned glslify as the primary pattern. Reasoning: tambo's actual production code uses TS objects, not glslify. The TS pattern requires zero build config, works with any bundler, and gives TypeScript autocompletion. glslify requires webpack config that may conflict with Turbopack.
- **Plan said**: "Show how to extend `MeshBasicMaterial` or `MeshStandardMaterial` by injecting custom GLSL via `onBeforeCompile`." **Actually done**: Documented the class-based extension pattern (subclassing `MeshBasicMaterial` with getter/setter uniforms) rather than just the callback pattern. Reasoning: tambo's actual implementation is class-based, which is cleaner, reusable, and works naturally with R3F's `extend()` system. The callback-only approach is harder to integrate with React.
- **Plan said**: Full rewrite of `shader-authoring.md`. **Actually done**: Full rewrite preserving the original structure (ShaderMaterial pattern, vertex/fragment templates, fullscreen quad, debugging) while massively expanding. Original was 133 lines; new version is 699 lines. The original content was correct -- it was just incomplete.
- **Plan said**: Full rewrite of `shaders.md` rule. **Actually done**: Full rewrite preserving all original correct content (ShaderMaterial pattern, uniform naming, performance tips, fullscreen quad, debugging) while adding GLSL library reference, dithering practice, onBeforeCompile reference, precision guidance. Kept it concise since the rule triggers on file match and shouldn't be verbose -- it points to the skill for full details.

### Cross-Domain Dependencies (things another domain needs to know)
- **Domain 4 (R3F)** should: Verify `r3f-core.md` references the expanded shader-authoring skill when discussing custom materials and post-processing. The onBeforeCompile pattern documented here is an alternative to full ShaderMaterial that Domain 4's post-processing docs should acknowledge.
- **Domain 5 (Portable Skill)** should: The `creative-webgl-patterns` GLSL library section should be a superset of what's in `shader-authoring.md`. The portable skill gets the complete library; the experiments-specific skill has the essentials. Domain 5 should reference this skill and extend, not duplicate.
- **Domain 5 (Portable Skill)** should: Include the blend modes (screen, color dodge, add, lighten) in the portable GLSL library -- these came from tambo's production code and are broadly useful.
- **Domain 5 (Portable Skill)** should: The composable TS module pattern documented here (`NOISE`, `FUNCTIONS`, `BLEND` as typed const objects) is the recommended portable approach. Domain 5 should use this same pattern in their skill.
- **Domain 8 (Overview)** should: Verify the `onBeforeCompile` injection point table stays accurate against the Three.js version pinned in `package.json`. These are internal chunk names that could change.
- **Domain 8 (Overview)** should: Check that the `permute` / `permute4` naming doesn't conflict if both `snoise2d` and `snoise3d` are included in the same shader via the module system. The 2D version uses `vec3 permute(vec3)`, the 3D uses `vec4 permute4(vec4)` -- deliberately different names to avoid collision.

### Open Concerns (unresolved issues or uncertainties)
- **Existing experiments still use duplicated noise** -- `heroShader.ts`, `mountain-transition/shaders.ts`, and `ribbonShader.ts` each have their own inline noise implementations. These work fine but would benefit from migrating to the module pattern. This is a refactoring task, not a docs task, and is outside Domain 2's scope.
- **`glslify-loader` may not work with Turbopack** -- The advanced `.glsl` import path requires Webpack config. Next.js is moving toward Turbopack as default. This is noted in the docs as a caveat but may need revisiting as the ecosystem evolves.
- **onBeforeCompile fragility** -- Three.js has stated they won't enhance `onBeforeCompile` further and consider it "quite fragile." The `NodeMaterial` system in Three.js r165+ may eventually replace it. The docs note to pin Three.js version and test after upgrades, but this is a long-term maintenance concern.
- **No automated GLSL validation** -- The GLSL code in the skill is manually verified for correctness. There's no CI step to compile-check these snippets. If someone edits the skill and introduces a typo, it won't be caught until runtime.

### Files Touched (complete list)
- `.agent/skills/shader-authoring.md` -- **modified** (full rewrite: 133 lines → 699 lines)
- `.agent/rules/shaders.md` -- **modified** (full rewrite: 55 lines → 76 lines)
- `.agent/profiles/r3f-shader.md` -- **modified** (added `depthWrite={false} depthTest={false}` to fullscreen quad example, lines 43-44)
- `plop-templates/experiment/profiles/r3f-shader/component.tsx.hbs` -- **modified** (added `depthWrite={false} depthTest={false}` to `<shaderMaterial>`, lines 67-68)
- `.cursor/plans/agent_docs_gap_analysis_7f7c10cf.plan.md` -- **modified** (marked `domain-2-shader` status as completed)

## Domain 3: Animation & Scroll Patterns -- Handoff Summary

### Completed (plan items done)
- **Bug fix 3**: Added `ScrollTrigger.refresh()` after Lenis initialization in scrollytelling template -- `plop-templates/experiment/profiles/scrollytelling/component.tsx.hbs`
- **New content 1**: Motion Vocabulary Diversity section with 10-technique catalog -- `.agent/rules/animations.md`
- **New content 2**: CSS Easing Variables (full Robert Penner set + Tailwind integration) -- `.agent/rules/animations.md`
- **New content 3**: Film grain / noise overlay documentation (both GIF and Canvas2D approaches) -- `.agent/rules/animations.md`
- **New content 4**: `fromTo` scroll interpolation lightweight pattern -- `.agent/rules/animations.md`
- **Profile update 1**: Added `ScrollTrigger.refresh()` to Toolkit Setup section with explanation -- `.agent/profiles/scrollytelling.md`
- **Profile update 2**: Added motion vocabulary diversity, FOUC prevention, easing variety to UX Guidelines -- `.agent/profiles/scrollytelling.md`

### Extra Discoveries (things found that weren't in the plan)
- **`anticipatePin` undocumented** -- ToolkitSection uses `anticipatePin: 1` for horizontal scroll but it wasn't in any doc -- added to both `animations.md` and `scrollytelling.md`
- **`ScrollTrigger.batch` incomplete** -- profile had a basic example missing `start` param and `gsap.set` initial state -- rewrote with complete pattern in `scrollytelling.md`
- **Horizontal scroll section pattern missing entirely** -- ToolkitSection implements pinned horizontal scroll with no documentation anywhere -- added full pattern to both `animations.md` and `scrollytelling.md`
- **Timeline sequencing undocumented** -- PublishingSection uses timeline-based sequential pipeline reveals, pattern existed in code but not in any guide -- added to both files
- **FOUC prevention guidance absent** -- announcing-v2 sections inconsistently mix CSS `opacity-0` and `gsap.set` for initial states with no guidance on which to use -- added dedicated section to `animations.md` and bullet to `scrollytelling.md` UX Guidelines
- **Reduced motion section-level pattern missing from `animations.md`** -- scrollytelling profile mentions the pattern but animations rule didn't show the `gsap.set` reveal code -- added with code example
- **Easing monotony** -- every announcing-v2 section uses `power2.out` exclusively -- called out explicitly in both docs as an anti-pattern
- **GrainOverlay technique mismatch** -- plan assumed darkroom's Canvas2D technique, but our actual `GrainOverlay` component uses a static GIF at low opacity -- documented both approaches with guidance on when to use each

### Extra Changes (files modified beyond the plan)
- No files were modified beyond the three listed in the plan. All extra discoveries were incorporated into the same target files (`animations.md`, `scrollytelling.md`).

### Intentional Skips (plan items NOT done, with reasoning)
- **Bug fix 1 (`useControls` → `useDevControls`)**: Already fixed in the template. Line 14 imports `useDevControls` from `@/hooks/useDevControls`. The plan noted this as "still unfixed" but it was resolved before this session.
- **Bug fix 2 (missing `dependencies` array in `useGSAP`)**: Already fixed in the template. Line 91 has `dependencies: [scrub]` when `includeLeva` is true. Same as above -- stale plan item.

### Judgment Calls (deviations from the plan's exact instructions)
- **Plan said**: "Add `ScrollTrigger.refresh()` after Lenis initializes" (implying only the toolkit path). **Actually done**: Added to both toolkit and non-toolkit template paths, because both paths modify scroll behavior and both need trigger recalculation.
- **Plan said**: Document film grain as "Canvas2D pre-generated buffer technique from darkroom." **Actually done**: Documented both the existing `GrainOverlay` GIF component (which we already have) AND the Canvas2D technique (with a forward reference to Domain 5's portable skill). Ignoring the existing component would create contradictory guidance.
- **Plan said**: Add content to `animations.md` in 4 sections. **Actually done**: Added 8 sections. The plan's 4 sections were necessary but insufficient -- the announcing-v2 codebase revealed 4 additional undocumented patterns actively in use (batch, horizontal scroll, timeline sequencing, FOUC prevention, anticipatePin).
- **Plan said**: Update scrollytelling profile's gotchas table. **Actually done**: Expanded from 6 rows to 9 rows, adding entries for `ScrollTrigger.refresh()`, `anticipatePin`, and motion vocabulary monotony.

### Cross-Domain Dependencies (things another domain needs to know)
- **Domain 1** should: Verify that the scrollytelling template's non-toolkit path (which Domain 1 updated to use Tempus) still has `ScrollTrigger.refresh()` correctly placed. It currently does -- line 49 of the template. If Domain 1 restructures that path, refresh must remain.
- **Domain 5** should: Create the `creative-webgl-patterns` portable skill with a Canvas2D noise buffer implementation. `animations.md` line 186 forward-references it: "See the `creative-webgl-patterns` portable skill for the full implementation." If Domain 5 names it differently or doesn't include this, the reference will be broken.
- **Domain 6** should: Be aware that `scrollytelling.md` now documents horizontal scroll and timeline sequencing patterns. If Domain 6 creates a `mixed.md` profile that covers scroll+R3F combinations, it should cross-reference these patterns rather than duplicating them.
- **Domain 7** should: Note that plan items 2A and 2C from `v2-updates-needed.md` (useDevControls and dependencies array) are already resolved in the template and can be marked as fixed.
- **Domain 8** should: Verify that `animations.md` CSS easing variables section is consistent with however Domain 5 documents the same pattern in the portable skill (plan says Domain 5 also covers CSS easings). One should be the brief reference, the other the full pattern.

### Open Concerns (unresolved issues or uncertainties)
- The `fromTo` scroll interpolation utility is documented as a pattern but doesn't exist as actual utility code in the codebase. If it's valuable enough to document, it may warrant a `src/lib/toolkit/interpolate.ts` implementation. Not in scope for docs but worth noting.
- The CSS easing variables are documented as a pattern to adopt but aren't actually added to the project's CSS or `tailwind.config.ts`. This is a code change deferred for whenever someone wants to adopt the pattern.
- The announcing-v2 experiment sections have zero `prefers-reduced-motion` handling despite the profile requiring it. This is an experiment code issue, not a docs issue, but the guidance now exists for the next time those sections are touched.
- `animations.md` grew from 46 to 200 lines. It's still a rule file (auto-loaded when editing experiment components), so the token cost on every edit increased. If this becomes a context budget concern, the scroll-driven patterns section could be extracted to a separate skill file.

### Files Touched (complete list)
- `plop-templates/experiment/profiles/scrollytelling/component.tsx.hbs` -- modified (added `ScrollTrigger.refresh()` in both template paths)
- `.agent/rules/animations.md` -- modified (expanded from 46 → 200 lines: 8 new sections)
- `.agent/profiles/scrollytelling.md` -- modified (added 4 pattern sections, expanded UX guidelines from 5 → 8 bullets, expanded gotchas from 6 → 9 rows)

## Domain 4: R3F & WebGL Ecosystem -- Handoff Summary

### Completed (plan items done)
- 4.1: Tone mapping and color space documentation -- `.agent/skills/r3f-core.md`
- 4.2: Adaptive performance (`AdaptiveDpr`, `AdaptiveEvents`, `performance.current` degradation) -- `.agent/skills/r3f-core.md`
- 4.3: Error boundary for Canvas -- `.agent/skills/r3f-core.md`, `src/lib/toolkit/r3f.tsx`
- 4.4: `tunnel-rat` DOM-WebGL bridge documentation -- `.agent/skills/r3f-core.md`
- 4.5: Post-processing pipeline (both `@react-three/postprocessing` and custom FBO+ScreenQuad) -- `.agent/skills/r3f-core.md`
- 4.6: Loading strategies (KTX2, layered Suspense, `useProgress`) -- `.agent/skills/r3f-core.md`
- 4.7: React 19 `<Activity>` for deferred off-screen updates -- `.agent/skills/r3f-core.md`
- 4.8: Zustand `getState()` in frame loops + `useShallow` + transient subscriptions -- `.agent/skills/r3f-core.md`
- 4.9: Tone mapping configuration guidance added to rules -- `.agent/rules/r3f.md`
- 4.10: `getState()` in frame loops pattern added to rules -- `.agent/rules/r3f.md`
- 4.11: Replaced `navigator.userAgent` with `useDeviceCapabilities()` feature-detection hook -- `.agent/profiles/r3f-scene.md`
- 4.12: `ExperimentCanvas` enhanced with optional `adaptive` prop -- `src/lib/toolkit/r3f.tsx`
- 4.13: `ExperimentCanvas` enhanced with `errorFallback` prop and `CanvasErrorBoundary` -- `src/lib/toolkit/r3f.tsx`
- 4.14: Portable skill updated with tunnel-rat, delta clamping, getState, device detection, KTX2, tone mapping, error boundaries, adaptive perf -- `~/.agents/skills/r3f-best-practices/SKILL.md`

### Extra Discoveries (things found that weren't in the plan)
- `maath/easing` is the idiomatic R3F damping library (damp3, dampE, dampC) used by basement.studio instead of springs -- added to `r3f-core.md` and portable skill as a documented pattern with install instructions
- `useFBO` + `ScreenQuad` from drei are the proper abstractions for FBO render targets and fullscreen quads -- documented in r3f-core.md post-processing section (the r3f-shader template's `<mesh><planeGeometry>` approach is inferior but owned by Domain 2)
- Keyboard accessibility in 3D (Tab navigation, focus indicators on meshes) discovered in basement.studio -- added full pattern to `r3f-core.md`
- `Performance.regress()` for manual performance degradation signaling -- added to `r3f-core.md` adaptive performance section
- drei's `View` component for multi-viewport single-Canvas layouts -- added new section to `r3f-core.md`
- Portable skill `SKILL.md` referenced non-existent `rules/` directory and `../R3F_BEST_PRACTICES.md` -- fixed broken references
- `zustand`, `maath`, `tunnel-rat` are NOT installed in the project -- documented as "not installed by default" with `npm i` commands in all relevant docs
- Selective bloom (`<Selection>` + `<Select>` + `<SelectiveBloom>`) pattern -- added to r3f-core.md post-processing section
- Drei essentials table was missing `AdaptiveDpr`, `AdaptiveEvents`, `ScreenQuad`, `useFBO`, `View` -- all added

### Extra Changes (files modified beyond the plan)
- `.agent/rules/r3f.md` -- Added error boundary rule and adaptive performance rule (plan only specified tone mapping + getState; these were logical extensions within Domain 4's file ownership)
- `.agent/profiles/r3f-scene.md` -- Rewrote Toolkit Setup section to use `ExperimentCanvas` with `adaptive`/`errorFallback` props, added post-processing tone mapping example, added delta clamping to useFrame pattern, expanded pre-implementation checklist from 6 to 9 items (plan only specified replacing `navigator.userAgent` and adding device detection)
- `~/.agents/skills/r3f-best-practices/SKILL.md` -- Removed broken `rules/` file references and non-existent `../R3F_BEST_PRACTICES.md` path (plan didn't mention fixing broken references)

### Intentional Skips (plan items NOT done, with reasoning)
- Tone mapping configuration as a dedicated prop on `ExperimentCanvas` -- Skipped because tone mapping is configured via the existing `gl` and `flat` Canvas props that pass through via `...props`. Adding a separate `toneMapping` prop would duplicate what R3F already supports and create an unnecessary abstraction layer.
- `@react-three/offscreen` for worker-based loading screens -- Documented as "advanced pattern" in the loading section prose rather than a full code example. The API is still unstable and the setup complexity (worker bundling, message passing) doesn't justify a copy-paste example in a skill doc.

### Judgment Calls (deviations from the plan's exact instructions)
- Plan said "Add optional `adaptive` prop that includes `<AdaptiveDpr>` and `<AdaptiveEvents>`" as a standalone change. I composed it with Domain 1's already-merged Tempus changes instead of starting from the original 23-line file -- because Domain 1 had already modified `r3f.tsx` to add `tempus` prop and `TempusFrameDriver`, building on top was the only safe approach.
- Plan said to add `tunnel-rat` as "Tier 2 library in toolkit.md". I documented it in `r3f-core.md` with the recommendation note instead -- because `toolkit.md` is owned by Domain 7 (Docs Housekeeping). I flagged this as a cross-domain dependency below.
- Plan's r3f-scene.md fix was scoped to just replacing `navigator.userAgent`. I also rewrote the Toolkit Setup section to demonstrate the new `ExperimentCanvas` props -- because the profile was still showing raw `<Canvas>` setup that doesn't match the enhanced toolkit wrapper, which would confuse agents.
- Plan said to add `createWithEqualityFn` + `shallow` for Zustand optimized subscriptions. I used the newer `useShallow` hook from `zustand/shallow` instead -- because `createWithEqualityFn` is the legacy API and `useShallow` is the current recommended approach.

### Cross-Domain Dependencies (things another domain needs to know)
- **Domain 1** should: Verify the `r3f.tsx` changes compose correctly with their Tempus work. The `TempusFrameDriver` and `tempus` prop are preserved; `adaptive` and `errorFallback` wrap around them. The `frameloop: "never" as const` type assertion was added to satisfy TypeScript.
- **Domain 2** should: Note that `ScreenQuad` from drei is now documented in `r3f-core.md` as the preferred fullscreen approach. The r3f-shader template's `<mesh><planeGeometry args={[viewport.width, viewport.height]}>` pattern is inferior -- Domain 2 may want to update the template to use `ScreenQuad` or at least add a comment noting the alternative.
- **Domain 5** (portable skill) should: Reference the expanded `r3f-core.md` patterns rather than duplicating them. The portable `r3f-best-practices/SKILL.md` has the condensed versions; `creative-webgl-patterns` should cross-reference rather than repeat.
- **Domain 6** (templates) should: Consider adding `adaptive` and `errorFallback` props to the r3f-scene and r3f-shader plop templates when `includeToolkit` is true.
- **Domain 7** (docs housekeeping) should: Add `tunnel-rat`, `maath`, and `zustand` to `toolkit.md` Tier 2 table with descriptions. Currently they are documented in skills/rules but not in the toolkit reference. Also verify that `toolkit.md` line ~28 (`r3f.tsx` description) mentions the new `adaptive` and `errorFallback` props.

### Open Concerns (unresolved issues or uncertainties)
- `maath` is not installed -- any experiment using `damp3`/`dampE` will need to `npm i maath` first. Should it be promoted to Tier 1 given how fundamental damping is to R3F work?
- `tunnel-rat` is not installed -- documented but experiments can't use it without adding it. Same Tier promotion question.
- `react-error-boundary` is not a dependency -- the `CanvasErrorBoundary` was implemented as a class component directly in `r3f.tsx` to avoid adding a dependency. This works but means experiments that want error boundaries outside of `ExperimentCanvas` need to write their own or add the package.
- The `useDeviceCapabilities()` hook in `r3f-scene.md` and `r3f-core.md` is documented inline but not extracted to a shared hook file (e.g., `src/hooks/useDeviceCapabilities.ts`). Multiple experiments will copy-paste it. Consider extracting to a shared hook -- but that's a code change beyond doc scope.
- The `AdaptiveDpr`/`AdaptiveEvents` interaction with Tempus `frameloop="never"` is untested. When Tempus drives the render loop, R3F's internal performance monitoring may not fire since it relies on R3F's own frame loop. Domain 1 or Domain 8 should verify this combination works.

### Files Touched (complete list)
- `.agent/skills/r3f-core.md` -- modified (expanded from 112 to ~350 lines)
- `.agent/rules/r3f.md` -- modified (added 4 new sections)
- `.agent/profiles/r3f-scene.md` -- modified (rewrote 3 sections, expanded checklist)
- `src/lib/toolkit/r3f.tsx` -- modified (added `CanvasErrorBoundary`, `adaptive` prop, `errorFallback` prop)
- `~/.agents/skills/r3f-best-practices/SKILL.md` -- modified (removed broken refs, added 10 advanced patterns)

## Domain 5: New Portable Skill (`creative-webgl-patterns`) -- Handoff Summary

### Completed (plan items done)
- **1**: GLSL Utility Library -- `~/.agents/skills/creative-webgl-patterns/references/glsl-library.md`
- **2**: Film Grain / Noise Overlay (Canvas2D technique) -- `~/.agents/skills/creative-webgl-patterns/SKILL.md`
- **3**: CSS Easing Variables (full Robert Penner set + Tailwind integration) -- `~/.agents/skills/creative-webgl-patterns/SKILL.md`
- **4**: Viewport-Width Sizing (PostCSS, CSS calc, Tailwind) -- `~/.agents/skills/creative-webgl-patterns/SKILL.md`
- **5**: `fromTo` Scroll Interpolation (lightweight, no GSAP) -- `~/.agents/skills/creative-webgl-patterns/SKILL.md`
- **6**: Layer-Cake Pattern (DOM over fixed WebGL) -- `~/.agents/skills/creative-webgl-patterns/references/advanced-patterns.md`
- **7**: `tunnel-rat` DOM-WebGL Bridge -- `~/.agents/skills/creative-webgl-patterns/references/advanced-patterns.md`
- **8**: Custom Post-Processing (FBO + fullscreen quad) -- `~/.agents/skills/creative-webgl-patterns/references/advanced-patterns.md`
- **9**: `onBeforeCompile` Shader Injection -- `~/.agents/skills/creative-webgl-patterns/SKILL.md`
- **10**: Responsive 3D / Device Detection hook -- `~/.agents/skills/creative-webgl-patterns/SKILL.md`

### Extra Discoveries (things found that weren't in the plan)
- **Flowmap simulation** -- from tambo's animated gradient with mouse-driven fluid distortion -- added full FBO ping-pong implementation to `references/advanced-patterns.md`
- **`maath/easing` for 3D damping** -- basement uses `damp3`/`dampC`/`dampE` instead of GSAP for smooth 3D interpolation -- added with install instructions and comparison to GSAP to `references/advanced-patterns.md`
- **Delta clamping / `useFrameCallback`** -- basement's `Math.min(rawDelta, 1/15)` pattern preventing physics explosions on tab-return, plus per-component elapsed time tracking -- added to `references/advanced-patterns.md`
- **Keyboard accessibility in 3D** -- basement's Tab-key navigation through interactive 3D elements with screen reader `aria-live` announcements -- added to `references/advanced-patterns.md`
- **Animated per-scene post-processing** -- basement drives bloom/vignette/exposure per page route via Motion `MotionValue` + `animate()` -- added to `references/advanced-patterns.md`
- **GLSL module system** -- `glslify-loader` + `raw-loader` setup mentioned in Domain 2 but is a portable cross-project pattern -- added to `references/advanced-patterns.md`
- **`shader-authoring.md` already expanded by Domain 2** -- discovered during duplication check that the project-specific GLSL library is now 699 lines (up from 133 at plan time), with simplex, FBM, curl, voronoi, onBeforeCompile class pattern, composable TS module system, blend modes already present -- no action needed, confirmed intentional overlap per plan guidelines

### Extra Changes (files modified beyond the plan)
- `.cursor/plans/agent_docs_gap_analysis_7f7c10cf.plan.md` -- updated Domain 5 section to mark as COMPLETED with full delivery inventory, the 6 extra discoveries, and duplication verification results

### Intentional Skips (plan items NOT done, with reasoning)
- None. All 10 plan items were delivered plus 6 additional items from transcript analysis.

### Judgment Calls (deviations from the plan's exact instructions)
- **Plan said**: "organized as sections, each with copy-paste code" in a single SKILL.md -- **Actually done**: Split into SKILL.md (404 lines, under the 500-line guideline from the skill creation guide) + 2 reference files for progressive disclosure. The GLSL library alone would have pushed SKILL.md past 800 lines, violating the skill authoring best practice. The `references/` directory keeps the main file scannable while allowing the agent to pull in full details on demand.
- **Plan said**: GLSL library should be "more comprehensive than what goes in `.agent/skills/shader-authoring.md`" -- **Actually done**: The portable skill adds SDF combining operations (smooth union/subtract/intersect), a `VoronoiResult` struct, 12 easing functions (quad through elastic), aspect-correct UV, and a `remap` utility that the project-specific skill lacks. However, the project skill now has blend modes, precision qualifier guidance, composable TypeScript module patterns, and a class-based `onBeforeCompile` pattern that the portable skill doesn't duplicate. The split is by audience: portable = copy-paste GLSL for any project; project-specific = R3F integration patterns + build system guidance.
- **Plan said**: Stagger support for `fromTo` -- **Actually done**: Provided a simpler `entries` array pattern where each entry has `start`/`end` progress ranges, which achieves stagger through offset ranges rather than a separate stagger parameter. More flexible for scroll-driven use cases.
- **Plan said**: Film grain with "configurable opacity, grain size, color vs mono" -- **Actually done**: All three plus configurable FPS (15-24 for film look). Added the FPS parameter because darkroom's technique uses a low update rate (not every frame) for the authentic film grain cadence.

### Cross-Domain Dependencies (things another domain needs to know)
- **Domain 2** should: Verify that `shader-authoring.md` references the portable `creative-webgl-patterns` skill for the full GLSL library (the plan's rule: "experiments-specific docs reference techniques briefly and point to this skill for the full portable pattern"). Currently no cross-reference exists in `shader-authoring.md`.
- **Domain 3** should: When adding CSS easing variables and film grain documentation to `animations.md`, cross-reference `~/.agents/skills/creative-webgl-patterns/SKILL.md` as the canonical portable source rather than duplicating the full patterns.
- **Domain 4** should: When documenting `tunnel-rat`, post-processing, and device detection in `r3f-core.md`, cross-reference the portable skill. Also note that the `useDeviceDetection` hook in this portable skill provides the GPU tier logic that `r3f-scene.md` needs to replace its current `navigator.userAgent` approach.
- **Domain 6** should: The `mixed.md` profile (combining scrollytelling + R3F) should reference the layer-cake pattern from this skill.
- **Domain 8 (Overview)** should: Verify the GLSL split between `shader-authoring.md` and this skill's `glsl-library.md` is complementary, not contradictory. Check that function signatures match (e.g., both use `snoise` / `snoise2d` naming consistently -- they currently don't: project skill uses `snoise2d`/`snoise3d`, portable skill uses `snoise`/`snoise3`). This naming inconsistency should be resolved.

### Open Concerns (unresolved issues or uncertainties)
- **GLSL function naming inconsistency**: The project-specific `shader-authoring.md` uses `snoise2d`/`snoise3d`/`fbm2d`/`fbm3d`, while the portable `glsl-library.md` uses `snoise`/`snoise3`/`fbm4`/`fbm3d`. Domain 8 should decide on a canonical naming convention and align both files.
- **`tunnel-rat` not installed**: The portable skill documents `tunnel-rat` usage but it's not currently in the project's `package.json`. Domain 4's plan mentions recommending it as Tier 2 in `toolkit.md` -- this needs to happen for the pattern to be usable.
- **PostCSS `postcss-functions` not installed**: The viewport-width sizing section recommends `postcss-functions` for the `desktop-vw()` / `mobile-vw()` pattern, but this package isn't in the project. The CSS `calc()` and Tailwind arbitrary value alternatives work without it, but if someone follows the PostCSS recommendation they'll need to install it.
- **Flowmap simulation complexity**: The flowmap implementation uses FBO ping-pong which requires `THREE.HalfFloatType` render targets. This may not work on all mobile GPUs. The device detection hook provides `isWebGL2` and `gpuTier` to gate this, but no explicit warning is included in the flowmap section.

### Files Touched (complete list)
- `~/.agents/skills/creative-webgl-patterns/SKILL.md` -- **created** (404 lines)
- `~/.agents/skills/creative-webgl-patterns/references/glsl-library.md` -- **created** (428 lines)
- `~/.agents/skills/creative-webgl-patterns/references/advanced-patterns.md` -- **created** (528 lines)
- `.cursor/plans/agent_docs_gap_analysis_7f7c10cf.plan.md` -- **modified** (Domain 5 section updated to COMPLETED status with delivery inventory)

## Domain 6: Templates & Scaffolding -- Handoff Summary

### Completed (plan items done)
- **6.1**: Route-layout font documentation -- added comment block explaining font isolation, custom font import steps, and dark-mode `className` hint -- `plop-templates/experiment/route-layout.tsx.hbs`
- **6.2**: Mixed profile guidance -- created comprehensive profile for scroll+R3F+interaction experiments covering layer-cake pattern, Tempus priority chain, state bridging, file structure, conflict resolution, device adaptation, gotchas, and pre-implementation checklist -- `.agent/profiles/mixed.md`
- **6.3**: Develop-experiment workflow toolkit integration -- added steps 6-7 (Toolkit Integration and Debug Tools) with `createUnifiedScroll`, `ExperimentCanvas`, `useDevControls`, `?debug`, `window.__experimentMetrics`, and expanded completion checklist -- `.agent/workflows/develop-experiment.md`

### Extra Discoveries (things found that weren't in the plan)
- **web-audio template missing `includeLeva` support** -- every other profile template (scrollytelling, r3f-scene, r3f-shader, interaction, dom-effect) has `useDevControls` wiring when `includeLeva` is true, but web-audio was the only one without it -- fixed by adding volume control via `useDevControls`
- **No profile selection guidance in new-experiment workflow** -- agents had no documented mapping of use cases to profiles, and no guidance for mixed experiments that don't map to a single profile -- added a selection guide
- **architecture.md didn't mention mixed experiments** -- the template system section listed all 7 profiles but had no note about what to do when an experiment spans multiple profiles -- added a paragraph after the profile table
- **plopfile.js had no hint about mixed experiments** -- the profile choices array gave no indication that combined experiments should use scrollytelling as a base -- added a comment
- **announcing-v2 had to hand-edit `<html className="dark">`** -- the route-layout template had no guidance about adding classes to `<html>` for theming -- addressed in the font/theming comment block

### Extra Changes (files modified beyond the plan)
- `.agent/contexts/architecture.md` -- added mixed experiment guidance after the profile table, so agents know to scaffold with scrollytelling/r3f-scene as base and consult `mixed.md`
- `.agent/workflows/new-experiment.md` -- added profile selection guidance mapping use cases to profiles, including the mixed experiment path
- `plopfile.js` -- added comment in the profile choices array pointing to `.agent/profiles/mixed.md`
- `plop-templates/experiment/profiles/web-audio/component.tsx.hbs` -- added `includeLeva` support with volume control (`useDevControls`), matching every other profile template

### Intentional Skips (plan items NOT done, with reasoning)
- **Scrollytelling template `useDevControls` fix (2A)** -- plan explicitly assigns this to Domain 3 ("What NOT to Touch" section)
- **Scrollytelling template RAF path fix** -- plan explicitly assigns this to Domain 1
- **r3f-shader template `depthWrite` fix** -- plan explicitly assigns this to Domain 2
- **R3F template Tempus wiring** -- plan explicitly assigns this to Domain 1

### Judgment Calls (deviations from the plan's exact instructions)
- **Plan said "Consider adding common font imports or a `--includeFonts` prompt"** vs **I added a detailed comment block in the template instead of a new plopfile prompt** -- a comment block is more practical: it teaches without adding scaffolding complexity. A `--includeFonts` flag would need to know which fonts ahead of time, and experiments often need unique fonts. The comment gives agents and developers a clear recipe to follow manually.
- **Plan said "Create `.agent/profiles/mixed.md` or add a section to `AGENTS.md`"** vs **I created a standalone `mixed.md` profile file** -- consistency with the existing 6 profile files (each is a standalone `.md` in `.agent/profiles/`) made a separate file the right choice. AGENTS.md already references profiles by file, so adding a section there would duplicate content.
- **Plan didn't mention web-audio `includeLeva` gap** vs **I fixed it** -- this was a clear consistency bug across templates. Every other profile handled the `includeLeva` flag, and web-audio was the odd one out. The fix is small, scoped, and matches the existing patterns exactly.

### Cross-Domain Dependencies (things another domain needs to know)
- **Domain 1** should: verify that `mixed.md` correctly describes the Tempus priority chain (`-1` Lenis, `0` GSAP, `1` Three.js render). If Domain 1 changes priorities or the Tempus binding pattern, update `mixed.md` sections "Composing Scroll + R3F" and the Tempus priority diagram.
- **Domain 3** should: cross-reference `mixed.md` from the updated `animations.md` motion vocabulary section, since mixed experiments are the ones most at risk of repetitive animation patterns.
- **Domain 4** should: verify `mixed.md` references to `store.getState()` in `useFrame` and device detection patterns are consistent with what Domain 4 documents in `r3f-core.md`.
- **Domain 7** should: update `AGENTS.md` to mention the new `mixed.md` profile in the appropriate section, and update `STATUS.md` to reflect the new profile file.
- **Domain 8** (overview) should: verify that `mixed.md` doesn't contradict scrollytelling, r3f-scene, or interaction profiles -- the "Profile Priority (Conflict Resolution)" section establishes a hierarchy, but the overview pass should confirm no actual contradictions exist.

### Open Concerns (unresolved issues or uncertainties)
- **`useDeviceCapabilities` hook referenced in `mixed.md` doesn't exist yet** -- Domain 4 plans to create a proper device detection hook to replace `navigator.userAgent` string matching. Until that hook ships, agents following `mixed.md` will need to roll their own or use `matchMedia` + `navigator.maxTouchPoints`. The reference is intentionally forward-looking.
- **No plop template for mixed experiments** -- `mixed.md` tells agents to scaffold with scrollytelling or r3f-scene as a base, but there's no automated path. A future enhancement could add a `mixed` profile to plopfile that generates the layer-cake scaffolding (Canvas layer + DOM layer + Zustand store + sections/ + canvas/ directories). Not done now because the structure varies significantly between mixed experiments.
- **web-audio `playTone` signature changed** -- added a `volume` parameter to make leva control work. If any other code references the old 2-argument signature from this template, it would break. Since this is a template (generates new code, doesn't modify existing), the risk is zero for existing experiments.

### Files Touched (complete list)
- `plop-templates/experiment/route-layout.tsx.hbs` -- modified (font/theming documentation)
- `.agent/profiles/mixed.md` -- created (new mixed profile)
- `.agent/workflows/develop-experiment.md` -- modified (toolkit integration, debug tools, expanded checklist)
- `.agent/contexts/architecture.md` -- modified (mixed experiment note after profile table)
- `.agent/workflows/new-experiment.md` -- modified (profile selection guidance)
- `plopfile.js` -- modified (comment about mixed experiments)
- `plop-templates/experiment/profiles/web-audio/component.tsx.hbs` -- modified (`includeLeva` support)

## Domain 7: Docs Housekeeping -- Handoff Summary

### Completed (plan items done)
- **STATUS.md update**: Replaced `kinetic-typography-scroll` with `announcing-v2` (status: wip), added doc improvement effort note -- `.agent/STATUS.md`
- **STATUS.md known gaps**: Reconciled against codebase; added 3 new deferred items (agent docs gaps, Biome strictness, Cursor.tsx perf bug) -- `.agent/STATUS.md`
- **v2-updates-needed.md reconciliation**: All 10 items (1A-1G, 2A-2C) verified as resolved. File was already deleted from disk; deletion is justified -- no file touched
- **AGENTS.md motion vocabulary**: Added diversity warning to Animation Standards with technique catalog cross-ref to `.agent/rules/animations.md` -- `.agent/AGENTS.md`
- **AGENTS.md component size cross-ref**: Added reference to scrollytelling profile's Decomposition Architecture -- `.agent/AGENTS.md`
- **AGENTS.md visual-qa**: Upgraded Visual/Spatial Honesty guardrail with specific path to `.agent/workflows/visual-qa.md` and its 8-category review -- `.agent/AGENTS.md`
- **toolkit.md fixes**: Items 1A (DevToolsInjector `production` prop), 1B (stale Lenis pattern), 1C (context7 MCP entry) were all already fixed in the current file -- no changes needed
- **architecture.md fix**: Item 1D (DevToolsInjector `production` prop) was already fixed in the current file -- no changes needed for the plan item
- **visual-qa skill sync**: Verified both `.agent/skills/visual-qa.md` and `.agent/workflows/visual-qa.md` are in sync -- Lenis workaround (lines 67-78 skill, 157-168 workflow) and production metrics note (line 79 skill, line 168 workflow) both present -- no changes needed
- **running-findings.md status header**: Added note documenting all 10 remediation phases complete, P0-P4 addressed, v2-updates-needed.md reconciled and deleted -- `.agent/running-findings.md`

### Extra Discoveries (things found that weren't in the plan)
- **Stale tag filtering description in architecture.md** -- `tags` field said "Enables tag-based filtering on homepage" but ExperimentFilters was removed in remediation Phase 1 -- fixed to reflect actual usage (JSON-LD, OG images, llms.txt)
- **Stale status filtering description in architecture.md** -- `status` field said "Controls homepage filtering. Archived experiments are hidden by default." but filtering UI was removed -- fixed to describe programmatic use
- **Stale "with filters" in toolkit.md** -- Existing Shared UI section said "Experiment list UI with filters" but ExperimentFilters was deleted -- fixed to "with preview drawer"
- **Profile count drift in STATUS.md** -- Said 6 profiles but `mixed.md` was added (by Domain 6 or prior work), making it 7 -- fixed count and added note about mixed.md
- **kinetic-typography-scroll no longer exists on disk** -- STATUS.md referenced it as the V2 experiment but only announcing-v2 exists (19 experiments total, 18 legacy + 1 V2) -- fixed
- **Several plan items for other domains are already done**: `develop-experiment.md` already has Toolkit Integration section, `mixed.md` profile already exists, keyboard accessibility in 3D already in `r3f-core.md`, React Compiler already in `r3f-scene.md`
- **announcing-v2 has `publishable: true` while WIP** -- validator warns "publishable is true but content.article is not set" -- flagged but not touched (data issue, not docs)

### Extra Changes (files modified beyond the plan)
- `.agent/contexts/architecture.md` -- Fixed stale `tags` and `status` field descriptions in the Metadata Schema table (tag filtering and status filtering UI no longer exist)
- `.agent/contexts/toolkit.md` -- Fixed stale "with filters" reference in Existing Shared UI section

### Intentional Skips (plan items NOT done, with reasoning)
- **v2-updates-needed.md "go through each item and mark/fix"**: The file was already deleted from disk (git status shows `D .agent/v2-updates-needed.md`). Verified all 10 items are resolved in the current codebase instead. Items 2A, 2B, 2C are Domain 3/Domain 6 responsibilities (template fixes).
- **toolkit.md "Fix stale Lenis integration text (line ~19 area)"**: Already fixed -- line 19 now correctly says `createUnifiedScroll()` is canonical and the old `gsap.ticker.add` pattern is superseded
- **toolkit.md "Apply DevToolsInjector production prop documentation update"**: Already fixed -- line 37 documents the `production` prop with the showcase experiments use case
- **toolkit.md "Verify context7 MCP tool entry exists"**: Already present at line 51 with `resolve-library-id` + `query-docs` documented
- **architecture.md "Fix DevToolsInjector production prop description"**: Already fixed -- line 28 documents `production` prop with the visitor-facing `?debug` use case

### Judgment Calls (deviations from the plan's exact instructions)
- **Plan said "Update experiment count (announcing-v2 exists as WIP now)"** vs **I replaced kinetic-typography-scroll entirely** -- kinetic-typography-scroll no longer exists on disk (confirmed via `find`); announcing-v2 is the only V2 experiment. Total stays at 19, not 20. The plan assumed both would coexist.
- **Plan said to update STATUS.md "Known Gaps section against current codebase state"** vs **I added 3 new gaps rather than removing existing ones** -- All existing gaps are still valid (MCP capture server, Lighthouse CI, ArticleLayout TOC, etc.). Added agent docs gaps, Biome strictness, and Cursor.tsx perf bug which were surfaced in P2/P4 passes but never tracked in STATUS.md.
- **Plan said to add "motion vocabulary diversity warning" to AGENTS.md** vs **I also added a forward reference to `.agent/rules/animations.md`** -- The animations.md technique catalog is Domain 3's responsibility. The forward reference gives agents a place to look once Domain 3 completes. Domain 8 should verify this cross-ref resolves.

### Cross-Domain Dependencies (things another domain needs to know)
- **Domain 3** should: Create the "Motion Vocabulary Diversity" section in `.agent/rules/animations.md` that AGENTS.md now cross-references. Without it, the forward reference is a dead link.
- **Domain 6** should: Know that `mixed.md` profile already exists (227 lines, comprehensive). The plan item to "Create `.agent/profiles/mixed.md`" is already done. Also, `develop-experiment.md` already has the Toolkit Integration section with `createUnifiedScroll`, `ExperimentCanvas`, and mixed experiment guidance -- that plan item is done too.
- **Domain 8** should: (1) Verify the AGENTS.md -> `animations.md` cross-reference resolves after Domain 3 completes. (2) Check that the announcing-v2 `publishable: true` / no article inconsistency is intentional or gets fixed. (3) Verify no other docs still reference `kinetic-typography-scroll`.

### Open Concerns (unresolved issues or uncertainties)
- **`announcing-v2` has `publishable: true` but no article** -- Validator warns. Likely should be `false` while WIP, or the publishable field has a different meaning for showcase experiments. Needs human decision.
- **AGENTS.md forward reference to `animations.md` technique catalog** -- Will be a dead link until Domain 3 completes its work. If Domain 3 doesn't add that section, the cross-reference needs rewording.
- **15 of 18 legacy layouts still hardcode metadata** -- Noted in running-findings.md (line 293-295). Low priority cosmetic issue but could cause drift if experiment.json is updated without updating the layout.

### Files Touched (complete list)
- `.agent/STATUS.md` -- modified (experiment name, profile count, known gaps, doc effort note)
- `.agent/AGENTS.md` -- modified (motion vocabulary, component size cross-ref, visual-qa path)
- `.agent/running-findings.md` -- modified (status header note)
- `.agent/contexts/architecture.md` -- modified (stale tags/status field descriptions)
- `.agent/contexts/toolkit.md` -- modified (stale "with filters" reference)