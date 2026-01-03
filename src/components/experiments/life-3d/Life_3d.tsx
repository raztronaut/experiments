"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { useLife3d } from './useLife3d';
import { VoxelGrid } from './VoxelGrid';
import { Controls } from './Controls';
import { PRESETS } from './presets';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';

export default function Life_3d() {
    const [activePreset, setActivePreset] = React.useState('neural');

    const {
        grid,
        intensities,
        ages,
        dimensions,
        isPlaying,
        generation,
        speed,
        togglePlay,
        step,
        reset,
        setSpeed,
        updateRules,
    } = useLife3d({
        initialWidth: 40,
        initialHeight: 40,
        initialDepth: 40,
        initialDensity: PRESETS.neural.density,
        initialRules: PRESETS.neural.rules,
    });

    const handlePresetChange = (presetId: string) => {
        setActivePreset(presetId);
        const preset = PRESETS[presetId];
        updateRules(preset.rules);
        reset(dimensions.width, dimensions.height, dimensions.depth, preset.density, true);
    };

    return (
        <div className="relative w-full h-full bg-black overflow-hidden group">
            {/* R3F Canvas */}
            <Canvas shadows dpr={[1, 2]} camera={{ position: [35, 35, 35], fov: 45 }}>
                <OrbitControls
                    makeDefault
                    autoRotate={!isPlaying}
                    autoRotateSpeed={0.3}
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={10}
                    maxDistance={100}
                />

                <color attach="background" args={['#010101']} />
                <fog attach="fog" args={['#010101', 50, 120]} />

                {/* Lighting - Brightened for better visibility */}
                <ambientLight intensity={0.8} />
                <pointLight position={[30, 40, 30]} intensity={3} color="#ffffff" />
                <spotLight position={[-30, 40, 30]} intensity={2.5} angle={0.4} penumbra={1} castShadow />

                <Environment preset="city" />

                {/* Simulation */}
                <Suspense fallback={null}>
                    <VoxelGrid grid={grid} intensities={intensities} ages={ages} dimensions={dimensions} />
                </Suspense>

                <Stars radius={150} depth={70} count={8000} factor={6} saturation={0} fade speed={0.2} />

                {/* Post-Processing */}
                <EffectComposer multisampling={4}>
                    <Bloom
                        luminanceThreshold={0.15}
                        mipmapBlur
                        intensity={1.8}
                        radius={0.5}
                    />
                    <Noise opacity={0.05} />
                    <Vignette eskil={false} offset={0.05} darkness={1.1} />
                    <ChromaticAberration
                        offset={new THREE.Vector2(0.004, 0.004)}
                        radialModulation={false}
                        modulationOffset={0}
                    />
                </EffectComposer>
            </Canvas>

            {/* Controls Overlay */}
            <Controls
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onStep={step}
                onReset={() => reset()}
                generation={generation}
                speed={speed}
                onSpeedChange={setSpeed}
                currentPreset={activePreset}
                onPresetChange={handlePresetChange}
                presets={PRESETS}
            />
        </div>
    );
}