## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2024-05-09 - Accessible dynamic Table of Contents
**Learning:** When generating Table of Contents navigation dynamically using `IntersectionObserver`, simply updating visual styles is not enough for screen readers.
**Action:** Always combine visual active states with `aria-current="true"` on the active item, and ensure robust keyboard focus states (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`) so keyboard users can track their position within the TOC.
