## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-05-29 - Accessible View Toggles
**Learning:** Custom view toggle buttons (like LayoutGrid/List mode switches) require explicit accessibility attributes to be properly parsed by screen readers, particularly when they act as mutually exclusive states but are not implemented as standard radio buttons.
**Action:** For custom toggle buttons, always use the `aria-pressed` attribute to announce their active state accurately to screen readers, add `type="button"`, and include explicit focus-visible styles.
