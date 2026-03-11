## Domain 4: Config & Integration

**Scope**: Update Next.js config with noindex headers and optimizePackageImports for the registry route.
**Complexity**: mechanical

### Context to Read First

- `next.config.ts` -- current config with headers, rewrites, experimental options
- `AGENTS.md` -- project conventions
- `.cursor/plans/registry_interactive_docs_aaa07efa.plan.md` (lines 1056-1091) -- security headers and noindex spec

### Changes to Make

1. **`next.config.ts` -- Add noindex header for registry routes**: Add a new header rule in the `headers()` function:
   ```typescript
   {
     source: "/registry/:path*",
     headers: [
       { key: "X-Robots-Tag", value: "noindex, nofollow" },
     ],
   },
   ```

2. **`next.config.ts` -- Add registry to outputFileTracingIncludes**: Add registry JSON files to file tracing:
   ```typescript
   outputFileTracingIncludes: {
     "/": ["./src/app/experiments/**/*"],
     "/registry": ["./public/registry/**/*"],
   },
   ```

3. **`next.config.ts` -- Add shiki to optimizePackageImports**: Add `"shiki"` to the array if not already present.

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `scripts/generate-registry.mjs` -- owned by Domain 1 (Script Overhaul)
- `src/app/(registry)/**` -- owned by Domain 2 (Route & Pages)
- `src/components/registry/**` -- owned by Domain 3 (Components)
- `package.json` -- no changes needed

### Cross-Domain Notes

- **Depends on**: none
- **Produces**: Config changes that support Domain 2's pages (file tracing, noindex)
- **Known interactions**: The rewrite rule `/r/:slug` -> `/registry/:slug.json` already exists. Do NOT change it.
