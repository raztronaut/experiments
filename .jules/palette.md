## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2024-04-24 - Table Row Expansion Accessibility
**Learning:** Custom expand/collapse buttons in custom tables (not using native details/summary) need explicit `aria-expanded` attributes to communicate their state to screen readers.
**Action:** Always pair `aria-expanded` with descriptive `aria-label`s on icon-only toggle buttons in data tables.
