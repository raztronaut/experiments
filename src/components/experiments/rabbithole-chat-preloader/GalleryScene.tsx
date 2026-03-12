"use client";

import normalizeWheel from "normalize-wheel";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import Gallery from "./Gallery";

export default function GalleryScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    // --- SETUP ---
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.z = 5;
    scene.add(camera);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    const dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    };

    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(dimensions.pixelRatio);

    const clock = new THREE.Clock();

    // --- GALLERY ---
    const gallery = new Gallery({
      scene,
      cameraZ: camera.position.z,
    });

    let lastDirection = 1;

    // --- EVENTS ---
    const handleResize = () => {
      dimensions.width = window.innerWidth;
      dimensions.height = window.innerHeight;
      dimensions.pixelRatio = Math.min(2, window.devicePixelRatio);

      camera.aspect = dimensions.width / dimensions.height;
      camera.updateProjectionMatrix();

      // Recalculate fov logic from original Canvas.ts if needed,
      // but standard aspect update is usually sufficient unless matching exact vertical framing

      renderer.setSize(dimensions.width, dimensions.height);
      renderer.setPixelRatio(dimensions.pixelRatio);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const normalizedWheel = normalizeWheel(event);
      const delta = event.deltaY;
      let value = Math.sign(event.deltaY);

      if (delta === 0) {
        value = lastDirection;
      } else {
        lastDirection = value;
      }

      // Calculate sizes.height equivalent
      const fov = camera.fov * (Math.PI / 180);
      const height = camera.position.z * Math.tan(fov / 2) * 2;

      gallery.updateScroll(
        (normalizedWheel.pixelY * height) / window.innerHeight,
        lastDirection
      );
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("wheel", handleWheel, { passive: false });

    // --- LOOP ---
    let frameId: number;
    const animate = () => {
      const time = clock.getElapsedTime();

      gallery.render(time);
      renderer.render(scene, camera);

      frameId = requestAnimationFrame(animate);
    };

    animate();

    // --- CLEANUP ---
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(frameId);

      // Dispose logic
      renderer.dispose();
      // Basic traverse dispose
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material.dispose) {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return <canvas className="fixed inset-0 h-full w-full" ref={canvasRef} />;
}
