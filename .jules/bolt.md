## 2025-05-18 - Pre-compute Search Strings for React Filtering
**Learning:** For client-side array search filtering in React useMemo hooks, dynamically calling `.toLowerCase()` on multiple object properties inside the filter loop causes high overhead and memory allocations on every search keystroke.
**Action:** Pre-compute a combined lowercase `_searchString` property on items during their initial data processing phase to reduce filtering overhead to a single `.includes()` check.
