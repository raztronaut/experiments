# Documentation

Comprehensive guides for the Experiments Lab. Each doc covers one major system.

| Guide | What it covers |
|-------|---------------|
| [Architecture](architecture.md) | Route group isolation, three-location rule, layout hierarchy, environment detection, data flow |
| [GPT-5.4 Deep Repo Audit Prompt](gpt-5.4-deep-repo-audit-prompt.md) | Reusable mega-prompt for an aggressive, evidence-backed full-system architecture/performance audit |
| [Automation Operator Sheet](automation-operator-sheet.md) | One-time deep-pass workflow, audit lenses, and sweep order for platform-level reviews |
| [Automation Deep-Pass Prompts](automation-deep-pass-prompts.md) | Copy-paste starter prompts for running each automation domain as a serious platform audit |
| [Getting Started](getting-started.md) | Prerequisites, installation, creating your first experiment, file anatomy, shipping |
| [Experiments](experiments.md) | Lifecycle, profiles, metadata system (status/listing/legacy), /dev dashboard, full schema |
| [Content System](content-system.md) | Articles, content constellation (6 formats), RSS/JSON feeds, llms.txt, dynamic .mdx routes |
| [SEO](seo.md) | llms.txt (AI Visibility), structured data, site-config, feeds, validation |
| [Registry](registry.md) | Shadcn-compatible registry, generation pipeline, collected components, Fumadocs, curation |
| [Toolkit](toolkit.md) | GSAP, Motion, Lenis, Tempus, R3F, integration layer, priority chain, dev tools |
| [Deploy](deploy.md) | CI pipeline, Vercel, lefthook pre-commit hooks, Entire.io, build pipeline, branching, PR/preview operator flow |
| [Scripts](scripts.md) | All automation scripts with usage, flags, and filtering behavior |
| [Contributing](contributing.md) | Code style, component size discipline, Biome, testing, git conventions, accessibility |
| [AI Development](ai-development.md) | .agents/ directory, Cursor integration, MCP tools, skills, workflows, memory, automations, and worktrees |

## For AI Agents

These docs are written for human contributors. AI coding assistants should read `AGENTS.md` (the agent entry point) and the `.agents/` directory tree, which contains rules, profiles, skills, workflows, and deep context optimized for automated workflows. See [AI Development](ai-development.md) for a map of the agent knowledge base.
