
## 2024-05-18 - Replacing `reading-time-estimator` with simple regex
**Learning:** Utilizing a complex NLP library like `reading-time-estimator` for simple article reading time can lead to a 6x slowdown and high garbage collection spikes due to array allocations when splitting large contents, severely bottlenecking feed generation.
**Action:** For simple reading time estimations across large numbers of MDX articles, utilize `Math.max(1, Math.ceil((content.match(/\S+/g)?.length ?? 0) / 200))` instead.
