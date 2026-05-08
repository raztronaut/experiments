
## 2024-03-20 - Fast text reading time estimation
**Learning:** Using heavy NLP libraries like `reading-time-estimator` for simple tasks like calculating MDX read times can cause severe memory bottlenecks and slow down build/feed generation due to garbage collection spikes.
**Action:** For fast reading time estimations across articles, use simple regex word counting (e.g., `text.match(/\S+/g)?.length / 200`) instead of complex libraries.
