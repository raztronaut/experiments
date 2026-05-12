## 2024-05-15 - Cache Intl.DateTimeFormat instead of using toLocaleDateString
**Learning:** Avoid instantiating `Intl.DateTimeFormat` inside React render loops or using `.toLocaleDateString()` which internally creates a new formatter each time.
**Action:** Cache formatter instances globally outside the component using `new Intl.DateTimeFormat()` and use `.format()` for rapid formatting.
