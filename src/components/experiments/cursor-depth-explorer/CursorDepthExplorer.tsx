"use client";

import { useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import Eye from "lucide-react/dist/esm/icons/eye";
import Info from "lucide-react/dist/esm/icons/info";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { PAINTINGS } from "./data";

const InfoModal = dynamic(() => import("./InfoModal"), {
  ssr: false,
});

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uDepthTexture;
uniform sampler2D uColorTexture;
uniform float uFocus;
uniform float uThickness;
uniform float uSmoothness;
uniform float uRevealProgress;
uniform float uRevealActive;

varying vec2 vUv;

void main() {
  vec4 depthColor = texture2D(uDepthTexture, vUv);
  vec4 realColor = texture2D(uColorTexture, vUv);
  float depth = depthColor.r;

  // --- Slice Mode Logic ---
  float dist = abs(depth - uFocus);
  
  // Softer falloff to mimic volumetric slice
  // A core band
  float core = 1.0 - smoothstep(0.0, uThickness * 0.2, dist);
  
  // A wider glow
  float glow = 1.0 - smoothstep(0.0, uThickness, dist);
  
  // Combine core and glow
  float alpha = core + glow * 0.4;
  
  // Optional smoothness
  alpha = pow(alpha, uSmoothness);

  vec3 sliceColor = vec3(alpha);

  // --- Reveal Mode Logic ---
  
  // Animate from back (0.0) to front (1.0)
  // Mask: 1.0 if depth < uRevealProgress, else 0.0
  float revealMask = 1.0 - smoothstep(uRevealProgress, uRevealProgress + 0.05, depth);
  
  // Combine: When uRevealActive = 1, we show realColor * revealMask
  // When uRevealActive = 0, we show sliceColor
  
  vec3 finalColor = mix(sliceColor, realColor.rgb * revealMask, uRevealActive);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface SceneProps {
  colorPath: string;
  fit: "cover" | "contain";
  imagePath: string;
  isInteractive: boolean;
  isRevealed: boolean;
  isTouchingRef: React.MutableRefObject<boolean>;
  smoothness: number;
  thickness: number;
  tiltRef: React.MutableRefObject<number | null>;
}

function Scene({
  tiltRef,
  isTouchingRef,
  imagePath,
  colorPath,
  thickness,
  smoothness,
  fit,
  isInteractive,
  isRevealed,
}: SceneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const initialTiltRef = useRef<number | null>(null);
  const { pointer, viewport } = useThree();

  // Load both textures
  const [depthTexture, colorTexture] = useTexture([imagePath, colorPath]);

  useEffect(() => {
    // Force update texture when it changes
    if (materialRef.current) {
      materialRef.current.uniforms.uDepthTexture.value = depthTexture;
      materialRef.current.uniforms.uColorTexture.value = colorTexture;
      materialRef.current.needsUpdate = true;
    }
  }, [depthTexture, colorTexture]);

  // Create uniforms
  const uniforms = useMemo(
    () => ({
      uDepthTexture: { value: depthTexture },
      uColorTexture: { value: colorTexture },
      uFocus: { value: 0.5 },
      uThickness: { value: thickness },
      uSmoothness: { value: smoothness },
      uRevealProgress: { value: 0.0 },
      uRevealActive: { value: 0.0 },
    }),
    [depthTexture, colorTexture, thickness, smoothness]
  );

  // Animation refs
  const currentRevealProgress = useRef(0);
  const currentRevealActive = useRef(0);

  useFrame((_state, delta) => {
    if (materialRef.current) {
      // --- Reveal Animation ---
      const targetActive = isRevealed ? 1.0 : 0.0;
      // Lerp active state
      currentRevealActive.current = THREE.MathUtils.lerp(
        currentRevealActive.current,
        targetActive,
        delta * 2
      );

      // Logic for Reveal Progress:
      // Use linear accumulation + easing for smoother start/end control
      const revealSpeed = 0.3; // Slower speed for "very slow" feel

      if (isRevealed) {
        // Linear increase 0 -> 1
        currentRevealProgress.current = Math.min(
          1.0,
          currentRevealProgress.current + delta * revealSpeed
        );
      } else {
        // Linear decrease 1 -> 0
        currentRevealProgress.current = Math.max(
          0.0,
          currentRevealProgress.current - delta * revealSpeed * 2.0
        );
      }

      // Apply smoothstep easing for slow start/end
      const t = currentRevealProgress.current;
      const easedProgress = t * t * (3.0 - 2.0 * t);

      materialRef.current.uniforms.uRevealActive.value =
        currentRevealActive.current;
      materialRef.current.uniforms.uRevealProgress.value = easedProgress;

      // --- Interactive Logic ---
      // Only update focus if we are NOT fully in reveal mode (save performance/visual glitches)
      // But actually we might want it to stay updated so it doesn't "jump" when we toggle back.

      if (!isInteractive) {
        // Optional: lerp to center or just stay put.
        // materialRef.current.uniforms.uFocus.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uFocus.value, 0.5, 0.1);
        return;
      }

      let targetDepth;

      // Prioritize touch/mouse if active
      if (isTouchingRef.current) {
        // Mouse/Touch logic
        targetDepth = 1.0 - (pointer.y + 1) * 0.5;
      }
      // Otherwise use tilt if data is available
      else if (tiltRef.current === null) {
        targetDepth = 1.0 - (pointer.y + 1) * 0.5;
      } else {
        // Initialize baseline tilt on first valid reading to prevent jumps
        // This makes the interaction relative to how the user is currently holding the phone
        if (initialTiltRef.current === null) {
          initialTiltRef.current = tiltRef.current;
        }

        // Calculate tilt relative to the initial holding position
        const relativeTilt = tiltRef.current - initialTiltRef.current;

        // Sensitivity range in degrees
        // 50 degrees means +/- 25 degrees covers the full depth range
        const range = 50;

        // Map relative tilt to 0-1 (center at 0.5)
        const normalizedTilt = 0.5 + relativeTilt / range;

        targetDepth = Math.max(0, Math.min(1, normalizedTilt));
      }

      materialRef.current.uniforms.uFocus.value = targetDepth;
    }
  });

  const image = depthTexture.image as HTMLImageElement;

  // Calculate aspect ratio scale to cover the viewport
  const scale = useMemo(() => {
    if (!image) {
      return [viewport.width, viewport.height, 1];
    }

    const imageAspect = image.width / image.height;
    const viewportAspect = viewport.width / viewport.height;

    let w, h;
    // Cover logic
    if (fit === "cover") {
      if (imageAspect > viewportAspect) {
        h = viewport.height;
        w = viewport.height * imageAspect;
      } else {
        w = viewport.width;
        h = viewport.width / imageAspect;
      }
    }
    // Contain logic (default)
    else if (imageAspect > viewportAspect) {
      // Image is wider than viewport -> limit by width match
      w = viewport.width;
      h = viewport.width / imageAspect;
    } else {
      // Image is taller -> limit by height match
      h = viewport.height;
      w = viewport.height * imageAspect;
    }

    return [w, h, 1];
  }, [image, viewport.width, viewport.height, fit]);

  return (
    <mesh scale={scale as any}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        ref={materialRef}
        transparent={true}
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}

interface CursorDepthExplorerProps {
  fit?: "cover" | "contain";
  imagePath?: string;
  smoothness?: number;
  thickness?: number;
}

export default function CursorDepthExplorer({
  imagePath: defaultImagePath = "/experiments/cursor-depth-explorer/depth.png",
  thickness = 0.15,
  smoothness = 1.0,
  fit = "contain",
}: CursorDepthExplorerProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [needsPermissionButton, setNeedsPermissionButton] = useState(false);
  const [currentPaintingIndex, setCurrentPaintingIndex] = useState(0);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Initialize randomized order of paintings once
  const [paintings] = useState(() => {
    // Fisher-Yates shuffle
    const shuffled = [...PAINTINGS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const nextImage = () => {
    setCurrentPaintingIndex((prev) => (prev + 1) % paintings.length);
    setIsRevealed(false); // Reset reveal on change
  };

  // Use refs for high-frequency updates to avoid re-renders
  const tiltRef = useRef<number | null>(null);
  const isTouchingRef = useRef<boolean>(false);

  useEffect(() => {
    // Check if we need a button (iOS 13+)
    // wrapping in try-catch for safety
    try {
      const isIOS =
        typeof (DeviceOrientationEvent as any) !== "undefined" &&
        typeof (DeviceOrientationEvent as any).requestPermission === "function";

      // Avoid synchronous setState warning by pushing to next tick
      setTimeout(() => {
        if (isIOS) {
          setNeedsPermissionButton(true);
        } else {
          setHasPermission(true);
        }
      }, 0);
    } catch (err) {
      console.error("Error checking device support", err);
    }
  }, []);

  useEffect(() => {
    // Reset touching state when modal opens to prevent "stuck" interaction
    if (isInfoModalOpen) {
      isTouchingRef.current = false;
    }
  }, [isInfoModalOpen]);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null) {
        tiltRef.current = event.beta;
      }
    };

    if (hasPermission) {
      window.addEventListener("deviceorientation", handleOrientation);
    }
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [hasPermission]);

  const requestPermission = async () => {
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permissionState = await (
          DeviceOrientationEvent as any
        ).requestPermission();

        if (permissionState === "granted") {
          setHasPermission(true);
          setNeedsPermissionButton(false);
        } else {
          alert("Permission denied. Tilt control will not work.");
        }
      } catch (e: any) {
        console.error(e);
        alert(`Error requesting permission: ${e.message}`);
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 h-full w-full touch-none select-none overflow-hidden bg-black ${isInfoModalOpen ? "pointer-events-none" : "pointer-events-auto"}`}
      onPointerDown={() => {
        isTouchingRef.current = true;
      }}
      onPointerLeave={() => {
        isTouchingRef.current = false;
      }}
      onPointerUp={() => {
        isTouchingRef.current = false;
      }}
    >
      {needsPermissionButton && !hasPermission && (
        <button
          className="pointer-events-auto absolute bottom-8 left-8 z-50 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-white text-xs backdrop-blur-sm transition-colors hover:bg-white/10"
          onClick={requestPermission}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Enable Tilt Control
        </button>
      )}

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        painting={paintings[currentPaintingIndex]}
      />

      {/* Controls Container (Bottom Right) */}
      <div className="pointer-events-none absolute right-8 bottom-8 z-50 flex flex-col items-center gap-3">
        {/* Icons Row: Eye & Info */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Depth Reveal Button */}
          <button
            aria-label="Toggle Depth Map"
            className={`rounded-full border border-white/20 p-3 backdrop-blur-sm transition-colors ${isRevealed ? "bg-white/30 text-white" : "bg-black/50 text-white hover:bg-white/10"}`}
            onClick={() => setIsRevealed(!isRevealed)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Eye size={20} />
          </button>

          {/* Info Button */}
          <button
            aria-label="Painting Information"
            className="rounded-full border border-white/20 bg-black/50 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            onClick={() => setIsInfoModalOpen(true)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Info size={20} />
          </button>
        </div>

        {/* Next Painting Button */}
        <button
          className="pointer-events-auto rounded-full border border-white/20 bg-black/50 px-4 py-2 text-white text-xs tracking-wider backdrop-blur-sm transition-colors hover:bg-white/10"
          onClick={nextImage}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Next Painting
        </button>
      </div>

      <Canvas className="h-full w-full">
        <React.Suspense fallback={null}>
          <Scene
            colorPath={paintings[currentPaintingIndex].imagePath} // Force remount on image change to ensure texture reload
            fit={fit}
            imagePath={paintings[currentPaintingIndex].depthPath}
            isInteractive={!isInfoModalOpen}
            isRevealed={isRevealed}
            isTouchingRef={isTouchingRef}
            key={paintings[currentPaintingIndex].depthPath}
            smoothness={smoothness}
            thickness={thickness}
            tiltRef={tiltRef}
          />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
