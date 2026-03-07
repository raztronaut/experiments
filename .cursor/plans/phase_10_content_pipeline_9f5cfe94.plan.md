---
name: Phase 10 Content Pipeline
overview: "Execute Phase 10 of the V2 audit remediation -- the final remaining phase. Four sub-tasks: implement `publishable` field properly, make `new:article` symmetrical with `delete:article`, extend validator docs cross-checks, and add already-exists guard to article scaffold."
todos:
  - id: 10a-publishable-field
    content: "Implement publishable field: backfill send-button, add to plopfile template, add validator warnings, fix architecture.md description, add publish-experiment.md note"
    status: completed
  - id: 10b-article-scaffold-autoupdate
    content: Add custom plop action to article generator that merges content.article:true into experiment.json on scaffold
    status: completed
  - id: 10c-validator-docs-crosscheck
    content: Extend validator to cross-check all 5 docs content flags (labNote, architecture, snippet, social, changelog) against files on disk
    status: completed
  - id: 10d-article-exists-guard
    content: Add fs.existsSync check for article/page.tsx in article generator validate function to prevent overwrite
    status: completed
  - id: verify-and-update-status
    content: Run validator + typecheck, update plan todo to completed, update STATUS.md and running-findings.md
    status: completed
isProject: false
---

# Phase 10: Content Pipeline Fixes

All prior phases (1-9) are confirmed complete. Phase 10 is the sole remaining work item in the `v2_audit_remediation` plan. Four sub-tasks, touching 5 files.

---

## 10A: Implement `publishable` Field Properly

The `publishable` field exists in the TS interface (`src/lib/experiments.ts` line 28: `publishable?: boolean`) and is set on `basketball-replay-center`, but is otherwise unimplemented. It should mean "quality-reviewed, ready for public" -- the **output** of the publish workflow, not a prerequisite.

**Changes:**

- **[src/app/experiments/(send-button)/experiment.json](src/app/experiments/(send-button)/experiment.json):** Add `"publishable": true` (has a real published article, same as basketball-replay-center)
- **[plopfile.js](plopfile.js) line ~96:** Add `"publishable": false` to the experiment.json template object (after `poster`), so new experiments scaffold with it explicitly:

```js
poster: "/experiments/{{dashCase name}}/poster.jpg",
publishable: false,  // <-- new
```

- **[scripts/validate-experiments.mjs](scripts/validate-experiments.mjs):** Add two consistency warnings after the existing content.article cross-check block (after line 166):
  - If `publishable === true` but `content?.article !== true` --> warn "publishable is true but no content.article"
  - If `content?.article === true` AND all 5 docs flags are true AND `publishable !== true` --> warn "full content constellation exists but publishable not set (run publish workflow finalization?)"
- **[.agent/contexts/architecture.md](/.agent/contexts/architecture.md) line 60:** Replace the `publishable` description from `"Ready for article generation (Section 5)"` to `"Quality-reviewed, ready for public. Set at END of publish workflow (step 17). Different from content.article which only tracks file existence."`
- **[.agent/workflows/publish-experiment.md](/.agent/workflows/publish-experiment.md) line 9-14 (Prerequisites):** Add note: `"Note: publishable: true is the OUTPUT of this workflow (set in step 17), not an input gate."`

---

## 10B: Auto-update experiment.json on Article Scaffold

Currently `npm run new:article` creates 8 files but doesn't touch experiment.json. The `delete:article` script (Phase 2) **does** update it. Make them symmetrical.

**Change in [plopfile.js](plopfile.js):**

Add a custom Plop action at the end of the article generator's actions array (after the 8 `type: "add"` file actions, around line 200). The action should:

1. Read `experiment.json` from the route group directory
2. Parse the JSON
3. Merge `{ "article": true }` into the existing `content` object (or create it if absent)
4. Write it back with `JSON.stringify(data, null, 2) + "\n"`

Pattern to follow (mirrors [scripts/delete-article.mjs](scripts/delete-article.mjs) lines 94-113):

```js
{
  type: "modify",
  path: `src/app/experiments/(${slug})/experiment.json`,
  transform(content) {
    const data = JSON.parse(content);
    data.content = { ...data.content, article: true };
    return JSON.stringify(data, null, 2) + "\n";
  },
}
```

Note: Plop's `type: "modify"` with a `transform` function is the cleanest approach -- it reads the file, runs the transform, and writes it back. No need for a custom action function.

Only `article: true` is set, not the 5 docs flags. The docs templates are empty scaffolds -- their flags should only be set to `true` when actual content is written (step 17 of the publish workflow). This matches the semantic distinction: `content.article = true` means "the article route infrastructure exists on disk."

---

## 10C: Extend Validator to Cross-check All Content Flags

The validator currently only cross-checks `content.article` vs `article/content.mdx` (lines 134-166). Add the same warn-not-fail pattern for all 5 docs flags.

**Change in [scripts/validate-experiments.mjs](scripts/validate-experiments.mjs):**

Inside the existing `if (config.slug)` block (starting at line 135), after the article cross-check loop, add cross-checks for the 5 docs flags. Use a mapping array to avoid repetition:

```js
const docsMapping = [
  { flag: "labNote", file: "docs/lab-note.md" },
  { flag: "architecture", file: "docs/architecture.md" },
  { flag: "snippet", file: "docs/snippet.md" },
  { flag: "social", file: "docs/social.md" },
  { flag: "changelog", file: "docs/changelog.md" },
];
```

For each entry, check if the file exists on disk vs. whether `config.content?.[flag] === true`, and warn on mismatches in both directions (same pattern as the article check).

The cross-check should happen inside the same `for (const slugDir of slugDirs)` loop that currently handles the article check, since docs/ lives alongside article/ under the slug directory.

---

## 10D: Add "Already Exists" Guard to Article Scaffold

Prevent `npm run new:article` from silently overwriting an existing article.

**Change in [plopfile.js](plopfile.js) lines 134-146 (article generator validate function):**

After the existing check for the route group directory (line 141-143), add a second `fs.existsSync` check:

```js
const articlePath = path.join(routeDir, slug, "article", "page.tsx");
if (fs.existsSync(articlePath)) {
  return `Article already exists for "${slug}". Delete it first with 'npm run delete:article ${slug}'.`;
}
```

This uses `article/page.tsx` as the sentinel file (the most important article file -- if it exists, the article infrastructure is in place).

---

## Post-Execution

After all changes:

- Run `node scripts/validate-experiments.mjs` to confirm 18 experiments valid with no unexpected warnings
- Run `npm run typecheck` to confirm clean
- Update the `content-pipeline-fixes` todo in the plan to `completed`
- Update [.agent/STATUS.md](/.agent/STATUS.md) Phase 10 row from "Pending" to "Done"
- Update [.agent/running-findings.md](/.agent/running-findings.md) with a Phase 10 section documenting changes
- Update the original plan documenting changes/todos

