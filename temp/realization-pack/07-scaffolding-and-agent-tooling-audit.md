# Scaffolding And Agent Tooling Audit

## Why this matters

In this repo, scaffolding and agent tooling are not afterthoughts. They are part of the actual development system.

Any path or topology change that updates runtime code but leaves these behind is an incomplete migration.

## Scaffolding surfaces

| Surface | Current location | Current assumption |
|---|---|---|
| Experiment scaffolder | `plopfile.js`, `scripts/create-experiment.mjs`, `plop-templates/experiment/` | `experiment.json` and experiment route files live inside `src/app/experiments/(slug)/` |
| Article scaffolder | `scripts/create-article.mjs`, `plop-templates/article/` | article content lives under `src/app/experiments/(slug)/slug/article/` and internal docs live under `docs/` inside the experiment |
| Collected scaffolder | `scripts/create-collected.mjs`, `plop-templates/collected/` | collected items live in `src/components/collected/<slug>/` with local metadata |

## `.agents/` surfaces that depend on current paths

### High-path-sensitivity docs

- `.agents/contexts/content-constellation.md`
- `.agents/workflows/publish-experiment.md`
- `.agents/workflows/new-experiment.md`
- `.agents/workflows/develop-experiment.md`
- `.agents/rules/experiments.md`

### Why they are sensitive

They explicitly mention:

- `article/content.mdx`
- experiment route-group structure
- the three-location rule
- content constellation docs inside experiment directories

Any public article path move must update these in the same pass.

## `.cursor/` surfaces that depend on current paths

### Rules

- `.cursor/rules/article-writing.mdc`
- `.cursor/rules/content-docs.mdc`
- `.cursor/rules/experiment-metadata.mdc`
- `.cursor/rules/generation-scripts.mdc`
- `.cursor/rules/registry-curation.mdc`

### Skills and agents

- `.cursor/skills/publish-content/SKILL.md`
- `.cursor/skills/audit-content/SKILL.md`
- `.cursor/agents/content-writer.md`
- `.cursor/agents/content-auditor.md`

### Why they are sensitive

They are tied to:

- current article file locations
- docs file locations
- existing publish workflow assumptions
- content constellation terminology

## Human docs that assume current paths

At minimum, these docs must be updated if article topology changes:

- `docs/content-system.md`
- `docs/scripts.md`
- `docs/architecture.md`
- `docs/README.md`
- `docs/ai-development.md`

Likely also:

- `docs/getting-started.md`
- `docs/contributing.md`
- `docs/experiments.md`
- `docs/registry.md`

## Migration rule

No path migration should be considered complete until all four layers are updated together:

1. runtime code
2. scaffolding
3. agent tooling
4. human docs

## Recommended sequencing

### Before moving article paths

- document all path-sensitive tooling
- decide the exact target article path convention
- define the replacement scaffolding behavior

### During the migration pass

- update runtime readers/renderers
- update article scaffolder/templates
- update `.agents/` docs and workflows
- update `.cursor/` rules/skills/agents
- update human docs

### After the migration

- test that a newly scaffolded article follows the final topology
- test that agent-facing docs no longer point to old paths

## Decision

The clean pass should treat scaffolding and agent-tooling updates as a required sibling of content migration, not a later cleanup phase.
