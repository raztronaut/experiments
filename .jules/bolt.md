## 2024-05-18 - Fast reading time estimations in MDX parsing
**Learning:** Using generic markdown parsing libraries like `reading-time-estimator` can cause severe bottlenecks during build and feed generation when processing many MDX files because they perform heavy parsing.
**Action:** For fast reading time estimations, use simple regex word counting (e.g., `Math.max(1, Math.ceil((content.match(/\w+/g)?.length || 0) / 200))`) instead of heavy markdown parsing or sanitization libraries. This avoids significant overhead during build and generation while maintaining acceptable accuracy.
