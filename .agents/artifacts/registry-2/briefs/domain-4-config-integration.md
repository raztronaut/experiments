## Domain 4: Config & Pipeline Integration

**Scope**: Create `registry.config.json` for curation rules and update `package.json` scripts to wire the 3-step pipeline.
**Complexity**: mechanical

### Context to Read First

- `.agents/temp/orchestration/plan.md` -- the orchestration plan with the `registry.config.json` schema contract
- `package.json` -- current scripts section (specifically the `generate:registry` script)
- `scripts/generate-registry.mjs` -- read lines 381-389 to see which experiments are currently excluded (`EXCLUDE_EXPERIMENTS`)
- `public/registry/index-slim.json` -- read to see which items currently exist and their metadata (for populating featured/hidden lists)
- `AGENTS.md` -- project conventions

### Shared UI Inventory (for config completeness)

These files exist in `src/components/ui/` and should be considered for scanning:
- ExperimentDrawerList.tsx, ThemeAwareWaves.tsx, SiteFooter.tsx, scroll-area.tsx, sonner.tsx
- ExperimentList.tsx, MobileBlocker.tsx, ArticleLayout.tsx, ThemeProvider.tsx, separator.tsx
- AIWidget.tsx, drawer.tsx, ExperimentNav.tsx, icons.tsx, card.tsx
- LocationStatus.tsx, GrainOverlay.tsx, LiquidGlassFilter.tsx, wave-background.tsx
- ConsoleEasterEgg.tsx, ScrambleTicker.tsx, LottieWeatherIcon.tsx, WritingSection.tsx
- ai-icons.tsx, ExperimentErrorBoundary.tsx, badge.tsx, button.tsx

### Hooks Inventory

These files exist in `src/hooks/`:
- useDebug.ts, useTimeOfDay.ts, useMounted.ts, useElementSize.ts, usePreferences.ts
- useLiquidGlassStyle.ts, useWeather.ts, useGSAPDebug.ts, useDevControls.ts
- useMediaQuery.ts, useUmami.ts

### Utilities Inventory

These files exist in `src/lib/`:
- structured-data.ts, experiments.ts, fonts.ts, utils.ts, articles.ts, constants.ts

### Changes to Make

1. **`registry.config.json`** (NEW FILE in project root): Create the curation config:

   ```json
   {
     "$comment": "Curation rules for the registry pipeline. Read by generate-registry-json.mjs.",
     "categories": ["experiments", "components", "hooks", "utilities", "styles"],
     "featured": ["send-button", "404-not-found", "keyboard-keys", "transit-airport-split-flap-display", "gravity-physics-ui-layout"],
     "hidden": ["test"],
     "overrides": {
       "experiment-drawer-list": {
         "description": "macOS-style drawer list with grid/list toggle"
       },
       "grain-overlay": {
         "description": "Subtle film grain overlay effect"
       },
       "scramble-ticker": {
         "description": "Text scramble/ticker animation effect"
       }
     },
     "scan": {
       "experiments": true,
       "sharedUI": true,
       "hooks": true,
       "utilities": ["src/lib/utils.ts", "src/lib/fonts.ts"]
     }
   }
   ```

   Notes on the `featured` selection: pick the 5 most visually impressive/complete experiments based on the existing registry items.

   Notes on `hidden`: `test` is the only item that should be hidden (it's a test fixture).

   Notes on `scan.utilities`: Only `utils.ts` (cn helper) and `fonts.ts` (font definitions) are generally reusable. The others (`experiments.ts`, `articles.ts`, `structured-data.ts`, `constants.ts`) are app-specific.

2. **`package.json`** (MODIFY scripts section only): Update the `generate:registry` script to chain the 3-step pipeline:

   **Current:**
   ```json
   "generate:registry": "node scripts/generate-registry.mjs"
   ```

   **New:**
   ```json
   "generate:registry": "node scripts/generate-registry-json.mjs && node scripts/build-registry.mjs && node scripts/post-process-registry.mjs",
   "generate:registry:legacy": "node scripts/generate-registry.mjs"
   ```

   Keep the old script accessible as `generate:registry:legacy` for fallback during transition.

   Also update the `build` script if it references `generate:registry` -- it should continue to work since we're replacing the content of `generate:registry`, not changing the key. Verify the `build` script chain: `"build": "npm run generate:posters && npm run generate:registry && npm run generate:llms-txt && next build"` -- this should work unchanged.

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/generate-registry-json.mjs` -- owned by Domain 1 (Discovery Script)
- `scripts/build-registry.mjs` -- owned by Domain 2 (Build Script)
- `scripts/post-process-registry.mjs` -- owned by Domain 3 (Post-Process Script)
- `scripts/generate-registry.mjs` -- read-only reference
- Any file in `src/app/(registry)/` -- not in scope
- Any file in `src/components/registry/` -- not in scope
- Any file in `public/registry/` -- not in scope

### Cross-Domain Notes

- **Depends on**: none
- **Produces**: `registry.config.json` -- consumed by Domain 1 (Discovery Script) at runtime. `package.json` scripts -- wires all 3 domains' scripts together.
- **Known interactions**:
  - Domain 1 reads `registry.config.json` with a graceful fallback. If this domain's config file doesn't exist, Domain 1 still works (experiment-only scanning).
  - The `package.json` `generate:registry` script must chain the 3 scripts in order: discover → build → post-process. Use `&&` to ensure each step succeeds before the next runs.
  - The `build` script in package.json already calls `npm run generate:registry` -- no change needed there since we're replacing the content of that npm script.
