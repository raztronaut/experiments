## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-05-25 - Expand/Collapse Button Accessibility
**Learning:** Custom expand/collapse buttons (such as in custom table row toggles) can be completely inaccessible to screen readers if they are icon-only and lack state indication.
**Action:** Explicitly pair `aria-expanded` attributes with descriptive `aria-label`s on custom toggle buttons to communicate their state effectively to assistive technologies.
