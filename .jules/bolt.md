## 2025-03-05 - Avoid parameterized react.cache for array searches
**Learning:** React's `cache` deduplicates by arguments. Placing an O(N) array search inside a `cache(slug => ...)` function means it re-runs the O(N) search for *every* unique slug, causing an O(N^2) bottleneck across multiple calls in the same request.
**Action:** Precompute a `Map` in a parameterless `cache()`, then share the O(1) lookup map.
