## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-03-20 - Explicit button types and aria-pressed in Toggle Buttons
**Learning:** Custom toggle buttons (e.g., layout or view mode switches) can cause form submission issues if placed within forms, lack screen reader state visibility without `aria-pressed`, and be difficult to navigate via keyboard if lacking explicit focus rings.
**Action:** Always add `type="button"`, dynamically bind `aria-pressed` based on the active state, and include explicit focus-visible styles (e.g., `focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`) to toggle buttons.
