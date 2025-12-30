'use client';

import { useEffect, useRef } from 'react';

interface StaticNoiseProps {
    isVisible?: boolean;
    className?: string;
}

export function StaticNoise({ isVisible = true, className = '' }: StaticNoiseProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isVisible) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth / 2; // Low res for "chunky" static
                canvas.height = parent.clientHeight / 2;
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const drawNoise = () => {
            const w = canvas.width;
            const h = canvas.height;
            const idata = ctx.createImageData(w, h);
            const buffer32 = new Uint32Array(idata.data.buffer);
            const len = buffer32.length;

            // Draw Noise
            for (let i = 0; i < len; i++) {
                if (Math.random() < 0.5) {
                    buffer32[i] = 0xff000000; // Black
                } else {
                    buffer32[i] = 0xffffffff; // White
                }
            }
            ctx.putImageData(idata, 0, 0);

            // Draw Color Glitches
            const colors = [
                'rgba(255, 0, 0, 0.5)',   // Red
                'rgba(0, 255, 0, 0.5)',   // Green
                'rgba(0, 0, 255, 0.5)',   // Blue
                'rgba(255, 255, 0, 0.5)', // Yellow
                'rgba(0, 255, 255, 0.5)', // Cyan
                'rgba(255, 0, 255, 0.5)', // Magenta
            ];

            const numBars = Math.floor(Math.random() * 5) + 2; // 2-7 bars
            for (let i = 0; i < numBars; i++) {
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                const barHeight = Math.random() * (h * 0.2); // Up to 20% of height
                const barY = Math.random() * h;
                ctx.fillRect(0, barY, w, barHeight);
            }

            animationFrameRef.current = requestAnimationFrame(drawNoise);
        };

        drawNoise();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full block image-pixelated ${className}`}
            style={{ imageRendering: 'pixelated' }}
        />
    );
}
