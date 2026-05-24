## 2024-05-24 - MDX Reading Time Memory Bottlenecks
**Learning:** Using complex NLP libraries like `reading-time-estimator` or `text.split(/\s+/)` for reading time estimations creates massive arrays in memory, causing garbage collection spikes during static generation. Even `text.match(/\S+/g)` creates a full array of matches in memory.
**Action:** Use a regex `exec` loop (`while (regex.exec(text) !== null) count++`) for lightweight string analysis to avoid OOM crashes and garbage collection bottlenecks during build loops.
