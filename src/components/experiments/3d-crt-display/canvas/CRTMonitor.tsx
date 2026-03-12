import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useDevControls } from "@/hooks/useDevControls";
import { DEFAULT_IMAGE, MONITOR_MODEL } from "../data";
import { usePrefersReducedMotion } from "../hooks";
import { crtFragmentShader, crtVertexShader } from "../shaders/crtShader";
import { useCrtDisplayStore } from "../store";
import {
  createScreenGeometry,
  SCREEN_ASPECT,
  SCREEN_CORNER_R,
  SCREEN_H,
  SCREEN_W,
} from "./screenGeometry";
import { disposeAllTextures, loadTexture } from "./textureLoader";

useGLTF.preload(MONITOR_MODEL);

export function CRTMonitor() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const glitchRef = useRef({ intensity: 0 });
  const glitchAnimRef = useRef<gsap.core.Tween | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  const imageAspectRef = useRef(1);
  const { scene: monitorModel } = useGLTF(MONITOR_MODEL);
  const reducedMotion = usePrefersReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const params = useDevControls("CRT Monitor", {
    glitchDuration: { value: 0.75, min: 0.1, max: 2, step: 0.05 },
    dampSpeed: { value: 4, min: 1, max: 20, step: 0.5 },
    rotationY: { value: 0.3, min: 0, max: 1, step: 0.05 },
    rotationX: { value: 0.15, min: 0, max: 0.5, step: 0.025 },
    screenX: { value: -0.008, min: -0.5, max: 0.5, step: 0.001 },
    screenY: { value: 0.005, min: -0.5, max: 0.5, step: 0.001 },
    screenZ: { value: 0.041, min: -0.5, max: 0.5, step: 0.001 },
    screenRotX: { value: -0.18, min: -1, max: 1, step: 0.01 },
  });
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const uniforms = useMemo(
    () => ({
      map: { value: null as THREE.Texture | null },
      imageAspect: { value: 1 },
      planeAspect: { value: SCREEN_ASPECT },
      iResolution: { value: new THREE.Vector2(512, 512) },
      glitchIntensity: { value: 0.0 },
      time: { value: 0.0 },
    }),
    []
  );

  const screenGeometry = useMemo(
    () => createScreenGeometry(1, 1, SCREEN_CORNER_R),
    []
  );

  // Center the loaded model
  useEffect(() => {
    if (!monitorModel) {
      return;
    }
    const center = new THREE.Box3()
      .setFromObject(monitorModel)
      .getCenter(new THREE.Vector3());
    monitorModel.position.sub(center);
  }, [monitorModel]);

  // Dispose geometry + GLTF resources on unmount
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

  // Load default texture eagerly
  useEffect(() => {
    const tex = loadTexture(DEFAULT_IMAGE, (t) => {
      const img = t.image as HTMLImageElement | undefined;
      if (img?.width && img.height) {
        imageAspectRef.current = img.width / img.height;
      }
    });
    textureRef.current = tex;
  }, []);

  // Subscribe to store for image swaps with glitch transition
  useEffect(() => {
    let prevImage: string | null = null;

    const unsub = useCrtDisplayStore.subscribe((state) => {
      const image = state.activeImage;
      if (image === prevImage) {
        return;
      }
      prevImage = image;

      if (glitchAnimRef.current) {
        glitchAnimRef.current.kill();
      }

      if (reducedMotionRef.current) {
        glitchRef.current.intensity = 0;
      } else {
        glitchRef.current.intensity = 1.0;
        glitchAnimRef.current = gsap.to(glitchRef.current, {
          intensity: 0,
          duration: paramsRef.current.glitchDuration,
          ease: "power3.out",
        });
      }

      const src = image ?? DEFAULT_IMAGE;
      const tex = loadTexture(src, (t) => {
        const img = t.image as HTMLImageElement | undefined;
        if (img?.width && img.height) {
          imageAspectRef.current = img.width / img.height;
        }
      });
      textureRef.current = tex;
    });

    return () => {
      unsub();
      glitchAnimRef.current?.kill();
      disposeAllTextures();
    };
  }, []);

  // Sync iResolution and camera distance with viewport
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    uniforms.iResolution.value.set(size.width, size.height);
    camera.position.z = Math.max(1, 768 / size.width);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, uniforms]);

  useFrame(({ clock }, delta) => {
    if (!(materialRef.current && groupRef.current)) {
      return;
    }

    const mat = materialRef.current;
    const { mousePosition } = useCrtDisplayStore.getState();
    const p = paramsRef.current;

    mat.uniforms.time.value = clock.elapsedTime;
    mat.uniforms.glitchIntensity.value = glitchRef.current.intensity;
    mat.uniforms.map.value = textureRef.current;
    mat.uniforms.imageAspect.value = imageAspectRef.current;

    // Frame-rate-independent exponential damping
    const d = Math.min(delta, 1 / 15);
    const factor = 1 - Math.exp(-p.dampSpeed * d);

    const tx = mousePosition.x * p.rotationY;
    const ty = mousePosition.y * p.rotationX;
    groupRef.current.rotation.y += (tx - groupRef.current.rotation.y) * factor;
    groupRef.current.rotation.x += (ty - groupRef.current.rotation.x) * factor;
  });

  return (
    <>
      <ambientLight intensity={5} />
      <directionalLight intensity={2.5} position={[15, 10, -5]} />
      <pointLight
        decay={0.3}
        distance={10}
        intensity={5}
        position={[-5, -2.5, 0]}
      />

      <group ref={groupRef}>
        <primitive object={monitorModel} />

        <mesh
          position={[params.screenX, params.screenY, params.screenZ]}
          rotation={[params.screenRotX, 0, 0]}
          scale={[SCREEN_W, SCREEN_H, 1]}
        >
          <primitive attach="geometry" object={screenGeometry} />
          <shaderMaterial
            fragmentShader={crtFragmentShader}
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={crtVertexShader}
          />
        </mesh>
      </group>
    </>
  );
}
