import * as THREE from "three";

const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

export function loadTexture(
  src: string,
  onLoad?: (texture: THREE.Texture) => void
): THREE.Texture {
  const cached = cache.get(src);
  if (cached) {
    if (onLoad && cached.image) {
      onLoad(cached);
    }
    return cached;
  }

  const texture = loader.load(src, (t) => {
    onLoad?.(t);
  });

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  cache.set(src, texture);
  return texture;
}

export function disposeAllTextures(): void {
  for (const texture of cache.values()) {
    texture.dispose();
  }
  cache.clear();
}
