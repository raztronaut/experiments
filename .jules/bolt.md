## 2024-05-18 - Avoid NLP libraries for simple reading time estimation
**Learning:** Using complex NLP libraries like `reading-time-estimator` for simple reading time calculation causes heavy string allocations and garbage collection spikes, significantly degrading performance when generating feeds or processing multiple MDX articles.
**Action:** Use simple regex word counting (e.g., `text.match(/\S+/g)?.length`) instead of heavy libraries to prevent massive O(N) overhead during content generation.
