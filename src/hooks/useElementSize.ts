import { useState, useEffect, useCallback } from "react";

interface Size {
    width: number;
    height: number;
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
    const [element, setElement] = useState<T | null>(null);
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });

    // Callback ref to handle elements that appear/disappear (e.g. conditional rendering)
    const ref = useCallback((node: T | null) => {
        if (node !== null) {
            setElement(node);
        }
    }, []);

    useEffect(() => {
        if (!element) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            // We prefer borderBoxSize for filters that cover the whole element
            const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
            const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;

            // Update state with newly measured dimensions
            setSize((prev) => {
                if (Math.abs(prev.width - width) < 0.1 && Math.abs(prev.height - height) < 0.1) {
                    return prev;
                }
                return { width, height };
            });
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);

    return { ref, width: size.width, height: size.height };
}

