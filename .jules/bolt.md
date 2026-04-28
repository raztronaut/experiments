## 2024-04-28 - Avoid O(N^2) bottlenecks when searching arrays with React.cache
**Learning:** React's `cache` function deduplicates by arguments. When repeatedly calling a cached function to search an array with a different key, it executes the search logic each time, creating an O(N^2) bottleneck.
**Action:** Cache the generation of a lookup `Map` in a parameterless helper function so the O(1) lookup structure is shared across multiple requests in the same lifecycle.
