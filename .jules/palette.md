## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2025-03-20 - Accessible Custom Toggle Buttons
**Learning:** Custom toggle buttons (like ViewModeToggle) need `aria-pressed` to announce their active state to screen readers correctly, and should have explicit `type="button"` to avoid form submission bugs.
**Action:** Always include `aria-pressed`, `type="button"`, and consistent accessible focus rings (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`) when creating or updating custom toggle elements.
