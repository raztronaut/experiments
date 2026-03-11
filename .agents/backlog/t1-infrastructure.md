# T1: Infrastructure / CI

Core platform infrastructure that unblocks other tiers.

## Pending

- [ ] **Vercel Preview Deploy Workflow** -- 33 commits of v2 work sitting on local `main` unpushed (v2 platform infra, homepage redesign, announcing-v2, landing-page-reveal-animation-port, section decomposition, agent docs, CI fixes, and more). Need to branch (`v2/platform`), reset local main to `origin/main`, push branch to trigger Vercel preview deployment, open PR, test preview URL, then merge to ship. No `vercel.json` needed -- `next.config.ts` handles all routing/headers/rewrites. Vercel Git integration auto-deploys: `main` → production, any other branch/PR → preview.
  - Steps: `git branch v2/platform && git reset --hard origin/main && git push -u origin v2/platform` → open PR → test preview URL → merge → production deploy.
  - Source: [Vercel deployment workflow plan](../../.cursor/plans/vercel_deployment_workflow_9c2fd421.plan.md)

- [ ] **GitHub Branch Protection** -- After v2 ships, add branch protection on `main`: require PR, require CI status checks to pass. Prevents future direct-to-production pushes.
  - Source: [Vercel deployment workflow plan](../../.cursor/plans/vercel_deployment_workflow_9c2fd421.plan.md)

- [ ] **Lighthouse CI** -- Performance budgets on Vercel preview URLs. Needs `.lighthouserc.*` config, GitHub Actions workflow, score > 80 gate on 3 most recent experiments. Blocked by: Vercel preview deploy workflow (above).
  - Source: [V2 plan Section 6](../../.cursor/plans/experiments_platform_v2_d73b9769.plan.md), [Lighthouse CI chat](4a2597be-55d9-4da8-a544-e3b39207bb9d)

- [ ] **E2E / Integration Tests** -- Playwright is installed (used for `capture.mjs`) but zero browser tests exist. Need test suite for critical user flows: homepage load, experiment navigation, article rendering, scroll-driven animations.
  - Source: [V2 review Section 8](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

- [ ] **Test Coverage Reporting** -- `@vitest/coverage-v8` installed but `--coverage` flag not wired into CI `checks` job. Need coverage thresholds and CI artifact upload.
  - Source: [P4 CI plan](../../.cursor/plans/p4_ci_testing_infrastructure_2687de1c.plan.md)
