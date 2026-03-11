# Workflows

End-to-end sequences for common tasks. Each step is a separate Cursor chat.

## New Feature (full ceremony)

Best for large, ambiguous, or high-risk features.

```
Chat 1:  /workflows:brainstorm [describe your idea]
         --> explores approaches, writes docs/brainstorms/*.md

Chat 2:  /workflows:plan [describe your feature]
         --> picks up brainstorm, writes docs/plans/*.md

Chat 3:  /deepen-plan docs/plans/YYYY-MM-DD-feat-name-plan.md
         --> enriches with research, docs, skills, past learnings

Chat 4:  /workflows:work docs/plans/YYYY-MM-DD-feat-name-plan.md
         --> creates branch, implements, commits, creates PR

Chat 5:  /workflows:review
         --> parallel review agents, reports findings

Chat 6:  /resolve_todo_parallel
         --> fixes review findings (if any)
```

## New Feature (fast path)

Best for well-defined features where you know the approach.

```
Chat 1:  /workflows:plan [describe your feature]
Chat 2:  /workflows:work docs/plans/YYYY-MM-DD-feat-name-plan.md
Chat 3:  /workflows:review
```

## Existing Plan (e.g. from a previous chat or Cursor plan mode)

When you already have a plan file.

```
Chat 1:  /deepen-plan .cursor/plans/your_plan.plan.md
Chat 2:  /workflows:work .cursor/plans/your_plan.plan.md
Chat 3:  /workflows:review
```

## Bug Fix

```
Chat 1:  /reproduce-bug [description or link]
         --> investigates, confirms reproduction

Chat 2:  /workflows:plan fix: [bug description]
         --> writes minimal plan

Chat 3:  /workflows:work docs/plans/YYYY-MM-DD-fix-name-plan.md
Chat 4:  /workflows:review
```

## After Solving a Hard Problem

```
Chat:    /workflows:compound
         --> documents the solution in docs/solutions/
         --> future /deepen-plan runs find and apply it
```

## PR Review Feedback

```
Chat:    /resolve_pr_parallel
         --> addresses each comment with parallel agents
```

## Choosing What to Skip

| Situation | Skip |
|-----------|------|
| Simple bug, clear fix | brainstorm, deepen-plan |
| Well-defined feature | brainstorm |
| Small change (<3 files) | deepen-plan, review |
| Prototype / experiment | review |
| Security-sensitive | nothing -- run the full ceremony |
