"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button, ControlGroup, Range } from "@/components/mdx/controls";
import { useCanvasResize } from "./useCanvasResize";
import {
  BG,
  C,
  DISK_R,
  diskToCanvas,
  drawDiskBorder,
  EDGE_ALPHA,
  geodesicArc,
  LABEL_ALPHA,
  PALETTE,
  setupCanvas,
} from "./utils";

const LAYER_RADII = [0, 0.4, 0.7, 0.88, 0.95];

function generateHyperbolicTree(
  depth: number,
  branching: number,
  jitter: number
) {
  const nodes: { pos: C; level: number; parent: number }[] = [
    { pos: new C(0, 0), level: 0, parent: -1 },
  ];
  const queue = [0];
  let idx = 0;

  while (idx < queue.length) {
    const pi = queue[idx++];
    const p = nodes[pi];
    if (p.level >= depth || p.level >= LAYER_RADII.length - 1) {
      continue;
    }

    const count = Math.max(1, branching - p.level);
    const sectorSize = (Math.PI * 2) / (p.level === 0 ? count : count + 1);
    const baseAngle =
      p.level === 0
        ? Math.random() * Math.PI * 2
        : Math.atan2(p.pos.im, p.pos.re) - (sectorSize * count) / 2;

    for (let i = 0; i < count; i++) {
      const jitterAmount = (Math.random() - 0.5) * sectorSize * (jitter / 100);
      const angle = baseAngle + sectorSize * (i + 0.5) + jitterAmount;
      const r = LAYER_RADII[p.level + 1];
      nodes.push({
        pos: new C(Math.cos(angle) * r, Math.sin(angle) * r),
        level: p.level + 1,
        parent: pi,
      });
      queue.push(nodes.length - 1);
    }
  }
  return nodes;
}

export function HyperbolicTreeDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState(3);
  const [branching, setBranching] = useState(3);
  const [jitter, setJitter] = useState(20);
  const [seed, setSeed] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: seed is an intentional cache-buster
  const tree = useMemo(
    () => generateHyperbolicTree(depth, branching, jitter),
    [depth, branching, jitter, seed]
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

    const r = Math.min(w, h) * DISK_R;
    const cx = w / 2;
    const cy = h / 2;
    const edgeColor = `rgba(255,255,255,${EDGE_ALPHA})`;

    drawDiskBorder(ctx, cx, cy, r);

    for (const node of tree) {
      if (node.parent >= 0) {
        geodesicArc(ctx, tree[node.parent].pos, node.pos, cx, cy, r, edgeColor);
      }
    }

    for (const node of tree) {
      const [px, py] = diskToCanvas(node.pos, cx, cy, r);
      const scale = Math.max(0, 1 - node.pos.abs() ** 2);
      const sz = Math.max(3, 7 * scale);
      ctx.beginPath();
      ctx.arc(px, py, sz, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE[node.level] ?? PALETTE[4];
      ctx.fill();
    }

    ctx.fillStyle = `rgba(255,255,255,${LABEL_ALPHA})`;
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${tree.length} nodes`, 12, h - 10);
  }, [tree]);

  useCanvasResize(canvasRef, draw);

  return (
    <div className="space-y-4">
      <canvas
        className="h-[300px] w-full rounded border border-border"
        ref={canvasRef}
        style={{ background: BG }}
      />
      <ControlGroup columns={2} compact>
        <Range
          label="Depth"
          max={4}
          min={1}
          onChange={setDepth}
          step={1}
          value={depth}
        />
        <Range
          label="Branching"
          max={4}
          min={2}
          onChange={setBranching}
          step={1}
          value={branching}
        />
        <Range
          formatValue={(v) => `${v}%`}
          label="Jitter"
          max={50}
          min={0}
          onChange={setJitter}
          step={1}
          value={jitter}
        />
        <Button onClick={() => setSeed((s) => s + 1)}>Regenerate</Button>
      </ControlGroup>
    </div>
  );
}
