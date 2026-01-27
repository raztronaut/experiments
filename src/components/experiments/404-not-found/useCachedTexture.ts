import React, { useEffect } from 'react';
import * as THREE from 'three';

// Global cache for texture sharing across instances
// Map key -> { texture, refCount }
const textureCache = new Map<string, { texture: THREE.CanvasTexture; refCount: number }>();

type TextureGenerator = () => THREE.CanvasTexture | null;

export function useCachedTexture(
    key: string,
    generator: TextureGenerator,
    dependencies: unknown[]
): THREE.CanvasTexture | null {
    // 1. Synchronously get or create texture
    const texture = React.useMemo(() => {
        if (!key) return null;

        let cachedItem = textureCache.get(key);

        if (cachedItem) {
            // Found in cache
            return cachedItem.texture;
        } else {
            // Not in cache, generate immediately
            const newTexture = generator();
            if (newTexture) {
                textureCache.set(key, { texture: newTexture, refCount: 0 }); // refCount init at 0, will increment in effect
                return newTexture;
            }
            return null;
        }
        // We do NOT include dependencies here because the 'key' should already include all dependencies encoded in the string.
        // If we included dependencies, useMemo might re-run even if key is same, which is not what we want for a global cache.
        // The generator is called only when key changes or cache misses.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // 2. Manage ref counting and memory disposal via effect
    useEffect(() => {
        if (!key || !texture) return;

        const item = textureCache.get(key);
        if (item) {
            item.refCount++;
        }

        return () => {
            const currentItem = textureCache.get(key);
            if (currentItem) {
                currentItem.refCount--;
                if (currentItem.refCount <= 0) {
                    currentItem.texture.dispose();
                    textureCache.delete(key);
                }
            }
        };
    }, [key, texture]);

    return texture;
}
