# Completed Work

Archive of work that's been finished. Moved here from tier files when fully complete.

## 2025 -- V2 Platform Build

- [x] `new:experiment:auto` non-interactive scaffolding (in `package.json`)
- [x] `new:article:auto` non-interactive article scaffolding (`scripts/create-article.mjs`)
- [x] `CLAUDE.md` root pointer file
- [x] Toolkit layer fully built (`scroll.ts`, `raf.ts`, `r3f.tsx` with AdaptiveDpr, error boundaries, Tempus binding)
- [x] `generate-registry.mjs` shadcn-compatible registry generation
- [x] `announcing-v2` experiment architecture (14 files, all sections built, preloader, Lenis/GSAP unified scroll)
- [x] Platform activation fixes (scaffolding, destroy bug, autoRaf, deprecated exports, queryable metrics)
- [x] Platform foundational fixes (plop templates, scroll debug, anti-monolith, docs)
- [x] Audit remediation (filters, complexity, isPlaceholder, barrel rule, OG images)
- [x] Homepage "Writing" section wired up

## 2026-03-10 -- Agent Docs Gap Analysis (6 of 8 domains)

- [x] Domain 1: Unified RAF & Timing (Tempus-first in awwwards skill, gsap-modern, tempus-raf, r3f.tsx, plop templates)
- [x] Domain 2: Shader & GLSL System (shader-authoring.md, depthWrite fixes, GLSL utility library, onBeforeCompile)
- [x] Domain 3: Animation & Scroll Patterns (scrollytelling template fixes, animations.md expansion with 4 new sections)
- [x] Domain 4: R3F & WebGL Ecosystem (r3f-core.md: 8 new sections, r3f.md rules, r3f-scene.md profile, r3f.tsx enhancements, portable skill)
- [x] Domain 5: Creative WebGL Patterns portable skill (SKILL.md + glsl-library.md + advanced-patterns.md)
- [x] Domain 6: Templates & Scaffolding (route-layout font comment, develop-experiment toolkit section, mixed.md profile)

## 2026-03-10 -- Announcing-V2 Gap Remediation (partial)

- [x] Motion vocabulary diversity (distinct signatures per section: clipPath, mask scale, z-depth parallax, canvas grid hover, CRT glitch shader)
- [x] Tempus R3F binding (ExperimentCanvas tempus prop, TempusFrameDriver at priority 1)
- [x] Adaptive performance + error boundaries (AdaptiveDpr, AdaptiveEvents, CanvasErrorBoundary in ShowcaseSection)
- [x] 3D content upgraded (CRT Monitor GLTF model, custom shader, video texture swapping)
- [x] First toolkit consumer: announcing-v2 imports from `@/lib/toolkit/` (scroll + r3f)

## 2026-03-10 -- Domain 7 Housekeeping (partial)

- [x] AGENTS.md: motion vocabulary diversity warning (line 128)
- [x] AGENTS.md: visual-qa workflow mention (lines 222, 225)
- [x] toolkit.md: stale Lenis text fixed to reference createUnifiedScroll (line 19)
- [x] toolkit.md: DevToolsInjector production prop documented (lines 34, 37)
- [x] architecture.md: DevToolsInjector production prop description (line 28)
- [x] visual-qa skill synced with workflow version

## 2026-03-11 -- Inversa Section Port Debugging

- [x] Block count mismatch fix: removed extra "Final State" content block from `INVERSA_CONTENT.blocks` to restore original 4-block structure and correct all animation phase breakpoints
- [x] FOUC fix: set initial animation states (`gsap.set`) before `ScrollTrigger.create` for `position: fixed` mask, grid overlay, and markers -- prevents flash of "analysis phase" state while scrolling through preloader
- [x] Lenis timing fix: changed orchestrator `useEffect` to `useLayoutEffect` for `createUnifiedScroll`, per scroll rules canonical pattern
- [x] CSS cleanup: removed dead `:nth-child(5)` selector from `inversa-section.css`
- [x] Post-mortem docs propagation: updated porting skill (Phase 0 content-to-timing coupling, 3 new pitfalls), scrollytelling profile (fixed-position elements section + gotcha), transformations.md (`useLayoutEffect` fix), scroll rules (`useLayoutEffect` rationale), memory.md (2 new facts)

## 2026-03-11 -- Registry V2: Interactive Docs Explorer

- [x] Phase 1: Hybrid pipeline -- split monolithic `generate-registry.mjs` into auto-discover → `shadcn build` → post-process. Added `registry.config.json` for curation. Extended to discover shared UI, hooks, utilities.
- [x] Phase 2: Fumadocs setup -- `fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx` content source, shadcn CSS preset, dark theme.
- [x] Phase 3: Route structure -- `(registry)` route group with Fumadocs DocsLayout. Custom overview `page.tsx` (card grid) + Fumadocs `[[...slug]]/page.tsx` for doc pages.
- [x] Phase 4: MDX auto-generation -- script generates MDX doc pages from registry JSON per item (preview embed, install command, source code blocks).
- [x] Phase 5: Preview system -- iframe for experiments, code-only for hooks/utilities.
- [x] Phase 6: Custom components -- RegistryGrid, RegistryCard, RegistryMeta, RegistrySourceCode, InstallCommand.
- [x] Phase 7: Polish -- theme tuning, responsive QA, loading states, OG images.
- Plans: `registry_interactive_docs_aaa07efa`, `fumadocs_registry_v2_c44c07e3`, `registry_fumadocs_audit_fix_b10b5838`, `registry_v2_fix_crash_7c0b2691`, `registry_ui_pass_da5a051b`

## N/A -- Removed or No Longer Relevant

- ~~STATUS.md update~~ -- File never created. Status lives in `experiment.json` + generation scripts.
- ~~v2-updates-needed.md triage~~ -- File never created. Items folded into backlog.
- ~~running-findings.md status headers~~ -- File never created. Findings folded into backlog.
- ~~Magnetic button performance (announcing-v2)~~ -- Feature doesn't exist in codebase.
- ~~Horizontal scroll resize fix (announcing-v2)~~ -- Feature doesn't exist in codebase.
- ~~Memoize marquee data (announcing-v2)~~ -- Feature doesn't exist in codebase.
- ~~`game-of-life-shader` profile mismatch~~ -- Experiment is `legacy: true`, untouchable.
- ~~15/18 legacy layout metadata hardcoding~~ -- All are `legacy: true`, untouchable.

## Source Plans (Historical)

These `.cursor/plans/` files are fully completed and archived for reference:

| Plan | Status |
|------|--------|
| `v2_quality_gap_fix_3f158be2.plan.md` | All 7 done |
| `v2_completion_review_2706960c.plan.md` | All 10 done |
| `v2_platform_activation_794f9b31.plan.md` | All 8 done |
| `v2_platform_foundational_fixes_f4e5f2ac.plan.md` | All 14 done |
| `v2_audit_remediation_8fb38e3a.plan.md` | All 11 done |
| `announcing_v2_experiment_a05d48f2.plan.md` | All 14 done (ship checklist remains in T4) |
| `v2_platform_audit_8e657775.plan.md` | All done (surfaced broader gaps now in T1-T5) |
