"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Creates a Lenis smooth-scroll instance wired to GSAP's ticker and ScrollTrigger.
 *
 * **Important:** This drives Lenis from gsap.ticker directly. If you're also using
 * `setupUnifiedRAF()` from `@/lib/toolkit/raf` (which puts GSAP under Tempus),
 * prefer driving Lenis through Tempus at priority -1 instead:
 *
 * ```ts
 * import Tempus from "tempus";
 * const lenis = new Lenis({ autoRaf: false });
 * lenis.on("scroll", ScrollTrigger.update);
 * Tempus.add((time) => lenis.raf(time), { priority: -1 });
 * ```
 *
 * Using both `createLenisScroll()` and `setupUnifiedRAF()` together will create
 * competing RAF loops. This will be resolved in a future refactor (P1).
 */
export function createLenisScroll(
  options?: ConstructorParameters<typeof Lenis>[0]
) {
  const lenis = new Lenis({ autoRaf: false, ...options });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroyLenisScroll(lenis: Lenis) {
  lenis.destroy();
  ScrollTrigger.getAll().forEach((t) => t.kill());
}
