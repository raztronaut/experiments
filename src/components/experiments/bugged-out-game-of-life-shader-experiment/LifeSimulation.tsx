"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { GradientBackground } from './GradientBackground';

interface LifeSimulationProps {
    className?: string;
}

const CELL_SIZE = 8;

/**
 * LifeSimulation Component
 * 
 * Logic Refinement:
 * 1. Boosted reactivity to sparse populations.
 * 2. Increased STABLE_AGE to make patterns more distinct.
 */
export function LifeSimulation({ className }: LifeSimulationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const gradientContainerRef = useRef<HTMLDivElement>(null);
    const workerRef = useRef<Worker>(null);

    const [resolution, setResolution] = useState({ w: 0, h: 0 });

    // Reactive Shader Stats
    const [stats, setStats] = useState({
        density: 0,
        activity: 0,
        centroidX: 0.5,
        centroidY: 0.5
    });

    /**
     * WORKER INITIALIZATION
     */
    useEffect(() => {
        workerRef.current = new Worker(new URL('./simulation.worker.ts', import.meta.url));

        const handleResize = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;

            const w = Math.ceil(clientWidth / CELL_SIZE);
            const h = Math.ceil(clientHeight / CELL_SIZE);

            setResolution({ w, h });

            workerRef.current?.postMessage({
                type: 'INIT',
                width: w,
                height: h
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            workerRef.current?.terminate();
        };
    }, []);

    /**
     * RENDER LOOP
     */
    useEffect(() => {
        if (!canvasRef.current || !workerRef.current || resolution.w === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        canvas.width = resolution.w;
        canvas.height = resolution.h;
        ctx.imageSmoothingEnabled = false;

        const volatileCanvas = document.createElement('canvas');
        volatileCanvas.width = resolution.w;
        volatileCanvas.height = resolution.h;
        const volatileCtx = volatileCanvas.getContext('2d');

        const stableCanvas = document.createElement('canvas');
        stableCanvas.width = resolution.w;
        stableCanvas.height = resolution.h;
        const stableCtx = stableCanvas.getContext('2d');

        if (!volatileCtx || !stableCtx) return;

        let animateId: number;
        let lastGrid: Uint8Array | null = null;
        let lastAgeGrid: Uint8Array | null = null;

        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'UPDATE') {
                lastGrid = e.data.grid;
                lastAgeGrid = e.data.ageGrid;

                // Reactive stats with smoothing
                setStats(prev => ({
                    density: prev.density * 0.95 + e.data.stats.density * 0.05,
                    activity: prev.activity * 0.9 + e.data.stats.activity * 0.1,
                    centroidX: prev.centroidX * 0.98 + (e.data.stats.centroidX - 0.5) * 0.02,
                    centroidY: prev.centroidY * 0.98 + (e.data.stats.centroidY - 0.5) * 0.02
                }));
            }
        };

        const render = () => {
            workerRef.current?.postMessage({ type: 'TICK' });

            if (lastGrid && lastAgeGrid && ctx) {
                ctx.clearRect(0, 0, resolution.w, resolution.h);
                volatileCtx.clearRect(0, 0, resolution.w, resolution.h);
                stableCtx.clearRect(0, 0, resolution.w, resolution.h);

                const vData = volatileCtx.createImageData(resolution.w, resolution.h);
                const sData = stableCtx.createImageData(resolution.w, resolution.h);
                const vPixels = vData.data;
                const sPixels = sData.data;

                // Threshold for "Stable" behavior (slightly increased for better visual logic)
                const STABLE_AGE = 20;

                for (let i = 0; i < lastGrid.length; i++) {
                    const stride = i * 4;
                    const val = lastGrid[i];
                    const age = lastAgeGrid[i];

                    if (val > 0) {
                        if (val === 255) {
                            if (age < STABLE_AGE) {
                                vPixels[stride] = 255;
                                vPixels[stride + 1] = 255;
                                vPixels[stride + 2] = 255;
                                vPixels[stride + 3] = 255;
                            } else {
                                sPixels[stride] = 255;
                                sPixels[stride + 1] = 255;
                                sPixels[stride + 2] = 255;
                                sPixels[stride + 3] = 255;
                            }
                        } else {
                            vPixels[stride] = 255;
                            vPixels[stride + 1] = 255;
                            vPixels[stride + 2] = 255;
                            vPixels[stride + 3] = val;
                        }
                    }
                }

                volatileCtx.putImageData(vData, 0, 0);
                stableCtx.putImageData(sData, 0, 0);

                const sourceCanvas = gradientContainerRef.current?.querySelector('canvas');
                if (sourceCanvas) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.drawImage(volatileCanvas, 0, 0);
                    ctx.globalCompositeOperation = 'source-in';
                    ctx.drawImage(sourceCanvas, 0, 0, resolution.w, resolution.h);

                    stableCtx.globalCompositeOperation = 'source-in';
                    stableCtx.filter = 'hue-rotate(90deg) brightness(1.2)';
                    stableCtx.drawImage(sourceCanvas, 0, 0, resolution.w, resolution.h);
                    stableCtx.filter = 'none';

                    ctx.globalCompositeOperation = 'screen';
                    ctx.drawImage(stableCanvas, 0, 0);
                }
            }

            animateId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animateId);
        };
    }, [resolution]);

    // Input handlers
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!containerRef.current || !workerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

        workerRef.current.postMessage({ type: 'SPLAT', x, y, radius: 4 });
    };

    const handlePointerDown = () => {
        workerRef.current?.postMessage({ type: 'RESET' });
    };

    // REFINED MAPPING
    // Use a higher base intensity so it's NEVER dark
    const derivedIntensity = 0.3 + Math.min(0.6, stats.density * 20);
    // Speed increases more aggressively with activity
    const derivedSpeed = 0.5 + Math.min(2.5, stats.activity * 25);
    // Noise only appears during high turnovers
    const derivedNoise = Math.min(0.5, stats.activity * 10);

    return (
        <div
            ref={containerRef}
            className={cn("absolute inset-0 z-0", className)}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            style={{ touchAction: 'none', pointerEvents: 'auto' }}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full block rendering-pixelated"
                style={{ imageRendering: 'pixelated' }}
            />

            <div
                ref={gradientContainerRef}
                className="absolute inset-0 pointer-events-none opacity-0"
                aria-hidden="true"
            >
                <GradientBackground
                    intensity={derivedIntensity}
                    speed={derivedSpeed}
                    noise={derivedNoise}
                    offsetX={stats.centroidX * 30}
                    offsetY={stats.centroidY * 30}
                />
            </div>
        </div>
    );
}
