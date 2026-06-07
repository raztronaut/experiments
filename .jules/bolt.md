## 2025-02-12 - Optimize Date Formatting Allocations
**Learning:** Using `new Date().toLocaleDateString()` inside React components or large map loops incurs significant parsing and allocation overhead due to repeated instantiations of `Intl.DateTimeFormat`.
**Action:** Instantiate a single `Intl.DateTimeFormat` instance outside the component/loop and reuse its `format(new Date(...))` method.
