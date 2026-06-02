## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2025-03-25 - Accessible TOC scroll navigation
**Learning:** Dynamically generated Table of Contents buttons relying on scroll interactions (rather than standard anchor links) lack standard navigation accessibility cues.
**Action:** Always conditionally apply `aria-current="true"` to active section buttons, and combine with accessible focus rings (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`) and `type="button"`.
