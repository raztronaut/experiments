---
name: Formalize mixed profile
overview: Fix phantom agency references (darkroom.engineering, basement.studio, tambo-ai/tambo-landing) with proper links and context, and formalize "mixed" as a first-class valid experiment profile across all validation, scaffolding, documentation, and template systems.
todos:
  - id: fix-agency-refs
    content: Fix phantom agency references in mixed.md (line 27) and scrollytelling.md (line 54) with full names, links to sites and GitHub repos
    status: completed
  - id: validation-scripts
    content: Add 'mixed' to VALID_PROFILES in validate-experiments.mjs, create-experiment.mjs (3 spots), and src/lib/experiments.ts (type + array)
    status: completed
  - id: plop-template
    content: "Create plop-templates/experiment/profiles/mixed/ with component.tsx.hbs (layer-cake: unified scroll + fixed Canvas + DOM sections) and route-page.tsx.hbs"
    status: completed
  - id: plopfile-update
    content: Add mixed choice to plopfile.js prompts, add to toolkit defaults, remove workaround comment
    status: completed
  - id: docs-update
    content: Update AGENTS.md, experiment-metadata.mdc, experiment-components.mdc, new-experiment.md, and develop-experiment.md with mixed profile
    status: completed
isProject: false
---

# Formalize Mixed Profile and Fix Agency References

## Part 1: Fix Agency References

The names "darkroom", "basement", and "tambo" in the profile docs refer to creative dev agencies/projects studied during the gap analysis (transcript `152608fd`). The 4 reference repositories were:

- **darkroom.engineering** -- dev-first creative studio, creators of Lenis, Tempus, Hamo, Satus. [Site](https://darkroom.engineering) / [GitHub](https://github.com/darkroomengineering)
- **basement.studio** -- creative dev studio (Vercel, Linear, Cursor clients), creators of `@bsmnt/scrollytelling`. [Site](https://basement.studio) / [GitHub](https://github.com/basementstudio)
- **tambo-ai/tambo-landing** -- landing page for Tambo (generative UI SDK by the darkroom team). [Site](https://tambo.darkroom.engineering) / [GitHub](https://github.com/tambo-ai/tambo-landing)
- **darkroomengineering/sf-website** -- Studio Freight website (darkroom's previous name). [GitHub](https://github.com/darkroomengineering/sf-website)

### Files to update with proper references:

**[.agents/profiles/mixed.md](.agents/profiles/mixed.md)** line 27:

- Current: `"Darkroom, basement, and tambo all use variations"`
- Fix: Add full names and links -- "[darkroom.engineering](https://darkroom.engineering), [basement.studio](https://basement.studio), and [tambo-ai/tambo-landing](https://github.com/tambo-ai/tambo-landing) all use variations"

**[.agents/profiles/scrollytelling.md](.agents/profiles/scrollytelling.md)** line 54:

- Current: `"Both darkroom and tambo do this."`
- Fix: Add full references -- "Both [darkroom.engineering](https://github.com/darkroomengineering/satus) and [tambo-ai/tambo-landing](https://github.com/tambo-ai/tambo-landing) do this."

---

## Part 2: Formalize `mixed` as a Valid Profile

9 files need `mixed` added to their profile enumerations. 1 new template directory needs creation.

### Validation (3 files)

1. **[scripts/validate-experiments.mjs](scripts/validate-experiments.mjs)** lines 17-25 -- add `"mixed"` to `VALID_PROFILES` array
2. **[scripts/create-experiment.mjs](scripts/create-experiment.mjs)** -- 3 locations:
  - Line 15: JSDoc comment -- add `mixed` to profile list
  - Lines 27-35: `VALID_PROFILES` array -- add `"mixed"`
  - Line 37: `TOOLKIT_DEFAULT_PROFILES` -- add `"mixed"` (mixed experiments always need toolkit for Lenis + GSAP + R3F coordination)
3. **[src/lib/experiments.ts](src/lib/experiments.ts)** -- 2 locations:
  - Lines 5-12: `ExperimentProfile` type union -- add `| "mixed"`
  - Lines 18-26: `VALID_PROFILES` runtime array -- add `"mixed"`

### Scaffolding (2 files + 1 new directory)

1. **[plopfile.js](plopfile.js)** -- 3 locations:
  - Lines 42-58: Add `{ name: "Mixed (scroll + 3D + interaction)", value: "mixed" }` choice, remove the comment on lines 56-57 that says to use scrollytelling as base
  - Lines 65-68: Add `"mixed"` to toolkit default array
  - (No change to `actions()` since it already resolves `plop-templates/experiment/profiles/${answers.profile}` dynamically)
2. **New directory: `plop-templates/experiment/profiles/mixed/`** -- Create two template files:
  - `component.tsx.hbs` -- Layer-cake template: `createUnifiedScroll` + fixed `Canvas` + scrolling DOM sections + Zustand store bridge. Based on the architecture in `mixed.md` (orchestrator + canvas layer + DOM layer).
  - `route-page.tsx.hbs` -- Same as scrollytelling's (simple import + render)

### Documentation (4 files)

1. **[AGENTS.md](AGENTS.md)** lines 20-22 -- add `mixed` to the `--profile` flag options:
  - `--profile (blank|r3f-scene|r3f-shader|scrollytelling|interaction|web-audio|dom-effect|mixed)`
2. **[.cursor/rules/experiment-metadata.mdc](.cursor/rules/experiment-metadata.mdc)** line 24 -- add `mixed` to profile enum list
3. **[.cursor/rules/experiment-components.mdc](.cursor/rules/experiment-components.mdc)** lines 38-42 -- add `mixed` profile guidance:
  - `mixed` -> scroll + 3D + interaction composition (read `.agents/profiles/mixed.md`)
4. **[.agents/workflows/new-experiment.md](.agents/workflows/new-experiment.md)** -- 2 locations:
  - Line 19: Add `mixed` to the `--profile` flag list and update toolkit default note
  - Line 28: Change the mixed guidance from "scaffold with scrollytelling as base, then manually compose" to "use `mixed` profile directly"

### Optional but recommended

1. **[.agents/workflows/develop-experiment.md](.agents/workflows/develop-experiment.md)** around lines 50-72 -- add a toolkit guidance block for mixed profile (combine scroll + R3F guidance with note about Zustand bridge)

---

## Mixed Template Design

The `plop-templates/experiment/profiles/mixed/component.tsx.hbs` template should combine patterns from scrollytelling and r3f-scene:

- `createUnifiedScroll()` lifecycle (from scrollytelling template)
- Fixed `Canvas` / `ExperimentCanvas` layer at z-index 0 (from r3f-scene template + mixed.md layer-cake)
- Scrolling DOM layer at z-index 1 with section data
- A `useRef` for scroll progress passed to R3F via ref (not React state)
- `useFrame` in the scene reading `scrollProgress.current`
- Proper cleanup of both scroll and R3F systems
- Leva controls gated behind `includeLeva`
- Toolkit vs non-toolkit variants gated behind `includeToolkit`

