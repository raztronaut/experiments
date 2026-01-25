"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCursor, CursorType } from './Context';
import { gsap } from 'gsap';
import { mergeRefs } from '@/lib/utils';

interface WithHoverProps {
    children: React.ReactElement<any>;
    type?: CursorType;
    config?: {
        hoverOffset?: number;
        [key: string]: unknown;
    };
}

export const WithHover: React.FC<WithHoverProps> = ({
    children,
    type = 'block',
    config = { hoverOffset: 3 },
}) => {
    const { setSelectedElement, removeSelectedElement, pos, selectedElement } = useCursor();
    const elementRef = useRef<HTMLElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const target = e.currentTarget;
        const result: { el: HTMLElement; type: CursorType; config: Record<string, unknown> } = {
            el: target,
            type,
            config: { ...config }
        };

        if (type === "text") {
            const computed = window.getComputedStyle(target).fontSize;
            result.config.textSize = parseFloat(computed.replace("px", ""));
        }

        setSelectedElement(result);
        setIsHovered(true);
    }, [type, config, setSelectedElement]);

    const handleMouseLeave = useCallback(() => {
        removeSelectedElement();
        setIsHovered(false);

        // Instant reset for elements to avoid that 'trailing' feeling
        if (elementRef.current) {
            gsap.to(elementRef.current, {
                x: 0,
                y: 0,
                duration: 0.2, // Faster
                ease: "power2.out",
                overwrite: true
            });
        }
    }, [removeSelectedElement]);

    useEffect(() => {
        if (isHovered && elementRef.current && selectedElement.el === elementRef.current && type === 'block') {
            const rect = elementRef.current.getBoundingClientRect();
            const xMid = rect.width / 2;
            const yMid = rect.height / 2;
            const relX = pos.x - rect.left;
            const relY = pos.y - rect.top;

            const configObj = config as Record<string, any>;
            const amount = configObj.hoverOffset ?? 3;

            const xMove = Math.max(Math.min((relX - xMid) / rect.width * amount, amount), -amount);
            const yMove = Math.max(Math.min((relY - yMid) / rect.height * amount, amount), -amount);

            gsap.to(elementRef.current, {
                x: xMove,
                y: yMove,
                duration: 0.1, // Even faster for instantaneous feedback
                ease: "power2.out",
                overwrite: "auto"
            });
        }
    }, [pos, isHovered, type, config, selectedElement.el]);

    const childrenWithRef = children as any;
    const mergedRef = mergeRefs(childrenWithRef.ref, elementRef);

    return React.cloneElement(children, {
        ref: mergedRef,
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
            handleMouseEnter(e);
            children.props.onMouseEnter?.(e);
        },
        onMouseOver: (e: React.MouseEvent<HTMLElement>) => {
            // Re-assert hover if we somehow lose it while moving internally
            if (!isHovered) setIsHovered(true);
            children.props.onMouseOver?.(e);
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
            handleMouseLeave();
            children.props.onMouseLeave?.(e);
        },
    } as any);
};
