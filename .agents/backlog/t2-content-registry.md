# T2: Content Pipeline & Registry

The largest body of remaining work. Infrastructure is complete but barely used.

## Articles

- **Generate articles for 15 experiments** -- `send-button`, `basketball-replay-center`, and `404-not-found` have articles. The remaining 15 have `content: {}`. This is the single largest content gap. **Note:** T8 Phase B moves articles to `content/articles/` under Fumadocs. Ideally write new articles in the new system after T8-B ships to avoid migration churn. Articles now use a **lens-based system** (implementation/concept/exploration) -- the content-writer runs a lens analysis and asks the user for direction before writing. Concept-rich experiments are currently underserved since all 3 existing articles are implementation-heavy. Execution tools: `.cursor/skills/publish-content/SKILL.md` (workflow), `.cursor/agents/content-writer.md` (writing persona), `.cursor/skills/audit-content/SKILL.md` (coverage tracking).
  - Lens-strength observations (not prescriptions -- final emphasis decided with user at article brief time):
    - `velocity-responsive-design`: strong **concept** (kinetic intent, cognitive bandwidth, relativistic metaphor)
    - `non-euclidean-hyperbolic-workspace`: strong **concept** (non-Euclidean geometry as UI paradigm)
    - `gravity-physics-ui-layout`: strong **concept** (physics as layout engine)
    - `game-of-life-shader` / `life-3d`: strong **implementation** (shader technique, GPU compute)
    - `keyboard-keys`: strong **implementation** (CSS/DOM craft)
    - `mountain-transition`, `shader-landing`: strong **implementation** (scroll animation, shader effects)
    - `transit-airport-split-flap-display`: mixed **concept** (physical interface as digital metaphor) + **implementation**
  - Source: [V2 review `content-pipeline-execution](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)`

## Schema Fields

- **Populate `updated` field** -- Date of last significant change. Empty across all 18 experiments.
- **Populate `inspiration` field** -- Array of `{ title, url }`. Empty across all 18 experiments.
- **Populate `related` field** -- Array of slugs. Empty across all 18 experiments.
  - Source: [V2 review Section 4C](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

## Registry

- [ ] **Curated Component Collection** -- Personal component mood board (Are.na / Raindrop.io for UI components). Single `collection.json` manifest as the database, CLI (`npm run collect add <url>`) with auto-enrichment (OG metadata + shadcn registry probe), web management UI at `/registry/collected` with boards/tags/ratings/status tracking, dev-mode server actions for write-back, and `quick-component` agent skill (save/port/manage modes). Three phases:
  1. **Data + CLI** -- `collection.json` schema (items, boards, statuses, ratings, notes), `scripts/collect.mjs` with add/list/tag/rate/note/status/board/remove/stats subcommands, auto-enrichment pipeline, update `scanCollected()` to read from `collection.json`.
  2. **Web UI** -- `/registry/collected` page with board tabs, status/tag/rating filters, search, CollectedGrid + CollectedCard components, dev-mode server actions for inline management.
  3. **Agent skill** -- `.agents/skills/quick-component/SKILL.md` with save mode (URL to collection), port mode (collection to code, shadcn sources skip transformation), manage mode (tag/rate/organize via natural language).
  - Supersedes: "Quick Component Collector skill" and "Registry as personal library" items.
  - Full plan: [`.cursor/plans/s-tier_collected_registry_ca7692d5.plan.md`](../../.cursor/plans/s-tier_collected_registry_ca7692d5.plan.md)
  - Depends on: Registry V2 pipeline (done)
  - Source: [Curated collection planning](CURRENT_SESSION), [Registry interactive docs plan -- "Adjacent Notes"](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md)
- [ ] **Registry V2 generated output review** -- Deep audit of generated MDX pages, registry JSON, and detail pages for all 82+ items. Check for: incomplete/missing descriptions, broken preview iframes, source code rendering issues, install command accuracy, category mismatches, metadata gaps, Fumadocs layout quirks, mobile rendering, and any rough edges in the auto-generated content. Identify concrete improvements to the generation scripts or templates.
- [ ] **Registry access control** -- Start with unlisted + noindex (zero code). Add basic password gate later if needed (middleware + cookie). JSON endpoints for `npx shadcn add` stay public regardless.
  - Source: [Registry interactive docs plan -- "Adjacent Notes"](../../.cursor/plans/registry_interactive_docs_aaa07efa.plan.md)

## Content Infrastructure

- **Content Dashboard** -- Dev-facing overview showing which experiments have which content formats (article, lab-note, architecture, snippet, social, changelog). Helps track content status at a glance. Partially addressed by: Registry V2 overview page (above), and `.cursor/skills/audit-content/SKILL.md` (agent-driven content health reports).
  - Source: STATUS.md line 173
- **ArticleLayout TOC** -- Table-of-contents component is commented out at `src/components/articles/ArticleLayout.tsx` line 74-75. Needs scroll-spy implementation + responsive design. Listed in AGENTS.md as a deferred item.
  - Source: [V2 review Section 5I](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)
- **Social Asset Automation** -- OG API route exists and is wired to article metadata. Need full per-experiment social card automation (auto-generate cards, code snippet images, short video captures). Registry V2 Phase 7 adds OG images for registry pages.
  - Source: STATUS.md line 168
- **Package Extraction Automation** -- Process documented in `publish-experiment` workflow but never automated or executed. Registry V2 is the consumption side -- visible install commands motivate completing extraction.
  - Source: STATUS.md line 167

