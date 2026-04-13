## 2024-04-13 - Reading Time Memory Allocation Spike
**Learning:** Using `text.split(/\s+/)` or complex NLP libraries like `reading-time-estimator` for reading time calculation on large texts creates massive arrays in memory, leading to garbage collection spikes and slowing down build processes like static generation or feed generation.
**Action:** Use regex matching like `text.match(/\S+/g)?.length` for simple text statistics which creates fewer short-lived string allocations compared to full string splitting.

## 2024-04-13 - Next.js Request Array Lookups O(N^2)
**Learning:** During feed generation or rendering many adjacent pages, repeatedly doing `.findIndex` over a static list creates an O(N^2) performance hit.
**Action:** Pre-compute a `Map<string, number>` using `react.cache` so subsequent lookups in the same request drop to O(1).
