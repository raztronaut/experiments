"use client";

import Tempus from "tempus";

export { Tempus };
export default Tempus;

let gsapUnified = false;

export async function setupUnifiedRAF() {
  if (gsapUnified) {
    return;
  }
  const gsap = (await import("gsap")).default;
  gsap.ticker.remove(gsap.updateRoot);
  Tempus.add((time) => gsap.updateRoot(time / 1000), { priority: 0 });
  gsapUnified = true;
}
