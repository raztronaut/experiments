"use client";

import React, { useCallback } from 'react';
import { useCursor, CursorType } from './Context';

interface WithHoverProps {
    children: React.ReactElement<{
        onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
        onMouseOver?: (e: React.MouseEvent<HTMLElement>) => void;
        onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
    }>;
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
    const { setSelectedElement, removeSelectedElement } = useCursor();

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
        } else {
            // For block types, capture the border radius to ensure the cursor matches the element shape
            const computed = window.getComputedStyle(target);
            result.config.borderRadius = computed.borderRadius;
        }

        setSelectedElement(result);
    }, [type, config, setSelectedElement]);

    const handleMouseLeave = useCallback(() => {
        removeSelectedElement();
    }, [removeSelectedElement]);

    // Get the only child
    const child = React.Children.only(children);

    return React.cloneElement(child, {
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
            handleMouseEnter(e);
            child.props.onMouseEnter?.(e);
        },
        onMouseOver: (e: React.MouseEvent<HTMLElement>) => {
            child.props.onMouseOver?.(e);
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
            handleMouseLeave();
            child.props.onMouseLeave?.(e);
        },
    });
};
