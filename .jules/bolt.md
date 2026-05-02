## 2024-05-24 - Avoid NLP libraries for reading time estimation
**Learning:** Using complex NLP libraries like `reading-time-estimator` can cause memory allocation spikes during build and feed generation when processing many large MDX files, as it internally splits the text into massive arrays.
**Action:** Use simple regex word counting like `Math.max(1, Math.round((text.match(/\S+/g)?.length || 0) / 200))` for fast and lower-memory reading time estimates.
