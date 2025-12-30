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
        <div className="flex flex-col items-center justify-start min-h-screen bg-[#050505] p-4 md:p-12 font-mono">
            {/* Control Bar */}
            <div className="flex items-center gap-6 mb-8">
                <div className="flex gap-4 bg-white/5 p-1 rounded-full border border-white/10">
                    <button
                        onClick={() => setSelectedAgency('caltrain')}
                        className={cn(
                            "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                            selectedAgency === 'caltrain' ? "bg-yellow-400 text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        Caltrain
                    </button>
                    <button
                        onClick={() => setSelectedAgency('ttc')}
                        className={cn(
                            "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
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
                                    Procedural mechanical "clacks" synthesized in real-time using Web Audio.
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

            <div className="w-full max-w-6xl bg-[#111] px-4 py-8 md:px-10 md:py-12 rounded-2xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6 px-4">
                    <div className="flex items-center gap-6">
                        <div className={cn(config.brandColor, "p-2 md:p-3 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors duration-500")}>
                            {config.logo}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-[0.1em] uppercase italic leading-none">{config.name}</h1>
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
                <div className="grid grid-cols-[60px_1fr_90px] md:grid-cols-[90px_1fr_150px_70px_250px] gap-4 md:gap-8 mb-6 px-4">
                    <span className="text-[9px] md:text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Train</span>
                    <span className="text-[9px] md:text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Destination</span>
                    <span className="hidden md:block text-[9px] md:text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Time</span>
                    <span className="hidden md:block text-[9px] md:text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Plat</span>
                    <span className="text-[9px] md:text-[10px] text-white/40 font-black uppercase tracking-[0.2em] md:text-left text-right">Status</span>
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-3 md:gap-4">
                    {loading ? (
                        <div className={cn("animate-pulse py-20 text-center tracking-[0.5em] uppercase font-bold text-xs md:text-base", selectedAgency === 'caltrain' ? 'text-yellow-400' : 'text-red-500')}>
                            Connecting to Transit Feed...
                        </div>
                    ) : (
                        data.map((trip) => (
                            <div key={trip.id} className="grid grid-cols-[60px_1fr_90px] md:grid-cols-[90px_1fr_150px_70px_250px] gap-4 md:gap-8 items-center bg-white/[0.02] hover:bg-white/[0.04] py-3 px-4 transition-all duration-300 rounded-lg group border border-white/[0.02] hover:border-white/10 shadow-sm">
                                <SplitFlapRow text={trip.trainNumber} length={3} onFlip={playClick} interactive={true} />
                                <div className="flex flex-col min-w-0">
                                    <SplitFlapRow text={trip.destination} length={10} onFlip={playClick} interactive={true} className="md:hidden" />
                                    <SplitFlapRow text={trip.destination} length={16} onFlip={playClick} interactive={true} className="hidden md:flex" />
                                    {/* Show time/platform inline on mobile */}
                                    <div className="flex gap-4 mt-2 md:hidden text-white/30 text-[9px] font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1 opacity-60"><Clock className="w-2.5 h-2.5" /> {trip.arrivalTime}</span>
                                        <span className="flex items-center gap-1 opacity-60"><MapPin className="w-2.5 h-2.5" /> {trip.gate}</span>
                                    </div>
                                </div>
                                <SplitFlapRow text={trip.arrivalTime} length={5} onFlip={playClick} interactive={true} className="hidden md:flex" />
                                <SplitFlapRow text={trip.gate} length={2} onFlip={playClick} interactive={true} className="hidden md:flex" />
                                <div className="flex justify-end md:justify-start">
                                    <SplitFlapRow
                                        text={trip.status}
                                        length={8}
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