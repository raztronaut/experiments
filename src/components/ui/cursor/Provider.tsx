"use client";

import type React from "react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CursorContext, type CursorType } from "./Context";
import { Cursor } from "./Cursor";

export const CursorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Mouse position is now tracked by subscribers (Cursor, WithHover) directly
  // to avoid re-rendering the entire app on every frame.

  const [selectedElement, setSelectedElementState] = useState<{
    el: HTMLElement | null;
    type: CursorType;
    config?: Record<string, unknown>;
  }>({ el: null, type: "default" });
  const [status, setStatus] = useState<string>("");
  const [pressing, setPressing] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    checkTouch();

    const handleMouseDown = () => setPressing(true);
    const handleMouseUp = () => setPressing(false);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Sync global cursor style
  useEffect(() => {
    const shouldHideSystemCursor = !(isTouchDevice || isHidden);

    const updateStyles = () => {
      const existingStyle = document.getElementById("cursor-none-style");
      if (existingStyle) {
        existingStyle.remove();
      }

      if (shouldHideSystemCursor) {
        // Strict Attribute Enforcement
        document.documentElement.dataset.cursorHidden = "true";
        document.body.style.cursor = "none";

        const style = document.createElement("style");
        style.id = "cursor-none-style";
        // Use the attribute selector for max specificity without !important everywhere
        // But we add !important anyway to win against inline styles.
        style.innerHTML = `
                    html[data-cursor-hidden="true"], 
                    html[data-cursor-hidden="true"] * { 
                        cursor: none !important; 
                    }
                `;
        document.head.appendChild(style);
      } else {
        delete document.documentElement.dataset.cursorHidden;
        document.body.style.cursor = "";
      }
    };

    // MutationObserver to protect the cursor-none style from being
    // removed by Next.js route changes / script injection.
    // Narrowed scope: only watch for our style element disappearing
    // and our data attribute being removed.
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (!shouldHideSystemCursor) {
        return;
      }
      if (debounceTimer) {
        return;
      }
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        if (document.documentElement.dataset.cursorHidden !== "true") {
          document.documentElement.dataset.cursorHidden = "true";
        }
        if (!document.getElementById("cursor-none-style")) {
          updateStyles();
        }
      }, 50);
    });

    observer.observe(document.head, { childList: true });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-cursor-hidden"],
    });

    // Run immediately
    updateStyles();

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      observer.disconnect();
      delete document.documentElement.dataset.cursorHidden;
      document.body.style.cursor = "";
      const style = document.getElementById("cursor-none-style");
      if (style) {
        style.remove();
      }
    };
  }, [isTouchDevice, isHidden]);

  const setSelectedElement = useCallback(
    (element: {
      el: HTMLElement | null;
      type: CursorType;
      config?: Record<string, unknown>;
    }) => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }

      setSelectedElementState(element);
      setStatus((prev) =>
        prev === "" || prev === "exiting" ? "entering" : "shifting"
      );
    },
    []
  );

  const removeSelectedElement = useCallback(() => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }

    setStatus("exiting");
    exitTimeoutRef.current = setTimeout(() => {
      setSelectedElementState({ el: null, type: "default" });
      setStatus("");
      exitTimeoutRef.current = null;
    }, 150);
  }, []);

  const combinedHidden = isHidden || isTouchDevice;

  return (
    <CursorContext.Provider
      value={{
        selectedElement,
        status,
        pressing,
        isHidden: combinedHidden,
        setSelectedElement,
        removeSelectedElement,
        setStatus,
        setIsHidden,
      }}
    >
      {children}
      {!combinedHidden && <Cursor />}
    </CursorContext.Provider>
  );
};
