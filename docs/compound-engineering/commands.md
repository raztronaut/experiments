# Commands Reference

## Commands That Work in Cursor

### Core Workflow

Run these in sequence across separate chats. Each is self-contained.

#### `/workflows:brainstorm [idea]`

Collaborative dialogue to explore approaches before committing to a plan.
Good for ambiguous features with multiple valid directions.

**Output:** Writes a brainstorm doc to `docs/brainstorms/`.

**When to use:** Before planning, when you're unsure of the approach.

**When to skip:** When the feature is well-defined and you know the approach.

---

#### `/workflows:plan [feature description]`

Creates a structured implementation plan. Spawns `repo-research-analyst` and
`learnings-researcher` subagents to gather local context, optionally spawns
`best-practices-researcher` and `framework-docs-researcher` for external research.

Offers three detail levels: minimal, standard, comprehensive.

**Output:** Writes a plan file to `docs/plans/YYYY-MM-DD-type-name-plan.md`.

**Tip:** If you already ran `/workflows:brainstorm`, the plan command automatically
finds and incorporates the brainstorm output.

---

#### `/deepen-plan [path/to/plan.md]`

Enhances an existing plan with parallel research agents. This is the heavyweight
enrichment step -- it:

1. Parses the plan into sections
2. Discovers ALL available skills and matches them to plan sections
3. Spawns a subagent for every matched skill (can be 10-30+ parallel agents)
4. Checks `docs/solutions/` for relevant past learnings
5. Queries Context7 for framework documentation
6. Runs web searches for current best practices
7. Dispatches ALL review agents against the plan
8. Synthesizes everything and writes enriched plan back

**Input:** Path to a plan file. Works with both `docs/plans/*.md` and
`.cursor/plans/*.plan.md` (Cursor native plans).

**Tip:** This command is resource-intensive. It's the highest-value step for
complex features but overkill for simple bug fixes.

---

#### `/workflows:work [path/to/plan.md]`

Executes a plan systematically:

1. Reads and clarifies the plan
2. Creates a feature branch (or offers worktree for parallel dev)
3. Builds a todo list from plan phases
4. Implements each task with incremental commits
5. Runs tests continuously
6. Quality checks (tests, linting, optional reviewer agents)
7. Creates PR with summary, screenshots, monitoring plan

**Swarm mode:** Say "use swarm mode" or "launch an army of subagents" to enable
parallel execution where independent tasks are dispatched to separate agents.

**Tip:** For large plans (7+ phases), consider running `/workflows:work` on
2-3 phases at a time rather than the entire plan. This keeps context manageable.

---

#### `/workflows:review`

Dispatches review agents configured in `compound-engineering.local.md` against
your current changes. Agents run in parallel via the Task tool.

Default TypeScript config dispatches:
- `kieran-typescript-reviewer` -- type safety, modern patterns, maintainability
- `code-simplicity-reviewer` -- YAGNI violations, over-engineering
- `security-sentinel` -- vulnerabilities, input validation, auth
- `performance-oracle` -- bottlenecks, complexity, memory, scalability

**When to use:** After implementation is complete, before creating/merging PR.

---

#### `/workflows:compound`

Documents a solved problem as institutional knowledge in `docs/solutions/`.
Files include YAML frontmatter (title, category, tags, module, symptom, root_cause)
so future `/deepen-plan` runs can discover and apply them.

**When to use:** After solving a tricky problem that you'd want to remember.
The next time `/deepen-plan` runs, it searches `docs/solutions/` for relevant
past learnings and incorporates them into the plan.

---

### Utility Commands

#### `/resolve_todo_parallel`

Resolves all TODO comments across files using parallel subagents. Good after
`/workflows:review` identifies issues.

#### `/resolve_pr_parallel`

Addresses PR review comments by implementing requested changes with parallel agents.

#### `/changelog`

Generates a changelog from recent merges to main. Good for release notes.

#### `/reproduce-bug`

Investigates a bug using logs, console inspection, and browser screenshots.

#### `/test-browser`

Runs browser tests on pages affected by current branch changes.

#### `/create-agent-skill`

Guided skill authoring -- helps you write a new SKILL.md with correct structure.

#### `/generate-command`

Creates a new custom slash command following plugin conventions.

#### `/triage`

Categorizes and prioritizes findings for the todo system.

#### `/deploy-docs`

Validates and prepares documentation for GitHub Pages deployment.

#### `/heal-skill`

Fixes a broken SKILL.md with incorrect instructions or outdated API references.

#### `/agent-native-audit`

Reviews code to ensure agent-native parity: any action a user can take,
an agent should also be able to take.

#### `/report-bug`

Files a bug report against the Compound Engineering plugin itself.

---

## Commands That Do NOT Work in Cursor

| Command | Why |
|---------|-----|
| `/lfg` | Chains 9 slash commands including `/ralph-wiggum:ralph-loop` from a separate plugin. Cursor agents cannot invoke slash commands. |
| `/slfg` | Same as `/lfg` with swarm parallelism. Same chaining problem. |
| `/feature-video` | Requires screen recording tooling oriented toward Claude Code CLI. |
| `/test-xcode` | iOS-specific, needs XcodeBuildMCP. |
