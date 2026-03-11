---
description: Decompose a large task into parallel domain agents and execute via Task tool
---

# Parallel Domain Orchestration Workflow

Full skill reference: `.agents/skills/parallel-orchestration/SKILL.md`

## How to invoke

Any of these work -- the `alwaysApply` rule nudges the agent automatically for qualifying tasks, but explicit invocation is faster:

- **Natural language**: "Parallelize this across domains", "Decompose and orchestrate", "This is too big for one agent"
- **@ reference**: Mention `@parallel-orchestration` in your prompt
- **Direct**: "Use the orchestrator subagent for this"

The agent acts as the orchestrator directly in your conversation. It uses the Task tool to dispatch `domain-agent` and `verification-agent` subagents behind the scenes.

## What to expect

1. The agent announces it's using parallel orchestration
2. You see research agents dispatched (if needed), then a decomposition plan with domain briefs
3. Domain agents run in batches of up to 4 -- you'll see Task tool calls firing
4. After all domains complete, verification agents check cross-domain consistency
5. The agent implements fixes, captures learnings, and cleans up temp files

**Typical duration**: 5-15 minutes for 4-8 domains, depending on complexity.

## When to intervene

- **BLOCKED status**: The agent will surface this and may ask for guidance
- **Decomposition review**: If the domain split looks wrong, say so before execution starts
- **Scope creep**: If domain agents are touching files outside their boundaries, stop and re-decompose

## Prerequisites

- A task spanning 5+ files across 3+ conceptual areas
- Independent work streams that can run in parallel

## Steps

1. **Read the skill** at `.agents/skills/parallel-orchestration/SKILL.md`

2. **Research** (optional) -- launch up to 4 `explore` agents via Task to investigate sources, repos, or codebase areas. Collect summaries.

3. **Decompose** -- choose a slug (e.g., `registry-3`) and create `.agents/artifacts/<slug>/`. Slice the task into N self-contained domains. Write a brief file for each to `.agents/artifacts/<slug>/briefs/domain-N-name.md` using the [domain-brief.md](../skills/parallel-orchestration/domain-brief.md) template.

4. **GATE** -- verify all briefs exist, no dependency cycles, no file ownership overlaps.

5. **Execute** -- dispatch domain agents in batches of 4 via Task with `subagent_type="domain-agent"`. Each Task prompt provides the brief and handoff paths. Use `model: "fast"` for mechanical domains.

6. **Triage** -- after each batch, check statuses. Handle NEEDS_CONTEXT/BLOCKED before proceeding.

7. **GATE** -- verify all handoff files exist with DONE or DONE_WITH_CONCERNS status.

8. **Overview pass** -- for 5+ domains, launch 4 verification agents via Task with `subagent_type="verification-agent"` and `readonly=true`, using prompts from [overview-pass.md](../skills/parallel-orchestration/overview-pass.md). For 3-4 domains, use a single verifier.

9. **Fix** -- implement fixes from the overview report.

10. **Capture** -- extract learnings, write a README.md to the artifact directory, update `memory.md` if warranted. Artifacts persist in `.agents/artifacts/<slug>/`.

11. **Cleanup** (only when plan is done) -- user confirms the plan is complete, then delete all related `.agents/artifacts/<slug>/` directories.
