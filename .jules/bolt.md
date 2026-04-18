## 2024-05-19 - Intl.DateTimeFormat instantiation in Render Loops
**Learning:** Instantiating `Intl.DateTimeFormat` or using `Date.prototype.toLocaleDateString` inside React render loops is slow because `toLocaleDateString` internally instantiates a new formatter each time. This overhead becomes measurable when rendering lists of items like experiments or articles.
**Action:** Always cache `Intl.DateTimeFormat` instances globally outside of components and use their `.format(date)` method, instead of relying on `new Date().toLocaleDateString(...)`.
