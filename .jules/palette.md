## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2024-05-18 - Dynamic Table of Contents Buttons
**Learning:** Dynamically generated TOC buttons that use scroll interactions must indicate their active state to screen readers using `aria-current="true"` and require explicit `focus-visible` classes, as default anchor behaviors don't apply.
**Action:** Always add `aria-current="true"` conditionally and apply focus rings to custom navigation buttons simulating in-page anchors.
