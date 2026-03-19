"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ControlGroup, Range } from "@/components/mdx/controls";
import { useCanvasResize } from "./useCanvasResize";
import {
  BG,
  C,
  diskToCanvas,
  drawDiskBorder,
  EDGE_ALPHA,
  geodesicArc,
  LABEL_ALPHA,
  PALETTE,
  setupCanvas,
} from "./utils";

const EUCLIDEAN_RADII = [0, 0.3, 0.6, 0.85, 1.0];
const HYPERBOLIC_RADII = [0, 0.4, 0.7, 0.88, 0.95];

function generateTree(depth: number, branching: number) {
  const nodes: { level: number; angle: number; parent: number }[] = [
    { level: 0, angle: 0, parent: -1 },
  ];
  const queue = [0];
  let idx = 0;
  while (idx < queue.length) {
    const pi = queue[idx++];
    const p = nodes[pi];
    if (p.level >= depth) {
      continue;
    }
    const count = branching;
    const sectorSize = (Math.PI * 2) / (p.level === 0 ? count : count + 1);
    const baseAngle = p.level === 0 ? 0 : p.angle - (sectorSize * count) / 2;
    for (let i = 0; i < count; i++) {
      const a = baseAngle + sectorSize * (i + 0.5);
      nodes.push({ level: p.level + 1, angle: a, parent: pi });
      queue.push(nodes.length - 1);
    }
  }
  return nodes;
}

export function EuclideanVsHyperbolicDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [branching, setBranching] = useState(3);
  const [depth, setDepth] = useState(3);

  const tree = useMemo(
    () => generateTree(depth, branching),
    [depth, branching]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const setup = setupCanvas(canvas);
    if (!setup) {
      return;
    }
    const { ctx, w, h } = setup;

    const half = w / 2;
    const edgeColor = `rgba(255,255,255,${EDGE_ALPHA})`;

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(half, 0);
    ctx.lineTo(half, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(255,255,255,${LABEL_ALPHA})`;
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Euclidean", half / 2, 18);
    ctx.fillText("Poincaré disk", half + half / 2, 18);

    const eucR = Math.min(half, h) * 0.4;
    const eucCx = half / 2;
    const eucCy = h / 2;

    const hypR = Math.min(half, h) * 0.4;
    const hypCx = half + half / 2;
    const hypCy = h / 2;

    drawDiskBorder(ctx, hypCx, hypCy, hypR);

    for (const node of tree) {
      if (node.parent < 0) {
        continue;
      }
      const parent = tree[node.parent];

      const epr = EUCLIDEAN_RADII[parent.level] * eucR;
      const enr = EUCLIDEAN_RADII[node.level] * eucR;
      ctx.beginPath();
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1;
      ctx.moveTo(
        eucCx + Math.cos(parent.angle) * epr,
        eucCy + Math.sin(parent.angle) * epr
      );
      ctx.lineTo(
        eucCx + Math.cos(node.angle) * enr,
        eucCy + Math.sin(node.angle) * enr
      );
      ctx.stroke();

      const hp = new C(
        Math.cos(parent.angle) * HYPERBOLIC_RADII[parent.level],
        Math.sin(parent.angle) * HYPERBOLIC_RADII[parent.level]
      );
      const hn = new C(
        Math.cos(node.angle) * HYPERBOLIC_RADII[node.level],
        Math.sin(node.angle) * HYPERBOLIC_RADII[node.level]
      );
      geodesicArc(ctx, hp, hn, hypCx, hypCy, hypR, edgeColor);
    }

    for (const node of tree) {
      const col = PALETTE[node.level] ?? PALETTE[4];
      const eucRad = EUCLIDEAN_RADII[node.level] * eucR;
      const ex = eucCx + Math.cos(node.angle) * eucRad;
      const ey = eucCy + Math.sin(node.angle) * eucRad;
      const eSize = Math.max(3, 6 - node.level);
      ctx.beginPath();
      ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      const hr = HYPERBOLIC_RADII[node.level];
      const hz = new C(Math.cos(node.angle) * hr, Math.sin(node.angle) * hr);
      const conformalScale = Math.max(0, 1 - hz.abs() ** 2);
      const [hx, hy] = diskToCanvas(hz, hypCx, hypCy, hypR);
      const hSize = Math.max(2.5, 6 * conformalScale);
      ctx.beginPath();
      ctx.arc(hx, hy, hSize, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    }
  }, [tree]);

  useCanvasResize(canvasRef, draw);

  return (
    <div className="space-y-4">
      <canvas
        className="h-[260px] w-full rounded border border-border"
        ref={canvasRef}
        style={{ background: BG }}
      />
      <ControlGroup columns={2} compact>
        <Range
          label="Branching factor"
          max={5}
          min={2}
          onChange={setBranching}
          step={1}
          value={branching}
        />
        <Range
          label="Depth"
          max={4}
          min={1}
          onChange={setDepth}
          step={1}
          value={depth}
        />
      </ControlGroup>
    </div>
  );
}
