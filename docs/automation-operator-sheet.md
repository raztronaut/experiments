# Automation Deep-Pass Playbook

Practical guide for using each current automation area as a **one-time deep platform audit**, not as a prompt-tuning exercise.

Use this alongside [AI Development](ai-development.md), [Deploy](deploy.md), [`/Users/razisyed/Developer/experiments/.agents/contexts/automation-system.md`](/Users/razisyed/Developer/experiments/.agents/contexts/automation-system.md), [`/Users/razisyed/Developer/experiments/.agents/workflows/automation-ops.md`](/Users/razisyed/Developer/experiments/.agents/workflows/automation-ops.md), and [`/Users/razisyed/Developer/experiments/memory.md`](/Users/razisyed/Developer/experiments/memory.md).

## What This Is For

This playbook is for a deliberate, sequential deep pass through the current automation domains using fresh chats and isolated worktrees.

The goal is not to improve the automations themselves.
The goal is to use each automation theme as a **serious audit lens** for the platform:

- gather evidence thoroughly
- identify the real gaps
- produce a prioritized implementation plan
- decide what should be executed now vs later
- optionally continue into execution in the same worktree once the analysis is solid

Think of each automation name as a domain label for a deep review, not as a narrow recurring task.

## Default Operating Model

For each deep pass:

1. Create a fresh worktree.
2. Start a fresh chat.
3. Start in Codex Plan Mode.
4. Read the domain-specific sources of truth first.
5. Perform a deep discovery pass before proposing fixes.
6. Produce a thorough output package:
   - findings
   - severity or priority
   - root-cause framing
   - exact implementation slices
   - verification plan
7. Only then decide whether to execute immediately or leave the work as a follow-up plan.

## Preflight

Before starting the overall sweep:

- Ensure your main checkout is clean or intentionally parked.
- Ensure each deep pass has its own worktree.
- Read these once up front:
  - [`/Users/razisyed/Developer/experiments/.agents/contexts/automation-system.md`](/Users/razisyed/Developer/experiments/.agents/contexts/automation-system.md)
  - [`/Users/razisyed/Developer/experiments/.agents/workflows/automation-ops.md`](/Users/razisyed/Developer/experiments/.agents/workflows/automation-ops.md)
  - [`/Users/razisyed/Developer/experiments/memory.md`](/Users/razisyed/Developer/experiments/memory.md)
  - [`/Users/razisyed/Developer/experiments/.agents/backlog/README.md`](/Users/razisyed/Developer/experiments/.agents/backlog/README.md)
- Decide before each pass whether the outcome should be:
  - analysis only
  - plan plus small execution
  - plan only, followed by a separate implementation chat

## Deep-Pass Output Contract

A good deep-pass chat should leave behind most or all of these:

- a concise executive summary
- a detailed findings list grounded in actual repo evidence
- risk or priority ordering
- exact file-level or subsystem-level implementation slices
- a verification plan for each meaningful fix
- a decision on what to execute now, defer, or ignore

Weak output looks like generic advice, broad cleanup suggestions, or findings without an execution path.

## Local Vs Cloud

Use local worktrees when the deep pass depends on repo truth, verification commands, generated outputs, or likely code changes.

Use Codex Cloud only when the deep pass is primarily comparative analysis, synthesis, or report writing and does not need trusted local verification.

In practice for this repo, most deep passes should happen locally.
Cloud is best reserved for analysis-heavy passes like prioritization or meta-review.

## Standard Review Sequence For A Deep Pass

1. Define the domain under review.
2. Read the current sources of truth for that domain.
3. Explore the actual implementation and current repo state.
4. Identify the highest-signal gaps and group them by severity or leverage.
5. Convert those gaps into implementation slices.
6. Define verification per slice.
7. Decide execute now vs backlog vs separate implementation thread.

## Sweep Order

Run the one-time deep pass in this order:

| Order | Deep pass | Why it goes here |
|---|---|---|
| 1 | `automation-auditor` | Establish the quality bar for the whole sweep and detect overlap in your review system |
| 2 | `publish-readiness` | Frame the platform's highest-value shipping and launch blockers |
| 3 | `registry-drift` | Validate metadata, surface integrity, and discoverability plumbing |
| 4 | `file-diet` | Identify the most urgent structural decomposition work |
| 5 | `automated-architectural-docs` | Check whether the docs still reflect the actual system |
| 6 | `perf-improver` | Do a serious performance and measurement pass |
| 7 | `test-gap-detection` | Run the deepest code-quality pass once architecture and perf context are clearer |
| 8 | `backlog-forwarder` | Convert deep-pass findings into the right backlog slices |
| 9 | `quality-spotlight` | Run one broad but evidence-based quality audit with current context |
| 10 | `repo-assist` | Use as a final generalist synthesis pass only after the sharper lenses are done |
| 11 | `update-changelog` | Capture the narrative only after the real work is understood |

## Domain Guides

### `automation-auditor`

Use this as a meta-pass on the platform's review system.

What to do:
- inventory the current automation domains
- identify overlap, blind spots, and review debt
- decide which deep passes are likely to produce the highest value
- note where recurring automations are too shallow for platform use

Good output:
- system-level recommendations for how to run the whole deep sweep
- explicit keep/ignore/use-as-lens decisions for the remaining passes

### `publish-readiness`

Use this as a full publishability audit.

What to inspect:
- experiment metadata health
- articles and content coverage
- generated assets expectations
- poster, registry, and llms output readiness
- obvious blockers from the backlog
- anything that would prevent a strong public ship

Good output:
- prioritized publish blockers
- recommended shipping order
- exact smallest implementation slices to improve readiness

### `registry-drift`

Use this as a consistency and discoverability audit.

What to inspect:
- `status`, `listing`, `legacy`
- route placement and experiment structure
- articles, posters, registry outputs, llms outputs
- mismatches between intended visibility and generated reality

Good output:
- exact mismatches
- risk to discoverability or publishing
- precise implementation plan for each drift class

### `file-diet`

Use this as a structural maintainability pass.

What to inspect:
- oversized files
- mixed concerns
- orchestrators that should be thinner
- repeated decomposition failures
- generator or template issues that create bad file structure

Good output:
- one or more high-leverage decomposition targets
- exact extraction boundaries
- the order in which to split them safely
- verification per split

### `automated-architectural-docs`

Use this as a docs-truthfulness audit.

What to inspect:
- architecture docs
- workflows
- AI-development docs
- system boundaries and ownership descriptions
- places where docs no longer match the actual implementation

Good output:
- concrete docs gaps
- exact files/sections to update
- whether doc fixes should happen before or after code fixes

### `perf-improver`

Use this as a measurement-first performance audit.

What to inspect:
- rendering hotspots
- build or bundle inefficiencies
- developer workflow bottlenecks
- animation/runtime inefficiencies
- places where no trustworthy baseline exists yet

Good output:
- a measurement-backed shortlist
- exact baseline method
- highest-confidence low-risk improvements
- benchmark or instrumentation work when no safe fix is ready

### `test-gap-detection`

Use this as a deep test strategy and coverage pass, not just “add one missing test.”

What to inspect:
- recently changed behavior
- core platform flows with weak or absent tests
- fragile areas where behavior is implicit rather than locked down
- gaps between current implementation complexity and current test depth
- whether the current test architecture supports good coverage or needs reshaping

Good output:
- a prioritized map of test gaps
- recommendation by test type where relevant
- exact implementation plan for the first slices
- clear “test now vs later” boundaries

### `backlog-forwarder`

Use this as a backlog shaping pass.

What to inspect:
- findings from earlier deep passes
- canonical backlog structure
- missing backlog entries
- backlog items that are too big or too vague

Good output:
- precise new backlog items or refined slices
- dependencies and sequencing
- which items should become separate implementation chats immediately

### `quality-spotlight`

Use this as a deeper quality audit across one carefully chosen angle.

What to inspect:
- testing
- docs
- accessibility
- code organization
- CI trust
- contributor ergonomics
- metadata hygiene

Good output:
- one high-signal quality report
- 3 to 5 concrete, file-grounded follow-ups
- rationale for why this angle matters now

### `repo-assist`

Use this as a final synthesis pass, not a first-pass catch-all.

What to inspect:
- cross-cutting friction surfaced by earlier passes
- small but high-leverage maintenance work
- gaps that do not clearly belong to another lens

Good output:
- one bounded maintenance plan or execution slice
- explicit rationale for why it was not better handled by another deep-pass domain

### `update-changelog`

Use this as narrative consolidation after the deeper work is known.

What to inspect:
- shipped or meaningful repo-backed changes
- work that deserves narrative surfacing
- missing summaries that make recent progress harder to understand

Good output:
- a changelog-ready summary grounded in actual history
- candidate items that should be excluded because evidence is weak or work is not yet ready

## Success Criteria

The deep sweep is working if each pass leaves:

- repo-grounded findings instead of generic advice
- a clearer view of platform priorities
- implementation slices that another engineer or agent could execute directly
- fewer unknowns and less review debt than before

## Practical Policy

- Prefer depth over breadth.
- Do not force execution in the same chat if the analysis is still incomplete.
- If a pass surfaces systemic issues, fix the system or generator, not just one instance.
- Move solid follow-up work into the backlog when immediate execution is not the best use of time.
- Treat the automation names as stable audit lenses for this sweep, not as limits on how deeply you investigate.
