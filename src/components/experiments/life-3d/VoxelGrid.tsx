import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface VoxelGridProps {
    grid: Uint8Array;
    intensities: Float32Array;
    ages: Uint16Array;
    dimensions: { width: number; height: number; depth: number };
}

export function VoxelGrid({ grid, intensities, ages, dimensions }: VoxelGridProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { width, height, depth } = dimensions;
    const count = width * height * depth;

    const tempObject = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    // Update instances when grid changes
    useEffect(() => {
        if (!meshRef.current) return;

        let instanceIndex = 0;

        for (let z = 0; z < depth; z++) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = x + y * width + z * width * height;
                    const intensity = intensities[idx];

                    if (intensity > 0.01) {
                        const age = ages[idx];

                        // Coordinate-based banding (Cyan/Pink/Yellow)
                        const nx = x / width;
                        const ny = y / height;

                        // Bands: 
                        // - Top (ny > 0.8): Cream/Yellow
                        // - Bottom Left (nx < 0.5): Magenta/Pink
                        // - Bottom Right (nx >= 0.5): Cyan/Teal

                        if (ny > 0.75) {
                            tempColor.set('#fff176'); // Top: Pale Yellow
                        } else if (nx < 0.5) {
                            tempColor.set('#ff007f'); // Left: Hot Pink
                        } else {
                            tempColor.set('#00ffff'); // Right: Cyan
                        }

                        // Age highlights: Newborns are brighter/white
                        if (age < 2) {
                            tempColor.lerp(new THREE.Color('#ffffff'), 0.8);
                        }

                        // Persistence (Ghosting): Fade color to black based on intensity
                        tempColor.multiplyScalar(intensity);

                        tempObject.position.set(
                            x - width / 2 + 0.5,
                            y - height / 2 + 0.5,
                            z - depth / 2 + 0.5
                        );

                        // Base scale is smaller for ghostly cells
                        const baseScale = intensity * 0.45;
                        tempObject.scale.setScalar(baseScale);
                        tempObject.updateMatrix();

                        meshRef.current.setMatrixAt(instanceIndex, tempObject.matrix);
                        meshRef.current.setColorAt(instanceIndex, tempColor);

                        instanceIndex++;
                    }
                }
            }
        }

        // Hide remaining instances
        for (let i = instanceIndex; i < count; i++) {
            tempObject.position.set(0, 1000, 0); // Move out of view
            tempObject.scale.setScalar(0);
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
        meshRef.current.count = instanceIndex;
    }, [grid, intensities, ages, width, height, depth, count, tempObject, tempColor]);

    // Pulsing animation
    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();

        // Subtle breathing effect on the whole group
        meshRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
        meshRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.02);
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <icosahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    toneMapped={false}
                    emissiveIntensity={4}
                    metalness={1.0}
                    roughness={0.05}
                />
            </instancedMesh>

            {/* Boundary Box - Sharp & Technical wireframe */}
            <mesh>
                <boxGeometry args={[width, height, depth]} />
                <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
            </mesh>
        </group>
    );
}
