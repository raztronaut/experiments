## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-05-18 - Toggle buttons require explicit aria-pressed state
**Learning:** Custom toggle buttons (like layout or view mode switches) fail to communicate their active state to screen readers by default.
**Action:** Always use the `aria-pressed` attribute to announce their active state accurately to screen readers, and add `type="button"` to prevent accidental form submissions.
