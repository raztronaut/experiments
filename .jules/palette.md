## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2024-04-28 - Added missing ARIA attributes to expandable table rows
**Learning:** Icon-only expand/collapse buttons in custom table rows must include both `aria-expanded` and a descriptive `aria-label` (e.g., using the row's entity title) to accurately convey state and purpose to screen readers.
**Action:** When implementing or modifying custom toggle interactions (especially in data tables), ensure `aria-expanded` and dynamic descriptive `aria-label`s are explicitly provided.
