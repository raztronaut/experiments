
## 2024-05-05 - Optimize getAdjacentArticles with Map Cache
**Learning:** React's `cache` deduplicates by arguments. When repeatedly searching an array for different keys, placing the search inside a cached function taking the key as an argument causes an O(N^2) bottleneck because the cache generates a separate entry per key and repeats the search.
**Action:** Precompute a `Map` of indices in a parameterless `react.cache` helper, achieving an O(1) retrieval speed across multiple calls in the same request.
