## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-05-13 - Explicit focus rings on Next.js Link components wrapping Cards
**Learning:** Next.js `Link` components that wrap entire elements (like Cards) often lack explicit focus indicators, leaving keyboard users without visual feedback when tabbing through a list of items.
**Action:** Always apply accessible focus rings (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`) to interactive `Link` wrappers to ensure consistent keyboard accessibility.
