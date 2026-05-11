## 2024-05-11 - Fast Date Formatting
**Learning:** `Date.prototype.toLocaleDateString` is significantly slower than using a cached `Intl.DateTimeFormat` because it internally instantiates a new formatter every time it's called.
**Action:** When formatting dates in React components (especially in lists or tight loops), instantiate `Intl.DateTimeFormat` outside the component scope and use its `.format()` method instead.
