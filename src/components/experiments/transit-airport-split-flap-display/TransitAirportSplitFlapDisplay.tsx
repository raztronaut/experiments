"use client";

import { Clock, Info, MapPin, Train, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";
import { SplitFlapRow } from "./SplitFlapRow";
import { useFlapSound } from "./useFlapSound";
import { useTransitData } from "./useTransitData";

interface AgencyConfig {
  brandColor: string;
  description: string;
  logo: React.ReactNode;
  name: string;
  systemCode: string;
}

const CONFIGS: Record<string, AgencyConfig> = {
  caltrain: {
    name: "Caltrain",
    description: "Departure Information",
    logo: <Train className="h-8 w-8 text-black md:h-10 md:w-10" />,
    brandColor: "bg-yellow-400",
    systemCode: "SF-BAY-CORE",
  },
  ttc: {
    name: "TTC Toronto",
    description: "Subway & Streetcar Feed",
    logo: <Train className="h-8 w-8 text-white md:h-10 md:w-10" />,
    brandColor: "bg-red-600",
    systemCode: "ON-GTA-CORE",
  },
};

export default function TransitAirportSplitFlapDisplay() {
  const [selectedAgency, setSelectedAgency] = React.useState("caltrain");
  const [isMuted, setIsMuted] = React.useState(false);
  const [showAudioInfo, setShowAudioInfo] = React.useState(false);
  const config = CONFIGS[selectedAgency] || CONFIGS.caltrain;
  const { data, loading } = useTransitData(selectedAgency);
  const { playClick, setMuted } = useFlapSound();

  React.useEffect(() => {
    setMuted(isMuted);
  }, [isMuted, setMuted]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-start bg-[#050505] p-4 pt-24 font-mono md:p-12"
      style={
        {
          // Fluid scaling variables - tightened for absolute zero overflow
          "--flap-w": "clamp(14px, 1.8vw, 26px)",
          "--flap-h": "calc(var(--flap-w) * 1.57)",
          "--flap-font": "calc(var(--flap-w) * 0.85)",
          "--flap-gap": "calc(var(--flap-w) * 0.08)",
          // Calculated column widths for precise header alignment
          "--col-train": "calc(3 * var(--flap-w) + 2 * var(--flap-gap))",
          "--col-dest": "calc(16 * var(--flap-w) + 15 * var(--flap-gap))",
          "--col-time": "calc(5 * var(--flap-w) + 4 * var(--flap-gap))",
          "--col-plat": "calc(2 * var(--flap-w) + 1 * var(--flap-gap))",
          "--col-status": "calc(10 * var(--flap-w) + 9 * var(--flap-gap))",
        } as React.CSSProperties
      }
    >
      {/* Control Bar */}
      <div className="mb-8 flex w-full max-w-6xl flex-wrap items-center justify-center gap-4 md:gap-6">
        <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 md:gap-4">
          <button
            className={cn(
              "rounded-full px-4 py-2 font-bold text-[9px] uppercase tracking-widest transition-all md:px-6 md:text-[10px]",
              selectedAgency === "caltrain"
                ? "bg-yellow-400 text-black shadow-lg"
                : "text-white/40 hover:text-white"
            )}
            onClick={() => setSelectedAgency("caltrain")}
          >
            Caltrain
          </button>
          <button
            className={cn(
              "rounded-full px-4 py-2 font-bold text-[9px] uppercase tracking-widest transition-all md:px-6 md:text-[10px]",
              selectedAgency === "ttc"
                ? "bg-red-600 text-white shadow-lg"
                : "text-white/40 hover:text-white"
            )}
            onClick={() => setSelectedAgency("ttc")}
          >
            TTC Toronto
          </button>
        </div>

        <div className="group relative flex items-center gap-2">
          <button
            className={cn(
              "rounded-full border p-3 transition-all",
              isMuted
                ? "border-white/10 bg-white/5 text-white/30 hover:text-white/60"
                : "border-white/20 bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            )}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <button
            className="flex translate-y-[2px] items-center justify-center p-2 text-white/30 transition-colors hover:text-white/60"
            onMouseEnter={() => setShowAudioInfo(true)}
            onMouseLeave={() => setShowAudioInfo(false)}
          >
            <Info className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {showAudioInfo && (
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="pointer-events-none absolute top-full right-0 z-50 mt-4 w-64 rounded-xl border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-xl md:left-0"
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
              >
                <div className="mb-2 font-bold font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">
                  Audio Engine
                </div>
                <p className="font-mono text-[11px] text-white/80 leading-relaxed">
                  Procedural mechanical &quot;clacks&quot; synthesized in
                  real-time using Web Audio.
                  <br />
                  <br />
                  Uses three layers:
                  <br />• <span className="text-yellow-400">Snap</span>:
                  High-freq transient
                  <br />• <span className="text-blue-400">Thud</span>: Low-freq
                  mass
                  <br />• <span className="text-green-400">Ring</span>: Metallic
                  resonance
                  <br />
                  <br />
                  Each click is uniquely randomized for a tactile, natural feel.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full max-w-7xl overflow-x-hidden rounded-2xl border border-white/5 bg-[#111] px-4 py-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] md:px-4 md:py-12 lg:px-10">
        {/* Header Section */}
        <div className="mb-16 flex flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center">
          <div className="flex items-center gap-6">
            <div
              className={cn(
                config.brandColor,
                "rounded-lg p-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors duration-500 md:p-3"
              )}
            >
              {config.logo}
            </div>
            <div>
              <h1 className="font-black text-2xl text-white uppercase italic leading-none tracking-[0.1em] md:text-5xl">
                {config.name}
              </h1>
              <p
                className={cn(
                  "mt-2 font-bold text-[10px] uppercase tracking-[0.4em] opacity-90 transition-colors duration-500 md:text-xs",
                  selectedAgency === "caltrain"
                    ? "text-yellow-400"
                    : "text-red-500"
                )}
              >
                {config.description}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col items-start border-l-2 pl-4 transition-colors duration-500 md:items-end md:border-r-2 md:border-l-0 md:pr-4 md:pl-0",
              selectedAgency === "caltrain"
                ? "border-yellow-400"
                : "border-red-600"
            )}
          >
            <div className="font-bold text-2xl text-white tracking-wider md:text-3xl">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="mt-1 font-black text-[10px] text-white/40 uppercase tracking-[0.3em]">
              Local Time
            </div>
          </div>
        </div>

        {/* Board Headers */}
        <div className="mb-6 hidden gap-3 px-4 md:grid md:grid-cols-[var(--col-train)_var(--col-dest)_var(--col-time)_var(--col-plat)_var(--col-status)] lg:gap-6">
          <span className="font-black text-[10px] text-white/40 uppercase tracking-[0.2em]">
            Train
          </span>
          <span className="font-black text-[10px] text-white/40 uppercase tracking-[0.2em]">
            Destination
          </span>
          <span className="font-black text-[10px] text-white/40 uppercase tracking-[0.2em]">
            Time
          </span>
          <span className="font-black text-[10px] text-white/40 uppercase tracking-[0.2em]">
            Plat
          </span>
          <span className="font-black text-[10px] text-white/40 uppercase tracking-[0.2em]">
            Status
          </span>
        </div>

        {/* Mobile Header (Simplified) */}
        <div className="mb-4 flex justify-between px-4 font-black text-[9px] text-white/20 uppercase tracking-[0.2em] md:hidden">
          <span>Transit Info</span>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-3 md:gap-4">
          {loading ? (
            <div
              className={cn(
                "animate-pulse py-20 text-center font-bold text-xs uppercase tracking-[0.5em] md:text-base",
                selectedAgency === "caltrain"
                  ? "text-yellow-400"
                  : "text-red-500"
              )}
            >
              Connecting to Transit Feed...
            </div>
          ) : (
            data.map((trip) => (
              <div
                className="group flex flex-col items-start gap-3 rounded-lg border border-white/[0.02] bg-white/[0.015] px-4 py-3 shadow-sm transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] md:grid md:grid-cols-[var(--col-train)_var(--col-dest)_var(--col-time)_var(--col-plat)_var(--col-status)] md:items-center md:gap-3 md:overflow-visible md:py-4 lg:gap-6"
                key={trip.id}
              >
                {/* Row 1: Train + Destination */}
                <div className="flex w-full items-center gap-4 md:contents">
                  <div className="flex-shrink-0">
                    <SplitFlapRow
                      interactive={true}
                      length={3}
                      onFlip={playClick}
                      text={trip.trainNumber}
                    />
                  </div>
                  <div className="min-w-0 flex-grow md:contents">
                    <SplitFlapRow
                      className="md:hidden"
                      interactive={true}
                      length={14}
                      onFlip={playClick}
                      text={trip.destination}
                    />
                    <SplitFlapRow
                      className="hidden md:flex"
                      interactive={true}
                      length={16}
                      onFlip={playClick}
                      text={trip.destination}
                    />
                  </div>
                </div>

                {/* Row 2 (Mobile only): Status + Time & Platform */}
                <div className="mt-1 flex w-full flex-col gap-4 rounded-b-lg border-white/5 border-t py-4 md:hidden">
                  <div className="flex justify-start">
                    <SplitFlapRow
                      className={cn(
                        "transition-colors duration-700",
                        trip.status === "DELAYED"
                          ? "text-red-500"
                          : trip.status === "BOARDING"
                            ? "text-green-500"
                            : trip.status === "DEPARTED"
                              ? "text-white/10"
                              : ""
                      )}
                      interactive={true}
                      length={10}
                      onFlip={playClick}
                      text={trip.status}
                    />
                  </div>
                  <div className="flex w-full items-center justify-between text-white/40">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <SplitFlapRow
                        interactive={true}
                        length={5}
                        onFlip={playClick}
                        text={trip.arrivalTime}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span className="mr-1 font-black text-[10px] uppercase tracking-tight">
                        Plat
                      </span>
                      <SplitFlapRow
                        interactive={true}
                        length={2}
                        onFlip={playClick}
                        text={trip.gate}
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop only cells */}
                <SplitFlapRow
                  className="hidden md:flex"
                  interactive={true}
                  length={5}
                  onFlip={playClick}
                  text={trip.arrivalTime}
                />
                <SplitFlapRow
                  className="hidden md:flex"
                  interactive={true}
                  length={2}
                  onFlip={playClick}
                  text={trip.gate}
                />
                <div className="hidden justify-start md:flex">
                  <SplitFlapRow
                    className={cn(
                      "transition-colors duration-700",
                      trip.status === "DELAYED"
                        ? "text-red-500"
                        : trip.status === "BOARDING"
                          ? "text-green-500"
                          : trip.status === "DEPARTED"
                            ? "text-white/10"
                            : ""
                    )}
                    interactive={true}
                    length={10}
                    onFlip={playClick}
                    text={trip.status}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-white/5 border-t pt-8 font-bold text-[9px] text-white/20 uppercase tracking-[0.3em] md:flex-row md:text-[10px]">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            <span className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />{" "}
              Network Status: Online
            </span>
            <span className="flex items-center gap-3">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  selectedAgency === "caltrain"
                    ? "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                    : "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                )}
              />
              Data Feed: Active
            </span>
          </div>
          <div className="tracking-[0.5em] opacity-50">
            System V26.4.2 // {config.systemCode}
          </div>
        </div>
      </div>

      <style>{`
                .perspective-1000 {
                  perspective: 1000px;
                }
                .backface-hidden {
                  backface-visibility: hidden;
                }
            `}</style>
    </div>
  );
}
