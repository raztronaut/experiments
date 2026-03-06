"use client";

import Matter from "matter-js";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { usePhysics } from "./PhysicsContext";

interface DesktopIconProps {
  height?: number;
  iconSrc: string;
  label: string;
  onDoubleClick?: () => void;
  width?: number;
  x: number;
  y: number;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({
  x,
  y,
  label,
  iconSrc,
  width = 64,
  height = 64,
  onDoubleClick,
}) => {
  const { engine, isReady } = usePhysics();
  const bodyRef = useRef<Matter.Body | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);

  // Initialize Physics Body
  useEffect(() => {
    if (!(engine && isReady && elementRef.current)) {
      return;
    }

    // Create a rectangular body for the icon
    // High air friction to stop it from drifting endlessly (like "bumper cars" in fluid)
    const body = Matter.Bodies.rectangle(x, y, width + 20, height + 20, {
      frictionAir: 0.15, // Damping - stops relatively quickly after being hit
      restitution: 0.5, // Bounciness
      density: 0.001,
      label: `icon-${label}`,
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

    Matter.Events.on(engine, "afterUpdate", updatePosition);

    return () => {
      if (engine && bodyRef.current) {
        Matter.World.remove(engine.world, bodyRef.current);
        Matter.Events.off(engine, "afterUpdate", updatePosition);
      }
    };
  }, [engine, isReady, height, label, width, x, y]); // Only run once on mount to set initial position

  return (
    <div
      className="group pointer-events-auto absolute top-0 left-0 flex select-none flex-col items-center justify-start"
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.();
      }}
      onMouseDown={() => {
        // Do NOT stop propagation. We want the event to bubble to the GravityDesktop container
        // so that Matter.MouseConstraint can detect the mouse down and initiate a physics drag.
        setIsSelected(true);
      }}
      ref={elementRef}
      style={{
        width: width + 40, // Click area
        willChange: "transform",
        // Position handled by transform
      }}
    >
      <div
        className={`relative w-[${width}px] h-[${height}px] mb-1 ${isSelected ? "brightness-[0.8]" : ""} pointer-events-none`}
      >
        <Image
          alt={label}
          className="object-contain drop-shadow-md"
          draggable={false}
          height={height}
          src={iconSrc}
          width={width}
        />
      </div>

      {/* Label */}
      <div
        className={`pointer-events-none max-w-full break-words rounded-full px-2 py-[2px] text-center font-medium text-[12px] leading-tight ${
          isSelected
            ? "bg-[#3333cc] text-white"
            : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        }
                `}
        style={{ fontFamily: '"Lucida Grande", sans-serif' }}
      >
        {label}
      </div>
    </div>
  );
};

export default DesktopIcon;
