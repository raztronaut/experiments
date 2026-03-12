import Matter from "matter-js";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { usePhysics } from "./PhysicsContext";

// Config
const DOCK_ICONS = [
  {
    id: "finder",
    src: "/experiments/gravity-physics-ui-layout/icons/finder.png",
    label: "Finder",
    action: "finder",
  }, // Opens nothing or Finder?
  {
    id: "mail",
    src: "/experiments/gravity-physics-ui-layout/icons/mail.png",
    label: "Mail",
    action: "mail",
  },
  {
    id: "browser",
    src: "/experiments/gravity-physics-ui-layout/icons/browser.png",
    label: "Internet Explorer",
    action: "browser",
  },
  {
    id: "terminal",
    src: "/experiments/gravity-physics-ui-layout/icons/terminal.png",
    label: "Terminal",
    action: "terminal",
  }, // No window yet
  {
    id: "settings",
    src: "/experiments/gravity-physics-ui-layout/icons/settings.png",
    label: "System Preferences",
    action: "settings",
  }, // No window yet
  {
    id: "trash",
    src: "/experiments/gravity-physics-ui-layout/icons/trash-empty.png",
    label: "Trash",
    action: "trash",
  },
];

interface GravityDockProps {
  onOpenWindow: (id: string) => void;
}

const GravityDock: React.FC<GravityDockProps> = ({ onOpenWindow }) => {
  const { engine, isReady } = usePhysics();

  // Refs
  const dockBaseRef = useRef<HTMLDivElement>(null);
  const dockBodyRef = useRef<Matter.Body | null>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]); // Array of DOM refs
  const iconBodiesRef = useRef<Matter.Body[]>([]); // Array of Physics Bodies

  const [isSetup, setIsSetup] = useState(false);
  const [dockWidthState, setDockWidthState] = useState(600);

  useEffect(() => {
    if (!(engine && isReady) || isSetup) {
      return;
    }

    // --- 1. Dimensions ---
    const iconSize = 48; // Physics body size (visual is same)
    const gap = 12;
    const padding = 16;
    const totalIcons = DOCK_ICONS.length;
    // Total width = (icons * size) + ((icons - 1) * gap) + (padding * 2)
    const dockWidth =
      totalIcons * iconSize + (totalIcons - 1) * gap + padding * 2;
    const dockHeight = 70;

    const startX = window.innerWidth / 2;
    // Start higher to avoid initial collision with the floor (which causes explosion)
    const startY = window.innerHeight - 100;

    // --- 2. Create Base Body (The Glass Dock) ---
    const baseBody = Matter.Bodies.rectangle(
      startX,
      startY,
      dockWidth,
      dockHeight,
      {
        friction: 0.1,
        restitution: 0.2,
        density: 0.02, // Heavy base
        chamfer: { radius: 10 },
        frictionAir: 0.05,
        collisionFilter: { category: 0x00_04, mask: 0x00_01 | 0x00_02 }, // Base(4) collides with Walls(1) & Windows(2)
      }
    );
    dockBodyRef.current = baseBody;

    // --- 3. Create Icon Bodies & Constraints ---
    const newIconBodies: Matter.Body[] = [];
    const constraints: Matter.Constraint[] = [];

    DOCK_ICONS.forEach((_icon, index) => {
      // Calculate offset from center of dock
      // Total content width logic:
      const contentWidth = dockWidth - padding * 2;
      // x-position of this icon relative to left edge of content:
      // index * (size + gap) + (size/2)
      const relativeXFromLeft = index * (iconSize + gap) + iconSize / 2;
      const offsetX = relativeXFromLeft - contentWidth / 2 - gap / 2; // Center relative to body center

      // Initial pos matches dock
      const iconBody = Matter.Bodies.rectangle(
        startX + offsetX,
        startY,
        iconSize,
        iconSize,
        {
          density: 0.001, // Light
          frictionAir: 0.05,
          restitution: 0.5,
          render: { visible: false }, // We render via DOM
          collisionFilter: { category: 0x00_08, mask: 0x00_01 | 0x00_02 }, // Icons(8) collide with Walls(1) & Windows(2)
        }
      );

      // Constraint: Stiff spring to dock base
      const constraint = Matter.Constraint.create({
        bodyA: baseBody,
        bodyB: iconBody,
        pointA: { x: offsetX, y: 0 },
        pointB: { x: 0, y: 0 },
        stiffness: 0.1, // Stiff but allows jiggle
        damping: 0.1,
        length: 0,
        render: { visible: false },
      });

      newIconBodies.push(iconBody);
      constraints.push(constraint);
    });

    iconBodiesRef.current = newIconBodies;

    // Add everything to world
    Matter.World.add(engine.world, [
      baseBody,
      ...newIconBodies,
      ...constraints,
    ]);
    setDockWidthState(dockWidth);
    setIsSetup(true);

    // --- 4. Animation Loop ---
    const updatePosition = () => {
      // Update Base
      if (dockBodyRef.current && dockBaseRef.current) {
        const { position, angle } = dockBodyRef.current;
        const degrees = angle * (180 / Math.PI);
        dockBaseRef.current.style.transform = `translate(${position.x - dockWidth / 2}px, ${position.y - dockHeight / 2}px) rotate(${degrees}deg)`;
      }

      // Update Icons
      newIconBodies.forEach((body, i) => {
        const domNode = iconRefs.current[i];
        if (domNode) {
          const { position, angle } = body;
          const degrees = angle * (180 / Math.PI);
          // Center the 48x48 icon
          domNode.style.transform = `translate(${position.x - 24}px, ${position.y - 42}px) rotate(${degrees}deg)`; // -42 y to sit slightly visually higher? No, center is center. -24 is half width.
          // Wait, body is at center x,y. DOM is usually top-left.
          // Let's assume absolute top:0 left:0 and translate.
          domNode.style.transform = `translate(${position.x - 24}px, ${position.y - 24}px) rotate(${degrees}deg)`;
        }
      });
    };

    Matter.Events.on(engine, "afterUpdate", updatePosition);

    return () => {
      Matter.World.remove(engine.world, [
        baseBody,
        ...newIconBodies,
        ...constraints,
      ]);
      Matter.Events.off(engine, "afterUpdate", updatePosition);
    };
  }, [engine, isReady, isSetup]);

  return (
    <>
      {/* 1. Dock Base (The Glass) */}
      <div
        className="pointer-events-auto absolute top-0 left-0 z-4900 flex select-none items-end justify-center rounded-t-lg border-white/50 border-t border-r border-l bg-white/40 px-4 pb-2 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] backdrop-blur-xs"
        ref={dockBaseRef}
        style={{
          width: isSetup ? dockWidthState : 600,
          height: 70,
          // Subtle pinstripes
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 50%, transparent 50%)",
          backgroundSize: "4px 4px",
          willChange: "transform",
        }}
      >
        {/* Visual decoration only - separator */}
        <div className="absolute right-[60px] bottom-2 h-3/4 w-px bg-black/10" />
      </div>

      {/* 2. Dock Icons (Rendered independently but constrained) */}
      {DOCK_ICONS.map((icon, index) => (
        <div
          className="group pointer-events-auto absolute top-0 left-0 z-5000 h-[48px] w-[48px] cursor-pointer transition-transform duration-100 hover:scale-125"
          key={icon.id}
          onClick={() => onOpenWindow(icon.action)}
          ref={(el) => {
            iconRefs.current[index] = el;
          }}
        >
          <Image
            alt={icon.label}
            className="h-full w-full select-none object-contain drop-shadow-md"
            draggable={false}
            height={48}
            src={icon.src}
            width={48}
          />
          {/* Hover Label */}
          <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-[#b4b4b4] bg-[#f9f9f9] px-2 py-0.5 font-['Lucida_Grande'] text-[12px] text-black opacity-0 shadow-xs transition-opacity group-hover:opacity-100">
            {icon.label}
          </div>
        </div>
      ))}
    </>
  );
};

export default GravityDock;
