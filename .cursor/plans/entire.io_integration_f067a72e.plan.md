---
name: Entire.io Integration
overview: Install Entire CLI, enable the Cursor agent integration, verify hook coexistence with continual-learning and lefthook, configure settings, update docs, and run a full smoke test. Accounts for the subsequent deploy workflow plan (branch split).
todos:
  - id: install-cli
    content: Install Entire CLI via Homebrew and verify version
    status: pending
  - id: enable-test-branch
    content: Back up hooks.json, run `entire enable --agent cursor` on current local main
    status: pending
  - id: verify-hooks
    content: Diff hooks.json to confirm continual-learning hooks survive; check git hooks for lefthook coexistence
    status: pending
  - id: configure-settings
    content: Set telemetry:false, log_level:warn, summarize:false in .entire/settings.json; verify .gitignore coverage
    status: pending
  - id: doc-updates
    content: Add comment to lefthook.yml, check off backlog T5 item, update plan doc checkboxes
    status: pending
  - id: smoke-test
    content: Test commit with trailer, `entire status`, `entire explain`, `npm run build`, verify Vercel isolation
    status: pending
  - id: commit-entire-config
    content: Commit Entire config to local main (will travel to v2/platform in the deploy plan)
    status: pending
isProject: false
---

# Entire.io Agent Session Capture Integration

## Ordering Context: Deploy Plan Follows

This plan runs BEFORE the [preview/prod deploy workflow](preview_prod_deploy_workflow_c427a459.plan.md). That plan will:

1. `git branch v2/platform` from local main (capturing the Entire config committed here)
2. `git reset --hard origin/main` (local main loses the Entire config)

**Impact:** After the deploy plan's reset, `.entire/settings.json` and Entire hooks in `.cursor/hooks.json` disappear from the working tree on main. But `.git/hooks/post-commit` and `.git/hooks/pre-push` survive (not tracked by git) and could error when they look for missing `.entire/` config.

**Resolution:** The deploy plan will re-run `entire enable` on the reset main and commit the config directly (before branch protection is enabled in that plan's Phase 3). This is called out in Phase 5 below as a handoff note. The `lefthook.yml` comment added here will also need to be re-applied after the reset (or included in the re-enable commit).

### Interaction with deploy plan's lefthook.yml changes

Both plans modify `lefthook.yml`:

- This plan: adds a comment about Entire hook ownership
- Deploy plan: adds a `commit-msg` hook for Conventional Commits validation

No conflict -- different sections of the file. But after the deploy plan's `git reset --hard`, the comment added here will be lost and must be re-applied alongside the `commit-msg` hook addition.

---

## Current State

- **AGENTS.md** already updated (lines 154-155) with Entire.io references and "commit voice" policy (Option A from the plan). These items are checked off.
- **Entire CLI** is NOT installed (`entire not found`).
- `**.entire/` directory** does not exist.
- `**.cursor/hooks.json`** has two continual-learning hooks (`sessionStart`, `stop`).
- `**.git/hooks/`** only has lefthook's `pre-commit` -- no `post-commit` or `pre-push`.
- `**lefthook.yml`** has no comment about Entire.
- `**.gitignore**` has no `.entire/settings.local.json` entry.
- No `vercel.json` exists -- builds are configured in the Vercel dashboard.
- No `entire/checkpoints/v1` branch exists on origin.
- Local `main` is 34 commits ahead of `origin/main`.

---

## Phase 1: Install Entire CLI

```bash
brew install entireio/tap/entire
entire --version
```

---

## Phase 2: Enable and Verify (on current local main)

No test branch needed. We work directly on local main since these commits will travel to `v2/platform` in the deploy plan anyway, and we need to re-enable on the reset main regardless.

### 2a. Back up hooks, then enable

```bash
cd ~/Developer/experiments
cp .cursor/hooks.json .cursor/hooks.json.bak
entire enable --agent cursor
```

### 2b. Verify hook coexistence

```bash
diff .cursor/hooks.json.bak .cursor/hooks.json
```

**Expected:** Entire appends its own hooks (e.g. `before-submit-prompt`, `subagent-start`, `subagent-stop`, `pre-compact`) without removing the existing `sessionStart` and `stop` entries.

**If hooks were clobbered:** Manually merge -- restore the original hooks and add Entire's hooks alongside them.

### 2c. Verify git hooks

```bash
ls -la .git/hooks/post-commit .git/hooks/pre-push
cat .git/hooks/pre-commit  # confirm lefthook still owns this
```

**Expected:** New `post-commit` and `pre-push` hooks from Entire. Lefthook's `pre-commit` untouched.

### 2d. Verify `.entire/` directory

```bash
ls -la .entire/
cat .entire/settings.json
```

**Expected:** `settings.json` and `settings.local.json` created. A `.gitignore` inside `.entire/` ignoring `settings.local.json`.

### 2e. Test `entire disable` roundtrip (before committing anything)

```bash
entire disable
diff .cursor/hooks.json.bak .cursor/hooks.json  # continual-learning hooks survive?
ls .git/hooks/post-commit .git/hooks/pre-push 2>/dev/null  # should be gone
entire enable --agent cursor  # re-enable for real
```

This verifies rollback safety early, while the backup is still fresh.

---

## Phase 3: Configure Settings

### 3a. Edit `.entire/settings.json`

Set these values (exact keys depend on what `entire enable` generates -- adjust based on actual schema):

- `telemetry: false`
- `log_level: "warn"`
- `strategy_options.summarize.enabled: false` (requires Claude CLI, not available in Cursor)

### 3b. Confirm `.entire/settings.local.json` is gitignored

Either `.entire/.gitignore` handles this, or add to the repo root `.gitignore`:

```
# entire.io local settings
.entire/settings.local.json
```

### 3c. Check if `Entire-Attribution` trailer can be suppressed independently

```bash
entire config --help
# or inspect .entire/settings.json for trailer/attribution options
```

Per the plan decision (Option A), we keep both trailers. But document how to suppress if needed.

---

## Phase 4: Documentation Updates and Smoke Test

### 4a. Add comment to `lefthook.yml`

```yaml
# Entire.io owns post-commit and pre-push hooks (installed via `entire enable`).
# Lefthook manages only pre-commit. Do not extend lefthook to those hook types.

pre-commit:
  parallel: true
  # ... existing config
```

### 4b. Check off backlog item

In `.agents/backlog/t5-toolkit-platform.md`, change the Entire.io line from `- [ ]` to `- [x]`.

### 4c. Commit Entire config

```bash
git add .entire/ .cursor/hooks.json lefthook.yml .gitignore .agents/backlog/t5-toolkit-platform.md
git commit -m "chore: integrate entire.io agent session capture"
```

### 4d. Verify the commit has trailers

```bash
git log -1 --format="%B"
```

**Expected:** Commit message ends with `Entire-Checkpoint: <hex>` (and possibly `Entire-Attribution: ...`).

### 4e. Verify CLI commands

```bash
entire status
entire explain --commit HEAD
```

### 4f. Verify build is unaffected

```bash
npm run build
```

### 4g. Update the plan doc checkboxes

Mark completed acceptance criteria in `docs/plans/2026-03-10-feat-entire-io-agent-session-capture-plan.md`.

---

## Phase 5: Handoff to Deploy Plan

At this point, Entire is fully working on local main. The Entire config is committed and will be captured when the deploy plan runs `git branch v2/platform`.

**The deploy plan must include these steps after `git reset --hard origin/main`:**

1. Re-run `entire enable --agent cursor` on the clean main
2. Re-apply the `lefthook.yml` comment (can combine with the `commit-msg` hook addition)
3. Re-apply `.gitignore` addition if needed
4. Commit directly to main: `chore: re-enable entire.io after branch split`
5. This must happen BEFORE branch protection is enabled (deploy plan Phase 3)

The `.git/hooks/post-commit` and `.git/hooks/pre-push` survive the reset (not tracked), so Entire hooks remain functional as soon as `.entire/` config is restored.

Delete the backup after confirming everything works:

```bash
rm .cursor/hooks.json.bak
```

---

## Files Changed (this plan only)


| File                                                                 | Change                                                         |
| -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `.entire/settings.json`                                              | Created by `entire enable`, then configured                    |
| `.entire/settings.local.json`                                        | Created by `entire enable`, gitignored                         |
| `.cursor/hooks.json`                                                 | Modified by `entire enable` (hooks appended)                   |
| `.git/hooks/post-commit`                                             | Created by `entire enable`                                     |
| `.git/hooks/pre-push`                                                | Created by `entire enable`                                     |
| `lefthook.yml`                                                       | Comment added about Entire hook ownership                      |
| `.gitignore`                                                         | Possibly add `.entire/settings.local.json` if not auto-handled |
| `.agents/backlog/t5-toolkit-platform.md`                             | Check off Entire.io item                                       |
| `docs/plans/2026-03-10-feat-entire-io-agent-session-capture-plan.md` | Check off completed acceptance criteria                        |


## Risk Mitigations

- **Hook clobbering**: Back up `.cursor/hooks.json` before enable, diff after. Manual merge if needed.
- **Lefthook conflict**: Entire uses different hook types (`post-commit`, `pre-push`) than lefthook (`pre-commit`). Comment in `lefthook.yml` prevents future collision.
- **Vercel build trigger**: `entire/checkpoints/v1` is not a PR branch and not `main`. Verify in dashboard after first push.
- **Deploy plan branch split**: Entire config on local main travels to `v2/platform`. After reset, re-enable on clean main before branch protection is enabled. Git hooks in `.git/hooks/` survive the reset.
- **Rollback**: `entire disable --uninstall --force` removes everything cleanly. Existing trailers in commit history are inert text.

