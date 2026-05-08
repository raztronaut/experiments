## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2024-05-08 - Accessible Custom Toggle Buttons
**Learning:** Custom toggle buttons (like view mode switchers) often lack proper ARIA states and keyboard focus indicators, making them difficult for screen readers to interpret and keyboard users to navigate.
**Action:** Always include `aria-pressed={state === 'active'}` to indicate the toggle state, `type="button"` to prevent form submission, and standard focus rings (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`) to ensure keyboard accessibility.
