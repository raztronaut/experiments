# Circular Dependency Report

_Read-only analysis of `/Users/razisyed/Developer/experiments` (Next.js 16 / TypeScript). No source or config files were modified._

## Critical Assessment

**There are no circular dependencies in this codebase.** Both tools agree, and the cross-check is clean:

| Tool | Scope | Result |
| --- | --- | --- |
| `madge --circular` (src, src/app, scripts) | 487 files | `✔ No circular dependency found!` |
| `madge --circular --ts-config tsconfig.json` (src, src/app, scripts) | 490 files | `✔ No circular dependency found!` |
| `depcruise src --include-only "^src" --config .dependency-cruiser.json` | 485 modules, 881 deps | `✔ no dependency violations found` |
| `depcruise src` (full, incl. app/scripts) | 711 modules | `couldNotResolve: 0`, no `no-circular` violations |

### Explaining the 118 warnings (they are benign)

The baseline `madge-circular.txt` reported "No circular dependency found" plus 118 warnings. Those warnings are **unresolved imports caused by madge not honoring the `@/` path alias and non-JS asset/library imports** — not hidden cycles. Inspecting `madge --warning` output, every skipped entry falls into one of these harmless categories:

- **`@/` TS path aliases** — the large majority, e.g. `@/lib/utils`, `@/components/ui/badge`, `@/components/experiments/.../*`, `@/hooks/*`, `@/lib/sentry`. madge's default resolver doesn't read `tsconfig.json` `paths`, so it lists them as "skipped." (Note: passing `--ts-config` actually produced *more* warnings — 146 — confirming madge's alias handling is unreliable here and is not the right authority for resolution.)
- **CSS / style imports** — `@/app/(main)/globals.css`, `fumadocs-ui/css/solar.css`, `fumadocs-ui/css/preset.css`, `tw-animate-css`, `tailwindcss`.
- **3rd-party / framework deep imports** — `three/addons/loaders/OBJLoader.js`, `tempus/react`, `fumadocs-core/source`, `fumadocs-ui/layouts/flux`, `fumadocs-ui/components/dynamic-codeblock`.
- **Generated sources** — `@/.source/server` (fumadocs-mdx codegen output; only exists after `npx fumadocs-mdx` runs, per AGENTS.md gotcha).

The authoritative resolution check is **dependency-cruiser**, which *does* read `tsConfig` + `enhancedResolveOptions` from `.dependency-cruiser.json`. It resolved **881 dependencies across 485 in-scope modules (711 total) with `couldNotResolve: 0`** and found **zero** `no-circular` violations. In other words, once the `@/` alias is correctly resolved, there are no cycles lurking behind madge's warnings.

### Barrel file assessment

Cycle risk from the re-export hubs is **nil** today, but one is a mild bundle-bloat hub:

- `src/lib/toolkit/index.ts` — Clean. Only re-exports `Tempus`, `createUnifiedScroll`, and scroll types. It *deliberately* omits `ExperimentCanvas`/`r3f.tsx` to avoid pulling `@react-three/fiber` into non-3D bundles (documented in-file). Notably, **no module imports the barrel** (`@/lib/toolkit`); every consumer deep-imports (`@/lib/toolkit/scroll`, `@/lib/toolkit/r3f`). Lowest possible risk.
- `src/components/dev/index.ts` — Trivial (2 re-exports). No risk.
- `src/components/mdx/index.ts` — The one hub worth a note. It aggregates ~15 components including heavy ones (`SandpackDemo`, `Slideshow`, `ImageSwitcher`, `LiveDemo`). Four article pages import from it (`import { articleComponents } from "@/components/mdx"`). This is a **bundle-weight** consideration, not a cycle: pulling the barrel for the `articleComponents` map transitively pulls every MDX component. Since `articleComponents` is itself the full component map, this is mostly inherent to how MDX rendering works here. No cycle, no action required for this report's scope.

## Recommendations

**Confidence: High — No action required (no cycles).**
There are no circular dependencies. The 118 madge warnings are entirely unresolved `@/` aliases, CSS/asset imports, framework deep-imports, and the generated `.source/` directory. dependency-cruiser independently confirms full resolution (`couldNotResolve: 0`) and zero cycles. No import chain needs breaking.

**Confidence: Low — Optional: add a CI guard against future cycles.**
To prevent regressions as experiments are added, optionally wire dependency-cruiser into CI (it already resolves aliases correctly and a config exists at the repo root):

```bash
npx depcruise src --include-only "^src" --config .dependency-cruiser.json
```

The existing `no-circular` rule is `severity: "warn"`; to make CI fail on a real cycle, bump it to `"error"`. Prefer depcruise over madge for any automated gate here, because madge mis-resolves the `@/` path alias and emits noisy false-positive warnings. This is optional and purely preventative.

**Confidence: Low — Optional: keep an eye on the `@/components/mdx` barrel.**
Not a cycle and not urgent. If article-page bundle size ever becomes a concern, consider deep-importing only the needed components instead of the aggregate barrel/`articleComponents` map. No change recommended now.

---

### Summary

- **No circular dependencies exist** — confirmed by madge (with and without `--ts-config`) and dependency-cruiser across src, app, and scripts.
- **The 118 madge warnings are benign**: unresolved `@/` path aliases, CSS imports, framework deep-imports (three/tempus/fumadocs), and the generated `@/.source/server` — not hidden cycles.
- **dependency-cruiser is the authoritative check**: it resolved 881 deps / 711 modules with `couldNotResolve: 0` and zero `no-circular` violations.
- **Barrel files are low-risk**: `lib/toolkit/index.ts` is clean and intentionally splits out r3f; `components/dev/index.ts` is trivial; `components/mdx/index.ts` is a heavy-but-acyclic hub (bundle-weight note only).
- **Only optional recommendations**: add a depcruise CI guard (bump `no-circular` to `"error"`) and optionally deep-import from the mdx barrel — both Low priority/preventative.
