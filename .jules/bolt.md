## 2024-05-24 - Cache Intl.DateTimeFormat instead of using toLocaleDateString in loops
**Learning:** Calling `Date.prototype.toLocaleDateString()` with options inside loops or components instantiates a new `Intl.DateTimeFormat` under the hood each time, causing significant parsing and allocation overhead.
**Action:** When formatting dates in lists or components, instantiate a single global `Intl.DateTimeFormat` instance outside the component and reuse its `.format()` method.
