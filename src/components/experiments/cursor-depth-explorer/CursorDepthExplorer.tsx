"use client";

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uDepthTexture;
uniform float uFocus;
uniform float uThickness;
uniform float uSmoothness;
varying vec2 vUv;

void main() {
  vec4 depthColor = texture2D(uDepthTexture, vUv);
  float depth = depthColor.r;

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

  gl_FragColor = vec4(vec3(alpha), 1.0);
}
`;

interface SceneProps {
    tiltRef: React.MutableRefObject<number | null>;
    isTouchingRef: React.MutableRefObject<boolean>;
    imagePath: string;
    thickness: number;
    smoothness: number;
    fit: 'cover' | 'contain';
}

function Scene({ tiltRef, isTouchingRef, imagePath, thickness, smoothness, fit }: SceneProps) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { pointer, viewport } = useThree();

    // Load the depth map
    // Load the depth map and suspend until loaded
    const depthTexture = useTexture(imagePath);

    useEffect(() => {
        // Force update texture when it changes
        if (materialRef.current) {
            materialRef.current.uniforms.uDepthTexture.value = depthTexture;
            materialRef.current.needsUpdate = true;
        }
    }, [depthTexture]);

    // Create uniforms
    const uniforms = useMemo(
        () => ({
            uDepthTexture: { value: depthTexture },
            uFocus: { value: 0.5 },
            uThickness: { value: thickness },
            uSmoothness: { value: smoothness },
        }),
        [depthTexture, thickness, smoothness]
    );

    useFrame(() => {
        if (materialRef.current) {
            let targetDepth;

            // Prioritize touch/mouse if active
            if (isTouchingRef.current) {
                // Mouse/Touch logic
                targetDepth = 1.0 - ((pointer.y + 1) * 0.5);
            }
            // Otherwise use tilt if data is available
            else if (tiltRef.current !== null) {
                // Map tilt (-45 to 45 degrees approx) to 0-1
                // 45 deg = 1, -45 deg = 0
                const normalizedTilt = (tiltRef.current + 45) / 90;
                targetDepth = Math.max(0, Math.min(1, 1.0 - normalizedTilt));
            }
            // Fallback (e.g. initial state)
            else {
                targetDepth = 1.0 - ((pointer.y + 1) * 0.5);
            }

            materialRef.current.uniforms.uFocus.value = targetDepth;
        }
    });

    const image = depthTexture.image as HTMLImageElement;

    // Calculate aspect ratio scale to cover the viewport
    const scale = useMemo(() => {
        if (!image) return [viewport.width, viewport.height, 1];

        const imageAspect = image.width / image.height;
        const viewportAspect = viewport.width / viewport.height;

        let w, h;
        // Cover logic
        if (fit === 'cover') {
            if (imageAspect > viewportAspect) {
                h = viewport.height;
                w = viewport.height * imageAspect;
            } else {
                w = viewport.width;
                h = viewport.width / imageAspect;
            }
        }
        // Contain logic (default)
        else {
            if (imageAspect > viewportAspect) {
                // Image is wider than viewport -> limit by width match
                w = viewport.width;
                h = viewport.width / imageAspect;
            } else {
                // Image is taller -> limit by height match
                h = viewport.height;
                w = viewport.height * imageAspect;
            }
        }

        return [w, h, 1];
    }, [image, viewport.width, viewport.height, fit]);

    return (
        <mesh scale={scale as any}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
            />
        </mesh>
    );
}

interface CursorDepthExplorerProps {
    imagePath?: string;
    thickness?: number;
    smoothness?: number;
    fit?: 'cover' | 'contain';
}

export default function CursorDepthExplorer({
    imagePath: defaultImagePath = '/experiments/cursor-depth-explorer/depth.png',
    thickness = 0.15,
    smoothness = 1.0,
    fit = 'contain'
}: CursorDepthExplorerProps) {
    const [hasPermission, setHasPermission] = useState(false);
    const [needsPermissionButton, setNeedsPermissionButton] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Initialize images in a random order
    const [images] = useState(() => {
        const baseImages = [
            '/experiments/cursor-depth-explorer/depth.png',
            '/experiments/cursor-depth-explorer/depth2.png',
            '/experiments/cursor-depth-explorer/depth3.png',
            '/experiments/cursor-depth-explorer/depth4.png',
            '/experiments/cursor-depth-explorer/depth5.png'
        ];
        // Fisher-Yates shuffle
        const shuffled = [...baseImages];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    });

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    // Use refs for high-frequency updates to avoid re-renders
    const tiltRef = useRef<number | null>(null);
    const isTouchingRef = useRef<boolean>(false);

    useEffect(() => {
        // Check if we need a button (iOS 13+)
        // wrapping in try-catch for safety
        try {
            const isIOS = typeof (DeviceOrientationEvent as any) !== 'undefined' &&
                typeof (DeviceOrientationEvent as any).requestPermission === 'function';

            // Avoid synchronous setState warning by pushing to next tick
            setTimeout(() => {
                if (isIOS) {
                    setNeedsPermissionButton(true);
                } else {
                    setHasPermission(true);
                }
            }, 0);
        } catch (err) {
            console.error('Error checking device support', err);
        }
    }, []);

    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.beta !== null) {
                tiltRef.current = event.beta;
            }
        };

        if (hasPermission) {
            window.addEventListener('deviceorientation', handleOrientation);
        }
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [hasPermission]);

    const requestPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();

                if (permissionState === 'granted') {
                    setHasPermission(true);
                    setNeedsPermissionButton(false);
                } else {
                    alert('Permission denied. Tilt control will not work.');
                }
            } catch (e: any) {
                console.error(e);
                alert('Error requesting permission: ' + e.message);
            }
        }
    };

    return (
        <div
            className="fixed inset-0 w-full h-full bg-black overflow-hidden select-none touch-none"
            onPointerDown={() => { isTouchingRef.current = true; }}
            onPointerUp={() => { isTouchingRef.current = false; }}
            onPointerLeave={() => { isTouchingRef.current = false; }}
        >
            {needsPermissionButton && !hasPermission && (
                <button
                    onClick={requestPermission}
                    className="absolute bottom-8 left-8 z-50 text-white border border-white/20 bg-black/50 backdrop-blur px-4 py-2 rounded-full text-xs hover:bg-white/10 transition-colors"
                >
                    Enable Tilt Control
                </button>
            )}

            {/* Image Switcher */}
            <button
                onClick={nextImage}
                className="absolute bottom-8 right-8 z-50 text-white border border-white/20 bg-black/50 backdrop-blur px-4 py-2 rounded-full text-xs hover:bg-white/10 transition-colors uppercase tracking-wider"
            >
                Next Painting
            </button>

            <Canvas className="w-full h-full">
                <React.Suspense fallback={null}>
                    <Scene
                        key={images[currentImageIndex]} // Force remount on image change to ensure texture reload
                        tiltRef={tiltRef}
                        isTouchingRef={isTouchingRef}
                        imagePath={images[currentImageIndex]}
                        thickness={thickness}
                        smoothness={smoothness}
                        fit={fit}
                    />
                </React.Suspense>
            </Canvas>
        </div>
    );
}