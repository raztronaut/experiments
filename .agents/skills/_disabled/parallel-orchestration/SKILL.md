---
name: parallel-orchestration
description: Decompose large tasks into parallel domain agents with structured handoffs and verification. Use when facing 5+ files across 3+ conceptual areas with independent work streams. Triggers on "parallelize", "decompose", "run in parallel", "multi-agent", "orchestrate", or when the task is too large for a single agent.
---

# Parallel Domain Orchestration

Fully automated pipeline for decomposing large tasks into parallel domain agents, executing them via Cursor's Task tool, collecting structured handoffs, and running a verification overview pass -- all from a single orchestrator conversation.

**Announce at start:** "I'm using the parallel-orchestration skill to decompose and execute this task."

## When to Use

- Tasks spanning **5+ files** across **3+ conceptual areas** with independent work streams
- Large audits, refactors, documentation overhauls, multi-system feature work
- NOT for single-domain work, tightly coupled changes, or tasks under ~10 files

## When NOT to Use

- All changes are in the same conceptual area (just do it sequentially)
- Changes are tightly coupled -- fixing A requires seeing B's output first
- The task is small enough for one agent to hold in context
- Files would be edited by multiple domains (redesign the decomposition instead)

## Architecture

```
Orchestrator (this conversation)
├── Phase 1: Research (optional, up to 4 explore agents)
├── Phase 2: Decomposition (orchestrator writes brief files)
│   └── GATE: verify briefs + dependency order
├── Phase 3: Parallel Execution (Task tool, batches of 4)
│   ├── Batch 1: Domains 1-4 (concurrent)
│   ├── Triage: check status, handle BLOCKED/NEEDS_CONTEXT
│   └── Batch 2: Domains 5-N (concurrent)
│   └── GATE: verify all handoffs written
├── Phase 4: Overview Pass (up to 4 verification agents)
├── Phase 5: Fix Implementation
└── Phase 6: Knowledge Capture
```

### File layout

```
.agents/artifacts/<slug>/
  README.md               # Round summary (date, domains, result, file manifest)
  plan.md
  briefs/
    domain-1-name.md
    domain-2-name.md
    ...
  handoffs/
    domain-1-name.md
    domain-2-name.md
    ...
  overview-report.md
```

The orchestrator chooses `<slug>` at the start -- e.g., `registry-1`, `docs-audit-3`. Multiple rounds under the same plan use incrementing suffixes. **Artifacts persist until the encompassing plan is fully complete.** They serve as context for subsequent rounds, debugging, and plan continuity across sessions. Cleanup is explicit -- see Phase 6.

## Phase 1: Research (optional)

Skip if the orchestrator already has sufficient context.

Launch up to 4 `explore` agents in parallel via Task. Each investigates one source (repo, website, existing codebase area, documentation set) and returns a structured summary.

```
Task(subagent_type="explore", description="Research [source]",
  prompt="Investigate [source]. Return: key patterns, file structure,
  relevant APIs, and anything that affects our implementation.")
```

Collect all research summaries before proceeding to Phase 2.

## Phase 2: Decomposition

The orchestrator analyzes the task and produces a plan, then slices it into N self-contained domains.

### Decomposition heuristics

1. **Group by file ownership** -- each file should belong to exactly one domain
2. **Maximize parallel independence** -- if two tasks can run without seeing each other's output, they belong in separate domains
3. **Create aggregator domains** for cross-cutting concerns that pull from multiple domains (e.g., a portable skill that packages patterns from domains 2-4)
4. **Separate mechanical from complex** -- docs housekeeping and config changes don't need the same model as new system design

### Write brief files

For each domain, write a brief file to `.agents/artifacts/<slug>/briefs/domain-N-name.md` using the [domain-brief.md](domain-brief.md) template. Include:

- Scope and complexity level (mechanical / integration / architecture)
- Exact files to read for context
- Numbered, specific changes to make
- Explicit "What NOT to Touch" boundaries referencing other domains
- Dependency information (which domains must complete first)

### GATE: Pre-execution verification

**STOP. Verify before proceeding:**

1. All brief files exist in `.agents/artifacts/<slug>/briefs/`
2. The dependency graph has no cycles
3. No file appears in "Changes to Make" for one domain AND "What NOT to Touch" for that same domain
4. No file appears in "Changes to Make" for two different domains in the same batch
5. Every domain's "What NOT to Touch" list covers files owned by other domains

If any check fails, revise the decomposition.

## Phase 3: Parallel Execution

### Model selection

Not all domains need the most capable model:

| Complexity | Model | Examples |
|---|---|---|
| `mechanical` | `model: "fast"` | docs housekeeping, template updates, config changes, rename/move operations |
| `integration` | default (omit `model`) | cross-cutting patterns, aggregator domains, multi-file coordination |
| `architecture` | default (omit `model`) | new skill creation, system design, complex refactors |

### Dispatching

Send up to 4 Task calls in a single message. Each domain agent's system prompt (`.cursor/agents/domain-agent.md`) already tells it to read the protocol and AGENTS.md, so the Task prompt only needs the brief and handoff paths.

```
Task(subagent_type="domain-agent",
  model="fast",  // only for mechanical domains; omit otherwise
  description="Domain 1: [Name]",
  prompt="Brief: .agents/artifacts/<slug>/briefs/domain-1-name.md
          Handoff: .agents/artifacts/<slug>/handoffs/domain-1-name.md")
```

### Batching

- **N <= 4**: one batch, all concurrent
- **N <= 8**: two batches (4 + remainder)
- **N > 8**: three+ batches, or split into separate orchestrations

If Domain B depends on Domain A's output, place A in an earlier batch.

### Triage between batches

After each batch completes, read the returned summaries. Each domain agent reports a status:

- **DONE** -- proceed to next batch
- **DONE_WITH_CONCERNS** -- read the concerns. Correctness issues: address before overview. Observations: note and proceed.
- **NEEDS_CONTEXT** -- provide the missing context and re-dispatch that domain as a new Task
- **BLOCKED** -- assess the blocker:
  1. Context problem: re-dispatch with more context
  2. Complexity problem: re-dispatch without `model: "fast"`
  3. Plan problem: surface to user for guidance

Never ignore a BLOCKED or NEEDS_CONTEXT status. Never force the same approach without changes.

### GATE: Post-execution verification

**STOP. Verify before proceeding to overview:**

1. All handoff files exist in `.agents/artifacts/<slug>/handoffs/`
2. Every handoff has a Status field (DONE or DONE_WITH_CONCERNS)
3. No handoffs have NEEDS_CONTEXT or BLOCKED status remaining

## Phase 4: Overview Pass

Read all handoff files. Extract:

- All cross-domain dependencies (from every handoff's "Cross-Domain Dependencies" section)
- All files touched (aggregate from every handoff's "Files Touched" section)
- Multi-touch files (files that appear in 2+ handoffs)

### Scaling the overview

- **3-4 domains**: single `verification-agent` reads all handoffs + runs `git diff --stat`, produces a report
- **5+ domains**: 4 parallel `verification-agent` subagents, each with a specific concern

```
Task(subagent_type="verification-agent", readonly=true,
  description="Verify: Cross-Domain Dependencies",
  prompt="Concern: A (Cross-Domain Dependencies).
          Handoffs: .agents/artifacts/<slug>/handoffs/
          [Paste extracted dependency list]")
```

For the 4-verifier pattern, use [overview-pass.md](overview-pass.md) as the prompt template. The 4 verification agents:

- **A: Cross-Domain Dependency Verifier** -- check every dependency flagged across all handoffs
- **B: Multi-Touch File Conflict Checker** -- verify files modified by multiple domains have clean merges
- **C: Consistency Checker** -- terminology, naming, pattern consistency across all modified files
- **D: Completeness + Quality Guard** -- compare plan items vs handoff "Completed" + "Intentional Skips" for gaps; check for prescriptive language

All verification agents are **read-only**. They report findings. They do NOT modify files.

Orchestrator synthesizes all 4 reports into `.agents/artifacts/<slug>/overview-report.md`.

## Phase 5: Fix Implementation

Orchestrator (or a final Task subagent) implements fixes from the overview report:

- Broken cross-domain dependencies
- Naming inconsistencies
- Content duplication
- Multi-touch file conflicts
- Quality issues flagged by the completeness guard

Only touch files explicitly flagged in the overview report.

## Phase 6: Knowledge Capture

1. Review all handoffs' "Learnings" sections
2. Review the overview report's notable discoveries
3. If any durable workspace facts emerged, update `memory.md`

4. Write a `README.md` to `.agents/artifacts/<slug>/` summarizing the round (date, domains, result, file manifest)

**Do NOT delete artifact directories** until the encompassing plan is fully complete. When the plan is done and the user confirms, delete all related `.agents/artifacts/<slug>/` directories.

## Domain Agent Instructions

Domain agents follow the protocol in [domain-agent-prompt.md](domain-agent-prompt.md). See that file for the full step-by-step process (read brief, execute, respect boundaries, write handoff, report status).

## Templates

| Template | Purpose | Used by |
|---|---|---|
| [domain-brief.md](domain-brief.md) | Structure for each domain's brief file | Orchestrator (Phase 2) |
| [domain-agent-prompt.md](domain-agent-prompt.md) | Reusable prompt for every domain agent | Orchestrator (Phase 3 Task calls) |
| [handoff-summary.md](handoff-summary.md) | Exit template each domain agent writes | Domain agents |
| [overview-pass.md](overview-pass.md) | Verification agent prompts with 4 verifier specs | Orchestrator (Phase 4) |

## Worked Example

See [examples.md](examples.md) for a complete walkthrough of the agent docs gap analysis (8 domains, 44 files, +4,662/-494 lines).
