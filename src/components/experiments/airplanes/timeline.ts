import gsap from "gsap";
import {
  BLUEPRINT_HOLD_INDEX,
  PLANE_KEYFRAMES,
  SECTION_DURATION,
} from "./data";
import type { AirplaneScene } from "./hooks/useAirplaneScene";

/**
 * Build all scroll-driven GSAP animations for the airplane experiment.
 * Pure side-effect function -- creates ScrollTriggers scoped to the container
 * that useGSAP will clean up automatically.
 */
export function buildFlightTimeline(scene: AirplaneScene): void {
  const plane = scene.modelGroup;
  const kf = PLANE_KEYFRAMES;

  // ── Intro tweens ──
  gsap.fromTo(
    "canvas.airplanes-canvas",
    { x: "50%", autoAlpha: 0 },
    { duration: 1, x: "0%", autoAlpha: 1 }
  );
  gsap.to(".airplanes-loading", { autoAlpha: 0 });
  gsap.to(".airplanes-scroll-cta", { opacity: 1 });
  gsap.set(".airplanes-blueprint svg", { autoAlpha: 1 });

  // ── Initial pose ──
  gsap.set(plane.rotation, kf[0].rotation);
  gsap.set(plane.position, kf[0].position);
  scene.render();

  // ── Blueprint viewport transitions (wireframe reveal / exit) ──
  gsap.fromTo(
    scene.views[1],
    { height: 0, bottom: 0 },
    {
      height: 1,
      bottom: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".airplanes-blueprint",
        scrub: true,
        start: "top bottom",
        end: "top top",
      },
    }
  );

  gsap.fromTo(
    scene.views[1],
    { height: 1, bottom: 0 },
    {
      height: 0,
      bottom: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".airplanes-blueprint",
        scrub: true,
        start: "bottom bottom",
        end: "bottom top",
      },
    }
  );

  // ── Parallax layers ──
  gsap.to(".airplanes-ground", {
    y: "30%",
    scrollTrigger: {
      trigger: ".airplanes-ground-container",
      scrub: true,
      start: "top bottom",
      end: "bottom top",
    },
  });

  gsap.from(".airplanes-clouds", {
    y: "25%",
    scrollTrigger: {
      trigger: ".airplanes-ground-container",
      scrub: true,
      start: "top bottom",
      end: "bottom top",
    },
  });

  // ── SVG line-drawing annotations ──
  setupSvgDraw("#line-length", ".length");
  setupSvgDraw("#line-wingspan", ".wingspan", "top 25%", "bottom 50%");
  setupSvgDraw("#circle-phalange", ".phalange", "top 50%", "bottom 100%");

  // ── Master flight timeline ──
  const tl = gsap.timeline({
    onUpdate: scene.render,
    scrollTrigger: {
      trigger: ".airplanes-content",
      scrub: true,
      start: "top top",
      end: "bottom bottom",
    },
    defaults: { duration: SECTION_DURATION, ease: "power2.inOut" },
  });

  let delay = 0;
  tl.to(".airplanes-scroll-cta", { duration: 0.25, opacity: 0 }, delay);
  tl.to(plane.position, { x: kf[1].position.x, ease: "power1.in" }, delay);

  for (let i = 2; i < kf.length; i++) {
    delay += SECTION_DURATION;

    if (i === BLUEPRINT_HOLD_INDEX) {
      delay += SECTION_DURATION;
      continue;
    }

    const frame = kf[i];
    const rotEase = frame.ease ?? "power2.inOut";
    const posEase = frame.positionEase ?? rotEase;
    const isLast = i === kf.length - 1;

    tl.to(
      plane.rotation,
      {
        ...frame.rotation,
        ease: rotEase,
        ...(isLast ? { duration: SECTION_DURATION } : {}),
      },
      delay
    );

    tl.to(
      plane.position,
      {
        ...frame.position,
        ease: posEase,
        ...(isLast ? { duration: SECTION_DURATION } : {}),
      },
      delay
    );
  }

  tl.to(
    scene.light.position,
    { duration: SECTION_DURATION, x: 0, y: 0, z: 0 },
    delay
  );
}

function setupSvgDraw(
  selector: string,
  trigger: string,
  start = "top bottom",
  end = "top top"
) {
  const el = document.querySelector<SVGGeometryElement>(selector);
  if (!el) {
    return;
  }

  const length = el.getTotalLength();
  gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });

  gsap.to(el, {
    strokeDashoffset: 0,
    scrollTrigger: { trigger, scrub: true, start, end },
  });

  gsap.to(el, {
    opacity: 0,
    strokeDashoffset: length,
    scrollTrigger: {
      trigger,
      scrub: true,
      start: "top top",
      end: "bottom top",
    },
  });
}
