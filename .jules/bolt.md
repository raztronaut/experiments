## 2025-01-23 - Fast reading time estimations
**Learning:** For fast reading time estimations across MDX articles, use simple regex word counting (e.g., `text.match(/\S+/g)?.length`) instead of `text.split(/\s+/)` or complex NLP libraries like `reading-time-estimator`. This prevents allocating massive arrays in memory, avoiding garbage collection spikes and severe bottlenecks during build and feed generation.
**Action:** Replace `reading-time-estimator` with `Math.max(1, Math.ceil((content.match(/\S+/g)?.length || 0) / 200))` when calculating reading time for multiple articles.
