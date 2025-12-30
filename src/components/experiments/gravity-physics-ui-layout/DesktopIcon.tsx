'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Matter from 'matter-js';
import { usePhysics } from './PhysicsContext';

interface DesktopIconProps {
    x: number;
    y: number;
    label: string;
    iconSrc: string;
    width?: number;
    height?: number;
    onDoubleClick?: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ x, y, label, iconSrc, width = 64, height = 64, onDoubleClick }) => {
    const { engine, isReady } = usePhysics();
    const bodyRef = useRef<Matter.Body | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const [isSelected, setIsSelected] = useState(false);

    // Initialize Physics Body
    useEffect(() => {
        if (!engine || !isReady || !elementRef.current) return;

        // Create a rectangular body for the icon
        // High air friction to stop it from drifting endlessly (like "bumper cars" in fluid)
        const body = Matter.Bodies.rectangle(x, y, width + 20, height + 20, {
            frictionAir: 0.15, // Damping - stops relatively quickly after being hit
            restitution: 0.5, // Bounciness
            density: 0.001,
            label: `icon-${label}`
        });

        bodyRef.current = body;
        Matter.World.add(engine.world, body);

        // Sync loop
        const updatePosition = () => {
            if (bodyRef.current && elementRef.current) {
                const { position, angle } = bodyRef.current;
                // Icons usually don't rotate in OS X, so we might lock rotation or keep it subtle
                // For "bumper cars", subtle rotation is fun.
                const degrees = angle * (180 / Math.PI);
                elementRef.current.style.transform = `translate(${position.x - (width + 40) / 2}px, ${position.y - (height + 20) / 2}px) rotate(${degrees}deg)`;
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
    }, [engine, isReady]); // Only run once on mount to set initial position

    return (
        <div
            ref={elementRef}
            className="absolute top-0 left-0 flex flex-col items-center justify-start select-none group pointer-events-auto"
            style={{
                width: width + 40, // Click area
                willChange: 'transform'
                // Position handled by transform
            }}
            onMouseDown={() => {
                // Do NOT stop propagation. We want the event to bubble to the GravityDesktop container
                // so that Matter.MouseConstraint can detect the mouse down and initiate a physics drag.
                setIsSelected(true);
            }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick?.();
            }}
        >
            <div className={`relative w-[${width}px] h-[${height}px] mb-1 ${isSelected ? 'brightness-[0.8]' : ''} pointer-events-none`}>
                <Image
                    src={iconSrc}
                    alt={label}
                    width={width}
                    height={height}
                    className="object-contain drop-shadow-md"
                    draggable={false}
                />
            </div>

            {/* Label */}
            <div
                className={`
                    text-[12px] font-medium leading-tight text-center px-2 py-[2px] rounded-full max-w-full break-words pointer-events-none
                    ${isSelected
                        ? 'bg-[#3333cc] text-white'
                        : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'}
                `}
                style={{ fontFamily: '"Lucida Grande", sans-serif' }}
            >
                {label}
            </div>
        </div>
    );
};

export default DesktopIcon;
