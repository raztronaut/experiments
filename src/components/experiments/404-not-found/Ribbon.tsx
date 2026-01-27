import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "./ribbonShader";
import { useCachedTexture } from "./useCachedTexture";
import { useFontsReady } from "./useFontsReady";
import { RibbonProps } from "./types";

const Ribbon = React.memo(function Ribbon({
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
    const frontTextureKey = `front_${text}_${subscript}_${color}_${width}_${height}`;

    // Front texture generator
    const generateFrontTexture = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const canvasHeight = 512;
        ctx.font = `900 ${canvasHeight * 0.6}px "Inter", "Arial Black", sans-serif`;
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;

        let totalTextWidth = textWidth;
        if (subscript) {
            ctx.font = `900 ${canvasHeight * 0.3}px "Inter", "Arial Black", sans-serif`;
            totalTextWidth += ctx.measureText(subscript).width + 8;
        }

        const unitWidth = totalTextWidth + padding * 2;
        canvas.width = unitWidth;
        canvas.height = canvasHeight;

        // Draw background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, unitWidth, canvasHeight);

        // Draw red guide lines
        ctx.strokeStyle = "#be123c";
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight * 0.18); ctx.lineTo(unitWidth, canvasHeight * 0.18);
        ctx.moveTo(0, canvasHeight * 0.82); ctx.lineTo(unitWidth, canvasHeight * 0.82);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Draw text
        ctx.font = `900 ${canvasHeight * 0.6}px "Inter", "Arial Black", sans-serif`;
        ctx.fillStyle = "#0c0c0c";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.letterSpacing = "-2px";
        ctx.fillText(text, padding, canvasHeight * 0.52);

        if (subscript) {
            ctx.font = `900 ${canvasHeight * 0.3}px "Inter", "Arial Black", sans-serif`;
            ctx.fillText(subscript, padding + textWidth - 4, canvasHeight * 0.65);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;

        const unitAspect = unitWidth / canvasHeight;
        const geomAspect = width / height;
        tex.repeat.set(geomAspect / unitAspect, 1);

        tex.anisotropy = 16;
        return tex;
    };

    const texture = useCachedTexture(frontTextureKey, generateFrontTexture, [text, subscript, color, width, height, padding, fontsReady]);

    // Generate unique key for back texture
    // Include all visual props in the key
    const backTextureKey = backsideImage
        ? null // No caching for external image textures for now (handled by useTexture upstream or unique)
        : `back_${backsideText || 'DEFAULT'}_${color}_${width}_${height}`;

    const generateBackTexture = () => {
        // If no specifically provided text, we still want the "INSPIRED BY" repeating
        const baseBackText = backsideText || "INSPIRED BY DAY JOB";

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const canvasHeight = 512;
        // Match front side style but maybe different font variant
        ctx.font = `italic 900 ${canvasHeight * 0.45}px "Inter", "system-ui", sans-serif`;
        const textWidth = ctx.measureText(baseBackText).width;

        const backPadding = 120; // Nice loose spacing for repetition
        const unitWidth = textWidth + backPadding * 2;

        canvas.width = unitWidth;
        canvas.height = canvasHeight;

        // Warm paper background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, unitWidth, canvasHeight);

        // Guide lines
        ctx.strokeStyle = "#be123c";
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight * 0.18); ctx.lineTo(unitWidth, canvasHeight * 0.18);
        ctx.moveTo(0, canvasHeight * 0.82); ctx.lineTo(unitWidth, canvasHeight * 0.82);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Text
        ctx.font = `italic 900 ${canvasHeight * 0.45}px "Inter", "system-ui", sans-serif`;
        ctx.fillStyle = "#0c0c0c";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(baseBackText, unitWidth / 2, canvasHeight * 0.52);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;

        // Calculate repeat for text mode
        const unitAspect = unitWidth / canvasHeight;
        const geomAspect = width / height;
        tex.repeat.set(geomAspect / unitAspect, 1);

        return tex;
    }

    // Special case: if backsideImage is provided, use it directly (it's already a texture from useTexture upstream)
    // If NOT provided, use generated cache
    const generatedBackTexture = useCachedTexture(backTextureKey || "", generateBackTexture, [backsideText, color, width, height, fontsReady]);

    const finalBacksideTexture = backsideImage || generatedBackTexture;

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTexture: { value: texture },
            uBackTexture: { value: finalBacksideTexture },
            uBackOffset: { value: new THREE.Vector2(backOffset[0], backOffset[1]) },
            uBackScale: { value: new THREE.Vector2(backScale[0], backScale[1]) },
            uBackClamp: { value: backClamp },
            uColor: { value: new THREE.Color(color) },
            uFrequency: { value: frequency },
            uAmplitude: { value: amplitude },
            uOpacity: { value: 1.0 },
            uTextSpeed: { value: textSpeed },
            // NOTE: We need to default to new THREE.Vector2(1,1) if texture isn't ready
            uRepeat: { value: texture ? texture.repeat : new THREE.Vector2(1, 1) },
            uBackRepeat: { value: finalBacksideTexture ? (finalBacksideTexture as THREE.Texture).repeat : new THREE.Vector2(1, 1) },
        }),
        [texture, finalBacksideTexture, backOffset, backScale, backClamp, color, frequency, amplitude, textSpeed]
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * speed;
            if (texture) materialRef.current.uniforms.uTexture.value = texture;
            if (finalBacksideTexture) materialRef.current.uniforms.uBackTexture.value = finalBacksideTexture;
        }
    });

    return (
        <mesh ref={meshRef} position={position} rotation={rotation}>
            <boxGeometry args={[width, height, thickness, 256, 16, 1]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    );
});

export default Ribbon;
