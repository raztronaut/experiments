---
name: Refine Orchestration Skill
overview: Apply Cursor's create-skill, create-rule, and create-subagent best practices to refine the parallel-orchestration skill files -- fix non-standard frontmatter, create an orchestrator subagent, and add an auto-trigger rule.
todos:
  - id: fix-frontmatter
    content: Fix SKILL.md frontmatter (remove triggers, expand description) and trim Domain Agent Instructions to a pointer
    status: completed
  - id: fix-prompt-template
    content: Remove inline handoff template from domain-agent-prompt.md, reference handoff-summary.md instead
    status: completed
  - id: fix-terminology
    content: Standardize terminology across all 6 skill files (domain agent / verification agent / subagent)
    status: completed
  - id: create-orchestrator-subagent
    content: Create .cursor/agents/orchestrator.md subagent
    status: completed
  - id: create-domain-agent-subagent
    content: Create .cursor/agents/domain-agent.md subagent
    status: completed
  - id: create-verification-agent-subagent
    content: Create .cursor/agents/verification-agent.md subagent
    status: completed
  - id: create-rule
    content: Create .cursor/rules/parallel-orchestration.mdc auto-trigger rule
    status: completed
isProject: false
---

# Refine Parallel Orchestration Skill

Comparing the 6 files I just wrote against the three Cursor authoring guides (create-skill, create-rule, create-subagent), I found 4 concrete issues and 2 new artifacts to create.

## Issues to Fix

### 1. Non-standard YAML frontmatter in SKILL.md

The `triggers` field is not a standard Cursor skill frontmatter field. The [create-skill guide](/Users/razisyed/.cursor/skills-cursor/create-skill/SKILL.md) only defines `name` and `description` as valid fields. The trigger terms should be folded into the `description` instead.

**Current** (lines 1-11 of [SKILL.md](/Users/razisyed/Developer/experiments/.agents/skills/parallel-orchestration/SKILL.md)):

```yaml
---
name: parallel-orchestration
description: Decompose large tasks into parallel domain agents...
triggers:
  - parallelize
  - decompose
  - run in parallel
  - multi-agent
  - orchestrate
  - domain agents
---
```

**Fixed** -- remove `triggers`, expand `description` with trigger terms:

```yaml
---
name: parallel-orchestration
description: Decompose large tasks into parallel domain agents with structured handoffs and verification. Use when facing 5+ files across 3+ conceptual areas with independent work streams. Triggers on "parallelize", "decompose", "run in parallel", "multi-agent", "orchestrate", or when the task is too large for a single agent.
---
```

### 2. Duplicate content between SKILL.md and domain-agent-prompt.md

The "Domain Agent Instructions" section in SKILL.md (lines 172-193) largely repeats what's in [domain-agent-prompt.md](/Users/razisyed/Developer/experiments/.agents/skills/parallel-orchestration/domain-agent-prompt.md). Per the create-skill guide's progressive disclosure principle, SKILL.md should have a brief pointer, not a repeat.

**Fix**: Trim the "Domain Agent Instructions" section in SKILL.md to a 2-line pointer: "Domain subagents follow [domain-agent-prompt.md](domain-agent-prompt.md). See that file for the full protocol."

### 3. Terminology inconsistency

Scanning all 6 files, I see "domain agent", "domain subagent", and "subagent" used interchangeably. Per the create-skill anti-patterns section: "Choose one term and use it throughout."

**Fix**: Standardize on **"domain agent"** for the domain workers, **"verification agent"** for the overview pass workers, and **"subagent"** only when referring to the Cursor Task tool mechanism specifically.

### 4. domain-agent-prompt.md embeds the handoff template inline

[domain-agent-prompt.md](/Users/razisyed/Developer/experiments/.agents/skills/parallel-orchestration/domain-agent-prompt.md) (lines 41-72) contains the full handoff template inline instead of referencing [handoff-summary.md](/Users/razisyed/Developer/experiments/.agents/skills/parallel-orchestration/handoff-summary.md). This creates duplication that could drift.

**Fix**: Replace the inline template with: "Write your handoff summary using the template in `.agents/skills/parallel-orchestration/handoff-summary.md`." Keep only a 2-line reminder of the key fields (Status + 9 sections) rather than the full template.

## New Artifacts to Create

### 5. Three subagents (`.cursor/agents/`)

Per the create-subagent guide: "Design focused subagents: Each should excel at one specific task." The orchestration system has three distinct specialized roles. All three fit the subagent pattern -- each has a fixed behavior (system prompt) that gets parameterized per invocation via the Task tool's `prompt` field.

No `.cursor/agents/` directory exists yet. Create all three:

**a) `.cursor/agents/orchestrator.md`** -- the pipeline driver

```yaml
---
name: orchestrator
description: Parallel domain orchestration specialist. Use proactively when a task spans 5+ files across 3+ conceptual areas, when the user asks to parallelize work, decompose into domains, or orchestrate a large refactor/audit.
---
```

System prompt: Read the parallel-orchestration skill at `.agents/skills/parallel-orchestration/SKILL.md`, then execute the 6-phase pipeline (research, decomposition, parallel execution, overview pass, fixes, knowledge capture). Use the Task tool to dispatch domain agents and verification agents. ~30 lines, pointing to skill files rather than duplicating.

**b) `.cursor/agents/domain-agent.md`** -- the domain worker

```yaml
---
name: domain-agent
description: Domain execution specialist for parallel orchestration. Reads a scoped domain brief, executes changes within strict file boundaries, and writes a structured handoff summary. Invoked by the orchestrator via Task tool.
---
```

System prompt: Read `.agents/skills/parallel-orchestration/domain-agent-prompt.md` for the full protocol. Read your brief at the path provided. Execute all changes. Write your handoff to the path provided using the template in `.agents/skills/parallel-orchestration/handoff-summary.md`. Report status (DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED). ~20 lines.

This replaces `domain-agent-prompt.md` as the canonical domain agent definition. The `.agents/skills/` file becomes a detailed reference that the subagent's system prompt points to.

**c) `.cursor/agents/verification-agent.md`** -- the read-only verifier

```yaml
---
name: verification-agent
description: Read-only verification specialist for parallel orchestration overview pass. Checks cross-domain dependencies, file conflicts, naming consistency, or completeness gaps. Never modifies files. Invoked by the orchestrator via Task tool.
---
```

System prompt: You are a read-only verification agent. Do NOT modify any files. Read the verification concern provided in your prompt. Read the handoff files and modified files. Report findings in the structured format. ~20 lines.

### 6. Auto-trigger rule (`.cursor/rules/parallel-orchestration.mdc`)

No `.cursor/rules/` directory exists yet. A lightweight rule would remind the agent about the skill for qualifying tasks. Since this triggers on task complexity (not file type), it should be `alwaysApply: true` and very brief (~5 lines).

```yaml
---
description: Trigger parallel domain orchestration for large multi-domain tasks
alwaysApply: true
---
```

Body: A 3-line reminder that for tasks spanning 5+ files across 3+ conceptual areas, read `.agents/skills/parallel-orchestration/SKILL.md` and consider delegating to the orchestrator subagent.

**Note**: AGENTS.md already references the skill in its Reference Docs table, so this rule is additive but not strictly necessary. Its value is that rules are injected into the system prompt automatically, while AGENTS.md requires the agent to read it first.

## Summary of Changes


| Item | File                                                           | Action                                                     |
| ---- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| 1    | `.agents/skills/parallel-orchestration/SKILL.md`               | Fix frontmatter, trim Domain Agent Instructions to pointer |
| 2    | `.agents/skills/parallel-orchestration/domain-agent-prompt.md` | Remove inline handoff template, reference file instead     |
| 3    | All 6 skill files                                              | Standardize terminology                                    |
| 4    | `.cursor/agents/orchestrator.md`                               | **New** -- orchestrator subagent                           |
| 5    | `.cursor/agents/domain-agent.md`                               | **New** -- domain agent subagent                           |
| 6    | `.cursor/agents/verification-agent.md`                         | **New** -- verification agent subagent                     |
| 7    | `.cursor/rules/parallel-orchestration.mdc`                     | **New** -- auto-trigger rule                               |


