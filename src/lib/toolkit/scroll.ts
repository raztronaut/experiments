"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Tempus from "tempus";

gsap.registerPlugin(ScrollTrigger);

export interface UnifiedScrollHandle {
  destroy: () => void;
  lenis: Lenis;
}

export interface UnifiedScrollOptions {
  /** Attach window.__lenis, __scrollToSection, __scrollToProgress for MCP tools. */
  debug?: boolean;
  lenisOptions?: ConstructorParameters<typeof Lenis>[0];
}

let gsapRefCount = 0;
let gsapTempusDispose: (() => void) | undefined;

/**
 * Creates a Lenis smooth-scroll instance unified under Tempus's RAF loop.
 *
 * Priority chain (darkroom webgl.md pattern):
 *   -1  Lenis (scroll input processing, runs first)
 *    0  GSAP (animation updates, default priority)
 *    1  Three.js rendering (if applicable, runs last)
 *
 * Returns a handle with `lenis` and `destroy()` for proper cleanup.
 * GSAP-Tempus binding is reference-counted: shared across all instances,
 * only torn down when the last instance is destroyed.
 *
 * Pass `{ debug: true }` (typically gated behind `?debug`) to expose
 * `window.__lenis`, `window.__scrollToSection(index)`, and
 * `window.__scrollToProgress(0-1)` for MCP browser tool scrolling.
 */
export function createUnifiedScroll(
  options?: ConstructorParameters<typeof Lenis>[0] | UnifiedScrollOptions
): UnifiedScrollHandle {
  const isNewApi =
    options !== undefined && ("lenisOptions" in options || "debug" in options);
  const lenisOpts = isNewApi
    ? (options as UnifiedScrollOptions).lenisOptions
    : (options as ConstructorParameters<typeof Lenis>[0] | undefined);
  const debug = isNewApi ? (options as UnifiedScrollOptions).debug : false;

  const lenis = new Lenis({ autoRaf: false, ...lenisOpts });

  const scrollUpdateHandler = ScrollTrigger.update;
  lenis.on("scroll", scrollUpdateHandler);

  if (gsapRefCount === 0) {
    gsap.ticker.remove(gsap.updateRoot);
    gsapTempusDispose = Tempus.add(
      (time: number) => gsap.updateRoot(time / 1000),
      { priority: 0 }
    );
    gsap.ticker.lagSmoothing(0);
  }
  gsapRefCount++;

  const lenisDispose = Tempus.add((time: number) => lenis.raf(time), {
    priority: -1,
  });

  const ownTriggers = new Set<ScrollTrigger>();
  const origCreate = ScrollTrigger.create;
  const patchedCreate: typeof ScrollTrigger.create = function (
    this: typeof ScrollTrigger,
    ...args: Parameters<typeof ScrollTrigger.create>
  ) {
    const trigger = origCreate.apply(this, args);
    ownTriggers.add(trigger);
    return trigger;
  };
  ScrollTrigger.create = patchedCreate;

  if (debug && typeof window !== "undefined") {
    window.__lenis = lenis;
    window.__scrollToSection = (index: number) => {
      const sections = document.querySelectorAll("section[aria-label]");
      if (sections[index]) {
        lenis.scrollTo(sections[index] as HTMLElement, { immediate: true });
      }
    };
    window.__scrollToProgress = (progress: number) => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      lenis.scrollTo(maxScroll * progress, { immediate: true });
    };
  }

  return {
    lenis,
    destroy() {
      if (debug && typeof window !== "undefined") {
        window.__lenis = undefined;
        window.__scrollToSection = undefined;
        window.__scrollToProgress = undefined;
      }

      ScrollTrigger.create = origCreate;
      lenisDispose?.();
      lenis.off("scroll", scrollUpdateHandler);
      lenis.destroy();

      for (const t of ownTriggers) {
        if (t.kill) {
          t.kill();
        }
      }
      ownTriggers.clear();

      gsapRefCount--;
      if (gsapRefCount === 0 && gsapTempusDispose) {
        gsapTempusDispose();
        gsapTempusDispose = undefined;
        gsap.ticker.add(gsap.updateRoot);
        gsap.ticker.lagSmoothing(500, 33);
      }
    },
  };
}
