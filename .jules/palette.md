## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2024-04-12 - Remove Negative tabindex and Add Focus Visible Styles to Interactive Elements
**Learning:** Found custom interactive components (like the custom `SendButton`) that used `tabIndex={-1}` on interactive `<button>` tags, completely removing them from natural keyboard tab order and hindering keyboard navigation. Furthermore, these elements lacked visible focus indicators when accessed via a keyboard.
**Action:** Remove `tabIndex={-1}` from semantic interactive elements (such as `<button>`) unless they are part of a custom roving tabindex implementation. Always apply the standard focus utility classes (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`) to ensure keyboard users have a visible focus outline. Also, ensure icon-only buttons include descriptive `aria-label` attributes corresponding to their function (or `title`).
