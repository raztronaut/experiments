
## 2026-05-10 - Fast Reading Time Estimation
**Learning:** Using `reading-time-estimator` allocates massive arrays in memory for long text, causing severe garbage collection spikes and making feed generation extremely slow.
**Action:** For fast reading time estimations across MDX articles, use simple regex word counting (`Math.max(1, Math.ceil((text.match(/\S+/g)?.length ?? 0) / 200))`) instead.
