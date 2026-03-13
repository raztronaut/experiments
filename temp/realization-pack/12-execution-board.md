# Execution Board

This is the canonical implementation tracker for the clean-pass restructuring effort.

## Gates

### Gate 0 — Investigation complete

Do not begin broad structural implementation until:

- [ ] `docs/realization/` pack is complete enough to steer the pass
- [ ] prototype salvage decisions are explicit
- [ ] public contracts are documented
- [ ] content and MDX migration scope is decided
- [ ] scaffolding and agent-tooling dependency map is complete
- [ ] generated artifact ownership is documented
- [ ] clean-main verification baseline is recorded

### Gate 1 — Foundation safe

Before path migration or registry/runtime restructuring:

- [ ] worktree/branch workflow is documented and verified
- [ ] low-risk hygiene fixes are identified
- [ ] any baseline dependency removals are validated against shipped consumers

### Gate 2 — Content migration ready

Before moving article/public content paths:

- [ ] public article target topology is final
- [ ] shared article runtime shape is agreed
- [ ] article demo registration approach is defined
- [ ] feed / sitemap / llms implications are documented
- [ ] scaffolding and agent updates are queued in the same phase
- [ ] article CSS / typography migration plan is explicit

### Gate 3 — Registry consolidation ready

Before changing registry pipeline topology:

- [ ] registry canonical outputs are classified
- [ ] install contract preservation strategy is written
- [ ] grid/index fate is decided
- [ ] token-source strategy is chosen
- [ ] registry warning triage is understood enough not to mask regressions

## Migration smoke-test targets

Use these as first validation targets:

- `basketball-replay-center`
- `404-not-found`

They are the best smoke targets because they already have complete content constellations and non-trivial article behavior.

## Sequenced execution slices

| Phase | Slice | Goal | Depends on | Exit criteria |
|---|---|---|---|---|
| 0 | Clean restart | Use fresh worktree + branch, freeze prototype as reference | None | Safe worktree flow verified |
| 1 | Investigation pack | Build the realization docs and reconcile plans | 0 | Gate 0 satisfied |
| 2 | Foundation hardening | Low-risk hygiene and correctness fixes | 1 | Foundation changes validated without topology change |
| 3 | Derived experiment/article surface manifest | Centralize duplicated experiment/article eligibility logic | 1, 2 | Shared derivation replaces ad hoc rediscovery for agreed consumers |
| 4 | Public article migration | Move public articles to unified content plane | 1, 2, 3 | Shared article runtime working, URLs preserved via redirects if needed |
| 5 | Registry pipeline consolidation | Reduce build fragmentation and clarify canonical outputs | 1, 2 | Registry contract still works, generated artifacts classified and cleaned |
| 6 | Scaffolding + agent ecosystem alignment | Move generators/docs/agent rules with new topology | 4, 5 | New scaffolds and agent docs match final file structure |
| 7 | Verification architecture | Encode final fast/full verification model | 2, 3, 4, 5, 6 | CI/local verification paths align and are trustworthy |

## Recommended first implementation order

1. complete the realization pack
2. produce the prototype salvage matrix
3. apply low-risk baseline fixes only
4. implement the derived experiment/article surface manifest
5. migrate public articles to the unified content plane
6. consolidate the registry pipeline
7. update scaffolding, `.agents`, `.cursor`, and docs in the same migration window
8. finalize the verification model

## Prototype salvage checklist

- [ ] identify detached-worktree changes worth keeping
- [ ] identify prototype-only abstractions to discard
- [ ] identify prototype regressions not present on clean main
- [ ] port only validated ideas to the clean worktree branch

## Critical blockers

These block broad implementation if unresolved:

- no clear article target topology
- no public-contract preservation plan
- no scaffolding/agent migration map
- no decision on registry grid/index status
- no verified clean-main baseline

## Current status

### Completed

- [x] fresh clean worktree created from `main`
- [x] named branch created: `razi/architecture-realization`
- [x] clean-main dependency install completed
- [x] clean-main full production build verified
- [x] realization pack creation started

### In progress

- [ ] finish all realization docs
- [ ] finalize salvage matrix from prototype worktree
- [ ] define exact article migration boundaries
- [ ] define registry canonical-output decisions

### Not started

- [ ] code-path restructuring on the clean branch
- [ ] scaffolding migration
- [ ] `.agents` / `.cursor` migration
- [ ] final verification command design

## Success criteria for the full pass

- the repo has a documented and verified clean architecture direction
- experiments remain isolated
- public article content is on a more coherent content plane
- duplicated experiment/article surface logic is reduced through derivation
- registry build and docs/search contract are more deterministic
- scaffolding and agent tooling match the final file topology
- public URL contracts are preserved or redirected deliberately
- clean-main quality is maintained or improved
