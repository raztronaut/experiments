---
name: Biome Ultracite Migration
overview: Migrate the entire project from ESLint to Biome via Ultracite (zero-config Biome preset). This replaces ESLint + eslint-config-next + eslint-plugin-storybook with Biome as the single linter/formatter, updates all tooling touchpoints (CI, lefthook, package.json scripts), converts eslint-disable comments to biome-ignore, and runs a full format pass.
todos:
  - id: ultracite-init
    content: Run npx ultracite init with --linter biome --pm npm --frameworks react next --editors cursor --integrations lefthook. Creates biome.jsonc, installs deps, sets up editor config.
    status: completed
  - id: adjust-biome-config
    content: "Review biome.jsonc: add file ignores (.next, out, build, public/registry), verify framework presets, add any project-specific overrides."
    status: completed
  - id: remove-eslint
    content: Delete eslint.config.mjs, uninstall eslint + eslint-config-next + eslint-plugin-storybook.
    status: completed
  - id: update-scripts-and-hooks
    content: Change package.json lint script to ultracite check, add fix script, update lefthook.yml to use ultracite fix with stage_fixed.
    status: completed
  - id: convert-eslint-comments
    content: Convert ~20 source files from eslint-disable to biome-ignore format. Remove comments where Biome doesn't flag the pattern.
    status: completed
  - id: format-pass
    content: Run npx ultracite fix to reformat entire codebase to Biome style.
    status: completed
  - id: verify-and-update-docs
    content: Run ultracite check, typecheck, build, tests, validate-experiments. Update toolkit.md and STATUS.md with migration notes.
    status: completed
isProject: false
---

# Migrate from ESLint to Biome via Ultracite

Replace the current ESLint setup with [Ultracite](https://docs.ultracite.ai) (Biome provider) -- a zero-config Biome preset with built-in Next.js + React framework presets, Cursor editor integration, and lefthook support.

## Why This Is the Right Move

- **Speed**: Biome is written in Rust. Linting + formatting in a single pass, orders of magnitude faster than ESLint + Prettier.
- **Single tool**: Replaces ESLint, Prettier, and their config ecosystem with one binary.
- **Zero config**: Ultracite provides `ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/next` presets -- covers everything `eslint-config-next` did.
- **Cursor-native**: Ultracite has built-in Cursor editor integration (`--editors cursor`).
- **Already planned**: The V2 plan (Section 7) listed Biome as a "consider" item. This makes it real.

## Current ESLint Surface Area

**Config files to remove**:

- `[eslint.config.mjs](eslint.config.mjs)` -- flat config with next/core-web-vitals, next/typescript, storybook plugin

**Packages to remove** (3 devDeps):

- `eslint` (^9)
- `eslint-config-next` (16.1.1)
- `eslint-plugin-storybook` (^10.1.10)

**Files referencing ESLint** (~20 source files with `eslint-disable` comments, plus CI and lefthook):

- `[lefthook.yml](lefthook.yml)` -- runs `npx eslint {staged_files}`
- `[.github/workflows/ci.yml](.github/workflows/ci.yml)` -- runs `npm run lint`
- `[package.json](package.json)` -- `"lint": "eslint"` script
- ~20 source files with `eslint-disable` / `eslint-disable-next-line` comments

**Storybook consideration**: `eslint-plugin-storybook` is currently installed for story file linting. Biome does not have an equivalent plugin, but the rules it enforced were mostly structural (story naming, meta exports). These are low-risk to lose -- Storybook's own build step catches structural issues.

---

## Step 1: Run Ultracite Init (Interactive)

Run the Ultracite initialization with explicit flags for our stack:

```bash
npx ultracite init --linter biome --pm npm --frameworks react next --editors cursor --integrations lefthook
```

This will:

- Install `ultracite` and `@biomejs/biome` as devDependencies
- Create `biome.jsonc` extending `ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/next`
- Create/merge `.vscode/settings.json` with Biome formatter settings
- Update `lefthook.yml` with `npx ultracite fix` (replaces our current ESLint command)
- Optionally set up Cursor rules

**Note**: If the interactive prompts conflict with our existing files, we handle manually in Step 2.

## Step 2: Manual Config Adjustments

After init, review and adjust `biome.jsonc`:

- Add file ignores for generated/third-party code:

```jsonc
  {
    "files": {
      "includes": ["!.next/**", "!out/**", "!build/**", "!public/registry/**"]
    }
  }
  

```

- Verify the `extends` array includes all three presets: `ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/next`

## Step 3: Remove ESLint

- Delete `[eslint.config.mjs](eslint.config.mjs)`
- Uninstall ESLint packages:

```bash
  npm uninstall eslint eslint-config-next eslint-plugin-storybook
  

```

## Step 4: Update Package Scripts

In `[package.json](package.json)`, change:

- `"lint": "eslint"` --> `"lint": "ultracite check"` (or `"check": "ultracite check"`)
- Add `"fix": "ultracite fix"` for auto-fix
- Keep `"typecheck": "tsc --noEmit"` as-is (Biome does not replace TypeScript type checking)

## Step 5: Update Lefthook

If Ultracite's init didn't fully replace the config, update `[lefthook.yml](lefthook.yml)`:

```yaml
pre-commit:
  parallel: true
  commands:
    lint-fix:
      run: npx ultracite fix {staged_files}
      stage_fixed: true
      glob: "*.{ts,tsx,js,mjs,json,css}"
    typecheck:
      run: npx tsc --noEmit
    validate-experiments:
      run: node scripts/validate-experiments.mjs
      glob: "**/experiment.json"
```

Key change: `npx eslint {staged_files}` becomes `npx ultracite fix {staged_files}` with `stage_fixed: true` so auto-fixed files get re-staged.

## Step 6: Update CI Workflow

`[.github/workflows/ci.yml](.github/workflows/ci.yml)` -- the `npm run lint` step already calls whatever `"lint"` is in package.json, so updating the script in Step 4 is sufficient. No CI file changes needed unless we want to rename the step label.

## Step 7: Convert eslint-disable Comments

Convert `eslint-disable` / `eslint-disable-next-line` comments in ~20 source files to Biome's `biome-ignore` format.

**ESLint format**: `// eslint-disable-next-line @typescript-eslint/no-require-imports`
**Biome format**: `// biome-ignore lint/style/useImportType: required for dynamic require`

For each file:

- Identify what the ESLint rule was suppressing
- Find the equivalent Biome rule (or determine if Biome doesn't flag it at all, in which case remove the comment)
- Replace with `biome-ignore lint/<category>/<rule>: <reason>`

Files to process (source only, excluding `public/registry/` which is generated):

- `[plopfile.js](plopfile.js)` (2 comments)
- `[src/setupTests.ts](src/setupTests.ts)` (2 comments)
- `[src/components/mdx/TableOfContents.tsx](src/components/mdx/TableOfContents.tsx)` (1)
- `[src/components/mdx/components.tsx](src/components/mdx/components.tsx)` (1)
- `[src/components/ui/ExperimentBackButton.tsx](src/components/ui/ExperimentBackButton.tsx)` (1)
- `[src/components/ui/AIWidget.tsx](src/components/ui/AIWidget.tsx)` (1)
- `[src/components/ui/wave-background.tsx](src/components/ui/wave-background.tsx)` (1)
- `[src/hooks/useMounted.ts](src/hooks/useMounted.ts)` (1)
- ~12 experiment component files (1 comment each)

## Step 8: Run Full Format + Fix Pass

```bash
npx ultracite fix
```

This will reformat the entire codebase to Biome's style. Expect whitespace, quote style, trailing comma, and import ordering changes across many files. This is a one-time bulk change.

## Step 9: Verify

- `npx ultracite check` -- zero errors
- `npm run typecheck` -- clean (unchanged)
- `npm run build` -- passes
- `npm run test -- --run --project unit` -- passes (tests don't depend on ESLint)
- `node scripts/validate-experiments.mjs` -- passes

## Step 10: Update Agent Config

- Update `[.agent/contexts/toolkit.md](.agent/contexts/toolkit.md)`: replace ESLint references with Biome/Ultracite
- Update `[.agent/STATUS.md](.agent/STATUS.md)`: note the migration
- The `writing-voice.md`, `publish-experiment.md`, and other agent docs don't reference ESLint directly so need no changes

---

## What We Lose (Low Risk)

- `**eslint-plugin-storybook**`: Structural story linting (meta exports, naming). Storybook's own builder catches these at build time. Low risk.
- `**eslint-config-next` specific rules**: Biome's `ultracite/biome/next` preset covers the Next.js-specific rules (no-img-element, no-html-link-for-pages, etc.). A few edge-case Next.js rules may not have Biome equivalents, but the coverage is strong.

## What We Gain

- Single `ultracite check` / `ultracite fix` replaces ESLint + potential Prettier
- Rust-speed linting (sub-second for the entire codebase)
- Built-in CSS/JSON linting (no separate tools)
- Cursor editor integration out of the box
- Maintained preset that stays current with Biome v2

