"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VoronoiCanvas } from './VoronoiCanvas';
import { useVoronoi, Point } from './useVoronoi';
import { SCENARIOS, ScenarioType, ScenarioPoint } from './scenarios';
import { VoronoiErrorBoundary } from './VoronoiErrorBoundary';
import { cn } from '@/lib/utils';

// --- Inner Component: Handles the specific scenario logic & state ---
// We key this component by scenario ID so it completely resets when switching.
function VoronoiExperiment({ scenario }: { scenario: ScenarioType }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const currentConfig = SCENARIOS[scenario];

    // Initialize state directly from config. No useEffect needed for data reset.
    // The "key" change on the parent ensures this runs fresh.
    const [items, setItems] = useState<ScenarioPoint[]>(() => {
        return SCENARIOS[scenario].getPoints(1, 1);
    });

    // Update dimensions on resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleItem = (index: number) => {
        // Use the scenario's custom interaction logic
        const newItems = currentConfig.onInteract(items, index);
        setItems(newItems);
    };

    // Derived Voronoi Points (Scaled)
    const points: Point[] = useMemo(() => {
        if (dimensions.width === 0) return [];
        return items.map(p => ({
            id: p.id,
            label: p.label,
            icon: p.icon ? <p.icon className={cn("w-8 h-8", p.isActive || p.color ? "text-white" : "text-white/30")} /> : null,
            x: p.x * dimensions.width,
            y: p.y * dimensions.height,
            isActive: p.isActive,
            color: p.color,
            value: p.value
        }));
    }, [items, dimensions]);

    const { findNearest } = useVoronoi(points, dimensions.width, dimensions.height);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dimensions.width) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const index = findNearest(e.clientX - rect.left, e.clientY - rect.top);
        setActiveIndex(index ?? null);
    };

    const Sidebar = currentConfig.SidebarComponent;

    return (
        <div className="flex flex-grow w-full border-b border-white/10 overflow-hidden">
            {/* Main Voronoi Area */}
            <div
                ref={containerRef}
                className="relative flex-grow bg-zinc-950 overflow-hidden cursor-none select-none"
                onPointerMove={handlePointerMove}
                onPointerLeave={() => setActiveIndex(null)}
                onClick={() => activeIndex !== null && toggleItem(activeIndex)}
            >
                {/* Header Info */}
                <div className="absolute top-8 left-8 z-30 pointer-events-none">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn("w-3 h-3 rounded-full animate-pulse bg-current", currentConfig.statusColor)} />
                        <span className={cn("text-xs font-mono uppercase tracking-widest", currentConfig.statusColor)}>
                            {currentConfig.systemStatus}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
                        {currentConfig.title}
                    </h1>
                    <p className="text-xs text-white/50 font-mono max-w-[200px]">
                        {currentConfig.subtitle}
                    </p>
                </div>

                {/* Overlays */}
                <div id="voronoi-overlay" className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                    {currentConfig.OverlayComponent && <currentConfig.OverlayComponent />}
                </div>

                {dimensions.width > 0 && (
                    <>
                        <VoronoiCanvas
                            points={points}
                            width={dimensions.width}
                            height={dimensions.height}
                            activeindex={activeIndex}
                            debug={false}
                            renderCell={currentConfig.renderCell}
                        />

                        <div className="absolute inset-0 z-10 pointer-events-none">
                            {items.map((item, i) => {
                                const p = points[i];
                                if (!p) return null;
                                const isActive = i === activeIndex;



                                return (
                                    <div key={item.id} className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300" style={{ left: p.x, top: p.y }}>
                                        <div className={cn("transition-transform duration-300 flex flex-col items-center gap-2", isActive ? "scale-125" : "scale-100")}>
                                            {item.icon && <item.icon className={cn("w-10 h-10 transition-colors duration-300", (item.isActive || isActive) ? "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "text-white/20")} />}
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className={cn("text-[10px] uppercase tracking-[0.2em] font-bold transition-colors", (item.isActive || isActive) ? "text-white" : "text-white/30")}>{item.label}</span>
                                                <span className={cn("text-xs font-mono transition-opacity duration-300", isActive ? "opacity-100 text-blue-400" : "opacity-0")}>{item.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Sidebar Context */}
            <div className="w-80 bg-zinc-900 border-l border-white/5 flex-shrink-0 relative z-20">
                <VoronoiErrorBoundary>
                    <Sidebar items={items} />
                </VoronoiErrorBoundary>
            </div>
        </div>
    );
}

// --- Main Container: Handles Switching ---
export default function VoronoiMenu() {
    const [scenario, setScenario] = useState<ScenarioType>('er-triage');

    return (
        <div className="flex flex-col w-full min-h-screen bg-black">
            <VoronoiExperiment key={scenario} scenario={scenario} />

            <div className="h-32 bg-zinc-900 border-t border-white/5 p-6 flex flex-col justify-center">
                <div className="max-w-7xl mx-auto w-full">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Select Use Case Simulation</p>
                    <div className="flex flex-wrap gap-4">
                        {(Object.keys(SCENARIOS) as ScenarioType[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => setScenario(key)}
                                className={cn(
                                    "px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 border",
                                    scenario === key
                                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105"
                                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                                )}
                            >
                                {SCENARIOS[key].title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}