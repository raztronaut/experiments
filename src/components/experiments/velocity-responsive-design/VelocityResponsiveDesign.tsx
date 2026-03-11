"use client";

import type Lenis from "lenis";
import { Monitor, Settings, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { AIWidget } from "@/components/ui/AIWidget";
import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll";
import { createUnifiedScroll } from "@/lib/toolkit/scroll";
import { CONTENT } from "./content";
import { FlightControl } from "./FlightControl";
import { IntelligentScroller } from "./IntelligentScroller";
import { SpeedLines } from "./SpeedLines";
import { VelocityCodeBlock } from "./VelocityCodeBlock";
import { VelocityProvider } from "./VelocityContext";
import { VelocityImage } from "./VelocityImage";
import { VelocityText } from "./VelocityText";

const StaticBackgroundPattern = () => (
  <div
    className="pointer-events-none absolute inset-0 opacity-20"
    style={{
      backgroundImage:
        "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)",
      backgroundSize: "40px 40px",
    }}
  />
);

export default function VelocityResponsiveDesign() {
  const scrollRef = useRef<UnifiedScrollHandle | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useLayoutEffect(() => {
    const isDebug = new URLSearchParams(window.location.search).has("debug");
    const handle = createUnifiedScroll({ debug: isDebug });
    scrollRef.current = handle;
    setLenis(handle.lenis);

    return () => {
      handle.destroy();
      scrollRef.current = null;
      setLenis(null);
    };
  }, []);

  return (
    <VelocityProvider lenis={lenis}>
      <div className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-primary selection:text-black">
        <SpeedLines />

        <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 p-8 text-center">
          <StaticBackgroundPattern />

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="mb-4 bg-linear-to-b from-white to-zinc-700 bg-clip-text font-black text-5xl text-transparent uppercase italic leading-[0.9] tracking-tighter sm:text-8xl">
              The
              <br />
              Relativistic
              <br />
              Reader
            </h1>

            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="h-24 w-px bg-linear-to-b from-primary/50 to-transparent" />
              <span className="animate-pulse font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                Scroll to Accelerate
              </span>
            </div>
          </motion.div>
        </div>

        <IntelligentScroller>
          {CONTENT.map((item, i) => {
            switch (item.type) {
              case "text":
                return (
                  <VelocityText
                    detailed={item.detailed}
                    key={i}
                    summary={item.summary}
                  />
                );
              case "image":
                return <VelocityImage alt={item.alt} key={i} src={item.src} />;
              case "code":
                return (
                  <VelocityCodeBlock
                    code={item.code}
                    filename={item.filename}
                    key={i}
                    language={item.language}
                  />
                );
            }
          })}
        </IntelligentScroller>

        <FlightControl />

        <footer className="relative flex h-[80vh] flex-col items-center justify-center border-white/5 border-t bg-zinc-950">
          <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-linear-to-b from-white/10 to-transparent" />
          <p className="mb-4 font-mono text-xs text-zinc-700 uppercase tracking-[0.4em]">
            End of Content Stream
          </p>
          <div className="flex gap-4">
            <Zap className="text-zinc-800" size={14} />
            <Monitor className="text-zinc-800" size={14} />
            <Settings className="text-zinc-800" size={14} />
          </div>
        </footer>

        <div className="hidden md:block">
          <AIWidget />
        </div>
      </div>
    </VelocityProvider>
  );
}
