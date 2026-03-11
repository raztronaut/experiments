"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll";
import { createUnifiedScroll } from "@/lib/toolkit/scroll";
import { PLANE_KEYFRAMES, SECTION_DURATION } from "./data";
import type { AirplaneScene } from "./hooks/useAirplaneScene";
import { useAirplaneScene } from "./hooks/useAirplaneScene";
import { BlueprintSection } from "./sections/BlueprintSection";
import { EndSection } from "./sections/EndSection";
import { HeroSection } from "./sections/HeroSection";
import { NarrativeSection } from "./sections/NarrativeSection";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

export default function Airplanes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<UnifiedScrollHandle | null>(null);
  const [scene, setScene] = useState<AirplaneScene | null>(null);
  const { init, sceneRef } = useAirplaneScene();

  useEffect(() => {
    scrollRef.current = createUnifiedScroll();
    ScrollTrigger.refresh();
    return () => scrollRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    let cancelled = false;
    const container = containerRef.current;
    init(container).then((s) => {
      if (!cancelled && s) {
        setScene(s);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [init]);

  useGSAP(
    () => {
      if (!(scene && containerRef.current)) {
        return;
      }
      const plane = scene.modelGroup;

      gsap.fromTo(
        "canvas.airplanes-canvas",
        { x: "50%", autoAlpha: 0 },
        { duration: 1, x: "0%", autoAlpha: 1 }
      );
      gsap.to(".airplanes-loading", { autoAlpha: 0 });
      gsap.to(".airplanes-scroll-cta", { opacity: 1 });
      gsap.set("svg", { autoAlpha: 1 });

      const kf = PLANE_KEYFRAMES;
      gsap.set(plane.rotation, {
        x: kf[0].rotation.x,
        y: kf[0].rotation.y,
        z: kf[0].rotation.z,
      });
      gsap.set(plane.position, {
        x: kf[0].position.x,
        y: kf[0].position.y,
        z: kf[0].position.z,
      });
      scene.render();

      // Blueprint wireframe/solid viewport transitions
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

      // Parallax
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

      // SVG line drawings (using stroke-dasharray instead of DrawSVGPlugin)
      setupSVGDraw("#line-length", ".length");
      setupSVGDraw("#line-wingspan", ".wingspan", "top 25%", "bottom 50%");
      setupSVGDraw("#circle-phalange", ".phalange", "top 50%", "bottom 100%");

      // Master timeline — animates 3D model through scroll
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
        // The blueprint section hold skips a beat
        if (i === 6) {
          delay += SECTION_DURATION;
          continue;
        }
        const frame = kf[i];
        const rotEase = frame.ease ?? "power2.inOut";
        const posEase = frame.positionEase ?? rotEase;
        const dur = i === kf.length - 1 ? SECTION_DURATION : undefined;

        tl.to(
          plane.rotation,
          {
            x: frame.rotation.x,
            y: frame.rotation.y,
            z: frame.rotation.z,
            ease: rotEase,
            ...(dur ? { duration: dur } : {}),
          },
          delay
        );

        tl.to(
          plane.position,
          {
            x: frame.position.x,
            y: frame.position.y,
            z: frame.position.z,
            ease: posEase,
            ...(dur ? { duration: dur } : {}),
          },
          delay
        );
      }

      // Fade light at end
      tl.to(
        scene.light.position,
        { duration: SECTION_DURATION, x: 0, y: 0, z: 0 },
        delay
      );
    },
    { scope: containerRef, dependencies: [scene] }
  );

  return (
    <div className="airplanes-root" ref={containerRef}>
      <div className="airplanes-loading">Loading</div>
      <div className="airplanes-content">
        <HeroSection />
        <NarrativeSection />
        <BlueprintSection />
        <EndSection />
      </div>
    </div>
  );
}

function setupSVGDraw(
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
