
## 2024-05-24 - Precompute Map for O(1) Adjacent Item Lookups
**Learning:** Repeatedly finding an item in an array using `.findIndex` inside a `react.cache` function (where the search key is an argument) causes O(N^2) time complexity across multiple calls in the same request.
**Action:** Precompute a `Map` of keys to indices using a parameterless `react.cache` helper, then perform O(1) lookups in the main function.
