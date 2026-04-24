## 2024-04-24 - React cache deduplication strategy
**Learning:** React's cache deduplicates by arguments. Placing an array search inside a cached function taking the key as an argument causes an O(N^2) bottleneck when searching for different keys.
**Action:** Cache the generation of a lookup Map in a parameterless helper to share the O(1) lookup across requests.
