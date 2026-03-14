# Changelog

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
