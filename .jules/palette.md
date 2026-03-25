## 2025-03-25 - Avoid tabIndex={-1} on interactive buttons
**Learning:** Adding `tabIndex={-1}` to interactive elements like buttons (as seen in `SendButton.tsx` and `AnimatedSendButton.tsx`) removes them from the natural tab order, preventing keyboard users from accessing them.
**Action:** Never use `tabIndex={-1}` on buttons unless explicitly managing focus dynamically (e.g., in a roving tabindex setup). Instead, rely on natural tab order and ensure clear focus indicators using `focus-visible:ring-2` utility classes.

## 2025-03-20 - Explicit button types in Error Boundaries
**Learning:** React Error Boundaries (like `ExperimentErrorBoundary`) can unexpectedly submit forms if their fallback UI includes `<button>` elements without explicit types (which default to `type="submit"` in HTML), leading to jarring page reloads or side effects when an error occurs inside a form context.
**Action:** Always add `type="button"` to `<button>` elements in fallback UIs and generic components unless they are explicitly intended to submit a form.
