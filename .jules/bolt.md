## 2025-04-21 - O(1) Index Lookup with react.cache
**Learning:** Using `findIndex` inside a `react.cache` function that is called repeatedly with different slugs causes an O(N^2) bottleneck. `react.cache` deduplicates by arguments, so calling it with different slugs doesn't hit the cache for the array search.
**Action:** Precompute an index map (`Map<string, number>`) using a parameterless `react.cache` helper function. This caches the map generation once per request, turning subsequent adjacent item lookups from O(N) to O(1).
