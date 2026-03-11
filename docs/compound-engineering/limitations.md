# Limitations

Features that genuinely cannot work in Cursor and why.

## Architectural: Cursor vs Claude Code


| Capability               | Claude Code                        | Cursor             | Impact                                |
| ------------------------ | ---------------------------------- | ------------------ | ------------------------------------- |
| Slash command chaining   | Commands invoke other commands     | One-shot per chat  | `/lfg`, `/slfg` broken                |
| Swarm orchestration      | `Teammate()` tool, inboxes, teams  | Not available      | `orchestrating-swarms` skill unusable |
| Persistent agent context | Agents share state across commands | Each chat isolated | Workflow state via files only         |
| Screen recording         | CLI tooling for capture            | Not available      | `/feature-video` broken               |
| XcodeBuild MCP           | iOS build integration              | Not available      | `/test-xcode` broken                  |


## Broken Commands (4 of 22)

### `/lfg` and `/slfg`

Chain 9 commands including a cross-plugin reference (`/ralph-wiggum:ralph-loop`).
Cursor agents cannot invoke slash commands programmatically. No workaround --
use the manual workflow sequences in `workflows.md` instead.

### `/feature-video`

Requires screen recording tooling oriented toward Claude Code CLI sessions.
Not applicable in Cursor's GUI environment.

### `/test-xcode`

iOS-specific. Requires XcodeBuildMCP which is a Claude Code MCP integration.
Not relevant to this project anyway.

## Hidden Skills (6 of 19)

Skills with `disable-model-invocation: true` in their frontmatter don't appear
in Cursor's auto-activated skills list. They still exist on disk and can be
read manually when needed.


| Skill                  | Why hidden                         | Still useful?                                      |
| ---------------------- | ---------------------------------- | -------------------------------------------------- |
| `setup`                | Side-effect: writes config file    | Yes -- ask agent to "run the setup skill"          |
| `compound-docs`        | Side-effect: creates solution docs | Yes -- ask agent to "document this solved problem" |
| `resolve-pr-parallel`  | Side-effect: modifies PR code      | Yes -- ask agent to "resolve PR comments"          |
| `file-todos`           | Side-effect: creates todo files    | Marginal -- Cursor has built-in todos              |
| `skill-creator`        | Side-effect: creates skill files   | Yes -- ask agent to "create a new skill"           |
| `orchestrating-swarms` | Requires Claude Code `Teammate()`  | No -- swarm primitives don't exist in Cursor       |


## Reduced Functionality

### `/deepen-plan` agent parallelism

Designed to spawn 20-40+ parallel research agents. Cursor's Task tool throttles
to ~4 concurrent subagents. Results are comparable but arrive in batches.

### `/workflows:work` swarm mode

"Use swarm mode" or "launch an army of subagents" enables parallel execution
in Claude Code via `Teammate()`. In Cursor, work proceeds sequentially with
occasional Task-based parallelism for independent steps.

### `/workflows:review` worktree inspection

The review command uses git worktrees for deep local inspection. This still
works in Cursor but the agent can't visually diff changes the way Claude Code
CLI can in tmux/iTerm2 split panes.

## What This Means in Practice

The plugin operates at roughly 80% capacity in Cursor:

- **Full functionality**: All 29 agents, 13 auto-activated skills, Context7 MCP,
`compound-engineering.local.md` config, and 18 slash commands.
- **Manual orchestration**: Instead of `/lfg` running the full pipeline, you run
each step as a separate chat with the plan file as shared state.
- **No swarms**: Parallel specialist teams are sequential in Cursor. Reviews still
dispatch multiple agents via Task, just throttled to 4 at a time.

