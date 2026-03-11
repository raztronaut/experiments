# Overview Pass Template

The orchestrator uses this to construct verification agent prompts in Phase 4. For 3-4 domains, use a single verification agent with the combined prompt. For 5+ domains, dispatch all 4 verification agents in parallel.

---

## Setup (orchestrator does this before dispatching)

1. Read all handoff files from `.agents/artifacts/<slug>/handoffs/`
2. Extract every cross-domain dependency into a list:
   ```
   - Domain 1 → Domain 3: "scroll.md cross-ref added"
   - Domain 2 → Domain 4: "shader naming aligned"
   ...
   ```
3. Identify multi-touch files (files in 2+ handoffs' "Files Touched"):
   ```
   - `path/to/file.md` -- Domain 1 + Domain 3
   ...
   ```
4. Collect all "Open Concerns" across handoffs
5. Write the dependency list, multi-touch files, and concerns into the prompts below

---

## Verifier A: Cross-Domain Dependency Verifier

```
You are a read-only verification agent. Do NOT modify any files.

Your job: verify every cross-domain dependency flagged by the domain agents.

DEPENDENCIES TO VERIFY:
[Paste the extracted dependency list here]

For each dependency:
1. Read both files referenced
2. Verify the dependency was actually fulfilled
3. Report: VERIFIED / BROKEN (with details) / PARTIAL (with details)

Return your findings as a structured list:

### Verified Dependencies
- [dependency]: confirmed in [file] at [line/section]

### Broken Dependencies
- [dependency]: [what's wrong] -- [suggested fix]

### Partial Dependencies
- [dependency]: [what's done, what's missing]
```

## Verifier B: Multi-Touch File Conflict Checker

```
You are a read-only verification agent. Do NOT modify any files.

Your job: verify that files modified by multiple domains have clean merges
with no conflicting changes.

MULTI-TOUCH FILES:
[Paste the multi-touch file list with owning domains here]

For each file:
1. Read the file
2. Check that all expected changes from each domain are present
3. Check that no domain's changes overwrite or contradict another's
4. Verify the file is internally consistent (no duplicate sections,
   no contradictory guidance, no broken references)

Return your findings:

### Clean Merges
- [file]: all changes from Domain N + Domain M present, no conflicts

### Conflicts Found
- [file]: [Domain N's change] conflicts with [Domain M's change] -- [details]

### Missing Changes
- [file]: expected [change] from Domain N, but not found
```

## Verifier C: Consistency Checker

```
You are a read-only verification agent. Do NOT modify any files.

Your job: check terminology, naming, and pattern consistency across all
files modified during this orchestration.

FILES MODIFIED:
[Paste the aggregate file list from all handoffs here]

Check for:

1. **Naming conflicts**: same concept with different names across files
   (e.g., `useDeviceCapabilities` in one file vs `useDeviceDetection` in another)

2. **Terminology drift**: variations of the same term
   (e.g., "frame loop" vs "frameloop" vs "render loop")

3. **Pattern inconsistency**: same pattern taught differently in different docs
   (e.g., different import patterns, different initialization sequences)

4. **Cross-reference integrity**: verify that cross-references between
   modified files point to sections that actually exist

Return your findings:

### Naming Conflicts
- [name A] in [file] vs [name B] in [file] -- [recommendation for canonical name]

### Terminology Inconsistencies
- [term variations] found in [files] -- [recommended canonical form]

### Pattern Inconsistencies
- [pattern] differs between [file A] and [file B] -- [details]

### Broken Cross-References
- [file] references [target] which does not exist or has moved
```

## Verifier D: Completeness + Quality Guard

```
You are a read-only verification agent. Do NOT modify any files.

Your job: two things -- completeness audit and quality check.

PLAN FILE: .agents/artifacts/<slug>/plan.md
HANDOFF DIRECTORY: .agents/artifacts/<slug>/handoffs/

PART 1 -- COMPLETENESS:

For each domain's handoff, cross-check:
- Every item in the brief's "Changes to Make" should appear in either
  "Completed" or "Intentional Skips"
- Any item not accounted for in either list is a genuine gap
- Items marked as "already done by prior work" should be verified

Report:
### Completeness Gaps
- Domain [N], item [M]: [not found in Completed or Intentional Skips]

### Verified Complete
- Domain [N]: [X/Y] items completed, [Z] intentionally skipped, [0] gaps

PART 2 -- QUALITY:

Read all newly created or expanded files. Check for:

- Prescriptive language that should be softened:
  "must/always/never/required" where "recommended/prefer/typically/should" fits
  (Exception: genuine invariants like "never setState in useFrame" stay as-is)
- Content duplication between files that should cross-reference instead
- Patterns presented as the only way vs the best default

Report:
### Quality Issues
- [file]: [line/section] -- [prescriptive language] -- [suggested softening]

### Content Duplication
- [file A] and [file B] both contain [duplicated content] -- [which should be brief reference + cross-link]

### No Issues Found
- [list domains/files that passed all checks]
```

---

## Final Report Format

The orchestrator synthesizes all 4 verification agent reports into `.agents/artifacts/<slug>/overview-report.md`:

```markdown
# Overview Report

## Summary
- Domains verified: N
- Cross-domain dependencies: N verified, N broken, N partial
- Multi-touch files: N clean, N conflicted
- Naming conflicts: N
- Completeness gaps: N
- Quality issues: N

## Broken Cross-Domain Dependencies
[from Verifier A]

## File Conflicts
[from Verifier B]

## Naming and Consistency Issues
[from Verifier C]

## Completeness Gaps
[from Verifier D, Part 1]

## Quality Issues
[from Verifier D, Part 2]

## Items to Fix
[Orchestrator's prioritized list of changes needed, derived from all 4 reports]
```
