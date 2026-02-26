"use client";

import { useRef, useMemo, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// Barrel distortion + vignette + chromatic aberration shader
const DistortionShader = {
    uniforms: {
        tDiffuse: { value: null },
        uDistortion: { value: 0.0 },
        uVignetteOffset: { value: 1.0 },
        uVignetteDarkness: { value: 1.2 },
        uChromaticAberration: { value: 0.002 },
        uTime: { value: 0.0 },
        uGlowIntensity: { value: 0.0 },
        uBgColor: { value: new THREE.Color("#f7f7f9") },
        uIsDark: { value: 0.0 },
    },

    vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

    fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uDistortion;
    uniform float uVignetteOffset;
    uniform float uVignetteDarkness;
    uniform float uChromaticAberration;
    uniform float uTime;
    uniform float uGlowIntensity;
    uniform vec3 uBgColor;
    uniform float uIsDark;
    varying vec2 vUv;

    vec2 barrelDistortion(vec2 uv, float distortion) {
      vec2 shifted = 2.0 * (uv - 0.5);
      float r2 = dot(shifted, shifted);
      shifted *= (0.88 + distortion * r2);
      return shifted * 0.5 + 0.5;
    }

    void main() {
      // Apply barrel distortion
      vec2 distortedUv = barrelDistortion(vUv, uDistortion);

      // Chromatic aberration — offset R and B channels slightly
      float ca = uChromaticAberration * (1.0 + uDistortion * 0.5);
      vec2 dir = normalize(vUv - 0.5) * ca;
      
      float r = texture2D(tDiffuse, barrelDistortion(vUv + dir, uDistortion)).r;
      float g = texture2D(tDiffuse, distortedUv).g;
      float b = texture2D(tDiffuse, barrelDistortion(vUv - dir, uDistortion)).b;

      vec3 color = vec3(r, g, b);

      // Mask out edge smearing caused by out-of-bounds UV sampling
      float maskX = step(0.0, distortedUv.x) * step(distortedUv.x, 1.0);
      float maskY = step(0.0, distortedUv.y) * step(distortedUv.y, 1.0);
      float mask = maskX * maskY;
      
      // Outside the rendered area, show the background color
      color = mix(uBgColor, color, mask);

      // Vignette effect (wider and softer, dynamically darker for dark mode)
      vec2 shifted = 2.0 * (vUv - 0.5);
      float dist = length(shifted);
      
      float vignetteDarkness = mix(0.3, uVignetteDarkness, uIsDark);
      float vignette = smoothstep(
        1.6, // Start fading further out
        0.5, // fully visible in the center
        dist * vignetteDarkness
      );

      // Subtle scan-line overlay on the whole scene
      float globalScan = sin(vUv.y * 800.0) * 0.015 + 1.0;

      // Only apply vignette and scanlines to the "screen" areas, not the background wall.
      // We can detect the wall by checking if the color is exactly our uBgColor.
      float isWall = step(length(color - uBgColor), 0.01);
      
      color = mix(color * vignette * globalScan, color, isWall);

      // Ambient glow from screens
      float glow = smoothstep(0.6, 0.0, dist) * uGlowIntensity;
      vec3 lightGlow = vec3(0.5, 0.6, 0.8) * 0.3;
      vec3 darkGlow = vec3(0.02, 0.06, 0.12) * 1.0;
      
      // In light mode, mask the glow from the wall. In dark mode, let it bleed (original implementation feel).
      float glowMask = mix(1.0 - isWall, 1.0, uIsDark);
      color += mix(lightGlow, darkGlow, uIsDark) * glow * glowMask;

      // Slight film grain
      float grain = fract(sin(dot(vUv + fract(uTime), vec2(12.9898, 78.233))) * 43758.5453);
      color += (grain - 0.5) * 0.02;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

interface DistortionPassProps {
    distortionRef?: React.MutableRefObject<{
        setDistortion: (value: number) => void;
        setGlow: (value: number) => void;
        uniforms: Record<string, { value: number }>;
    } | null>;
    isDark?: boolean;
}

export default function DistortionPass({ distortionRef, isDark = false }: DistortionPassProps) {
    const { gl, scene, camera, size } = useThree();
    const composerRef = useRef<EffectComposer | null>(null);
    const shaderPassRef = useRef<ShaderPass | null>(null);

    const { composer, shaderPass } = useMemo(() => {
        const renderTarget = new THREE.WebGLRenderTarget(
            size.width * Math.min(window.devicePixelRatio, 2),
            size.height * Math.min(window.devicePixelRatio, 2),
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
            }
        );

        const comp = new EffectComposer(gl, renderTarget);
        const renderPass = new RenderPass(scene, camera);
        const distortionPass = new ShaderPass(DistortionShader);
        const outputPass = new OutputPass();

        comp.addPass(renderPass);
        comp.addPass(distortionPass);
        comp.addPass(outputPass);

        return { composer: comp, shaderPass: distortionPass };
    }, [gl, scene, camera, size]);

    // Store refs in effects to avoid modifying during render
    useEffect(() => {
        composerRef.current = composer;
        shaderPassRef.current = shaderPass;
    }, [composer, shaderPass]);

    // Handle theme updates
    useEffect(() => {
        if (shaderPassRef.current) {
            shaderPassRef.current.uniforms.uIsDark.value = isDark ? 1.0 : 0.0;
            const bgHex = isDark ? "#050508" : "#f7f7f9";
            shaderPassRef.current.uniforms.uBgColor.value.set(bgHex);
        }
    }, [isDark]);

    // Expose control interface for GSAP
    useEffect(() => {
        if (distortionRef) {
            distortionRef.current = {
                setDistortion: (value: number) => {
                    if (shaderPassRef.current) {
                        shaderPassRef.current.uniforms.uDistortion.value = value;
                    }
                },
                setGlow: (value: number) => {
                    if (shaderPassRef.current) {
                        shaderPassRef.current.uniforms.uGlowIntensity.value = value;
                    }
                },
                uniforms: shaderPassRef.current?.uniforms as Record<
                    string,
                    { value: number }
                >,
            };
        }
    }, [distortionRef, shaderPass]);

    // Handle resize
    useEffect(() => {
        const dpr = Math.min(window.devicePixelRatio, 2);
        composerRef.current?.setSize(size.width * dpr, size.height * dpr);
    }, [size]);

    useFrame((state) => {
        if (shaderPassRef.current) {
            shaderPassRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
        composerRef.current?.render();
    }, 1);

    return null;
}
