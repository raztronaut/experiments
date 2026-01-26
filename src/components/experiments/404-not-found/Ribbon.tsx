"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "./ribbonShader";

interface RibbonProps {
    text: string;
    position: [number, number, number];
    rotation: [number, number, number];
    color: string;
    width?: number;
    height?: number;
    thickness?: number;
    speed?: number;
    frequency?: number;
    amplitude?: number;
    padding?: number;
    subscript?: string;
    backsideText?: string;
    backsideImage?: THREE.Texture | null;
    backOffset?: [number, number];
    backScale?: [number, number];
    backClamp?: number;
    textSpeed?: number;
}

export default function Ribbon({
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

    // Create front text texture
    const texture = useMemo(() => {
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
    }, [text, padding, subscript, color, width, height]);

    // Create backside text texture if needed
    const backsideTexture = useMemo(() => {
        if (backsideImage) return backsideImage;

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
    }, [backsideText, backsideImage, color, width, height]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTexture: { value: texture },
            uBackTexture: { value: backsideTexture },
            uBackOffset: { value: new THREE.Vector2(backOffset[0], backOffset[1]) },
            uBackScale: { value: new THREE.Vector2(backScale[0], backScale[1]) },
            uBackClamp: { value: backClamp },
            uColor: { value: new THREE.Color(color) },
            uFrequency: { value: frequency },
            uAmplitude: { value: amplitude },
            uOpacity: { value: 1.0 },
            uTextSpeed: { value: textSpeed },
            uRepeat: { value: texture ? texture.repeat : new THREE.Vector2(1, 1) },
            uBackRepeat: { value: backsideTexture ? (backsideTexture as THREE.Texture).repeat : new THREE.Vector2(1, 1) },
        }),
        [texture, backsideTexture, backOffset, backScale, backClamp, color, frequency, amplitude, textSpeed]
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * speed;
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
}
