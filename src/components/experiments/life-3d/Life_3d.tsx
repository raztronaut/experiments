"use client";

import { Environment, OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import React, { Suspense } from "react";
import * as THREE from "three";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMounted } from "@/hooks/useMounted";
import { Controls } from "./Controls";
import { PRESETS } from "./presets";
import { useLife3d } from "./useLife3d";
import { VoxelGrid } from "./VoxelGrid";

/** Smaller grid on mobile to avoid WebGL/InstancedMesh limits (64k instances can fail on iOS) */
const DESKTOP_GRID = 40;
const MOBILE_GRID = 20;

export default function Life_3d() {
  const [activePreset, setActivePreset] = React.useState("neural");
  const mounted = useMounted();
  const isTouchDevice = useMediaQuery("(pointer: coarse)");
  const isNarrowViewport = useMediaQuery("(max-width: 768px)");
  const isMobile = isTouchDevice || isNarrowViewport;
  const gridSize = mounted && isMobile ? MOBILE_GRID : DESKTOP_GRID;

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
    initialDepth: gridSize,
    initialDensity: PRESETS.neural.density,
    initialHeight: gridSize,
    initialRules: PRESETS.neural.rules,
    initialWidth: gridSize,
  });

  // Re-initialize when gridSize changes (e.g. mobile detected after mount)
  React.useEffect(() => {
    if (mounted && dimensions.width !== gridSize) {
      const preset = PRESETS[activePreset];
      reset(gridSize, gridSize, gridSize, preset.density, isPlaying);
    }
  }, [mounted, gridSize, activePreset, isPlaying, reset, dimensions.width]);

  const handlePresetChange = (presetId: string) => {
    setActivePreset(presetId);
    const preset = PRESETS[presetId];
    updateRules(preset.rules);
    reset(
      dimensions.width,
      dimensions.height,
      dimensions.depth,
      preset.density,
      true
    );
  };

  return (
    <div className="group relative h-full w-full overflow-hidden bg-black">
      {/* R3F Canvas — gridSize reduced on mobile to avoid WebGL/InstancedMesh limits */}
      <Canvas camera={{ position: [35, 35, 35], fov: 45 }} dpr={[1, 2]} shadows>
        <OrbitControls
          autoRotate={!isPlaying}
          autoRotateSpeed={0.3}
          dampingFactor={0.05}
          enableDamping
          makeDefault
          maxDistance={100}
          minDistance={10}
        />

        <color args={["#010101"]} attach="background" />
        <fog args={["#010101", 50, 120]} attach="fog" />

        {/* Lighting - Brightened for better visibility */}
        <ambientLight intensity={0.8} />
        <pointLight color="#ffffff" intensity={3} position={[30, 40, 30]} />
        <spotLight
          angle={0.4}
          castShadow
          intensity={2.5}
          penumbra={1}
          position={[-30, 40, 30]}
        />

        <Environment preset="city" />

        {/* Simulation */}
        <Suspense fallback={null}>
          <VoxelGrid
            ages={ages}
            dimensions={dimensions}
            grid={grid}
            intensities={intensities}
          />
        </Suspense>

        <Stars
          count={8000}
          depth={70}
          factor={6}
          fade
          radius={150}
          saturation={0}
          speed={0.2}
        />

        {/* Post-Processing */}
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={1.8}
            luminanceThreshold={0.15}
            mipmapBlur
            radius={0.5}
          />
          <Noise opacity={0.05} />
          <Vignette darkness={1.1} eskil={false} offset={0.05} />
          <ChromaticAberration
            modulationOffset={0}
            offset={new THREE.Vector2(0.004, 0.004)}
            radialModulation={false}
          />
        </EffectComposer>
      </Canvas>

      {/* Controls Overlay */}
      <Controls
        currentPreset={activePreset}
        generation={generation}
        isPlaying={isPlaying}
        onPresetChange={handlePresetChange}
        onReset={() => reset()}
        onSpeedChange={setSpeed}
        onStep={step}
        onTogglePlay={togglePlay}
        presets={PRESETS}
        speed={speed}
      />
    </div>
  );
}
