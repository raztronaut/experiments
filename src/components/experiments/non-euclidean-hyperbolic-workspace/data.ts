import type { NodeType } from "./HyperbolicGraphGen";

export const SVG_VIEWPORT_RADIUS = 300;
export const KEYBOARD_STEP = 0.1;
export const DRAG_SENSITIVITY = 0.8;

export const NODE_STYLE: Record<NodeType, string> = {
  root: "border-rose-500/20 bg-rose-500/10 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.1)]",
  area: "border-indigo-500/20 bg-indigo-500/10 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.1)]",
  project:
    "border-purple-500/20 bg-purple-500/10 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
  note: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  media:
    "border-amber-500/20 bg-amber-500/10 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
};
