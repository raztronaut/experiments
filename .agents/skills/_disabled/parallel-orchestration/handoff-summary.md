# Handoff Summary Template

Each domain agent writes one of these to `.agents/artifacts/<slug>/handoffs/domain-N-name.md` when finishing its work.

---

```markdown
## Domain [N]: [Name] -- Handoff Summary

**Status**: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

### Completed (plan items done)

- [item number]: [one-line description] -- [file(s) modified]

### Extra Discoveries (things found not in the plan)

- [description] -- [file(s) affected] -- [action taken]

### Extra Changes (files modified beyond the plan)

- [file path] -- [what changed and why]

### Intentional Skips (plan items NOT done, with reasoning)

- [item number]: [why skipped or deferred]

### Judgment Calls (deviations from the plan)

- [plan said X] vs [actually did Y] -- [why the deviation was necessary]

### Cross-Domain Dependencies (things another domain needs to verify)

- Domain [N] should: [specific thing to do or check]

### Open Concerns (unresolved issues)

- [description of anything that needs human attention or further investigation]

### Files Touched (complete list)

- [file path] -- [created / modified / deleted]

### Learnings (reusable insights for future work)

- [insight that would help future agents or future orchestrations of similar work]
```

---

## Section reference

**Status**: Machine-readable field the orchestrator uses for triage between batches.

| Status | Meaning | Orchestrator action |
|---|---|---|
| `DONE` | All items completed successfully | Proceed to next batch |
| `DONE_WITH_CONCERNS` | Completed, but flagging doubts | Read "Open Concerns"; address correctness issues before overview, note observations |
| `NEEDS_CONTEXT` | Cannot complete without missing info | Provide context and re-dispatch this domain |
| `BLOCKED` | Fundamental issue prevents completion | Assess: context problem, complexity problem, or plan error |

**Completed**: Every plan item that was done. Reference the item number from the brief's "Changes to Make" list. Include file paths so the overview pass can verify.

**Extra Discoveries**: Things found during work that weren't in the plan. Include what was done about them (fixed it, noted it, deferred it). These feed into the overview pass and knowledge capture.

**Extra Changes**: Files modified that weren't explicitly listed in the brief. Explain why -- unexpected dependency, prerequisite fix, etc.

**Intentional Skips**: Plan items deliberately not done. Always include reasoning. "Didn't get to it" is not a valid reason -- that's NEEDS_CONTEXT or BLOCKED.

**Judgment Calls**: Deviations from the plan's exact instructions. The plan said to do X, but Y was actually the right call. Document both so the overview pass can evaluate.

**Cross-Domain Dependencies**: The most critical section for the overview pass. When this domain's work requires verification or follow-up by another domain, list it explicitly. Format: "Domain N should: [action]". The overview pass's Verifier A checks every one of these.

**Open Concerns**: Anything unresolved. Human decisions needed, edge cases discovered, potential regressions, things that smell wrong but aren't provably broken.

**Files Touched**: Complete manifest of every file created, modified, or deleted. The overview pass's Verifier B uses this to detect multi-touch conflicts.

**Learnings**: Reusable insights that go beyond this specific task. Feed into Phase 6 knowledge capture and potentially into `memory.md`.
