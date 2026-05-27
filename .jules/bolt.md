## 2024-05-18 - Fast Reading Time Estimation
**Learning:** For fast reading time estimations across MDX articles, using a regex `exec` loop (e.g., `while (regex.exec(text) !== null) count++`) prevents allocating massive arrays of matches in memory compared to `text.match(/\S+/g)` or `text.split(/\s+/)`, avoiding OOM crashes and GC spikes during static build generation.
**Action:** Use a regex `exec` loop instead of `split` or `match` for word counts in large datasets like MDX parsing pipelines.
