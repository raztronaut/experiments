## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-05-28 - Accessible Toggle Buttons
**Learning:** Custom toggle buttons (like layout or view mode switches) fail to communicate their active state accurately to screen readers without `aria-pressed`, and can accidentally submit forms without `type="button"`.
**Action:** Always add `type="button"` and dynamically manage the `aria-pressed` attribute for toggle-like button elements to ensure proper accessibility semantics and interaction behavior.
