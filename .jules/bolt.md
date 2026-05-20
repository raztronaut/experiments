
## 2024-11-20 - Package Dependency Accidental Modifications
**Learning:** During test investigations (e.g., trying to resolve local test runner issues with missing packages like `@sentry/node`), running tools like `pnpm install <pkg>` updates the `package.json` and creates massive new lockfiles (`pnpm-lock.yaml`).
**Action:** Always strictly monitor `git status` before requesting a code review. Use `git restore package.json` and `rm pnpm-lock.yaml` to ensure no unexpected dependency modifications or new lockfiles pollute the PR, ensuring adherence to the 'never modify package.json' boundary.
