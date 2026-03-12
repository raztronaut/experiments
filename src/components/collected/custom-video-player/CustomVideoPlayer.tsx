"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";

export interface VideoTimestamp {
  label: string;
}

export interface VideoFrame {
  image: string;
}

export interface CustomVideoPlayerProps {
  autoPlay?: boolean;
  className?: string;
  frames?: VideoFrame[];
  loop?: boolean;
  muted?: boolean;
  src?: string;
  timestamps?: VideoTimestamp[];
}

const DEFAULT_TIMESTAMPS: VideoTimestamp[] = [
  { label: "00:00" },
  { label: "00:05" },
  { label: "00:10" },
  { label: "00:15" },
  { label: "00:20" },
  { label: "00:25" },
  { label: "00:30" },
  { label: "00:35" },
  { label: "00:40" },
  { label: "00:45" },
  { label: "00:50" },
  { label: "00:55" },
  { label: "01:00" },
];

const DEMO_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export function CustomVideoPlayer({
  src = DEMO_VIDEO,
  timestamps = DEFAULT_TIMESTAMPS,
  frames = [],
  autoPlay = true,
  muted = true,
  loop = true,
  className,
}: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    const marker = markerRef.current;
    if (!(video && marker)) {
      return;
    }
    const pct = (video.currentTime / video.duration) * 100;
    marker.style.left = `calc(${pct}% - 1px)`;
  }, []);

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const video = videoRef.current;
      const marker = markerRef.current;
      if (!(video && marker)) {
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      video.currentTime = pct * video.duration;
      marker.style.left = `calc(${pct * 100}% - 1px)`;
    },
    []
  );

  const handleOverlayClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      if (cursorRef.current) {
        cursorRef.current.style.display = "none";
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const cursor = cursorRef.current;
      if (cursor) {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={`cvp-overlay ${className ?? ""}`.trim()} ref={containerRef}>
      <div className="cvp-video-container">
        <video
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          onTimeUpdate={handleTimeUpdate}
          playsInline
          ref={videoRef}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>

      <div className="cvp-cursor" ref={cursorRef}>
        <p>{isPlaying ? "Pause" : "Play"}</p>
      </div>

      <div
        aria-label="Video timeline"
        className="cvp-timeline"
        onClick={handleTimelineClick}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleOverlayClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="cvp-marker" ref={markerRef} />
        <div className="cvp-timestamps">
          {timestamps.map((ts, i) => (
            <p key={i}>{ts.label}</p>
          ))}
        </div>
        {frames.length > 0 && (
          <div className="cvp-frames">
            {frames.map((frame, i) => (
              <div className="cvp-frame" key={i}>
                <img alt="" src={frame.image} />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        aria-label={isPlaying ? "Pause video" : "Play video"}
        className="cvp-click-area"
        onClick={handleOverlayClick}
        type="button"
      />
    </div>
  );
}

export default CustomVideoPlayer;
