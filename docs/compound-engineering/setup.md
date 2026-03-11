# Setup

## Config File

The plugin uses `compound-engineering.local.md` in the project root to configure
which review agents run during `/workflows:review` and `/workflows:work`.

### Generate it

Invoke the `setup` skill. It auto-detects your stack and offers auto-configure
or manual customization.

### What it controls

```yaml
---
review_agents: [kieran-typescript-reviewer, code-simplicity-reviewer, security-sentinel, performance-oracle]
plan_review_agents: [kieran-typescript-reviewer, code-simplicity-reviewer]
---
```

- `review_agents` -- dispatched during `/workflows:review` and quality checks in `/workflows:work`
- `plan_review_agents` -- dispatched during `/deepen-plan` for plan-level feedback

### Review Context section

Below the frontmatter is a free-text section that gets passed to every review agent.
Add project-specific constraints here so reviewers understand your codebase without
rediscovering conventions each time.

### Reconfigure

Run the setup skill again anytime. It detects the existing file and offers to
reconfigure or view current settings.

## Directory Conventions

The plugin expects certain directories for its workflow:

```
docs/
  plans/          -- /workflows:plan writes plan files here
  solutions/      -- /workflows:compound writes solved-problem docs here
  brainstorms/    -- /workflows:brainstorm writes brainstorm docs here
```

These are created automatically by the commands when first used.
