## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2024-05-27 - View Mode Toggles need aria-pressed
**Learning:** Custom UI toggle buttons acting as layout switchers (like list vs grid view) need the `aria-pressed` attribute to properly communicate their active state to screen readers. Relying only on visual changes or `aria-selected` (which is typically for tabs) is insufficient for standalone toggle groups.
**Action:** Always add `aria-pressed` conditionally to toggle buttons, and include `type="button"` to prevent accidental form submission.
