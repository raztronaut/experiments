"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type {
  BufferGeometry,
  Camera,
  Light,
  Material,
  Mesh,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
} from "three";

const INSPECT_INTERVAL_MS = 10_000;

function getGeometryDesc(geometry: BufferGeometry): string {
  const params = (geometry as any).parameters;
  if (!params) {
    return geometry.type;
  }

  if (geometry.type === "BoxGeometry") {
    return `BoxGeometry ${params.width}x${params.height}x${params.depth}`;
  }
  if (geometry.type === "PlaneGeometry") {
    return `PlaneGeometry ${params.width}x${params.height}`;
  }
  if (geometry.type === "SphereGeometry") {
    return `SphereGeometry r=${params.radius}`;
  }
  return geometry.type;
}

function getMaterialDesc(material: Material | Material[]): string {
  const mat = Array.isArray(material) ? material[0] : material;
  if (!mat) {
    return "none";
  }
  const color = (mat as any).color;
  const colorStr = color ? ` color:#${color.getHexString()}` : "";
  return `${mat.type}${colorStr}`;
}

function getLightDesc(light: Light): string {
  const intensity = (light as any).intensity;
  const pos = light.position;
  let desc = light.type;
  if (intensity !== undefined) {
    desc += ` (intensity: ${intensity})`;
  }
  if (pos && (pos.x || pos.y || pos.z)) {
    desc += ` (position: [${pos.x}, ${pos.y}, ${pos.z}])`;
  }
  return desc;
}

function getCameraDesc(camera: Camera): string {
  const pos = camera.position;
  let desc = camera.type;
  if ((camera as PerspectiveCamera).fov !== undefined) {
    desc += ` (fov:${(camera as PerspectiveCamera).fov}`;
  } else if ((camera as OrthographicCamera).zoom !== undefined) {
    desc += ` (zoom:${(camera as OrthographicCamera).zoom}`;
  }
  desc += `, position:[${Math.round(pos.x * 10) / 10},${Math.round(pos.y * 10) / 10},${Math.round(pos.z * 10) / 10}])`;
  return desc;
}

function serializeNode(
  obj: Object3D,
  prefix: string,
  isLast: boolean
): string[] {
  const lines: string[] = [];
  const connector = isLast ? "└── " : "├── ";
  const childPrefix = prefix + (isLast ? "    " : "│   ");

  let label = obj.type;
  if (obj.name) {
    label += ` "${obj.name}"`;
  }

  if ((obj as any).isLight) {
    label = getLightDesc(obj as Light);
  } else if ((obj as Mesh).isMesh) {
    const mesh = obj as Mesh;
    const geoDesc = mesh.geometry ? getGeometryDesc(mesh.geometry) : "";
    const matDesc = mesh.material ? getMaterialDesc(mesh.material) : "";
    label += geoDesc
      ? ` (${geoDesc}, ${matDesc})`
      : matDesc
        ? ` (${matDesc})`
        : "";
  }

  if (obj.children.length > 0) {
    label += ` (${obj.children.length} children)`;
  }

  lines.push(`${prefix}${connector}${label}`);

  obj.children.forEach((child, i) => {
    lines.push(
      ...serializeNode(child, childPrefix, i === obj.children.length - 1)
    );
  });

  return lines;
}

function countStats(obj: Object3D): {
  meshes: number;
  geometries: Set<string>;
  materials: Set<string>;
  triangles: number;
} {
  const stats = {
    meshes: 0,
    geometries: new Set<string>(),
    materials: new Set<string>(),
    triangles: 0,
  };

  obj.traverse((child) => {
    if ((child as Mesh).isMesh) {
      stats.meshes++;
      const mesh = child as Mesh;
      if (mesh.geometry) {
        stats.geometries.add(mesh.geometry.uuid);
        const index = mesh.geometry.index;
        if (index) {
          stats.triangles += index.count / 3;
        } else {
          const pos = mesh.geometry.getAttribute("position");
          if (pos) {
            stats.triangles += pos.count / 3;
          }
        }
      }
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      mats.forEach((m) => {
        if (m) {
          stats.materials.add(m.uuid);
        }
      });
    }
  });

  return stats;
}

/**
 * Serializes the R3F scene graph to a text tree and logs it to the console.
 * Must be placed inside a <Canvas> component.
 * Logs on mount and every 10 seconds thereafter.
 */
export function R3FSceneInspector() {
  const { scene, camera } = useThree();
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    function inspect() {
      const lines: string[] = [];
      lines.push(`[SceneInspector] Scene (${scene.children.length} children)`);

      scene.children.forEach((child, i) => {
        lines.push(
          ...serializeNode(child, "  ", i === scene.children.length - 1)
        );
      });

      lines.push(`Camera: ${getCameraDesc(camera)}`);

      const stats = countStats(scene);
      lines.push(
        `Stats: ${stats.meshes} meshes, ${stats.geometries.size} geometries, ` +
          `${stats.materials.size} materials, ${Math.round(stats.triangles)} triangles`
      );

      const sceneText = lines.join("\n");
      console.warn(sceneText);

      if (window.__experimentMetrics) {
        window.__experimentMetrics.scene = sceneText;
        window.__experimentMetrics.timestamp = Date.now();
      }
    }

    inspect();
    timerRef.current = setInterval(inspect, INSPECT_INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [scene, camera]);

  return null;
}
