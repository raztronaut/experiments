"use client";

import { useEffect, useRef, RefObject } from "react";
import { vertexShader, fragmentShader } from "./shaders";

declare global {
    interface Window {
        THREE: typeof import("three") | undefined;
    }
}

interface SceneState {
    camera: THREE.Camera | null;
    scene: THREE.Scene | null;
    renderer: THREE.WebGLRenderer | null;
    uniforms: { time: { value: number }; resolution: { value: THREE.Vector2 } } | null;
    animationId: number | null;
    onWindowResize: (() => void) | null;
}

const THREE_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js";

/**
 * Custom hook for managing a Three.js shader scene.
 * Handles dynamic loading, initialization, animation, and complete cleanup.
 */
export function useThreeShader(containerRef: RefObject<HTMLDivElement | null>) {
    const sceneRef = useRef<SceneState>({
        camera: null,
        scene: null,
        renderer: null,
        uniforms: null,
        animationId: null,
        onWindowResize: null,
    });

    useEffect(() => {
        const script = document.createElement("script");
        script.src = THREE_CDN_URL;

        script.onload = () => {
            if (containerRef.current && window.THREE) {
                initThreeJS();
            }
        };

        document.head.appendChild(script);

        return () => {
            cleanup();
            if (script.parentNode) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const cleanup = () => {
        const state = sceneRef.current;

        if (state.animationId !== null) {
            cancelAnimationFrame(state.animationId);
        }

        if (state.onWindowResize) {
            window.removeEventListener("resize", state.onWindowResize);
        }

        if (state.renderer) {
            state.renderer.dispose();
        }

        sceneRef.current = {
            camera: null,
            scene: null,
            renderer: null,
            uniforms: null,
            animationId: null,
            onWindowResize: null,
        };
    };

    const initThreeJS = () => {
        if (!containerRef.current || !window.THREE) return;

        const THREE = window.THREE;
        const container = containerRef.current;

        // Clear any existing content
        container.innerHTML = "";

        // Initialize camera
        const camera = new THREE.Camera();
        camera.position.z = 1;

        // Initialize scene
        const scene = new THREE.Scene();

        // Create geometry
        const geometry = new THREE.PlaneBufferGeometry(2, 2);

        // Define uniforms
        const uniforms = {
            time: { value: 1.0 },
            resolution: { value: new THREE.Vector2() },
        };

        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
        });

        // Create mesh and add to scene
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Handle resize
        const onWindowResize = () => {
            const rect = container.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height);
            uniforms.resolution.value.x = renderer.domElement.width;
            uniforms.resolution.value.y = renderer.domElement.height;
        };

        onWindowResize();
        window.addEventListener("resize", onWindowResize, false);

        // Store references
        sceneRef.current = {
            camera,
            scene,
            renderer,
            uniforms,
            animationId: null,
            onWindowResize,
        };

        // Animation loop
        const animate = () => {
            sceneRef.current.animationId = requestAnimationFrame(animate);
            uniforms.time.value += 0.05;
            renderer.render(scene, camera);
        };

        animate();
    };
}
