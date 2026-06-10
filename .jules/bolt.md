## 2024-10-24 - MDX Reading Time Estimation Bottleneck
**Learning:** Using complex NLP libraries (like `reading-time-estimator`) or `text.split(/\s+/)` for reading time estimations across MDX articles allocates massive arrays in memory, leading to severe garbage collection spikes and bottlenecks during build and feed generation.
**Action:** Use simple regex word counting (`text.match(/\S+/g)?.length`) for fast reading time estimations to minimize memory allocation.
