## 2024-06-03 - Reuse Intl.DateTimeFormat
**Learning:** Calling `new Date().toLocaleDateString()` inside loops or component render cycles causes significant allocation and parsing overhead.
**Action:** Instantiate a single `Intl.DateTimeFormat` instance at the module level and reuse its `.format()` method to format dates.
