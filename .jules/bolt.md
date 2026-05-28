## 2024-05-18 - Pre-compute search strings in React filters
**Learning:** Dynamically allocating strings and calling `.toLowerCase()` repeatedly in a `useMemo` filter loop causes excessive garbage collection spikes and memory allocations, especially for long lists.
**Action:** Pre-compute a combined lowercase `_searchString` property on list items during their initial mapping phase to drastically reduce string allocations and repeated method calls during the actual filtering render loop.
