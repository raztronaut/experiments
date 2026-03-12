---
name: Fix CRT and console warnings
overview: "Fix the broken CRT monitor (root cause: TempusFrameDriver bypasses R3F frame loop), revert visibility-hidden, update agent docs to close the gaps that caused this, document why the gaps existed."
todos:
  - id: fix-tempus-driver
    content: Fix TempusFrameDriver in src/lib/toolkit/r3f.tsx to use R3F advance() instead of gl.render()
    status: completed
  - id: revert-visibility
    content: Revert AnnouncingV2.tsx to conditional rendering with startTransition, remove Zustand preloaderDone
    status: completed
  - id: revert-store
    content: Remove preloaderDone/setPreloaderDone from store.ts
    status: completed
  - id: revert-sections
    content: Remove preloaderDone guards from InversaSection, JeskoJetsSection, FiddleHoverSection
    status: completed
  - id: crt-cleanup
    content: Add texture/video disposal on unmount in CRTMonitor.tsx
    status: completed
  - id: fix-tempus-skill
    content: Fix tempus-raf SKILL.md TempusFrameDriver section to use advance(), add warning about gl.render()
    status: completed
  - id: fix-r3f-skill
    content: Add advance() + frameloop never section to r3f-core SKILL.md
    status: completed
  - id: fix-r3f-rules
    content: Add advance() requirement to .agents/rules/r3f.md under a new External Frame Loop section
    status: completed
  - id: verify-crt
    content: Verify CRT monitor renders, shader works, hover preview works, console is cleaner
    status: completed
  - id: todo-1773169147381-slbm72x63
    content: Do another check for the agent docs to see if anything else needs to be changed/updated
    status: completed
isProject: false
---

# Fix CRT Monitor, Shader Effects, Console Warnings, and Agent Doc Gaps

## Gap Analysis: Why This Happened

### What went wrong

The `TempusFrameDriver` in the toolkit calls `gl.render(scene, camera)` instead of R3F's `advance()`. This means `useFrame` callbacks never fire when using `ExperimentCanvas` with `tempus`. The CRT monitor's entire dynamic behavior (hover, glitch, shader updates, parallax) lives in `useFrame`, so it's completely dead.

### Why the agent docs didn't catch it

Three doc-level gaps created a chain of failure:

**Gap 1: `tempus-raf/SKILL.md` has the wrong pattern.** Lines 131-143 show `gl.render(scene, camera)` as the TempusFrameDriver implementation. Line 158 even claims *"useFrame still works, driven by Tempus"* -- this is false. The pattern was written from a Three.js-centric perspective (call the renderer directly) rather than R3F's abstraction layer. The `invalidate` is destructured at line 132 but never used -- a tell that the author was aware of R3F's frame control API but used the wrong one.

**Gap 2: `r3f-core/SKILL.md` mentions `frameloop: "never"` in a one-liner** (line 567: *"never (external control, e.g., Tempus)"*) without any code example showing how to properly drive it. The skill is 568 lines long, exhaustively covers `useFrame` best practices, but is completely silent about what infrastructure makes `useFrame` actually fire.

**Gap 3: `.agents/rules/r3f.md` has no mention of `advance()` at all.** The rules cover useFrame patterns (delta, clamp, no setState, Zustand getState) but not the mechanism that drives it.

**Root cause**: The toolkit `r3f.tsx` was implemented from the wrong skill doc pattern, and no legacy experiment ever used `ExperimentCanvas tempus` + `useFrame` together (they all use raw `Canvas` with R3F's default `frameloop: "always"`). Announcing-v2 is the first experiment to combine them, which is why the bug surfaced now.

### Why I didn't catch it in the first investigation

1. I trusted the agent docs as authoritative without cross-referencing R3F's actual API
2. The tempus-raf skill explicitly showed `gl.render()` as the pattern -- I took it at face value
3. I focused on the console warnings (what was initially asked about) without investigating the CRT functionality
4. I didn't use context7 to look up current R3F docs for `frameloop="never"` best practices
5. I didn't trace through R3F's source to verify that `gl.render()` triggers `useFrame`

---

## Code Fixes

### Fix 1: Repair `TempusFrameDriver` in toolkit

In `[src/lib/toolkit/r3f.tsx](src/lib/toolkit/r3f.tsx)`, replace `gl.render(scene, camera)` with R3F's `advance()`:

```tsx
function TempusFrameDriver() {
  const advance = useThree((s) => s.advance);

  useEffect(() => {
    const dispose = Tempus.add(
      (time) => {
        advance(time / 1000, true);
      },
      { priority: 1 }
    );
    return dispose;
  }, [advance]);

  return null;
}
```

R3F's `advance()` runs all `useFrame` subscribers in priority order THEN renders the scene. The `time / 1000` converts Tempus's millisecond time to R3F's expected seconds. `runGlobalEffects: true` flushes `addEffect`/`addAfterEffect` callbacks.

**Impact**: Toolkit-level fix. Affects any experiment using `ExperimentCanvas tempus`. Currently only announcing-v2.

### Fix 2: Revert `visibility: hidden` approach, restore conditional rendering

In `[src/components/experiments/announcing-v2/AnnouncingV2.tsx](src/components/experiments/announcing-v2/AnnouncingV2.tsx)`:

- Replace the `visibility: hidden` wrapper with the original `{preloaderDone && (<>...</>)}` conditional rendering
- Revert from Zustand `preloaderDone` back to local `useState`
- Use `startTransition` on the reveal to let React break the mount work into smaller chunks

```tsx
import { startTransition, useCallback, useEffect, useRef, useState } from "react";

const [preloaderDone, setPreloaderDone] = useState(false);

const handlePreloaderComplete = useCallback(() => {
  startTransition(() => setPreloaderDone(true));
}, []);
```

In sections (InversaSection, JeskoJetsSection, FiddleHoverSection):

- Remove `useAnnouncingStore` import and `preloaderDone` guard
- Remove `dependencies: [preloaderDone]` from `useGSAP`
- Restore original signatures

### Fix 3: Clean up store

In `[src/components/experiments/announcing-v2/store.ts](src/components/experiments/announcing-v2/store.ts)`, remove `preloaderDone` and `setPreloaderDone` (no longer needed -- local state is simpler).

### Fix 4: CRTMonitor texture disposal

Per `.agents/rules/r3f.md` and `.agents/rules/performance.md`, add cleanup for the module-level `textureCache`:

```tsx
useEffect(() => {
  return () => {
    textureCache.forEach((tex) => {
      if (tex instanceof THREE.VideoTexture) {
        const video = tex.image as HTMLVideoElement;
        video.pause();
        video.src = "";
      }
      tex.dispose();
    });
    textureCache.clear();
    textureLoader = null;
  };
}, []);
```

---

## Agent Doc Fixes

### Doc Fix 1: `tempus-raf/SKILL.md` -- Fix TempusFrameDriver pattern

Replace the broken `gl.render()` pattern in the "R3F Binding" section (lines 122-160) with the correct `advance()` pattern. Add a warning explaining why `gl.render()` is wrong:

```tsx
function TempusFrameDriver() {
  const advance = useThree((s) => s.advance)

  useEffect(() => {
    const dispose = Tempus.add(
      (time) => {
        // advance() runs all useFrame subscribers, then renders.
        // Do NOT use gl.render(scene, camera) -- it bypasses R3F's
        // frame loop and useFrame callbacks will never fire.
        advance(time / 1000, true)
      },
      { priority: 1 }
    )
    return dispose
  }, [advance])

  return null
}
```

Also update the `ExperimentCanvas` blurb to remove the false claim, and add a note about Tempus providing milliseconds vs R3F expecting seconds.

### Doc Fix 2: `r3f-core/SKILL.md` -- Add Frameloop Control section

After the "Frameloop modes" one-liner at line 567, add a new dedicated section:

```markdown
## External Frame Loop (frameloop="never")

When driving R3F from an external source (Tempus, GSAP ticker, custom RAF):

- Set `frameloop="never"` on Canvas
- Call `advance(timestamp)` -- NOT `gl.render(scene, camera)`
- `advance()` runs all useFrame subscribers in priority order, then renders
- `gl.render()` only calls Three.js's renderer -- useFrame callbacks are SKIPPED

`advance()` is available from the store (`useThree((s) => s.advance)`) or as a
global export (`import { advance } from '@react-three/fiber'`).

Timestamp must be in seconds (R3F clock convention). Tempus provides milliseconds,
so divide by 1000.
```

### Doc Fix 3: `.agents/rules/r3f.md` -- Add advance() requirement

Add a new section after "useFrame" rules:

```markdown
## External Frame Loop
When using `frameloop="never"` (e.g., with Tempus via `ExperimentCanvas tempus`):
- Use `advance(timestamp)` to drive the frame loop -- never `gl.render()` directly
- `gl.render()` bypasses R3F's internal loop -- `useFrame` callbacks will not fire
- `advance()` is available via `useThree((s) => s.advance)` or as a global R3F export
```

---

## Files to Modify

**Code (7 files):**

- `[src/lib/toolkit/r3f.tsx](src/lib/toolkit/r3f.tsx)` -- Fix TempusFrameDriver
- `[src/components/experiments/announcing-v2/AnnouncingV2.tsx](src/components/experiments/announcing-v2/AnnouncingV2.tsx)` -- Revert to conditional rendering + startTransition
- `[src/components/experiments/announcing-v2/store.ts](src/components/experiments/announcing-v2/store.ts)` -- Remove preloaderDone
- `[src/components/experiments/announcing-v2/sections/InversaSection.tsx](src/components/experiments/announcing-v2/sections/InversaSection.tsx)` -- Remove guard
- `[src/components/experiments/announcing-v2/sections/JeskoJetsSection.tsx](src/components/experiments/announcing-v2/sections/JeskoJetsSection.tsx)` -- Remove guard
- `[src/components/experiments/announcing-v2/sections/FiddleHoverSection.tsx](src/components/experiments/announcing-v2/sections/FiddleHoverSection.tsx)` -- Remove guard
- `[src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx](src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx)` -- Add disposal

**Agent docs (3 files):**

- `[.agents/skills/tempus-raf/SKILL.md](.agents/skills/tempus-raf/SKILL.md)` -- Fix TempusFrameDriver pattern
- `[.agents/skills/r3f-core/SKILL.md](.agents/skills/r3f-core/SKILL.md)` -- Add External Frame Loop section
- `[.agents/rules/r3f.md](.agents/rules/r3f.md)` -- Add advance() requirement

## What This Will NOT Fix (and why)

- **CSS preload warnings**: Next.js/Turbopack artifact of `ssr: false` dynamic import. Framework-level, not component-level. Dev-mode only.
- **Blob fetch messages**: Normal Three.js GLB loading. Informational, not warnings.
- **Dev-mode scheduler violations**: `startTransition` will reduce but not eliminate these -- they're React dev-mode overhead that doesn't exist in production builds.

