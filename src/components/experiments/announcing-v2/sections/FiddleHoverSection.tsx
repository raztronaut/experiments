"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDevControls } from "@/hooks/useDevControls";
import { FIDDLE_CONTENT, GRID_SYMBOLS } from "../data";

interface GridBlock {
  element: HTMLDivElement;
  gridX: number;
  gridY: number;
  highlightEndTime: number;
  isEmpty: boolean;
  scrambleInterval: ReturnType<typeof setInterval> | null;
  shouldScramble: boolean;
  x: number;
  y: number;
}

function getRandomSymbol() {
  return GRID_SYMBOLS[Math.floor(Math.random() * GRID_SYMBOLS.length)];
}

export function FiddleHoverSection() {
  const hoverImgRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<GridBlock[]>([]);
  const rafRef = useRef<number>(0);

  const gridParams = useDevControls("Fiddle Grid", {
    blockSize: { value: 25, min: 10, max: 60, step: 1 },
    detectionRadius: { value: 50, min: 10, max: 150, step: 5 },
    clusterSize: { value: 7, min: 1, max: 20, step: 1 },
    blockLifetime: { value: 300, min: 50, max: 1000, step: 25 },
    emptyRatio: { value: 0.3, min: 0, max: 1, step: 0.05 },
    scrambleRatio: { value: 0.25, min: 0, max: 1, step: 0.05 },
    scrambleInterval: { value: 150, min: 50, max: 500, step: 10 },
  });

  const paramsRef = useRef(gridParams);
  paramsRef.current = gridParams;

  const initGrid = useCallback(() => {
    const element = hoverImgRef.current;
    if (!element) {
      return;
    }

    const existing = element.querySelector(".fiddle-grid-overlay");
    if (existing) {
      existing.remove();
    }
    for (const b of blocksRef.current) {
      if (b.scrambleInterval) {
        clearInterval(b.scrambleInterval);
      }
    }
    blocksRef.current = [];

    const gridOverlay = document.createElement("div");
    gridOverlay.className = "fiddle-grid-overlay";

    const p = paramsRef.current;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const cols = Math.ceil(width / p.blockSize);
    const rows = Math.ceil(height / p.blockSize);

    const blocks: GridBlock[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const block = document.createElement("div");
        block.className = "fiddle-grid-block";

        const isEmpty = Math.random() < p.emptyRatio;
        block.textContent = isEmpty ? "" : getRandomSymbol();

        block.style.width = `${p.blockSize}px`;
        block.style.height = `${p.blockSize}px`;
        block.style.left = `${col * p.blockSize}px`;
        block.style.top = `${row * p.blockSize}px`;

        gridOverlay.appendChild(block);

        blocks.push({
          element: block,
          x: col * p.blockSize + p.blockSize / 2,
          y: row * p.blockSize + p.blockSize / 2,
          gridX: col,
          gridY: row,
          highlightEndTime: 0,
          isEmpty,
          shouldScramble: !isEmpty && Math.random() < p.scrambleRatio,
          scrambleInterval: null,
        });
      }
    }

    element.appendChild(gridOverlay);
    blocksRef.current = blocks;
  }, []);

  useEffect(() => {
    initGrid();

    const element = hoverImgRef.current;
    if (!element) {
      return;
    }

    const blocks = blocksRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let closestBlock: GridBlock | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const block of blocks) {
        const dx = mouseX - block.x;
        const dy = mouseY - block.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestBlock = block;
        }
      }

      const cfg = paramsRef.current;
      if (!closestBlock || closestDistance > cfg.detectionRadius) {
        return;
      }

      const currentTime = Date.now();
      closestBlock.element.classList.add("active");
      closestBlock.highlightEndTime = currentTime + cfg.blockLifetime;

      if (closestBlock.shouldScramble && !closestBlock.scrambleInterval) {
        const b = closestBlock;
        b.scrambleInterval = setInterval(() => {
          b.element.textContent = getRandomSymbol();
        }, cfg.scrambleInterval);
      }

      const clusterCount = Math.floor(Math.random() * cfg.clusterSize) + 1;
      let currentBlock = closestBlock;
      const activeBlocks = [closestBlock];

      for (let i = 0; i < clusterCount; i++) {
        const neighbors = blocks.filter((neighbor) => {
          if (activeBlocks.includes(neighbor)) {
            return false;
          }
          const dx = Math.abs(neighbor.gridX - currentBlock.gridX);
          const dy = Math.abs(neighbor.gridY - currentBlock.gridY);
          return dx <= 1 && dy <= 1;
        });

        if (neighbors.length === 0) {
          break;
        }

        const randomNeighbor =
          neighbors[Math.floor(Math.random() * neighbors.length)];

        randomNeighbor.element.classList.add("active");
        randomNeighbor.highlightEndTime =
          currentTime + cfg.blockLifetime + i * 10;

        if (randomNeighbor.shouldScramble && !randomNeighbor.scrambleInterval) {
          const nb = randomNeighbor;
          nb.scrambleInterval = setInterval(() => {
            nb.element.textContent = getRandomSymbol();
          }, cfg.scrambleInterval);
        }

        activeBlocks.push(randomNeighbor);
        currentBlock = randomNeighbor;
      }
    };

    element.addEventListener("mousemove", handleMouseMove);

    function updateHighlights() {
      const currentTime = Date.now();

      for (const block of blocks) {
        if (
          block.highlightEndTime > 0 &&
          currentTime > block.highlightEndTime
        ) {
          block.element.classList.remove("active");
          block.highlightEndTime = 0;

          if (block.scrambleInterval) {
            clearInterval(block.scrambleInterval);
            block.scrambleInterval = null;
            if (!block.isEmpty) {
              block.element.textContent = getRandomSymbol();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(updateHighlights);
    }

    rafRef.current = requestAnimationFrame(updateHighlights);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
      for (const block of blocks) {
        if (block.scrambleInterval) {
          clearInterval(block.scrambleInterval);
        }
      }
    };
  }, [initGrid]);

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

      <style>{`
        .fiddle-section {
          position: relative;
          width: 100%;
          background-color: #e3e3db;
        }

        .fiddle-nav,
        .fiddle-footer {
          position: relative;
          width: 100%;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
        }
        .fiddle-nav p,
        .fiddle-footer p {
          font-family: "Inter", "DM Sans", sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: -0.01rem;
          color: #1a1a1a;
        }

        .fiddle-hero {
          position: relative;
          width: 100%;
          height: 100svh;
          min-height: 500px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 2rem;
        }

        .fiddle-hover-img {
          position: relative;
          width: 700px;
          max-width: 100%;
          height: 500px;
          overflow: hidden;
        }
        .fiddle-hover-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fiddle-grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        .fiddle-grid-block {
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #1a1a1a;
          color: #e3e3db;
          font-family: "IBM Plex Mono", monospace;
          font-size: 20px;
          font-weight: 400;
          opacity: 0;
        }
        .fiddle-grid-block.active {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
