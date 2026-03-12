---
name: Phase 4 isPlaceholder removal
overview: Replace the manual `isPlaceholder` boolean with automatic media-derived badge logic across the scaffold, components, type interface, and all 16 experiment.json files.
todos:
  - id: 4a-scaffold
    content: "Update plopfile.js: remove isPlaceholder from template, set image to empty string, remove no-preview.gif copy action"
    status: completed
  - id: 4b-components
    content: Update InteractivePreviewMedia.tsx and StaticExperimentMedia.tsx badge condition to !experiment.video && !experiment.image
    status: completed
  - id: 4c-interface
    content: Remove isPlaceholder from Experiment interface in src/lib/experiments.ts
    status: completed
  - id: 4c-json-false
    content: "Remove isPlaceholder: false from 14 experiment.json files"
    status: completed
  - id: 4c-json-test
    content: "Remove isPlaceholder: true from test/experiment.json AND set image to empty string"
    status: completed
  - id: 4c-json-terminal-cat
    content: "Remove isPlaceholder: true from terminal-cat/experiment.json (keep image as-is)"
    status: completed
  - id: verify
    content: Run linter checks and validate-experiments script to confirm no regressions
    status: completed
  - id: todo-1772846064928-fwnr9rq7v
    content: ""
    status: pending
isProject: false
---

# Phase 4: Replace `isPlaceholder` with Media-Derived Badge

The "NO PREVIEW YET" badge currently relies on a manual `isPlaceholder: boolean` flag. This phase makes it automatic: the badge shows whenever `!experiment.video && !experiment.image` -- i.e., when there's genuinely no preview media.

---

## 4A: Update scaffold to stop faking media

**File: [plopfile.js](plopfile.js)** (lines 82-129)

In the experiment.json template (line 82-100):

- Change `"image"` from `"/experiments/{{dashCase name}}/preview.gif"` to `""`
- Remove `"isPlaceholder": true` from the template object
- Keep `"video": ""` as-is (already empty string)

Remove the no-preview.gif copy action (lines 107-129) -- the entire custom function that copies `public/experiments/no-preview.gif` to `public/experiments/<slug>/preview.gif`.

Result: new experiments get empty `image` and `video`, no fake placeholder GIF, no `isPlaceholder` field.

---

## 4B: Make badge media-derived in components

**File: [InteractivePreviewMedia.tsx](src/components/ui/experiments/InteractivePreviewMedia.tsx)** (line 121)

Replace:

```tsx
{experiment.isPlaceholder && (
```

With:

```tsx
{!experiment.video && !experiment.image && (
```

**File: [StaticExperimentMedia.tsx](src/components/ui/experiments/StaticExperimentMedia.tsx)** (line 125)

Same change -- replace `experiment.isPlaceholder` with `!experiment.video && !experiment.image`.

---

## 4C: Clean up interface and data

**File: [src/lib/experiments.ts](src/lib/experiments.ts)** (line 25)

Remove `isPlaceholder?: boolean;` from the `Experiment` interface.

**16 experiment.json files -- remove `isPlaceholder` line:**

14 files with `"isPlaceholder": false` (just delete the line):

- `(404-not-found)`, `(non-euclidean-hyperbolic-workspace)`, `(cursor-depth-explorer)`, `(basketball-replay-center)`, `(game-of-life-shader)`, `(bugged-out-game-of-life-shader-experiment)`, `(keyboard-keys)`, `(rabbithole-chat-gallery-explore)`, `(velocity-responsive-design)`, `(life-3d)`, `(transit-airport-split-flap-display)`, `(rabbithole-chat-preloader)`, `(mountain-transition)`, `(gravity-physics-ui-layout)`

2 files with `"isPlaceholder": true` (special handling):

- `**(test)/experiment.json`**: Remove `"isPlaceholder": true` AND set `"image": ""` (its current `preview.gif` is the copied fake placeholder, not real media). After this, `!video && !image` = true, so badge correctly shows.
- `**(terminal-cat)/experiment.json**`: Remove `"isPlaceholder": true` but **keep `image` as-is** (`/experiments/terminal-cat/preview.gif` is a real ASCII art animation, not the placeholder). After this, `!video && !image` = false, so badge correctly hides.

2 files with no `isPlaceholder` field (no changes needed):

- `(send-button)`, `(shader-landing)`

---

## Correctness verification

After all changes, badge behavior:


| Experiment                       | `video`  | `image`  | Badge shows? | Correct?               |
| -------------------------------- | -------- | -------- | ------------ | ---------------------- |
| test                             | none     | `""`     | Yes          | Yes (no real media)    |
| terminal-cat                     | none     | real gif | No           | Yes (real gif preview) |
| send-button                      | real mp4 | real png | No           | Yes (real media)       |
| Any `false` experiment           | real mp4 | varies   | No           | Yes (real media)       |
| Future new WIP                   | `""`     | `""`     | Yes          | Yes (no media yet)     |
| Future WIP with recorded preview | real mp4 | `""`     | No           | Yes (has preview)      |


