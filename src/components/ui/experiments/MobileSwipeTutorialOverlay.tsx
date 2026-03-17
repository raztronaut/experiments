"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const SWIPE_GESTURE_ICON_URL = "/swipe-gesture-icon.png";

interface MobileSwipeTutorialOverlayProps {
  onVisibilityChange?: (isVisible: boolean) => void;
}

export function MobileSwipeTutorialOverlay({
  onVisibilityChange,
}: MobileSwipeTutorialOverlayProps = {}) {
  const [stage, setStage] = useState<
    "waiting" | "visible" | "exiting" | "done"
  >("waiting");

  useEffect(() => {
    onVisibilityChange?.(stage === "visible" || stage === "exiting");
  }, [stage, onVisibilityChange]);

  useEffect(() => {
    // Start sequence
    const showTimer = setTimeout(() => {
      setStage("visible");
    }, 1000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (stage === "visible") {
      const exitTimer = setTimeout(() => {
        setStage("exiting");
      }, 4000); // Stay visible for 4s
      return () => clearTimeout(exitTimer);
    }

    if (stage === "exiting") {
      const doneTimer = setTimeout(() => {
        setStage("done");
      }, 600); // Allow time for exit animation
      return () => clearTimeout(doneTimer);
    }
  }, [stage]);

  if (stage === "done") {
    return null;
  }

  const isVisible = stage === "visible";

  return (
    <motion.div
      animate={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
      className="pointer-events-none absolute top-4 right-4 z-20 md:hidden"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Icon Container */}
      <motion.div className="relative rounded-md border border-border/50 bg-background/20 p-2.5 shadow-lg backdrop-blur-md">
        <motion.div
          animate={{
            x: [-3, 3, -3],
          }}
          className="relative h-5 w-5 bg-black dark:bg-white"
          style={{
            maskImage: `url(${SWIPE_GESTURE_ICON_URL})`,
            WebkitMaskImage: `url(${SWIPE_GESTURE_ICON_URL})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
