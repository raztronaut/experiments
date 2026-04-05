## 2025-02-23 - Fast Reading Time Estimation
**Learning:** Using heavy third-party libraries for reading time estimation (like `reading-time-estimator` which uses an HTML parser internally) causes huge overhead when processing multiple MDX articles during build and feed generation. `text.split` is also bad because it allocates massive arrays causing GC spikes.
**Action:** Use simple regex word counting (`text.match(/\S+/g)?.length`) combined with `Math.max(1, Math.round(words / 200))` for O(N) speed with minimal memory footprint.
