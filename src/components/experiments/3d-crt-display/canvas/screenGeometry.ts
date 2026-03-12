import * as THREE from "three";

export const SCREEN_W = 0.28;
export const SCREEN_H = 0.235;
export const SCREEN_CORNER_R = 0.03;
export const SCREEN_ASPECT = SCREEN_W / SCREEN_H;

/**
 * Rounded-rectangle ShapeGeometry with manually computed UVs.
 * Matches the CRT screen bezel shape and maps textures edge-to-edge.
 */
export function createScreenGeometry(
  w: number,
  h: number,
  r: number
): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geometry = new THREE.ShapeGeometry(shape);
  const positions = geometry.attributes.position;
  const uvs = new Float32Array(positions.count * 2);

  for (let i = 0; i < positions.count; i++) {
    uvs[i * 2] = (positions.getX(i) - x) / w;
    uvs[i * 2 + 1] = (positions.getY(i) - y) / h;
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return geometry;
}
