## 2025-05-09 - Replaced reading-time-estimator with regex word counting
**Learning:** Using complex NLP libraries like `reading-time-estimator` for simple tasks like calculating reading time for markdown files causes significant CPU and garbage collection bottlenecks during build and feed generation when iterating over many files.
**Action:** Use simple regex word counting (`text.match(/\S+/g)?.length`) instead of `text.split(/\s+/)` or heavy libraries for fast reading time estimations.
