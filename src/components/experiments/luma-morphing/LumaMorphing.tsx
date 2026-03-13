"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDevControls } from "@/hooks/useDevControls";
import {
  ANIMATION_DURATION_MS,
  CANVAS_SIZE,
  generateSequencePaths,
} from "./data";
import { useImageSequence } from "./hooks/useImageSequence";
import { useMorphAnimation } from "./hooks/useMorphAnimation";
import { MorphCanvas } from "./MorphCanvas";
import { Switcher } from "./Switcher";
import "./styles.css";

export default function LumaMorphing() {
  const [isDebug, setIsDebug] = useState(false);

  useEffect(() => {
    setIsDebug(new URLSearchParams(window.location.search).has("debug"));
  }, []);

  const { duration, resolution, showFrameIndex } = useDevControls(
    "Morph Controls",
    {
      duration: { value: ANIMATION_DURATION_MS, min: 100, max: 3000, step: 50 },
      resolution: { value: CANVAS_SIZE, options: [360, 720, 1080, 1440] },
      showFrameIndex: { value: false },
    }
  );

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const paths = useMemo(() => generateSequencePaths(), []);
  const { images, loaded, loadProgress } = useImageSequence(paths, isDebug);

  const { progressRef, animateTo } = useMorphAnimation({
    duration,
    reducedMotion,
    debug: isDebug,
  });

  const [activePersona, setActivePersona] = useState(1);

  const handleSelect = useCallback(
    (target: number) => {
      setActivePersona(target);
      animateTo(target);
    },
    [animateTo]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = activePersona >= 4 ? 1 : activePersona + 1;
        handleSelect(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = activePersona <= 1 ? 4 : activePersona - 1;
        handleSelect(prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePersona, handleSelect]);

  if (!loaded) {
    return (
      <div className="luma-morphing-loading">
        <div className="luma-morphing-loading-bar">
          <div
            className="luma-morphing-loading-fill"
            style={{ transform: `scaleX(${loadProgress})` }}
          />
        </div>
        <span className="luma-morphing-loading-text">
          {Math.round(loadProgress * 100)}%
        </span>
      </div>
    );
  }

  return (
    <div className="luma-morphing-content">
      <div className="luma-morphing-canvas-wrapper">
        <MorphCanvas
          images={images}
          progressRef={progressRef}
          resolution={resolution}
          showFrameIndex={showFrameIndex}
          debug={isDebug}
        />
        <div className="luma-morphing-vignette" aria-hidden />
      </div>
      <Switcher activePersona={activePersona} onSelect={handleSelect} />
    </div>
  );
}
