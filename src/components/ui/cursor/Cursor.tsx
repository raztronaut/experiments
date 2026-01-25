"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCursor } from './Context';

export const Cursor: React.FC = () => {
    const { selectedElement, status, pressing, setStatus, isHidden } = useCursor();
    const cursorRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch - only render after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Store latest state in refs to access in event listener without re-binding
    const stateRef = useRef({ selectedElement, status, isHidden });

    useEffect(() => {
        stateRef.current = { selectedElement, status, isHidden };
    }, [selectedElement, status, isHidden]);

    // Always use white color - mixBlendMode "difference" makes it visible on any background
    // On dark background: white stays white
    // On light background: white becomes dark (inverted)
    const getCursorColor = (alpha: number) => `rgba(255, 255, 255, ${alpha})`;

    // Update position smoothly
    useEffect(() => {
        if (!mounted) return;

        const onMouseMove = (e: MouseEvent) => {
            if (!cursorRef.current || stateRef.current.isHidden) return;

            const { selectedElement, status } = stateRef.current;
            const x = e.clientX;
            const y = e.clientY;

            const isSnapped = selectedElement.el && (status === "entering" || status === "shifting" || status === "entered");

            if (status === "" || status === "exiting" || !selectedElement.el) {
                // Normal cursor following
                gsap.to(cursorRef.current, {
                    x: x - 9,
                    y: y - 9,
                    duration: 0.1,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: getCursorColor(0.3),
                    border: `0px solid ${getCursorColor(0)}`,
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

                const relX = x - rect.left;
                const relY = y - rect.top;

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
                        backgroundColor: getCursorColor(0.15),
                        border: `1px solid ${getCursorColor(0.2)}`,
                        mixBlendMode: "difference", // Changed from "normal" for light mode visibility
                        backdropFilter: "none",
                        overwrite: "auto",
                        onComplete: () => {
                            if (status !== "entered") setStatus("entered");
                        }
                    });
                } else if (selectedElement.type === "text") {
                    const textSize = (selectedElement.config?.textSize as number) || 20;
                    gsap.to(cursorRef.current, {
                        x: x,
                        y: y - (textSize / 2),
                        width: 1.5,
                        height: textSize,
                        borderRadius: 1,
                        duration: 0.15,
                        ease: "power2.out",
                        backgroundColor: getCursorColor(0.8),
                        border: `0px solid ${getCursorColor(0)}`,
                        mixBlendMode: "difference",
                        backdropFilter: "none",
                        overwrite: "auto",
                        onComplete: () => {
                            if (status !== "entered") setStatus("entered");
                        }
                    });
                }
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, [mounted, setStatus]);

    // Pressing effect
    useEffect(() => {
        if (!cursorRef.current || isHidden || !mounted) return;
        gsap.to(cursorRef.current, {
            scale: pressing ? 0.9 : 1,
            duration: 0.1,
            overwrite: "auto"
        });
    }, [pressing, isHidden, mounted]);

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted || isHidden) return null;

    // Always use white - mixBlendMode "difference" inverts it on light backgrounds

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-[10000]"
            style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translate3d(-100px, -100px, 0)'
            }}
        />
    );
};
