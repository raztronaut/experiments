"use client";

import React, { useState, useRef, useCallback } from 'react';
import { SplitFlapCell } from './SplitFlapCell';

interface SplitFlapRowProps {
    text: string;
    length: number;
    className?: string;
    onFlip?: () => void;
    interactive?: boolean;
}

export function SplitFlapRow({ text, length, className, onFlip, interactive = false }: SplitFlapRowProps) {
    const [refreshKey, setRefreshKey] = useState(0);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = useCallback(() => {
        if (!interactive) return;

        // Clear any existing timeout just in case
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

        hoverTimeoutRef.current = setTimeout(() => {
            setRefreshKey(prev => prev + 1);
        }, 500); // Trigger after 0.5s of hover
    }, [interactive]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    }, []);

    // Pad the text with spaces to match the target length
    const paddedText = text.padEnd(length, " ").slice(0, length);
    const characters = paddedText.split("");

    return (
        <div
            className={`flex ${className} ${interactive ? 'cursor-pointer' : ''}`}
            style={{ gap: 'var(--flap-gap, 2px)' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {characters.map((char, index) => (
                <SplitFlapCell
                    key={index}
                    char={char}
                    onFlip={onFlip}
                    refreshKey={refreshKey}
                />
            ))}
        </div>
    );
}
