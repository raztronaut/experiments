## 2024-05-24 - Avoid `toLocaleDateString` in Render Loops
**Learning:** Calling `new Date().toLocaleDateString()` inside a React render loop implicitly creates a new `Intl.DateTimeFormat` instance every time it is called. In a codebase that renders many components containing dates (like experiment cards or articles), this leads to excessive garbage collection spikes and decreased performance.
**Action:** Always instantiate `Intl.DateTimeFormat` once globally (outside the React component) and use its `.format(date)` method inside the render loop or component functions.
