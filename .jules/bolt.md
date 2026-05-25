## 2026-05-25 - Pre-computing search strings for client-side filtering
**Learning:** Repeatedly calling `.toLowerCase()` inside a filter function during a render loop can cause unnecessary string allocations. Pre-computing a combined `_searchString` during initial mapping drastically reduces these allocations.
**Action:** When implementing client-side array search filtering in React `useMemo` hooks, pre-compute a combined lowercase search string property on items during their initial mapping phase.
