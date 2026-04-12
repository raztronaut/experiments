
## 2024-05-19 - Avoid Intl.DateTimeFormat instantiation in render loops
**Learning:** `Date.prototype.toLocaleDateString()` and related methods instantiate a new `Intl.DateTimeFormat` object under the hood every time they are called. When formatting dates inside loops or React render methods (especially for lists of items like `ExperimentGridCard` or `ArticleCard`), this causes significant overhead and garbage collection spikes. Tests show that caching `Intl.DateTimeFormat` and reusing it via `.format()` is ~15-20x faster.
**Action:** Always extract and cache `Intl.DateTimeFormat` instances outside of components/loops and use `.format(date)` instead of relying on `.toLocaleDateString()` for performance-critical path formatting.
