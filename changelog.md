# Changelog

## 2026-03-14 to 2026-03-20

### Highlights
- Shipped a broad SEO remediation pass including metadata/schema/plop/template fixes, indexing guidance, and follow-up validation hardening (`57ee310`, `ad60f91`, `c9a3fbc`).
- Landed performance-focused improvements across routing/prefetching, bundle and source-map tooling, plus production Lighthouse reporting (`6d19276`, `8a800b1`, `6c5edac`).
- Expanded and hardened Sentry integration with S-tier monitoring, profiling workflows, healthcheck probes, and related documentation updates (`e88ae2c`, `65be824`, `a4242a2`).
- Fixed high-impact runtime issues including mobile swipe-to-preview behavior, HDR asset CSP compatibility, and canvas resize timing during view transitions (`7ee25b0`, `36aef39`, `ad0b704`).

### Key PRs
- [#24 - Sentry S-tier integration](https://github.com/raztronaut/experiments/pull/24)
- [#22 - self-host HDR to avoid CSP block on raw.githack.com](https://github.com/raztronaut/experiments/pull/22)
- [#21 - chore/perf-metrics-prod](https://github.com/raztronaut/experiments/pull/21)
- [#19 - restore mobile swipe-to-preview on experiment cards](https://github.com/raztronaut/experiments/pull/19)
- [#18 - add Cursor Cloud specific instructions to AGENTS.md](https://github.com/raztronaut/experiments/pull/18)
- [#17 - Performance tooling guide — source maps + bundle analyzer](https://github.com/raztronaut/experiments/pull/17)
- [#16 - add prefetching for experiment and article routes](https://github.com/raztronaut/experiments/pull/16)
- [#15 - comprehensive PageSpeed optimization pass](https://github.com/raztronaut/experiments/pull/15)
- [#14 - pages-seo-structure-ee14](https://github.com/raztronaut/experiments/pull/14)

## 2026-03-07 to 2026-03-13

### Highlights
- Improved build performance by overhauling the generation pipeline and merging measurable perf-gain work (`fca2f06`, `0f7203a`).
- Eliminated an N+1 article-content query and reduced server component payload bloat (`dc82b71`, `4bbfe33`).
- Landed the v2 platform foundation merge covering toolkit/dev tooling and related platform infrastructure (`8483164`, `6551051`).
- Added the `luma-morphing` experiment and upgraded article typography defaults with a debug panel (`b6eae41`, `89b8b87`).

### Key PRs
- [#11 - identify-a-measurable-perf-gain](https://github.com/raztronaut/experiments/pull/11)
- [#4 - Eliminate N+1 query reading article content in feeds](https://github.com/raztronaut/experiments/pull/4)
- [#3 - v2/platform](https://github.com/raztronaut/experiments/pull/3)
- [#12 - Describe how to confirm commit](https://github.com/raztronaut/experiments/pull/12)
- [#10 - Describe how to confirm commit](https://github.com/raztronaut/experiments/pull/10)
