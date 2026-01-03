import React, { useState, useEffect } from 'react';
import { Lightbulb, Lock, Thermometer, Music, Wifi, Fan, ShieldCheck, Tv, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScenarioConfig, ScenarioPoint } from './types';

// --- Room Visualizer ---
const IsometricRoom = ({
    lightState,
    locked,
    temp,
    media,
    purifier
}: {
    lightState: string,
    locked: boolean,
    temp: 'cool' | 'cold' | 'heat' | 'eco',
    media: boolean,
    purifier: boolean
}) => {
    // Determine wall color based on temp
    // heat: warm orange, cool: pleasant blue, cold: icy blue, eco: neutral grey
    const wallColor =
        temp === 'heat' ? '#fbbf24' :
            temp === 'cool' ? '#38bdf8' :
                temp === 'cold' ? '#818cf8' :
                    '#71717a';

    const wallOpacity = temp === 'eco' ? 0.2 : 0.4;

    const isPartyMode = lightState === 'Party';
    const lightOpacity = lightState === 'Off' ? 0
        : lightState === '25%' ? 0.2
            : lightState === '50%' ? 0.5
                : lightState === '100%' ? 0.8
                    : 0.9;

    return (
        <div className="w-full h-48 relative flex items-center justify-center transition-all duration-700">
            {/* Isometric SVG Container */}
            <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="partyGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f472b6">
                            <animate attributeName="stop-color" values="#f472b6; #a78bfa; #38bdf8; #f472b6" dur="4s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#38bdf8">
                            <animate attributeName="stop-color" values="#38bdf8; #f472b6; #a78bfa; #38bdf8" dur="4s" repeatCount="indefinite" />
                        </stop>
                    </linearGradient>
                </defs>

                {/* Floor */}
                <path d="M100 130 L100 130 L170 90 L100 50 L30 90 Z" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />

                {/* Left Wall */}
                <path d="M30 90 L30 40 L100 0 L100 50 Z"
                    fill={wallColor} fillOpacity={wallOpacity}
                    className="transition-all duration-700"
                />

                {/* Right Wall */}
                <path d="M170 90 L170 40 L100 0 L100 50 Z"
                    fill={wallColor} fillOpacity={wallOpacity * 0.8}
                    className="transition-all duration-700"
                />

                {/* Furniture: TV/Media */}
                <rect x="110" y="60" width="40" height="25" fill="#000" transform="skewY(-15)" />
                {media && (
                    <rect x="112" y="62" width="36" height="21" fill="#60a5fa" className="animate-pulse" transform="skewY(-15)" />
                )}

                {/* Furniture: Lamp */}
                <line x1="60" y1="80" x2="60" y2="40" stroke="#71717a" strokeWidth="3" />
                <circle cx="60" cy="40" r="8" fill="#d4d4d8" />

                {/* Furniture: Purifier */}
                <g transform="translate(130, 95)">
                    {/* Body - Isometric Box */}
                    {/* Left Face (darker) */}
                    <path d="M15 0 L15 -25 L0 -32.5 L0 -7.5 Z" fill="#a1a1aa" />
                    {/* Right Face (lighter) */}
                    <path d="M15 0 L15 -25 L30 -32.5 L30 -7.5 Z" fill="#e4e4e7" />
                    {/* Top Face */}
                    <path d="M0 -32.5 L15 -40 L30 -32.5 L15 -25 Z" fill="#f4f4f5" />

                    {/* Top Fan UI */}
                    <ellipse cx="15" cy="-32.5" rx="8" ry="4" fill="#52525b" opacity="0.5" />

                    {/* Fan Animation */}
                    {purifier && (
                        <g>
                            <circle cx="15" cy="-32.5" r="2" fill="#38bdf8" className="animate-pulse" />
                            {/* Particles - adjusted for new top position */}
                            <circle cx="15" cy="-40" r="1" fill="#38bdf8" opacity="0.6">
                                <animate attributeName="cy" values="-40;-60" dur="1.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.6;0" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="10" cy="-35" r="1" fill="#38bdf8" opacity="0.6">
                                <animate attributeName="cy" values="-35;-50" dur="1s" begin="0.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.6;0" dur="1s" begin="0.5s" repeatCount="indefinite" />
                            </circle>
                        </g>
                    )}
                </g>

                {/* Light Effect */}
                {lightState !== 'Off' && (
                    <path
                        d="M60 40 L30 110 L90 110 Z"
                        fill={isPartyMode ? "url(#partyGradient)" : "url(#lightGradient)"}
                        fillOpacity={lightOpacity}
                        className={cn("transition-all duration-500")}
                        filter="url(#glow)"
                    />
                )}
                <defs>
                    <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Lock Shield Overlay */}
                {locked && (
                    <g className="animate-bounce" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                        <path d="M100 20 L120 40 L100 100 L80 40 Z" fill="#10b981" fillOpacity="0.3" stroke="#10b981" />
                        <path d="M100 30 V90 M80 40 L120 40" stroke="#10b981" strokeWidth="1" />
                    </g>
                )}
            </svg>
        </div>
    );
};

const SmartHomeSidebar = ({ items }: { items: ScenarioPoint[] }) => {
    // Extract State
    const lightItem = items.find(i => i.id === 'light');
    const lightState = lightItem?.value || 'Off';

    const lockItem = items.find(i => i.id === 'lock');
    const locked = lockItem?.isActive || false;

    const tempItem = items.find(i => i.id === 'temp');
    const tempValue = tempItem?.value || 'Eco';
    // Distinguish between cool (72) and cold (68)
    const tempMode = tempValue.includes('72') ? 'cool' : tempValue.includes('68') ? 'cold' : tempValue.includes('74') ? 'heat' : 'eco';

    const media = items.find(i => i.id === 'media')?.isActive || false;
    const tv = items.find(i => i.id === 'tv')?.isActive || false;

    const [events, setEvents] = useState([
        { time: '09:41 AM', text: 'System Armed (Away)' },
    ]);

    // Simulate random network traffic
    const [netSpeed, setNetSpeed] = useState(1.2);
    useEffect(() => {
        const interval = setInterval(() => {
            setNetSpeed(prev => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(2));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const addEvent = (text: string) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setEvents(prev => [{ time, text }, ...prev].slice(0, 5));
    }

    // Ambient events
    useEffect(() => {
        const ambientMessages = [
            "Thermostat adjusting...",
            "Motion in Living Room",
            "Network Optimization",
            "Firmware Update Check",
            "Energy Usage: Low"
        ];
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const msg = ambientMessages[Math.floor(Math.random() * ambientMessages.length)];
                addEvent(msg);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Add event on state changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (locked) addEvent('Door Locked');
            else addEvent('Door Unlocked');
        }, 0);
        return () => clearTimeout(timer);
    }, [locked]);

    useEffect(() => {
        if (lightState === 'Party') {
            const timer = setTimeout(() => {
                addEvent('Party Mode Activated 🎉');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [lightState]);



    // Dynamic Power Calculation
    const calculatePower = () => {
        let power = 0.4; // Base load (fridge, router)
        if (lightState === '25%') power += 0.1;
        if (lightState === '50%') power += 0.2;
        if (lightState === '100%') power += 0.4;
        if (lightState === 'Party') power += 0.6;
        if (tv) power += 0.3;
        if (media) power += 0.2;
        if (tempMode !== 'eco') power += 1.5; // HVAC is heavy
        return power.toFixed(1);
    };

    return (
        <div className="h-full p-6 space-y-6 bg-zinc-950/90 relative overflow-hidden flex flex-col" >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

            <div className="relative z-10 pb-4 border-b border-white/10">
                <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Home Digital Twin</h3>
                <div className="flex items-baseline gap-2 justify-between">
                    <span className={cn("text-2xl font-bold transition-colors", locked ? "text-emerald-400" : "text-amber-400")}>
                        {locked ? "SECURE" : "UNLOCKED"}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                        <Activity size={12} className="animate-pulse text-emerald-500" />
                        {netSpeed} Gbps
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex-grow flex items-center justify-center">
                <IsometricRoom
                    lightState={lightState}
                    locked={locked}
                    temp={tempMode}
                    media={media || tv}
                    purifier={items.find(i => i.id === 'air')?.value === 'Auto'}
                />
            </div>

            {/* Event Log */}
            <div className="relative z-10 border-t border-white/10 pt-4">
                <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">System Log</h4>
                <div className="space-y-2 font-mono text-xs max-h-24 overflow-hidden">
                    {events.map((e, i) => (
                        <div key={i} className="flex gap-3 text-zinc-400 animate-in slide-in-from-left-2 fade-in duration-300">
                            <span className="text-zinc-600 shrink-0">{e.time}</span>
                            <span className="truncate">{e.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 mt-auto grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 p-3 rounded border border-white/5">
                    <div className="text-[10px] text-zinc-500 mb-1">TEMPERATURE</div>
                    <div className="text-xl font-bold text-white">{tempValue} <span className="text-xs font-normal text-zinc-600">INT</span></div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded border border-white/5">
                    <div className="text-[10px] text-zinc-500 mb-1">POWER DRAW</div>
                    <div className="text-xl font-bold text-white">{calculatePower()} <span className="text-xs font-normal text-zinc-600">kW</span></div>
                </div>
            </div>
        </div>
    )
}

export const SmartHomeScenario: ScenarioConfig = {
    title: "Residence Control",
    subtitle: "IoT Mesh Network",
    systemStatus: "System Online",
    statusColor: "text-emerald-400",
    getPoints: () => [
        { id: 'light', label: 'Lighting', icon: Lightbulb, isActive: true, value: '50%', x: 0.2, y: 0.3 },
        { id: 'lock', label: 'Security', icon: Lock, isActive: true, value: 'Armed', x: 0.8, y: 0.3 },
        { id: 'temp', label: 'Climate', icon: Thermometer, isActive: false, value: 'Eco', x: 0.35, y: 0.5 },
        { id: 'media', label: 'Media', icon: Music, isActive: false, value: 'Off', x: 0.2, y: 0.7 },
        { id: 'wifi', label: 'Network', icon: Wifi, isActive: true, value: '1.2Gbps', x: 0.8, y: 0.7 },
        { id: 'air', label: 'Purifier', icon: Fan, isActive: false, value: 'Off', x: 0.5, y: 0.2 },
        { id: 'cam', label: 'Cameras', icon: ShieldCheck, isActive: true, value: 'Rec', x: 0.5, y: 0.8 },
        { id: 'tv', label: 'Display', icon: Tv, isActive: false, value: 'Off', x: 0.65, y: 0.5 }, // Offset to avoid overlap
    ],
    onInteract: (items, index) => {
        // Toggle Logic
        return items.map((item, i) => {
            if (i !== index) return item;

            // Multi-state logic
            if (item.id === 'light') {
                const states = ['Off', '25%', '50%', '100%', 'Party'];
                const currIndex = states.indexOf(item.value || 'Off');
                const nextIndex = (currIndex + 1) % states.length;
                const newValue = states[nextIndex];
                return { ...item, isActive: newValue !== 'Off', value: newValue };
            }

            if (item.id === 'temp') {
                const states = ['Eco', '72°F', '68°F', '74°F']; // Eco, Cool, Super Cool, Heat
                const currIndex = states.indexOf(item.value || 'Eco');
                const nextIndex = (currIndex + 1) % states.length;
                const newValue = states[nextIndex];
                return { ...item, isActive: newValue !== 'Eco', value: newValue };
            }

            // Simple Toggle for others
            const newActive = !item.isActive;
            let newValue = item.value;

            // Updated Values
            if (item.id === 'lock') newValue = newActive ? 'Armed' : 'Unlocked';
            if (item.id === 'media') newValue = newActive ? 'Playing' : 'Off';
            if (item.id === 'tv') newValue = newActive ? 'On' : 'Off';
            if (item.id === 'air') newValue = newActive ? 'Auto' : 'Off';

            return { ...item, isActive: newActive, value: newValue };
        });
    },
    SidebarComponent: SmartHomeSidebar,
    renderCell: (ctx, point, path, isActive, isHovered) => {
        // Smart Home Specific Glow
        if (isActive && !isHovered) {
            // For party mode, use colorful gradient
            if (point.id === 'light' && point.value === 'Party') {
                const gradient = ctx.createRadialGradient(
                    point.x, point.y, 10,
                    point.x, point.y, 300
                );
                gradient.addColorStop(0, `rgba(244, 114, 182, 0.2)`);
                gradient.addColorStop(0.5, `rgba(167, 139, 250, 0.1)`);
                gradient.addColorStop(1, `rgba(56, 189, 248, 0)`);
                ctx.fillStyle = gradient;
                ctx.fill(path);
                return;
            }

            const gradient = ctx.createRadialGradient(
                point.x, point.y, 10,
                point.x, point.y, 300 // Approx max dime
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, 0.1)`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

            ctx.fillStyle = gradient;
            ctx.fill(path);
        }
    }
};
