# Gotchas

Cursor-specific issues and workarounds for the Compound Engineering plugin.

## 1. Slash command chaining doesn't work

**Problem:** `/lfg` and `/slfg` instruct the agent to "run these slash commands
in order." Cursor agents cannot invoke slash commands -- only users can type them.
The agent sees the instructions, doesn't know what `/workflows:plan` is, and
either errors or falls back to improvising.

**Workaround:** Run individual commands in separate chats. See `workflows.md`
for the correct sequences.

**Affected commands:** `/lfg`, `/slfg`

## 2. Each command should be a separate chat

**Problem:** Long conversations accumulate context that can confuse the agent.
A `/deepen-plan` in the same chat as `/workflows:work` means the agent has
thousands of tokens of research context competing with implementation focus.

**Workaround:** Start a new chat for each command in the workflow sequence.
The plan file on disk is the shared state between chats.

## 3. Plan file paths differ between Cursor and plugin conventions

**Problem:** The plugin expects plans at `docs/plans/YYYY-MM-DD-type-name-plan.md`.
Cursor's built-in plan mode writes to `.cursor/plans/*.plan.md`. Both work as
input to `/deepen-plan` and `/workflows:work`, but the formats differ slightly.

**Workaround:** Pass the full path explicitly. Both formats are accepted:
- `/deepen-plan docs/plans/2026-03-10-feat-registry-plan.md`
- `/deepen-plan .cursor/plans/registry_interactive_docs_aaa07efa.plan.md`

## 4. The plugin references Claude Code conventions

**Problem:** Commands reference `CLAUDE.md`, `~/.claude/`, `.claude/` directories,
`Teammate()` operations, and `skill:` syntax. These are Claude Code conventions
that don't exist in Cursor.

**What still works:**
- Subagent spawning via the Task tool (Cursor's equivalent of Claude Code's Task)
- Skill reading via the Read tool
- Context7 MCP queries
- Web search for research
- AskQuestion for user interaction

**What doesn't:**
- `Teammate()` operations (swarm coordination protocol)
- `skill: git-worktree` inline syntax (just ask for the skill by name instead)
- `~/.claude/` directory references (Cursor uses `~/.cursor/`)

## 5. `docs/solutions/` must exist for institutional memory

**Problem:** `/deepen-plan` searches `docs/solutions/` for past learnings
documented by `/workflows:compound`. If you've never run `/workflows:compound`,
the directory doesn't exist and the learnings step finds nothing.

**Workaround:** The directory is created automatically when you first run
`/workflows:compound`. Until then, `/deepen-plan` simply skips the learnings step.
Run `/workflows:compound` after solving hard problems to build up the knowledge base.

## 6. Agent count in /deepen-plan can be overwhelming

**Problem:** `/deepen-plan` is designed to "spawn ALL agents" and "don't filter,
don't skip." This can mean 20-40 parallel subagents. In Cursor, the Task tool
has practical limits on concurrent agents.

**Workaround:** The agent will naturally throttle to what Cursor supports (typically
4 concurrent Task calls). The research still happens, just in batches rather than
all at once. Results are comparable; it just takes a few more round-trips.

## 7. /workflows:work expects conventional commit + PR workflow

**Problem:** The work command creates branches, makes incremental commits,
and creates PRs via `gh pr create`. If you're on a solo project or don't use
GitHub PRs, some of this ceremony is unnecessary.

**Workaround:** The agent asks before creating branches and PRs. You can tell it
to skip the PR step, commit directly, or adjust the workflow to match your process.

## 8. Review context matters

**Problem:** Without `compound-engineering.local.md`, review agents don't know
your project conventions. They may flag things that are intentional (like
permissive Biome config for creative code) or miss project-specific concerns.

**Workaround:** Run setup once and keep the Review Context section updated.
The more specific your context, the better the reviews.
