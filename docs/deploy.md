# CI/CD and Deploy

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

## Registry URL Verification

After any change to the registry pipeline, verify the URL contract on the preview deploy:

```bash
curl -I https://<preview-url>/r/send-button
# Should return 200 with JSON content
```

`npx shadcn add https://www.razisyed.cv/r/<slug>` must always work in production.
