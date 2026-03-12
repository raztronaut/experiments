import { useCallback, useEffect, useRef } from "react";
import type {
  Group,
  LineBasicMaterial,
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from "three";
import {
  ASSET_BASE,
  INITIAL_CAMERA_Z,
  LIGHT_CONFIG,
  MODEL_MATERIAL,
} from "../data";

interface View {
  bottom: number;
  camera: PerspectiveCamera | null;
  height: number;
}

export interface AirplaneScene {
  destroy: () => void;
  light: PointLight;
  modelGroup: Group;
  render: () => void;
  views: View[];
}

// ── Dynamic imports ──

async function loadDeps() {
  const [three, objModule] = await Promise.all([
    import("three"),
    import("three/addons/loaders/OBJLoader.js"),
  ]);
  return { three, OBJLoader: objModule.OBJLoader };
}

// ── Scene construction helpers ──

function createRenderer(
  three: typeof import("three"),
  container: HTMLElement
): WebGLRenderer {
  const renderer = new three.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = three.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.classList.add("airplanes-canvas");
  container.appendChild(renderer.domElement);
  return renderer;
}

function createViewCameras(three: typeof import("three")): View[] {
  const views: View[] = [
    { bottom: 0, height: 1, camera: null },
    { bottom: 0, height: 0, camera: null },
  ];

  for (let i = 0; i < views.length; i++) {
    const camera = new three.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.set(0, 0, INITIAL_CAMERA_Z);
    camera.layers.disableAll();
    camera.layers.enable(i);
    camera.lookAt(new three.Vector3(0, 5, 0));
    views[i].camera = camera;
  }

  return views;
}

function createLighting(
  three: typeof import("three"),
  scene: Scene
): PointLight {
  const light = new three.PointLight(
    LIGHT_CONFIG.point.color,
    LIGHT_CONFIG.point.intensity
  );
  light.position.set(
    LIGHT_CONFIG.point.position.x,
    LIGHT_CONFIG.point.position.y,
    LIGHT_CONFIG.point.position.z
  );
  scene.add(light);

  const ambient = new three.AmbientLight(
    LIGHT_CONFIG.ambient.color,
    LIGHT_CONFIG.ambient.intensity
  );
  scene.add(ambient);

  return light;
}

function createModelGroup(
  three: typeof import("three"),
  model: Object3D
): Group {
  const firstChild = model.children[0] as Mesh | undefined;
  if (!firstChild?.geometry) {
    throw new Error("Model has no valid geometry");
  }

  const edges = new three.EdgesGeometry(firstChild.geometry);
  const line = new three.LineSegments(edges);

  const mat = line.material as LineBasicMaterial;
  mat.depthTest = false;
  mat.opacity = 0.5;
  mat.transparent = true;

  line.position.set(0.5, 0.2, -1);

  const group = new three.Group();
  model.layers.set(0);
  line.layers.set(1);
  group.add(model);
  group.add(line);

  return group;
}

// ── Scene assembly ──

function createScene(
  three: typeof import("three"),
  model: Object3D,
  container: HTMLElement
): AirplaneScene {
  const renderer = createRenderer(three, container);
  const views = createViewCameras(three);
  const scene = new three.Scene();
  const light = createLighting(three, scene);
  const modelGroup = createModelGroup(three, model);
  scene.add(modelGroup);

  let w = window.innerWidth;
  let h = window.innerHeight;

  const render = () => {
    for (const view of views) {
      if (!view.camera) {
        continue;
      }
      const bottom = Math.floor(h * view.bottom);
      const height = Math.floor(h * view.height);
      renderer.setViewport(0, 0, w, h);
      renderer.setScissor(0, bottom, w, height);
      renderer.setScissorTest(true);
      renderer.render(scene, view.camera);
    }
  };

  const onResize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    for (const view of views) {
      if (!view.camera) {
        continue;
      }
      view.camera.aspect = w / h;
      // Adaptive zoom: when the browser is narrower than the physical screen,
      // push the camera back proportionally so the model stays visible.
      const camZ = (screen.width - w) / 3;
      view.camera.position.z =
        camZ < INITIAL_CAMERA_Z ? INITIAL_CAMERA_Z : camZ;
      view.camera.updateProjectionMatrix();
    }
    renderer.setSize(w, h);
    render();
  };

  window.addEventListener("resize", onResize);
  onResize();

  const destroy = () => {
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    renderer.domElement.remove();
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m: Material) => m.dispose());
        } else {
          (mesh.material as Material).dispose();
        }
      }
    });
  };

  return { modelGroup, render, views, light, destroy };
}

// ── Model loading ──

async function loadModel() {
  const { three, OBJLoader } = await loadDeps();

  const model: Object3D = await new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load(
      `${ASSET_BASE}/plane.obj`,
      (obj) => {
        obj.traverse((child) => {
          const mesh = child as Mesh;
          if (mesh.isMesh) {
            mesh.material = new three.MeshPhongMaterial({
              color: MODEL_MATERIAL.color,
              specular: MODEL_MATERIAL.specular,
              shininess: MODEL_MATERIAL.shininess,
              flatShading: true,
            });
          }
        });
        resolve(obj);
      },
      undefined,
      reject
    );
  });

  return { three, model };
}

// ── Hook ──

export function useAirplaneScene() {
  const sceneRef = useRef<AirplaneScene | null>(null);
  const readyRef = useRef(false);

  const init = useCallback(
    async (container: HTMLElement): Promise<AirplaneScene | null> => {
      if (readyRef.current) {
        return sceneRef.current;
      }
      const { three, model } = await loadModel();
      const airplaneScene = createScene(three, model, container);
      sceneRef.current = airplaneScene;
      readyRef.current = true;
      return airplaneScene;
    },
    []
  );

  useEffect(() => {
    return () => {
      sceneRef.current?.destroy();
      sceneRef.current = null;
      readyRef.current = false;
    };
  }, []);

  return { init };
}
