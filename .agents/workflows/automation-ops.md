---
description: Operate Codex automations and their worktrees without losing control of review, testing, or deploy flow
---

# Automation Ops Workflow

Use this workflow when the task involves Codex automations, automation-created worktrees, or deciding how automation output should move through this repo.

Cross-reference: `.agents/contexts/automation-system.md` for automation design and maintenance guidance. Use `.agents/workflows/deploy.md` for the full branch, PR, preview, and merge lifecycle.

## What A Codex Automation Is Here

On this machine, a Codex automation is a recurring task with:

- a **schedule** that determines when it runs
- a **prompt** that defines one bounded job
- one or more **workspaces** (`cwds`) that scope where it operates
- an **inbox/result expectation**: each run should leave either a clear code/doc diff or a useful report

Treat each automation as a recurring teammate, not as a merge authority.

## Automation Run Lifecycle

1. **Run starts** in a fresh worktree scoped to the configured workspace.
2. **Review the result**: determine whether the run produced code, findings, or both.
3. **Inspect the worktree**: check `git status`, inspect changed files, and confirm the scope matches the prompt.
4. **Classify the result** as one of:
   - `mergeable`: bounded, correct, verified, ready for normal branch/PR flow
   - `continue here`: useful momentum exists; keep working in the same worktree
   - `convert to backlog`: findings are real, but not worth immediate continuation
   - `discard`: low-signal, low-confidence, or clearly off-scope

## Review Flow For Automation-Created Code

When a run changes files, use this review order:

1. `git status --short`
2. `git diff --stat`
3. `git diff`
4. Run the normal repo checks:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test -- --run --project unit`
   - `npm run build`
5. If UI, motion, registry, or generated surfaces changed, run visual QA on the local or preview URL.
6. Confirm the diff is coherent before deciding whether to continue, push, or discard.

### Repo-Specific Examples

- `test-gap-detection`: likely to produce code and tests in a worktree. Treat it as a normal code branch. Run the full check suite and keep iterating there if the tests are directionally right but incomplete.
- `update-changelog`: likely to produce a low-risk docs diff. Review the generated text against repo history, run at least `npm run lint` if markdown-adjacent tooling is affected, then decide whether to commit directly or fold it into a broader release PR.
- `automated-architectural-docs`: may produce small docs edits or a report. Prefer accuracy over churn; if the docs are only half-right, continue manually or convert the findings into backlog work.

## Review Flow For Automation Findings

If the run produces findings instead of code:

1. Decide whether the findings are actionable now.
2. If yes, choose whether to:
   - continue in the same worktree
   - create a fresh follow-up branch/worktree
3. If not now, add the work to `.agents/backlog/README.md` or the correct tier file.
4. If the result is noise, archive it as no-action and consider improving or pruning the automation.

Do not force every automation report into a commit.

## Continue Here Vs Fresh Branch/Worktree

Continue in the same worktree when:

- the automation already changed files correctly
- the remaining work is the same bounded problem
- the branch history still makes sense as one PR

Create a fresh branch/worktree when:

- the automation result is mostly diagnostic
- the follow-up is materially broader than the original prompt
- you want a cleaner PR boundary than the automation created
- the run mixed multiple concerns and you need to separate them

Default bias: if the automation has already done useful, scoped work, continue there. If it only surfaced a problem, start fresh.

## PR Vs Direct Local Integration

This repo uses a hybrid model.

### Prefer A PR

Use the normal branch/PR flow for:

- code changes
- experiment behavior changes
- build, config, or deploy changes
- registry or generated-surface changes
- anything that benefits from a Vercel preview URL
- rollout work such as `announcing-v2`

### Direct Local Integration Is Acceptable

Directly integrate only when all of these are true:

- the change is tiny and low-risk
- it is mostly docs/changelog/maintenance work
- there is no config, registry, or deploy implication
- you fully reviewed the diff
- local verification is sufficient

If you hesitate, open a draft PR.

## Safe Merge Path For Automation Work

1. Keep or refine the automation branch/worktree.
2. Commit with a conventional commit.
3. Push the branch.
4. Open a draft PR if the work is not finished.
5. Validate CI and Vercel preview.
6. Perform visual QA when the change affects UI, motion, registry docs, or generated outputs.
7. Merge only after normal checks pass and the diff is understood.

For `announcing-v2` or other rollout work, always use PR + preview + visual QA, even if the automation prepared most of the branch.

## Compact Checklists

### Review An Automation Result

- [ ] Scope matches the prompt
- [ ] `git status` and `git diff` are understandable
- [ ] No unrelated file churn
- [ ] Required checks passed
- [ ] Visual QA done if UI changed
- [ ] Classified as mergeable, continue here, backlog, or discard

### Decide PR Vs Direct Integration

- [ ] Is the change tiny and low-risk?
- [ ] Is it docs-only or trivial maintenance?
- [ ] Does it avoid config, deploy, registry, and generated-surface risk?
- [ ] Is a preview URL unnecessary?

If any answer is "no", use a PR.

### Decide Merge Readiness

- [ ] Diff is reviewed and intentional
- [ ] Checks passed
- [ ] Preview reviewed if needed
- [ ] Metadata/generated outputs are intentional
- [ ] No loose follow-up hiding inside the branch

## Cleanup After Merge Or Abandonment

After merging or abandoning automation work:

1. Confirm the worktree branch is no longer needed.
2. Delete stale local branches and worktrees.
3. If the automation produced useful findings that were not acted on, move them into the backlog.
4. If a run repeatedly produces noise, update or disable the automation rather than ignoring the results forever.

Do not accumulate mystery worktrees.

## Bad Automation Smells

- The prompt is too broad, so the diff sprawls.
- The automation repeatedly produces low-signal findings.
- The run touches unrelated files.
- Success criteria are unclear, so outputs are hard to classify.
- The same repo surface is being audited by multiple overlapping automations.

## Improve The Automation

When an automation underperforms:

- tighten the prompt around one bounded job
- add output expectations so each run produces a usable result
- add stopping conditions like "report only if risky" or "do not edit if confidence is low"
- reduce the schedule frequency if the output is repetitive
- remove overlap with another automation covering the same surface

Good automations create momentum. Bad automations create review debt.
