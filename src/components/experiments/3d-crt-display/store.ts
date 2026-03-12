import { create } from "zustand";

interface CrtDisplayState {
  activeImage: string | null;
  mousePosition: { x: number; y: number };
  setActiveImage: (image: string | null) => void;
  setMousePosition: (x: number, y: number) => void;
}

export const useCrtDisplayStore = create<CrtDisplayState>((set) => ({
  activeImage: null,
  mousePosition: { x: 0, y: 0 },
  setActiveImage: (image) => set({ activeImage: image }),
  setMousePosition: (x, y) => set({ mousePosition: { x, y } }),
}));
