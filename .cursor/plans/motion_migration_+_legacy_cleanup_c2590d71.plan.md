---
name: Motion Migration + Legacy Cleanup
overview: Migrate from `framer-motion` to the `motion` package (changing 24 source file imports to `motion/react`), update all agent docs/README, and remove all 16 legacy experiment test files that provide no ongoing value.
todos:
  - id: pkg-swap
    content: npm uninstall framer-motion && npm install motion
    status: completed
  - id: imports-24
    content: Change 24 source files from 'framer-motion' to 'motion/react'
    status: completed
  - id: delete-16-tests
    content: Delete all 16 legacy experiment test files
    status: completed
  - id: update-agents-md
    content: "Update .agent/AGENTS.md: Motion line (remove Framer Motion parenthetical)"
    status: completed
  - id: update-toolkit
    content: "Update .agent/contexts/toolkit.md: remove '(as framer-motion)' note"
    status: completed
  - id: update-status
    content: "Update .agent/STATUS.md: mark migration done, remove from P3 placeholders"
    status: completed
  - id: update-readme
    content: "Update README.md: Framer Motion -> Motion (motion/react)"
    status: completed
  - id: verify-typecheck
    content: Run npm run typecheck -- must pass
    status: completed
  - id: verify-tests
    content: Run npx vitest --run --project unit -- 2 remaining tests pass
    status: completed
  - id: verify-validate
    content: Run validate-experiments.mjs -- 18 valid
    status: completed
  - id: rerun-test1
    content: "Re-run Test 1: scaffold magnetic-card, verify, PAUSE for manual check, then delete"
    status: completed
isProject: false
---

# Migrate to `motion/react` + Remove Legacy Tests

## Part 1: Package Migration

**Swap `framer-motion` for `motion`** -- the official successor package. Motion 12 is a drop-in replacement; the only change is the import path.

```bash
npm uninstall framer-motion && npm install motion
```

This installs the `motion` package, which exports `motion/react` as the React entry point. Since framer-motion v12 and motion v12 are the same codebase (just different package names), there are zero API breaking changes.

## Part 2: Source File Import Migration (24 files)

Change `from 'framer-motion'` to `from 'motion/react'` in all 24 source files:

**Experiment components (14 files):**

- `src/components/experiments/send-button/SendButton.tsx`
- `src/components/experiments/send-button/AnimatedSendButton.tsx`
- `src/components/experiments/send-button/AnimatedPlaceholder.tsx`
- `src/components/experiments/send-button/ExpandedControls.tsx`
- `src/components/experiments/send-button/ThemeSwitch.tsx`
- `src/components/experiments/velocity-responsive-design/VelocityResponsiveDesign.tsx`
- `src/components/experiments/velocity-responsive-design/VelocityContext.tsx`
- `src/components/experiments/velocity-responsive-design/VelocityText.tsx`
- `src/components/experiments/velocity-responsive-design/VelocityImage.tsx`
- `src/components/experiments/velocity-responsive-design/VelocityCodeBlock.tsx`
- `src/components/experiments/transit-airport-split-flap-display/TransitAirportSplitFlapDisplay.tsx`
- `src/components/experiments/transit-airport-split-flap-display/SplitFlapCell.tsx`
- `src/components/experiments/cursor-depth-explorer/InfoModal.tsx`
- `src/components/experiments/rabbithole-chat-preloader/RabbitholeChatPreloader.tsx`

**Shared UI (9 files):**

- `src/components/ui/ArticleLayout.tsx`
- `src/components/ui/AIWidget.tsx`
- `src/components/ui/ScrambleTicker.tsx`
- `src/components/ui/LocationStatus.tsx`
- `src/components/ui/location/TimePill.tsx`
- `src/components/ui/location/SocialPills.tsx`
- `src/components/ui/location/LocationPill.tsx`
- `src/components/ui/location/WeatherPill.tsx`
- `src/components/ui/experiments/MobileSwipeTutorialOverlay.tsx`

**1 plan file** (not critical but for consistency):

- `.cursor/plans/v2_platform_full_audit_5c004cca.plan.md`

The plop templates (`interaction/component.tsx.hbs`, `dom-effect/component.tsx.hbs`) already use `motion/react` -- no changes needed there.

## Part 3: Remove Legacy Experiment Tests (16 files)

All 18 experiments are `"status": "shipped", "legacy": true`. These tests were created during early development with lower-quality AI models and provide no ongoing value. The experiments are functional and stable. Delete all 16 test files:

- `src/components/experiments/404-not-found/404NotFound.test.tsx`
- `src/components/experiments/basketball-replay-center/BasketballReplayCenter.test.tsx`
- `src/components/experiments/bugged-out-game-of-life-shader-experiment/BuggedOutGameOfLifeShaderExperiment.test.tsx`
- `src/components/experiments/cursor-depth-explorer/CursorDepthExplorer.test.tsx`
- `src/components/experiments/game-of-life-shader/GameOfLifeShader.test.tsx`
- `src/components/experiments/gravity-physics-ui-layout/GravityPhysicsUiLayout.test.tsx`
- `src/components/experiments/keyboard-keys/KeyboardKeys.test.tsx`
- `src/components/experiments/life-3d/Life_3d.test.tsx`
- `src/components/experiments/mountain-transition/MountainTransition.test.tsx`
- `src/components/experiments/non-euclidean-hyperbolic-workspace/HyperbolicMath.test.ts`
- `src/components/experiments/non-euclidean-hyperbolic-workspace/NonEuclideanHyperbolicWorkspace.test.tsx`
- `src/components/experiments/rabbithole-chat-gallery-explore/RabbitholeChatGalleryExplore.test.tsx`
- `src/components/experiments/test/Test.test.tsx`
- `src/components/experiments/transit-airport-split-flap-display/TransitAirportSplitFlapDisplay.test.tsx`
- `src/components/experiments/velocity-responsive-design/VelocityContext.test.tsx`
- `src/components/experiments/velocity-responsive-design/VelocityResponsiveDesign.test.tsx`

**Keep** the 2 non-experiment test files:

- `src/lib/experiments.test.ts` (tests `getExperiments()` utility)
- `src/components/ui/MobileBlocker.test.tsx` (tests shared UI)

Going forward, the plop test template (`component.test.tsx.hbs`) still generates a smoke test for new experiments, which is the right behavior -- new experiments get tested, legacy ones don't carry dead weight.

## Part 4: Documentation Updates

### Files that already use `motion/react` (no changes needed):

- `.agent/skills/motion-react.md`
- `.agent/profiles/interaction.md`
- `.agent/profiles/dom-effect.md`
- `.agent/contexts/architecture.md`
- `.agent/workflows/develop-experiment.md`
- `.agent/workflows/new-experiment.md`
- `.agent/workflows/add-experiment-component.md`

### Files that need updates:

**[.agent/AGENTS.md](.agent/AGENTS.md)** line 44:

```
# Before
- **Motion** (Framer Motion) -- React layout animations, gestures, springs
# After
- **Motion** -- React layout animations, gestures, springs (`motion/react`)
```

**[.agent/contexts/toolkit.md](.agent/contexts/toolkit.md)** line 13:

```
# Before
| **Motion** | 12.x | `motion/react` | ... | YES (as `framer-motion`) |
# After
| **Motion** | 12.x | `motion/react` | ... | YES |
```

**[.agent/STATUS.md](.agent/STATUS.md)** line 163:

- Remove the `framer-motion -> motion/react migration | Not started` row from the P3 placeholders table
- Add it to the "What Was Done" section or note it as completed

**[README.md](README.md)** line 47:

```
# Before
- **Animation**: Framer Motion
# After
- **Animation**: Motion (motion/react)
```

## Part 5: Verification

After all changes:

1. `npm run typecheck` -- must pass clean
2. `npx vitest --run --project unit` -- should run only the 2 remaining test files + pass
3. `node scripts/validate-experiments.mjs` -- 18 experiments valid
4. Re-run Test 1 (scaffold magnetic-card, full verification with manual pause, then cleanup)

