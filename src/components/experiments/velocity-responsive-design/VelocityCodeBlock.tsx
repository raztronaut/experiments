"use client";

import { FileCode, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING_CONFIGS } from "./constants";
import { useVelocityState } from "./VelocityContext";

interface VelocityCodeBlockProps {
  code: string;
  filename: string;
  language: string;
}

export function VelocityCodeBlock({
  filename,
  language,
  code,
}: VelocityCodeBlockProps) {
  const { readingState, reducedMotion } = useVelocityState();
  const isSkim = readingState === "skim";

  return (
    <motion.div
      animate={{
        scale: isSkim ? 0.98 : 1,
        opacity: isSkim ? 0.8 : 1,
      }}
      className={cn(
        "my-8 overflow-hidden rounded-lg border",
        isSkim
          ? "border-primary/20 bg-primary/5"
          : "border-white/10 bg-zinc-950"
      )}
      layout={!reducedMotion}
      transition={reducedMotion ? { duration: 0 } : SPRING_CONFIGS.TRANSITION}
    >
      <div className="flex items-center justify-between border-white/5 border-b bg-white/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <FileCode className="text-primary" size={14} />
          <span className="font-mono text-muted-foreground text-xs">
            {filename}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          {language}
        </span>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {isSkim ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex h-10 items-center gap-3 overflow-hidden px-4 text-primary/60 text-sm italic"
            exit={{ opacity: 0, scale: 0.98 }}
            initial={{ opacity: 0, scale: 1.02 }}
            key="skim"
            transition={reducedMotion ? { duration: 0 } : undefined}
          >
            {!reducedMotion && (
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent"
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            )}
            <Terminal size={14} />
            <span>Implementation details collapsed for speed...</span>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-x-auto p-4"
            exit={{ opacity: 0, scale: 1.02 }}
            initial={{ opacity: 0, scale: 0.98 }}
            key="detailed"
            transition={reducedMotion ? { duration: 0 } : undefined}
          >
            <pre className="font-mono text-sm text-zinc-300">
              <code>{code}</code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
