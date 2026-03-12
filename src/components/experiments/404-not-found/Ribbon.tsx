import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { RIBBON_TEXT_SPEED_MULTIPLIER } from "./constants";
import { fragmentShader, vertexShader } from "./ribbonShader";
import { scrollVelocityRef } from "./scrollState";
import type { RibbonProps } from "./types";
import { useCachedTexture } from "./useCachedTexture";
import { useFontsReady } from "./useFontsReady";
import {
  generateBackTexture,
  generateFrontTexture,
} from "./utils/textureGenerators";

// 1x1 pixel transparent texture for safe initialization
const DATA_ONE_PIXEL = new Uint8Array([0, 0, 0, 0]);
const EMPTY_TEXTURE = new THREE.DataTexture(
  DATA_ONE_PIXEL,
  1,
  1,
  THREE.RGBAFormat
);
EMPTY_TEXTURE.needsUpdate = true;

const Ribbon = function Ribbon({
  text,
  position,
  rotation,
  color,
  width = 10,
  height = 1.5,
  thickness = 0.5,
  speed = 1.0,
  frequency = 0.5,
  amplitude = 0.3,
  padding = 40,
  subscript = "",
  backsideText = "",
  backsideImage = null,
  backOffset = [0, 0],
  backScale = [1, 1],
  backClamp = 0.0,
  textSpeed = 0.2,
}: RibbonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const fontsReady = useFontsReady();

  // Generate unique key for front texture
  // NOTE: Color removed from key as it is now applied in shader
  const frontTextureKey = `front_${text}_${subscript}_NOCOLOR_${width}_${height}_${fontsReady}`;

  const texture = useCachedTexture(frontTextureKey, () =>
    generateFrontTexture({
      text,
      subscript,
      color: "transparent", // Only used for unused invalidation, essentially ignored by new generator
      width,
      height,
      padding,
      fontsReady,
    })
  );

  // Generate unique key for back texture
  const backTextureKey = backsideImage
    ? null
    : `back_${backsideText || "DEFAULT"}_NOCOLOR_${width}_${height}_${fontsReady}`;

  const generatedBackTexture = useCachedTexture(backTextureKey || "", () =>
    generateBackTexture({
      text: backsideText,
      color,
      width,
      height,
      fontsReady,
    })
  );

  const finalBacksideTexture = backsideImage || generatedBackTexture;

  // STABLE UNIFORMS: Created once via useMemo, values updated imperatively
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTexture: { value: EMPTY_TEXTURE as THREE.Texture },
      uBackTexture: { value: EMPTY_TEXTURE as THREE.Texture },
      uBackOffset: { value: new THREE.Vector2(0, 0) },
      uBackScale: { value: new THREE.Vector2(1, 1) },
      uBackClamp: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uFrequency: { value: frequency },
      uAmplitude: { value: amplitude },
      uOpacity: { value: 1.0 },
      uTextSpeed: { value: textSpeed },
      uRunTime: { value: 0 },
      uRepeat: { value: new THREE.Vector2(1, 1) },
      uBackRepeat: { value: new THREE.Vector2(1, 1) },
    }),
    [amplitude, color, frequency, textSpeed]
  ); // Empty deps = created once and stable forever

  // Update uniforms when props change
  // This avoids recreating the uniforms object which can reset the material
  React.useLayoutEffect(() => {
    uniforms.uBackOffset.value.set(backOffset[0], backOffset[1]);
    uniforms.uBackScale.value.set(backScale[0], backScale[1]);
    uniforms.uBackClamp.value = backClamp;
    uniforms.uColor.value.set(color);
    uniforms.uFrequency.value = frequency;
    uniforms.uAmplitude.value = amplitude;
    uniforms.uTextSpeed.value = textSpeed * RIBBON_TEXT_SPEED_MULTIPLIER;

    if (texture) {
      uniforms.uTexture.value = texture;
      uniforms.uRepeat.value.copy(texture.repeat);
    }

    if (finalBacksideTexture) {
      uniforms.uBackTexture.value = finalBacksideTexture;
      if (finalBacksideTexture instanceof THREE.Texture) {
        uniforms.uBackRepeat.value.copy(finalBacksideTexture.repeat);
      }
    }
  }, [
    texture,
    finalBacksideTexture,
    backOffset,
    backScale,
    backClamp,
    color,
    frequency,
    amplitude,
    textSpeed,
    uniforms,
  ]);

  // ... inside Ribbon component

  // Track accumulated offset manually to handle variable speed
  const offsetRef = useRef(0);

  useFrame((state, delta) => {
    if (materialRef.current) {
      // uTime is scaled by `speed` (wave frequency)
      const time = state.clock.getElapsedTime() * speed;
      materialRef.current.uniforms.uTime.value = time;

      // Update accumulated offset
      // Base speed is 1.0 (accumulated over time), plus scroll velocity
      // Multiplier 2.0 makes scroll effect more pronounced
      const scrollInfluence = scrollVelocityRef.current * 2.0;

      // Accumulate: offset += (1 + scrollBoost) * delta
      // We adding 1.0 to represent the "base" flow of time
      offsetRef.current += (1.0 + scrollInfluence) * delta;

      materialRef.current.uniforms.uRunTime.value = offsetRef.current;
    }
  });

  return (
    <mesh position={position} ref={meshRef} rotation={rotation}>
      <boxGeometry args={[width, height, thickness, 256, 16, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        ref={materialRef}
        side={THREE.DoubleSide}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
};

export default Ribbon;
