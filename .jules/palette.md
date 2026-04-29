## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2024-03-20 - Table of Contents accessibility
**Learning:** Dynamically generated navigation items that use scroll tracking should explicitly set `aria-current="true"` on the active item so screen readers know the user's current context.
**Action:** Combine scroll-driven navigation updates with `aria-current="true"` and accessible focus indicators like `focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`.
