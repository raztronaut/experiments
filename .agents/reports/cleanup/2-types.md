# Type Consolidation Report

Scope: all `interface` / `type` declarations under `src/` (Next.js 16 / React 19 / TS strict creative-coding lab). Read-only research; nothing in source/config was modified.

## Critical Assessment

The codebase is, on the whole, healthily compartmentalized. The dominant pattern is one-`Props`-interface-per-component, which is correct and should **not** be consolidated — `FooProps` shapes are intentionally local and coincidental overlap between them is meaningless. The vast majority of the ~180 declarations fall into this category and are out of scope for consolidation.

Real duplication is concentrated in exactly one place: **experiment-metadata shapes**. The `inspiration?: { title: string; url: string }[]` inline object type is hand-copied across four shared/app files, and the broader "experiment record" shape exists as three parallel definitions (`Experiment`, `ExperimentRow`, `RawExperiment`). The first is a clean, safe win; the second is a partial win (only the shared sub-shape should be extracted — the records themselves serve genuinely different layers and should stay distinct).

A second, much weaker cluster is the trivial `Size { width; height }` shape, which appears once in a shared hook and again inside two *separate* experiments. The isolation rule forbids the experiments from sharing anything between themselves, and forcing them to import a 2-field type from `src/lib` is high-churn / near-zero-value, so this is explicitly **not** recommended.

Several "duplicate-looking" names are false positives worth recording so they are not re-flagged later:
- `ReadingState` (×3) and `KeyState` (×2) are duplicated **within a single experiment** — legal to dedupe locally, but low value.
- `Size`, `Props`, `ImageInfo` recur across the two rabbithole experiments — these are **separate** experiments; consolidating them is **forbidden**.
- `ThemeProviderProps` in `ui/ThemeProvider.tsx` and `send-button/ThemeProvider.tsx` are both `import type` from `next-themes`, not redeclarations.
- Registry types (`RegistrySlimItem`, `RegistryItem`, `RegistryFile`, `RegistryItemData`, `UIComponentPreviewEntry`, `MdxPreviewEntry`) live in files knip reports as **unused** — they are removal candidates, not consolidation candidates (see Rec 6).

No type was found that meaningfully redefines a shape already exported by `three`, `@react-three/fiber`, or `gsap`. The 3D experiments correctly consume `THREE.*` types directly (e.g. `rabbithole-chat-gallery-explore/VisualiserLogic.ts` uses `THREE.Camera`/`THREE.Scene`). The only borderline case is local `{ width; height }` shapes vs. `THREE.Vector2`, which is not a real overlap (DOM pixels, not vectors).

## Recommendations

### 1. Extract `InspirationLink` for the repeated inline `{ title: string; url: string }[]`
**Confidence: High**

The exact inline shape is copy-pasted in four places, all of which already import from `@/lib/experiments`:

- `src/lib/experiments.ts:47` (`Experiment.inspiration`)
- `src/app/(main)/dev/_components/types.ts:39` (`ExperimentRow.inspiration`)
- `src/app/(main)/dev/_components/types.ts:171` (`computeCompleteness` param)
- `src/app/(main)/dev/page.tsx:53` (`RawExperiment.inspiration`)

**Proposed shared location:** `src/lib/experiments.ts` — add `export interface InspirationLink { title: string; url: string }` and reference it (`inspiration?: InspirationLink[]`) in all four sites.

**Isolation note:** None of the four files are experiment components; all are shared lib / `(main)/dev` app code that already depend on `@/lib/experiments`. No isolation violation. Safe to implement.

### 2. Extract the shared experiment-metadata sub-shape only; keep the three records distinct
**Confidence: Medium**

Three near-parallel "experiment record" shapes exist:

- `Experiment` — `src/lib/experiments.ts:40` (runtime/site model, has `href`, `poster`, `articleHref`)
- `ExperimentRow` — `src/app/(main)/dev/_components/types.ts:33` (dashboard model, adds `completenessScore`, `surfaces`, `missingFields`, `listingExplicit`)
- `RawExperiment` — `src/app/(main)/dev/page.tsx:48` (loosely-typed `experiment.json` parse, all-string enums)

They overlap heavily on the *editorial* fields (`slug`, `title`, `description`, `created`, `tags`, `tech`, `profile`, `complexity`, `listing`, `legacy`, `related`, `updated`, `video`, `inspiration`). I recommend extracting **only** that common editorial core into a shared base (e.g. `ExperimentMetaBase` in `src/lib/experiments.ts`) and having `Experiment` / `ExperimentRow` `extends` it, rather than merging the three records. The records legitimately diverge: `RawExperiment` is deliberately stringly-typed pre-validation, and `ExperimentRow` carries derived dashboard state that has no place in the site model. Full unification would couple the dev dashboard to the public model and is not advised.

**Proposed shared location:** `src/lib/experiments.ts` (base interface), consumed by `types.ts` and `page.tsx`.

**Isolation note:** All three files are shared lib / `(main)/dev` app code. No experiment is involved; no isolation violation. Medium confidence because the field sets only partially overlap and the extraction must be done carefully (optional-vs-required mismatches between `Experiment` and `ExperimentRow`).

### 3. Drop the `export` keyword on internally-only types flagged by knip (removal, not consolidation)
**Confidence: High**

knip's "Unused exported types" list marks these as exported-but-never-imported. Several are still used *inside their own module*, so the fix is to un-export, not delete:

- `Stats` — `src/app/(main)/dev/_components/types.ts:62` (used by `DashboardData` in same file → just remove `export`)
- `ArticleFrontmatter` — `src/lib/articles.ts:123` (used by `ArticleContent` in same file → remove `export`)
- `ReplayGridProps` — `src/components/experiments/basketball-replay-center/ReplayGrid.tsx:29`
- `UmamiEventName` — `src/hooks/useUmami.ts:20`
- `RadioGroupProps` / `RadioItemProps` — `src/components/mdx/controls/Radio.tsx:19,51`

**Proposed action:** verify each is used in-file; if so drop `export`, if not delete. Not a consolidation target — listed here so it is not mistaken for one.

**Isolation note:** `ReplayGridProps` lives inside one experiment; the change is internal to that experiment. No violation.

### 4. (Optional, low value) Locally dedupe `ReadingState` and `KeyState` within their own experiments
**Confidence: Low**

- `ReadingState = "detailed" | "skim"` is declared 3× inside the **velocity-responsive-design** experiment: `VelocityContext.tsx:17`, `hooks/useVelocityEngine.ts:7`, and a copy in `docs/snippet.md:17` (docs, ignore). The two real ones could be defined once in that experiment's own module (e.g. a local `types.ts` or `VelocityContext.tsx`) and imported intra-experiment.
- `KeyState = "idle" | "active" | "completed" | "error" | "success"` is declared 2× inside the **keyboard-keys** experiment: `Key.tsx:5` and `KeyboardKeys.tsx:7`.

**Proposed shared location:** within each experiment's own directory only.

**Isolation note:** Fully intra-experiment; legal. Low confidence/priority — these are tiny string unions and the duplication is contained. Safe but marginal.

### 5. Do NOT consolidate `Size` / `Props` / `ImageInfo` across experiments
**Confidence: Low — do-not-implement**

- `Size { height; width }`: `src/hooks/useElementSize.ts:3` (shared, unexported), `rabbithole-chat-gallery-explore/VisualiserLogic.ts:5`, and `rabbithole-chat-preloader/Gallery.ts` shape.
- `Props` and `ImageInfo`: declared independently in both `rabbithole-chat-gallery-explore/VisualiserLogic.ts` and `rabbithole-chat-preloader/Gallery.ts`.

`rabbithole-chat-gallery-explore` and `rabbithole-chat-preloader` are **two separate experiments**. Sharing a type between them — even via a re-export — would create a cross-experiment dependency, which AGENTS.md explicitly forbids ("No cross-experiment imports"). Extracting `Size` to `src/lib` is technically allowed (it's a shared location), but it is a trivial 2-field type and forcing isolated experiments to import it adds coupling for no real benefit. **Marked do-not-implement.**

### 6. Registry/MDX exported types are dead code — route to removal, not consolidation
**Confidence: Medium**

knip reports the entire `src/components/registry/*` set (and several `src/components/mdx/*` re-exports) as **unused files / unused exports**. Types declared there — `RegistrySlimItem` (`RegistryGrid.tsx:8`), `RegistryItem` (`opengraph-image.tsx:8`), `RegistryFile` + `RegistryItemData` (`RegistrySourceCode.tsx:6,14`), `UIComponentPreviewEntry`, `MdxPreviewEntry`, and the `controls/index.ts` `*Props` re-exports — superficially look like duplicated "registry item" shapes but should be handled by the **dead-code pass**, not consolidated. Consolidating types that are about to be deleted is wasted effort.

**Isolation note:** None are experiment-local except via shared registry tooling; defer to the unused-code report.

---

### Out of scope (confirmed false positives)
Per-component `*Props` interfaces (the large majority of declarations), `ExperimentMetrics` vs `Stats` (perf telemetry vs dashboard counts — different concepts), `RouteContext` in the two `llms.mdx` route handlers (Next.js route-handler boilerplate, framework-shaped, not worth a shared type), and all `THREE.*`-derived usage (correctly imported from `three`, not redeclared).
