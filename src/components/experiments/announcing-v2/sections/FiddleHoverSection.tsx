"use client";

import { useDevControls } from "@/hooks/useDevControls";
import { FIDDLE_CONTENT } from "../data";
import { useFiddleGrid } from "../hooks/useFiddleGrid";
import "./fiddle-hover-section.css";

export function FiddleHoverSection() {
  const gridParams = useDevControls("Fiddle Grid", {
    blockSize: { value: 25, min: 10, max: 60, step: 1 },
    detectionRadius: { value: 50, min: 10, max: 150, step: 5 },
    clusterSize: { value: 7, min: 1, max: 20, step: 1 },
    blockLifetime: { value: 300, min: 50, max: 1000, step: 25 },
    emptyRatio: { value: 0.3, min: 0, max: 1, step: 0.05 },
    scrambleRatio: { value: 0.25, min: 0, max: 1, step: 0.05 },
    scrambleInterval: { value: 150, min: 50, max: 500, step: 10 },
  });

  const hoverImgRef = useFiddleGrid(gridParams);

  return (
    <section className="fiddle-section">
      <nav className="fiddle-nav">
        <p>{FIDDLE_CONTENT.navLeft}</p>
        <p>{FIDDLE_CONTENT.navRight}</p>
      </nav>

      <div className="fiddle-hero">
        <div className="fiddle-hover-img" ref={hoverImgRef}>
          <img alt="" src={FIDDLE_CONTENT.heroImage} />
        </div>
      </div>

      <footer className="fiddle-footer">
        <p>{FIDDLE_CONTENT.footerLeft}</p>
        <p>{FIDDLE_CONTENT.footerRight}</p>
      </footer>
    </section>
  );
}
