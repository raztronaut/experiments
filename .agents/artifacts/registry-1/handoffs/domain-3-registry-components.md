## Domain 3: Registry Components -- Handoff Summary

**Status**: DONE

### Completed (plan items done)

- 1: RegistryCard.tsx -- client component with hover-to-play video, poster fallback, gradient placeholder, category badge, tech pills, truncated title/description, accessible Link wrapper -- `src/components/registry/RegistryCard.tsx`
- 2: InstallCommand.tsx -- client component with terminal-style pre block, clipboard copy with Copy→Check icon feedback (2s), selectable command text -- `src/components/registry/InstallCommand.tsx`
- 3: ExperimentPreview.tsx -- client component with lazy iframe, loading skeleton (animate-pulse), error state with "Preview unavailable" fallback, bottom bar with title and "Open Full Page" link -- `src/components/registry/ExperimentPreview.tsx`
- 4: RegistryMeta.tsx -- server component with file count badge, dependency count badge, tech accent pills, muted tag pills, flex-wrap layout -- `src/components/registry/RegistryMeta.tsx`

### Extra Discoveries (things found not in the plan)

- None

### Extra Changes (files modified beyond the plan)

- None

### Intentional Skips (plan items NOT done, with reasoning)

- None -- all 4 plan items completed

### Judgment Calls (deviations from the plan)

- Plan showed `videoRef.current!.currentTime = 0` with non-null assertion in the hover-to-play example. Used a guarded `if (!el) return` pattern instead to avoid runtime errors if the ref is null.
- Used `video?.play().catch(() => {})` to silently handle the DOMException that browsers throw when play() is interrupted by a rapid pause() (common with fast mouse enter/leave).
- Biome sorted interface properties alphabetically (e.g., `category` before `description` in RegistryCardProps). This doesn't affect the public API since TypeScript interfaces are structurally typed, but Domain 2 should be aware the property order in the interface differs from the brief's order.
- Brief mentioned IntersectionObserver for ExperimentPreview lazy loading. Used `loading="lazy"` on the iframe instead -- achieves the same goal with zero JS and better browser integration. IntersectionObserver would add complexity without benefit since `loading="lazy"` is supported by all modern browsers.

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain 2 should: import components as named exports: `import { RegistryCard } from "@/components/registry/RegistryCard"` (same pattern for all 4 components)
- Domain 2 should: verify the RegistryCardProps interface matches what they're passing. The `tags` prop is declared but only used in the props interface (not rendered separately from `tech` in the card body) -- if Domain 2 needs visible tag rendering on the card, it can be added
- Domain 2 should: pass `poster` and `video` as full paths (e.g., `/experiments/slug/poster.jpg`, `/experiments/slug/preview.mp4`) since RegistryCard renders them directly as `src` attributes

### Open Concerns (unresolved issues)

- None

### Files Touched (complete list)

- `src/components/registry/RegistryCard.tsx` -- created
- `src/components/registry/InstallCommand.tsx` -- created
- `src/components/registry/ExperimentPreview.tsx` -- created
- `src/components/registry/RegistryMeta.tsx` -- created

### Learnings (reusable insights for future work)

- Biome's `ultracite fix` auto-sorts CSS classes and JSX props alphabetically. Run it after creating files to avoid committing unsorted code.
- `video.play()` returns a Promise that can reject if interrupted by `pause()`. Always `.catch()` it in hover-to-play patterns to avoid unhandled rejections.
- `loading="lazy"` on iframes is a simpler alternative to IntersectionObserver for deferred loading with equivalent browser support.
