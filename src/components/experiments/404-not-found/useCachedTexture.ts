import { useState, useEffect } from 'react';
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
    const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

    useEffect(() => {
        if (!key) return;

        // Check if texture exists in cache
        let cachedItem = textureCache.get(key);

        if (cachedItem) {
            // Increment ref count
            cachedItem.refCount++;
            setTexture(cachedItem.texture);
        } else {
            // Generate new texture
            const newTexture = generator();
            if (newTexture) {
                cachedItem = { texture: newTexture, refCount: 1 };
                textureCache.set(key, cachedItem);
                setTexture(newTexture);
            }
        }

        // Cleanup
        return () => {
            const item = textureCache.get(key);
            if (item) {
                item.refCount--;
                if (item.refCount <= 0) {
                    item.texture.dispose();
                    textureCache.delete(key);
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, ...dependencies]);

    return texture;
}
