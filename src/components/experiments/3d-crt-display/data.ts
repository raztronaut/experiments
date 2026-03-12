const BASE = "/experiments/3d-crt-display";

export const DEFAULT_IMAGE = `${BASE}/default.jpg`;
export const MONITOR_MODEL = `${BASE}/monitor.glb`;

export interface Project {
  image: string;
  label: string;
}

export const PROJECTS: Project[] = [
  { label: "District", image: `${BASE}/project-img-1.jpg` },
  { label: "Waypoint", image: `${BASE}/project-img-2.jpg` },
  { label: "Corridor", image: `${BASE}/project-img-3.jpg` },
  { label: "Archive", image: `${BASE}/project-img-4.jpg` },
  { label: "Terminal", image: `${BASE}/project-img-5.jpg` },
];
