# T2: Content Pipeline & Registry

The largest body of remaining work. Infrastructure is complete but barely used.

## Articles

- **Generate articles for 16 experiments** -- Only `send-button` and `basketball-replay-center` have articles. The remaining 16 have `content: {}`. This is the single largest content gap.
  - Source: [V2 review `content-pipeline-execution](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)`

## Schema Fields

- **Populate `updated` field** -- Date of last significant change. Empty across all 18 experiments.
- **Populate `inspiration` field** -- Array of `{ title, url }`. Empty across all 18 experiments.
- **Populate `related` field** -- Array of slugs. Empty across all 18 experiments.
  - Source: [V2 review Section 4C](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

## Registry

- **Registry V2 with Interactive Docs** -- Registry JSON generation works (`generate-registry.mjs`). Need live demo pages, component previews, copy-paste install commands.
  - Source: [Component registry chat](4924b037-3555-402a-aac8-9b88984b0d30)

## Content Infrastructure

- **Content Dashboard** -- Dev-facing overview showing which experiments have which content formats (article, lab-note, architecture, snippet, social, changelog). Helps track content status at a glance.
  - Source: STATUS.md line 173
- **ArticleLayout TOC** -- Table-of-contents component is commented out at `src/components/articles/ArticleLayout.tsx` line 74-75. Needs scroll-spy implementation + responsive design. Listed in AGENTS.md as a deferred item.
  - Source: [V2 review Section 5I](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)
- **Social Asset Automation** -- OG API route exists and is wired to article metadata. Need full per-experiment social card automation (auto-generate cards, code snippet images, short video captures).
  - Source: STATUS.md line 168
- **Package Extraction Automation** -- Process documented in `publish-experiment` workflow but never automated or executed.
  - Source: STATUS.md line 167

