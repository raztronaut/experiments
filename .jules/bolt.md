## 2024-04-19 - Avoid complex NLP libraries for simple word counting
**Learning:** Using complex NLP libraries like `reading-time-estimator` for simple reading time estimation across many MDX articles causes large array allocations in memory and massive garbage collection spikes.
**Action:** Use simple regex word counting (`text.match(/\S+/g)?.length`) to avoid memory bloat and performance bottlenecks during build and feed generation.
