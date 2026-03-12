# Codex Automation System

Reference for authoring, maintaining, and evaluating Codex automations in this repo.

This document is about automation design. Use `.agents/workflows/automation-ops.md` for day-to-day review and merge handling.

## Codex Automation Model In This Environment

A Codex automation is defined by:

- a **schedule** that controls when it runs
- a **prompt** describing one recurring task
- a **workspace scope** (`cwds`) that tells Codex where it may operate
- a **worktree execution model** so runs stay isolated from your main checkout
- an **inbox expectation**: each run should produce a clear code/doc diff or a useful report

The automation should not assume merge authority. It should either prepare a bounded change or improve operator judgment.

## Design Rules For Effective Automations

Prefer automations that follow all of these rules:

- one bounded job per automation
- one repo or workspace unless there is a real cross-repo need
- explicit success output so each run is easy to review
- explicit stop conditions when confidence is low
- report-only behavior when edits would be risky

The more open-ended the prompt, the more likely the automation is to create review debt instead of leverage.

## Recommended Automation Categories For This Repo

These categories fit the current repo well:

- **Health and quality passes**: test gaps, docs drift, metadata drift, low-risk quality checks
- **Rollout readiness**: `announcing-v2`, preview readiness, publish gating, generated-output integrity
- **Content coverage**: article gaps, social asset gaps, stale docs, incomplete experiment metadata
- **Registry drift**: install contract checks, missing metadata, generated output review
- **Docs freshness**: changelog, architecture docs, workflow docs that lag current repo behavior
- **Automation auditing**: review the automation set itself for noise, overlap, and stale prompts

Avoid automations that all watch the same surface without distinct outputs.

## Prompt Template Pattern

Use a prompt shape that includes:

1. **Task**: the one recurring job
2. **Boundaries**: which files or concerns are in or out of scope
3. **Verification**: what to run or confirm before calling work complete
4. **Output format**: code diff, report, prioritized findings, exact next steps
5. **When not to edit**: low confidence, risky scope expansion, touching unrelated systems

Example structure:

```text
Do one bounded task.
Stay within these boundaries.
Verify using these repo checks.
Leave either a clean diff or a concise report.
If confidence is low or scope expands, stop and report instead of editing.
```

## Schedule Guidance

- Use **daily** schedules for quick, bounded checks that should stay small.
- Use **weekly** schedules for heavier audits or repo-wide reviews.
- Avoid overlapping schedules for automations that inspect the same surface.
- If a run often produces "nothing meaningful," reduce frequency instead of accepting noise.

Cadence should match how often the underlying surface really changes.

## Maintenance Guidance

Review automations periodically for:

- usefulness of outputs
- amount of review overhead they create
- duplicate coverage with other automations
- whether the prompt still matches the repo's current priorities

When an automation repeatedly produces unhelpful output:

- sharpen the prompt
- narrow the scope
- add stronger stop conditions
- lower frequency
- or remove it entirely

## Repo-Anchored Examples

### `test-gap-detection`

Good use: bounded, concrete, often code-producing.

- Task: identify untested paths from recent changes
- Output: focused tests and a reviewable diff
- Risk: may drift into broad refactors if the prompt is not kept tight

### `update-changelog`

Good use: low-risk docs maintenance.

- Task: summarize recent highlights in `changelog.md`
- Output: a small docs diff
- Risk: can become noisy if it runs too often or repeats low-value updates

### `automated-architectural-docs`

Good use: high-signal review support.

- Task: keep high-level documentation aligned with code changes
- Output: concise doc edits or documentation recommendations
- Risk: architecture inference can be wrong, so operator review matters more than volume

## Quality Bar

Keep automations that:

- save real review time
- create bounded diffs
- sharpen repo hygiene
- align with the current rollout and platform priorities

Prune automations that:

- produce repetitive findings
- require more cleanup than they save
- touch too many unrelated files
- cannot be judged quickly by a human operator
