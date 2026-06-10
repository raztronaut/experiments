## 2024-05-26 - Pre-computing searchable text for frontend filtering
**Learning:** In React `useMemo` hooks that perform client-side filtering (like `RegistryGrid` or `applyFilters`), calculating properties like `searchString` combined with repeated `.toLowerCase()` calls during the filtering render loop can cause a lot of string allocations and O(N) repetitive work.
**Action:** Pre-compute standard properties during the mapping/initialization phase so the render loop only performs a single `.includes()` comparison against a simple, pre-computed string.
