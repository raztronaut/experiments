# Worked Example: Agent Docs Gap Analysis

Source: transcript `152608fd` (March 2026). The first use of this orchestration pattern, done manually before the skill was formalized.

## The Task

A gap analysis of the `.agents/` documentation system, benchmarked against 4 reference repositories (darkroom.engineering, basement.studio, tambo-ai/tambo-landing, darkroomengineering/sf-website). The audit identified 30+ gaps across rules, skills, profiles, templates, and toolkit docs.

## Phase 1: Research (5 parallel agents)

The orchestrator launched 5 explore agents simultaneously:

| Agent | Target | Output |
|---|---|---|
| 1 | darkroom.engineering live site | Animation patterns, scroll architecture, RAF management |
| 2 | basement.studio repo | Shader library structure, R3F patterns, GLSL organization |
| 3 | tambo-ai/tambo-landing repo | Scroll-driven animation, GSAP integration, component structure |
| 4 | darkroomengineering/sf-website repo | Unified RAF system (Tempus), Lenis integration, toolkit patterns |
| 5 | Internal `.agents/` docs | Current state audit, cross-reference map, gap inventory |

## Phase 2: Decomposition (8 domains)

The flat severity-based gap list was reorganized into 8 self-contained domains:

| Domain | Name | Complexity | Files | Batch |
|---|---|---|---|---|
| 1 | Unified RAF & Timing | integration | 8 | 1 |
| 2 | Shader & GLSL System | integration | 6 | 1 |
| 3 | Animation & Scroll Patterns | integration | 5 | 1 |
| 4 | R3F & WebGL Ecosystem | integration | 7 | 1 |
| 5 | Creative Patterns (Portable Skill) | architecture | 4 (new) | 2 |
| 6 | Templates & Scaffolding | mechanical | 6 | 2 |
| 7 | Docs Housekeeping | mechanical | 5 | 2 |
| 8 | Overview Pass | -- | all | 3 |

**Key decomposition decisions:**

- Tempus-related fixes spanning awwwards skill, gsap-modern, templates, and toolkit were all grouped into Domain 1 (not scattered across severity categories)
- Domain 5 was an **aggregator domain** -- it took patterns from Domains 2-4 and packaged them into a new portable skill
- Domain 5 depended on Domains 2-4, so it was placed in Batch 2
- Domains 6 and 7 were mechanical -- in the automated system, they would use `model: "fast"`

## Sample Domain Brief

```markdown
## Domain 3: Animation & Scroll Patterns

**Scope**: All animation rules, scroll integration, and motion vocabulary docs.
**Complexity**: integration

### Context to Read First
- `.agents/rules/animations.md` -- current animation rules (main target)
- `.agents/rules/scroll.md` -- current scroll rules
- `.agents/skills/gsap-modern/SKILL.md` -- GSAP patterns
- `.agents/profiles/scrollytelling.md` -- scrollytelling profile

### Changes to Make
1. **`.agents/rules/animations.md`**: Add motion vocabulary catalog with 8+ named
   techniques (clipPath reveals, blur transitions, scale transforms, text splitting,
   parallax, horizontal scroll, counter-animations, stagger cascades)
2. **`.agents/rules/animations.md`**: Add CSS easing variables section with custom
   property definitions
3. **`.agents/rules/animations.md`**: Add Canvas2D noise buffer technique for
   non-WebGL grain overlays
4. **`.agents/rules/scroll.md`**: Add fromTo scroll interpolation pattern
5. **`.agents/rules/scroll.md`**: Document layer-cake architecture (DOM + WebGL)

### What NOT to Touch
- `.agents/rules/shaders.md` -- owned by Domain 2 (Shader & GLSL)
- `.agents/rules/r3f.md` -- owned by Domain 4 (R3F & WebGL)
- `.agents/skills/tempus-raf/SKILL.md` -- owned by Domain 1 (Unified RAF)
- `src/lib/toolkit/` -- owned by Domain 1

### Cross-Domain Notes
- Depends on: none
- Produces: CSS easing values that Domain 5 (Portable Skill) will reference
- Known interactions: Domain 5 should cross-reference the Canvas2D noise technique
```

## Phase 3: Execution

- **Batch 1**: Domains 1-4 (all independent, dispatched simultaneously)
- **Batch 2**: Domains 5-7 (Domain 5 depended on 2-4; Domains 6-7 independent)
- **Batch 3**: Domain 8 (overview pass, after all others)

All 7 domain agents completed with status DONE. No BLOCKED or NEEDS_CONTEXT.

## Sample Handoff Summary

```markdown
## Domain 3: Animation & Scroll Patterns -- Handoff Summary

**Status**: DONE

### Completed (plan items done)
- 1: Motion vocabulary catalog added -- `.agents/rules/animations.md`
- 2: CSS easing variables section added -- `.agents/rules/animations.md`
- 3: Canvas2D noise buffer technique added -- `.agents/rules/animations.md`
- 4: fromTo scroll interpolation pattern added -- `.agents/rules/scroll.md`
- 5: Layer-cake architecture documented -- `.agents/rules/scroll.md`

### Extra Discoveries
- animations.md had no cross-reference to the scrollytelling profile's decomposition
  pattern -- added a pointer to `.agents/profiles/scrollytelling.md`

### Extra Changes
- `.agents/rules/animations.md` -- added cross-ref to scrollytelling profile (minor)

### Intentional Skips
- (none)

### Judgment Calls
- Plan said "8+ named techniques" for motion vocabulary -- included 10 techniques
  because the reference repos had clear examples for all 10

### Cross-Domain Dependencies
- Domain 5 should: reference the Canvas2D noise buffer at animations.md line 186
- Domain 7 should: mark v2-updates-needed.md items 2A/2C as resolved

### Open Concerns
- (none)

### Files Touched
- `.agents/rules/animations.md` -- modified (3 new sections, 1 cross-ref)
- `.agents/rules/scroll.md` -- modified (2 new sections)

### Learnings
- Motion vocabulary catalogs work better as named patterns with one-line descriptions
  than as detailed implementation guides -- keep the catalog scannable, link to examples
```

## Phase 4: Overview Pass

The overview agent received all 7 handoff summaries and launched 4 verification agents:

**Verifier A (Cross-Domain Dependencies):**
- 14 dependencies flagged across all handoffs
- 7 verified, 5 broken, 1 partial, 1 not applicable

**Verifier B (Multi-Touch Files):**
- 5 files modified by multiple domains
- All clean merges -- no conflicts

**Verifier C (Consistency):**
- 3 naming conflicts found:
  - GLSL: `snoise2d`/`snoise3d` vs `snoise`/`snoise3` across two skill docs
  - Hooks: `useDeviceCapabilities` vs `useDeviceDetection` across two profiles
  - Geometry: `ScreenQuad` vs `planeGeometry` -- no guidance on when to use which

**Verifier D (Completeness + Quality):**
- Zero completeness gaps (all plan items accounted for)
- 3 minor prescriptive language issues ("must" where "recommended" fits)
- 3 content duplication issues between project-specific and portable skill docs

## Phase 5: Fixes Implemented

- 5 broken cross-domain dependencies fixed
- GLSL naming aligned to consistent convention
- Hook naming standardized
- CSS easing values aligned across docs
- ScreenQuad guidance added
- Shader code duplication reduced (699 to 482 lines)
- Prescriptive language softened in 3 locations

## Final Stats

| Metric | Count |
|---|---|
| Domains | 8 (7 parallel + 1 overview) |
| Files changed | 44 |
| Lines added | +4,662 |
| Lines removed | -494 |
| Agent doc files modified | 32 |
| New files created | 3 |
| Broken dependencies caught | 5 |
| Naming conflicts resolved | 3 |
| Completeness gaps | 0 |

## What Would Be Different With the Automated System

The original run was fully manual -- 7 "new agent" clicks, copy-pasted briefs, handoffs collected by hand. With the automated Task-based system:

| Aspect | Manual (original) | Automated (this skill) |
|---|---|---|
| Dispatch | Click "new agent" 7 times, paste briefs | Orchestrator sends 4+3 Task calls in 2 messages |
| Handoff collection | Copy-paste from each agent into temp file | Orchestrator reads handoff files from disk |
| Overview pass | Start new conversation, paste all handoffs | Orchestrator launches 4 verification Tasks |
| Status handling | Manual inspection of each conversation | Machine-readable DONE/BLOCKED/NEEDS_CONTEXT triage |
| Model optimization | Same model for all domains | `fast` for Domains 6-7, default for 1-5 |
| Gating | None -- proceeded on trust | Explicit gates verify briefs exist and handoffs complete |
| Knowledge capture | Ad hoc memory.md bullet | Structured Phase 6 with learnings extraction |
| Human involvement | ~15 manual steps across the pipeline | User starts the task, orchestrator handles the rest |
