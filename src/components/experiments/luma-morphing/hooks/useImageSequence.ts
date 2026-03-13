"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseImageSequenceResult {
  images: HTMLImageElement[];
  loaded: boolean;
  /** 0-1 fraction of images loaded so far */
  loadProgress: number;
}

export function useImageSequence(
  paths: string[],
  debug = false
): UseImageSequenceResult {
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  const logDebug = useCallback(
    (msg: string) => {
      if (debug) {
        console.log(`[luma-morphing] ${msg}`);
      }
    },
    [debug]
  );

  useEffect(() => {
    let cancelled = false;
    const total = paths.length;
    let loadedCount = 0;
    let lastReportedPct = -1;

    const imagePromises = paths.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            loadedCount++;
            const pct = Math.floor((loadedCount / total) * 10) * 10;
            if (!cancelled) {
              setLoadProgress(loadedCount / total);
              if (pct > lastReportedPct) {
                lastReportedPct = pct;
                logDebug(`preload: ${pct}% (${loadedCount}/${total})`);
              }
            }
            resolve(img);
          };
          img.onerror = () => {
            logDebug(`failed to load: ${src}`);
            loadedCount++;
            if (!cancelled) {
              setLoadProgress(loadedCount / total);
            }
            resolve(img);
          };
        })
    );

    Promise.all(imagePromises).then((imgs) => {
      if (cancelled) {
        return;
      }
      imagesRef.current = imgs;
      setLoaded(true);
      logDebug("all images loaded");
    });

    return () => {
      cancelled = true;
    };
  }, [paths, logDebug]);

  return { images: imagesRef.current, loaded, loadProgress };
}
