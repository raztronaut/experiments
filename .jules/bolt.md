# Bolt Journal

## 2024-05-18 - Precomputing Maps with `react.cache` for O(1) Lookups
**Learning:** To optimize O(N) array searches for adjacent items (like in `getAdjacentArticles`), precompute a `Map` from unique slugs to their indices using a dedicated `react.cache` helper function to achieve O(1) retrieval speed across multiple calls in the same request.
**Action:** Use this pattern when multiple O(N) searches are performed on the same dataset within a single request, especially in Next.js Server Components where `react.cache` can scope the computation to the request lifecycle.
