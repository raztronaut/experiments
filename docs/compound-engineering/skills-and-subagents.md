# Skills & Subagents

## Skills

Skills are specialized instruction sets that the agent reads and follows.
They activate automatically when the agent detects a matching context,
or you can explicitly ask for them.

### Auto-activated (used by commands internally)

These are invoked by commands like `/deepen-plan` and `/workflows:work`:

| Skill | Activated by | What it does |
|-------|-------------|-------------|
| `brainstorming` | `/workflows:brainstorm` | Structured exploration of approaches |
| `frontend-design` | `/deepen-plan` on UI plans | Distinctive, non-generic UI guidance |
| `git-worktree` | `/workflows:work` | Isolated parallel development branches |
| `setup` | Manual invoke | Configures review agents |
| `document-review` | Post-plan refinement | Refines plan docs before execution |

### Manually invocable

Ask for these explicitly when relevant:

| Skill | When to use |
|-------|-------------|
| `create-agent-skills` | Writing a new SKILL.md |
| `agent-browser` | Browser automation (forms, screenshots, scraping) |
| `agent-native-architecture` | Designing systems where agents are first-class |
| `gemini-imagegen` | Generating or editing images via Gemini API |
| `rclone` | Uploading files to S3/R2/B2/cloud storage |

### Hidden skills (`disable-model-invocation: true`)

These don't auto-activate but can be used by asking explicitly:

| Skill | How to invoke | What it does |
|-------|-------------|-------------|
| `setup` | "Run the compound engineering setup skill" | Configures review agents |
| `compound-docs` | "Document this solved problem" | Creates solution docs in `docs/solutions/` |
| `resolve-pr-parallel` | "Resolve PR review comments" | Addresses PR feedback with parallel agents |
| `file-todos` | "Create a file-based todo" | Todo tracking in `todos/` directory |
| `skill-creator` | "Help me create a new skill" | Guides SKILL.md authoring |
| `orchestrating-swarms` | N/A | Requires Claude Code `Teammate()` -- unusable in Cursor |

### Not relevant to this project

These are Ruby/Rails/Python-specific and won't auto-activate here:
`dhh-rails-style`, `andrew-kane-gem-writer`, `dspy-ruby`, `every-style-editor`

---

## Subagents

Subagents are autonomous agents dispatched via the Task tool. Commands spawn
them in parallel for research and review. You don't invoke them directly --
commands do.

### Review Agents

Dispatched by `/workflows:review`. Which ones run depends on
`compound-engineering.local.md`.

| Agent | Focus |
|-------|-------|
| `kieran-typescript-reviewer` | Type safety, modern patterns, maintainability |
| `code-simplicity-reviewer` | YAGNI violations, over-engineering, simplification |
| `security-sentinel` | Vulnerabilities, input validation, auth, OWASP |
| `performance-oracle` | Bottlenecks, complexity, memory, scalability |
| `architecture-strategist` | Pattern compliance, design integrity |
| `pattern-recognition-specialist` | Naming, duplication, consistency |
| `data-integrity-guardian` | Migrations, data models, transactions |
| `agent-native-reviewer` | Agent-native parity (user action = agent action) |

### Research Agents

Dispatched by `/workflows:plan` and `/deepen-plan`.

| Agent | Focus |
|-------|-------|
| `repo-research-analyst` | Codebase structure, conventions, patterns |
| `best-practices-researcher` | External best practices, docs, examples |
| `framework-docs-researcher` | Official docs, version constraints |
| `learnings-researcher` | Past solutions from `docs/solutions/` |
| `git-history-analyzer` | Git archaeology, code evolution, contributor patterns |

### Design Agents

Dispatched by `/workflows:work` for UI tasks.

| Agent | Focus |
|-------|-------|
| `design-iterator` | Iterative visual refinement (screenshot-analyze-improve loops) |
| `design-implementation-reviewer` | Compares implementation against Figma designs |
| `figma-design-sync` | Detects and fixes visual diffs between code and Figma |

### Other Agents

| Agent | Focus |
|-------|-------|
| `spec-flow-analyzer` | User flow completeness, edge cases, gap identification |
| `bug-reproduction-validator` | Systematically reproduces and validates bug reports |
| `pr-comment-resolver` | Implements requested changes from PR review comments |
| `deployment-verification-agent` | Go/No-Go checklists, rollback procedures |
| `schema-drift-detector` | Detects unrelated schema changes in PRs |
