## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-05-30 - Accessible Toggle Buttons
**Learning:** Custom toggle buttons (like view mode switches) need specific ARIA attributes (`aria-pressed`) to communicate state correctly to screen readers, unlike standard buttons. They also lack built-in focus rings and submit protection.
**Action:** Always add `type="button"`, `aria-pressed={isActive}`, and explicit `focus-visible` utility classes when creating toggle UI controls.
