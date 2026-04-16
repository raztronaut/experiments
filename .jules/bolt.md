## 2024-05-18 - Replacing reading-time-estimator with regex for faster markdown parsing
**Learning:** For fast reading time estimations across many MDX articles (e.g. during build time or in loops), complex NLP libraries like `reading-time-estimator` can cause significant execution bottlenecks (12s vs 190ms) and garbage collection spikes.
**Action:** Use simple regex word counting `Math.ceil((text.match(/\S+/g)?.length || 0) / 200)` instead of complex NLP libraries for fast, approximate estimations to prevent allocating massive arrays in memory and avoiding GC overhead.
