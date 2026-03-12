import { Environment, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useDevControls } from "@/hooks/useDevControls";
import { EXPERIMENTS } from "../data";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { crtFragmentShader, crtVertexShader } from "../shaders/crtShader";
import { useAnnouncingStore } from "../store";
import { ResponsiveCamera } from "./ResponsiveCamera";
import {
  createScreenGeometry,
  SCREEN_ASPECT,
  SCREEN_CORNER_R,
  SCREEN_H,
  SCREEN_W,
} from "./screenGeometry";
import { useTextureSwap } from "./useTextureSwap";

useGLTF.preload("/experiments/announcing-v2/new-monitor.glb");

export function CRTMonitor() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const glitchRef = useRef({ intensity: 0 });
  const glitchAnimRef = useRef<gsap.core.Tween | null>(null);
  const imageAspectRef = useRef(1.5);
  const { scene: monitorModel } = useGLTF(
    "/experiments/announcing-v2/new-monitor.glb"
  );
  const reducedMotion = usePrefersReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const crtParams = useDevControls("CRT Monitor", {
    glitchDuration: { value: 0.75, min: 0.1, max: 2, step: 0.05 },
    dampSpeed: { value: 4, min: 1, max: 20, step: 0.5 },
    rotationSensitivityY: { value: 0.3, min: 0, max: 1, step: 0.05 },
    rotationSensitivityX: { value: 0.15, min: 0, max: 0.5, step: 0.025 },
    screenX: { value: -0.008, min: -0.5, max: 0.5, step: 0.001 },
    screenY: { value: 0.005, min: -0.5, max: 0.5, step: 0.001 },
    screenZ: { value: 0.041, min: -0.5, max: 0.5, step: 0.001 },
    screenRotX: { value: -0.18, min: -1, max: 1, step: 0.01 },
  });
  const paramsRef = useRef(crtParams);
  paramsRef.current = crtParams;

  const textureRef = useTextureSwap({
    defaultPoster: EXPERIMENTS[0].poster,
    glitchRef,
    glitchAnimRef,
    imageAspectRef,
    reducedMotionRef,
    paramsRef,
  });

  const uniforms = useMemo(
    () => ({
      map: { value: null as THREE.Texture | null },
      imageAspect: { value: 1.5 },
      planeAspect: { value: SCREEN_ASPECT },
      iResolution: { value: new THREE.Vector2(512, 512) },
      glitchIntensity: { value: 0.0 },
      rs: { value: 0.0 },
      time: { value: 0.0 },
    }),
    []
  );

  const screenGeometry = useMemo(
    () => createScreenGeometry(1, 1, SCREEN_CORNER_R),
    []
  );

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(monitorModel);
    const center = box.getCenter(new THREE.Vector3());
    monitorModel.position.sub(center);

    // Apply premium materials
    monitorModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.8;
          child.material.metalness = 0.2;
          child.material.color.set("#111111");
        }
      }
    });
  }, [monitorModel]);

  // Dispose screen geometry and GLTF resources on unmount
  useEffect(() => {
    return () => {
      screenGeometry.dispose();
      monitorModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          const mat = child.material;
          if (Array.isArray(mat)) {
            for (const m of mat) {
              m.dispose();
            }
          } else {
            mat?.dispose();
          }
        }
      });
    };
  }, [screenGeometry, monitorModel]);

  // Update iResolution from actual viewport
  const size = useThree((s) => s.size);
  useEffect(() => {
    uniforms.iResolution.value.set(size.width, size.height);
  }, [size.width, size.height, uniforms]);

  useFrame(({ clock }, delta) => {
    if (!(materialRef.current && groupRef.current)) {
      return;
    }

    const mat = materialRef.current;
    const { mousePosition } = useAnnouncingStore.getState();
    const params = paramsRef.current;

    mat.uniforms.time.value = clock.elapsedTime;
    mat.uniforms.glitchIntensity.value = glitchRef.current.intensity;
    mat.uniforms.map.value = textureRef.current;
    mat.uniforms.imageAspect.value = imageAspectRef.current;
    mat.uniforms.rs.value = 0.002 + glitchRef.current.intensity * 0.02;

    // Frame-rate-independent exponential damping
    const d = Math.min(delta, 1 / 15);
    const factor = 1 - Math.exp(-params.dampSpeed * d);

    const tx = mousePosition.x * params.rotationSensitivityY;
    const ty = mousePosition.y * params.rotationSensitivityX;
    groupRef.current.rotation.y += (tx - groupRef.current.rotation.y) * factor;
    groupRef.current.rotation.x += (ty - groupRef.current.rotation.x) * factor;
  });

  return (
    <group ref={groupRef}>
      <Environment files="/experiments/announcing-v2/sky.jpg" />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1.0} position={[15, 10, -5]} />
      <pointLight
        decay={2}
        distance={10}
        intensity={2}
        position={[-5, -2.5, 0]}
      />

      <ResponsiveCamera />
      <primitive object={monitorModel} />

      <mesh
        position={[crtParams.screenX, crtParams.screenY, crtParams.screenZ]}
        rotation={[crtParams.screenRotX, 0, 0]}
        scale={[SCREEN_W, SCREEN_H, 1]}
      >
        <primitive attach="geometry" object={screenGeometry} />
        <shaderMaterial
          fragmentShader={crtFragmentShader}
          ref={materialRef}
          transparent
          uniforms={uniforms}
          vertexShader={crtVertexShader}
        />
      </mesh>
    </group>
  );
}
