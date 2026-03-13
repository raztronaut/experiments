# Automation Deep-Pass Prompts

Copy-paste starter prompts for running each current automation domain as a one-time, deep platform review.

For a repo-wide, non-domain-specific structural audit, use [GPT-5.4 Deep Repo Audit Prompt](gpt-5.4-deep-repo-audit-prompt.md). The prompts in this file are narrower lenses; the GPT-5.4 prompt is the comprehensive whole-repo version.

Use these with:

- a fresh chat
- a fresh worktree
- Codex Plan Mode first
- the companion playbook at [`automation-operator-sheet.md`](automation-operator-sheet.md)

Each prompt is designed to produce:

- thorough repo-grounded findings
- prioritized gaps
- exact implementation slices
- verification guidance
- a clear decision on what to execute now vs later

## 0. GPT-5.4 Whole-Repo Structural Audit

Use the dedicated prompt at [`gpt-5.4-deep-repo-audit-prompt.md`](gpt-5.4-deep-repo-audit-prompt.md) when the goal is a comprehensive architecture, performance, build-pipeline, metadata, and future-state structure audit across the entire repo.

## 1. Deep Automation Auditor

```text
We are doing a one-time deep platform pass using the `automation-auditor` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/.agents/contexts/automation-system.md
- /Users/razisyed/Developer/experiments/.agents/workflows/automation-ops.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/automation-auditor/automation.toml
- /Users/razisyed/.codex/automations/*/automation.toml

Start in Plan Mode.

This is not an automation-tuning task. Use this domain as a meta-review of the whole deep-sweep system.

Tasks:
1. Inventory the current automation domains and what each is implicitly responsible for.
2. Identify overlap, blind spots, shallow recurring work, and review debt.
3. Decide which domains are best used as deep audit lenses and which should be treated as lower-value or derivative.
4. Produce a recommended operating model for the rest of the sweep: sequencing, confidence bar, and what should be analysis-only vs likely execution.
5. If useful, point out where the platform is under-instrumented for good review.

Deliver:
- executive summary
- overlap/blind-spot map
- recommended review stance for the other 10 passes
- concrete adjustments to sweep order only if strongly justified
- exact follow-up slices if something system-level should be fixed first
```

## 2. Deep Publish Readiness Audit

```text
We are doing a one-time deep platform pass using the `publish-readiness` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/.agents/contexts/automation-system.md
- /Users/razisyed/Developer/experiments/.agents/workflows/automation-ops.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/Developer/experiments/.agents/backlog/README.md
- /Users/razisyed/.codex/automations/publish-readiness/automation.toml

Start in Plan Mode.

This is not a tiny publish-readiness suggestion pass. Treat it as a full publishability audit of the platform.

Tasks:
1. Assess the repo's current path to shipping or publishing meaningful work.
2. Review metadata readiness, article/content coverage, generated asset expectations, registry/public-surface readiness, and obvious launch blockers.
3. Identify the highest-leverage publish blockers and separate them into immediate, near-term, and later work.
4. Convert the blockers into exact implementation slices with clear file or subsystem boundaries.
5. Recommend the best candidate experiment, platform task, or content task to advance next and why.

Deliver:
- executive summary
- prioritized publish blockers
- recommended shipping order
- smallest viable execution slices
- verification plan per high-priority slice
- clear call on what to execute immediately vs backlog
```

## 3. Deep Registry Drift Audit

```text
We are doing a one-time deep platform pass using the `registry-drift` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/.agents/workflows/automation-ops.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/registry-drift/automation.toml

Start in Plan Mode.

This is not a quick mismatch check. Treat it as a full consistency and discoverability audit.

Tasks:
1. Audit consistency between experiment metadata and generated/public surfaces.
2. Inspect `status`, `listing`, `legacy`, route placement, articles, posters, registry outputs, llms outputs, and any discoverability-facing surface.
3. Identify every meaningful mismatch between intended visibility and actual generated reality.
4. Group drift by severity: publish risk, discoverability risk, editorial drift, and structural drift.
5. Convert the drift into exact implementation slices and define what should be fixed together vs separately.

Deliver:
- executive summary
- categorized drift inventory
- exact mismatches with file-level evidence
- prioritized implementation plan
- verification commands and checks for each drift class
- recommendation on what should be fixed now vs deferred
```

## 4. Deep File Diet Pass

```text
We are doing a one-time deep platform pass using the `file-diet` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/.agents/rules/experiments.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/file-diet/automation.toml

Start in Plan Mode.

This is not a one-file refactor suggestion. Treat it as a structural maintainability audit.

Tasks:
1. Find the most important decomposition and separation-of-concerns problems in non-legacy code.
2. Identify files that are too large, mix concerns, hide implicit state, or repeatedly resist safe edits.
3. Determine whether the problem is local to a file or systemic in templates, generators, or habits.
4. Produce a prioritized decomposition plan with exact extraction boundaries.
5. Define the safest order of operations and verification for each split.

Deliver:
- executive summary
- highest-leverage decomposition targets
- root-cause framing: local file vs generator/system issue
- exact extraction plan per target
- verification checklist per split
- recommendation on which split should happen first
```

## 5. Deep Architectural Docs Audit

```text
We are doing a one-time deep platform pass using the `automated-architectural-docs` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/.agents/contexts/architecture.md
- /Users/razisyed/Developer/experiments/.agents/workflows/automation-ops.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/automated-architectural-docs/automation.toml

Start in Plan Mode.

This is not a light docs-alignment pass. Treat it as a docs-truthfulness audit.

Tasks:
1. Review high-level docs, architecture docs, workflows, and operator-facing documentation.
2. Compare them against actual code structure, current system boundaries, and real operator workflow.
3. Identify where the docs are stale, misleading, incomplete, or missing key architectural context.
4. Separate doc-only fixes from fixes that depend on code changes landing first.
5. Produce an exact update plan for the affected docs and sections.

Deliver:
- executive summary
- stale/misleading/missing docs findings
- exact files and sections to update
- dependency map: doc fix now vs after code change
- implementation slices for the documentation work
```

## 6. Deep Performance Audit

```text
We are doing a one-time deep platform pass using the `perf-improver` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/.agents/rules/performance.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/perf-improver/automation.toml

Start in Plan Mode.

This is not a one-off optimization hunt. Treat it as a measurement-first performance audit.

Tasks:
1. Identify the highest-risk or highest-cost performance surfaces in the platform.
2. Separate runtime, bundle/build, render, animation, and developer-workflow performance concerns.
3. Establish where trustworthy baselines already exist and where instrumentation is missing.
4. Produce a prioritized shortlist of performance opportunities grounded in measurable evidence or clearly missing measurement.
5. Convert the best opportunities into exact implementation slices with a verification method.

Deliver:
- executive summary
- categorized performance findings
- current baseline or missing-baseline map
- prioritized optimization shortlist
- exact implementation slices for the top opportunities
- verification method and success criteria for each top slice
```

## 7. Deep Test Gaps Analysis

```text
We are doing a one-time deep platform pass using the `test-gap-detection` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/test-gap-detection/automation.toml
- relevant test and component files as discovered during exploration

Start in Plan Mode.

This is not a one-test addition. Treat it as a deep test strategy and coverage audit.

Tasks:
1. Identify the most important untested or under-tested platform behaviors.
2. Prioritize by user risk, regression likelihood, implementation complexity, and current lack of protection.
3. Distinguish between missing unit tests, integration tests, behavior tests, and testability problems caused by current code structure.
4. Produce a map of the highest-value test gaps and the best first slices to implement.
5. Call out where test architecture or component structure should change before more tests are added.

Deliver:
- executive summary
- prioritized test-gap map
- recommended test type per gap where relevant
- exact first implementation slices
- verification plan for each slice
- clear recommendation on what to test now, what to defer, and what requires restructuring first
```

## 8. Deep Backlog Shaping Pass

```text
We are doing a one-time deep platform pass using the `backlog-forwarder` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/.agents/backlog/README.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/backlog-forwarder/automation.toml
- findings from earlier deep-pass chats if available

Start in Plan Mode.

This is not a one-item nudge. Treat it as backlog shaping and execution-slicing work.

Tasks:
1. Review the canonical backlog in light of current repo state and earlier deep-pass findings.
2. Identify missing backlog entries, oversized items, vague items, and items that should be split.
3. Turn the highest-value findings from prior passes into backlog-ready execution slices.
4. Define dependencies, sequencing, and which slices deserve their own fresh implementation chats immediately.
5. Avoid generic reprioritization; stay concrete and executable.

Deliver:
- executive summary
- backlog gaps and oversize-item findings
- exact new or revised backlog slices
- dependency and sequencing notes
- recommendation on which backlog item should be executed next
```

## 9. Deep Quality Spotlight

```text
We are doing a one-time deep platform pass using the `quality-spotlight` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/quality-spotlight/automation.toml

Start in Plan Mode.

This is not a generic quality sweep. Choose one high-signal quality angle and go deep.

Tasks:
1. Select the single quality dimension that matters most right now based on current repo risk and prior deep-pass context.
2. Audit that dimension thoroughly with repo-grounded evidence.
3. Avoid spreading across multiple quality themes unless a dependency requires it.
4. Produce 3 to 5 concrete, file-grounded follow-ups ordered by leverage.
5. Make clear why this chosen angle matters more right now than the alternatives.

Deliver:
- executive summary
- chosen quality angle and rationale
- detailed findings with repo evidence
- 3 to 5 prioritized follow-up slices
- verification approach for each meaningful slice
```

## 10. Deep Repo Assist Synthesis

```text
We are doing a one-time deep platform pass using the `repo-assist` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/.agents/backlog/README.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/repo-assist/automation.toml
- findings from earlier deep-pass chats if available

Start in Plan Mode.

This is not a catch-all helper task. Treat it as a final synthesis pass for cross-cutting repo friction.

Tasks:
1. Review the major findings from earlier deep-pass domains.
2. Identify high-leverage maintenance work that does not clearly belong to a sharper domain.
3. Separate true cross-cutting friction from vague “cleanup” instincts.
4. Produce one or more bounded execution slices that would remove outsized friction across the platform.
5. Explain why each slice belongs here rather than under another deep-pass domain.

Deliver:
- executive summary
- cross-cutting friction findings
- exact bounded maintenance slices
- rationale for why they belong in this domain
- recommendation on whether any of them should be executed immediately
```

## 11. Deep Changelog Consolidation

```text
We are doing a one-time deep platform pass using the `update-changelog` domain as a lens.

Read these first:
- /Users/razisyed/Developer/experiments/docs/automation-operator-sheet.md
- /Users/razisyed/Developer/experiments/changelog.md
- /Users/razisyed/Developer/experiments/memory.md
- /Users/razisyed/.codex/automations/update-changelog/automation.toml
- relevant repo history as needed

Start in Plan Mode.

This is not a routine changelog touch-up. Treat it as narrative consolidation after the deeper platform review.

Tasks:
1. Review meaningful repo-backed changes and themes surfaced by the deep sweep.
2. Identify what deserves narrative surfacing in the changelog and what should be excluded for weak evidence or incomplete status.
3. Check whether the current changelog structure still reflects the way progress is actually happening in the repo.
4. Produce a changelog-ready summary and note any structural improvements that would make future changelog maintenance easier.

Deliver:
- executive summary
- candidate changelog entries grounded in repo history
- exclusions with rationale
- any structural changelog recommendations
- clear statement of whether this should be executed now or after more platform work lands
```
