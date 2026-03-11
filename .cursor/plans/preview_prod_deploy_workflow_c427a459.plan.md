---
name: Preview Prod Deploy Workflow
overview: Establish a clean preview/production deployment workflow -- branching convention, commit guardrails, agent docs for the deploy lifecycle, and build pipeline awareness for the upcoming registry refactor. No merges to main in this plan; the v2 branch ships later as part of the broader V2 launch.
todos:
  - id: push-v2-branch
    content: Create v2/platform branch from current local main (34 commits), reset local main to origin/main, push branch to origin. Open a draft PR for CI/preview -- do NOT merge.
    status: pending
  - id: commit-msg-hook
    content: Add Conventional Commits validation to lefthook.yml as a commit-msg hook (zero-dependency grep pattern, no commitlint).
    status: pending
  - id: branch-protection
    content: Enable GitHub branch protection on main (require PR + CI status checks, allow admin bypass, no required reviewers).
    status: pending
  - id: deploy-workflow-doc
    content: Create .agents/workflows/deploy.md documenting the full branching + preview + production lifecycle, including how Vercel preview URLs work, WIP filtering in generation scripts, and registry URL considerations.
    status: pending
  - id: update-agents-md
    content: Add a 'Branching and Deploy' section to AGENTS.md covering the convention (main=prod, feature branches, PRs for preview), and reference the new deploy workflow.
    status: pending
  - id: update-develop-workflow
    content: Update .agents/workflows/develop-experiment.md to include branch creation, pushing, and preview testing as part of the development cycle.
    status: pending
  - id: cleanup-branches
    content: Delete 5 stale local branches and prune stale remote tracking refs.
    status: pending
  - id: update-backlog
    content: Check off completed items in t1-infrastructure.md and add notes about registry pipeline awareness.
    status: pending
isProject: false
---

# Clean Deploy Workflow: Preview/Prod Split

## Current State

- **34 commits** on local `main`, never pushed to `origin/main`. The entire V2 platform overhaul, announcing-v2, inversa port, homepage redesign, agent docs, and more.
- **No branching strategy** -- everything committed directly to `main`, then not pushed.
- **No preview deployments** -- Vercel's preview infra exists (auto-deploys PRs) but is unused because no PRs are opened.
- **No branch protection** on GitHub.
- **CI runs** on push to `main` and PRs targeting `main`, but hasn't been triggered for 34 commits because nothing reached GitHub.
- **5 stale local feature branches** never cleaned up.
- **Build pipeline** (`generate:posters && generate:registry && generate:llms-txt && next build`) runs on every Vercel deploy. All three generation scripts skip `status: "wip"` experiments, which means preview deploys behave identically to production for content filtering.
- **Registry refactor planned** ([registry_interactive_docs plan](registry_interactive_docs_aaa07efa.plan.md)) will replace `generate-registry.mjs` with a 3-step pipeline and move output from `public/registry/` to `public/r/`. This work needs to be preview-tested before shipping.

The deploy pipeline on paper is solid (lefthook -> push -> GitHub Actions CI -> Vercel auto-deploy). The problem is behavioral -- the push step is being skipped entirely.

## Relevant Backlog Items

From [t1-infrastructure.md](.agents/backlog/t1-infrastructure.md):

- **Vercel Preview Deploy Workflow** -- the core issue
- **GitHub Branch Protection** -- prevent future direct-to-production pushes
- Lighthouse CI, E2E tests, coverage reporting -- downstream, not this plan

From the [registry plan](registry_interactive_docs_aaa07efa.plan.md):

- Phase 1 replaces `generate-registry.mjs` and changes `package.json` build script
- The `/r/:slug` rewrite in `next.config.ts` must keep working during transition
- New Fumadocs route group `(registry)` adds to the Next.js build surface

## The Plan

### Phase 1: Push v2 branch (no merge)

Get the 34 commits onto GitHub to activate CI and Vercel preview deploys, but do NOT merge yet -- V2 still has pending work (announcing-v2, registry, etc.).

```bash
git branch v2/platform          # snapshot current local main
git checkout main
git reset --hard origin/main    # local main = production state
git push -u origin v2/platform  # triggers CI + Vercel preview
gh pr create --draft --base main --head v2/platform \
  --title "feat: v2 platform overhaul" --body "..."
```

**Why draft PR**: signals "not ready to merge" while still getting preview URL + CI. The PR stays open as V2 development continues on that branch.

**Going forward**: all new V2 work (registry refactor, announcing-v2 polish, etc.) is committed to `v2/platform`, pushed, and validated against the preview URL. When V2 is ready, the PR gets marked ready and merged.

### Phase 2: Commit message linting

Add a `commit-msg` hook to [lefthook.yml](lefthook.yml):

```yaml
commit-msg:
  commands:
    conventional-commit:
      run: >
        grep -qE "^(feat|fix|refactor|docs|chore|test|perf|style|ci|build|revert)(\(.+\))?: .{1,}" "$1"
        || (echo "Error: commit message must follow Conventional Commits (e.g. feat: add thing)" && exit 1)
```

Zero dependencies. Catches AI agents that don't follow the format. The `$1` is the commit message temp file path that lefthook passes to `commit-msg` hooks.

### Phase 3: GitHub branch protection

Enable protection on `main` immediately (even before v2 merges):

- **Require PR** before merging.
- **Require CI status checks** to pass (`checks` and `build` jobs).
- **Allow admin bypass** (`enforce_admins: false`) -- solo-developer escape hatch for urgent hotfixes.
- **No required reviewers**.

```bash
gh api repos/raztronaut/experiments/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":false,"contexts":["checks","build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews=null \
  --field restrictions=null
```

### Phase 4: Agent docs -- deploy workflow

Create [.agents/workflows/deploy.md](.agents/workflows/deploy.md) documenting the full lifecycle. This is the missing link -- there's no deployment or git workflow doc in `.agents/workflows/` today.

Contents:

```markdown
# Deploy Workflow

## How deployment works

- `main` branch = production. Vercel auto-deploys on merge.
- Any PR targeting `main` = preview deploy. Vercel assigns a unique URL.
- CI (GitHub Actions) runs on both push-to-main and PRs: lint, typecheck, validate, test, build.
- Lefthook pre-commit hooks run locally: lint-fix, typecheck, validate-experiments.

## Branching convention

- `main` -- production, always deployable
- `v2/platform` -- current long-lived V2 development branch (draft PR open)
- `feat/<name>`, `fix/<name>`, `port/<name>`, `experiment/<name>` -- short-lived branches off main (or off v2/platform during V2 dev)
- Direct commits to `main` -- admin bypass only, single-commit hotfixes

## Daily workflow

1. Branch: `git checkout -b feat/cool-thing` (off v2/platform during V2 dev)
2. Commit: lefthook runs pre-commit (lint, typecheck, validate) + commit-msg (conventional commits)
3. Push + PR: `git push -u origin HEAD && gh pr create --draft`
4. Vercel preview auto-deploys. CI runs.
5. Visual QA on preview URL.
6. Mark ready + merge when satisfied.

## Build pipeline on deploy

Vercel runs `npm run build` which chains:
1. `generate:posters` -- ffmpeg first-frame extraction (skips wip)
2. `generate:registry` -- shadcn-compatible JSON (skips wip)
3. `generate:llms-txt` -- LLM discovery files (skips wip)
4. `next build` -- production bundle

All three generation scripts filter out `status: "wip"` experiments. This means
preview deploys only show shipped experiments in the registry/llms.txt, which is
the correct behavior (WIP experiments are accessible by URL but don't appear in
generated indexes).

## Registry URL contract

- `/r/:slug` rewrites to `/registry/:slug.json` (static file in public/)
- `npx shadcn add https://www.razisyed.cv/r/send-button` must always work
- When refactoring the registry pipeline, verify this URL contract in the preview deploy

## Preview vs production differences

None, by design. The same build runs everywhere. The only difference is the URL:
- Preview: `<hash>-raztronaut.vercel.app`
- Production: `www.razisyed.cv`
```

### Phase 5: Update AGENTS.md

Add a "Branching and Deploy" section to [AGENTS.md](AGENTS.md) between "Git Workflow" and "Guardrails":

```markdown
## Branching and Deploy

- **`main`** = production. Vercel auto-deploys every merge. Branch-protected: PRs required, CI must pass.
- **Feature branches** for multi-commit work: `feat/`, `fix/`, `port/`, `experiment/`.
- **Draft PRs** to get Vercel preview URLs without signaling "ready to merge".
- **Admin bypass** exists for single-commit hotfixes directly to `main`.
- Preview and production run the identical build pipeline (`generate:posters && generate:registry && generate:llms-txt && next build`). No environment-specific behavior.
- See `.agents/workflows/deploy.md` for the full lifecycle.
```

### Phase 6: Update develop-experiment workflow

The current [.agents/workflows/develop-experiment.md](.agents/workflows/develop-experiment.md) stops at "check the dev server." It should include the deploy/test cycle:

Add a section after the existing "Before Complete" checklist:

```markdown
## Push and Preview

When the experiment is ready for review (or you want to test in a deployed environment):

1. Ensure you're on a feature branch (not `main`)
2. Push: `git push -u origin HEAD`
3. Open PR (or push to existing PR branch): `gh pr create --draft` or just push
4. Vercel auto-deploys a preview. Find the URL in the PR checks.
5. Test the experiment on the preview URL -- scroll, interaction, mobile viewport
6. Verify the experiment does NOT appear in registry/llms.txt if `status: "wip"`
7. When ready, mark PR as ready for review and merge

The preview URL is your staging environment. No separate staging infra needed.
```

### Phase 7: Clean up stale branches

```bash
git branch -D feature/3d-basketball-court-hero film-search gaze-focus \
  refactor/gravity-physics-config voronoi-menu
git remote prune origin
```

## Build Pipeline Considerations for Registry Refactor

The [registry interactive docs plan](registry_interactive_docs_aaa07efa.plan.md) will change the build pipeline significantly:

**Current**: `generate:registry` is a single `generate-registry.mjs` script outputting to `public/registry/`.

**Planned**: 3-step pipeline (`generate-registry-json.mjs` -> `shadcn build` -> `post-process-registry.mjs`) outputting to `public/r/`.

**What to be careful about**:

1. **The `/r/:slug` rewrite must work during transition**. Currently it rewrites to `/registry/:slug.json`. If output moves to `public/r/`, the rewrite needs to change to `/r/:slug.json` or be removed entirely (Next.js serves `public/r/` directly). Test this in the preview deploy before merging.
2. **The build script in `package.json` changes**. The `generate:registry` step goes from one script to a chain. If `shadcn build` is added as a dependency, it needs to be installed in CI too. The current CI `build` job runs `npm run build` which includes registry generation -- this will break if the script changes aren't coordinated with the `shadcn` CLI being available.
3. **Fumadocs adds to build surface**. The new `(registry)` route group with MDX compilation adds build time. Monitor this in preview deploy build logs.
4. `**index.json` is ~890K chars currently**. The registry plan should address whether the new pipeline still generates a monolithic index or splits it. This affects build time and Vercel's static file serving.
5. **Preview deploy is the testing ground**. All registry refactor work should happen on a branch, get a preview URL, and have the install command tested: `npx shadcn add https://<preview-url>/r/send-button`. This is exactly why the preview/prod split matters.

The deploy workflow doc (Phase 4) documents this contract so future registry work doesn't accidentally break it.

## What this plan does NOT include

- **Merging v2/platform to main** -- V2 is still in progress. Merge happens when V2 is ready.
- **Lighthouse CI** -- downstream, needs preview infra working first (which this plan establishes).
- **E2E tests** -- separate effort, not blocking deploy workflow.
- **Coverage reporting** -- nice-to-have.
- **Staging environment** -- preview URLs from PRs are staging. No separate infra needed.
- **Release tags/versioning** -- experiments ship continuously.

## Files to create/modify

**New files:**

- `.agents/workflows/deploy.md` -- full deploy lifecycle documentation

**Modified files:**

- [lefthook.yml](lefthook.yml) -- add `commit-msg` hook
- [AGENTS.md](AGENTS.md) -- add "Branching and Deploy" section
- [.agents/workflows/develop-experiment.md](.agents/workflows/develop-experiment.md) -- add push/preview section
- [.agents/backlog/t1-infrastructure.md](.agents/backlog/t1-infrastructure.md) -- update status of completed items

**Git operations (no file edits):**

- Create and push `v2/platform` branch
- Open draft PR
- Enable branch protection via `gh api`
- Delete stale local branches

