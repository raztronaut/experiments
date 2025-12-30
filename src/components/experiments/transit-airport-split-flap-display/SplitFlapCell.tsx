"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getPreviousChar, getNextChar, sanitizeChar } from './utils';

interface SplitFlapCellProps {
    char: string;
    className?: string;
    onFlip?: () => void;
    refreshKey?: number;
}

export function SplitFlapCell({ char: targetCharProp = " ", className, onFlip, refreshKey }: SplitFlapCellProps) {
    const sanitizedTarget = useMemo(() => sanitizeChar(targetCharProp), [targetCharProp]);
    const [currentChar, setCurrentChar] = useState(" ");
    const [isScrambling, setIsScrambling] = useState(false);
    const [prevRefreshKey, setPrevRefreshKey] = useState(refreshKey);

    // Synchronize state with props during render (React recommended pattern)
    if (refreshKey !== prevRefreshKey) {
        setPrevRefreshKey(refreshKey);
        setIsScrambling(true);
        setCurrentChar(" ");
    }

    const isFlipping = currentChar !== sanitizedTarget;

    // Reset scrambling during render if we reached the target
    if (!isFlipping && isScrambling) {
        setIsScrambling(false);
    }

    useEffect(() => {
        if (!isFlipping) return;

        const timer = setTimeout(() => {
            const next = getNextChar(currentChar);
            setCurrentChar(next);

            if (onFlip) {
                if (isScrambling || Math.random() > 0.5) {
                    onFlip();
                }
            }
        }, 40);

        return () => clearTimeout(timer);
    }, [currentChar, isFlipping, onFlip, isScrambling, sanitizedTarget]);

    return (
        <div
            className={cn("relative bg-[#1a1a1a] rounded-[2px] overflow-hidden perspective-1000 select-none", className)}
            style={{
                width: 'var(--flap-w, 28px)',
                height: 'var(--flap-h, 44px)'
            }}
        >
            {/* Static Background (Target/Incoming Character) */}
            <div className="absolute inset-0 flex flex-col">
                <div className="h-1/2 w-full bg-[#1a1a1a] border-b border-black/50 flex items-end justify-center overflow-hidden">
                    <span
                        className="font-mono font-bold text-white translate-y-1/2 leading-none"
                        style={{ fontSize: 'var(--flap-font, 24px)' }}
                    >
                        {currentChar}
                    </span>
                </div>
                <div className="h-1/2 w-full bg-[#1a1a1a] flex items-start justify-center overflow-hidden">
                    <span
                        className="font-mono font-bold text-white -translate-y-1/2 leading-none"
                        style={{ fontSize: 'var(--flap-font, 24px)' }}
                    >
                        {currentChar}
                    </span>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {isFlipping && (
                    <motion.div
                        key={currentChar}
                        initial={{ rotateX: 0 }}
                        animate={{ rotateX: -180 }}
                        exit={{ display: "none" }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        style={{ transformOrigin: "bottom", zIndex: 10 }}
                        className="absolute top-0 left-0 w-full h-1/2 bg-[#1a1a1a] border-b border-black/50 flex items-end justify-center overflow-hidden backface-hidden"
                    >
                        <span
                            className="font-mono font-bold text-white translate-y-1/2 leading-none"
                            style={{ fontSize: 'var(--flap-font, 24px)' }}
                        >
                            {getPreviousChar(currentChar)}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative center line */}
            <div className="absolute top-[calc(50%-0.5px)] md:top-[calc(50%-1px)] left-0 w-full h-[1px] md:h-[2px] bg-black/80 z-20 shadow-sm" />
        </div>
    );
}
