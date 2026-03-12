import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  type Complex,
  mobiusTransform,
  poincareToScreen,
} from "./HyperbolicMath";

const TILE_BASE_SIZE = 100;

interface HyperbolicTileProps {
  children?: React.ReactNode;
  className?: string;
  isDragging?: boolean;
  label?: string;
  logicalPosition: Complex;
  viewCenter: Complex;
  viewportRadius: number;
}

export function HyperbolicTile({
  logicalPosition,
  viewCenter,
  viewportRadius,
  children,
  className,
  isDragging,
  label,
}: HyperbolicTileProps) {
  const visualPositionComplex = useMemo(() => {
    return mobiusTransform(logicalPosition, viewCenter);
  }, [logicalPosition, viewCenter]);

  const { x: unitX, y: unitY } = poincareToScreen(visualPositionComplex);

  // Conformal scaling approximation: scale ~ 1 - |w|^2
  const rSquared = unitX * unitX + unitY * unitY;
  const scale = Math.max(0, 1 - rSquared);

  if (scale < 0.05) {
    return null;
  }

  const pixelX = unitX * viewportRadius;
  const pixelY = unitY * viewportRadius;

  return (
    <div
      className={cn(
        "absolute flex select-none items-center justify-center rounded-xl",
        "font-bold text-white",
        !isDragging && "transition-[opacity,filter] duration-300 ease-out",
        className
      )}
      style={{
        width: `${TILE_BASE_SIZE}px`,
        height: `${TILE_BASE_SIZE}px`,
        transform: `translate3d(${pixelX.toFixed(4)}px, ${pixelY.toFixed(4)}px, 0px) scale(${scale.toFixed(6)})`,
        marginLeft: `-${TILE_BASE_SIZE / 2}px`,
        marginTop: `-${TILE_BASE_SIZE / 2}px`,
        left: "50%",
        top: "50%",
        zIndex: Math.floor(scale * 100),
      }}
    >
      <div className="overflow-hidden p-2 text-center text-xs">
        {children || "Tile"}
      </div>
    </div>
  );
}

export const HyperbolicTileMemo = React.memo(HyperbolicTile);
