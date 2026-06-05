## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2024-05-30 - Accessible Table of Contents Buttons
**Learning:** When dynamically generating Table of Contents or similar navigation buttons that rely on scroll interactions rather than standard anchor links, screen readers lack an indication of the active section. Furthermore, without focus rings, keyboard users struggle to navigate.
**Action:** Always apply `aria-current="true"` conditionally to indicate the active section to screen readers, combine with accessible focus rings (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`), and use `type="button"`.
