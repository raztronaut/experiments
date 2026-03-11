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

- [ ] **ArticleLayout TOC scroll-spy** -- Commented out at `src/components/articles/ArticleLayout.tsx` line 74-75. Needs scroll-spy + responsive design. Also tracked in T2.
  - Source: AGENTS.md deferred items
