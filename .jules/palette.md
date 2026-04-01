## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-03-24 - Avoid tabIndex={-1} on interactive semantics
**Learning:** Adding `tabIndex={-1}` to native interactive elements like `<button>` disables their default keyboard accessibility, breaking the natural tab order. When a button functions as a true button (e.g. for submitting, toggling, or opening a dialog), it must remain in the tab sequence and have a visible focus state.
**Action:** Never use `tabIndex={-1}` on `<button>` elements that users need to interact with. Use standard `aria-label` for icon-only buttons, `aria-pressed` for toggle states, and explicit `focus-visible` utility classes for accessible focus rings.