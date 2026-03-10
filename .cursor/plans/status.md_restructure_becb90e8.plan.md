---
name: STATUS.md Restructure
overview: Radically simplify STATUS.md from 254 lines to ~50 lines as a pure bootstrap pointer document. Move the unique useful content into it, delete the stale historical tracking, and update the two context files (toolkit.md, architecture.md) that are the actual sources of truth.
todos:
  - id: simplify-status
    content: Rewrite STATUS.md as a ~50 line bootstrap document (current state, config activation model, constraints, known gaps, pointers to context files)
    status: completed
  - id: update-toolkit
    content: "Update toolkit.md: remove deprecated scroll refs, add window.__experimentMetrics + console.warn + eval pattern, update createUnifiedScroll docs"
    status: completed
  - id: update-architecture
    content: "Update architecture.md: add non-interactive scaffolding (new:experiment:auto), --yes flag on delete, wip filter note on generation scripts"
    status: completed
isProject: false
---

# STATUS.md Restructure

## What to Do

**Radically simplify STATUS.md** into a ~50 line bootstrap document. Remove all historical tracking, completed item lists, git history, and section-by-section breakdowns. These are changelog material that goes stale the moment you commit something new.

**Update toolkit.md and architecture.md** to reflect the changes we just made. These are the actual sources of truth that agents reference during work.

## STATUS.md: New Structure

Keep only what an agent needs on first read:

1. **What is this?** (2 lines) -- creative coding lab, AI-native, V2 platform
2. **Current state** (~10 lines) -- experiment count, what's working, what's WIP
3. **Architecture pointers** -- read `contexts/architecture.md` for structure, `contexts/toolkit.md` for libraries/tools
4. **How the config layers work** (~15 lines) -- the activation model (AGENTS.md always-on, rules path-conditioned, profiles experiment-type, skills on-demand, workflows task-specific). This is the one thing only STATUS.md explains.
5. **Constraints** (~5 lines) -- legacy experiments untouchable, Biome is permissive by design (agents enforce stricter rules), no cross-experiment imports
6. **Known gaps** (~5 lines) -- things that are explicitly deferred (MCP capture server, Lighthouse CI, TOC in ArticleLayout, content for 16 experiments)

**Remove entirely**:

- "What Was Done" sections 1-6 (90+ lines of stale historical narrative)
- "Completed P3 Items" table (40+ lines of done checkboxes)
- "Git History" section (stale, belongs in git log)
- "Verification Results" (stale, CI does this)
- "Automation & Scripts" table (duplicated in architecture.md)
- "Placeholders for P3" table (move the still-relevant items to "Known gaps")

## toolkit.md: Updates Needed

- Remove references to `createLenisScroll` / `destroyLenisScroll` / `destroyUnifiedScroll` (removed in Phase 1D)
- Update integration layer description: `createUnifiedScroll` now properly restores GSAP ticker on destroy
- Add `window.__experimentMetrics` to Dev Tools section
- Note that metrics use `console.warn` (not `console.log`) for MCP visibility
- Add the eval query pattern for agents

## architecture.md: Updates Needed

- Add non-interactive scaffolding path (`npm run new:experiment:auto`)
- Add `--yes` flag for `delete:experiment`
- Update Scripts section with `new:experiment:auto`
- Note that generation scripts filter out `status: "wip"` experiments

