# Existing Plan Reconciliation

This document reconciles four planning streams:

1. `.agents/backlog/t8-architecture-restructuring.md`
2. `.cursor/plans/architecture_restructuring_investigation_79b46e55.plan.md`
3. the detached-worktree prototype pass
4. this realization-pack direction

The goal is to prevent architecture work from splitting into competing narratives.

## Reconciliation summary

| Major idea | Existing source | Realization decision | Notes |
|---|---|---|---|
| “Content is content, experiments are apps” | T8 backlog + T8 plan | **Adopt** | This is the right north star and matches repo intent. |
| Keep per-experiment `<html>/<body>` isolation | Existing architecture docs and runtime | **Adopt** | Isolation is a feature, not accidental duplication. |
| Keep `experiment.json` in route groups | Existing runtime | **Adopt with changes** | Keep as canonical experiment metadata; add derived manifests instead of relocating source files. |
| Preserve `status × listing` truth table | Existing metadata system | **Adopt** | Do not replace with a weaker linear visibility model. |
| Converge articles onto Fumadocs | T8 Phase B | **Adopt** | This remains the main content-system migration target. |
| Move all authored content wholesale out of experiment route groups | Prototype / broader architectural vision | **Adopt with changes** | Public articles should move first; internal constellation docs may remain co-located short-term if that lowers migration risk. |
| Universal authored `WorkEntry` source model for all domain types | Detached prototype concept | **Reject** | Too abstract for current repo reality. Use native source models plus derived surface manifests. |
| Derived experiment/article surface manifest | Detached prototype concept + audit findings | **Adopt with changes** | Valuable, but only for experiments + articles, not for all domain types. |
| Registry pipeline consolidation | T8 Phase C | **Adopt** | Still the clearest path to reducing build fragmentation. |
| Remove `@fumadocs/story` | T8 Phase A | **Adopt** | Still warranted if repo truth confirms no meaningful shipped consumer. |
| CSS token extraction from real shared CSS | T8 Phase A | **Adopt** | Better than hardcoded style constants in registry generation. |
| Shared v2 experiment layout/runtime helper | Detached prototype concept | **Adopt with changes** | Useful for v2-only standardization, but not as a full flattening of experiment layouts. |
| Backstage-but-reachable registry positioning | Product vision from realization plan | **Adopt** | Matches the current intent of the hidden-but-serious registry surface. |
| One canonical verification command | Detached prototype concept + audit findings | **Adopt with changes** | Good idea, but likely as `verify:fast` / `verify:full`, not one opaque monolith only. |
| Immediate registry grid/index deletion | Possible simplification angle | **Defer** | First decide whether grid/index is dead, internal, or future-lightweight surface. |
| Package/workspace split | Broader architectural idea | **Defer** | Too early before content/runtime/build seams are stabilized. |
| Legacy-wide modernization sweep | General cleanup temptation | **Reject** | Legacy archive should remain frozen unless explicitly promoted. |

## Detached prototype salvage matrix

### Salvage

- the product framing around a “portfolio operating system”
- the emphasis on a backstage-but-reachable registry
- the insistence that scaffolding, docs, and agent tooling are part of the architecture
- the push for a shared experiment/article surface derivation layer
- the fix for the shell theme-reset bug
- the direct fix for confirmed cross-experiment asset coupling
- the reduction of registry warning noise and story-file leakage

### Salvage with changes

- shared v2 experiment layout helpers
  - keep only for v2-safe concerns
  - do not flatten intentional per-experiment differences
- derived catalog manifests
  - use for experiments + articles only
  - do not become universal authored models
- owned build contract
  - good direction
  - but shape it around clean-main repo truth, not the prototype’s new abstractions

### Discard

- replacing `status × listing` with a weaker linear visibility ladder
- moving `experiment.json` out of route groups
- treating the repo as if Fumadocs was merely an aspirational addition
- assuming the prototype’s build behavior represented clean-main reality

## T8 phase mapping to execution-board slices

| T8 phase | Meaning | Execution-board slices |
|---|---|---|
| Phase A | Foundation / no user-visible changes | Slices 0, 1, 2 |
| Phase B | Content unification | Slices 3, 4 |
| Phase C | Pipeline consolidation | Slice 5 |
| Phase D | Tooling updates | Slice 6 |

Verification architecture spans the whole pass and is represented as Slice 7.

## T1-T7 backlog interaction

| Tier | Interaction with realization work |
|---|---|
| T1 infrastructure | Strong overlap with verification architecture, CI cleanup, and build reproducibility |
| T2 content/registry | Strong overlap; article backlog and curated collection depend on content and registry topology decisions |
| T3 agent docs | Direct overlap because `.agents/` and `.cursor/` guidance must move with path changes |
| T4 announcing-v2 | Medium overlap; avoid sequencing conflicts while shipping the first v2 experiment |
| T5 toolkit/platform | Medium overlap; preserve toolkit/runtime strengths while content/build systems move |
| T6 deferred | Some foundation-hygiene items may be worth pulling forward |
| T7 nice-to-have | Lower priority; avoid letting optional cleanup expand the scope |

## Deferred but important future goal

Keep **search unification** visible as a future goal:

- extend registry/Fumadocs search to public articles
- or create a unified search route that includes both docs and article content

It is worth documenting now even if not first-move scope.

## Clean-pass interpretation of T8

T8 remains the best concrete restructuring backbone, but it needs to be widened slightly so it covers:

- worktree/branch safety
- public contract preservation
- scaffolding and agent-tooling updates
- content constellation coexistence rules
- structured-data and feed migration risk
- explicit registry topology decisions
- verification architecture

## Decision

The next implementation pass should be interpreted as:

- **T8 as the core restructuring roadmap**
- **realization pack as the steering and contract layer**
- **detached prototype as reference material only**

That means the clean pass is not starting from zero, but it is also not inheriting the prototype wholesale.
