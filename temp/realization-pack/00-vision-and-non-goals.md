# Vision And Non-Goals

## Product identity

This repo is no longer just an experiments site.

It is becoming a **portfolio operating system** with three simultaneous jobs:

1. **Public portfolio**
  - a high-end personal site for peers, clients, and thought leadership
  - curated, intentional, visually strong
  - not every internal artifact should be front-door visible
2. **Internal compounding engine**
  - every experiment, collected reference, reusable component, article, and workflow should make future work faster and better
  - the repo is both a showcase and a leverage machine
  - speed of iteration matters as much as public polish
3. **Selective publishing system**
  - visibility must be controllable
  - public, dev-only, registry-only, and not-yet-ready states all matter
  - promotion should be metadata-driven, not accidental

## Architectural principles for this pass

### 1. Experiments are apps

Experiments are isolated runtime sandboxes that may need:

- full DOM control
- forced theme decisions
- custom scroll systems
- WebGL / R3F / shader runtime isolation
- asset locality
- dev overlays and metrics
- aggressive performance containment

The current per-experiment route-group model is a strength, not a problem to flatten.

### 2. Content is content

Authored content should behave more like a unified content system than scattered special cases.

That does not mean every file must move immediately. It means:

- public authored content should converge on one coherent MDX/data plane
- discovery and surface eligibility should stop being hand-reimplemented in multiple places
- writing should not require bespoke route boilerplate forever

### 3. Source of truth should remain native per domain

This pass is not trying to force all things into one mega-model.

The preferred shape is:

- `experiment.json` remains canonical for experiments
- article frontmatter/content remains canonical for writing
- collected component metadata remains canonical for collected items
- registry outputs remain derived artifacts
- shared manifests unify surfaces, not authored source models

### 4. Public IA must stay flexible

The top-level public site should remain free to evolve:

- lab-first
- portfolio shell
- dual-surface
- more editorial
- more systems-oriented

That means public presentation should not be welded to accidental file placement decisions. It does **not** mean experiment metadata should leave the route groups where it currently belongs.

### 5. Agent and scaffolding systems are part of the product

This repo is intentionally agent-first.

Architecture work must account for:

- scaffolding generators
- `.agents/` rules and workflows
- `.cursor/` rules, skills, and subagents
- human docs
- verification flow for AI-assisted work

If those are not updated with the code, the architecture pass is incomplete.

## What this pass is trying to achieve

This pass is trying to produce a system that is:

- easier to reason about
- faster to extend
- safer to publish from
- clearer about what is canonical vs derived
- stronger for internal reuse
- better aligned with the actual product shape of the lab
- more durable for future agent workflows
- no weaker at runtime isolation than it is today

## What stays the same

These are currently good and should remain unless later investigation proves otherwise:

- isolated experiment route groups
- per-experiment `<html>` / `<body>`
- the three-location rule
- `experiment.json` co-located with the route group
- the `status × listing` metadata truth table
- the `legacy` flag and legacy caution policy
- the registry install contract at `/r/:slug`
- the collected-component idea and preview model
- the idea that the registry is serious but not necessarily the front door

## Non-goals

### Not a total rewrite

The goal is to improve structure while preserving real working value:

- public routes
- isolated experiments
- registry behavior
- content outputs
- scaffolded workflows
- existing publish mechanics where they are sound

### Not a flattening of experiment isolation

This pass is not trying to turn experiments into normal pages inside one shared shell.

It should not:

- remove per-experiment HTML isolation
- collapse all experiments into one runtime model
- make all experiments depend on shared app-state or global runtime assumptions

### Not a replacement of `status × listing`

This pass is not replacing the current metadata truth table with a weaker visibility model.

If new derived policy types are added, they should derive from the existing semantics, not overwrite them.

### Not a universal “everything is one entity” ontology

This pass is not trying to force experiments, articles, components, collected references, hooks, utilities, notes, and systems into one bloated authored type.

Unification should happen where it adds leverage, not where it increases abstraction cost.

### Not a legacy modernization sweep

The pass may:

- document the v2 vs legacy boundary more clearly
- define what modern patterns apply only to v2

It should not:

- mass-migrate legacy experiment layouts
- refactor legacy experiments just to make the architecture look cleaner
- break the frozen-archive contract without explicit intent

### Not a public IA lock-in

This pass is not deciding the final homepage/nav shape once and for all. It should create conditions for flexibility, not hard-code a single portfolio topology.

### Not implementation before investigation

No broad structural implementation should begin until the realization pack answers:

- what stays co-located
- what moves
- what becomes derived
- what remains canonical
- what public contracts must be preserved
- what from the prototype is worth salvaging
- what is actually causing any build/runtime anomalies

## Explicitly out of scope for the first clean pass

Unless later docs justify them, these are out of scope:

- changing the toolkit integration layer shape as a first move
- redesigning all public UI/IA at once
- introducing a package/workspace split immediately
- changing the install contract for registry items
- retrofitting every legacy experiment to v2 patterns
- inventing a new publishing model outside `status × listing`
- shipping a brand-new search architecture before content/runtime unification is settled

