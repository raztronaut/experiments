# T1: Infrastructure / CI

Core platform infrastructure that unblocks other tiers.

## Pending

- [x] **Vercel Preview Deploy Workflow** -- Done 2026-03-12. v2/platform branch pushed (96 commits), draft PR #3 open, Vercel preview auto-deploying. Entire.io re-enabled on main after branch split. Deploy workflow documented in `.agents/workflows/deploy.md`.

- [ ] **GitHub Branch Protection** -- Enable after v2 preview is validated and merged. Require PR + CI status checks, allow admin bypass.
  - Source: [Consolidated plan](../../.cursor/plans/entire_io_and_deploy_workflow_consolidated.plan.md)

- [ ] **Lighthouse CI** -- Performance budgets on Vercel preview URLs. Needs `.lighthouserc.*` config, GitHub Actions workflow, score > 80 gate on 3 most recent experiments. Blocked by: Vercel preview deploy workflow (above).
  - Source: [V2 plan Section 6](../../.cursor/plans/experiments_platform_v2_d73b9769.plan.md), [Lighthouse CI chat](4a2597be-55d9-4da8-a544-e3b39207bb9d)

- [ ] **E2E / Integration Tests** -- Playwright is installed (used for `capture.mjs`) but zero browser tests exist. Need test suite for critical user flows: homepage load, experiment navigation, article rendering, scroll-driven animations.
  - Source: [V2 review Section 8](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

- [ ] **Test Coverage Reporting** -- `@vitest/coverage-v8` installed but `--coverage` flag not wired into CI `checks` job. Need coverage thresholds and CI artifact upload.
  - Source: [P4 CI plan](../../.cursor/plans/p4_ci_testing_infrastructure_2687de1c.plan.md)
