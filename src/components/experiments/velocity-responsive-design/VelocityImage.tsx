"use client";

import { AlertCircle, ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SPRING_CONFIGS } from "./constants";
import { useVelocityState } from "./VelocityContext";

interface VelocityImageProps {
  alt: string;
  src: string;
}

export function VelocityImage({ src, alt }: VelocityImageProps) {
  const { normalizedVelocity, readingState, reducedMotion } =
    useVelocityState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const isSkim = readingState === "skim";
  const opacity = 0.8 + (1 - normalizedVelocity) * 0.2;
  const instant = { duration: 0 };

  return (
    <motion.div
      animate={{
        height: isSkim ? "auto" : 0,
        opacity: isSkim ? 1 : 0,
        marginBottom: isSkim ? 80 : 0,
        marginTop: isSkim ? 80 : 0,
        pointerEvents: isSkim ? "auto" : "none",
      }}
      className="relative w-full overflow-hidden px-4 sm:px-0"
      initial={false}
      layout={reducedMotion ? undefined : "position"}
      transition={reducedMotion ? instant : SPRING_CONFIGS.IMAGE_TRANSITION}
    >
      <motion.div
        animate={{
          opacity,
          y: reducedMotion ? 0 : isSkim ? -normalizedVelocity * 20 : 0,
        }}
        className="relative z-10 flex aspect-video min-h-[200px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:min-h-[300px]"
        style={{ transformOrigin: "center center" }}
        transition={reducedMotion ? instant : SPRING_CONFIGS.IMAGE_MOTION}
      >
        <AnimatePresence mode="wait">
          {isSkim && !error ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="relative h-full w-full"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="content"
            >
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
                  <ImageIcon
                    className="animate-pulse"
                    size={48}
                    strokeWidth={1}
                  />
                </div>
              ) : null}
              <motion.img
                alt={alt}
                className="block h-full w-full object-cover"
                onError={() => setError(true)}
                onLoad={() => setLoading(false)}
                src={src}
                transition={reducedMotion ? instant : { duration: 0.5 }}
              />
            </motion.div>
          ) : null}

          {error ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 text-zinc-600"
              initial={{ opacity: 0 }}
              key="error"
            >
              <AlertCircle size={40} strokeWidth={1} />
              <span className="font-mono text-xs uppercase tracking-widest">
                {alt} (Load Failed)
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          animate={{
            background:
              isSkim && !error
                ? `linear-gradient(to bottom, rgba(0,0,0,${normalizedVelocity * 0.3}), transparent)`
                : "rgba(0,0,0,0)",
          }}
          className="pointer-events-none absolute inset-0"
        />

        {!reducedMotion && normalizedVelocity > 0.4 && !error ? (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-white/5 mix-blend-overlay"
            style={{ opacity: (normalizedVelocity - 0.4) * 1.5 }}
          />
        ) : null}
      </motion.div>

      {!reducedMotion && (
        <motion.div
          animate={{
            opacity: isSkim && !error ? normalizedVelocity * 0.3 : 0,
          }}
          className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-[100px]"
        />
      )}
    </motion.div>
  );
}
