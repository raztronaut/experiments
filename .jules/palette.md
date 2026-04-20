## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2025-04-20 - Accessible dynamic navigation active state
**Learning:** When creating dynamically generated Table of Contents or similar navigation buttons that rely on scroll interactions rather than standard anchor links, screen readers cannot rely on native URL hash changes to know which section is active.
**Action:** Always apply `aria-current="true"` conditionally to navigation buttons or items to explicitly indicate the active section to assistive technologies, and combine with accessible focus rings (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`).
