"use client";

import { useEffect, useRef } from "react";

export function ProgressIndicator() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!barRef.current) {
        return;
      }
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? window.scrollY / total : 0;
      barRef.current.style.transform = `scaleX(${progress})`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-100 h-1 w-full bg-white/5">
      <div
        className="h-full origin-left bg-white"
        ref={barRef}
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
