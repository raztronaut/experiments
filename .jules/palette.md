## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.

## 2024-05-18 - Custom Toggle Button Accessibility
**Learning:** Custom toggle buttons implemented without native checkbox/radio semantics need `aria-pressed` to correctly announce their active state to screen readers. Relying solely on visual changes (like text color or background changes) leaves non-visual users unaware of the current mode selection. Additionally, explicitly applying standard Tailwind utilities (`focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring`) ensures consistent focus outlines.
**Action:** Always verify `aria-pressed` on any generic `<button>` acting as a toggle state, and explicitly define `type="button"` to avoid un-intended form submission. Add proper `focus-visible` ring utilities to ensure accessible keyboard navigation.
