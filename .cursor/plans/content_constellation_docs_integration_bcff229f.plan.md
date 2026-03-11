---
name: Content Constellation Docs Integration
overview: Create a user-facing overview doc for the content constellation system and update all existing agent docs to cross-reference the new Cursor-native setup (6 rules, 3 skills, 2 subagents).
todos:
  - id: create-overview-doc
    content: Create `.agents/contexts/content-constellation.md` -- full system overview
    status: completed
  - id: update-agents-md
    content: Update `AGENTS.md` -- add content domain + Cursor-native tools subsection
    status: completed
  - id: update-publish-workflow
    content: Update `.agents/workflows/publish-experiment.md` -- add Cursor integration note
    status: completed
  - id: update-porting-skill
    content: Update `.agents/skills/porting-demos/SKILL.md` -- update cross-reference
    status: completed
  - id: update-backlog-t2
    content: Update `.agents/backlog/t2-content-registry.md` -- note execution tools
    status: completed
  - id: update-memory
    content: Update `memory.md` -- add workspace fact
    status: completed
  - id: update-claude-md
    content: Update `CLAUDE.md` -- add content tools one-liner
    status: completed
isProject: false
---

# Content Constellation Docs and Integration

## What needs doing

The content constellation Cursor-native integration is built (6 rules, 3 skills, 2 subagents in `.cursor/`), but the existing agent documentation doesn't know about it. There's no overview doc explaining the system as a whole, and several existing docs need cross-references.

## 1. Create `.agents/contexts/content-constellation.md` (NEW)

The core deliverable -- a single overview document that maps the entire content constellation system. This is the entry point for any agent working on content.

**Contents:**

- What the 6-format content model is (article, lab note, architecture, snippet, social, changelog)
- The audience and voice for each format (table referencing `writing-voice.md`)
- The lifecycle: `status: "shipped"` -> publish workflow -> `publishable: true`
- File locations: where content lives in the experiment route structure
- Scaffolding: `npm run new:article` creates 8 files, `npm run delete:article` removes them
- The `.cursor/` tool inventory: 6 rules (auto-inject), 3 skills (task workflows), 2 subagents (personas)
- The `.agents/` knowledge sources: `publish-experiment.md` (canonical workflow), `writing-voice.md` (voice/templates)
- The generation pipeline: registry, posters, llms-txt -- and how content feeds into them
- Validation: pre-commit validator cross-checks `content` flags vs disk
- Reference implementation: basketball-replay-center (all 6 types complete)
- Current state: 2/18 experiments have articles, 16 have `content: {}`

**Target length:** ~80-120 lines. Pure reference, not a workflow (that's `publish-experiment.md`).

## 2. Update [AGENTS.md](AGENTS.md)

Add content constellation to the Reference Docs section (after line 219, before the profile-specific guidance note):

- Add a "Content" row to the domain table: `Content | .agents/contexts/content-constellation.md | Writing articles, publishing experiments, auditing content coverage`
- Add a **Cursor-Native Tools** subsection below the existing `.agents/` listings (after line 234), listing:
  - Rules: 6 `.cursor/rules/*.mdc` files (auto-inject on matching files)
  - Skills: 3 `.cursor/skills/*/SKILL.md` (publish-content, audit-content, run-generation)
  - Subagents: 2 `.cursor/agents/*.md` (content-writer, content-auditor)
- Add `continual-learning` to the skills list on line 224 (it's missing per the agent-native audit)

## 3. Update [.agents/workflows/publish-experiment.md](.agents/workflows/publish-experiment.md)

Add a short note near the top (after the description frontmatter, before "Prerequisites") noting the Cursor-native adapter:

> **Cursor integration:** This workflow is available as a Cursor skill at `.cursor/skills/publish-content/SKILL.md` (auto-discovered by task description). Article-writing context auto-injects via `.cursor/rules/article-writing.mdc` when editing `.mdx` files. The `content-writer` subagent at `.cursor/agents/content-writer.md` can be delegated to for article writing.

## 4. Update [.agents/skills/porting-demos/SKILL.md](.agents/skills/porting-demos/SKILL.md)

Line 21 currently says:

```
- Publishing or writing about an experiment (use `.agents/workflows/publish-experiment.md`)
```

Update to also mention the Cursor skill:

```
- Publishing or writing about an experiment (use `.agents/workflows/publish-experiment.md` or Cursor skill `.cursor/skills/publish-content/SKILL.md`)
```

## 5. Update [.agents/backlog/t2-content-registry.md](.agents/backlog/t2-content-registry.md)

The "Generate articles for 16 experiments" item should note the execution tools:

```
- **Generate articles for 16 experiments** -- ... Execution tools: `.cursor/skills/publish-content/SKILL.md` (workflow), `.cursor/agents/content-writer.md` (writing persona).
```

## 6. Update [memory.md](memory.md)

Add a Learned Workspace Fact:

```
- Content constellation Cursor-native integration: 6 rules in `.cursor/rules/` (auto-inject on experiment.json, content.mdx, docs/*.md, generate-*.mjs, registry.config.json, experiment components), 3 skills in `.cursor/skills/` (publish-content, audit-content, run-generation), 2 subagents in `.cursor/agents/` (content-writer, content-auditor). Overview doc at `.agents/contexts/content-constellation.md`.
```

## 7. Update [CLAUDE.md](CLAUDE.md) (one-liner)

Add awareness of the Cursor-native content tools:

```
Cursor-native content tools: `.cursor/rules/`, `.cursor/skills/`, `.cursor/agents/`.
Content system overview: `.agents/contexts/content-constellation.md`.
```

## Files Changed


| File                                        | Action                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `.agents/contexts/content-constellation.md` | **NEW** -- system overview doc                                                 |
| `AGENTS.md`                                 | Add content domain to Reference Docs table, add Cursor-Native Tools subsection |
| `.agents/workflows/publish-experiment.md`   | Add Cursor integration note at top                                             |
| `.agents/skills/porting-demos/SKILL.md`     | Update "Do NOT use for" cross-reference                                        |
| `.agents/backlog/t2-content-registry.md`    | Note execution tools for article gap                                           |
| `memory.md`                                 | Add workspace fact                                                             |
| `CLAUDE.md`                                 | Add content tools one-liner                                                    |


