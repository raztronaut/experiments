import { create } from "zustand";

interface AnnouncingV2State {
  activeExperimentSlug: string | null;
  activeSection: string;
  mousePosition: { x: number; y: number };
  scrollProgress: number;
  setActiveExperiment: (slug: string | null) => void;
  setActiveSection: (section: string) => void;
  setMousePosition: (x: number, y: number) => void;
  setScrollProgress: (progress: number) => void;
}

export const useAnnouncingStore = create<AnnouncingV2State>((set) => ({
  scrollProgress: 0,
  activeSection: "hero",
  activeExperimentSlug: null,
  mousePosition: { x: 0, y: 0 },
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setActiveSection: (section) => set({ activeSection: section }),
  setActiveExperiment: (slug) => set({ activeExperimentSlug: slug }),
  setMousePosition: (x, y) => set({ mousePosition: { x, y } }),
}));
