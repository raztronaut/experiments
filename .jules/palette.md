## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
## 2024-03-24 - Interactive Elements Accessibility
**Learning:** Found instances of interactive elements (buttons) in UI components, like those in the SendButton experiment, inappropriately using `tabIndex={-1}`. This breaks keyboard navigation and makes these interactive components inaccessible.
**Action:** Always verify that interactive elements do not disable keyboard focus by using `tabIndex={-1}`, and instead ensure they have appropriate interactive states (like focus rings) and meaningful `aria-label` attributes if text content is absent.
