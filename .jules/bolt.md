## 2025-02-14 - MDX Reading Time Optimization
**Learning:** Using `reading-time-estimator` (or any AST-based/complex library) for simple word counts on large MDX contents can cause severe memory allocations and garbage collection spikes. Using `text.split(/\s+/)` is also bad for large content as it creates huge arrays.
**Action:** Use a simple regex matcher (`text.match(/\S+/g)?.length || 0`) for reading time estimations to prevent N+1 query bottlenecks during static generation and feed generation.
