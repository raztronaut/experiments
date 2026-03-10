"use client";

import { useGSAP } from "@gsap/react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { HERO } from "../data";
import { usePrefersReducedMotion } from "../hooks";
import { heroFragmentShader, heroVertexShader } from "../shaders/heroShader";
import { tunnel, useAnnouncingStore } from "../store";

function ShaderPlane({
  progressRef,
}: {
  progressRef: React.RefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const currentMouse = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uProgress.value = progressRef.current ?? 0;

    // Smooth mouse interpolation inside RAF without causing React renders
    const { mouse } = useAnnouncingStore.getState();
    currentMouse.current.lerp(new THREE.Vector2(mouse.x, mouse.y), 0.05);
    mat.uniforms.uMouse.value.copy(currentMouse.current);

    mat.uniforms.uResolution.value.set(viewport.width, viewport.height);
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        depthTest={false}
        depthWrite={false}
        fragmentShader={heroFragmentShader}
        uniforms={uniforms}
        vertexShader={heroVertexShader}
      />
    </mesh>
  );
}

export const HeroSection = forwardRef<HTMLElement>(
  function HeroSection(_, ref) {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef(0);
    const titleLine1Ref = useRef<HTMLDivElement>(null);
    const titleLine2Ref = useRef<HTMLDivElement>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
    const scrollOwnsMotionRef = useRef(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    const combinedRef = (el: HTMLElement | null) => {
      sectionRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      }
    };

    useGSAP(
      () => {
        if (!sectionRef.current) {
          return;
        }

        const introTargets = [
          badgeRef.current,
          titleLine1Ref.current,
          titleLine2Ref.current,
          subtitleRef.current,
        ].filter(Boolean);
        const titleTargets = [
          titleLine1Ref.current,
          titleLine2Ref.current,
        ].filter(Boolean);

        const claimScrollOwnership = () => {
          if (scrollOwnsMotionRef.current) {
            return;
          }
          scrollOwnsMotionRef.current = true;
          introTimelineRef.current?.progress(1).kill();
          introTimelineRef.current = null;
          gsap.set(introTargets, {
            clearProps: "opacity,transform",
          });
        };

        if (prefersReducedMotion) {
          scrollOwnsMotionRef.current = true;
          gsap.set(introTargets, {
            clearProps: "opacity,transform",
          });
          gsap.set(contentRef.current, { clearProps: "transform" });
        } else {
          gsap.set(badgeRef.current, { opacity: 0, scale: 0.8 });
          gsap.set(titleTargets, { yPercent: 120, rotation: 5, opacity: 0 });
          gsap.set(subtitleRef.current, { opacity: 0, y: 40 });
        }

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: prefersReducedMotion ? false : 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            if (!prefersReducedMotion && self.scroll() > 0) {
              claimScrollOwnership();
            }
            if (contentRef.current && !prefersReducedMotion) {
              gsap.set(contentRef.current, {
                y: self.progress * 150,
              });
            }
          },
        });

        if (prefersReducedMotion) {
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          delay: 0.2,
        });

        introTimelineRef.current = tl;

        tl.to(badgeRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
        })
          .to(
            [titleLine1Ref.current, titleLine2Ref.current],
            {
              yPercent: 0,
              rotation: 0,
              opacity: 1,
              duration: 1.4,
              stagger: 0.12,
            },
            "-=0.9"
          )
          .to(
            subtitleRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
            },
            "-=1.05"
          );
      },
      { scope: sectionRef, dependencies: [prefersReducedMotion] }
    );

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        useAnnouncingStore.getState().setMouse(x, y);
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
      <section
        aria-label="Hero"
        className="relative flex min-h-[150vh] flex-col items-center justify-start"
        ref={combinedRef}
      >
        {/* Pinned viewport for shader + text */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Shader background via tunnel */}
          <div className="absolute inset-0 z-[1] scale-110">
            <tunnel.In>
              <ShaderPlane progressRef={progressRef} />
            </tunnel.In>
          </div>

          {/* Content overlay */}
          <div
            className="hero-content-container pointer-events-none relative z-10 flex h-full flex-col justify-center px-[4vw] mix-blend-exclusion"
            ref={contentRef}
          >
            <div
              className="absolute top-[10vh] right-[4vw] hidden items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 backdrop-blur-md lg:flex"
              ref={badgeRef}
            >
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
              <span className="font-mono text-sm text-white/80 uppercase tracking-widest">
                {HERO.version}
              </span>
            </div>

            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col uppercase">
                <div className="overflow-hidden pb-4">
                  <h1
                    className={cn(
                      "font-medium text-[clamp(4rem,14vw,18rem)] text-white leading-[0.8] tracking-[-0.04em] will-change-transform",
                      activeFont.variable
                    )}
                    ref={titleLine1Ref}
                  >
                    RAZI'S
                  </h1>
                </div>
                <div className="ml-[10vw] overflow-hidden pb-4">
                  <h1
                    className={cn(
                      "font-medium text-[clamp(4rem,14vw,18rem)] text-white leading-[0.8] tracking-[-0.04em] will-change-transform",
                      activeFont.variable
                    )}
                    ref={titleLine2Ref}
                  >
                    EXPERIMENTS
                  </h1>
                </div>
              </div>
            </div>

            <div
              className="mt-[8vh] max-w-xl self-end text-right"
              ref={subtitleRef}
            >
              <p className="text-[clamp(1.125rem,2vw,1.5rem)] text-white/70 leading-snug tracking-tight">
                {HERO.subtitle.split(". ").map((sentence, i) => (
                  <span className="mb-2 block last:mb-0" key={i}>
                    {sentence}
                    {i < HERO.subtitle.split(". ").length - 1 ? "." : ""}
                  </span>
                ))}
              </p>
            </div>

            {/* Minimal scroll indicator */}
            <div className="absolute bottom-8 left-[4vw] flex items-center gap-4 text-white/40">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                Scroll to explore
              </span>
              <div className="relative h-px w-12 overflow-hidden bg-white/20">
                <div
                  className="absolute inset-0 h-full w-full translate-x-[-100%] bg-white/80"
                  style={{
                    animation: prefersReducedMotion
                      ? undefined
                      : "slideRight 2s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
            <style>{`
            @keyframes slideRight {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          </div>
        </div>
      </section>
    );
  }
);
