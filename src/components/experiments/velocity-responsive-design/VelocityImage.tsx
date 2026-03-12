"use client";

import { motion } from "motion/react";
import { SPRING_CONFIGS } from "./constants";
import { useVelocityState } from "./VelocityContext";

interface VelocityImageProps {
  alt: string;
  src: string;
}

export function VelocityImage({ src, alt }: VelocityImageProps) {
  const { normalizedVelocity, readingState, reducedMotion } =
    useVelocityState();

  const isSkim = readingState === "skim";

  return (
    <div
      className="grid transition-[grid-template-rows] duration-500 ease-out"
      style={{ gridTemplateRows: isSkim ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <motion.div
          animate={{
            opacity: isSkim ? 1 : 0,
            scale: isSkim ? 1 : 0.95,
            y: reducedMotion ? 0 : isSkim ? -normalizedVelocity * 20 : 0,
          }}
          className="my-12 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          transition={
            reducedMotion ? { duration: 0 } : SPRING_CONFIGS.IMAGE_TRANSITION
          }
        >
          <img
            alt={alt}
            className="block h-full w-full object-cover"
            src={src}
          />

          {!reducedMotion && normalizedVelocity > 0.4 && (
            <div
              className="pointer-events-none absolute inset-0 bg-white/5 mix-blend-overlay"
              style={{ opacity: (normalizedVelocity - 0.4) * 1.5 }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
