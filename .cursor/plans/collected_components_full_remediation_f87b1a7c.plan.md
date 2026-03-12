---
name: Collected Components Full Remediation
overview: "Fix all gaps found in the collected components QA audit: the CSS pipeline gap in `scanCollected()`, missing `prefers-reduced-motion` in 5 components, `curved-text-scroll` decomposition and cleanup bugs, `meta` propagation in `build-registry.mjs`, skill doc updates, and memory/backlog hygiene."
todos:
  - id: pipeline-css-fix
    content: Fix scanCollected() in generate-registry-json.mjs to include co-located .css files in registry files[] array
    status: completed
  - id: pipeline-meta-propagation
    content: Fix build-registry.mjs to propagate meta (source, author, license, tags, tech) to individual public/registry/{slug}.json files
    status: completed
  - id: regenerate-registry-1
    content: Re-run npm run generate:registry and verify all 14 collected items have 2 files (TSX + CSS) and meta in output
    status: completed
  - id: reduced-motion-5
    content: "Add prefers-reduced-motion handling to 5 components: curved-text-scroll, fibonacci-image-orb, image-explosion, physics-tag-cloud, custom-video-player"
    status: completed
  - id: fix-curved-text-scroll
    content: "Fix curved-text-scroll: decompose under 300 lines, fix ScrollTrigger leak, add texture quality, remove no-op useGSAP, add setPixelRatio on resize"
    status: completed
  - id: fix-meta-tech
    content: Set tech field in meta.json for image-explosion and custom-video-player
    status: completed
  - id: regenerate-verify
    content: Re-run tsc --noEmit + npm run generate:registry, verify clean
    status: completed
  - id: update-skill-doc
    content: Update quick-component SKILL.md Phase 4 verify checklist with CSS, MDX, reduced-motion checks
    status: completed
  - id: update-memory-backlog
    content: Add lessons learned to memory.md and add collected review item to backlog t2
    status: completed
isProject: false
---

# Collected Components Full Remediation

Three layers: pipeline infrastructure, component quality, and process/docs.

## Layer 1: Pipeline Infrastructure

### 1A. Fix CSS files missing from registry output

`scanCollected()` in `[scripts/generate-registry-json.mjs](scripts/generate-registry-json.mjs)` (line 728-749) only picks up `.tsx` files. Every collected component has a co-located `styles.css` that the TSX imports (`import "./styles.css"`), but `resolveLocalFiles()` only follows JS/TS import paths -- CSS imports are not resolved.

**Fix**: After the `resolveLocalFiles(entryFilePath)` call (line 744), scan the folder for `.css` files and append them to the `files` array. This is simpler and more reliable than making the import resolver follow CSS paths.

```javascript
// After line 744: const result = await resolveLocalFiles(entryFilePath);
// Add co-located CSS files
const cssFiles = folderEntries
  .filter((f) => f.isFile() && f.name.endsWith(".css"))
  .map((f) => f.name);

for (const cssFile of cssFiles) {
  const cssPath = path.join(folderPath, cssFile);
  result.files.push({
    absolutePath: cssPath,
    name: cssFile,
    relativePath: path.relative(path.join(ROOT_DIR, "src", "components"), cssPath),
    content: await fs.readFile(cssPath, "utf-8"),
  });
}
```

This makes each collected item emit 2 files in `registry.json` (the TSX + the CSS), and `build-registry.mjs` will embed both into the individual JSON. The `inferFileType` function already handles `.css` extensions -- it returns `"registry:file"` with a `target` path.

After the fix, re-run `npm run generate:registry` and verify:

- `registry.json` shows `files.length === 2` for all 14 collected items
- `public/registry/sticky-cards-tilt.json` has 2 entries in `files[]`: one TSX and one CSS

### 1B. Propagate `meta` provenance to individual registry JSONs

`[scripts/build-registry.mjs](scripts/build-registry.mjs)` (line 166-173) builds the output JSON but only copies `name`, `type`, `title`, `description`, `category`. The `meta` field (source URL, author, license, tags, tech) from `registry.json` is not propagated.

**Fix**: Add `meta` to the output object in `build-registry.mjs`:

```javascript
// After line 173: category: item.category,
if (item.meta && Object.keys(item.meta).length > 0) {
  output.meta = item.meta;
}
```

This makes each `public/registry/{slug}.json` include the source attribution, so a consumer fetching the registry item sees provenance. The MDX docs already have this info (read from the manifest), but this closes the loop for programmatic consumers.

---

## Layer 2: Component Quality

### 2A. Add `prefers-reduced-motion` to 5 components

Each needs the standard pattern: check the media query, reveal all content immediately, skip animation. Per `[.agents/rules/animations.md](.agents/rules/animations.md)`, use `gsap.set` for instant states, never leave elements invisible.

`**[curved-text-scroll/CurvedTextScroll.tsx](src/components/collected/curved-text-scroll/CurvedTextScroll.tsx)**`:

- Check `window.matchMedia("(prefers-reduced-motion: reduce)").matches` at the top of the `init()` async function
- If reduced: draw one static grid frame, position letters at their resting spots (midpoint of curves), render one Three.js frame, then return without starting the RAF loop or ScrollTrigger

`**[fibonacci-image-orb/FibonacciImageOrb.tsx](src/components/collected/fibonacci-image-orb/FibonacciImageOrb.tsx)**`:

- Check at the top of `init()`
- If reduced: still load textures and build the sphere (so it's visible), render one frame, but don't start the continuous `requestAnimationFrame` loop. OrbitControls remain active (user-initiated interaction)

`**[image-explosion/ImageExplosion.tsx](src/components/collected/image-explosion/ImageExplosion.tsx)**`:

- Check in `explode()` callback
- If reduced: position all particle images in a visible fan spread using CSS transforms (no physics sim), or simply skip the explosion entirely

`**[physics-tag-cloud/PhysicsTagCloud.tsx](src/components/collected/physics-tag-cloud/PhysicsTagCloud.tsx)**`:

- Check at the top of the `useEffect`
- If reduced: apply the existing `ptc-static-fallback` class (already in `styles.css` -- just needs to be wired up) and return before initializing Matter.js

`**[custom-video-player/CustomVideoPlayer.tsx](src/components/collected/custom-video-player/CustomVideoPlayer.tsx)**`:

- Check in the `mousemove` `useEffect`
- If reduced: skip cursor follow animation, show default cursor. Video playback itself is fine (user-initiated)

### 2B. Fix `curved-text-scroll` (4 sub-issues)

**Decompose under 300 lines** (currently 346):

- Extract `drawGrid()` (~15 lines) and `lerp()` into a top-level helper section outside the component
- Extract the letter position update loop into a named function
- Target: ~290 lines

**Fix ScrollTrigger cleanup leak**:
The `ScrollTrigger.create()` on line ~280 is inside a raw `useEffect`, not inside `useGSAP`. It's never killed on unmount. Store the returned instance and kill it in the cleanup:

```typescript
const st = ScrollTrigger.create({ ... })
// in cleanup:
cleanup = () => {
  st.kill()  // <-- add this
  window.removeEventListener("resize", onResize)
  // ... existing disposal
}
```

**Add missing texture quality settings**:
After creating `cardsTexture` (~line 190), add:

```typescript
cardsTexture.generateMipmaps = true
cardsTexture.minFilter = THREE.LinearMipmapLinearFilter
cardsTexture.magFilter = THREE.LinearFilter
cardsTexture.anisotropy = cardsRenderer.capabilities.getMaxAnisotropy()
```

Without these, cards on the curved plane render blurry, especially at oblique angles.

**Remove no-op `useGSAP`**:
Line 333: `useGSAP(() => {}, { scope: container })` does nothing. Remove it entirely.

**Add missing `setPixelRatio` on resize**:
In the `onResize` handler, add:

```typescript
cardsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
```

### 2C. Fix `meta.json` empty `tech` fields

- `[image-explosion/meta.json](src/components/collected/image-explosion/meta.json)`: Change `"tech": []` to `"tech": ["react"]`
- `[custom-video-player/meta.json](src/components/collected/custom-video-player/meta.json)`: Change `"tech": []` to `"tech": ["react"]`

---

## Layer 3: Process and Docs

### 3A. Update quick-component skill Phase 4

`[.agents/skills/quick-component/SKILL.md](.agents/skills/quick-component/SKILL.md)` Phase 4 (lines 90-97) currently only lists `generate:registry` + `tsc --noEmit`. Add:

```markdown
### Phase 4: Verify

```bash
npm run generate:registry   # picks up the new item (JSON + MDX)
tsc --noEmit                # zero type errors
```

Confirm:

- Item appears in registry output with correct file count (TSX + CSS = 2 files)
- CSS file is included in the registry `files[]` array
- MDX doc generated in `content/registry/collected/`
- `prefers-reduced-motion` is handled (never leave elements invisible)

```

### 3B. Update `memory.md` with lessons learned

Add to the "Learned Workspace Facts" section:

- Quick-component skill works best for GSAP-based scroll components; imperative/3D components (Three.js, Matter.js, physics) need explicit QA for cleanup and reduced motion since they use `useEffect` instead of `useGSAP`
- `useEffect`-based components must explicitly kill ScrollTrigger instances on unmount (not auto-cleaned like `useGSAP` scope)
- Three.js texture quality settings (generateMipmaps, minFilter, magFilter, anisotropy) are easy to lose during porting -- check explicitly
- `scanCollected()` picks up `.tsx` files and co-located `.css` files; both must be present for the registry install flow to work
- Collected components add zero bytes to the Next.js production build -- they exist only as source files serialized into `public/registry/*.json`

### 3C. Add backlog item for collected review

Add to `[.agents/backlog/t2-content-registry.md](.agents/backlog/t2-content-registry.md)`:

```markdown
- [ ] Review 14 collected codegrid components: visual smoke test, verify animations match originals, confirm registry install flow works end-to-end
```

---

## Execution Order

1. **Pipeline fixes first** (1A, 1B) -- these affect all 14 components at once
2. **Re-run `npm run generate:registry`** to verify CSS files appear
3. **Component fixes** (2A, 2B, 2C) -- `curved-text-scroll` gets the most changes
4. **Re-run `tsc --noEmit`** after component changes
5. **Re-run `npm run generate:registry`** to pick up all changes
6. **Docs/process** (3A, 3B, 3C) -- skill, memory, backlog updates

