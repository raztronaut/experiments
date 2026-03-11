# Compound Engineering Plugin in Cursor

Practical guide for using the Compound Engineering plugin inside Cursor IDE.
The plugin was built for Claude Code (CLI) and most features translate to Cursor,
but the orchestration commands (`/lfg`, `/slfg`) do not work because Cursor agents
cannot invoke other slash commands programmatically.

## Quick Start

1. Run setup (once per project): invoke the `setup` skill or follow `setup.md`
2. Use individual commands in sequence across separate chats
3. Skills activate automatically when relevant

## Contents

- [Setup](setup.md) -- first-time configuration
- [Commands Reference](commands.md) -- every command, what it does, when to use it
- [Workflows](workflows.md) -- end-to-end sequences for common tasks
- [Skills & Subagents](skills-and-subagents.md) -- auto-activated capabilities
- [Gotchas](gotchas.md) -- Cursor-specific issues and workarounds
