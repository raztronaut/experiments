## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2024-05-15 - Table of Contents Accessibility
**Learning:** Table of Contents and similar navigation items in this design system often use `<button>` elements with scroll-into-view interactions instead of traditional `<a>` anchor tags. This breaks standard link-based screen reader announcements for active states.
**Action:** When dynamically generating Table of Contents or similar navigation buttons that rely on scroll interactions rather than standard anchor links, always apply `aria-current="true"` conditionally to indicate the active section to screen readers, and combine with accessible focus rings (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`) and `type="button"`.
