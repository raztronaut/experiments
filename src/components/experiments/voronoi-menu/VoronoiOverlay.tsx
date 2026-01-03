import React from 'react';
import { Point } from './useVoronoi';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VoronoiOverlayProps {
    points: Point[];
    activeIndex: number | null;
}

export function VoronoiOverlay({ points, activeIndex }: VoronoiOverlayProps) {
    return (
        <div className="absolute inset-0 z-10 pointer-events-none">
            {points.map((point, i) => {
                const isActive = i === activeIndex;

                return (
                    <motion.div
                        key={point.id}
                        className={cn(
                            "absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-colors duration-300",
                            isActive ? "text-blue-400 z-20" : "text-white/40 z-0"
                        )}
                        style={{
                            left: point.x,
                            top: point.y
                        }}
                        animate={{
                            scale: isActive ? 1.5 : 1,
                            opacity: isActive ? 1 : 0.5
                        }}
                        transition={{
                            type: "spring",
                            damping: 20,
                            stiffness: 300
                        }}
                    >
                        <div className="text-3xl mb-2">
                            {point.icon}
                        </div>
                        <div className={cn(
                            "text-xs font-bold uppercase tracking-widest bg-black/50 backdrop-blur-sm px-2 py-1 rounded",
                            isActive ? "opacity-100" : "opacity-0"
                        )}>
                            {point.label}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
