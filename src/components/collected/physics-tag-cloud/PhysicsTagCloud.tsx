"use client";

import { useEffect, useRef } from "react";
import "./styles.css";

export interface PhysicsTagCloudProps {
  className?: string;
  friction?: number;
  gravity?: { x: number; y: number };
  restitution?: number;
  tags?: string[];
}

const DEFAULT_TAGS = [
  "Codegrid",
  "HTML",
  "CSS",
  "JavaScript",
  "GSAP",
  "ScrollTrigger",
  "Lenis",
  "React",
  "Next.js",
  "WebGL",
  "Three.js",
  "Creative Dev",
];

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Physics-based tag cloud using Matter.js.
 * Requires Matter.js loaded globally (via script tag) or bundled.
 * Falls back to a static grid if Matter is unavailable.
 */
export function PhysicsTagCloud({
  tags = DEFAULT_TAGS,
  gravity = { x: 0, y: 1 },
  restitution = 0.5,
  friction = 0.15,
  className,
}: PhysicsTagCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      container.classList.add("ptc-static-fallback");
      return;
    }

    const Matter = (
      window as unknown as { Matter?: typeof import("matter-js") }
    ).Matter;
    if (!Matter) {
      container.classList.add("ptc-static-fallback");
      return;
    }

    const rect = container.getBoundingClientRect();
    const engine = Matter.Engine.create();
    Object.assign(engine.gravity, gravity);
    engineRef.current = engine;

    const wallT = 200;
    const walls = [
      Matter.Bodies.rectangle(
        rect.width / 2,
        rect.height + wallT / 2,
        rect.width + wallT * 2,
        wallT,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        -wallT / 2,
        rect.height / 2,
        wallT,
        rect.height + wallT * 2,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        rect.width + wallT / 2,
        rect.height / 2,
        wallT,
        rect.height + wallT * 2,
        { isStatic: true }
      ),
    ];
    Matter.World.add(engine.world, walls);

    interface BodyEntry {
      body: Matter.Body;
      element: HTMLElement;
      height: number;
      width: number;
    }
    const bodies: BodyEntry[] = [];
    const objects = container.querySelectorAll<HTMLElement>(".ptc-tag");

    objects.forEach((obj, index) => {
      const objRect = obj.getBoundingClientRect();
      const startX =
        Math.random() * (rect.width - objRect.width) + objRect.width / 2;
      const startY = -500 - index * 200;
      const body = Matter.Bodies.rectangle(
        startX,
        startY,
        objRect.width,
        objRect.height,
        {
          restitution,
          friction,
          frictionAir: 0.02,
          density: 0.002,
        }
      );
      Matter.Body.setAngle(body, (Math.random() - 0.5) * Math.PI);
      bodies.push({
        body,
        element: obj,
        width: objRect.width,
        height: objRect.height,
      });
      Matter.World.add(engine.world, body);
    });

    setTimeout(() => {
      const topWall = Matter.Bodies.rectangle(
        rect.width / 2,
        -wallT / 2,
        rect.width + wallT * 2,
        wallT,
        { isStatic: true }
      );
      Matter.World.add(engine.world, topWall);
    }, 3000);

    const mouse = Matter.Mouse.create(container);
    // @ts-expect-error Matter.js internal property for scroll passthrough
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    // @ts-expect-error Matter.js internal property for scroll passthrough
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.6, render: { visible: false } },
    });
    mouseConstraint.mouse.element.oncontextmenu = () => false;

    let dragging: Matter.Body | null = null;
    let originalInertia: number | null = null;

    Matter.Events.on(mouseConstraint, "startdrag", (event: unknown) => {
      const { body } = event as { body: Matter.Body };
      dragging = body;
      if (dragging) {
        originalInertia = dragging.inertia;
        Matter.Body.setInertia(dragging, Number.POSITIVE_INFINITY);
        Matter.Body.setVelocity(dragging, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(dragging, 0);
      }
    });

    Matter.Events.on(mouseConstraint, "enddrag", () => {
      if (dragging) {
        Matter.Body.setInertia(dragging, originalInertia ?? 1);
        dragging = null;
        originalInertia = null;
      }
    });

    Matter.Events.on(engine, "beforeUpdate", () => {
      if (!dragging) {
        return;
      }
      const found = bodies.find((b) => b.body === dragging);
      if (found) {
        Matter.Body.setPosition(dragging, {
          x: clamp(
            dragging.position.x,
            found.width / 2,
            rect.width - found.width / 2
          ),
          y: clamp(
            dragging.position.y,
            found.height / 2,
            rect.height - found.height / 2
          ),
        });
        Matter.Body.setVelocity(dragging, {
          x: clamp(dragging.velocity.x, -20, 20),
          y: clamp(dragging.velocity.y, -20, 20),
        });
      }
    });

    Matter.World.add(engine.world, mouseConstraint);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    runnerRef.current = runner;

    const updatePositions = () => {
      for (const { body, element, width, height } of bodies) {
        const x = clamp(body.position.x - width / 2, 0, rect.width - width);
        const y = clamp(
          body.position.y - height / 2,
          -height * 3,
          rect.height - height
        );
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.transform = `rotate(${body.angle}rad)`;
      }
      rafRef.current = requestAnimationFrame(updatePositions);
    };
    updatePositions();

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: rebuild physics sim when tag count changes
  }, [tags.length, gravity, restitution, friction]);

  return (
    <div
      className={`ptc-container ${className ?? ""}`.trim()}
      ref={containerRef}
    >
      {tags.map((tag, i) => (
        <div className="ptc-tag" key={i}>
          <p>{tag}</p>
        </div>
      ))}
    </div>
  );
}

export default PhysicsTagCloud;
