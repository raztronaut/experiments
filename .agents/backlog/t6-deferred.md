# T6: Deferred Items

Explicitly marked "don't attempt to fix" in AGENTS.md. These are known issues with wide blast radius or low ROI. Revisit when adjacent work makes them cheaper.

- [ ] **`Cursor.tsx` `getCursorColor` perf bug** -- Function defined inside component body, recreated every render. Causes `useEffect` to tear down and re-setup `mousemove` listener + GSAP ticker on every render. Fix: hoist outside the component. Low risk, but touching shared UI.
  - Source: [V2 review Section 3E](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

- [ ] **Biome strictness tightening** -- 30+ rules disabled, `noExplicitAny` off, 7 a11y rules off. AGENTS.md says "No `any`" but Biome doesn't enforce it. Wide blast radius (~90 files).
  - Approach: Progressive tightening -- enable one rule at a time, fix violations, ship.
  - Source: [V2 review Section 5D](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

- [ ] **`useExhaustiveDependencies` enforcement** -- Enabled but auto-suppressed on ~90 hook-using files. Actively hides bugs (e.g., the Cursor.tsx perf bug above).
  - Approach: Same progressive approach as Biome tightening. Fix highest-traffic files first.
  - Source: [V2 review Section 5D](../../.cursor/plans/v2_comprehensive_review_9100ae49.plan.md)

- [ ] **Lefthook `{staged_files}` shell escaping for route groups** -- Prerequisite for T8 Architecture Restructuring (clean commits during restructuring). Lefthook passes unquoted paths to `npx ultracite fix`, so Next.js route group parentheses (`(main)`, `(registry)`) get single-quote-escaped by lefthook's auto-escaper. Biome/ultracite then receives paths with literal single quotes (e.g. `'src/app/(main)/page.tsx'`) → `internalError/io: No such file or directory`. Files in route groups silently skip linting on every commit; typecheck still catches them.
  - **Root cause**: `lefthook.yml` line 5: `run: npx ultracite fix {staged_files}` -- bare `{staged_files}` triggers lefthook's default single-quote escaping on macOS.
  - **Likely fix**: Wrap in double quotes: `run: npx ultracite fix "{staged_files}"` -- lefthook then wraps each file individually in double quotes, which shells handle correctly for parentheses. See [lefthook docs](https://lefthook.dev/configuration/run.html) and [issue #786](https://github.com/evilmartians/lefthook/issues/786).
  - **Alternative**: Lefthook v2.1.2 (current) may already include [PR #987](https://github.com/evilmartians/lefthook/pull/987) which unquotes UTF-8 paths, but that fix targets `core.quotepath` encoding, not shell parentheses. The double-quote wrapping is the correct solution for this specific problem.
  - **Risk**: Low -- change is one line in `lefthook.yml`. Test by staging a file in `src/app/(main)/` and verifying Biome lints it. `stage_fixed: true` must still work with the new quoting.
  - Source: Commit session 2026-03-11, `memory.md` ("Biome/ultracite can't lint paths with parentheses")

- [ ] **ArticleLayout TOC scroll-spy** -- Commented out at `src/components/articles/ArticleLayout.tsx` line 74-75. Needs scroll-spy + responsive design. Also tracked in T2.
  - Source: AGENTS.md deferred items
