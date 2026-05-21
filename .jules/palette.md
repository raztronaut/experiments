## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2025-03-20 - Accessible Toggle Buttons
**Learning:** Custom toggle buttons like view mode switches need explicit `aria-pressed` state to be accurately announced to screen readers.
**Action:** Always include `aria-pressed` on stateful toggle buttons, alongside `type="button"` and visible focus rings.
