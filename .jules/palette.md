## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-05-04 - [Keyboard Accessibility for Custom List Items]
**Learning:** Custom interactive components like cards or list items acting as buttons need explicit keyboard support (`onKeyDown`), `tabIndex={0}`, `role="button"`, and visible focus rings (`focus-visible`) to be accessible. I noticed `ExperimentGridCard` had this, but `ExperimentListItem` was missing it, breaking the tab order and keyboard navigation in list view.
**Action:** Always verify that custom interactive elements (divs/spans acting as buttons) have `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for Enter/Space, and explicit `focus-visible` styling.
