# Compound Engineering Plugin in Cursor

Practical guide for using the Compound Engineering plugin (v2.33) inside Cursor.
The plugin was built for Claude Code CLI. Most features translate to Cursor,
but the orchestration commands (`/lfg`, `/slfg`) and swarm primitives do not.

## Setup Status

| Component | Status | Notes |
|-----------|--------|-------|
| Plugin installed | Done | `.cursor/plugins/cache/cursor-public/compound-engineering/` |
| `compound-engineering.local.md` | Done | TypeScript config with 4 review + 2 plan agents |
| Workflow directories | Done | `docs/plans/`, `docs/solutions/`, `docs/brainstorms/` |
| Skills (13/19) | Auto-activated | 6 have `disable-model-invocation` -- still readable on request |
| Agents (29/29) | Available | All registered as Task tool `subagent_type` options |
| Commands (18/22) | Slash commands | 4 don't work: `/lfg`, `/slfg`, `/feature-video`, `/test-xcode` |
| Context7 MCP | Working | Documentation lookups via MCP |

## Quick Test

Verify your setup works by trying each component type:

**Slash command** -- open a new chat, type `/workflows:plan` and hit tab or enter.
You should see the command auto-complete. Give it a feature description.

**Agent dispatch** -- ask the agent: "Run a TypeScript review of my latest changes
using the kieran-typescript-reviewer." It dispatches via the Task tool.

**Skill activation** -- ask: "Help me brainstorm approaches for X." The
brainstorming skill activates automatically from its description match.

**Context7** -- ask: "Look up the GSAP ScrollTrigger API using Context7."

## Contents

- [Commands Reference](commands.md) -- every command, what it does, Cursor compatibility
- [Workflows](workflows.md) -- end-to-end sequences for common tasks
- [Skills & Subagents](skills-and-subagents.md) -- auto-activated capabilities
- [Setup](setup.md) -- `compound-engineering.local.md` configuration
- [Gotchas](gotchas.md) -- Cursor-specific issues and workarounds
- [Limitations](limitations.md) -- what genuinely cannot work and why
