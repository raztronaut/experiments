"use client";

import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import { Canvas, type CanvasProps, useThree } from "@react-three/fiber";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  Suspense,
  useEffect,
} from "react";
import Tempus from "tempus";

interface ExperimentCanvasProps extends CanvasProps {
  /** Include AdaptiveDpr + AdaptiveEvents for automatic performance scaling. */
  adaptive?: boolean;
  children: ReactNode;
  /** React node to render when WebGL fails. Enables the built-in error boundary. */
  errorFallback?: ReactNode;
  /** Bind R3F render loop to Tempus at priority 1. Sets frameloop="never" automatically. */
  tempus?: boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ExperimentCanvas] WebGL error:", error, info);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function TempusFrameDriver() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    const dispose = Tempus.add(
      () => {
        gl.render(scene, camera);
      },
      { priority: 1 }
    );
    return dispose;
  }, [gl, scene, camera]);

  return null;
}

export function ExperimentCanvas({
  children,
  tempus: useTempus,
  adaptive,
  errorFallback,
  ...props
}: ExperimentCanvasProps) {
  const canvas = (
    <Canvas
      dpr={[1, 2]}
      {...(useTempus ? { frameloop: "never" as const } : {})}
      {...props}
    >
      <Suspense fallback={null}>
        {useTempus && <TempusFrameDriver />}
        {adaptive && (
          <>
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
          </>
        )}
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  );

  if (errorFallback !== undefined) {
    return (
      <CanvasErrorBoundary fallback={errorFallback}>
        {canvas}
      </CanvasErrorBoundary>
    );
  }

  return canvas;
}
