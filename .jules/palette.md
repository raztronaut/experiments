## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-04-07 - Screen reader state for custom toggle buttons
**Learning:** Custom UI elements acting as toggle buttons (like view mode switchers) often rely solely on visual cues (like background colors) to indicate their active state. This leaves screen reader users unaware of which option is currently selected.
**Action:** Always add the `aria-pressed={isActive}` attribute to custom toggle `<button>` elements to ensure their active state is properly announced to assistive technologies.
