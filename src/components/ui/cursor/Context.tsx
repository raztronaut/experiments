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

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};
