## 2025-05-15 - Cached Intl.DateTimeFormat Instantiation Out of Render Loop
**Learning:** Instantiating `Intl.DateTimeFormat` inside a React component's render loop is an expensive operation that can cause performance bottlenecks and main-thread blockage, particularly for frequently updating components like a live ticking clock.
**Action:** Always hoist and cache `Intl.DateTimeFormat` instances globally outside of the component body. If dynamic options (like toggling 12-hour/24-hour time) are needed, pre-instantiate all required formatters and toggle between the references.
