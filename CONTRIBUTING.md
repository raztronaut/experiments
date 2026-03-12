# Contributing

Full contributing guide: **[docs/contributing.md](docs/contributing.md)**

Covers code style, TypeScript conventions, component size discipline, Biome linting, testing, pre-commit hooks, accessibility, UX standards, and project boundaries.

## Quick Reference

```bash
npm install                        # install deps (lefthook hooks auto-install)
npm run dev                        # dev server at localhost:3000
npm run new:experiment             # scaffold a new experiment
npm test                           # vitest watch mode
npm run lint                       # biome check (read-only)
npm run fix                        # biome autofix
npm run typecheck                  # tsc --noEmit
npm run validate:experiments       # validate all experiment.json files
```

### Commit Messages

Keep commit messages short and descriptive. Conventional Commit prefixes are a good pattern if they help, but they are not required.

### Pre-Commit Hooks

Lefthook runs lint, typecheck, and experiment validation in parallel on every commit. Fix lint issues with `npm run fix`, then re-stage and re-commit.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
