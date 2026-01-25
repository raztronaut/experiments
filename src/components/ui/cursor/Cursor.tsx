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

        const isSnapped = selectedElement.el && (status === "entering" || status === "shifting" || status === "entered");

        if (!isSnapped || status === "exiting") {
            // Normal cursor following
            gsap.to(cursorRef.current, {
                x: pos.x - 9,
                y: pos.y - 9,
                duration: 0.1,
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)", // Darkened from 0.4
                border: "0px solid rgba(255, 255, 255, 0)",
                mixBlendMode: "difference",
                backdropFilter: "none",
                ease: "none",
                overwrite: "auto"
            });
        } else if (selectedElement.el && isSnapped) {
            const rect = selectedElement.el.getBoundingClientRect();
            const amount = 4; // Subtler pull

            const xMid = rect.width / 2;
            const yMid = rect.height / 2;

            const relX = pos.x - rect.left;
            const relY = pos.y - rect.top;

            const xMove = (relX - xMid) / rect.width * amount;
            const yMove = (relY - yMid) / rect.height * amount;

            if (selectedElement.type === "block") {
                const padding = 1; // Tighter padding
                gsap.to(cursorRef.current, {
                    x: rect.left + xMove - (padding / 2),
                    y: rect.top + yMove - (padding / 2),
                    width: rect.width + padding,
                    height: rect.height + padding,
                    borderRadius: 8,
                    duration: 0.3,
                    ease: "power3.out",
                    backgroundColor: "rgba(255, 255, 255, 0.12)", // Darkened from 0.15
                    border: "1px solid rgba(255, 255, 255, 0.15)", // Darkened from 0.2
                    mixBlendMode: "normal",
                    backdropFilter: "none",
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
                    width: 1.5,
                    height: textSize,
                    borderRadius: 1,
                    duration: 0.15,
                    ease: "power2.out",
                    backgroundColor: "rgba(255, 255, 255, 0.8)", // Darkened from 0.9
                    border: "0px solid rgba(255, 255, 255, 0)",
                    mixBlendMode: "difference",
                    backdropFilter: "none",
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
            scale: pressing ? 0.9 : 1,
            duration: 0.1,
            overwrite: "auto"
        });
    }, [pressing, isHidden]);

    if (isHidden) return null;

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-[10000]"
            style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.3)', // Darkened from 0.4
                transform: 'translate3d(-100px, -100px, 0)'
            }}
        />
    );
};
