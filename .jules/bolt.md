
## 2024-05-30 - Client-Side Search Optimization
**Learning:** Client-side array filtering that repeatedly calls `.toLowerCase()` and allocates strings per item on every keystroke in a render loop creates unnecessary memory pressure and lag.
**Action:** When filtering arrays on the client based on text matching, pre-compute and store a single lowercase `searchString` on each item during the initial memoization phase to dramatically speed up the `useMemo` filter loop.
