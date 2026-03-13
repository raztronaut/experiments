# Next Build Hang Investigation

## Executive summary

The clean-main baseline does **not** currently reproduce the earlier `next build` hang.

In the fresh clean worktree, after `npm ci`, the full production build succeeds:

- generation pipeline runs
- Fumadocs source generation runs
- `next build` compiles successfully
- static pages are generated successfully

That means the earlier hang should be treated as:

- specific to the detached prototype state
- specific to an interrupted build / stale lock
- or specific to prototype changes, not to `main` itself

## Clean-main verification results

### Before installing dependencies

In the fresh worktree:

- `npm run typecheck` failed because `tsc` was unavailable
- `npm test -- --run --project unit` failed because `vitest` was unavailable

This is expected because fresh worktrees do not include `node_modules`.

### After `npm ci`

The clean worktree successfully ran:

- dependency install
- poster generation
- registry generation
- llms generation
- Fumadocs source generation
- full `next build`

### Build observations

The build output included:

- registry generation with 106 discovered items
- 63 registry validation warnings in the current clean-main pipeline
- successful Next compilation
- static generation of 249 pages

The build also emitted:

- `Using edge runtime on a page currently disables static generation for that page`

That warning should be documented and understood, but it is not the build blocker.

## What the earlier prototype state showed

The detached prototype worktree exhibited two related issues:

1. a stale `.next/lock` after an interrupted or hung build
2. later silent stalling during `Creating an optimized production build ...`

Because clean-main does not reproduce the stall, the correct interpretation is:

- the prototype changed the build/runtime behavior enough to invalidate the baseline
- or the prototype worktree had environmental residue not present in the clean pass

## Current decision

The “next build hang” is **not** a clean-main blocking issue.

It is instead a **prototype-specific regression investigation**.

## What to do in the clean pass

- Do not carry the build-hang assumption forward as a repo-wide truth.
- Use clean-main success as the baseline.
- Treat any future build stall during the clean pass as a regression introduced by that branch until proven otherwise.

## Regression investigation checklist for future stalls

If `next build` begins stalling again during the clean pass:

1. Compare against clean-main build output.
2. Remove stale `.next/lock` if present.
3. Check whether new generated artifacts changed the registry/docs/runtime contract.
4. Check whether Fumadocs source generation still matches runtime imports.
5. Check whether changed dynamic routes or metadata helpers introduced a deadlock or explosion in route generation.
6. Re-run the build with the minimum changed diff possible.

## Current conclusion

This section remains important, but it is no longer a “find the baseline hang” problem.

It is now a guardrail:

- **clean-main builds**
- **future stalls are branch regressions until proven otherwise**
