"use client";

import React from 'react';
import { useTransitData } from './useTransitData';
import { useFlapSound } from './useFlapSound';
import { SplitFlapRow } from './SplitFlapRow';
import { Train, Clock, MapPin, Volume2, VolumeX, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AgencyConfig {
    name: string;
    description: string;
    logo: React.ReactNode;
    brandColor: string;
    systemCode: string;
}

const CONFIGS: Record<string, AgencyConfig> = {
    caltrain: {
        name: "Caltrain",
        description: "Departure Information",
        logo: <Train className="w-8 h-8 md:w-10 md:h-10 text-black" />,
        brandColor: "bg-yellow-400",
        systemCode: "SF-BAY-CORE"
    },
    ttc: {
        name: "TTC Toronto",
        description: "Subway & Streetcar Feed",
        logo: <Train className="w-8 h-8 md:w-10 md:h-10 text-white" />,
        brandColor: "bg-red-600",
        systemCode: "ON-GTA-CORE"
    }
};

export default function TransitAirportSplitFlapDisplay() {
    const [selectedAgency, setSelectedAgency] = React.useState('caltrain');
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
            className="flex flex-col items-center justify-start min-h-screen bg-[#050505] p-4 pt-24 md:p-12 font-mono"
            style={{
                // Fluid scaling variables - tightened for absolute zero overflow
                '--flap-w': 'clamp(14px, 1.8vw, 26px)',
                '--flap-h': 'calc(var(--flap-w) * 1.57)',
                '--flap-font': 'calc(var(--flap-w) * 0.85)',
                '--flap-gap': 'calc(var(--flap-w) * 0.08)',
                // Calculated column widths for precise header alignment
                '--col-train': 'calc(3 * var(--flap-w) + 2 * var(--flap-gap))',
                '--col-dest': 'calc(16 * var(--flap-w) + 15 * var(--flap-gap))',
                '--col-time': 'calc(5 * var(--flap-w) + 4 * var(--flap-gap))',
                '--col-plat': 'calc(2 * var(--flap-w) + 1 * var(--flap-gap))',
                '--col-status': 'calc(10 * var(--flap-w) + 9 * var(--flap-gap))',
            } as React.CSSProperties}
        >
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8 w-full max-w-6xl">
                <div className="flex gap-2 md:gap-4 bg-white/5 p-1 rounded-full border border-white/10">
                    <button
                        onClick={() => setSelectedAgency('caltrain')}
                        className={cn(
                            "px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all",
                            selectedAgency === 'caltrain' ? "bg-yellow-400 text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        Caltrain
                    </button>
                    <button
                        onClick={() => setSelectedAgency('ttc')}
                        className={cn(
                            "px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all",
                            selectedAgency === 'ttc' ? "bg-red-600 text-white shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        TTC Toronto
                    </button>
                </div>

                <div className="flex items-center gap-2 group relative">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={cn(
                            "p-3 rounded-full border transition-all",
                            isMuted
                                ? "bg-white/5 border-white/10 text-white/30 hover:text-white/60"
                                : "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        )}
                        title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                        onMouseEnter={() => setShowAudioInfo(true)}
                        onMouseLeave={() => setShowAudioInfo(false)}
                        className="p-2 text-white/30 hover:text-white/60 transition-colors flex items-center justify-center translate-y-[2px]"
                    >
                        <Info className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                        {showAudioInfo && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute top-full mt-4 left-0 w-64 p-4 bg-black/95 border border-white/10 rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-xl"
                            >
                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 font-mono">Audio Engine</div>
                                <p className="text-[11px] text-white/80 leading-relaxed font-mono">
                                    Procedural mechanical &quot;clacks&quot; synthesized in real-time using Web Audio.
                                    <br /><br />
                                    Uses three layers:
                                    <br />• <span className="text-yellow-400">Snap</span>: High-freq transient
                                    <br />• <span className="text-blue-400">Thud</span>: Low-freq mass
                                    <br />• <span className="text-green-400">Ring</span>: Metallic resonance
                                    <br /><br />
                                    Each click is uniquely randomized for a tactile, natural feel.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="w-full max-w-7xl bg-[#111] px-4 py-8 md:px-4 lg:px-10 md:py-12 rounded-2xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-x-hidden">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6 px-4">
                    <div className="flex items-center gap-6">
                        <div className={cn(config.brandColor, "p-2 md:p-3 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors duration-500")}>
                            {config.logo}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-5xl font-black text-white tracking-[0.1em] uppercase italic leading-none">{config.name}</h1>
                            <p className={cn("text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mt-2 opacity-90 transition-colors duration-500", selectedAgency === 'caltrain' ? 'text-yellow-400' : 'text-red-500')}>
                                {config.description}
                            </p>
                        </div>
                    </div>
                    <div className={cn("flex flex-col items-start md:items-end border-l-2 md:border-l-0 md:border-r-2 pl-4 md:pl-0 md:pr-4 transition-colors duration-500", selectedAgency === 'caltrain' ? 'border-yellow-400' : 'border-red-600')}>
                        <div className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mt-1">Local Time</div>
                    </div>
                </div>

                {/* Board Headers */}
                <div className="hidden md:grid md:grid-cols-[var(--col-train)_var(--col-dest)_var(--col-time)_var(--col-plat)_var(--col-status)] gap-3 lg:gap-6 mb-6 px-4">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Train</span>
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Destination</span>
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Time</span>
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Plat</span>
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Status</span>
                </div>

                {/* Mobile Header (Simplified) */}
                <div className="md:hidden flex justify-between mb-4 px-4 text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">
                    <span>Transit Info</span>
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-3 md:gap-4">
                    {loading ? (
                        <div className={cn("animate-pulse py-20 text-center tracking-[0.5em] uppercase font-bold text-xs md:text-base", selectedAgency === 'caltrain' ? 'text-yellow-400' : 'text-red-500')}>
                            Connecting to Transit Feed...
                        </div>
                    ) : (
                        data.map((trip) => (
                            <div key={trip.id} className="flex flex-col md:grid md:grid-cols-[var(--col-train)_var(--col-dest)_var(--col-time)_var(--col-plat)_var(--col-status)] gap-3 md:gap-3 lg:gap-6 items-start md:items-center bg-white/[0.015] hover:bg-white/[0.04] py-3 md:py-4 px-4 transition-all duration-300 rounded-lg group border border-white/[0.02] hover:border-white/10 shadow-sm md:overflow-visible">
                                {/* Row 1: Train + Destination */}
                                <div className="flex items-center gap-4 w-full md:contents">
                                    <div className="flex-shrink-0">
                                        <SplitFlapRow text={trip.trainNumber} length={3} onFlip={playClick} interactive={true} />
                                    </div>
                                    <div className="flex-grow min-w-0 md:contents">
                                        <SplitFlapRow text={trip.destination} length={14} onFlip={playClick} interactive={true} className="md:hidden" />
                                        <SplitFlapRow text={trip.destination} length={16} onFlip={playClick} interactive={true} className="hidden md:flex" />
                                    </div>
                                </div>

                                {/* Row 2 (Mobile only): Status + Time & Platform */}
                                <div className="md:hidden flex flex-col gap-4 w-full py-4 border-t border-white/5 mt-1 rounded-b-lg">
                                    <div className="flex justify-start">
                                        <SplitFlapRow
                                            text={trip.status}
                                            length={10}
                                            onFlip={playClick}
                                            interactive={true}
                                            className={cn(
                                                "transition-colors duration-700",
                                                trip.status === 'DELAYED' ? 'text-red-500' :
                                                    trip.status === 'BOARDING' ? 'text-green-500' :
                                                        trip.status === 'DEPARTED' ? 'text-white/10' : ''
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between w-full text-white/40">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            <SplitFlapRow text={trip.arrivalTime} length={5} onFlip={playClick} interactive={true} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-[10px] font-black uppercase tracking-tight mr-1">Plat</span>
                                            <SplitFlapRow text={trip.gate} length={2} onFlip={playClick} interactive={true} />
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop only cells */}
                                <SplitFlapRow text={trip.arrivalTime} length={5} onFlip={playClick} interactive={true} className="hidden md:flex" />
                                <SplitFlapRow text={trip.gate} length={2} onFlip={playClick} interactive={true} className="hidden md:flex" />
                                <div className="hidden md:flex justify-start">
                                    <SplitFlapRow
                                        text={trip.status}
                                        length={10}
                                        onFlip={playClick}
                                        interactive={true}
                                        className={cn(
                                            "transition-colors duration-700",
                                            trip.status === 'DELAYED' ? 'text-red-500' :
                                                trip.status === 'BOARDING' ? 'text-green-500' :
                                                    trip.status === 'DEPARTED' ? 'text-white/10' : ''
                                        )}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer info */}
                <div className="mt-16 flex flex-col md:flex-row gap-6 justify-between items-center text-[9px] md:text-[10px] text-white/20 font-bold tracking-[0.3em] uppercase pt-8 border-t border-white/5">
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                        <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" /> Network Status: Online</span>
                        <span className="flex items-center gap-3">
                            <div className={cn("w-1.5 h-1.5 rounded-full", selectedAgency === 'caltrain' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]')} />
                            Data Feed: Active
                        </span>
                    </div>
                    <div className="opacity-50 tracking-[0.5em]">System V26.4.2 // {config.systemCode}</div>
                </div>
            </div>

            <style jsx global>{`
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