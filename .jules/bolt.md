## 2024-04-14 - Replace heavy reading-time-estimator in articles.ts
**Learning:** For fast reading time estimations across MDX articles, `readingTime(text)` from `reading-time-estimator` can cause massive slowdowns during build/feed generation due to heavy processing/allocation compared to simple regex.
**Action:** Use simple regex word counting (e.g., `Math.max(1, Math.round((text.match(/\S+/g)?.length || 0) / 200))`) instead of complex NLP libraries for basic reading minutes calculation, to prevent severe bottlenecks and garbage collection spikes.
