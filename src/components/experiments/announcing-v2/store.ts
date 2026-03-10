import tunnelRat from "tunnel-rat";
import { create } from "zustand";

interface AnnouncingStore {
  mouse: { x: number; y: number };
  scrollProgress: number;
  setMouse: (x: number, y: number) => void;
  setScrollProgress: (progress: number) => void;
}

export const useAnnouncingStore = create<AnnouncingStore>((set) => ({
  scrollProgress: 0,
  mouse: { x: 0, y: 0 },
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setMouse: (x, y) => set({ mouse: { x, y } }),
}));

// Create the global tunnel instance used to pass 3D scene elements from DOM React trees into the persistent GlobalCanvas
export const tunnel = tunnelRat();
