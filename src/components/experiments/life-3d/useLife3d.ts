import { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationEngine, Life3dRules, Grid } from './SimulationEngine';

interface UseLife3dProps {
    initialWidth?: number;
    initialHeight?: number;
    initialDepth?: number;
    initialDensity?: number;
    initialRules?: Life3dRules;
}

export function useLife3d({
    initialWidth = 20,
    initialHeight = 20,
    initialDepth = 20,
    initialDensity = 0.12,
    initialRules = { survival: [4, 5], birth: [5] }
}: UseLife3dProps = {}) {
    const [grid, setGrid] = useState<Grid>(new Uint8Array(0));
    const [intensities, setIntensities] = useState<Float32Array>(new Float32Array(0));
    const [ages, setAges] = useState<Uint16Array>(new Uint16Array(0));
    const [dimensions, setDimensions] = useState({ width: initialWidth, height: initialHeight, depth: initialDepth });
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(100);
    const [rules, setRules] = useState<Life3dRules>(initialRules);
    const [generation, setGeneration] = useState(0);

    const engineRef = useRef<SimulationEngine | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const reset = useCallback((w = dimensions.width, h = dimensions.height, d = dimensions.depth, density = initialDensity, shouldPlay = false) => {
        const engine = new SimulationEngine(w, h, d, rules);
        engine.seed(density);
        engineRef.current = engine;
        setGrid(new Uint8Array(engine.getGrid()));
        setIntensities(new Float32Array(engine.getIntensities()));
        setAges(new Uint16Array(engine.getAges()));
        setDimensions({ width: w, height: h, depth: d });
        setGeneration(0);
        setIsPlaying(shouldPlay);
    }, [dimensions.width, dimensions.height, dimensions.depth, rules, initialDensity, setIsPlaying]);

    useEffect(() => {
        reset();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [reset]);

    const step = useCallback(() => {
        if (engineRef.current) {
            engineRef.current.step();
            setGrid(new Uint8Array(engineRef.current.getGrid()));
            setIntensities(new Float32Array(engineRef.current.getIntensities()));
            setAges(new Uint16Array(engineRef.current.getAges()));
            setGeneration(prev => prev + 1);
        }
    }, []);

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(step, speed);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, speed, step]);

    const togglePlay = () => setIsPlaying(prev => !prev);

    const updateRules = (newRules: Life3dRules) => {
        setRules(newRules);
        if (engineRef.current) {
            engineRef.current.rules = newRules;
        }
    };

    return {
        grid,
        intensities,
        ages,
        dimensions,
        isPlaying,
        generation,
        speed,
        rules,
        togglePlay,
        step,
        reset,
        setSpeed,
        updateRules,
    };
}
