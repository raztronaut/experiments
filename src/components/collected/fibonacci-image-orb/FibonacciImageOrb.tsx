"use client";

import { useEffect, useRef } from "react";
import "./styles.css";

export interface FibonacciImageOrbProps {
  backgroundColor?: string;
  className?: string;
  images?: string[];
  planeHeight?: number;
  planeWidth?: number;
  sphereRadius?: number;
  totalItems?: number;
}

const DEFAULT_IMAGES = Array.from(
  { length: 15 },
  (_, i) =>
    `https://images.unsplash.com/photo-${
      [
        "1618005182384-a83a8bd57fbe",
        "1614850523459-c2f4c699c52e",
        "1558591710-4b4a1ae0f04d",
        "1579547945413-497e1b99dac0",
        "1541961017774-22349e4a1262",
        "1578301978693-85fa9c0320b9",
        "1549490349-8643362247b5",
        "1604871000636-074fa5117945",
        "1618005198919-d3d4b5a92ead",
        "1635070041078-e363dbe005cb",
        "1557672172-298e090bd0f1",
        "1560762484-813fc97650a0",
        "1567095761054-7a02e69e5b2b",
        "1551376347-075b0121a65b",
        "1506905925346-21bda4d32df4",
      ][i % 15]
    }?w=400&q=80`
);

/**
 * 3D Fibonacci sphere of image planes.
 * Requires Three.js loaded globally or as ES module.
 * Uses vanilla Three.js (not R3F) for portability.
 */
export function FibonacciImageOrb({
  images = DEFAULT_IMAGES,
  totalItems = 100,
  sphereRadius = 5,
  planeWidth = 1,
  planeHeight = 0.6,
  backgroundColor = "#3b3b3b",
  className,
}: FibonacciImageOrbProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    let disposed = false;

    const init = async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );

      if (disposed) {
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        mount.clientWidth / mount.clientHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setClearColor(new THREE.Color(backgroundColor));
      renderer.setPixelRatio(window.devicePixelRatio);
      mount.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 1.2;
      controls.minDistance = 6;
      controls.maxDistance = 10;
      controls.enablePan = false;

      const textureLoader = new THREE.TextureLoader();
      let loadedCount = 0;

      const getRandomImage = () =>
        images[Math.floor(Math.random() * images.length)];

      const loadImageMesh = (phi: number, theta: number) => {
        textureLoader.load(
          getRandomImage(),
          (texture) => {
            if (disposed) {
              return;
            }

            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;

            const imgAspect = texture.image.width / texture.image.height;
            let w = planeWidth;
            let h = planeHeight;
            if (imgAspect > 1) {
              h = w / imgAspect;
            } else {
              w = h * imgAspect;
            }

            const geometry = new THREE.PlaneGeometry(w, h);
            const material = new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.DoubleSide,
              depthWrite: true,
              depthTest: true,
            });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.x = sphereRadius * Math.cos(theta) * Math.sin(phi);
            mesh.position.y = sphereRadius * Math.sin(theta) * Math.sin(phi);
            mesh.position.z = sphereRadius * Math.cos(phi);
            mesh.lookAt(0, 0, 0);
            mesh.rotateY(Math.PI);

            scene.add(mesh);
            loadedCount++;
            if (loadedCount === totalItems) {
              animate();
            }
          },
          undefined,
          () => {
            loadedCount++;
            if (loadedCount === totalItems) {
              animate();
            }
          }
        );
      };

      for (let i = 0; i < totalItems; i++) {
        const phi = Math.acos(-1 + (2 * i) / totalItems);
        const theta = Math.sqrt(totalItems * Math.PI) * phi;
        loadImageMesh(phi, theta);
      }

      camera.position.z = 10;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      let rafId = 0;
      const animate = () => {
        if (disposed) {
          return;
        }
        controls.update();
        renderer.render(scene, camera);
        if (!prefersReduced) {
          rafId = requestAnimationFrame(animate);
        }
      };

      const onResize = () => {
        if (disposed) {
          return;
        }
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      return () => {
        disposed = true;
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        controls.dispose();
        renderer.dispose();
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (obj.material instanceof THREE.Material) {
              obj.material.dispose();
            }
          }
        });
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((c) => {
      cleanup = c;
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [
    images,
    totalItems,
    sphereRadius,
    planeWidth,
    planeHeight,
    backgroundColor,
  ]);

  return (
    <div className={`fio-container ${className ?? ""}`.trim()} ref={mountRef} />
  );
}

export default FibonacciImageOrb;
