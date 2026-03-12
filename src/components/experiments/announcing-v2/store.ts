import { create } from "zustand";

interface AnnouncingV2State {
  activeExperimentSlug: string | null;
  activeSection: string;
  blueprintProgress: number;
  mousePosition: { x: number; y: number };
  processProgress: number;
  setActiveExperiment: (slug: string | null) => void;
  setActiveSection: (section: string) => void;
  setBlueprintProgress: (progress: number) => void;
  setMousePosition: (x: number, y: number) => void;
  setProcessProgress: (progress: number) => void;
}

export const useAnnouncingStore = create<AnnouncingV2State>((set) => ({
  blueprintProgress: 0,
  processProgress: 0,
  activeSection: "hero",
  activeExperimentSlug: null,
  mousePosition: { x: 0, y: 0 },
  setBlueprintProgress: (progress) => set({ blueprintProgress: progress }),
  setProcessProgress: (progress) => set({ processProgress: progress }),
  setActiveSection: (section) => set({ activeSection: section }),
  setActiveExperiment: (slug) => set({ activeExperimentSlug: slug }),
  setMousePosition: (x, y) => set({ mousePosition: { x, y } }),
}));
