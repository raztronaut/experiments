---
name: Fix Biome Revert Issue
overview: Restore all lost work from stash@{1} (138 files of unstaged changes lost by lefthook), fix Biome's aggressive assist actions to prevent future silent reverts, and clean up safe-to-drop stashes.
todos:
  - id: restore-mdx
    content: "Restore 4 MDX component files from stash@{1}: InteractiveWidget.tsx, LiveDemo.tsx, components.tsx, index.ts"
    status: completed
  - id: restore-announcing-v2
    content: Restore announcing-v2 orchestrator + CRT shader + data + store changes from stash@{1} (new section files are already untracked on disk)
    status: completed
  - id: restore-infrastructure
    content: "Restore infrastructure changes from stash@{1}: experiments.ts, articles.ts, validate-experiments, generate-registry-json (scanMdx), generate-llms-txt, delete-article, next.config.ts, source.config.ts"
    status: completed
  - id: restore-ui
    content: "Restore UI additions from stash@{1}: article badges on ExperimentGridCard/ListItem/PreviewDrawer, PageActions in ArticleLayout, JSON-LD on homepage"
    status: completed
  - id: restore-velocity-article
    content: Restore velocity-responsive-design article/components.tsx (Range/ControlGroup controls instead of raw inputs)
    status: completed
  - id: restore-experiment-metadata
    content: "Restore experiment.json + layout.tsx changes from stash@{1}: listing/status/content system, publishable field, robots meta"
    status: completed
  - id: fix-biome-assist
    content: Add assist action overrides to biome.jsonc to disable useSortedAttributes, useSortedInterfaceMembers, useSortedProperties
    status: completed
  - id: verify
    content: Run tsc --noEmit and ultracite check, verify build passes
    status: completed
  - id: cleanup-stashes
    content: Drop all 3 lefthook auto backup stashes (stash@{2} and stash@{3} are safe, stash@{1} after restore)
    status: completed
isProject: false
---

# Restore Lost Work + Fix Biome Auto-Revert

## What Happened

Lefthook's pre-commit hook creates a "backup stash" of unstaged changes before running `ultracite fix` on staged files. If the stash pop fails after the commit, unstaged work is silently lost. This happened 3 times, creating stashes `@{1}`, `@{2}`, and `@{3}`.

**Full audit results:**

- `stash@{2}` and `stash@{3}`: **Nothing lost.** HEAD already has everything, often improved. Safe to drop.
- `stash@{1}`: **138 files of lost work** across 7 categories. This is the one that matters.

---

## Part 1: Restore from `stash@{1}` -- by category

### 1A. MDX Component System (MEDIUM priority)

4 files. Compound InteractiveWidget, rich LiveDemo, full component wiring.


| File                                                              | HEAD                               | stash@{1}                                                                                                                                                                   |
| ----------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [InteractiveWidget.tsx](src/components/mdx/InteractiveWidget.tsx) | 21-line bare wrapper               | 95-line compound component: `Preview`/`Controls` sub-components via Symbol roles, `layout` prop (bottom/sidebar), `cn` import                                               |
| [LiveDemo.tsx](src/components/mdx/LiveDemo.tsx)                   | 55-line simplified figcaption      | 76-line rich UI: live indicator badge with green dot, SVG external-link icon, border-based status bar                                                                       |
| [components.tsx](src/components/mdx/components.tsx)               | Registers 6 components, raw `<h2>` | Registers 15 components (adds BeforeAfterImage, Checkbox, ControlGroup, Range, Switch, Details, Fullbleed, HeadingLink, Pill, Slideshow), `h2`/`h3` mapped to `HeadingLink` |
| [index.ts](src/components/mdx/index.ts)                           | Exports 8 items                    | Exports 14 items (adds all new components)                                                                                                                                  |


**Action:** `git show stash@{1}:<file> > <file>` for each, then run `ultracite fix` to normalize formatting.

### 1B. Announcing-V2 Overhaul (HIGH priority)

Complete redesign: 3D scenes, premium CRT shader, new sections. The stash has the **orchestrator changes** (modifications to existing files). The new section/canvas files are **already on disk as untracked files**.


| File                                                                                         | What stash@{1} changes                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [AnnouncingV2.tsx](src/components/experiments/announcing-v2/AnnouncingV2.tsx)                | Imports new sections (BlueprintSection, ProcessSection, MissionControlSection, ClosingSection), `ExperimentCanvas` with 3D scenes, `ProgressIndicator`. Removes FiddleHover/Inversa references.              |
| [CRTMonitor.tsx](src/components/experiments/announcing-v2/canvas/CRTMonitor.tsx)             | Premium rewrite: frame-rate-independent damping, extracted `useTextureSwap` hook, `Environment` HDR with shadows, branchless aspect-ratio UV, `ResponsiveCamera` extracted, GLTF disposal, `new-monitor.glb` |
| [crtShader.ts](src/components/experiments/announcing-v2/shaders/crtShader.ts)                | CRT barrel distortion, RGB subpixel simulation, scanlines, phosphor glow, dithering                                                                                                                          |
| [data.ts](src/components/experiments/announcing-v2/data.ts)                                  | New content blocks: BLUEPRINT_CONTENT, PROCESS_CONTENT, MISSION_CONTROL_CONTENT. Removes INVERSA_CONTENT, FIDDLE_CONTENT, GRID_SYMBOLS                                                                       |
| [store.ts](src/components/experiments/announcing-v2/store.ts)                                | Adds `blueprintProgress`, renames `scrollProgress` to `processProgress`                                                                                                                                      |
| [ShowcaseSection.tsx](src/components/experiments/announcing-v2/sections/ShowcaseSection.tsx) | Moves inline styles to external CSS file                                                                                                                                                                     |


**Stash also DELETES** (HEAD still has, should remove):

- `FiddleHoverSection.tsx`, `InversaSection.tsx`, `fiddle-hover-section.css`, `inversa-section.css`
- `heroShader.ts`, `hooks/index.ts`, `hooks/useFiddleGrid.ts`, `hooks/useInversaScroll.ts`

**Already on disk (untracked, just need to be committed):**

- `canvas/ResponsiveCamera.tsx`, `canvas/useTextureSwap.ts`, `canvas/ExperimentCanvas.tsx`
- `canvas/MissionControlCanvas.tsx`, `canvas/TempleScene.tsx`, `canvas/VolumetricLightScene.tsx`
- `sections/BlueprintSection.tsx`, `ClosingSection.tsx`, `MissionControlSection.tsx`, `ProcessSection.tsx`
- `sections/blueprint-section.css`, `mission-control-section.css`, `process-section.css`, `showcase-section.css`
- `ui/ProgressIndicator.tsx`, `shaders/volumetricLight.ts`, `shaders/particleSwirl.ts`
- `hooks/useDeviceCapabilities.ts`, `hooks/usePrefersReducedMotion.ts`, `canvas/console/`

**Action:** Restore stash versions of the 6 modified files. Delete the 8 removed files. The untracked new files are already on disk.

### 1C. Infrastructure / Scripts (HIGH priority)

Metadata system overhaul + content pipeline improvements across 8 files.


| File                                                             | What stash@{1} changes                                                                                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [experiments.ts](src/lib/experiments.ts)                         | Adds `content` and `publishable` to schema, `archived` status, simplifies filtering (removes `showDevContent` gating)         |
| [articles.ts](src/lib/articles.ts)                               | Removes `showDevContent` gating, removes `status`/`listing` from Article type, simpler article returns                        |
| [validate-experiments.mjs](scripts/validate-experiments.mjs)     | Adds `content` field cross-validation against disk files, `publishable` consistency checks                                    |
| [generate-registry-json.mjs](scripts/generate-registry-json.mjs) | Adds `scanMdx()` (~150 lines) to auto-discover MDX components for registry, `@/hooks/` import resolution, `unlisted` handling |
| [generate-llms-txt.mjs](scripts/generate-llms-txt.mjs)           | Adds Content API docs (.mdx endpoints), `.mdx` article links, `archived` filtering                                            |
| [delete-article.mjs](scripts/delete-article.mjs)                 | Adds `content` block cleanup and `publishable` reset when deleting articles                                                   |
| [next.config.ts](next.config.ts)                                 | Adds `.mdx` rewrite rules for experiments and articles                                                                        |
| [source.config.ts](source.config.ts)                             | Adds `docs.postprocess.includeProcessedMarkdown: true`                                                                        |


**Action:** Restore each file from stash. These are coordinated changes -- they depend on the new `content`/`publishable` fields in experiment.json (Part 1F).

### 1D. UI Components (LOW priority)

Article discoverability badges and actions.


| File                                                                                     | What stash@{1} changes                                              |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [ExperimentGridCard.tsx](src/components/ui/experiments/ExperimentGridCard.tsx)           | Adds article badge (FileText icon when `content?.article` exists)   |
| [ExperimentListItem.tsx](src/components/ui/experiments/ExperimentListItem.tsx)           | Adds same article badge                                             |
| [ExperimentPreviewDrawer.tsx](src/components/ui/experiments/ExperimentPreviewDrawer.tsx) | Adds "Read Article" button linking to `/experiments/{slug}/article` |
| [ArticleLayout.tsx](src/components/ui/ArticleLayout.tsx)                                 | Adds `PageActions` component (markdown URL), `mt-8` wrapper         |


**Action:** Restore from stash. Minor additions, low risk.

### 1E. Velocity-Responsive-Design Article (LOW priority)


| File                                                                                                                         | What stash@{1} changes                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [article/components.tsx](src/app/experiments/(velocity-responsive-design)/velocity-responsive-design/article/components.tsx) | Replaces raw `<input type="range">` with `<Range>` and `<ControlGroup>` MDX controls. Minor velocity waveform drawing improvements. |


**Action:** Restore from stash. Depends on MDX controls being wired up (Part 1A).

### 1F. Experiment Metadata + Layouts (HIGH priority, highest risk)

**ALL experiment.json and layout.tsx files** changed. This is the most architecturally significant change -- a coordinated rename/restructure across ~40 files.

**experiment.json changes:**

- Adds `"content"` block (tracks article, labNote, architecture, snippet, social, changelog)
- Adds `"publishable"` flag
- Listing values restructured

**layout.tsx changes:**

- Adds filesystem-based article detection (`existsSync`)
- Poster path derivation from video field
- `robots` meta (public experiments indexed, others not)
- `rel="me"` on social links

`**src/app/(main)/page.tsx`:**

- Adds JSON-LD structured data (`generateExperimentListJsonLd`)
- `rel="me"` on social links (IndieWeb microformat)

**Risk:** These touch every experiment. Need careful diffing per-file to avoid reverting legitimate HEAD improvements (e.g. layout.tsx in HEAD has ThemeProvider wrapping that stash@{3} didn't have -- stash@{1} may or may not have it).

**Action:** Extract the metadata/layout changes file-by-file. Compare each experiment.json/layout.tsx pair before blindly restoring.

---

## Part 2: Fix Biome Assist

Add to [biome.jsonc](biome.jsonc):

```jsonc
"assist": {
  "actions": {
    "source": {
      "useSortedAttributes": "off",
      "useSortedInterfaceMembers": "off",
      "useSortedProperties": "off"
    }
  }
}
```

---

## Part 3: Clean Up Stashes

- `stash@{2}` and `stash@{3}`: drop immediately (nothing lost, confirmed)
- `stash@{1}`: drop after all restorations are complete and verified

---

## Part 4: Verify

- `npx tsc --noEmit`
- `npx ultracite check`
- `npm run build` (full build including generation scripts)
- Spot-check announcing-v2 and velocity-responsive-design in browser

