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

const SCREEN_W = 0.28;
const SCREEN_H = 0.235;
const SCREEN_ASPECT = SCREEN_W / SCREEN_H;
const SCREEN_CORNER_R = 0.03;

let textureLoader: THREE.TextureLoader | null = null;
const textureCache = new Map<string, THREE.Texture>();

function getLoader() {
  if (!textureLoader) {
    textureLoader = new THREE.TextureLoader();
  }
  return textureLoader;
}

function loadTexture(src: string, onLoaded?: (t: THREE.Texture) => void) {
  const cached = textureCache.get(src);
  if (cached) {
    onLoaded?.(cached);
    return cached;
  }

  if (src.endsWith(".mp4")) {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.src = src;
    video.play().catch(() => {});

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(src, tex);
    // Video textures don't have a load callback in the same way,
    // but the video element has videoWidth/videoHeight once loaded.
    video.addEventListener("loadedmetadata", () => {
      onLoaded?.(tex);
    });
    return tex;
  }

  const tex = getLoader().load(src, (t) => onLoaded?.(t));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  textureCache.set(src, tex);
  return tex;
}

function createScreenGeometry(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geometry = new THREE.ShapeGeometry(shape);
  const positions = geometry.attributes.position;
  const uvs = new Float32Array(positions.count * 2);

  for (let i = 0; i < positions.count; i++) {
    uvs[i * 2] = (positions.getX(i) - x) / w;
    uvs[i * 2 + 1] = (positions.getY(i) - y) / h;
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

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
    return () => {
      for (const tex of textureCache.values()) {
        if (tex instanceof THREE.VideoTexture) {
          const video = tex.image as HTMLVideoElement;
          video.pause();
          video.src = "";
        }
        tex.dispose();
      }
      textureCache.clear();
      textureLoader = null;
    };
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

      textureCache.forEach((tex) => {
        if (tex instanceof THREE.VideoTexture) {
          const video = tex.image as HTMLVideoElement;
          if (video && !video.paused) {
            video.pause();
          }
        }
      });

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
