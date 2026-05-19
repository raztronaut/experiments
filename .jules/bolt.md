## 2024-05-19 - Pre-computing search strings for client-side filtering
**Learning:** Client-side array filtering in React useMemo hooks can cause severe bottlenecks due to repeated `.toLowerCase()` calls and string allocations during the render loop.
**Action:** Pre-compute a combined lowercase `_searchString` property on items during their initial mapping phase to drastically reduce string allocations and repeated `.toLowerCase()` calls during the filtering render loop.
