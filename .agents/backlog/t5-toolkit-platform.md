# T5: Toolkit Adoption & Platform

The toolkit layer (`src/lib/toolkit/`) is built and has its first real consumer (see `completed.md`). This tier covers broader adoption and platform-level tools.

Audit date: 2026-03-10

## Toolkit Adoption

- [ ] **Selective legacy upgrades** -- Only 2 experiments import from `@/lib/toolkit/`. Target 3-5 best legacy experiments that already use Lenis or GSAP ScrollTrigger.
- [ ] **Profile-template toolkit coupling** -- Profiles describe what toolkit to use but templates don't auto-wire those imports during scaffolding.

## Platform Tools

- [ ] **MCP Capture Server** -- `scripts/capture.mjs` is still a plain CLI script (Playwright + process.argv). Upgrade to native MCP tool for agent integration. Includes:
  - Automated video capture via Playwright `page.video()` (currently screenshots only)
  - VFB testing guide validation (6 systematic tests exist but were never executed)
- [ ] **Layout Migration Script** -- Script to migrate Gen1 layouts to Gen3 format. Needed for selective legacy upgrades.
- [ ] **Porting skill Phase 11: Registry Registration** -- Once the registry ships (T2), extend `.agents/skills/porting-demos/SKILL.md` with a Phase 11 that prompts to register completed ports, auto-runs `npm run generate:registry`, suggests extracting reusable sub-components as standalone registry items, and updates `registry.config.json`. The porting skill's Phase 1 "Component" source type should flow directly into registry registration rather than full experiment scaffolding.
  - Depends on: T2 Registry V2
  - Source: [Registry interactive docs plan -- "Adjacent Notes"](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md)

## Agent Session Capture

- [ ] **Entire.io integration** -- Install [Entire CLI](https://docs.entire.io/introduction) (`brew install entireio/tap/entire`) and `entire enable` in the repo. Captures full agent session context (transcripts, token usage, line attribution, file changes) as Git-native checkpoints on every commit. Permanent metadata lives on `entire/checkpoints/v1` branch, no noise on working branches. Supports Cursor via Claude Code integration. Enables `entire explain` to understand how code was written, PR-level session review, and token usage tracking across sessions. Low effort -- two commands to set up, zero workflow change after that.
  - Docs: https://docs.entire.io
  - Quickstart: `brew install entireio/tap/entire && entire enable`
  - Replaces: manual agent transcript management in `.cursor/projects/*/agent-transcripts/`

## Scroll Documentation

5 patterns from Darkroom/Basement research undocumented in `.agents/rules/scroll.md`:

- [ ] **rAF-compositor desync problem**
- [ ] **Two canvas positioning strategies** -- Only `position: fixed` documented. Add `position: sticky` + CSS scroll approach.
- [ ] **Shader-level DOM tracking** -- Pass DOM element positions as shader uniforms.
- [ ] **Canvas padding for scroll clipping**
- [ ] **Scroll velocity as a visual uniform** -- Feed Lenis velocity into shaders.
