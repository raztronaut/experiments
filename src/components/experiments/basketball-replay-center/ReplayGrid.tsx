"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import ScreenPanel from "./ScreenPanel";

// Grid configuration
const COLS = 5;
const ROWS = 3;
const PANEL_WIDTH = 2.4;
const PANEL_HEIGHT = 1.4;
const GAP = 0.08;
const CENTER_COL = 2;
const CENTER_ROW = 1;

export interface GridPanelRef {
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
    isLogo: boolean;
    col: number;
    row: number;
}

export interface ReplayGridHandle {
    getPanels: () => GridPanelRef[];
}

export interface ReplayGridProps {
    bgColor?: string;
    isDark?: boolean;
}

const ReplayGrid = forwardRef<ReplayGridHandle, ReplayGridProps>(function ReplayGrid({ bgColor = "#f7f7f9", isDark = false }, ref) {
    const panelRefs = useRef<Map<string, THREE.Mesh>>(new Map());
    const { size } = useThree();

    // Calculate a responsive scale factor. 
    // If it's a portrait screen (mobile), scale down aggressively so all 5 columns fit.
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.0;
    const scale = isMobile ? Math.max(0.35, aspect * 0.45) : 1.0;

    useImperativeHandle(ref, () => ({
        getPanels: () => {
            const panels: GridPanelRef[] = [];
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const key = `${row}-${col}`;
                    const mesh = panelRefs.current.get(key);
                    if (mesh) {
                        panels.push({
                            mesh,
                            material: mesh.material as THREE.ShaderMaterial,
                            isLogo: col === CENTER_COL && row === CENTER_ROW,
                            col,
                            row,
                        });
                    }
                }
            }
            return panels;
        },
    }));

    const panels = [];
    const totalWidth = COLS * PANEL_WIDTH + (COLS - 1) * GAP;
    const totalHeight = ROWS * PANEL_HEIGHT + (ROWS - 1) * GAP;
    const offsetX = -totalWidth / 2 + PANEL_WIDTH / 2;
    const offsetY = totalHeight / 2 - PANEL_HEIGHT / 2;

    let colorIdx = 0;
    let clipIdx = 1;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const isLogo = col === CENTER_COL && row === CENTER_ROW;
            const x = offsetX + col * (PANEL_WIDTH + GAP);
            const y = offsetY - row * (PANEL_HEIGHT + GAP);
            const key = `${row}-${col}`;

            const imageSrc = isLogo ? "/experiments/basketball-replay-center/pickandroll-logo.svg" : undefined;
            // Pad the clip ID with zeros e.g. "01", "02"
            const clipNum = clipIdx.toString().padStart(2, "0");
            const videoSrc = !isLogo ? `/experiments/basketball-replay-center/clips/clip_${clipNum}.mp4` : undefined;
            if (!isLogo) clipIdx++;

            panels.push(
                <group
                    key={key}
                    ref={(el: THREE.Group | null) => {
                        if (el) {
                            // Store the first child mesh
                            const mesh = el.children[0] as THREE.Mesh;
                            if (mesh) panelRefs.current.set(key, mesh);
                        }
                    }}
                >
                    <ScreenPanel
                        position={[x, y, 0]}
                        size={[PANEL_WIDTH, PANEL_HEIGHT]}
                        isLogo={isLogo}
                        colorIndex={isLogo ? 0 : colorIdx++}
                        timeOffset={(row * COLS + col) * 1.37}
                        videoSrc={videoSrc}
                        imageSrc={imageSrc}
                        bgColor={bgColor}
                        isDark={isDark}
                    />
                </group>
            );
        }
    }

    return (
        <group scale={scale}>
            {/* Background plane to prevent black canvas from bleeding through distortion */}
            <mesh position={[0, 0, -0.5]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color={bgColor} />
            </mesh>
            {panels}
        </group>
    );
});

export default ReplayGrid;
