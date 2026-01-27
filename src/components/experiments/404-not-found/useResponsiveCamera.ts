import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

/**
 * Adjusts the camera position based on the viewport width (responsiveness).
 * On mobile, we move the camera back so the ribbons fit better.
 */
export function useResponsiveCamera() {
    const { camera, size } = useThree();

    useEffect(() => {
        if (!(camera instanceof THREE.PerspectiveCamera)) return;

        // Simple breakpoint logic
        // If width < 768 (mobile/tablet portrait), move camera back
        const isMobile = size.width < 768;

        // Base Z position for desktop is 32 (from original code)
        // For mobile, we push it back significantly, e.g., 65
        const targetZ = isMobile ? 65 : 32;

        camera.position.setZ(targetZ);
        camera.updateProjectionMatrix();

    }, [camera, size.width]);
}
