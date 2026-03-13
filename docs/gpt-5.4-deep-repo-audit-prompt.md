# GPT-5.4 Deep Repo Audit Prompt

High-pressure, repo-specific mega-prompt for running a comprehensive structural audit in Codex Apps GPT-5.4.

Use this when the goal is not a narrow code review, but a full-system investigation of whether the repo still has the cleanest, fastest, most intelligent architecture for what it has become.

## What This Prompt Is For

This prompt treats the repo as a multi-surface product system:

- experiment runtime
- main site/app shell
- content and article system
- registry and docs system
- build and generation pipeline
- metadata, discoverability, and machine-readable surfaces

It is designed to force deep analysis of architecture, performance, maintainability, duplication, semantic drift, and future-state structure.

Expected output from the audit:

- executive summary
- evidence-backed findings with concrete file references
- root-cause analysis instead of symptom lists
- 3 to 5 prioritized follow-up slices
- verification strategy per slice
- a bold foundational future-state architecture section

## Copy-Paste Prompt

```text
You are Codex Apps GPT-5.4 running a deep, high-pressure repo audit.

This is not a standard code review. This is not a component-only review. This is not a “quick health check.”

Treat this repository as a multi-surface product system that has grown beyond its original shape. Your job is to investigate whether the current structure is still the fastest, cleanest, most intelligent, and best-organized architecture for what this repo has become.

You must be aggressive on architecture quality, but pragmatic about migration cost. You are explicitly allowed to challenge the current structure hard. You must distinguish between:
- fix now
- later
- only if scaling further

Your output must be roadmap-first, but grounded in deep findings and repo evidence.

You must assume that the repo may have drifted because multiple new systems were added after the initial birth stage of the app:
- registry and generated docs
- articles and MDX content
- metadata-driven surfaces
- generation and validation scripts
- machine-readable LLM-facing outputs
- dev dashboards and visibility systems

Do not give generic praise. Do not stop at “the build passes.” Do not limit analysis to React components.

## Core mission

Investigate the repo as comprehensively as possible and determine:
1. what the repo is structurally now
2. where architecture has drifted or fragmented
3. where performance, correctness, or maintainability risks are concentrated
4. whether the current boundaries still make sense
5. what a stronger foundational future-state architecture should be

## Mandatory review domains

You must analyze these domains separately before synthesizing them:

1. Experiment runtime
- isolated route groups
- per-experiment metadata
- experiment components and asset structure
- runtime and rendering patterns
- per-experiment performance and maintainability issues

2. Main site and app shell
- homepage
- shared UI
- shared hooks
- /dev dashboard
- feed, sitemap, robots, SEO, API surfaces

3. Content system
- article discovery
- MDX rendering
- frontmatter
- article routes
- markdown/LLM export routes

4. Registry system
- manifest generation
- per-item build pipeline
- generated docs
- search indexing
- registry docs runtime
- collected/component surface boundaries

5. Build and generation pipeline
- posters
- registry generation
- llms generation
- validation
- stale output cleanup
- build composition and failure surface

6. Cross-cutting concerns
- metadata source of truth
- environment gating
- caching
- file-size hotspots
- test depth
- duplication
- DX
- operational brittleness

## Start from repo truth

Do not assume architecture from docs alone. Ground yourself in the actual repo.

At minimum, inspect these files and paths:

- `src/lib/experiments.ts`
- `src/lib/articles.ts`
- `src/lib/env.ts`
- `scripts/generate-registry-json.mjs`
- `scripts/generate-registry-mdx.mjs`
- `scripts/generate-llms-txt.mjs`
- `scripts/build-registry.mjs`
- `scripts/post-process-registry.mjs`
- `scripts/validate-experiments.mjs`
- `src/app/(main)/page.tsx`
- `src/app/(main)/dev/page.tsx`
- `src/app/(registry)/registry/*`
- `src/app/api/*`
- `content/registry/*`
- `.source/*`
- `src/components/registry/*`
- `src/components/ui/*`
- `src/components/experiments/*`

You should also inspect config and repo-wide structure where relevant, including:

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `vitest.config.ts`
- `biome.jsonc`
- `docs/*` only after inspecting code

## Required non-mutating verification

Run and use the outputs from these commands as evidence:

- `npm run typecheck`
- `npm test -- --run`
- `npm run build`

If a command succeeds, do not stop there. Inspect what it reveals about the architecture.

Specifically check whether the build output exposes issues that the codebase currently tolerates, including warnings, oversized generated surfaces, hidden duplication, or artifact drift.

## Likely fault lines you must explicitly investigate

You must actively look for these, not passively mention them if convenient:

- duplicated metadata, listing, and status logic across runtime libs, dashboard code, and scripts
- generated-output architecture that is operationally correct but structurally fragmented
- script complexity concentration, especially oversized registry generators
- mismatch between repo growth and original app boundaries
- insufficient test coverage for the system breadth now present
- places where build success hides semantic drift or maintenance risk
- opportunities for a more intelligent design:
  - shared schema/source-of-truth layer
  - package boundaries
  - content/registry separation
  - typed manifests
  - codegen contracts
  - extension or ingestion model for new components/content
  - backend-assisted indexing, search, or content services

## Specific realities your audit should be able to confirm or reject with evidence

Your investigation must be deep enough to determine whether these are true in the current repo:

- the repo now spans app runtime, articles, registry docs, generated assets, and machine-readable content surfaces
- experiment/listing/status rules are duplicated in multiple places
- the registry pipeline is the largest structural hotspot
- the build passes but emits registry validation warnings
- tests are limited relative to system breadth
- some components or scripts exceed the repo’s stated size discipline
- the best future structure may require more than cleanup and could justify foundational re-architecture

## What to optimize for

Your job is not to preserve the current shape by default.

Your job is to determine the best structure for:
- clarity
- speed of development
- correctness
- performance
- mechanical sympathy with the current product surface area
- future extensibility without chaos

If the strongest answer involves proposing a new foundational system, say so clearly.

You are allowed to recommend:
- package splits
- a shared domain/schema layer
- a stronger metadata model
- generated-content contracts
- a registry ingestion system
- a backend or service layer
- search/indexing changes
- new extension points
- new repo topology

Only make those recommendations when justified by repo evidence and migration ROI.

## Forbidden shallow behavior

Do not do any of the following:

- generic “looks solid overall” summaries
- recommendations without file evidence
- limiting the review to React or UI only
- stopping at lint/type/build health
- vague cleanup advice with no implementation boundary
- listing symptoms without identifying root causes

## Output contract

Your output must use exactly this structure:

1. Executive summary
2. System map of the current app
3. Highest-severity findings first, with file evidence
4. Root-cause themes across the repo
5. Performance and build-risk analysis
6. Test and verification gaps
7. Foundational future-state architecture
8. 3 to 5 prioritized follow-up slices
9. Verification plan per slice
10. Open questions only if genuinely unblockable after inspection

## Quality bar for findings

Every major finding should include:
- why it matters
- the root cause
- the affected subsystem(s)
- concrete file references
- whether it is “fix now,” “later,” or “only if scaling further”

## Quality bar for the future-state architecture section

Do not give a fake-clean idealized rewrite. Give a serious target architecture that accounts for:
- migration cost
- what should remain in-place
- what should be centralized
- what should be separated
- what should become generated
- what should become typed and canonical
- what may deserve a new subsystem entirely

## Quality bar for follow-up slices

Each of the 3 to 5 follow-up slices should be implementation-shaped:
- clear scope boundary
- affected files or subsystem
- intended outcome
- main risks
- how to verify success

You are not implementing anything in this pass. You are producing the deepest, most structurally intelligent repo audit possible.
```

## Recommended Use

- Start a fresh chat.
- Use Plan Mode first if available.
- Let the agent explore before it proposes fixes.
- Treat the result as a structural decision document, not a casual review.

## Validation Checklist

The prompt is doing its job if the resulting audit surfaces most or all of these:

- the repo is now a multi-surface platform, not just an experiments app
- metadata and visibility rules are duplicated across code paths
- the registry pipeline is the heaviest architectural hotspot
- build output reveals tolerated warnings or drift signals
- the test surface is thin relative to repo breadth
- some files violate the intended decomposition discipline
- the final recommendations include both near-term fixes and a stronger future-state system design
