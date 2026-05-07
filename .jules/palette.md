## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2025-05-07 - Toggle Button Active State
**Learning:** Toggle buttons (like switching between grid/list views) must convey their active state to screen readers using `aria-pressed`, as visual cues (like background color changes) are not sufficient.
**Action:** Always include `aria-pressed={isActive}` on custom toggle buttons to ensure their state is accessible.
