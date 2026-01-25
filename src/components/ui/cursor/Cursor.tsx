"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useCursor } from './Context';

export const Cursor: React.FC = () => {
    const { pos, selectedElement, status, pressing, setStatus, isHidden } = useCursor();
    const cursorRef = useRef<HTMLDivElement>(null);

    // Update position smoothly
    useEffect(() => {
        if (!cursorRef.current || isHidden) return;

        // Use a quicker, cleaner animation for the default cursor
        if (!selectedElement.el || status === "exiting") {
            gsap.to(cursorRef.current, {
                x: pos.x - 12,
                y: pos.y - 12,
                duration: 0.15,
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.4)",
                ease: "power2.out",
                overwrite: "auto"
            });
        } else if (selectedElement.el && (status === "entering" || status === "shifting" || status === "entered")) {
            const rect = selectedElement.el.getBoundingClientRect();
            const amount = 5; // Magnetic pull amount

            const xMid = rect.width / 2;
            const yMid = rect.height / 2;

            const relX = pos.x - rect.left;
            const relY = pos.y - rect.top;

            const xMove = (relX - xMid) / rect.width * amount;
            const yMove = (relY - yMid) / rect.height * amount;

            if (selectedElement.type === "block") {
                const padding = 8;
                gsap.to(cursorRef.current, {
                    x: rect.left + xMove - (padding / 2),
                    y: rect.top + yMove - (padding / 2),
                    width: rect.width + padding,
                    height: rect.height + padding,
                    borderRadius: 12,
                    duration: 0.35,
                    ease: "elastic.out(1, 0.85)",
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    overwrite: "auto",
                    onComplete: () => {
                        if (status !== "entered") setStatus("entered");
                    }
                });
            } else if (selectedElement.type === "text") {
                const textSize = (selectedElement.config?.textSize as number) || 20;
                gsap.to(cursorRef.current, {
                    x: pos.x,
                    y: pos.y - (textSize / 2),
                    width: 3,
                    height: textSize,
                    borderRadius: 2,
                    duration: 0.2,
                    ease: "power2.out",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    overwrite: "auto",
                    onComplete: () => {
                        if (status !== "entered") setStatus("entered");
                    }
                });
            }
        }
    }, [pos, selectedElement, status, setStatus, isHidden]);

    // Pressing effect
    useEffect(() => {
        if (!cursorRef.current || isHidden) return;
        gsap.to(cursorRef.current, {
            opacity: pressing ? 0.5 : 1,
            scale: pressing ? 0.8 : 1,
            duration: 0.2,
            overwrite: "auto"
        });
    }, [pressing, isHidden]);

    if (isHidden) return null;

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-[10000] mix-blend-difference"
            style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                transform: 'translate3d(-100px, -100px, 0)' // Initial off-screen
            }}
        />
    );
};
