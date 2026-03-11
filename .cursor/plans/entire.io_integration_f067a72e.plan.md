---
name: Entire.io Integration
overview: Install Entire CLI, enable the Cursor agent integration, verify hook coexistence with continual-learning and lefthook, configure settings, update docs, and run a full smoke test.
todos:
  - id: install-cli
    content: Install Entire CLI via Homebrew and verify version
    status: pending
  - id: enable-test-branch
    content: Create test branch, back up hooks.json, run `entire enable --agent cursor`
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
  - id: merge-cleanup
    content: Merge test branch to main, remove backup, commit final state
    status: pending
  - id: rollback-verify
    content: Optionally test `entire disable --uninstall --force` to confirm clean removal
    status: pending
isProject: false
---

# Entire.io Agent Session Capture Integration

## Current State

- **AGENTS.md** already updated (lines 154-155) with Entire.io references and "commit voice" policy (Option A from the plan). These items are checked off.
- **Entire CLI** is NOT installed (`entire not found`).
- `**.entire/` directory** does not exist.
- `**.cursor/hooks.json`** has two continual-learning hooks (`sessionStart`, `stop`).
- `**.git/hooks/`** only has lefthook's `pre-commit` -- no `post-commit` or `pre-push`.
- `**lefthook.yml`** has no comment about Entire.
- `**.gitignore`** has no `.entire/settings.local.json` entry.
- No `vercel.json` exists -- builds are configured in the Vercel dashboard.
- No `entire/checkpoints/v1` branch exists on origin.

---

## Phase 1: Install and Enable (test branch)

All work starts on a throwaway branch `chore/entire-io-setup` to safely verify behavior before merging.

### 1a. Install Entire CLI

```bash
brew install entireio/tap/entire
entire --version
```

### 1b. Back up hooks, then enable

```bash
cd ~/Developer/experiments
git checkout -b chore/entire-io-setup
cp .cursor/hooks.json .cursor/hooks.json.bak
entire enable --agent cursor
```

### 1c. Verify hook coexistence

After `entire enable`, diff the hooks file to confirm continual-learning hooks survived:

```bash
diff .cursor/hooks.json.bak .cursor/hooks.json
```

**Expected:** Entire appends its own hooks (e.g. `before-submit-prompt`, `subagent-start`, `subagent-stop`, `pre-compact`) without removing the existing `sessionStart` and `stop` entries.

**If hooks were clobbered:** Manually merge -- restore the original hooks and add Entire's hooks alongside them.

### 1d. Verify git hooks

```bash
ls -la .git/hooks/post-commit .git/hooks/pre-push
cat .git/hooks/pre-commit  # confirm lefthook still owns this
```

**Expected:** New `post-commit` and `pre-push` hooks from Entire. Lefthook's `pre-commit` untouched.

### 1e. Verify `.entire/` directory

```bash
ls -la .entire/
cat .entire/settings.json
```

**Expected:** `settings.json` and `settings.local.json` created. A `.gitignore` inside `.entire/` ignoring `settings.local.json`.

---

## Phase 2: Configure Settings

### 2a. Edit `[.entire/settings.json](.entire/settings.json)`

Set these values (exact keys depend on what `entire enable` generates -- adjust based on actual schema):

- `telemetry: false`
- `log_level: "warn"`
- `strategy_options.summarize.enabled: false` (requires Claude CLI, not available in Cursor)

### 2b. Confirm `.entire/settings.local.json` is gitignored

Either `.entire/.gitignore` handles this, or add to the repo root `[.gitignore](.gitignore)`:

```
# entire.io local settings
.entire/settings.local.json
```

### 2c. Check if `Entire-Attribution` trailer can be suppressed independently

```bash
entire config --help
# or inspect .entire/settings.json for trailer/attribution options
```

Per the plan decision (Option A), we keep both trailers. But document how to suppress if needed.

---

## Phase 3: Documentation Updates

### 3a. Add comment to `[lefthook.yml](lefthook.yml)`

Add a comment at the top noting Entire owns `post-commit` and `pre-push`:

```yaml
# Entire.io owns post-commit and pre-push hooks (installed via `entire enable`).
# Lefthook manages only pre-commit. Do not extend lefthook to those hook types.

pre-commit:
  parallel: true
  # ... existing config
```

### 3b. Check off backlog item in `[.agents/backlog/t5-toolkit-platform.md](.agents/backlog/t5-toolkit-platform.md)`

Change the Entire.io line from `- [ ]` to `- [x]`.

### 3c. Update the plan doc itself

Mark completed acceptance criteria in `[docs/plans/2026-03-10-feat-entire-io-agent-session-capture-plan.md](docs/plans/2026-03-10-feat-entire-io-agent-session-capture-plan.md)` as items are verified.

---

## Phase 4: Smoke Test

### 4a. Test commit cycle

```bash
# Make a trivial change on the test branch
echo "# entire.io test" >> .entire/settings.json
git add -A && git commit -m "chore: test entire.io checkpoint"
git log -1 --format="%B"  # should show Entire-Checkpoint trailer
```

### 4b. Verify CLI commands

```bash
entire status           # should show healthy config
entire explain --commit HEAD  # should return session context
```

### 4c. Verify continual-learning hooks still fire

Start and stop a Cursor session, confirm `.cursor/hooks/state/` updates (or whatever the learning hooks produce).

### 4d. Verify build is unaffected

```bash
npm run build  # should complete without Entire interference
```

### 4e. Push and verify Vercel isolation

```bash
git push -u origin chore/entire-io-setup
```

Check the Vercel dashboard -- confirm no build triggered for `entire/checkpoints/v1` branch. (Vercel only builds `main` and PR branches by default, so this should be safe. If an `entire/checkpoints/v1` branch does trigger a build, add it to the "Ignored Build Step" in Vercel project settings.)

---

## Phase 5: Merge and Clean Up

### 5a. Merge to main

```bash
git checkout main
git merge chore/entire-io-setup
git branch -d chore/entire-io-setup
```

### 5b. Delete backup

```bash
rm .cursor/hooks.json.bak
```

### 5c. Commit final state

Single commit with all config/doc changes:

```
chore: integrate entire.io agent session capture
```

---

## Phase 6: Rollback Verification (optional, on a second test branch)

Test that `entire disable` is clean:

```bash
entire disable --uninstall --force
diff .cursor/hooks.json.bak .cursor/hooks.json  # continual-learning hooks survive?
ls .git/hooks/post-commit .git/hooks/pre-push    # should be gone
ls .entire/                                       # should be gone
```

Then re-enable for production use.

---

## Files Changed


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
- **Rollback**: `entire disable --uninstall --force` removes everything cleanly. Existing trailers in commit history are inert text.

