"use client";

import { createContext, useContext } from 'react';

export type CursorType = 'default' | 'block' | 'text';

export interface CursorContextType {
    selectedElement: {
        el: HTMLElement | null;
        type: CursorType;
        config?: Record<string, unknown>;
    };
    status: string;
    pressing: boolean;
    isHidden: boolean;
    setSelectedElement: (element: { el: HTMLElement | null; type: CursorType; config?: Record<string, unknown> }) => void;
    removeSelectedElement: () => void;
    setStatus: (status: string) => void;
    setIsHidden: (hidden: boolean) => void;
}

export const CursorContext = createContext<CursorContextType | null>(null);

export const useCursor = () => {
    const context = useContext(CursorContext);
    if (!context) {
        throw new Error('useCursor must be used within a CursorProvider');
    }
    return context;
};
