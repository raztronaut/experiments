---
name: Article components decomposition
overview: Change the article demo components pattern from a single monolithic `components.tsx` to a `components/` directory with one file per demo, then update all scaffolding, agent docs, skills, and rules to enforce this structure.
todos:
  - id: plop-template
    content: Replace components.tsx.hbs with components-index.ts.hbs, update plopfile.js action to scaffold components/index.ts
    status: completed
  - id: page-template
    content: Update page.tsx.hbs comment block to reference components/ directory pattern
    status: completed
  - id: content-constellation
    content: Update .agents/contexts/content-constellation.md file tree and technical patterns
    status: completed
  - id: content-writer
    content: Add component decomposition rules to .cursor/agents/content-writer.md
    status: completed
  - id: article-rule
    content: Update MDX wiring section in .cursor/rules/article-writing.mdc
    status: completed
  - id: publish-skill
    content: Update demo building step in .cursor/skills/publish-content/SKILL.md
    status: completed
  - id: publish-workflow
    content: Update demo step in .agents/workflows/publish-experiment.md
    status: completed
isProject: false
---

# Article Demo Components Decomposition

## Problem

Article `components.tsx` files grow monolithic fast. 3 of 4 existing articles exceed the 300-line hard limit (889, 547, 494 lines). All shared math, drawing utilities, and multiple demo components are crammed into one file. Nothing in the scaffolding, agent docs, or skills mentions decomposition.

## New Structure

Replace the single `components.tsx` with a `components/` directory:

```
article/
  page.tsx
  content.mdx
  components/
    index.ts          # barrel re-export (the page.tsx import path stays the same)
    utils.ts          # shared math/drawing helpers (optional, created as needed)
    DemoOne.tsx       # one file per demo, "use client"
    DemoTwo.tsx
    ...
```

**Why this works with zero page.tsx changes:** `import { ... } from "./components"` resolves to `./components/index.ts` when it's a directory. Existing wiring in `page.tsx` is fully backward-compatible.

## Changes

### 1. Plop templates

**Replace** `[plop-templates/article/components.tsx.hbs](plop-templates/article/components.tsx.hbs)` with a new file:

- `**plop-templates/article/components-index.ts.hbs`** -- barrel export file with progressive demo pattern guidance as comments (moved from the old template). Contains `// Export your demo components here` and the wiring instructions.

**Update** `[plopfile.js](plopfile.js)` (line ~257):

- Change the action from scaffolding `article/components.tsx` to `article/components/index.ts`, pointing at the new template.

**No changes to** `[scripts/delete-article.mjs](scripts/delete-article.mjs)` -- it already uses `fs.rmSync(articleDir, { recursive: true })`.

### 2. Page template

**Update** `[plop-templates/article/page.tsx.hbs](plop-templates/article/page.tsx.hbs)` (line ~21-28):

- Change the comment block to reference `./components/DemoName` pattern instead of `./components.tsx`.

### 3. Content constellation overview

**Update** `[.agents/contexts/content-constellation.md](.agents/contexts/content-constellation.md)`:

- File Locations section: change `components.tsx` to `components/` directory in the tree diagram
- Key Technical Patterns section: add a bullet about the decomposition rule (one demo per file, shared utils extracted, barrel export)

### 4. Content writer subagent

**Update** `[.cursor/agents/content-writer.md](.cursor/agents/content-writer.md)`:

- Add a "Component Size Discipline" section under Technical Constraints:
  - Demo components go in `article/components/DemoName.tsx` (one per file)
  - Shared utilities (math, drawing helpers) in `article/components/utils.ts`
  - Barrel export in `article/components/index.ts`
  - Each demo file is `"use client"` and imports from `./utils` as needed
  - Target 200 lines per file, hard limit 300

### 5. Article writing rule

**Update** `[.cursor/rules/article-writing.mdc](.cursor/rules/article-writing.mdc)`:

- MDX Wiring section: update step 1 from "Build in `article/components.tsx`" to "Build in `article/components/DemoName.tsx`, export from `article/components/index.ts`"
- Add decomposition guidance matching AGENTS.md's 200/300 line discipline

### 6. Publish content skill

**Update** `[.cursor/skills/publish-content/SKILL.md](.cursor/skills/publish-content/SKILL.md)`:

- Phase 2, step 8 ("Build demos"): update to mention creating individual files in `components/` directory rather than a single `components.tsx`

### 7. Publish experiment workflow

**Update** `[.agents/workflows/publish-experiment.md](.agents/workflows/publish-experiment.md)`:

- Step 7 ("Build demos in `components.tsx`"): update to reference `components/` directory pattern

### 8. Components template content

The new `components-index.ts.hbs` should contain:

```typescript
// Article demo components for {{titleCase name}}
//
// STRUCTURE:
// - One file per demo: ./DemoName.tsx ("use client", self-contained)
// - Shared utilities: ./utils.ts (math, drawing helpers)
// - Barrel export here: re-export all demos for page.tsx consumption
//
// WIRING:
// 1. Create demo in ./DemoName.tsx
// 2. Export from this file
// 3. Import in page.tsx: import { DemoName } from "./components"
// 4. Spread into MDXRemote components prop
// 5. Use in content.mdx: <InteractiveWidget><DemoName /></InteractiveWidget>
```

## Out of scope (follow-up)

Migrating the 3 existing oversized articles (hyperbolic: 889 lines, velocity: 547, 404: 494) to the new directory pattern. This plan sets up the infrastructure so new articles use the right structure from the start. The existing articles can be refactored one at a time later.