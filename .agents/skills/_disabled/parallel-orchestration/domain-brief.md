# Domain Brief Template

The orchestrator writes one of these per domain to `.agents/artifacts/<slug>/briefs/domain-N-name.md`.

---

```markdown
## Domain N: [Name]

**Scope**: [One sentence -- what this domain owns]
**Complexity**: mechanical | integration | architecture

### Context to Read First

- `path/to/file.md` -- [why this file matters for this domain]
- `path/to/code.ts` (lines N-M) -- [specific section to focus on]

### Changes to Make

1. **[File path]**: [Specific, actionable description of what to change]
2. **[File path]**: [Next change]
3. ...

### What NOT to Touch

These files are owned by other domains. Do not modify them.

- `path/to/file.md` -- owned by Domain N ([Name])
- `path/to/other.ts` -- owned by Domain N ([Name])

### Cross-Domain Notes

- **Depends on**: [List domains that must complete before this one, or "none"]
- **Produces**: [What other domains might need from this domain's output]
- **Known interactions**: [Any specific cross-domain concerns to flag in the handoff]
```

---

## Field reference

**Scope**: One sentence describing what this domain is responsible for. Used by the orchestrator to verify non-overlapping ownership.

**Complexity**: Drives model selection during dispatch.
- `mechanical` -- straightforward changes with clear instructions (docs updates, config edits, renames). Dispatched with `model: "fast"`.
- `integration` -- multi-file coordination, cross-cutting pattern work. Dispatched with default model.
- `architecture` -- new system design, complex refactors, judgment-heavy work. Dispatched with default model.

**Context to Read First**: Exact file paths the domain agent should read before starting work. Include line numbers for large files. The agent reads AGENTS.md automatically; list additional context here.

**Changes to Make**: Numbered, specific, actionable items. Each item should reference a file path. Vague items ("improve the docs") cause agents to guess. Specific items ("Add a cross-reference to `scroll.md` at line 45 pointing to `animations.md` section 3") produce reliable results.

**What NOT to Touch**: Explicit boundaries. Every file owned by another domain that this agent might be tempted to edit. Prevents merge conflicts and domain overlap. Reference the owning domain by number and name.

**Cross-Domain Notes**:
- "Depends on" determines batch ordering. If this domain depends on Domain 2, it cannot run in the same batch.
- "Produces" tells the orchestrator what to pass to dependent domains.
- "Known interactions" flags things the agent should mention in its handoff's "Cross-Domain Dependencies" section.
