"use client";

import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { ExperimentCanvas } from "@/lib/toolkit/r3f";
import { tunnel } from "../store";

export function GlobalCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
      <ExperimentCanvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: false,
          toneMapping: THREE.NoToneMapping,
          outputColorSpace: THREE.LinearSRGBColorSpace,
          alpha: true,
        }}
        tempus
      >
        <tunnel.Out />
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.5} luminanceThreshold={1} mipmapBlur />
          <Noise opacity={0.05} />
          <Vignette darkness={1.1} eskil={false} offset={0.1} />
        </EffectComposer>
      </ExperimentCanvas>
    </div>
  );
}
