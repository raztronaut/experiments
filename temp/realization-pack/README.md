# Architecture Realization Pack

This folder is the canonical steering surface for the clean architecture realization pass.

It exists because the lab is no longer just a collection of experiment pages. It is now a multi-surface product system with:

- isolated experiments
- public writing
- internal content constellation docs
- a Fumadocs-backed registry/docs surface
- machine-readable exports
- feeds, sitemap, and search
- scaffolding and agent-native workflows

The goal of this pack is to let you steer a serious restructuring effort without relying on memory, vibes, or scattered prior plans.

## How to use this pack

Read these docs in order before making structural changes:

1. `00-vision-and-non-goals.md`
2. `01-worktree-and-branch-safety.md`
3. `02-system-inventory.md`
4. `03-source-of-truth-matrix.md`
5. `04-public-contracts-and-urls.md`
6. `05-existing-plan-reconciliation.md`
7. `06-content-and-mdx-audit.md`
8. `07-scaffolding-and-agent-tooling-audit.md`
9. `08-build-and-generated-artifacts-audit.md`
10. `09-v2-vs-legacy-boundary.md`
11. `10-performance-and-runtime-isolation.md`
12. `11-next-build-hang-investigation.md`
13. `12-execution-board.md`
14. `13-risk-register.md`
15. `14-target-state-diagram.md` -- Original target-state diagram (possibly deprecated, see below)
16. `15-comprehensive-current-system-map.md` -- Full cross-referenced map of all current systems, verified against filesystem
17. `new-target-state-diagram.md` -- Revised target-state diagram with expanded layers (authored, derived, runtime, tooling), grounded in realization-pack findings

## Realization rules

- Do not implement broad restructuring directly from memory.
- Document repo truth first.
- Reconcile with existing backlog and prior plans before changing topology.
- Preserve public URL contracts unless a redirect plan is documented first.
- Preserve experiment runtime isolation unless there is a clear measured reason not to.
- Treat scaffolding, agent tooling, and docs as part of the architecture.
- Prefer native source models plus derived manifests over one universal authored mega-model.

## What this pack should answer

- What is the actual current architecture?
- What is already strong and should remain?
- What is duplicated, brittle, or misleading?
- What is canonical vs derived?
- What can move safely, and what must remain co-located?
- What must be migrated together so the system does not fragment further?
- Which parts of the detached prototype are worth salvaging?

## What this pack is not

This is not:

- a replacement for the backlog
- a speculative rewrite manifesto
- a duplicate of implementation code comments
- a second architecture track competing with T8

It is a decision-and-execution support layer for one clean-pass restructuring effort.

## Repo truths this pass starts from

- Experiments are isolated Next.js route groups with their own `<html>` and `<body>`.
- `experiment.json` is co-located inside each experiment route group and is the source of truth for experiment metadata.
- `status` and `listing` form the current publishing truth table.
- Fumadocs already powers registry docs and registry search.
- Articles still use a separate MDX pipeline built on `next-mdx-remote`, `gray-matter`, and `reading-time-estimator`.
- The registry install contract at `/r/:slug` is public and must remain stable.
- Content constellation docs already exist and are part of the real authoring system.
- The repo already has a substantial body of agent rules, Cursor rules, skills, and workflows tied to current paths.

## Current realization target

The clean pass should move the lab toward this shape:

- **Experiments remain apps**
  - isolated runtime sandboxes
  - strong per-experiment performance and CSS/JS containment
- **Content becomes more unified**
  - public authored content should converge on one MDX/data plane
- **Registry becomes more deterministic**
  - one coherent build path, fewer overlapping source-of-truth layers
- **Surface policy becomes shared**
  - feeds, llms, sitemap, `/dev`, and registry should derive from common logic
- **Public IA stays flexible**
  - the site can evolve into a broader portfolio shell without breaking the experiment platform underneath

## Relationship to existing planning work

This pack does not replace existing planning work. It explicitly reconciles with:

- `.agents/backlog/t8-architecture-restructuring.md`
- `.cursor/plans/architecture_restructuring_investigation_79b46e55.plan.md`
- the detached-worktree prototype pass
- the existing docs and agent knowledge base

The goal is to reduce fragmentation, not create another parallel plan stream.

## Current status

At the time this pack was created:

- the main checkout is on `main`
- a fresh clean worktree exists at `/Users/razisyed/.codex/worktrees/realization/experiments`
- that clean worktree is on `razi/architecture-realization`
- the detached worktree at `/Users/razisyed/.codex/worktrees/1f4c/experiments` is reference material only
- the clean-main baseline builds successfully after dependencies are installed

See `12-execution-board.md` for sequencing and current gates.
