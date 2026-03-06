---
name: Template Audit Fixes
overview: Fix 2 template bugs (motion/react import in interaction + dom-effect profiles) and 1 pre-existing flaky test (life-3d), then re-run Test 1 end-to-end with a proper manual verification pause.
todos:
  - id: fix-interaction-template
    content: Change interaction/component.tsx.hbs import from motion/react to framer-motion
    status: pending
  - id: fix-dom-effect-template
    content: Change dom-effect/component.tsx.hbs import from motion/react to framer-motion
    status: pending
  - id: fix-flaky-test
    content: Fix life-3d Life_3d.test.tsx 'step updates the grid' to use deterministic setup
    status: pending
  - id: rerun-scaffold
    content: Re-scaffold magnetic-card with interaction profile
    status: pending
  - id: rerun-verify-files
    content: Verify all 9 artifacts created
    status: pending
  - id: rerun-verify-contents
    content: Verify experiment.json, layout.tsx, and MagneticCard.tsx contents
    status: pending
  - id: rerun-typecheck
    content: Run npm run typecheck -- must pass clean
    status: pending
  - id: rerun-tests
    content: Run npx vitest --run --project unit -- all tests must pass
    status: pending
  - id: rerun-validate-19
    content: Run validate-experiments.mjs -- 19 experiments
    status: pending
  - id: rerun-manual-pause
    content: "PAUSE: present manual checklist, wait for user to confirm before cleanup"
    status: pending
  - id: rerun-delete
    content: Delete magnetic-card and verify clean state (18 experiments)
    status: pending
isProject: false
---

# Template Audit Fixes + Test 1 Re-Run

## Audit Summary

All 7 profile templates were audited. 2 bugs and 1 pre-existing issue found:

### Bug 1: `motion/react` import in 2 templates (BLOCKS typecheck + tests)

**Affected files:**

- [plop-templates/experiment/profiles/interaction/component.tsx.hbs](plop-templates/experiment/profiles/interaction/component.tsx.hbs) line 4
- [plop-templates/experiment/profiles/dom-effect/component.tsx.hbs](plop-templates/experiment/profiles/dom-effect/component.tsx.hbs) line 3

**Root cause:** These templates import from `motion/react`, but only `framer-motion@12.23.26` is installed. The `motion` npm package is NOT installed and `framer-motion` does NOT re-export through `motion/react`. All 23 existing source files in the codebase import from `framer-motion`.

**Fix:** Change the import path from `motion/react` to `framer-motion` in both templates. This is consistent with every other file in the codebase. The alternative (installing `motion`) would require a broader migration of all 23 existing files, which STATUS.md explicitly lists as a P3 task ("Not started").

For `interaction/component.tsx.hbs`:

```
// Before
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
// After
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
```

For `dom-effect/component.tsx.hbs`:

```
// Before
import { motion } from 'motion/react';
// After
import { motion } from 'framer-motion';
```

### Bug 2: Flaky `life-3d` test (pre-existing, unrelated)

**File:** [src/components/experiments/life-3d/Life_3d.test.tsx](src/components/experiments/life-3d/Life_3d.test.tsx) lines 21-30

**Root cause:** The "step updates the grid" test seeds a tiny 3x3x3 grid with density 0.3 and asserts the next generation differs. With only 27 cells and low density, the grid can reach a fixed point in one step, making this probabilistic assertion fail intermittently.

**Fix:** Use a deterministic setup instead of random seeding. Manually set a known pattern (e.g., a blinker or glider equivalent) that is guaranteed to change after one step. Alternatively, increase grid size to 10x10x10 with density 0.5 to make the probabilistic failure astronomically unlikely.

### Templates that passed audit (no issues)

- **blank** -- React-only, no external imports
- **r3f-scene** -- `@react-three/fiber`, `@react-three/drei`, `three` (all installed)
- **r3f-shader** -- `@react-three/fiber`, `three` (all installed)
- **scrollytelling** -- `gsap`, `gsap/ScrollTrigger`, `@gsap/react`, `lenis/react` (all installed)
- **web-audio** -- React-only + browser-native Web Audio API

### Re-Run Plan

After fixes, re-scaffold `magnetic-card` with the interaction profile and run the full Test 1 sequence. This time, **pause after the validation step** and present the manual checklist so the user can verify in their browser before cleanup proceeds.