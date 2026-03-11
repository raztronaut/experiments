import { ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlsProps {
  currentPreset: string;
  generation: number;
  isPlaying: boolean;
  onPresetChange: (preset: string) => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onStep: () => void;
  onTogglePlay: () => void;
  presets: Record<string, { label: string }>;
  speed: number;
}

export function Controls({
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  generation,
  speed,
  onSpeedChange,
  currentPreset,
  onPresetChange,
  presets,
}: ControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 z-50 flex w-full max-w-3xl -translate-x-1/2 flex-col items-center gap-4 px-4 md:bottom-12 md:gap-6 md:px-6">
      {/* Preset Selector HUD */}
      <div className="flex flex-wrap justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl md:gap-2">
        {Object.entries(presets).map(([id, preset]) => (
          <button
            className={cn(
              "rounded-xl px-3 py-2 font-bold text-[8px] uppercase tracking-widest transition-all duration-300 md:px-4 md:py-2 md:text-[10px] md:tracking-[0.2em]",
              currentPreset === id
                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                : "text-white/30 hover:bg-white/5 hover:text-white"
            )}
            key={id}
            onClick={() => onPresetChange(id)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Main Control Hub */}
      <div className="flex w-full flex-col items-center gap-4 rounded-3xl border border-white/5 bg-black/40 px-6 py-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl md:w-auto md:flex-row md:gap-8 md:rounded-[2.5rem] md:px-10 md:py-5">
        {/* Stats & Actions Container for Mobile */}
        <div className="flex w-full items-center justify-between gap-4 md:w-auto md:gap-8">
          {/* Stats Section */}
          <div className="flex flex-col items-start border-white/10 md:border-r md:pr-8">
            <span className="mb-0.5 font-mono text-[8px] text-white/30 uppercase tracking-[0.2em] md:mb-1 md:text-[10px]">
              Iteration
            </span>
            <span className="font-black text-white text-xl tabular-nums tracking-tighter md:text-2xl">
              {generation.toLocaleString().padStart(4, "0")}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              className="group rounded-full p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white md:p-3"
              onClick={onReset}
              title="Re-seed Simulation"
            >
              <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180 md:h-5 md:w-5" />
            </button>

            <button
              className={cn(
                "group relative rounded-full p-4 shadow-2xl transition-all duration-500 md:p-6",
                isPlaying
                  ? "scale-105 bg-white text-black"
                  : "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500"
              )}
              onClick={onTogglePlay}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current md:h-6 md:w-6" />
              ) : (
                <Play className="h-5 w-5 translate-x-0.5 fill-current md:h-6 md:w-6" />
              )}
            </button>

            <button
              className="rounded-full p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-20 md:p-3"
              disabled={isPlaying}
              onClick={onStep}
              title="Step Forward"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>

        {/* Playback Settings */}
        <div className="flex w-full flex-col items-start border-white/10 md:min-w-[140px] md:border-l md:pl-8">
          <div className="mb-1.5 flex w-full justify-between text-[8px] md:mb-2 md:text-[10px]">
            <span className="font-mono text-white/30 uppercase tracking-[0.2em]">
              Interval
            </span>
            <span className="font-bold font-mono text-blue-400">{speed}ms</span>
          </div>
          <input
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500 opacity-80 transition-opacity hover:opacity-100 md:h-2"
            max="1000"
            min="20"
            onChange={(e) => onSpeedChange(Number.parseInt(e.target.value, 10))}
            step="20"
            type="range"
            value={speed}
          />
        </div>
      </div>
    </div>
  );
}
