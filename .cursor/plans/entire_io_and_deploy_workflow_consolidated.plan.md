---
name: "Entire.io + Deploy Workflow (Consolidated)"
overview: "Single plan consolidating the Entire.io integration, v2 branch push, Conventional Commits, branch protection, and deploy docs. Supersedes entire.io_integration_f067a72e, preview_prod_deploy_workflow_c427a459, and vercel_deployment_workflow_9c2fd421."
todos:
  - id: lint-fix
    content: "Fix any lint errors so CI will pass (npm run lint, npm run fix)"
    status: pending
  - id: install-entire
    content: "Install Entire CLI via Homebrew, verify version"
    status: pending
  - id: enable-entire
    content: "Run `entire enable --agent cursor`, verify .cursor/hooks.json coexistence with continual-learning hooks, verify git hooks"
    status: pending
  - id: configure-entire
    content: "Set telemetry:false and log_level:warn in .entire/settings.json, confirm .gitignore coverage"
    status: pending
  - id: commit-msg-hook
    content: "Add Conventional Commits validation to lefthook.yml as commit-msg hook"
    status: pending
  - id: re-enable-lint-fix
    content: "Uncomment lint-fix command in lefthook.yml pre-commit (currently disabled)"
    status: pending
  - id: commit-config
    content: "Commit all config changes to local main (Entire, lefthook, gitignore)"
    status: pending
  - id: branch-and-push
    content: "Create v2/platform branch from HEAD, reset local main to origin/main, push v2/platform"
    status: pending
  - id: open-pr
    content: "Open draft PR from v2/platform to main with comprehensive description"
    status: pending
  - id: test-preview
    content: "Test Vercel preview URL: homepage, experiments, registry V2, articles, mobile"
    status: pending
  - id: branch-protection
    content: "Enable GitHub branch protection on main (require PR + CI status checks, allow admin bypass)"
    status: pending
  - id: deploy-docs
    content: "Create .agents/workflows/deploy.md, update AGENTS.md with Branching section, update develop-experiment workflow"
    status: pending
  - id: cleanup
    content: "Delete 5 stale local branches, prune remote tracking refs, update backlog"
    status: pending
isProject: false
---

# Entire.io + Deploy Workflow (Consolidated Plan)

## Supersedes

This plan consolidates and updates three previous plans:

| Previous Plan | Status | What Changed |
|---|---|---|
| `entire.io_integration_f067a72e` | All pending | Entire docs evolved: no `summarize` option, Cursor integration now documented with known limitations |
| `preview_prod_deploy_workflow_c427a459` | All pending | Commit count 34→81, Registry V2 now complete, production hardening done |
| `vercel_deployment_workflow_9c2fd421` | All pending | Commit count 57→81, lint-fix now commented out in lefthook |

## Provenance

- [Deep Repo Research + Gap Analysis](152608fd-216c-4d2e-b656-38ef8d482a25) -- originated both plans
- [Pending Items + Devtools Buildout](b6f43f2e-d146-42dd-8757-b7bf7d7c73ef) -- updated deploy plan, began VFB
- Backlog: T1 (Vercel Preview Deploy, Branch Protection), T5 (Entire.io)

---

## Current State (2026-03-12)

- **81 commits** on local `main`, never pushed to `origin/main`
- **Entire CLI**: not installed, no `.entire/` directory
- **lefthook**: `lint-fix` command is commented out; only `typecheck` and `validate-experiments` run
- **5 stale local branches**: `feature/3d-basketball-court-hero`, `film-search`, `gaze-focus`, `refactor/gravity-physics-config`, `voronoi-menu`
- **No branch protection** on GitHub
- **Production hardening**: DONE (debug-in-prod, global-error.tsx, error boundaries, robots.txt, bundle analyzer)
- **Registry V2**: DONE (Fumadocs-powered interactive docs, 58+ items)
- **CI**: 2-job pipeline (`checks` + `build`) on push to main and PRs targeting main
- **`.cursor/hooks.json`**: has 2 continual-learning hooks (`sessionStart`, `stop`)
- **`.git/hooks/`**: only lefthook's `pre-commit`

---

## Phase 1: Pre-Flight (local, before branching)

### 1a. Fix lint errors

```bash
npm run lint          # check current state
npm run fix           # auto-fix format, imports, attributes
npm run lint          # verify clean
```

### 1b. Install Entire CLI

```bash
brew install entireio/tap/entire
entire version
```

### 1c. Enable Entire for Cursor

```bash
cp .cursor/hooks.json .cursor/hooks.json.bak
entire enable --agent cursor
```

**Verify hook coexistence:**

```bash
diff .cursor/hooks.json.bak .cursor/hooks.json
```

Expected: Entire appends hooks (`before-submit-prompt`, `subagent-start`, `subagent-stop`, `pre-compact`, session lifecycle) without removing existing `sessionStart` and `stop` continual-learning hooks.

**If hooks were clobbered:** Manually merge -- restore originals and add Entire's hooks alongside.

**Verify git hooks:**

```bash
ls -la .git/hooks/post-commit .git/hooks/pre-push
cat .git/hooks/pre-commit    # lefthook still owns this
```

Expected: New `post-commit` and `pre-push` from Entire. Lefthook's `pre-commit` untouched.

**Test disable/enable roundtrip:**

```bash
entire disable
diff .cursor/hooks.json.bak .cursor/hooks.json    # continual-learning survives?
ls .git/hooks/post-commit .git/hooks/pre-push 2>/dev/null    # should be gone
entire enable --agent cursor    # re-enable for real
```

### 1d. Configure Entire settings

Edit `.entire/settings.json`:

```json
{
  "enabled": true,
  "log_level": "warn",
  "telemetry": false,
  "strategy_options": {}
}
```

Confirm `.entire/.gitignore` handles `settings.local.json`. If not, add to repo root `.gitignore`:

```
.entire/settings.local.json
```

**Note on Cursor limitations (from current docs):**
- No rewind/resume for Cursor sessions
- No token accounting (transcripts lack token usage data)
- File detection is git-based (`git status`), not transcript-based
- These are acceptable trade-offs -- we still get session capture, explain, and PR context

### 1e. Re-enable lint-fix in lefthook

Uncomment the `lint-fix` command in `lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    lint-fix:
      run: npx ultracite fix {staged_files}
      stage_fixed: true
      glob: "*.{ts,tsx,js,mjs,json,jsonc,css}"
    typecheck:
      run: npx tsc --noEmit
      glob: "*.{ts,tsx}"
    validate-experiments:
      run: node scripts/validate-experiments.mjs
      glob: "**/experiment.json"
```

### 1f. Add Conventional Commits validation

Add `commit-msg` hook to `lefthook.yml`:

```yaml
# Entire.io owns post-commit and pre-push hooks (installed via `entire enable`).
# Lefthook manages pre-commit and commit-msg only. Do not extend lefthook to those hook types.

pre-commit:
  parallel: true
  commands:
    lint-fix:
      run: npx ultracite fix {staged_files}
      stage_fixed: true
      glob: "*.{ts,tsx,js,mjs,json,jsonc,css}"
    typecheck:
      run: npx tsc --noEmit
      glob: "*.{ts,tsx}"
    validate-experiments:
      run: node scripts/validate-experiments.mjs
      glob: "**/experiment.json"

commit-msg:
  commands:
    conventional-commit:
      run: >
        grep -qE "^(feat|fix|refactor|docs|chore|test|perf|style|ci|build|revert)(\(.+\))?: .{1,}" "$1"
        || (echo "Error: commit message must follow Conventional Commits (e.g. feat: add thing)" && exit 1)
```

### 1g. Commit all config changes

```bash
git add .entire/ .cursor/hooks.json lefthook.yml .gitignore
git commit -m "chore: integrate entire.io + conventional commits + re-enable lint-fix"
```

**Verify commit has Entire trailer:**

```bash
git log -1 --format="%B"
```

Expected: `Entire-Checkpoint: <hex>` trailer appended.

**Verify Entire status:**

```bash
entire status
entire explain --commit HEAD
```

**Delete backup:**

```bash
rm .cursor/hooks.json.bak
```

---

## Phase 2: Branch and Push

### 2a. Create v2/platform branch

```bash
git branch v2/platform          # snapshot HEAD (82+ commits)
git checkout main
git reset --hard origin/main    # local main = production state
git push -u origin v2/platform  # triggers CI + Vercel preview deploy
```

After this:
- `main` (local) = `origin/main` = current production
- `v2/platform` (remote) = all v2 work + Entire config

### 2b. Re-enable Entire on reset main

After `git reset --hard`, the `.entire/` directory and `.cursor/hooks.json` changes are gone from the working tree. But `.git/hooks/post-commit` and `.git/hooks/pre-push` survive (untracked by git).

```bash
entire enable --agent cursor
```

This restores `.entire/settings.json` and `.cursor/hooks.json`. Then configure settings again:

```bash
# Edit .entire/settings.json: telemetry:false, log_level:warn
git add .entire/ .cursor/hooks.json
git commit -m "chore: re-enable entire.io after branch split"
git push origin main
```

**Important:** This direct push to main must happen BEFORE branch protection is enabled (Phase 4).

### 2c. Open draft PR

```bash
git checkout v2/platform
gh pr create --draft --base main --head v2/platform \
  --title "feat: v2 platform launch" \
  --body "$(cat <<'EOF'
## V2 Platform Overhaul

82 commits covering the complete V2 platform rebuild:

### Platform Infrastructure
- Toolkit layer (`src/lib/toolkit/`): unified scroll, RAF, R3F canvas wrapper
- Dev tools: `?debug` in production, debug overlay, R3F/GSAP devtools
- Generation pipeline: posters, registry, llms-txt
- Production hardening: global-error.tsx, error boundaries, robots.txt, bundle analyzer

### Experiments
- announcing-v2: 7-section scroll experience with CRT shader, unified scroll
- 20 experiments with error boundaries, metadata, dev tools

### Registry V2
- Fumadocs-powered interactive docs explorer
- 58+ items across 5 categories
- shadcn-compatible install: `npx shadcn add https://www.razisyed.cv/r/<slug>`

### Content System
- Article component overhaul (LiveDemo, InteractiveWidget, styled controls)
- Content constellation: 6 auto-inject rules, 3 skills, 2 subagents
- MDX registry integration

### Infrastructure
- Tailwind CSS v4.2 migration
- Biome/ultracite linting
- CI: 2-job pipeline (checks + build)
- Entire.io agent session capture
- Conventional Commits validation

## Test Plan
- [ ] Homepage loads, responsive
- [ ] All experiment routes render
- [ ] Registry overview + detail pages work
- [ ] `npx shadcn add` install command works against preview URL
- [ ] Articles render correctly
- [ ] Mobile viewport
- [ ] No console errors
- [ ] CI passes (lint, typecheck, validate, test, build)

EOF
)"
```

---

## Phase 3: Test Preview Deployment

Vercel auto-deploys the PR branch. Test the preview URL:

| Area | What to test |
|---|---|
| Homepage | Layout, hero, writing section, experiment grid, responsive |
| Experiments | All 20 routes load, preview drawer, GPU cleanup |
| Registry V2 | `/registry` overview, `/registry/docs/*` detail pages, iframe previews, install commands, `noindex` |
| Announcing-v2 | Full scroll, CRT shader, all sections, Lenis scroll |
| Articles | `/experiments/send-button/article`, `/experiments/basketball-replay-center/article` |
| Mobile | Share preview URL to phone |
| Install contract | `npx shadcn add https://<preview-url>/r/send-button` |
| CI | Both `checks` and `build` jobs green |

Fix issues by pushing to `v2/platform`. Each push updates the preview.

---

## Phase 4: Branch Protection

After CI passes and preview looks good, enable branch protection on main:

```bash
gh api repos/raztronaut/experiments/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":false,"contexts":["checks","build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews=null \
  --field restrictions=null
```

- **Require PR** before merging
- **Require CI status checks** (`checks` and `build`)
- **Allow admin bypass** (solo-developer escape hatch)
- **No required reviewers**

---

## Phase 5: Agent Docs

### 5a. Create `.agents/workflows/deploy.md`

Document the full lifecycle: branching convention, Vercel preview/production model, build pipeline, registry URL contract, daily workflow.

Key contents:
- `main` = production, auto-deploys on merge
- PRs = preview deploys with unique URLs
- Feature branches: `feat/`, `fix/`, `port/`, `experiment/`
- Draft PRs for preview without signaling "ready"
- Admin bypass for single-commit hotfixes
- Build pipeline: `generate:posters` → `generate:registry` → `generate:llms-txt` → `next build`
- Registry install contract: `/r/:slug` must always work

### 5b. Update AGENTS.md

Add "Branching and Deploy" section between "Git Workflow" and "Guardrails":

```markdown
## Branching and Deploy

- **`main`** = production. Vercel auto-deploys every merge. Branch-protected: PRs required, CI must pass.
- **Feature branches** for multi-commit work: `feat/`, `fix/`, `port/`, `experiment/`.
- **Draft PRs** to get Vercel preview URLs without signaling "ready to merge".
- **Admin bypass** exists for single-commit hotfixes directly to `main`.
- Preview and production run the identical build pipeline. No environment-specific behavior.
- See `.agents/workflows/deploy.md` for the full lifecycle.
```

### 5c. Update `.agents/workflows/develop-experiment.md`

Add a "Push and Preview" section after the existing "Before Complete" checklist.

---

## Phase 6: Cleanup and Bookkeeping

### 6a. Delete stale branches

```bash
git branch -D feature/3d-basketball-court-hero film-search gaze-focus \
  refactor/gravity-physics-config voronoi-menu
git remote prune origin
```

### 6b. Update backlog

In `.agents/backlog/t1-infrastructure.md`:
- Check off "Vercel Preview Deploy Workflow"
- Check off "GitHub Branch Protection"

In `.agents/backlog/t5-toolkit-platform.md`:
- Check off "Entire.io integration"

### 6c. Archive superseded plans

Note in the backlog README that these plans are superseded:
- `entire.io_integration_f067a72e.plan.md`
- `preview_prod_deploy_workflow_c427a459.plan.md`
- `vercel_deployment_workflow_9c2fd421.plan.md`

---

## Phase 7: Merge to Production (HUMAN ONLY)

**The agent must NOT merge the PR.** Only the user merges.

1. Verify preview URL is clean
2. Verify CI is green
3. Merge PR on GitHub (squash or merge commit)
4. Vercel auto-deploys `main` to production at razisyed.cv
5. Verify live site

---

## What This Plan Does NOT Include

- **Lighthouse CI** -- downstream, needs preview infra working first
- **E2E / Playwright tests** -- separate effort
- **Test coverage reporting** -- nice-to-have
- **Sentry error tracking** -- flagged as separate project in production hardening plan
- **Release tags/versioning** -- experiments ship continuously

---

## Risk Mitigations

| Risk | Mitigation |
|---|---|
| Hook clobbering (Entire vs continual-learning) | Back up hooks.json, diff after enable, manual merge if needed |
| Lefthook conflict | Entire uses `post-commit`/`pre-push`; lefthook uses `pre-commit`/`commit-msg`. Comment documents ownership. |
| Vercel build trigger on `entire/checkpoints/v1` | Not a PR branch, not `main`. Vercel only deploys branches with PRs or main. Verify in dashboard. |
| 81-commit PR is large | Draft PR allows incremental review. Preview URL provides live testing. CI validates build. |
| Branch split loses Entire config | Re-enable on reset main before branch protection (Phase 2b). Git hooks in `.git/hooks/` survive reset. |
| lint-fix re-enable causes issues | Test locally before committing. Biome is deliberately permissive (30+ rules disabled). |

---

## Files Changed

### New files
- `.entire/settings.json` (created by `entire enable`, then configured)
- `.entire/settings.local.json` (created by `entire enable`, gitignored)
- `.git/hooks/post-commit` (created by `entire enable`)
- `.git/hooks/pre-push` (created by `entire enable`)
- `.agents/workflows/deploy.md`

### Modified files
- `.cursor/hooks.json` (Entire hooks appended)
- `lefthook.yml` (re-enable lint-fix, add commit-msg hook, add Entire ownership comment)
- `.gitignore` (possibly add `.entire/settings.local.json`)
- `AGENTS.md` (add "Branching and Deploy" section)
- `.agents/workflows/develop-experiment.md` (add push/preview section)
- `.agents/backlog/t1-infrastructure.md` (check off 2 items)
- `.agents/backlog/t5-toolkit-platform.md` (check off Entire.io)
- `.agents/backlog/README.md` (note superseded plans)
