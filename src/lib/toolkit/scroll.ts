"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

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
