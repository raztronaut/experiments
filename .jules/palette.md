## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2025-03-21 - Custom list item keyboard accessibility
**Learning:** Custom interactive components functioning as buttons (like `ExperimentListItem` using `onClick` on a `div`) need explicit keyboard support (`onKeyDown` handling Enter/Space), a `role="button"`, `tabIndex={0}`, and visible focus styles to be accessible.
**Action:** Always verify keyboard operability for custom interactive components. If an element handles `onClick` but isn't an explicit `<button>` or `<a href="...">`, ensure `role="button"`, `tabIndex`, and a keydown listener are implemented along with `focus-visible` styling.
