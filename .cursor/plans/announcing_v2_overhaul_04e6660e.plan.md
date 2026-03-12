---
name: Announcing V2 Overhaul
overview: Fix the announcing-v2 experiment's broken section reveals, restore the CRT shader to match the working 3d-crt-display reference, and optimize the heavy volumetric light + particle shaders that tank performance.
todos:
  - id: fix-class-concat
    content: Fix missing space in CSS class template literals in BlueprintSection, ProcessSection, and MissionControlSection
    status: completed
  - id: fix-crt-shader
    content: "Restore CRT shader to match working 3d-crt-display: add +0.05 brightness, phosphor glow bleed, correct self-illumination (0.93/0.07), brightness multiplier (2.5)"
    status: completed
  - id: optimize-volumetric
    content: "Optimize volumetricLight shader: reduce NUM_STEPS to 14, single noise octave, increase STEP_SIZE, add transmittance early-out"
    status: completed
  - id: optimize-particles
    content: "Optimize particleSwirl: reduce PARTICLE_COUNT to 2500, simplify FBM to single octave, use cheaper hash"
    status: completed
  - id: verify-visual
    content: Run dev server and visually verify all sections render, CRT looks correct, and performance is acceptable
    status: completed
isProject: false
---

# Announcing V2 Overhaul

## Root Cause Analysis

### Bug 1: CSS class concatenation (causes "empty sections")

Three sections have template literal bugs where the space between CSS classes is missing. This means reveal animations **never fire** -- all content stays at `opacity: 0 / translateY(20px)`.

**BlueprintSection.tsx line 72:**

```jsx
// BROKEN -- produces "blueprint-sectionblueprint-reveal"
className={`blueprint-section${revealed ? "blueprint-reveal" : ""}`}
// FIX:
className={`blueprint-section${revealed ? " blueprint-reveal" : ""}`}
```

**MissionControlSection.tsx line 157:**

```jsx
// BROKEN -- produces "mission-control-sectionmission-control-reveal"
className={`mission-control-section${revealed ? "mission-control-reveal" : ""}`}
// FIX:
className={`mission-control-section${revealed ? " mission-control-reveal" : ""}`}
```

**ProcessSection.tsx line 73:**

```jsx
// BROKEN -- produces "process-phaseprocess-phase--visible"
className={`process-phase${visiblePhases[i] ? "process-phase--visible" : ""}`}
// FIX:
className={`process-phase${visiblePhases[i] ? " process-phase--visible" : ""}`}
```

These bugs explain why the section after preloader looks empty and why there's a huge empty gap before JeskoJets -- the BlueprintSection content, ProcessSection phases, and MissionControlSection gauges all remain invisible because their reveal CSS classes never match.

---

### Bug 2: CRT shader is degraded vs. the working 3d-crt-display

Side-by-side comparison of [announcing-v2/shaders/crtShader.ts](src/components/experiments/announcing-v2/shaders/crtShader.ts) vs the working [3d-crt-display/shaders/crtShader.ts](src/components/experiments/3d-crt-display/shaders/crtShader.ts):


| Feature                     | 3d-crt-display (correct)  | announcing-v2 (broken)    |
| --------------------------- | ------------------------- | ------------------------- |
| Brightness boost on texture | `+ 0.05` per channel      | Missing                   |
| Phosphor glow bleed         | 3-line offset pass        | Missing entirely          |
| Self-illumination           | `0.93 + 0.07 * col * col` | `0.95 + 0.05 * col * col` |
| Brightness multiplier       | `* 2.5`                   | `* 1.6`                   |


Fix: copy the shader logic from the working `3d-crt-display` version. The four changes are in lines 44-55 of the announcing-v2 shader.

---

### Bug 3: Volumetric light shader tanks performance

The [volumetricLight.ts](src/components/experiments/announcing-v2/shaders/volumetricLight.ts) shader is the primary performance killer:

- **72 ray march iterations per pixel** (24 steps x 3 lights)
- Each step computes full 3D FBM noise (2 octaves of gradient noise with time offset)
- Even at half resolution, this is extremely heavy

Optimization plan:

- Reduce `NUM_STEPS` from 24 to 12-16
- Replace 2-octave FBM with single noise octave (cut noise ALU in half)
- Increase `STEP_SIZE` proportionally to maintain same visual range
- Add early-out when transmittance drops below threshold (e.g., 0.01)
- Consider reducing to 2 lights (warm + cool) instead of 3

---

### Bug 4: Particle swirl shader is unnecessarily complex

The [particleSwirl.ts](src/components/experiments/announcing-v2/shaders/particleSwirl.ts) vertex shader runs full 3D gradient noise + 2-octave FBM for each of 4000 particles:

- `noise()` called 3 times per particle (orbital drift + 2 FBM octaves)
- Each `noise()` does 8 `hash3()` calls (24 `dot()` + 24 `sin()` + trilinear interpolation)

Optimization plan:

- Reduce particle count from 4000 to 2000-2500 (still looks dense as a cloud)
- Simplify FBM to single octave
- Use cheaper hash function (no `sin()`)

---

## Files to Modify

- [BlueprintSection.tsx](src/components/experiments/announcing-v2/sections/BlueprintSection.tsx) -- fix class concat (line 72)
- [ProcessSection.tsx](src/components/experiments/announcing-v2/sections/ProcessSection.tsx) -- fix class concat (line 73)
- [MissionControlSection.tsx](src/components/experiments/announcing-v2/sections/MissionControlSection.tsx) -- fix class concat (line 157)
- [crtShader.ts](src/components/experiments/announcing-v2/shaders/crtShader.ts) -- restore brightness, phosphor bleed, self-illumination, brightness multiplier
- [volumetricLight.ts](src/components/experiments/announcing-v2/shaders/volumetricLight.ts) -- reduce steps, simplify noise, add early transmittance cutoff
- [particleSwirl.ts](src/components/experiments/announcing-v2/shaders/particleSwirl.ts) -- simplify noise, reduce particle cost
- [TempleScene.tsx](src/components/experiments/announcing-v2/canvas/TempleScene.tsx) -- reduce PARTICLE_COUNT

