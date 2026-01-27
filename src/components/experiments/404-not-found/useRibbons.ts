import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { RibbonProps } from "./types";
import {
    RIBBON_STRIP_COUNT,
    RIBBON_BASE_HEIGHT,
    RIBBON_BASE_THICKNESS,
    RIBBON_VERTICAL_SPREAD,
    RIBBON_IMAGE_START_IDX,
    RIBBON_IMAGE_ROWS,
    RIBBON_WIDTH,
    RIBBON_COLORS,
    RIBBON_FONTS,
    RIBBON_TEXTS,
    BACKSIDE_TEXT,
    BACKSIDE_IMAGE_PATH
} from "./constants";

export function useRibbons() {

    // We can call hooks conditionally here if we assume this component is always rendered the same way,
    // but better practice is to just use useTexture at top level.
    // However, since this is a custom hook intended for the component, it's fine.
    const dayjobTexture = useTexture(BACKSIDE_IMAGE_PATH);

    const ribbons = useMemo(() => {
        const totalHeight = RIBBON_STRIP_COUNT * (RIBBON_BASE_HEIGHT + RIBBON_VERTICAL_SPREAD);
        const startY = totalHeight / 2;
        const imageEndIdx = RIBBON_IMAGE_START_IDX + RIBBON_IMAGE_ROWS;

        return Array.from({ length: RIBBON_STRIP_COUNT }).map((_, i) => {
            const seedVal = i * 777.77;
            const random = (s: number) => {
                const x = Math.sin(s + seedVal) * 10000;
                return x - Math.floor(x);
            };

            // Calculate precise Y to ensure no overlapping
            const y = startY - i * (RIBBON_BASE_HEIGHT + RIBBON_VERTICAL_SPREAD);

            const isInImageSection = (i >= RIBBON_IMAGE_START_IDX - 1 && i < imageEndIdx);

            const xJitter = isInImageSection ? 0 : (random(3) - 0.5) * 4;
            const rotZ = isInImageSection ? 0 : (random(2) - 0.5) * 0.1;

            // Synchronize wave parameters for the image section so it moves like a single sheet
            const amplitude = isInImageSection ? 3.0 : (2.5 + random(5) * 1.0);
            const frequency = isInImageSection ? 0.04 : (0.03 + random(6) * 0.02);
            const speed = isInImageSection ? 0.015 : (0.01 + random(4) * 0.015);

            // Subtle rotation and Z staggering to look like a "pile"
            const z = (random(1) - 0.5) * 2;
            const textIndex = Math.floor(random(4) * RIBBON_TEXTS.length);
            const text = RIBBON_TEXTS[textIndex];

            // Backside Image Logic (Instagram feed style)
            let backsideImage = null;
            let backOffset: [number, number] = [0, 0];
            let backScale: [number, number] = [1, 1];
            let backClamp = 0.0;

            if (i >= RIBBON_IMAGE_START_IDX && i < imageEndIdx) {
                backsideImage = dayjobTexture;
                backClamp = 1.0;
                const rowIndex = i - RIBBON_IMAGE_START_IDX;

                // Total height the image spans in 3D units
                const totalImageHeight = RIBBON_IMAGE_ROWS * RIBBON_BASE_HEIGHT + (RIBBON_IMAGE_ROWS - 1) * RIBBON_VERTICAL_SPREAD;
                const imageAspect = 2624 / 1838; // 1.4276
                const totalImageWidth = totalImageHeight * imageAspect;

                // scaleX = ribbon_width / target_image_width
                const scaleX = RIBBON_WIDTH / totalImageWidth;
                const scaleY = RIBBON_BASE_HEIGHT / totalImageHeight;

                // No jitter anymore in image section, so offsetX is simpler
                const offsetX = 0.5 * (1 - scaleX);

                const offsetY = (RIBBON_IMAGE_ROWS - 1 - rowIndex) * (RIBBON_BASE_HEIGHT + RIBBON_VERTICAL_SPREAD) / totalImageHeight;

                backOffset = [offsetX, offsetY];
                backScale = [scaleX, scaleY];
            }

            const ribbon: RibbonProps = {
                text,
                subscript: (text.includes("404") && i % 8 === 3) ? "4" : "",
                color: RIBBON_COLORS[i % RIBBON_COLORS.length],
                fontFamily: RIBBON_FONTS[0],
                position: [xJitter, y, z],
                rotation: [-0.08, 0, rotZ],
                speed,
                width: RIBBON_WIDTH,
                height: RIBBON_BASE_HEIGHT,
                thickness: RIBBON_BASE_THICKNESS,
                amplitude,
                frequency,
                fontWeight: "900",
                padding: 120,
                seed: seedVal,
                backsideText: BACKSIDE_TEXT,
                backsideImage,
                backOffset,
                backScale,
                backClamp,
                textSpeed: (random(7) - 0.5) * 12,
            };

            return ribbon;
        });
    }, [dayjobTexture]);

    return ribbons;
}
