# Risk Register

This is the consolidated risk table for the realization pass.

| Risk | Likelihood | Impact | Why it matters | Mitigation |
|---|---|---:|---|---|
| Article CSS / typography regression | High | High | Articles currently depend on `experiments.css`; moving article routes can silently strip typography, TOC, and code styling | Decide CSS target before migration; create smoke tests using `basketball-replay-center` and `404-not-found` |
| `ExperimentNav` / article-link behavior breakage | High | Medium | Current nav assumptions are tied to `/experiments/:slug/article` and article presence logic | Make route contract explicit first; migrate nav in the same pass as article routing |
| Feed / sitemap / llms divergence | Medium | High | Articles and experiments are rediscovered multiple ways today | Introduce shared derived experiment/article surface manifest before route migration |
| Registry install contract breakage | Low | Very high | `/r/:slug` is a public install API | Preserve rewrite and install payload shape; add explicit contract tests |
| Registry warning noise masking regressions | High | Medium | 63 warnings already exist in clean-main build | Triage warnings early; reduce noisy classes before using build output as trust signal |
| Scaffolding/docs/agent drift after path changes | High | High | Path changes without generator/docs/agent updates break the operating system of the repo | Treat tooling and docs as same-phase migration work |
| Legacy experiment accidental retrofit | Medium | High | Legacy archive is intentionally frozen | Keep v2-only runtime standardization bounded |
| Registry grid/index premature deletion | Medium | Medium | Grid/index may be dead, backstage, or future-lightweight | Decide explicitly before removing artifacts or routes |
| Build-contract regression around generated artifacts | Medium | High | Registry docs depend on ignored generated inputs; tracked outputs and ignored inputs are mixed | Document canonical generated artifacts and enforce generation order in verification |
| Prototype ideas contaminating clean pass | Medium | Medium | Detached prototype contained both useful fixes and over-abstract ideas | Use the salvage matrix; port only validated ideas intentionally |
