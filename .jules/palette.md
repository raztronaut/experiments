## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2024-05-31 - View Mode Toggle Accessibility
**Learning:** Custom view mode toggle buttons were missing `aria-pressed` state, `type="button"`, and explicit focus rings, making them less accessible to keyboard and screen reader users.
**Action:** Added `aria-pressed` to indicate active state, `type="button"` to prevent form submission, and Tailwind focus-visible classes for keyboard navigation. Always include these attributes for custom toggle buttons.
