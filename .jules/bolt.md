## 2025-02-28 - Fast Reading Time Estimation
**Learning:** `reading-time-estimator` can cause memory spikes and is slow due to parsing markdown. For fast reading time estimation across MDX articles, a simple regex word counting approach like `text.match(/\S+/g)?.length` is significantly faster and avoids garbage collection bottlenecks.
**Action:** Replace `reading-time-estimator` with a simple regex-based word counter for reading time estimations in `src/lib/articles.ts`.
