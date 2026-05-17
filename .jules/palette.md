## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2024-05-18 - Improved accessibility for ViewModeToggle buttons
**Learning:** Custom toggle buttons (like layout mode switches) need explicit `aria-pressed` attributes to announce their active state accurately to screen readers. They also require `type="button"` to prevent accidental form submissions when used in various contexts, and explicit `focus-visible` styles for keyboard navigation visibility.
**Action:** Always include `aria-pressed`, `type="button"`, and `focus-visible` ring classes when building custom toggle buttons that represent binary or grouped states.
