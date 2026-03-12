# T4: Announcing-V2 Experiment Ship

First V2 experiment. Architecture is solid -- toolkit integration, diverse motion vocabulary, proper 3D CRT scene, adaptive/error-boundary all done (see `completed.md`). Inversa section port bugs fixed (block count, FOUC, Lenis timing -- see `completed.md` "2026-03-11 -- Inversa Section Port Debugging").

Audit date: 2026-03-11

## Gap Remediation

- [ ] **Centralize `gsap.registerPlugin(ScrollTrigger)`** -- Appears in 4 files within announcing-v2 (`AnnouncingV2.tsx`, `JeskoJetsSection.tsx`, `useInversaScroll.ts`, plus `scroll.ts` toolkit). Idempotent but not centralized.
- [ ] **`ScrollTrigger.refresh()` in toolkit** -- `AnnouncingV2.tsx` calls it manually after `createUnifiedScroll()`, but the toolkit function itself doesn't do it. Consider baking into `createUnifiedScroll` so consumers don't forget.

## Ship Checklist

- [ ] **Deploy to Vercel preview** -- Push `v2/platform` branch and test on preview URL before any production deploy. See T1: Vercel Preview Deploy Workflow.
- [ ] **Preview video recording** -- No `preview.mp4` in `public/experiments/announcing-v2/`.
- [ ] **Status flip** -- `experiment.json` still has `"status": "wip"`.
- [ ] **Poster generation** -- `poster.jpg` referenced but doesn't exist. Run `npm run generate:posters` after status flip.
- [ ] **OG screenshot capture** -- Run `npm run capture announcing-v2`.
- [ ] **Visual QA pass** -- Run `.agents/workflows/visual-qa.md` 8-category review.

## Polish

- [ ] **Film grain / noise texture** -- CRT shader has film grain dithering, but no global DOM-level grain overlay unifying sections. Design judgment call.
- [ ] **Section-specific color palettes** -- Each section has isolated CSS files. Needs visual QA to confirm palette diversity.
