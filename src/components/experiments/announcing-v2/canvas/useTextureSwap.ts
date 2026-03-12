import gsap from "gsap";
import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EXPERIMENTS } from "../data";
import { useAnnouncingStore } from "../store";
import {
  disposeAllTextures,
  loadTexture,
  pauseAllVideos,
} from "./textureLoader";

interface TextureSwapOptions {
  defaultPoster: string;
  glitchAnimRef: MutableRefObject<gsap.core.Tween | null>;
  glitchRef: MutableRefObject<{ intensity: number }>;
  imageAspectRef: MutableRefObject<number>;
  paramsRef: MutableRefObject<{ glitchDuration: number }>;
  reducedMotionRef: MutableRefObject<boolean>;
}

function updateAspect(tex: THREE.Texture, aspectRef: MutableRefObject<number>) {
  if (tex instanceof THREE.VideoTexture) {
    const video = tex.image as HTMLVideoElement;
    if (video?.videoWidth && video.videoHeight) {
      aspectRef.current = video.videoWidth / video.videoHeight;
    }
  } else {
    const img = tex.image as HTMLImageElement | undefined;
    if (img?.width && img.height) {
      aspectRef.current = img.width / img.height;
    }
  }
}

export function useTextureSwap({
  defaultPoster,
  glitchRef,
  glitchAnimRef,
  imageAspectRef,
  reducedMotionRef,
  paramsRef,
}: TextureSwapOptions) {
  const textureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    const tex = loadTexture(defaultPoster, (t) =>
      updateAspect(t, imageAspectRef)
    );
    textureRef.current = tex;
  }, [defaultPoster, imageAspectRef]);

  useEffect(() => {
    let prevSlug: string | null = null;

    const unsub = useAnnouncingStore.subscribe((state) => {
      const slug = state.activeExperimentSlug;
      if (slug === prevSlug) {
        return;
      }
      prevSlug = slug;

      pauseAllVideos();

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

      if (slug) {
        const exp = EXPERIMENTS.find((e) => e.slug === slug);
        if (exp) {
          const src = exp.video || exp.poster;
          const tex = loadTexture(src, (t) => updateAspect(t, imageAspectRef));
          if (tex instanceof THREE.VideoTexture) {
            const video = tex.image as HTMLVideoElement;
            if (video?.paused) {
              video.play().catch(() => {});
            }
          }
          textureRef.current = tex;
        }
      } else {
        const tex = loadTexture(defaultPoster, (t) =>
          updateAspect(t, imageAspectRef)
        );
        textureRef.current = tex;
      }
    });

    return () => {
      unsub();
      disposeAllTextures();
    };
  }, [
    defaultPoster,
    glitchRef,
    glitchAnimRef,
    imageAspectRef,
    reducedMotionRef,
    paramsRef,
  ]);

  return textureRef;
}
