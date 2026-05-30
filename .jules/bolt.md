## 2024-05-30 - Optimize Date Formatting in Loops
**Learning:** Repeatedly calling `new Date().toLocaleDateString()` inside loops or frequent render cycles incurs significant parsing and memory allocation overhead.
**Action:** Instantiate a single `Intl.DateTimeFormat` object outside the loop or component and reuse its `.format(new Date())` method.
