import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DRAG_SENSITIVITY, KEYBOARD_STEP } from "../data";
import { Complex, mobiusTransform } from "../HyperbolicMath";

export function useHyperbolicNavigation(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const [viewCenter, setViewCenter] = useState<Complex>(new Complex(0, 0));
  const [isDragging, setIsDragging] = useState(false);
  const viewCenterRef = useRef(viewCenter);
  viewCenterRef.current = viewCenter;
  const dragStartRef = useRef<{
    screen: { x: number; y: number };
    view: Complex;
  } | null>(null);

  const getRelCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) {
        return { x: 0, y: 0 };
      }
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = Math.min(rect.width, rect.height) / 2;
      return {
        x: (clientX - centerX) / radius,
        y: (clientY - centerY) / radius,
      };
    },
    [containerRef]
  );

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      const { x, y } = getRelCoords(clientX, clientY);
      dragStartRef.current = { screen: { x, y }, view: viewCenterRef.current };
    },
    [getRelCoords]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!(isDragging && dragStartRef.current)) {
        return;
      }

      const { x, y } = getRelCoords(clientX, clientY);
      const dx = x - dragStartRef.current.screen.x;
      const dy = y - dragStartRef.current.screen.y;
      const shift = new Complex(-dx * DRAG_SENSITIVITY, -dy * DRAG_SENSITIVITY);
      setViewCenter(mobiusTransform(dragStartRef.current.view, shift));
    },
    [isDragging, getRelCoords]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Global mouse listeners while dragging
  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let dx = 0;
      let dy = 0;

      if (e.key === "ArrowLeft") {
        dx = -KEYBOARD_STEP;
      }
      if (e.key === "ArrowRight") {
        dx = KEYBOARD_STEP;
      }
      if (e.key === "ArrowUp") {
        dy = -KEYBOARD_STEP;
      }
      if (e.key === "ArrowDown") {
        dy = KEYBOARD_STEP;
      }

      if (dx === 0 && dy === 0) {
        return;
      }
      e.preventDefault();

      setViewCenter((current) => mobiusTransform(current, new Complex(dx, dy)));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) {
        return;
      }
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  return {
    viewCenter,
    isDragging,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd: handleEnd,
  };
}
