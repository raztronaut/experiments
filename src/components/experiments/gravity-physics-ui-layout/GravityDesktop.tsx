import React, { useRef, useEffect } from 'react';
import Matter from 'matter-js';
import { usePhysics } from './PhysicsContext';

interface GravityDesktopProps {
    children: React.ReactNode;
}

const GravityDesktop: React.FC<GravityDesktopProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { engine, isReady } = usePhysics();

    // Setup World Boundaries & Mouse Interaction
    useEffect(() => {
        if (!engine || !isReady || !containerRef.current) return;

        const world = engine.world;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const wallThickness = 100;

        // 1. Create Boundaries (Walls)
        // Only floor is strictly "needed" for gravity, but walls keep things in view
        const walls = [
            // Floor
            Matter.Bodies.rectangle(width / 2, height + wallThickness / 2 - 20, width, wallThickness, { isStatic: true, label: 'Wall' }),
            // Ceiling
            Matter.Bodies.rectangle(width / 2, -wallThickness * 2, width, wallThickness, { isStatic: true, label: 'Wall' }),
            // Left Wall
            Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, label: 'Wall' }),
            // Right Wall
            Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, label: 'Wall' })
        ];

        Matter.World.add(world, walls);

        // 2. Mouse Constraint for Dragging
        const mouse = Matter.Mouse.create(containerRef.current);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            },
            // Explicitly allow mouse to grab all categories
            collisionFilter: {
                category: 0x0001,
                mask: 0xFFFFFFFF,
            }
        });

        // Prevent mouse from capturing scroll events (if we had scroll)
        // mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        // mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

        Matter.World.add(world, mouseConstraint);

        // 3. Handle Resize
        let lastWidth = window.innerWidth;
        let lastHeight = window.innerHeight;

        const handleResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            // Calculate resize speed/direction
            const deltaX = newWidth - lastWidth;
            const deltaY = newHeight - lastHeight;

            // Update wall positions
            Matter.Body.setPosition(walls[0], { x: newWidth / 2, y: newHeight + wallThickness / 2 - 20 }); // Floor
            Matter.Body.setPosition(walls[1], { x: newWidth / 2, y: -wallThickness * 2 }); // Ceiling
            Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: newHeight / 2 }); // Left
            Matter.Body.setPosition(walls[3], { x: newWidth + wallThickness / 2, y: newHeight / 2 }); // Right

            // Apply "Bumper Car" Fling Effect
            const bodies = Matter.Composite.allBodies(world);

            if (deltaX < 0) {
                // Right wall crashing in
                bodies.forEach(body => {
                    if (body.isStatic) return;
                    const distToRight = newWidth - body.position.x;
                    if (distToRight < 150) {
                        const impactForce = Math.min(Math.abs(deltaX) * 0.2, 10);
                        Matter.Body.setVelocity(body, {
                            x: body.velocity.x - impactForce,
                            y: body.velocity.y + (Math.random() - 0.5) * 5
                        });
                        Matter.Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.2);
                    }
                });
            }

            if (deltaY < 0) {
                // Floor crashing up
                bodies.forEach(body => {
                    if (body.isStatic) return;
                    const distToBottom = newHeight - body.position.y;
                    if (distToBottom < 150) {
                        const impactForce = Math.min(Math.abs(deltaY) * 0.2, 10);
                        Matter.Body.setVelocity(body, {
                            x: body.velocity.x + (Math.random() - 0.5) * 5,
                            y: body.velocity.y - impactForce // Fling up
                        });
                        Matter.Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.2);
                    }
                });
            }

            lastWidth = newWidth;
            lastHeight = newHeight;
        };

        // 4. Safety Bounds Check (Prevent Tunneling)
        const checkBounds = () => {
            const bodies = Matter.Composite.allBodies(engine.world);
            const w = window.innerWidth;
            const h = window.innerHeight;
            const padding = 20; // Allow slight off-screen before clamping

            bodies.forEach(body => {
                if (body.isStatic) return; // Ignore walls

                let { x, y } = body.position;
                let { x: vx, y: vy } = body.velocity;
                let clamped = false;

                // Clamp X
                if (x < -padding) {
                    x = padding;
                    vx = Math.abs(vx) * 0.5; // Bounce back right with damping
                    clamped = true;
                } else if (x > w + padding) {
                    x = w - padding;
                    vx = -Math.abs(vx) * 0.5; // Bounce back left
                    clamped = true;
                }

                // Clamp Y
                if (y < -padding * 2) { // Allow more space up top (off-screen fling valid sometimes, but let's clamp for safety)
                    y = padding;
                    vy = Math.abs(vy) * 0.5;
                    clamped = true;
                } else if (y > h + padding) {
                    y = h - padding;
                    vy = -Math.abs(vy) * 0.5;
                    clamped = true;
                }

                if (clamped) {
                    Matter.Body.setPosition(body, { x, y });
                    Matter.Body.setVelocity(body, { x: vx, y: vy });
                }
            });
        };

        Matter.Events.on(engine, 'beforeUpdate', checkBounds);

        window.addEventListener('resize', handleResize);

        return () => {
            Matter.World.remove(world, walls);
            Matter.World.remove(world, mouseConstraint);
            window.removeEventListener('resize', handleResize);
        };
    }, [engine, isReady]);

    return (
        <div ref={containerRef} className="relative w-full h-[calc(100vh-22px)] mt-[22px] overflow-hidden bg-blue-900">
            {/* Wallpaper - Blue Swirl */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 bg-[url('/experiments/gravity-physics-ui-layout/wallpaper.png')] bg-cover bg-center"
                    style={{ backgroundSize: '100% 100%' }} // Force stretch to match OS X behavior often
                />
            </div>

            {/* Icons and Windows Container */}
            <div className="relative z-10 w-full h-full pointer-events-none">
                {/* 
                    IMPORTANT: The physics container must be interactive, but we put pointer-events-none on the wrapper
                    so clicks pass through to the canvas if needed, BUT standard React events on children need pointer-events-auto.
                    However, for Matter.js MouseConstraint to work, the containerRef element needs to receive events.
                    If children block events, Matter might not "see" the mouse.
                    Actually, Matter listens on the element provided.
                    Children like DOM Overlay elements (Windows) map specific DOM interaction to physics bodies.
                    But to drag a "body" via Matter mouse constraint, the mouse event must originate or propagate to the container.
                 */}
                {/* React children need to re-enable pointer events if they want standard onClick, 
                    BUT for full physics dragging of "Window" (which mimics the body), 
                    the Window component itself is a DIV that matches the Body position.
                    If we drag that DIV, we aren't using Matter MouseConstraint directly.
                    
                    Wait, `DesktopWindow` is just a visual representation synced to a body.
                    To drag it with Matter.js physical mouse constraint, the user must be clicking on the "canvas" area corresponding to the body.
                    BUT we are rendering HTML elements ON TOP of the physics world.
                    So the mouse hits the HTML element, NOT the containerRef directly where Matter listens.
                    
                    This means standard MouseConstraint won't work if the HTML element blocks the mouse.
                    OR we need to manually pass drag events to Matter.
                    
                    ALTERNATIVE:
                    DesktopWindow uses a custom drag handler that applies force to the body?
                    OR we set `pointer-events-none` on the DesktopWindow so clicks go through to the background?
                    But then we can't click buttons inside the window (close, minimize).
                    
                    Hybrid approach:
                    DesktopWindow has a "Handle" (Title bar). Pushing on it applies MouseConstraint? No.
                    
                    Let's stick to the simplest fix requested: "im also not able to drag those windows".
                    If `DesktopWindow` is a rigid body, the `MouseConstraint` needs to "grab" it.
                    If the `div` is on top, `Matter` doesn't see the mouse down.
                    
                    Fix: We can make the Title Bar `pointer-events-none` (so click goes through to underlying canvas/body area?)
                    NO, `Matter` doesn't know about the `div` shape.
                    
                    Actually, we can use `react-draggable` or keep it simple:
                    If `Matter` is running, we can let `Matter` handle dragging IF we forward events?
                    
                    Easiest "Physics Drag" with DOM overlay:
                    The DOM overlay tracks the Body.
                    To drag, we need to apply force to the body.
                    The standard `MouseConstraint` is great but requires the mouse to be on the canvas.
                    
                    If we want "Window" to be draggable via the TitleBar:
                    We can attach a `mousedown` on the TitleBar that instantiates a constraint or applies velocity.
                    
                    HOWEVER, looking at the previous implementation's intent:
                    It seems it expected MouseConstraint to work.
                    
                    For now, I will re-enable MouseConstraint on the container.
                    AND I will ensure the DesktopWindow allows events to pass through on non-interactive parts?
                    Or, better, I will assume the previous dev (my past self) knew that MouseConstraint works if the element is part of the DOM that Matter is attached to?
                    Matter attaches to `containerRef`.
                    If `Mouse.create(containerRef.current)` is used, it adds listeners to that DIV.
                    Events bubble up. If `DesktopWindow` stops propagation, Matter won't see it.
                    `DesktopWindow` handles Close with `e.stopPropagation()`.
                    The Title Bar has `cursor-grab`.
                    
                    If user clicks Title Bar, event bubbles to `GravityDesktop` div. Matter receives it.
                    Matter checks if a body is under the mouse.
                    The Body is at (x,y). The DOM element is at (x,y).
                    Visually they align.
                    So Matter SHOULD find the body and drag it.
                    
                    So just restoring this file should work.
                 */}
                {children}
            </div>
        </div>
    );
};

export default GravityDesktop;
