"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import dynamic from "next/dynamic";
import { forwardRef, useRef, useState } from "react";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { TOOLKIT, type ToolkitItem } from "../data";
import { usePrefersReducedMotion } from "../hooks";

const ToolkitScene = dynamic(
  () =>
    import("../components/ToolkitMiniCanvas").then((m) => ({
      default: m.ToolkitScene,
    })),
  { ssr: false }
);

function ToolkitRow({
  item,
  index,
  isHovered,
  onHover,
  reducedMotion,
}: {
  item: ToolkitItem;
  index: number;
  isHovered: boolean;
  onHover: (index: number | null) => void;
  reducedMotion: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = `toolkit-row-${index}`;

  useGSAP(() => {
    if (!contentRef.current) {
      return;
    }

    gsap.to(contentRef.current, {
      height: isHovered ? "auto" : 0,
      opacity: isHovered ? 1 : 0,
      duration: reducedMotion ? 0 : 0.4,
      ease: "power3.out",
    });
  }, [isHovered, reducedMotion]);

  const toggleRow = () => {
    onHover(isHovered ? null : index);
  };

  return (
    <div
      className="group relative border-white/10 border-b transition-colors duration-300 hover:bg-white/[0.02]"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      ref={rowRef}
    >
      <button
        aria-controls={contentId}
        aria-expanded={isHovered}
        className="flex w-full items-center justify-between px-[4vw] py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            onHover(null);
          }
        }}
        onClick={toggleRow}
        onFocus={() => onHover(index)}
        type="button"
      >
        <div className="flex items-center gap-8 md:gap-16">
          <span className="font-mono text-sm text-white/40 tracking-widest">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3
            className={cn(
              "font-medium text-[clamp(2rem,4vw,4rem)] uppercase tracking-tight transition-colors duration-300",
              activeFont.variable
            )}
            style={{ color: isHovered ? item.color : "rgba(255,255,255,0.8)" }}
          >
            {item.name}
          </h3>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span
            className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300"
            style={{
              color: isHovered ? item.color : "rgba(255,255,255,0.4)",
              borderColor: isHovered ? item.color : "rgba(255,255,255,0.1)",
            }}
          >
            TYPE_{item.tier}
          </span>
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">
            {isHovered ? "Hide details" : "Show details"}
          </span>
        </div>
      </button>

      <div
        className="h-0 overflow-hidden opacity-0"
        id={contentId}
        ref={contentRef}
      >
        <div className="flex flex-col items-start gap-8 px-[4vw] pt-2 pb-8 md:ml-24 md:flex-row md:items-end">
          <p className="max-w-xl text-lg text-white/50 leading-relaxed">
            {item.description}
          </p>

          {item.name === "R3F" && (
            <div className="relative h-48 w-full overflow-hidden border border-white/10 bg-black/50 md:w-80">
              <ToolkitScene />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ToolkitSection = forwardRef<HTMLElement>(
  function ToolkitSection(_, ref) {
    const sectionRef = useRef<HTMLElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

        const heading =
          sectionRef.current.querySelector<HTMLElement>(".toolkit-heading");
        const rows = sectionRef.current.querySelectorAll<HTMLElement>(
          ".toolkit-row-container > div"
        );

        if (prefersReducedMotion) {
          gsap.set(heading, { clearProps: "all", opacity: 1, scale: 1, y: 0 });
          gsap.set(rows, { clearProps: "all", opacity: 1, x: 0 });
          return;
        }

        if (heading) {
          gsap.fromTo(
            heading,
            { opacity: 0, scale: 0.95, y: 40 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 1.2,
              ease: "expo.out",
              scrollTrigger: {
                trigger: heading,
                start: "top 85%",
              },
            }
          );
        }

        gsap.fromTo(
          rows,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current.querySelector(
                ".toolkit-row-container"
              ),
              start: "top 75%",
            },
          }
        );
      },
      { scope: sectionRef, dependencies: [prefersReducedMotion] }
    );

    return (
      <section
        aria-label="Toolkit"
        className="relative mt-16 py-32"
        ref={combinedRef}
      >
        <div className="toolkit-heading mb-24 px-[4vw]">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-px w-12 bg-white/40" />
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">
              Architecture Details
            </span>
          </div>
          <h2
            className={cn(
              "font-medium text-[clamp(3rem,8vw,8rem)] text-white uppercase leading-[0.8] tracking-[-0.02em]",
              activeFont.variable
            )}
          >
            Stand on Giants
          </h2>
          <p className="mt-8 ml-1 max-w-2xl border-[#4dff88] border-l-2 pl-6 text-[clamp(1rem,1.5vw,1.25rem)] text-white/50 leading-relaxed">
            Industry-standard creative engineering tools, pre-configured and
            unified under one single RAF loop for maximum performance.
          </p>
        </div>

        <div className="toolkit-row-container w-full border-white/10 border-t">
          {TOOLKIT.map((item, i) => (
            <ToolkitRow
              index={i}
              isHovered={hoveredIndex === i}
              item={item}
              key={item.name}
              onHover={setHoveredIndex}
              reducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </section>
    );
  }
);
