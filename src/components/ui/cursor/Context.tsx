"use client";

import { createContext, useContext } from "react";

export type CursorType = "default" | "block" | "text";

export interface CursorContextType {
  isHidden: boolean;
  pressing: boolean;
  removeSelectedElement: () => void;
  selectedElement: {
    el: HTMLElement | null;
    type: CursorType;
    config?: Record<string, unknown>;
  };
  setIsHidden: (hidden: boolean) => void;
  setSelectedElement: (element: {
    el: HTMLElement | null;
    type: CursorType;
    config?: Record<string, unknown>;
  }) => void;
  setStatus: (status: string) => void;
  status: string;
}

export const CursorContext = createContext<CursorContextType | null>(null);

const FALLBACK: CursorContextType = {
  isHidden: true,
  pressing: false,
  removeSelectedElement: () => {},
  selectedElement: { el: null, type: "default" },
  setIsHidden: () => {},
  setSelectedElement: () => {},
  setStatus: () => {},
  status: "",
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      console.warn("useCursor: no CursorProvider found, using inert fallback");
    }
    return FALLBACK;
  }
  return context;
};
