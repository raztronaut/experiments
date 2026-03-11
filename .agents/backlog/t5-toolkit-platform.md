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

## Scroll Documentation

5 patterns from Darkroom/Basement research undocumented in `.agents/rules/scroll.md`:

- [ ] **rAF-compositor desync problem**
- [ ] **Two canvas positioning strategies** -- Only `position: fixed` documented. Add `position: sticky` + CSS scroll approach.
- [ ] **Shader-level DOM tracking** -- Pass DOM element positions as shader uniforms.
- [ ] **Canvas padding for scroll clipping**
- [ ] **Scroll velocity as a visual uniform** -- Feed Lenis velocity into shaders.
