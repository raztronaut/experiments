"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// CRT screen shader — scanlines, noise, color tint
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform float uIsLogo;
  uniform sampler2D uTexture;
  uniform float uHasTexture;
  uniform float uBrightness;
  uniform vec3 uBgColor;
  uniform float uIsDark;
  varying vec2 vUv;

  // Simple pseudo-random
  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    if (uIsLogo > 0.5) {
      if (uHasTexture > 0.5) {
        vec4 tex = texture2D(uTexture, vUv);
        // Blend logo against the exact wall color
        
        vec3 lightLogo = vec3(0.12, 0.14, 0.18);
        vec3 darkLogo = vec3(1.0);
        vec3 darkWall = vec3(0.0);
        
        vec3 activeWall = mix(uBgColor, darkWall, uIsDark);
        vec3 activeLogo = mix(lightLogo, darkLogo, uIsDark);

        vec3 finalColor = mix(activeWall, activeLogo, tex.a);
        gl_FragColor = vec4(finalColor, uOpacity);
      } else {
        // Fallback basketball logo
        vec2 center = vUv - 0.5;
        float dist = length(center);
        float circle = smoothstep(0.32, 0.30, dist) - smoothstep(0.28, 0.26, dist);
        float fill = smoothstep(0.28, 0.26, dist);
        
        float lineH = smoothstep(0.012, 0.008, abs(center.y));
        float lineV = smoothstep(0.012, 0.008, abs(center.x));
        float arc1 = smoothstep(0.012, 0.008, abs(length(center - vec2(0.15, 0.0)) - 0.18));
        float arc2 = smoothstep(0.012, 0.008, abs(length(center - vec2(-0.15, 0.0)) - 0.18));
        
        float inner = fill * max(max(lineH, lineV), max(arc1, arc2));
        float logoMask = max(circle, inner);
        
        vec3 lightLogo = vec3(0.12, 0.14, 0.18);
        vec3 darkLogo = vec3(1.0);
        vec3 darkWall = vec3(0.0);

        vec3 activeWall = mix(uBgColor, darkWall, uIsDark);
        vec3 activeLogo = mix(lightLogo, darkLogo, uIsDark);

        gl_FragColor = vec4(mix(activeWall, activeLogo, logoMask), uOpacity);
      }
      return;
    }

    // --- CRT Screen Effect ---
    vec3 baseColor = uColor * uBrightness;

    if (uHasTexture > 0.5 && uIsLogo < 0.5) {
      vec4 texColor = texture2D(uTexture, vUv);
      // Mix the video color with the base tint, keeping brightness control
      baseColor = mix(baseColor, texColor.rgb * uBrightness, 0.85);
    }

    // Scanlines (horizontal)
    float scanline = sin(vUv.y * 300.0 + uTime * 3.0) * 0.06;
    float scanline2 = sin(vUv.y * 100.0 - uTime * 1.5) * 0.03;

    // Animated static noise (reduced for a cleaner look)
    float baseNoiseFactor = mix(0.08, 0.12, uIsDark);
    float noise = rand(vUv * 0.5 + fract(uTime * 0.7)) * baseNoiseFactor;

    // Rolling bar (like a desynced CRT)
    float rollPos = fract(uTime * 0.15);
    float roll = smoothstep(rollPos - 0.04, rollPos, vUv.y) 
               - smoothstep(rollPos, rollPos + 0.04, vUv.y);
    roll *= 0.15;

    // Edge darkening (per-panel vignette)
    vec2 edgeDist = abs(vUv - 0.5) * 2.0;
    float panelVignette = 1.0 - dot(edgeDist, edgeDist) * 0.3;

    // Subtle color shifting / chromatic feel
    float rShift = baseColor.r + noise * 0.6 + scanline;
    float gShift = baseColor.g + noise * 0.4 + scanline2;
    float bShift = baseColor.b + noise * 0.5 + roll;

    vec3 finalColor = vec3(rShift, gShift, bShift) * panelVignette;

    // Phosphor dot grid overlay
    float dotGrid = sin(vUv.x * 600.0) * sin(vUv.y * 600.0);
    dotGrid = dotGrid * 0.03 + 1.0;
    finalColor *= dotGrid;

    // Screen edge glow (interpolated for mode)
    float edgeGlow = smoothstep(0.48, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    vec3 lightEdgeGlow = vec3(0.2, 0.25, 0.3);
    vec3 darkEdgeGlow = vec3(0.05, 0.12, 0.2); // Original broadcast blue
    finalColor += mix(lightEdgeGlow, darkEdgeGlow, uIsDark) * edgeGlow * 0.5;

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

// Dark broadcast-tone palette for screens
const SCREEN_COLORS = [
  [0.08, 0.15, 0.25], // dark navy
  [0.12, 0.08, 0.18], // deep purple
  [0.06, 0.14, 0.12], // forest
  [0.18, 0.1, 0.06], // amber dark
  [0.1, 0.1, 0.16], // slate blue
  [0.14, 0.06, 0.1], // wine
  [0.05, 0.12, 0.2], // broadcast blue
  [0.1, 0.14, 0.08], // camo green
  [0.16, 0.08, 0.12], // maroon
  [0.08, 0.08, 0.18], // midnight
  [0.12, 0.12, 0.06], // olive
  [0.06, 0.1, 0.18], // steel blue
  [0.14, 0.1, 0.14], // dusty purple
  [0.1, 0.06, 0.06], // dark red
];

interface ScreenPanelProps {
  bgColor?: string;
  colorIndex?: number;
  imageSrc?: string;
  isDark?: boolean;
  isLogo?: boolean;
  position: [number, number, number];
  size: [number, number];
  timeOffset?: number;
  videoSrc?: string;
}

export default function ScreenPanel({
  position,
  size,
  isLogo = false,
  colorIndex = 0,
  timeOffset = 0,
  videoSrc,
  imageSrc,
  bgColor = "#f7f7f9",
  isDark = false,
}: ScreenPanelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const color = SCREEN_COLORS[colorIndex % SCREEN_COLORS.length];

  const uniforms = useMemo(() => {
    // Create a specific Color instance for the background so ThreeJS handles the exact color space conversion
    const initialBg = new THREE.Color(bgColor);
    return {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Vector3(color[0], color[1], color[2]) },
      uIsLogo: { value: isLogo ? 1.0 : 0.0 },
      uTexture: { value: new THREE.Texture() },
      uHasTexture: { value: 0.0 },
      uBrightness: { value: 1.0 },
      uBgColor: { value: initialBg },
      uIsDark: { value: isDark ? 1.0 : 0.0 },
    };
  }, [bgColor, color[0], isDark, isLogo]);

  // Update uniforms dynamically when theme changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uBgColor.value.set(bgColor);
      materialRef.current.uniforms.uIsDark.value = isDark ? 1.0 : 0.0;
    }
  }, [bgColor, isDark]);

  // Load textures manually to avoid hook conditional rendering
  useEffect(() => {
    if (!materialRef.current) {
      return;
    }

    if (videoSrc && !isLogo) {
      const video = document.createElement("video");
      video.crossOrigin = "Anonymous";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.src = videoSrc;
      video.play().catch(() => {});

      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;

      materialRef.current.uniforms.uTexture.value = texture;
      materialRef.current.uniforms.uHasTexture.value = 1.0;
    } else if (imageSrc && isLogo) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(imageSrc, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.generateMipmaps = true;
        if (materialRef.current) {
          materialRef.current.uniforms.uTexture.value = texture;
          materialRef.current.uniforms.uHasTexture.value = 1.0;
        }
      });
    }
  }, [videoSrc, imageSrc, isLogo]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value =
        state.clock.elapsedTime + timeOffset;
    }
  });

  return (
    <mesh position={position} ref={meshRef}>
      <planeGeometry args={[size[0], size[1]]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}
