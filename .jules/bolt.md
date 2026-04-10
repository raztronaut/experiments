## 2024-04-10 - Intl.DateTimeFormat caching
**Learning:** `Intl.DateTimeFormat` instantiation is notoriously slow. Instantiating it in a hook (e.g. `useMemo`) runs on every mount, and using `Date.prototype.toLocaleDateString` also implicitly creates a new instance internally each time it is called.
**Action:** Always extract `Intl.DateTimeFormat` instances to module-level constants (outside of components/functions) and reuse their `.format()` or `.formatToParts()` methods.
## 2024-04-10 - Reading time parsing
**Learning:** `reading-time-estimator` is over 100x slower than simple Regex for large text documents (like MDX articles) because it allocates massive arrays for its algorithms. This causes major performance bottlenecks and GC spikes during feed generation and build times.
**Action:** Replace `readingTime(content).minutes` with a simple word count estimator `Math.max(1, Math.ceil((content.match(/\S+/g)?.length || 0) / 200))`
