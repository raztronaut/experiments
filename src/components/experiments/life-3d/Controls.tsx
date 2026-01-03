import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onStep: () => void;
    onReset: () => void;
    generation: number;
    speed: number;
    onSpeedChange: (speed: number) => void;
    currentPreset: string;
    onPresetChange: (preset: string) => void;
    presets: Record<string, { label: string }>;
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
    presets
}: ControlsProps) {
    return (
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 md:gap-6 z-50 w-full max-w-3xl px-4 md:px-6">
            {/* Preset Selector HUD */}
            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                {Object.entries(presets).map(([id, preset]) => (
                    <button
                        key={id}
                        onClick={() => onPresetChange(id)}
                        className={cn(
                            "px-3 py-2 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-300",
                            currentPreset === id
                                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                : "text-white/30 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Main Control Hub */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-black/40 backdrop-blur-2xl px-6 py-4 md:px-10 md:py-5 rounded-3xl md:rounded-[2.5rem] border border-white/5 shadow-2xl ring-1 ring-white/10 w-full md:w-auto">
                {/* Stats & Actions Container for Mobile */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8">
                    {/* Stats Section */}
                    <div className="flex flex-col items-start md:pr-8 md:border-r border-white/10">
                        <span className="text-[8px] md:text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-0.5 md:mb-1">Iteration</span>
                        <span className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter">
                            {generation.toLocaleString().padStart(4, '0')}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 md:gap-5">
                        <button
                            onClick={onReset}
                            className="p-2 md:p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all group"
                            title="Re-seed Simulation"
                        >
                            <RotateCcw className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-500" />
                        </button>

                        <button
                            onClick={onTogglePlay}
                            className={cn(
                                "p-4 md:p-6 rounded-full transition-all duration-500 shadow-2xl relative group",
                                isPlaying
                                    ? "bg-white text-black scale-105"
                                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20"
                            )}
                        >
                            {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 fill-current translate-x-0.5" />}
                        </button>

                        <button
                            onClick={onStep}
                            disabled={isPlaying}
                            className="p-2 md:p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-20 transition-all"
                            title="Step Forward"
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>
                </div>

                {/* Playback Settings */}
                <div className="flex flex-col items-start md:pl-8 md:border-l border-white/10 w-full md:min-w-[140px]">
                    <div className="flex justify-between w-full mb-1.5 md:mb-2 text-[8px] md:text-[10px]">
                        <span className="font-mono text-white/30 uppercase tracking-[0.2em]">Interval</span>
                        <span className="font-mono text-blue-400 font-bold">{speed}ms</span>
                    </div>
                    <input
                        type="range"
                        min="20"
                        max="1000"
                        step="20"
                        value={speed}
                        onChange={(e) => onSpeedChange(parseInt(e.target.value))}
                        className="w-full h-1.5 md:h-2 accent-blue-500 cursor-pointer opacity-80 hover:opacity-100 transition-opacity bg-white/10 rounded-lg appearance-none"
                    />
                </div>
            </div>
        </div>
    );
}
