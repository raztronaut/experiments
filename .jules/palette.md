## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2025-05-01 - Explicit aria-pressed for custom toggle buttons
**Learning:** Custom toggle buttons (like view mode switchers) often rely only on visual cues or generic `aria-selected` attributes. Screen readers need `aria-pressed` to correctly identify a button as a toggle and announce its current active/inactive state.
**Action:** Always include the `aria-pressed` attribute dynamically mapped to the boolean state when implementing custom toggle buttons.
