## Domain 4: Config & Integration -- Handoff Summary

**Status**: DONE

### Completed (plan items done)

- Item 1: Added `X-Robots-Tag: noindex, nofollow` header for `/registry/:path*` -- `next.config.ts`
- Item 2: Added `/registry` key to `outputFileTracingIncludes` pointing to `./public/registry/**/*` -- `next.config.ts`
- Item 3: Added `"shiki"` to `optimizePackageImports` array (confirmed shiki ^4.0.1 is a project dependency) -- `next.config.ts`

### Extra Discoveries (things found not in the plan)

- None

### Extra Changes (files modified beyond the plan)

- None

### Intentional Skips (plan items NOT done, with reasoning)

- None

### Judgment Calls (deviations from the plan)

- None -- all three items were unambiguous and applied exactly as specified.

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain 2 should: Verify that registry pages served under `/registry/:path*` correctly receive the `X-Robots-Tag: noindex, nofollow` header in deployed environment.
- Domain 2 should: Verify that `fs.readFile` calls for `public/registry/` JSON files work in Vercel serverless environment thanks to the `outputFileTracingIncludes` entry.

### Open Concerns (unresolved issues)

- None

### Files Touched (complete list)

- `next.config.ts` -- modified

### Learnings (reusable insights for future work)

- `outputFileTracingIncludes` keys are route patterns, not filesystem paths. The key `/registry` tells Next.js to include those traced files for any serverless function serving the `/registry` route.
- The existing `/r/:slug` rewrite to `/registry/:slug.json` is separate from the header rules -- the noindex header applies to actual `/registry/:path*` page routes, not the JSON rewrite endpoint.
