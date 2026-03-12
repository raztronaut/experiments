import * as THREE from "three";

let loader: THREE.TextureLoader | null = null;
const cache = new Map<string, THREE.Texture>();

function getLoader() {
  if (!loader) {
    loader = new THREE.TextureLoader();
  }
  return loader;
}

export function loadTexture(
  src: string,
  onLoaded?: (t: THREE.Texture) => void
) {
  const cached = cache.get(src);
  if (cached) {
    onLoaded?.(cached);
    return cached;
  }

  if (src.endsWith(".mp4")) {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.src = src;
    video.play().catch(() => {});

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    cache.set(src, tex);
    video.addEventListener("loadedmetadata", () => {
      onLoaded?.(tex);
    });
    return tex;
  }

  const tex = getLoader().load(src, (t) => onLoaded?.(t));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  cache.set(src, tex);
  return tex;
}

export function pauseAllVideos() {
  for (const tex of cache.values()) {
    if (tex instanceof THREE.VideoTexture) {
      const video = tex.image as HTMLVideoElement;
      if (video && !video.paused) {
        video.pause();
      }
    }
  }
}

export function disposeAllTextures() {
  for (const tex of cache.values()) {
    if (tex instanceof THREE.VideoTexture) {
      const video = tex.image as HTMLVideoElement;
      video.pause();
      video.src = "";
    }
    tex.dispose();
  }
  cache.clear();
  loader = null;
}
