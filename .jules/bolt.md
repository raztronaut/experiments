
## 2025-03-27 - Fast native string count vs third-party parser
**Learning:** Using `reading-time-estimator` invokes heavy markdown parsing and abstract syntax tree construction. But using `content.split(/\s+/)` to calculate native counts on large MDX contents allocates a massive array in memory. It induces garbage collection spikes during high-volume array building loops.
**Action:** Use a regex iterator via `content.match(/\s+/g)?.length` which is significantly more memory-efficient than `split()` for simple whitespace iteration across large strings.
