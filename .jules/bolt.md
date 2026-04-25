
## 2024-04-25 - React.cache and O(N) array searching bottleneck
**Learning:** React's `cache` function deduplicates by arguments. When repeatedly searching an array for different keys, avoid placing the search inside a cached function taking the key as an argument, as this causes an O(N^2) bottleneck. Additionally, avoid heavy libraries like `reading-time-estimator` inside fast loops, as they allocate massive arrays causing GC spikes.
**Action:** Cache the generation of a lookup `Map` in a parameterless helper to share the O(1) lookup across requests. Use simple regex word counting (e.g., `text.match(/\S+/g)?.length`) for basic stats like reading time.
