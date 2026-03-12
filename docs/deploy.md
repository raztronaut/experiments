# CI/CD and Deploy

## Default PR Flow

This repo is designed around branch review and preview deploys. The default path is:

1. Branch off `main`.
2. Work locally or in a worktree.
3. Commit with a conventional commit.
4. Push the branch.
5. Open a draft PR.
6. Validate CI and the Vercel preview.
7. Merge only after the diff is understood and the preview looks right.

Use draft PRs early. They are the normal way to get preview URLs without implying that the work is ready to merge.

## Using AI Work In PRs

AI-prepared work should flow through the same repo controls as human-authored work.

When an automation or agent produces a useful diff, choose one of these paths:

- **Keep the automation branch/worktree as-is** when the work is already scoped cleanly and the PR boundary is obvious.
- **Continue manually in that same worktree** when the automation created good momentum but the work is not finished.
- **Start fresh or cherry-pick** when the automation output is mostly diagnostic or the branch boundary is messy.

Do not merge automation output simply because the checks pass. Read the diff first.

### Repo-Specific Examples

- `test-gap-detection`: usually belongs on the normal branch/PR path because it changes code and tests.
- `update-changelog`: may be small enough for direct local integration if it is clearly correct and low-risk.
- `automated-architectural-docs`: often benefits from manual review or refinement before it becomes a PR.
- `announcing-v2`: always use PR + preview + visual QA, even if AI prepared the branch.

## Preview Review Checklist

- [ ] Homepage if shared UI or metadata changed
- [ ] Changed experiment, article, or registry route
- [ ] Generated artifacts if the change affects posters, registry, or llms outputs
- [ ] Mobile pass if UI or layout changed
- [ ] Reduced-motion or obvious interaction sanity check if motion changed

## Merge Decision Checklist

- [ ] Repo checks passed
- [ ] Preview inspected when needed
- [ ] No unrelated diff remains in the branch
- [ ] Metadata and generated outputs are intentional
- [ ] Visual QA completed for UI-facing changes

## When Direct Local Integration Is Acceptable

Direct local integration is fine only when the change is:

- tiny and low-risk
- mostly docs-only or trivial maintenance
- free of build, config, deploy, registry, or generated-surface implications
- fully understandable without a preview URL

If the change affects public behavior, rollout surfaces, or deploy confidence, use a PR.

## Common Failure Modes

- skipping PRs for work that really needs preview review
- leaving long-lived draft branches open with no clear next action
- merging automation output without understanding the diff
- forgetting preview verification for UI and rollout work
- mixing unrelated changes into one branch because an automation wandered

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production. Always deployable. Branch-protected: PRs required, CI must pass. |
| `feat/<name>` | New features or experiments |
| `fix/<name>` | Bug fixes |
| `port/<name>` | Porting external demos |
| `experiment/<name>` | Experimental work |

Direct commits to `main` are possible only via admin bypass, reserved for single-commit hotfixes.

## Vercel Deployment

- **Production**: auto-deploys every merge to `main` at `www.razisyed.cv`
- **Preview**: every PR targeting `main` gets a unique preview URL
- **No environment-specific behavior**: preview and production run the identical build pipeline

Use draft PRs to get Vercel preview URLs without signaling "ready to merge."

## Build Pipeline

`npm run build` chains four steps:

```
generate:posters  ->  generate:registry  ->  generate:llms-txt  ->  next build
```

| Step | Script | Output |
|------|--------|--------|
| 1. Posters | `generate-posters.mjs` | `public/experiments/*/poster.jpg` (ffmpeg first-frame extraction) |
| 2. Registry | 4-script pipeline | `public/registry/*.json`, `content/registry/**/*.mdx` |
| 3. llms-txt | `generate-llms-txt.mjs` | `public/llms.txt`, `public/llms-full.txt` |
| 4. Next.js | `next build` | Production bundle |

All three generation scripts filter out `status: "wip"` experiments. Preview deploys include only shipped experiments in generated indexes. WIP experiments are accessible by direct URL but don't appear in registry, llms.txt, or poster outputs.

## CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on push to `main` and on PRs. Two parallel jobs:

### Checks Job

1. Checkout + npm ci
2. `npx fumadocs-mdx` (generate source files)
3. `npm run lint` (Biome via ultracite)
4. `npm run typecheck` (`tsc --noEmit`)
5. `npm run validate:experiments`
6. `npm run test -- --run --project unit`

### Build Job

1. Checkout + npm ci
2. Restore Next.js cache
3. `npm run build` (full pipeline)

Concurrency: uses `workflow-ref` groups with `cancel-in-progress: true` to avoid redundant runs on rapid pushes.

## Lefthook Pre-Commit Hooks

Three hooks run in parallel on every commit (`lefthook.yml`):

| Hook | Command | Files |
|------|---------|-------|
| lint-check | `npx ultracite check {staged_files}` | `*.{ts,tsx,js,mjs,json,jsonc,css}` |
| typecheck | `npx tsc --noEmit` | `*.{ts,tsx}` |
| validate-experiments | `node scripts/validate-experiments.mjs` | `**/experiment.json` |

The lint hook runs in **check** mode (read-only, fails on violations). Fix lint issues manually with `npm run fix`.

**Never use `stage_fixed: true`** in lefthook with any fixer/formatter. Lefthook stashes unstaged changes before running, and if the stash pop fails (formatting touched overlapping lines), unstaged work is silently lost as an orphaned stash.

## Entire.io Session Capture

[Entire.io](https://docs.entire.io) captures AI agent session context as Git-native checkpoints. Metadata lives on the `entire/checkpoints/v1` branch (metadata only, no code -- does NOT trigger Vercel builds).

### Hook Ownership

| Hook | Owner | Notes |
|------|-------|-------|
| `pre-commit` | Lefthook (`lefthook.yml`) | lint-check, typecheck, validate-experiments |
| `prepare-commit-msg` | Entire.io (`.git/hooks/`) | Session tracking |
| `commit-msg` | Entire.io + conventional commits (`.git/hooks/`) | Grep validation + trailer management |
| `post-commit` | Entire.io (`.git/hooks/`) | Checkpoint creation |
| `pre-push` | Entire.io (`.git/hooks/`) | Push session data to `entire/checkpoints/v1` |

After running `entire enable`, re-apply the conventional commits grep to `.git/hooks/commit-msg` (Entire's enable command overwrites it).

### Commands

```bash
entire status                    # check if enabled
entire explain --commit HEAD     # view session context for a commit
```

Every commit gets an `Entire-Checkpoint` trailer linking to session context. `Entire-Attribution` trailers are structured metadata, not authorship copy -- they are acceptable in commit messages.

## Daily Workflow

1. **Branch**: `git checkout -b feat/cool-thing`
2. **Commit**: lefthook runs pre-commit hooks + Entire captures session context
3. **Push + PR**: `git push -u origin HEAD && gh pr create --draft`
4. **Preview**: Vercel auto-deploys. CI runs.
5. **Visual QA**: test on the preview URL
6. **Merge**: mark ready + merge when satisfied

This same flow applies to substantive automation output. The review surface is still the branch, PR, CI, and preview URL.

## Registry URL Verification

After any change to the registry pipeline, verify the URL contract on the preview deploy:

```bash
curl -I https://<preview-url>/r/send-button
# Should return 200 with JSON content
```

`npx shadcn add https://www.razisyed.cv/r/<slug>` must always work in production.
