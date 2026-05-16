## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2024-05-16 - List Items and Toggles Accessibility
**Learning:** Custom interactive components acting as list items need proper keyboard support (Enter/Space to activate, `tabIndex={0}`, `role="button"`) and focus rings. Custom toggle buttons for layouts (Grid/List) require `aria-pressed` to announce their active state accurately to screen readers.
**Action:** Always verify custom list items have full keyboard navigability and layout toggles use `aria-pressed` in future component implementations.
