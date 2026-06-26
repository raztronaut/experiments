"use client";

import { shaderMaterial, useTexture, useVideoTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shaders";

gsap.registerPlugin(ScrollTrigger);

const TransitionMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uTex0: new THREE.Texture(),
    uTex1: new THREE.Texture(),
    uTex2: new THREE.Texture(),
    uTex3: new THREE.Texture(),
    uTex4: new THREE.Texture(),
    uDepth: new THREE.Texture(),
    uDisplacementStrength: 0.5,
  },
  vertexShader,
  fragmentShader
);

// Fix: Proper type extension for R3F
import { extend } from "@react-three/fiber";
import type { Texture } from "three";

extend({ TransitionMaterial });

type TransitionMaterialProps = {
  uProgress?: number;
  uTime?: number;
  uTex0?: Texture;
  uTex1?: Texture;
  uTex2?: Texture;
  uTex3?: Texture;
  uTex4?: Texture;
  uDepth?: Texture;
  uDisplacementStrength?: number;
} & React.JSX.IntrinsicElements["shaderMaterial"];

declare module "@react-three/fiber" {
  interface ThreeElements {
    transitionMaterial: TransitionMaterialProps;
  }
}

const ASSET_PATH = "/experiments/mountain-transition";

export default function Scene() {
  const meshRef = useRef<THREE.Mesh>(null);
  // Fix 'any' by typing the ref properly
  const materialRef = useRef<
    THREE.ShaderMaterial & { uProgress: number; uTime: number }
  >(null);
  const { viewport } = useThree();

  // Load Assets
  const tex0 = useVideoTexture(`${ASSET_PATH}/green.mp4`);
  const tex1 = useVideoTexture(`${ASSET_PATH}/snowy.mp4`);
  const tex2 = useVideoTexture(`${ASSET_PATH}/sunrise.mp4`);
  const tex3 = useVideoTexture(`${ASSET_PATH}/painting.mp4`);
  const tex4 = useVideoTexture(`${ASSET_PATH}/painting2.mp4`);

  const depthTex = useTexture(`${ASSET_PATH}/depth-grayscale.png`);

  const textures = useMemo(
    () => [tex0, tex1, tex2, tex3, tex4],
    [tex0, tex1, tex2, tex3, tex4]
  );

  useEffect(() => {
    textures.forEach((tex) => {
      const video = tex.image as HTMLVideoElement;
      video.loop = true;
      video.muted = true;
      video.play();
    });
  }, [textures]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
  });

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#mountain-scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      snap: {
        snapTo: 1 / 4,
        duration: { min: 0.1, max: 0.5 }, // Faster snap
        delay: 0.1, // Reduced delay for quicker response
        ease: "power1.inOut",
      },
      onUpdate: (self) => {
        if (materialRef.current) {
          materialRef.current.uProgress = self.progress;
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <mesh position={[0, 0, 0]} ref={meshRef}>
      <planeGeometry args={[viewport.width, viewport.height, 128, 128]} />
      <transitionMaterial
        ref={materialRef}
        uDepth={depthTex}
        uDisplacementStrength={0.6}
        uTex0={tex0}
        uTex1={tex1}
        uTex2={tex2}
        uTex3={tex3}
        uTex4={tex4}
        wireframe={false}
      />
    </mesh>
  );
}
