## 2025-02-12 - Date Formatting Allocation Overhead
**Learning:** Repeatedly calling `new Date().toLocaleDateString()` inside large lists or React component render cycles incurs significant parsing and allocation overhead because it instantiates a new `Intl.DateTimeFormat` object under the hood each time.
**Action:** Always instantiate a single `Intl.DateTimeFormat` outside the component or loop and reuse its `format()` method.
