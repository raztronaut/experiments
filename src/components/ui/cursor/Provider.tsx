"use client";

import React, { useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { CursorContext, CursorType } from './Context';
import { Cursor } from './Cursor';

export const CursorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [selectedElement, setSelectedElementState] = useState<{
        el: HTMLElement | null;
        type: CursorType;
        config?: Record<string, unknown>;
    }>({ el: null, type: 'default' });
    const [status, setStatus] = useState<string>("");
    const [pressing, setPressing] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkTouch = () => {
            setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };
        checkTouch();

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        const handleMouseDown = () => setPressing(true);
        const handleMouseUp = () => setPressing(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Sync global cursor style
    useEffect(() => {
        const shouldHideSystemCursor = !isTouchDevice && !isHidden;

        const updateStyles = () => {
            const existingStyle = document.getElementById('cursor-none-style');
            if (existingStyle) existingStyle.remove();

            if (shouldHideSystemCursor) {
                document.body.style.cursor = 'none';
                const style = document.createElement('style');
                style.id = 'cursor-none-style';
                style.innerHTML = `* { cursor: none !important; }`;
                document.head.appendChild(style);
            } else {
                document.body.style.cursor = '';
            }
        };

        // Run immediately
        updateStyles();

        return () => {
            document.body.style.cursor = '';
            const style = document.getElementById('cursor-none-style');
            if (style) style.remove();
        };
    }, [isTouchDevice, isHidden]);

    const setSelectedElement = useCallback((element: { el: HTMLElement | null; type: CursorType; config?: Record<string, unknown> }) => {
        if (exitTimeoutRef.current) {
            clearTimeout(exitTimeoutRef.current);
            exitTimeoutRef.current = null;
        }

        setSelectedElementState(element);
        setStatus(prev => (prev === "" || prev === "exiting" ? "entering" : "shifting"));
    }, []);

    const removeSelectedElement = useCallback(() => {
        if (exitTimeoutRef.current) {
            clearTimeout(exitTimeoutRef.current);
        }

        setStatus("exiting");
        exitTimeoutRef.current = setTimeout(() => {
            setSelectedElementState({ el: null, type: 'default' });
            setStatus("");
            exitTimeoutRef.current = null;
        }, 150);
    }, []);

    const combinedHidden = isHidden || isTouchDevice;

    return (
        <CursorContext.Provider
            value={{
                pos: mousePos,
                selectedElement,
                status,
                pressing,
                isHidden: combinedHidden,
                setSelectedElement,
                removeSelectedElement,
                setStatus,
                setIsHidden
            }}
        >
            {children}
            {!combinedHidden && <Cursor />}
        </CursorContext.Provider>
    );
};
