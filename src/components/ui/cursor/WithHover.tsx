"use client";

import React, { useRef, useState, useCallback } from 'react';
import { useCursor, CursorType } from './Context';
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
    const { setSelectedElement, removeSelectedElement, selectedElement } = useCursor();
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
    }, [removeSelectedElement]);

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
