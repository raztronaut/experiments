"use client";

import Matter from "matter-js";
import type React from "react";
import { useEffect, useRef } from "react";
import { usePhysics } from "./PhysicsContext";

interface DesktopWindowProps {
  children?: React.ReactNode;
  height?: number;
  onClose?: () => void;
  title: string;
  width?: number;
  x: number;
  y: number;
}

const DesktopWindow: React.FC<DesktopWindowProps> = ({
  x,
  y,
  width = 400,
  height = 300,
  title,
  children,
  onClose,
}) => {
  const { engine, isReady } = usePhysics();
  const bodyRef = useRef<Matter.Body | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Keep track of internal close request to remove from physics properly
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  useEffect(() => {
    if (!(engine && isReady && elementRef.current)) {
      return;
    }

    const body = Matter.Bodies.rectangle(x, y, width, height, {
      friction: 0.1,
      restitution: 0.4, // Bouncy windows
      density: 0.005, // Heavier than icons
      chamfer: { radius: 10 }, // Rounded corners collision
      collisionFilter: {
        category: 0x00_02, // Category: Window
        // Mask: Default (Walls/Icons=1) | DockBase(4) | DockIcons(8)
        // Excludes: Other Windows (2)
        mask: 0x00_01 | 0x00_04 | 0x00_08,
      },
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

    Matter.Events.on(engine, "afterUpdate", updatePosition);

    return () => {
      if (engine && bodyRef.current) {
        Matter.World.remove(engine.world, bodyRef.current);
        Matter.Events.off(engine, "afterUpdate", updatePosition);
      }
    };
  }, [engine, height, isReady, width, x, y]); // Run once on mount

  return (
    <div
      className="pointer-events-auto absolute top-0 left-0 flex select-none flex-col overflow-hidden rounded-lg border border-gray-400/50 bg-[#e8e8e8] shadow-2xl"
      ref={elementRef}
      style={{
        width,
        height,
        willChange: "transform",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      }}
    >
      {/* Window Bar */}
      <div className="flex h-6 w-full cursor-grab items-center border-[#b4b4b4] border-b bg-linear-to-b from-[#f6f6f6] to-[#dcdcdc] px-2 active:cursor-grabbing">
        <div className="flex space-x-2">
          <button
            className="h-3 w-3 rounded-full border border-[#e0443e] bg-[#ff5f57] shadow-inner transition-colors hover:bg-[#ff5f57]/80 active:bg-[#bf4c46]"
            onClick={handleClose}
          />
          <div className="h-3 w-3 rounded-full border border-[#dea123] bg-[#ffbd2e] shadow-inner" />
          <div className="h-3 w-3 rounded-full border border-[#1aab29] bg-[#28ca41] shadow-inner" />
        </div>
        <div className="pointer-events-none flex-1 text-center font-semibold text-gray-600 text-xs drop-shadow-xs">
          {title}
        </div>
        <div className="w-14" /> {/* Spacer for centering */}
      </div>

      {/* Content Area */}
      <div
        className="pointer-events-auto relative flex-1 overflow-hidden bg-white"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Brushed metal sidebar imitation or just content */}
        {children || (
          <div className="p-4 font-sans text-gray-800 text-sm">
            <h3 className="mb-2 font-bold">Welcome to Aqua</h3>
            <p>
              This window is a rigid body. You can throw it against the walls.
            </p>
            <div className="mt-4 rounded border border-blue-200 bg-blue-100 p-2">
              Status:{" "}
              <span className="font-bold text-green-600">Physics Active</span>
            </div>
          </div>
        )}

        {/* Stripe overlay for retro feel */}
        <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes-light.png')] opacity-[0.03]" />
      </div>
    </div>
  );
};

export default DesktopWindow;
