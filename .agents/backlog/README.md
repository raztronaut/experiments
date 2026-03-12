# Backlog

Single source of truth for all pending work in the experiments lab. Organized by tier (roughly priority order). Each tier file has checkboxes for tracking.

**Maintain this, not `.cursor/plans/`.** Plan files are ephemeral -- they capture a session's intent. This backlog persists across sessions. When work completes, check it off here. When new work surfaces, add it here.

Last audited: 2026-03-11 (T8 added)

## Quick View

| Tier | File | Pending | Effort | Theme |
|------|------|---------|--------|-------|
| 1 | [t1-infrastructure.md](t1-infrastructure.md) | 5 | Mixed | Deploy workflow, CI, testing, coverage |
| 2 | [t2-content-registry.md](t2-content-registry.md) | 11 | Large | Articles, registry output review, curated collection, TOC, schema |
| 3 | [t3-agent-docs.md](t3-agent-docs.md) | 3 | Small | 1 remaining item + overview pass |
| 4 | [t4-announcing-v2.md](t4-announcing-v2.md) | 10 | Medium | Ship the first V2 experiment |
| 5 | [t5-toolkit-platform.md](t5-toolkit-platform.md) | 11 | Large | Toolkit adoption, MCP, scroll docs, porting skill, Entire.io |
| 6 | [t6-deferred.md](t6-deferred.md) | 5 | Varies | AGENTS.md deferred items |
| 7 | [t7-nice-to-have.md](t7-nice-to-have.md) | 10 | Low | Low-priority improvements, Tailwind v4 opportunities |
| 8 | [t8-architecture-restructuring.md](t8-architecture-restructuring.md) | 14 | Large | Unify MDX on Fumadocs, dynamic articles, pipeline consolidation, dead dep cleanup |
| -- | [completed.md](completed.md) | -- | -- | Archive of done work |

## Plans Attached

Backlog items that already have `.cursor/plans/` files. Check these before creating new plans to avoid duplication.

| Backlog Item | Tier | Plan File(s) | Status |
|---|---|---|---|
| Vercel Preview Deploy + Entire.io | T1+T5 | [consolidated](../../.cursor/plans/entire_io_and_deploy_workflow_consolidated.plan.md) (supersedes `entire.io_integration`, `preview_prod_deploy_workflow`, `vercel_deployment_workflow`) | Done -- v2/platform pushed, PR #3 open, Entire.io enabled |
| Curated Component Collection | T2 | [s-tier_collected_registry](../../.cursor/plans/s-tier_collected_registry_ca7692d5.plan.md), [collected_registry_+_quick_port_skill](../../.cursor/plans/collected_registry_+_quick_port_skill_4bd06c54.plan.md) | Future improvement |
| Agent-Native Audit Fixes | Cross | [agent-native_audit_fixes](../../.cursor/plans/agent-native_audit_fixes_9349af8c.plan.md) | Pending (todo 3a partially addressed by content rules) |
| Content Constellation Cursor Integration | Cross | [content_constellation_cursor_integration](../../.cursor/plans/content_constellation_cursor_integration_690d3f3e.plan.md) | Done -- 6 rules, 3 skills, 2 subagents |
| Architecture Restructuring | T8 | [architecture_restructuring_investigation](../../.cursor/plans/architecture_restructuring_investigation_79b46e55.plan.md) | Pending -- 4 phases (foundation, content unification, pipeline, tooling) |

**Completed plans** (archived in [completed.md](completed.md)):
Registry V2 (5 plans: `registry_interactive_docs`, `fumadocs_registry_v2`, `registry_fumadocs_audit_fix`, `registry_v2_fix_crash`, `registry_ui_pass`)

## How to Use

- **Starting a session**: Skim this README, then read the relevant tier file.
- **Finishing work**: Check off items (`[x]`), move fully-completed tier items to `completed.md` with a date.
- **New work discovered**: Add to the appropriate tier file. If it doesn't fit, create a new tier or add to T7.
- **Auditing**: Periodically run subagents against each tier to verify items are still current. Update the "Last audited" date.
- **Cross-cutting work**: Note dependencies between tiers inline (e.g., "Blocked by T1: Lighthouse CI").

## Provenance

Consolidated from 42 `.cursor/plans/` files and these chats:
- [P3/P4 pending items audit](b6f43f2e-d146-42dd-8757-b7bf7d7c73ef)
- [VFB testing and strategic plan](50c81de8-850f-4541-9d6d-90d6ad69e32e)
- [Announcing-V2 gap fixes](d2b9c0f2-d6f9-432d-8c3e-c68187e83fb6)
- [Agent docs restructuring](3b69efd3-246a-4e0c-85dc-0ccb600cc651)
- [Component registry](4924b037-3555-402a-aac8-9b88984b0d30)
- [Lighthouse CI](4a2597be-55d9-4da8-a544-e3b39207bb9d)
- [Lusion learnings](2d76c04c-856a-4e5d-baa8-29009d5e69e3)
- [Darkroom/Basement research](152608fd-216c-4d2e-b656-38ef8d482a25)
- [Vercel deploy best practices](CURRENT_SESSION) -- Vercel prod/preview model, branching strategy for v2 launch, GitHub branch protection
- [Registry interactive docs plan](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md) -- (done) Fumadocs-powered registry explorer, 7-phase build
- [Curated component collection plan](../../.cursor/plans/s-tier_collected_registry_ca7692d5.plan.md) -- (future) Personal component mood board with collection.json, CLI, web management UI, agent skill
- [Architecture restructuring investigation](CURRENT_SESSION) -- Dual-MDX unification, dead dep cleanup, pipeline consolidation, content-first architecture

Canonical plan file: `.cursor/plans/v2_pending_work_inventory_80c82495.plan.md` (superseded by this backlog).
