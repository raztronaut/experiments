## 2024-05-15 - React Cache + O(N) array loops is an O(N^2) bottleneck
**Learning:** React's `cache` deduplicates by arguments. When repeatedly searching an array for different keys (like slug strings), placing the O(N) search inside a cached function that takes the key as an argument causes it to execute for every key, making it an O(N^2) operation across multiple calls in the same request.
**Action:** Cache the generation of a lookup `Map` (slug -> index) in a parameterless helper instead. Then, fetch this map to perform O(1) lookups.

## 2024-05-15 - `reading-time-estimator` memory and performance overhead
**Learning:** Calculating reading time across massive numbers of MDX articles during build using NLP libraries like `reading-time-estimator` can cause severe garbage collection spikes and bottlenecks due to immense array allocations.
**Action:** For fast reading time estimations, use simple regex word counting (e.g., `text.match(/\S+/g)?.length`) combined with math. It runs orders of magnitude faster.
