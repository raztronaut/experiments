import { Environment, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  particleSwirlFragment,
  particleSwirlVertex,
} from "../shaders/particleSwirl";
import { useAnnouncingStore } from "../store";
import { ResponsiveCamera } from "./ResponsiveCamera";

useGLTF.preload("/experiments/announcing-v2/temple.glb");

const PARTICLE_COUNT = 2500;

const _mouseLerpTarget = new THREE.Vector2();

function ParticleCloud() {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  const { positions, randoms, phases } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const rnd = new Float32Array(PARTICLE_COUNT);
    const phs = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.5 + Math.random() * 2.5;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      rnd[i] = Math.random();
      phs[i] = Math.random();
    }

    return { positions: pos, randoms: rnd, phases: phs };
  }, []);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      mousePosition: { value: new THREE.Vector2(0, 0) },
      scrollProgress: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current) {
      return;
    }
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    const state = useAnnouncingStore.getState();

    mat.uniforms.time.value = clock.elapsedTime;
    mat.uniforms.scrollProgress.value = state.blueprintProgress;

    const mx = state.mousePosition.x / 5;
    const my = state.mousePosition.y / 5;
    _mouseLerpTarget.set(mx, my);
    const d = Math.min(delta, 1 / 15);
    const factor = 1 - Math.exp(-4 * d);
    mouseRef.current.lerp(_mouseLerpTarget, factor);
    mat.uniforms.mousePosition.value.copy(mouseRef.current);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
        <bufferAttribute args={[randoms, 1]} attach="attributes-aRandom" />
        <bufferAttribute args={[phases, 1]} attach="attributes-aPhase" />
      </bufferGeometry>
      <shaderMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={particleSwirlFragment}
        transparent
        uniforms={uniforms}
        vertexShader={particleSwirlVertex}
      />
    </points>
  );
}

function TempleModel() {
  const { scene } = useGLTF("/experiments/announcing-v2/temple.glb");
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene) {
      return;
    }
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.5 / maxDim;
    scene.scale.setScalar(scale);
    scene.position.copy(center.multiplyScalar(-scale));

    // Apply Blueprint Material
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshStandardMaterial({
          color: "#040810",
          metalness: 0.2,
          roughness: 0.9,
          emissive: "#0a1a3a",
          emissiveIntensity: 0.05,
        });
      }
    });
  }, [scene]);

  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.geometry?.dispose();
          const mat = child.material;
          if (mat) {
            if (Array.isArray(mat)) {
              for (const m of mat) {
                m.dispose();
              }
            } else {
              mat.dispose();
            }
          }
        }
      });
    };
  }, [scene]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export function TempleScene() {
  return (
    <group>
      <ResponsiveCamera baseWidth={1200} minZ={3} y={0.5} />

      {/* Studio lighting for the Blueprint */}
      <Environment
        environmentIntensity={0.1}
        files="/experiments/announcing-v2/sky.jpg"
      />
      <ambientLight intensity={0.05} />

      <directionalLight
        castShadow
        color="#c8daff"
        intensity={0.5}
        position={[10, 10, 10]}
      />

      <pointLight
        color="#4488ff"
        decay={2}
        distance={15}
        intensity={1.2}
        position={[0, 4, 0]}
      />

      <TempleModel />
      <ParticleCloud />
    </group>
  );
}
