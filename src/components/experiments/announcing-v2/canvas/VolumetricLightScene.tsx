import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  volumetricLightFragmentShader,
  volumetricLightVertex,
} from "../shaders/volumetricLight";
import { useAnnouncingStore } from "../store";

const _v3A = new THREE.Vector3();
const _v3B = new THREE.Vector3();

const COLUMN_POSITIONS: [number, number, number][] = [
  [-3, 0, -2],
  [-1.5, 0, -3],
  [0, 0, -4],
  [1.5, 0, -3],
  [3, 0, -2],
];

function Columns() {
  return (
    <group>
      {COLUMN_POSITIONS.map((pos, i) => (
        <mesh castShadow key={i} position={pos} receiveShadow>
          <cylinderGeometry args={[0.15, 0.18, 4, 16]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>
      ))}
      <mesh
        position={[0, -2, -3]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function VolumetricPostProcess() {
  const { gl, camera, scene, size } = useThree();
  const quadRef = useRef<THREE.Mesh>(null);
  const depthTarget = useRef<THREE.WebGLRenderTarget | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    // Render at quarter resolution for significant performance boost
    const div = 4;
    const lowW = Math.max(1, Math.floor(size.width / div));
    const lowH = Math.max(1, Math.floor(size.height / div));
    depthTarget.current = new THREE.WebGLRenderTarget(lowW, lowH, {
      depthTexture: new THREE.DepthTexture(lowW, lowH, THREE.FloatType),
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    return () => {
      depthTarget.current?.dispose();
    };
  }, [size.width, size.height]);

  const light1Start = useMemo(
    () => ({
      pos: new THREE.Vector3(-4, 5, 2),
      dir: new THREE.Vector3(0.5, -0.7, -0.5).normalize(),
    }),
    []
  );
  const light1End = useMemo(
    () => ({
      pos: new THREE.Vector3(-2, 4, 1),
      dir: new THREE.Vector3(0.2, -0.6, -0.8).normalize(),
    }),
    []
  );

  const light2Start = useMemo(
    () => ({
      pos: new THREE.Vector3(4, 5, 2),
      dir: new THREE.Vector3(-0.6, -0.6, -0.5).normalize(),
    }),
    []
  );
  const light2End = useMemo(
    () => ({
      pos: new THREE.Vector3(2, 4, 1),
      dir: new THREE.Vector3(-0.2, -0.6, -0.8).normalize(),
    }),
    []
  );

  const light3Start = useMemo(
    () => ({
      pos: new THREE.Vector3(0, 6, 3),
      dir: new THREE.Vector3(0.3, -0.8, -0.5).normalize(),
    }),
    []
  );
  const light3End = useMemo(
    () => ({
      pos: new THREE.Vector3(0, 5, 1),
      dir: new THREE.Vector3(0, -0.5, -0.9).normalize(),
    }),
    []
  );

  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: null as THREE.Texture | null },
      tDepth: { value: null as THREE.Texture | null },
      cameraNear: { value: 0.1 },
      cameraFar: { value: 50 },
      projectionMatrixInverse: { value: new THREE.Matrix4() },
      viewMatrixInverse: { value: new THREE.Matrix4() },
      cameraPos: { value: new THREE.Vector3() },
      light1Position: { value: new THREE.Vector3() },
      light1Direction: { value: new THREE.Vector3() },
      light1Color: { value: new THREE.Color(0.9, 0.7, 0.4) },
      light1ConeAngle: { value: 25 },
      light2Position: { value: new THREE.Vector3() },
      light2Direction: { value: new THREE.Vector3() },
      light2Color: { value: new THREE.Color(0.4, 0.6, 0.9) },
      light2ConeAngle: { value: 25 },
      light3Position: { value: new THREE.Vector3() },
      light3Direction: { value: new THREE.Vector3() },
      light3Color: { value: new THREE.Color(0.6, 0.4, 0.8) },
      light3ConeAngle: { value: 20 },
      scrollProgress: { value: 0 },
      time: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!(materialRef.current && depthTarget.current && quadRef.current)) {
      return;
    }

    const mat = materialRef.current;
    const t = useAnnouncingStore.getState().processProgress;

    mat.uniforms.time.value = clock.elapsedTime;
    mat.uniforms.scrollProgress.value = t;
    mat.uniforms.projectionMatrixInverse.value.copy(
      camera.projectionMatrixInverse
    );
    mat.uniforms.viewMatrixInverse.value.copy(camera.matrixWorld);
    mat.uniforms.cameraPos.value.copy(camera.position);

    const eased = t * t * (3 - 2 * t);

    _v3A.lerpVectors(light1Start.pos, light1End.pos, eased);
    mat.uniforms.light1Position.value.copy(_v3A);
    _v3B.lerpVectors(light1Start.dir, light1End.dir, eased).normalize();
    mat.uniforms.light1Direction.value.copy(_v3B);

    _v3A.lerpVectors(light2Start.pos, light2End.pos, eased);
    mat.uniforms.light2Position.value.copy(_v3A);
    _v3B.lerpVectors(light2Start.dir, light2End.dir, eased).normalize();
    mat.uniforms.light2Direction.value.copy(_v3B);

    _v3A.lerpVectors(light3Start.pos, light3End.pos, eased);
    mat.uniforms.light3Position.value.copy(_v3A);
    _v3B.lerpVectors(light3Start.dir, light3End.dir, eased).normalize();
    mat.uniforms.light3Direction.value.copy(_v3B);

    quadRef.current.visible = false;

    const currentRT = gl.getRenderTarget();
    gl.setRenderTarget(depthTarget.current);
    gl.clear(true, true, true);
    gl.render(scene, camera);

    mat.uniforms.tDiffuse.value = depthTarget.current.texture;
    mat.uniforms.tDepth.value = depthTarget.current.depthTexture;

    gl.setRenderTarget(currentRT);
    quadRef.current.visible = true;
  });

  return (
    <mesh ref={quadRef} renderOrder={999}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        depthTest={false}
        depthWrite={false}
        fragmentShader={volumetricLightFragmentShader}
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={volumetricLightVertex}
      />
    </mesh>
  );
}

export function VolumetricLightScene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <Columns />
      <VolumetricPostProcess />
    </>
  );
}
