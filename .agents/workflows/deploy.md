# Deploy Workflow

## How deployment works

- `main` branch = production. Vercel auto-deploys on merge.
- Any PR targeting `main` = preview deploy. Vercel assigns a unique URL.
- CI (GitHub Actions) runs on both push-to-main and PRs: lint, typecheck, validate, test, build.
- Lefthook pre-commit hooks run locally: lint-check (read-only), typecheck, validate-experiments.
- Conventional Commits validated via `.git/hooks/commit-msg` (inlined alongside Entire.io hook).

## Branching convention

- `main` -- production, always deployable, branch-protected
- `feat/<name>`, `fix/<name>`, `port/<name>`, `experiment/<name>` -- short-lived feature branches off main
- Direct commits to `main` -- admin bypass only, single-commit hotfixes

## Daily workflow

1. Branch: `git checkout -b feat/cool-thing`
2. Commit: lefthook runs pre-commit (lint-check, typecheck, validate) + commit-msg (conventional commits + Entire checkpoint)
3. Push + PR: `git push -u origin HEAD && gh pr create --draft`
4. Vercel preview auto-deploys. CI runs.
5. Visual QA on preview URL.
6. Mark ready + merge when satisfied.

## Build pipeline on deploy

Vercel runs `npm run build` which calls `generate:all` then `next build`.

`generate:all` orchestrates three phases in parallel:

1. `generate:posters` -- ffmpeg first-frame extraction (skips wip)
2. `generate:registry` -- 4-step shadcn-compatible JSON pipeline (skips wip)
3. `generate:llms-txt` -- LLM discovery files (skips wip)

All three generation scripts filter out `status: "wip"` experiments. Preview deploys show only shipped experiments in generated indexes. WIP experiments are accessible by direct URL but don't appear in registry/llms.txt.

## Registry URL contract

- `/r/:slug` rewrites to `/registry/:slug.json` (static file in `public/`)
- `npx shadcn add https://www.razisyed.cv/r/send-button` must always work
- When refactoring the registry pipeline, verify this URL contract in the preview deploy

## Preview vs production differences

None, by design. The same build runs everywhere. The only difference is the URL:

- Preview: `experiments-git-v2-platform-raztronaut.vercel.app` (or similar)
- Production: `www.razisyed.cv`

## Hook ownership

| Hook type | Owner | Notes |
|-----------|-------|-------|
| `pre-commit` | Lefthook (`lefthook.yml`) | lint-check, typecheck, validate-experiments |
| `prepare-commit-msg` | Entire.io (`.git/hooks/`) | Session tracking |
| `commit-msg` | Entire.io + conventional commits (`.git/hooks/`) | Grep validation + trailer management |
| `post-commit` | Entire.io (`.git/hooks/`) | Checkpoint creation |
| `pre-push` | Entire.io (`.git/hooks/`) | Push session data to `entire/checkpoints/v1` |

After running `entire enable`, re-apply the conventional commits grep to `.git/hooks/commit-msg`.

## Entire.io session capture

Every commit gets an `Entire-Checkpoint` trailer linking to session context. On push, session data is stored on the `entire/checkpoints/v1` branch (metadata only, no code). This branch does NOT trigger Vercel builds.

```bash
entire status          # check if enabled
entire explain --commit HEAD  # view session context for a commit
```

## Safety rules

- **Never** use `stage_fixed: true` in lefthook (causes stash data loss)
- **Never** merge the PR without testing the preview URL first
- **Never** push directly to main after branch protection is enabled (use admin bypass only for emergencies)
