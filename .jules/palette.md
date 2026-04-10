## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-04-10 - Custom Toggle Button Accessibility
**Learning:** Custom UI elements acting as toggle buttons (e.g., Grid/List view switchers) often lack semantic state for screen readers if built manually. Without `aria-pressed`, screen reader users cannot tell which state is currently active, and without explicit `focus-visible` styles, keyboard navigation usability suffers.
**Action:** Always include `aria-pressed={isActive}` to announce the active state to assistive technologies and apply consistent `focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring` classes for accessible keyboard focus on all custom interactive buttons.
