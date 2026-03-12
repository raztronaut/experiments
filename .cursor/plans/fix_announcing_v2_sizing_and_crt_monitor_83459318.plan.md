---
name: Fix Announcing V2 Sizing and CRT Monitor
overview: Fix the preloader sizing and image, and correct the 3D CRT monitor implementation to match the reference (lighting, camera position, and mouse interaction).
todos:
  - id: fix-preloader
    content: Update PreloaderSection image and typography sizing
    status: pending
  - id: fix-crt-camera
    content: Fix CRT monitor camera position and tone mapping
    status: pending
  - id: fix-crt-interaction
    content: Fix CRT monitor mouse interaction and hover previews
    status: pending
isProject: false
---

# Fix Announcing V2 Sizing and CRT Monitor

## Overview

Address the issues with the preloader section's sizing and image, and fix the 3D CRT monitor so it properly follows the mouse, displays the correct lighting, and updates previews on hover.

## Steps

1. **Preloader Section Fixes**
  - Update the background image to use `/experiments/blank/death.jpg`.
  - Adjust the `h1` font size from `clamp(5rem, 18.5vw, 20rem)` to `clamp(4rem, 12vw, 15rem)` so it fits on one line.
  - Change the font family of the `h1` to `"Instrument Serif", serif` to better match the condensed serif look of the reference.
2. **CRT Monitor Fixes**
  - **Camera Position**: Update `camera.position.z` dynamically in `useFrame` based on the canvas size (`Math.max(1, 768 / size.width)`) to match the reference's responsive scaling.
  - **Mouse Interaction**: Add `pointer-events: none` to the `.showcase-canvas-wrap` in `ShowcaseSection.tsx` so that mouse events can properly bubble up to the section and trigger the `mousemove` listener.
  - **Lighting/Tone Mapping**: Change the `toneMapping` value in `ExperimentCanvas` from `6` (AgX/Custom) to `4` (`THREE.ACESFilmicToneMapping`) to fix the overly dark rendering of the monitor model.
  - **Hover Previews**: Ensure the `loadTexture` callback safely checks and casts `t.image` before calculating the aspect ratio, preventing potential errors that could break the render loop during texture loading.

