"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useDevControls } from "@/hooks/useDevControls";
import { EXPERIMENTS } from "../data";
import { usePrefersReducedMotion } from "../hooks";
import { crtFragmentShader, crtVertexShader } from "../shaders/crtShader";
import { useAnnouncingStore } from "../store";
import {
  createScreenGeometry,
  SCREEN_ASPECT,
  SCREEN_CORNER_R,
  SCREEN_H,
  SCREEN_W,
} from "./screenGeometry";
import {
  disposeAllTextures,
  loadTexture,
  pauseAllVideos,
} from "./textureLoader";

useGLTF.preload("/experiments/announcing-v2/monitor.glb");

function ResponsiveCamera() {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);

  useEffect(() => {
    camera.position.z = Math.max(1, 768 / width);
    camera.lookAt(0, 0, 0);
  }, [camera, width]);

  return null;
}

export function CRTMonitor() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const glitchRef = useRef({ intensity: 0 });
  const glitchAnimRef = useRef<gsap.core.Tween | null>(null);
  const currentSlugRef = useRef<string | null>(null);
  const { scene: monitorModel } = useGLTF(
    "/experiments/announcing-v2/monitor.glb"
  );
  const reducedMotion = usePrefersReducedMotion();

  const crtParams = useDevControls("CRT Monitor", {
    glitchDuration: { value: 0.75, min: 0.1, max: 2, step: 0.05 },
    lerpSpeed: { value: 0.05, min: 0.01, max: 0.2, step: 0.005 },
    rotationSensitivityY: { value: 0.3, min: 0, max: 1, step: 0.05 },
    rotationSensitivityX: { value: 0.15, min: 0, max: 0.5, step: 0.025 },
  });

  const defaultPoster = EXPERIMENTS[0].poster;

  const uniforms = useMemo(
    () => ({
      map: { value: loadTexture(defaultPoster) },
      imageAspect: { value: 1.5 },
      planeAspect: { value: SCREEN_ASPECT },
      iResolution: { value: new THREE.Vector2(512, 512) },
      glitchIntensity: { value: 0.0 },
      time: { value: 0.0 },
    }),
    [defaultPoster]
  );

  const screenGeometry = useMemo(
    () => createScreenGeometry(1, 1, SCREEN_CORNER_R),
    []
  );

  useEffect(() => {
    if (!monitorModel) {
      return;
    }
    const box = new THREE.Box3().setFromObject(monitorModel);
    const center = box.getCenter(new THREE.Vector3());
    monitorModel.position.sub(center);
  }, [monitorModel]);

  useEffect(() => {
    return () => disposeAllTextures();
  }, []);

  useFrame(({ clock }) => {
    if (!(materialRef.current && groupRef.current)) {
      return;
    }

    const mat = materialRef.current;
    const state = useAnnouncingStore.getState();
    const { activeExperimentSlug, mousePosition } = state;

    mat.uniforms.time.value = clock.elapsedTime;
    mat.uniforms.glitchIntensity.value = glitchRef.current.intensity;

    if (activeExperimentSlug !== currentSlugRef.current) {
      currentSlugRef.current = activeExperimentSlug;

      pauseAllVideos();

      if (glitchAnimRef.current) {
        glitchAnimRef.current.kill();
      }
      if (reducedMotion) {
        glitchRef.current.intensity = 0;
      } else {
        glitchRef.current.intensity = 1.0;
        glitchAnimRef.current = gsap.to(glitchRef.current, {
          intensity: 0,
          duration: crtParams.glitchDuration,
          ease: "power3.out",
        });
      }

      if (activeExperimentSlug) {
        const exp = EXPERIMENTS.find((e) => e.slug === activeExperimentSlug);
        if (exp) {
          const src = exp.video || exp.poster;
          const tex = loadTexture(src, (t) => {
            if (t instanceof THREE.VideoTexture) {
              const video = t.image as HTMLVideoElement;
              if (video?.videoWidth && video.videoHeight) {
                mat.uniforms.imageAspect.value =
                  video.videoWidth / video.videoHeight;
              }
            } else {
              const img = t.image as HTMLImageElement | undefined;
              if (img?.width && img.height) {
                mat.uniforms.imageAspect.value = img.width / img.height;
              }
            }
          });
          if (tex instanceof THREE.VideoTexture) {
            const video = tex.image as HTMLVideoElement;
            if (video?.paused) {
              video.play().catch(() => {});
            }
          }
          mat.uniforms.map.value = tex;
        }
      } else {
        const tex = loadTexture(defaultPoster, (t) => {
          const img = t.image as HTMLImageElement | undefined;
          if (img?.width && img.height) {
            mat.uniforms.imageAspect.value = img.width / img.height;
          }
        });
        if (tex instanceof THREE.VideoTexture) {
          const video = tex.image as HTMLVideoElement;
          if (video?.paused) {
            video.play().catch(() => {});
          }
        }
        mat.uniforms.map.value = tex;
      }
    }

    const tx = mousePosition.x * crtParams.rotationSensitivityY;
    const ty = mousePosition.y * crtParams.rotationSensitivityX;
    groupRef.current.rotation.y +=
      (tx - groupRef.current.rotation.y) * crtParams.lerpSpeed;
    groupRef.current.rotation.x +=
      (ty - groupRef.current.rotation.x) * crtParams.lerpSpeed;
  });

  return (
    <group ref={groupRef}>
      <ResponsiveCamera />
      <primitive object={monitorModel} />

      <mesh
        position={[-0.008, 0.005, 0.041]}
        rotation={[-0.18, 0, 0]}
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
  );
}
