---
name: Pending Items Inventory
overview: Comprehensive inventory of all pending P3/P4 items, deferred features, and unrealized V2 vision across the experiments platform -- covering infrastructure, content, code quality, toolkits, and agent architecture.
todos:
  - id: infra-quick
    content: "Quick infrastructure wins: test coverage reporting, Cursor.tsx perf bug, stale plan cleanup"
    status: pending
  - id: infra-medium
    content: "Medium infrastructure: Lighthouse CI, MCP capture server, E2E tests"
    status: pending
  - id: content-pipeline
    content: "Content pipeline: articles for 16 experiments, unused schema fields, content dashboard, homepage writing section, TOC, social assets"
    status: pending
  - id: architecture
    content: "Architecture: toolkit-template wiring, Registry V2, Biome rule tightening, legacy metadata migration, profile-template coupling"
    status: pending
  - id: nice-to-have
    content: "Nice-to-have: package extraction, Tier 2/3 libs, next-view-transitions, CSS extraction, preview media cleanup"
    status: pending
isProject: false
---

# Comprehensive Pending Items Inventory

Everything still open, organized by category. Sources: the [V2 master plan](experiments_platform_v2_d73b9769.plan.md), [V2 comprehensive review](v2_comprehensive_review_9100ae49.plan.md), [STATUS.md](.agent/STATUS.md), and the stale [P4 CI plan](p4_ci_testing_infrastructure_2687de1c.plan.md).

---

## A. Infrastructure / CI (P4 tier)

These were in the original V2 plan Section 6 and the P4 CI plan. Most P4 items were completed, but these remain:

- **Lighthouse CI** -- Performance budgets on deployed preview URLs. The V2 plan envisioned a separate GitHub Actions workflow running Lighthouse on the 3 most recent experiments with a score > 80 gate. Needs a deployed preview URL (e.g., Vercel preview deploys) to work. Not started.
  - Source: [V2 plan Section 6](.cursor/plans/experiments_platform_v2_d73b9769.plan.md), [STATUS.md line 166](.agent/STATUS.md)
- **Test coverage reporting** -- `@vitest/coverage-v8` is already installed but the `--coverage` flag is not wired into the CI `checks` job or uploaded as an artifact. The only truly pending item from the stale [P4 plan](p4_ci_testing_infrastructure_2687de1c.plan.md).
  - Source: [V2 review Section 8](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md), [stale P4 plan](.cursor/plans/p4_ci_testing_infrastructure_2687de1c.plan.md)
- **E2E / integration tests** -- Playwright is installed (used for `capture.mjs`) but there are zero browser tests in CI. No Playwright test files exist. Only 2 unit test files with 5 total tests.
  - Source: [V2 review Section 8](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

---

## B. Visual Feedback Bridge / Devtools (P3 tier)

The V2 plan Section 3 envisioned a full "AI eyes" system. The basic pieces shipped (capture script, dev metrics, scene inspector), but the richer integration layer did not:

- **MCP capture server** -- The V2 plan called for a full MCP server with `captureExperiment(slug)`, `captureExperimentAt(slug, scrollPercent)`, `captureExperimentAfter(slug, delayMs)`, and `describeScene(slug)` tools. Currently only a CLI script at `scripts/capture.mjs`. Upgrading to an MCP tool would let agents call it natively from Cursor/Claude without shelling out.
  - Source: [V2 plan Section 3A](.cursor/plans/experiments_platform_v2_d73b9769.plan.md), [STATUS.md line 171](.agent/STATUS.md)
- **Visual QA as a first-class loop** -- The `visual-qa.md` workflow exists, but it still relies on the CLI capture script. The original vision was agents capturing, inspecting metrics, verifying scene graphs, and iterating -- all via tool calls, not shell commands.

---

## C. Creative Toolkit (P3 tier -- "Stand on Giants")

Tier 1 libraries are installed and the integration layer exists at `src/lib/toolkit/`, but there are significant gaps:

- **Toolkit is dead code in practice** -- No experiment actually imports from `@/lib/toolkit/`. Lenis, Tempus, and Hamo are in `package.json` adding ~50KB+ to `node_modules` with zero actual usage. The toolkit integration layer (`scroll.ts`, `raf.ts`, `r3f.tsx`) remains opt-in per-experiment.
  - Source: [V2 review Section 4D](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)
- **Toolkit wiring into per-profile Plop templates** -- Deferred due to a scroll/raf coordination conflict between Lenis and Tempus. The original vision was that each profile template (scrollytelling, r3f-scene, etc.) would come pre-wired with the relevant toolkit imports. Currently all templates scaffold without toolkit usage.
  - Source: [V2 review Section 3A](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)
- **Tier 2/3 library adoption** -- None of the Tier 2 or Tier 3 libraries from the V2 plan have been used in any experiment:
  - Tier 2: r3f-scroll-rig, react-vfx/vfx.js, StringTune, @react-three/timeline, Theatre.js
  - Tier 3 (copy-paste primitives): motion-primitives, animate-ui, Cambio
  - Source: [V2 plan Section 2](.cursor/plans/experiments_platform_v2_d73b9769.plan.md), [toolkit.md](.agent/contexts/toolkit.md)

---

## D. Content Pipeline (the largest remaining body of work)

Infrastructure is complete but barely used:

- **16/18 experiments have no articles** -- Only `send-button` and `basketball-replay-center` have published articles. The remaining 16 have `content: {}`. This is tracked as the sole pending todo in the [V2 review plan](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md) (`content-pipeline-execution`).
- **Content dashboard** -- No overview exists of which experiments have which content formats (article, lab-note, architecture, snippet, social, changelog). Envisioned as a dev-facing tool to track content status.
  - Source: [STATUS.md line 173](.agent/STATUS.md)
- **Article-aware homepage section** -- A dedicated "Writing" section on the homepage using `getArticles()`. Currently articles are only discoverable via `FileText` badges on cards and the drawer "Read Article" button.
  - Source: [STATUS.md line 172](.agent/STATUS.md)
- **ArticleLayout TOC** -- The table-of-contents component is commented out in `ArticleLayout.tsx`. Needs scroll-spy + responsive design. Intentionally deferred as a dedicated future effort.
  - Source: [V2 review Section 5I](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)
- **Unused schema fields across all 18 experiments**:
  - `updated` (date of last significant change) -- empty everywhere
  - `inspiration` (array of `{ title, url }`) -- empty everywhere
  - `related` (array of slugs) -- empty everywhere
  - Source: [V2 review Section 4C](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)
- **Social asset automation** -- OG API route exists and is wired to article metadata, but full per-experiment social card automation (auto-generate cards, code snippet images, short video captures) is not built.
  - Source: [STATUS.md line 168](.agent/STATUS.md)
- **Package extraction** -- Process documented in the `publish-experiment` workflow but never automated or executed.
  - Source: [STATUS.md line 167](.agent/STATUS.md)

---

## E. Registry and Sharing (P3 tier)

- **Registry V2 with interactive docs** -- The shadcn-compatible registry JSON exists (`npm run generate:registry`), but the V2 plan envisioned interactive documentation pages with live demos for each shareable component. Not started.
  - Source: [V2 plan Section 5](.cursor/plans/experiments_platform_v2_d73b9769.plan.md), [STATUS.md line 170](.agent/STATUS.md)

---

## F. AI Coding Configuration Architecture

The config layer itself is complete (31 files, all functional), but there are unrealized aspects of the original vision:

- **Profile-template toolkit coupling** -- Profiles describe what toolkit to use but templates don't actually scaffold with those imports. The `r3f-scene` profile says to use Tempus for RAF, but the `r3f-scene` Plop template doesn't import it.
- **game-of-life-shader profile mismatch** -- Has `profile: "blank"` despite being a canvas/web-worker experiment. Cosmetic but inaccurate.
  - Source: [V2 review Section 5B](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)
- **Biome config contradicts AGENTS.md**:
  - `biome.jsonc` disables `noExplicitAny` and `noUnusedVariables`, but AGENTS.md says "No `any` -- use `unknown` and narrow"
  - All 7 a11y rules are disabled
  - `useExhaustiveDependencies: off` -- actively hides bugs (e.g., the Cursor.tsx perf bug)
  - Wide blast radius (~90 hook-using files) makes enabling these risky
  - Source: [V2 review Section 5D](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

---

## G. Code Quality Deferred Items

- **Cursor.tsx `getCursorColor` perf bug** -- Defined inside the component body, recreated every render, causes useEffect to tear down and re-setup the `mousemove` listener + GSAP ticker on every render. Fix: hoist outside the component.
  - Source: [V2 review Section 3E](.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)
- **15/18 legacy layout metadata hardcoding** -- Most layouts hardcode metadata strings instead of reading from `experiment.json`. Only 3 layouts (basketball-replay-center, send-button, keyboard-keys) use the dynamic pattern. New experiments use it via Plop template.
  - Source: [STATUS.md line 174](.agent/STATUS.md)
- **CSS base style extraction** -- ~45 lines duplicated between `globals.css` and `experiments.css`. Low ROI, proven safe via `shared-tokens.css` pattern.
- **Preview media component redundancies** -- Both `InteractivePreviewMedia.tsx` and `StaticExperimentMedia.tsx` render overlapping DOM (gradient + "NO PREVIEW YET" badge) and have dead CSS (`hover:scale-110` on `pointer-events-none`).
- `**next-view-transitions`** -- For same-document transitions in the `(main)` route group. CSS cross-document transitions are already working; this would add same-document support.
  - Source: [STATUS.md line 169](.agent/STATUS.md)

---

## H. Stale Plan Cleanup

- **[p4_ci_testing_infrastructure_2687de1c.plan.md](.cursor/plans/p4_ci_testing_infrastructure_2687de1c.plan.md)** -- Has 7 pending todos in frontmatter but is superseded by a different executed plan (`p4_ci_testing_infrastructure_eb0aeeb8`). Most items were completed differently or are N/A (Storybook removed). Should be marked as superseded.
- **[phase_4_isplaceholder_removal_77cd5111.plan.md](.cursor/plans/phase_4_isplaceholder_removal_77cd5111.plan.md)** -- Contains an empty artifact todo (`pending` status, empty content) that should be cleaned up.

---

## Summary by Priority

**Infrastructure (quick wins)**

- Test coverage reporting (wire existing `@vitest/coverage-v8`)
- Cursor.tsx perf bug (hoist one function)
- Stale plan cleanup (update 2 plan files)

**Infrastructure (medium effort)**

- Lighthouse CI (needs Vercel preview deploys)
- MCP capture server (upgrade CLI to MCP tool)
- E2E tests (Playwright test suite)

**Content (largest effort, ongoing)**

- Articles for 16 experiments
- Populate `updated`/`inspiration`/`related` fields
- Content dashboard
- Article-aware homepage section
- ArticleLayout TOC with scroll-spy
- Social asset automation

**Architecture (medium effort, high leverage)**

- Toolkit wiring into Plop templates (resolve Lenis/Tempus conflict)
- Registry V2 with interactive docs
- Biome rule tightening (exhaustive-deps, a11y, noExplicitAny)
- Legacy layout metadata migration (15 layouts)
- Profile-template coupling

**Nice-to-have (low priority)**

- Package extraction automation
- Tier 2/3 library adoption
- `next-view-transitions`
- CSS base style extraction
- Preview media component cleanup
- game-of-life-shader profile fix

