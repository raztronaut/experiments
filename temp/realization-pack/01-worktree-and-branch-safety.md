# Worktree And Branch Safety

## Purpose

This clean pass must not disturb the main checkout while work is in progress.

The correct setup is:

- **main checkout** stays at `/Users/razisyed/Developer/experiments`
- **clean-pass worktree** lives at `/Users/razisyed/.codex/worktrees/realization/experiments`
- **implementation branch** inside that worktree is `razi/architecture-realization`

## Current verified state

As of this investigation:

- main checkout branch: `main`
- main checkout status:
  - `docs/README.md` modified
  - `docs/automation-deep-pass-prompts.md` modified
  - `registry.json` modified
  - `docs/gpt-5.4-deep-repo-audit-prompt.md` untracked
  - `temp/` untracked
- clean worktree branch: `razi/architecture-realization`
- clean worktree status: clean at branch creation
- detached prototype worktree still exists separately at `/Users/razisyed/.codex/worktrees/1f4c/experiments`

## What a worktree does and does not isolate

### What it isolates

- working directory files
- checked-out branch state for that directory
- generated artifacts in that directory
- local edits and untracked files in that directory

### What it does not isolate

- the underlying git object database
- shared refs in the repository
- commits once created
- branch names

That means:

- editing files in the clean worktree does **not** edit files in the main checkout
- but creating or moving branches still affects the shared repository

## Safe workflow commands

### Inspect the shared worktree state

```bash
git worktree list --porcelain
```

### Verify the main checkout

```bash
cd /Users/razisyed/Developer/experiments
git branch --show-current
git status --short
git rev-parse HEAD
```

### Verify the clean worktree

```bash
cd /Users/razisyed/.codex/worktrees/realization/experiments
git branch --show-current
git status --short
git rev-parse HEAD
```

### Create the clean worktree from `main`

```bash
cd /Users/razisyed/Developer/experiments
git worktree add /Users/razisyed/.codex/worktrees/realization/experiments -b razi/architecture-realization main
```

## Acceptance checklist: safe to proceed

- [ ] Main checkout is still on `main`
- [ ] Clean worktree is on `razi/architecture-realization`
- [ ] Main checkout `git status --short` is unchanged before and after edits in the clean worktree
- [ ] Worktree path is different from the main checkout path
- [ ] No commits are made on `main`
- [ ] No merges into `main` happen during the clean pass

## How to prove the main checkout is unaffected

1. Record main checkout status before work starts:

```bash
cd /Users/razisyed/Developer/experiments
git status --short > /tmp/main-before.txt
```

2. Make changes only in the clean worktree.

3. Re-check main checkout:

```bash
cd /Users/razisyed/Developer/experiments
git status --short > /tmp/main-after.txt
diff /tmp/main-before.txt /tmp/main-after.txt
```

If the diff is empty, the clean-pass edits did not alter the main checkout’s filesystem state.

## Rules for this pass

- Never work detached.
- Never work directly on `main`.
- Never “clean up” main checkout files from the worktree pass unless explicitly intended.
- Treat the detached prototype worktree as read-only reference material.
- If a generated artifact is tracked in git, changes in the clean worktree are still safe; they only become risky if merged without review.

## Current verification preconditions

Fresh worktrees do not come with installed dependencies.

In the clean worktree, before verification:

```bash
npm ci
```

Without that, commands like `npm run typecheck` and `npm test -- --run --project unit` fail because `tsc` and `vitest` are unavailable.

## Notes on the detached prototype worktree

The detached prototype worktree is useful for:

- comparing diffs
- reviewing ideas already attempted
- extracting salvageable fixes

It should not be treated as the execution baseline for this clean pass.
