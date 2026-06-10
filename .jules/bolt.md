## 2024-04-27 - [React Cache Argument Deduplication and Map Lookups]
**Learning:** React's `cache` function deduplicates by arguments. When repeatedly searching an array for different keys, avoid placing the search inside a cached function taking the key as an argument, as this causes an O(N^2) bottleneck.
**Action:** Instead, cache the generation of a lookup `Map` in a parameterless helper to share the O(1) lookup across requests.
