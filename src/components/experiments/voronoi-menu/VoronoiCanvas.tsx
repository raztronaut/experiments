import React, { useRef, useEffect } from 'react';
import { useVoronoi, Point } from './useVoronoi';

interface VoronoiCanvasProps {
    points: Point[];
    width: number;
    height: number;
    activeindex: number | null;
    debug?: boolean;
    renderCell?: (ctx: CanvasRenderingContext2D, point: Point, path: Path2D, isActive: boolean, isHovered: boolean) => void;
}

export function VoronoiCanvas({ points, width, height, activeindex, debug = false, renderCell }: VoronoiCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { voronoi } = useVoronoi(points, width, height);

    // Animation frame for "breathing" effect
    const frameRef = useRef<number>(0);
    const timeRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !voronoi) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const render = () => {
            timeRef.current += 0.01;
            ctx.clearRect(0, 0, width, height);

            // 1. Draw all cells
            ctx.beginPath();
            voronoi.render(ctx);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 1.5 Draw "Active State" backgrounds (persistent glow for ON items) OR Colors
            points.forEach((point, i) => {
                const isActive = point.isActive;
                const isHovered = i === activeindex;
                const cellPath = new Path2D(voronoi.renderCell(i));

                if (renderCell) {
                    // Strategy Pattern: Delegate to scenario
                    ctx.save();
                    renderCell(ctx, point, cellPath, !!isActive, isHovered);
                    ctx.restore();
                } else {
                    // Default Fallback: The original "Breathing Blue" logic
                    if (point.color) {
                        ctx.save();
                        ctx.fillStyle = point.color;
                        ctx.fill(cellPath);
                        if (!isHovered) {
                            ctx.fillStyle = 'rgba(0,0,0,0.4)';
                            ctx.fill(cellPath);
                        }
                        ctx.restore();
                    } else if (isActive && !isHovered) {
                        // Standard Glow
                        ctx.save();
                        // Re-render path to fill
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                        ctx.fill(cellPath);
                        ctx.restore();
                    }
                }
            });

            // 2. Draw active cell with "breathing" gradient (ONLY if no custom renderCell or if we want to layer it?)
            // Actually, if renderCell is provided, it should handle EVERYTHING including hover state.
            // But let's keep the default behavior for the "FallBack" case distinct.

            if (!renderCell && activeindex !== null && activeindex !== undefined) {
                ctx.beginPath();
                voronoi.renderCell(activeindex, ctx);

                // Create gradient for active cell
                // We need the center of the cell (the generator point)
                const point = points[activeindex];
                if (point) {
                    const gradient = ctx.createRadialGradient(
                        point.x, point.y, 10,
                        point.x, point.y, Math.max(width, height) / 2
                    );

                    // Pulse intensity
                    const pulse = (Math.sin(timeRef.current * 3) + 1) / 2; // 0 to 1
                    const alpha1 = 0.2 + (pulse * 0.1); // 0.2 to 0.3

                    gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha1})`); // Blue-500
                    gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);

                    ctx.fillStyle = gradient;
                    ctx.fill();

                    // Highlight border of active cell
                    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            // 3. Draw Points (Generators) if debug
            if (debug) {
                ctx.beginPath();
                voronoi.renderBounds(ctx);
                ctx.strokeStyle = "#f00";
                ctx.stroke();

                points.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
                    ctx.fillStyle = "white";
                    ctx.fill();
                });
            }

            frameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(frameRef.current);
        };
    }, [voronoi, width, height, activeindex, points, debug, renderCell]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ width, height }}
        />
    );
}
