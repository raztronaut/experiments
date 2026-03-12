import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

interface ResponsiveCameraProps {
  /** Base distance when viewport matches `baseWidth`. Camera Z = max(minZ, baseWidth / viewportWidth). */
  baseWidth?: number;
  minZ?: number;
  /** Fixed camera Y position (default 0). */
  y?: number;
}

export function ResponsiveCamera({
  baseWidth = 768,
  minZ = 1,
  y = 0,
}: ResponsiveCameraProps = {}) {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);

  useEffect(() => {
    const z = Math.max(minZ, baseWidth / width);
    camera.position.set(0, y, z);
    camera.lookAt(0, 0, 0);
  }, [camera, width, baseWidth, minZ, y]);

  return null;
}
