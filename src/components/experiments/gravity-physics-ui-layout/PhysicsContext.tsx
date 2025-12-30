'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface PhysicsContextType {
    engine: Matter.Engine | null;
    world: Matter.World | null;
    isReady: boolean;
}

const PhysicsContext = createContext<PhysicsContextType>({
    engine: null,
    world: null,
    isReady: false,
});

export const usePhysics = () => useContext(PhysicsContext);

interface PhysicsProviderProps {
    children: React.ReactNode;
    debug?: boolean; // If true, renders the matter.js debug canvas
}

export const PhysicsProvider: React.FC<PhysicsProviderProps> = ({ children, debug = false }) => {
    const [engine] = useState(() => {
        const newEngine = Matter.Engine.create();
        newEngine.enableSleeping = false;
        newEngine.gravity.y = 0;
        return newEngine;
    });
    const [isReady, setIsReady] = useState(false);
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);

    useEffect(() => {
        engineRef.current = engine;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsReady(true);

        // Optional: Debug Renderer
        if (debug && sceneRef.current && engine) {
            const render = Matter.Render.create({
                element: sceneRef.current,
                engine: engine,
                options: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    wireframes: true, // Set to false for solid colors if needed
                    background: 'transparent'
                }
            });
            renderRef.current = render;
            Matter.Render.run(render);
        }

        // Create Runner
        if (engine) {
            const runner = Matter.Runner.create();
            runnerRef.current = runner;
            Matter.Runner.run(runner, engine);
        }

        return () => {
            // Cleanup
            if (renderRef.current) {
                Matter.Render.stop(renderRef.current);
                if (renderRef.current.canvas) {
                    renderRef.current.canvas.remove();
                }
            }
            if (runnerRef.current) {
                Matter.Runner.stop(runnerRef.current);
            }
            if (engine) {
                Matter.World.clear(engine.world, false);
                Matter.Engine.clear(engine);
            }
        };
    }, [debug, engine]);

    return (
        <PhysicsContext.Provider value={{ engine, world: engine?.world || null, isReady }}>
            {debug && <div ref={sceneRef} className="absolute inset-0 pointer-events-none z-50 opacity-50" />}
            {children}
        </PhysicsContext.Provider>
    );
};
