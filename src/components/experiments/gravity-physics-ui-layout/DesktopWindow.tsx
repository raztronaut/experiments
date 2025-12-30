'use client';

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { usePhysics } from './PhysicsContext';

interface DesktopWindowProps {
    x: number;
    y: number;
    width?: number;
    height?: number;
    title: string;
    children?: React.ReactNode;
    onClose?: () => void;
}

const DesktopWindow: React.FC<DesktopWindowProps> = ({ x, y, width = 400, height = 300, title, children, onClose }) => {
    const { engine, isReady } = usePhysics();
    const bodyRef = useRef<Matter.Body | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    // Keep track of internal close request to remove from physics properly
    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose?.();
    };

    useEffect(() => {
        if (!engine || !isReady || !elementRef.current) return;

        // Create the window body
        const body = Matter.Bodies.rectangle(x, y, width, height, {
            friction: 0.1,
            restitution: 0.4, // Bouncy windows
            density: 0.005, // Heavier than icons
            chamfer: { radius: 10 }, // Rounded corners collision
            collisionFilter: {
                category: 0x0002, // Category: Window
                // Mask: Default (Walls/Icons=1) | DockBase(4) | DockIcons(8)
                // Excludes: Other Windows (2)
                mask: 0x0001 | 0x0004 | 0x0008
            }
        });

        bodyRef.current = body;
        Matter.World.add(engine.world, body);

        // Sync loop
        const updatePosition = () => {
            if (bodyRef.current && elementRef.current) {
                const { position, angle } = bodyRef.current;
                const degrees = angle * (180 / Math.PI);

                elementRef.current.style.transform = `translate(${position.x - width / 2}px, ${position.y - height / 2}px) rotate(${degrees}deg)`;
            }
        };

        Matter.Events.on(engine, 'afterUpdate', updatePosition);

        return () => {
            if (engine && bodyRef.current) {
                Matter.World.remove(engine.world, bodyRef.current);
                Matter.Events.off(engine, 'afterUpdate', updatePosition);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine]); // Run once on mount

    return (
        <div
            ref={elementRef}
            className="absolute top-0 left-0 bg-[#e8e8e8] rounded-lg shadow-2xl border border-gray-400/50 flex flex-col overflow-hidden select-none pointer-events-auto"
            style={{
                width,
                height,
                willChange: 'transform',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
        >
            {/* Window Bar */}
            <div className="h-6 bg-gradient-to-b from-[#f6f6f6] to-[#dcdcdc] border-b border-[#b4b4b4] flex items-center px-2 cursor-grab active:cursor-grabbing w-full">
                <div className="flex space-x-2">
                    <button
                        onClick={handleClose}
                        className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-inner hover:bg-[#ff5f57]/80 active:bg-[#bf4c46] transition-colors"
                    />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-[#28ca41] border border-[#1aab29] shadow-inner" />
                </div>
                <div className="flex-1 text-center text-xs font-semibold text-gray-600 drop-shadow-sm pointer-events-none">
                    {title}
                </div>
                <div className="w-14" /> {/* Spacer for centering */}
            </div>

            {/* Content Area */}
            <div
                className="flex-1 bg-white relative overflow-hidden pointer-events-auto"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Brushed metal sidebar imitation or just content */}
                {children || (
                    <div className="p-4 text-sm text-gray-800 font-sans">
                        <h3 className="font-bold mb-2">Welcome to Aqua</h3>
                        <p>This window is a rigid body. You can throw it against the walls.</p>
                        <div className="mt-4 p-2 bg-blue-100 rounded border border-blue-200">
                            Status: <span className="text-green-600 font-bold">Physics Active</span>
                        </div>
                    </div>
                )}

                {/* Stripe overlay for retro feel */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes-light.png')]" />
            </div>
        </div>
    );
};

export default DesktopWindow;
