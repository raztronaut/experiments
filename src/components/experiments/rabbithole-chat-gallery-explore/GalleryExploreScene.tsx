"use client"

import { useThree, useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import VisualiserLogic from "./VisualiserLogic"
import * as THREE from "three"

export default function GalleryExploreScene() {
    const { scene, camera, gl } = useThree()
    const visualiserManager = useRef<VisualiserLogic | null>(null)

    useEffect(() => {
        // Calculate world dimensions at z=0 (where planes are roughly)
        // Camera default z pos needs to be known.
        // If we assume camera z=10 like reference

        // Ensure camera is positioned as expected if not controlled elsewhere
        // But usually we control camera in Page or Canvas. 
        // We'll read the current camera position.

        const cam = camera as THREE.PerspectiveCamera
        // We assume looking at z=0.
        const distance = cam.position.z
        const vFov = (cam.fov * Math.PI) / 180
        const height = 2 * Math.tan(vFov / 2) * distance
        const width = height * cam.aspect

        if (cam.position.z < 0.1) {
            console.warn("Camera z is too close or 0, calculation might be wrong")
        }

        const sizes = { width, height }

        visualiserManager.current = new VisualiserLogic({ scene, sizes, camera })
        visualiserManager.current.bindDrag(gl.domElement)

        return () => {
            visualiserManager.current?.dispose()
        }
    }, [scene, camera, gl.domElement]) // Re-init if scene/camera changes seriously, though unlikely.

    useFrame((state, delta) => {
        visualiserManager.current?.render(delta)
    })

    return null
}
