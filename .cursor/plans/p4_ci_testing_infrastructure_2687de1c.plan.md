---
name: P4 CI Testing Infrastructure
overview: Address Section 8 (Testing and CI Gaps) and Section 11 P4 (Infrastructure) of the V2 Comprehensive Review by parallelizing CI, adding build caching, integrating Storybook validation and browser tests, and cleaning up stale plan metadata.
todos:
  - id: parallelize-ci
    content: "Split ci.yml into 3 parallel jobs: checks (lint+typecheck+validate+unit), build (with .next cache), storybook (build+browser tests)"
    status: pending
  - id: next-cache
    content: Add actions/cache for .next/cache in the build job for incremental rebuilds
    status: pending
  - id: storybook-build-ci
    content: Add npm run build-storybook to CI to catch silent Storybook breaks
    status: pending
  - id: storybook-tests-ci
    content: Run storybook browser tests in CI with Playwright chromium (npm run test -- --run --project storybook)
    status: pending
  - id: coverage-reporting
    content: Add --coverage flag to unit tests and upload coverage artifact
    status: pending
  - id: optimize-lefthook
    content: Add glob filter to lefthook typecheck command so tsc only runs when .ts/.tsx files are staged
    status: pending
  - id: update-plan-metadata
    content: Update comprehensive review plan frontmatter todos to reflect actual completed status
    status: pending
isProject: false
---

# P4: CI, Testing, and Build Infrastructure

Addresses the remaining infrastructure gaps from the [V2 Comprehensive Review](v2_comprehensive_review_9100ae49.plan.md) -- Section 8 (Testing and CI Gaps) and Section 11 P4.

---

## Current State

The CI pipeline (`[.github/workflows/ci.yml](.github/workflows/ci.yml)`) runs a single sequential `quality` job:

```
checkout -> npm ci -> lint -> typecheck -> validate -> unit tests -> build
```

Key gaps identified in the review:

- **CI steps are sequential** -- lint, typecheck, and validate are independent but run back-to-back
- **No `.next` cache** -- full rebuild on every push
- **Storybook build not validated** -- `npm run build-storybook` never runs in CI, can break silently
- **Storybook browser tests not in CI** -- `vitest.config.ts` already configures an 18-story `storybook` project with `@vitest/browser-playwright`, but CI only runs `--project unit`
- **No test coverage reporting** -- `@vitest/coverage-v8` is installed but unused

---

## Plan

### 1. Parallelize CI into 3 Jobs

Split the single `quality` job into parallel jobs. Each job runs `npm ci` independently (cached by `actions/setup-node`), so total wall-clock time is `max(job1, job2, job3)` instead of `sum(all steps)`.

**Job A: `checks`** (fast, ~30s)

- lint (`npm run lint`)
- typecheck (`npm run typecheck`)
- validate experiments (`npm run validate:experiments`)
- unit tests (`npm run test -- --run --project unit`)

**Job B: `build`** (medium, ~45-60s)

- `npm run build` (includes poster gen, registry gen, llms.txt gen, Next.js build)
- Persist `.next/cache` via `actions/cache` for incremental rebuilds

**Job C: `storybook`** (medium, ~60-90s)

- Install Playwright browsers (`npx playwright install --with-deps chromium`)
- Build Storybook (`npm run build-storybook`)
- Run Storybook browser tests (`npm run test -- --run --project storybook`)

All three jobs start in parallel after `actions/checkout` + `actions/setup-node` (with npm cache).

### 2. Add `.next` Build Cache

Add `actions/cache` for `.next/cache` in the `build` job. This enables Next.js incremental compilation -- subsequent CI runs only rebuild changed pages.

```yaml
- uses: actions/cache@v4
  with:
    path: .next/cache
    key: nextjs-${{ hashFiles('package-lock.json') }}-${{ hashFiles('src/**') }}
    restore-keys: |
      nextjs-${{ hashFiles('package-lock.json') }}-
      nextjs-
```

### 3. Add Storybook Build Validation

`npm run build-storybook` verifies all 18 stories compile without errors. This is a static build (no browser needed) that catches:

- Broken imports in story files
- Missing or renamed component exports
- Storybook config issues (`.storybook/main.ts`)

### 4. Add Storybook Browser Tests

The infrastructure already exists in `[vitest.config.ts](vitest.config.ts)`:

- `storybook` project uses `@storybook/addon-vitest` with `@vitest/browser-playwright`
- 18 story files across all experiments
- `.storybook/vitest.setup.ts` wires a11y annotations (currently `"todo"` mode -- report but don't fail)

Running `npm run test -- --run --project storybook` in CI will:

- Launch headless Chromium
- Render each story
- Report a11y violations (non-blocking for now)
- Catch runtime rendering errors

Requires `npx playwright install --with-deps chromium` in the CI job.

### 5. Add Test Coverage Reporting

`@vitest/coverage-v8` is already installed. Add `--coverage` flag to the unit test step and upload the report as a CI artifact. This provides baseline coverage tracking.

### 6. Optimize Pre-Commit Hooks (Lefthook)

Current `[lefthook.yml](lefthook.yml)` runs `tsc --noEmit` on every commit regardless of file type. For CSS-only or markdown-only changes, this is wasted time.

Add a `glob` filter to the `typecheck` command so it only runs when TS/TSX files are staged:

```yaml
typecheck:
  run: npx tsc --noEmit
  glob: "*.{ts,tsx}"
```

### 7. Update Stale Plan Metadata

The comprehensive review plan's frontmatter has 6 todos still marked `pending` that are actually done (per the body text). Update:

- `fix-data-inconsistencies` -> `completed` (404-not-found, test status, plopfile, delete-article all fixed; game-of-life-shader profile is cosmetic, documented)
- `fix-semantic-seo` -> `completed` (breadcrumbs, JSON-LD, canonical, sitemap/RSS all fixed; TOC intentionally deferred)
- `fix-code-quality` -> `completed` (deps moved, schema validation, optimizePackageImports done; CSS extraction and exhaustive-deps intentionally deferred)
- `fix-docs-accuracy` -> `completed` (architecture.md, STATUS.md, constants all fixed)
- `fix-ci-testing` -> `in_progress` (this plan)
- `content-pipeline-execution` -> keep `pending` (ongoing, separate effort)

---

## Out of Scope

These are listed in Section 10 (P3 original plan items) but are larger features deserving their own plans:

- MCP capture server
- Lighthouse CI (needs deployed preview URL -- add as follow-up after this CI work lands)
- Registry V2 with interactive docs
- Content dashboard
- Article-aware homepage section
- Content generation for 16 remaining experiments

Also intentionally deferred from earlier sections:

- Cursor.tsx `getCursorColor` perf bug (Section 3E)
- `useExhaustiveDependencies` / Biome a11y rules (Section 5D -- wide blast radius)
- 15/18 legacy layout metadata hardcoding (Section 5B -- cosmetic)
- Preview media component redundancies (Section 5J -- cosmetic)

