## 2024-05-16 - Avoid heavy NLP libraries for simple word counting
**Learning:** Using complex NLP libraries like `reading-time-estimator` or naive methods like `.split(/\s+/)` for simple reading time estimations allocates massive arrays in memory, leading to garbage collection spikes and severe bottlenecks during build and feed generation.
**Action:** Use simple regex word counting (`content.match(/\S+/g)?.length`) to avoid large memory allocations and optimize performance for MDX article reading time estimation.
