## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2024-04-15 - Custom Toggle Buttons Accessibility
**Learning:** Custom UI toggle buttons (like view mode switchers) without `aria-pressed` attributes fail to communicate their active state to screen readers. Relying solely on visual cues (like background color changes) or CSS classes is insufficient for accessibility.
**Action:** When implementing or modifying custom toggle controls, always explicitly set `aria-pressed={isActive}` and ensure the element uses standard keyboard focus-visible styling for robust keyboard navigation.
