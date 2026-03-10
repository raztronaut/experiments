"use client";

import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { tunnel } from "../store";

function SpinningShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.rotation.x += delta * 0.3;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <Float floatIntensity={0.5} rotationIntensity={0.3} speed={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color="#4d9fff"
          distort={0.3}
          metalness={0.8}
          roughness={0.2}
          speed={3}
        />
      </mesh>
    </Float>
  );
}

function WebGLSync({
  domNode,
}: {
  domNode: React.RefObject<HTMLDivElement | null>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { size, camera } = useThree();

  useFrame(() => {
    if (!(domNode.current && groupRef.current)) {
      return;
    }
    // We get the rect of the DOM placeholder which is moving due to GSAP scrolling
    const rect = domNode.current.getBoundingClientRect();

    // Normalize mapping
    const x = ((rect.left + rect.width / 2) / size.width) * 2 - 1;
    const y = (-(rect.top + rect.height / 2) / size.height) * 2 + 1;

    // Get 3D intersection on Z=0 plane
    const vec = new THREE.Vector3(x, y, 0);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    groupRef.current.position.copy(pos);

    const vFov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const heightAtZ0 = 2 * Math.tan(vFov / 2) * camera.position.z;
    const targetScale = (rect.height / size.height) * heightAtZ0 * 0.45;

    groupRef.current.scale.setScalar(targetScale);
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <directionalLight intensity={1.2} position={[5, 5, 5]} />
      <SpinningShape />
    </group>
  );
}

export function ToolkitScene() {
  const domRef = useRef<HTMLDivElement>(null);

  return (
    <div className="absolute inset-0" ref={domRef}>
      <tunnel.In>
        <WebGLSync domNode={domRef} />
      </tunnel.In>
    </div>
  );
}
