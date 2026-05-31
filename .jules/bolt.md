## 2026-05-31 - Pre-compute Search Strings for Filtering
**Learning:** When performing client-side array search filtering in React `useMemo` hooks, calling `.toLowerCase()` repeatedly inside the filter loop causes unnecessary string allocations and processing overhead.
**Action:** Pre-compute a combined lowercase `_searchString` property on items during their initial mapping phase to drastically reduce string allocations during the filtering render loop.
