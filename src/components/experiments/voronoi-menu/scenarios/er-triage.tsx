import React, { useEffect, useRef, useMemo } from 'react';
import {
    Heart,
    Wind,
    Brain,
    Droplet,
    Syringe,
    Stethoscope,
    CheckCircle2,
    XCircle,
    Activity,
    UserPlus,
    Timer,
    Stethoscope as LungIcon,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScenarioConfig, ScenarioPoint } from './types';

// --- Types & Constants ---
interface VitalState {
    hr: number;
    bpSys: number;
    bpDias: number;
    spo2: number;
    description: string;
    isCrashing?: boolean;
}

// --- ECG Canvas Component ---
const ECGGraph = ({
    hr,
    flatline = false
}: {
    hr: number,
    flatline?: boolean
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dataRef = useRef<number[]>(new Array(300).fill(50));
    const stepRef = useRef(0);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            const width = canvas.width;
            const height = canvas.height;
            const centerY = height / 2;

            stepRef.current += 1;
            const framesPerBeat = Math.max(15, Math.floor(3600 / (hr || 60)));
            let nextVal = centerY;
            const t = stepRef.current;
            const cycle = t % framesPerBeat;

            if (flatline || hr === 0) {
                nextVal = centerY + (Math.random() - 0.5) * 2;
            } else {
                const qrsStart = Math.floor(framesPerBeat * 0.2);
                if (cycle >= qrsStart && cycle < qrsStart + 2) nextVal += 5;
                else if (cycle >= qrsStart + 2 && cycle < qrsStart + 4) nextVal -= 40;
                else if (cycle >= qrsStart + 4 && cycle < qrsStart + 6) nextVal += 8;
                nextVal += (Math.random() - 0.5) * 1.5;
            }

            dataRef.current.push(nextVal);
            dataRef.current.shift();

            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = flatline || hr === 0 ? '#ef4444' : (hr > 120 ? '#f59e0b' : '#34d399');
            ctx.lineWidth = 2;
            ctx.shadowBlur = 4;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath();
            for (let i = 0; i < dataRef.current.length - 1; i++) {
                const x = (i / dataRef.current.length) * width;
                const y = dataRef.current[i];
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        };
    }, [hr, flatline]);

    return <canvas ref={canvasRef} width={400} height={100} className="w-full h-24 opacity-80" />;
};

// --- Clinical Logic Helpers ---

const calculateVitals = (items: ScenarioPoint[]): VitalState => {
    const has = (id: string) => items.some(i => i.id === id && i.isActive);

    // Baseline: Hemorrhagic Shock + Airway Compromise
    let hr = 145;
    let bpSys = 80;
    let bpDias = 40;
    let spo2 = 82;
    let description = "Critical";

    // A: Airway
    const airwayFixed = has('et_tube');
    if (airwayFixed) {
        spo2 += 10; // Improvement from O2/Ventilation
        hr -= 10;
    }

    // B: Breathing (Tension Pneumothorax simulation)
    const ptxFixed = has('chest_tube') || has('needle_decomp');
    if (!ptxFixed) {
        // Obstructive Shock worsens vitals if not fixed
        spo2 -= 5;
        bpSys -= 10;
    } else {
        spo2 += 5;
        bpSys += 5;
    }

    // C: Circulation
    const fluidsRunning = has('fluids');
    const mtpRunning = has('mtp');
    // const hemorrhageControlled = has('fast_scan') && has('mtp'); // Simulation: FAST + MTP = Control

    if (mtpRunning) {
        bpSys += 25;
        bpDias += 15;
        hr -= 25;
    } else if (fluidsRunning) {
        bpSys += 10;
        bpDias += 5;
        hr -= 10;
    }

    // Normalization caps
    hr = Math.max(0, Math.min(220, hr));
    bpSys = Math.max(0, Math.min(180, bpSys));
    bpDias = Math.max(0, Math.min(110, bpDias));
    spo2 = Math.max(0, Math.min(100, spo2));

    // Dynamic Description
    if (hr === 0 || bpSys < 45 || spo2 < 60) {
        description = "CRASH / ASYSTOLE";
        hr = 0; bpSys = 0; bpDias = 0; spo2 = 0;
    } else if (spo2 < 85) {
        description = "Hypoxic Respiratory Failure";
    } else if (bpSys < 90) {
        description = "Decompensated Shock";
    } else if (hr > 110) {
        description = "Compensated Shock";
    } else {
        description = "Hemodynamically Stable";
    }

    return { hr, bpSys, bpDias, spo2, description };
};

// --- Layout Definitions ---

const LAYOUTS = {
    ARRIVAL: () => [
        { id: 'start_triage', label: 'Start Primary Survey', icon: UserPlus, x: 0.5, y: 0.5, isActive: true, value: 'Arrival' }
    ],
    PRIMARY_SURVEY: (activeIds: string[]) => [
        { id: 'airway_menu', label: 'Airway', icon: Wind, x: 0.5, y: 0.2, isActive: activeIds.includes('et_tube'), value: activeIds.includes('et_tube') ? 'Secured' : 'Blocked' },
        { id: 'breathing_menu', label: 'Breathing', icon: LungIcon, x: 0.85, y: 0.45, isActive: activeIds.includes('chest_tube'), value: activeIds.includes('chest_tube') ? 'Equal BS' : 'Absent R' },
        { id: 'circulation_menu', label: 'Circulation', icon: Heart, x: 0.5, y: 0.8, isActive: activeIds.includes('mtp'), value: 'Shock' },
        { id: 'disability', label: 'Disability', icon: Brain, x: 0.15, y: 0.45, isActive: activeIds.includes('disability'), value: 'GCS 8' },
        { id: 'vitals_node', label: 'Vitals', icon: Activity, x: 0.5, y: 0.5, isActive: false, value: 'View Status' },
        { id: 'dispo', label: 'Disposition', icon: Zap, x: 0.85, y: 0.85, isActive: false, value: 'Transfer' }
    ],
    AIRWAY_SUB: (activeIds: string[]) => [
        { id: 'back_ps', label: '< Primary Survey', icon: XCircle, x: 0.5, y: 0.5, isActive: false },
        { id: 'jaw_thrust', label: 'Jaw Thrust', icon: Brain, x: 0.3, y: 0.3, isActive: activeIds.includes('jaw_thrust'), value: 'Temp' },
        { id: 'et_tube', label: 'ET Tube (Intubate)', icon: Syringe, x: 0.7, y: 0.3, isActive: activeIds.includes('et_tube'), value: 'Definitive' },
    ],
    BREATHING_SUB: (activeIds: string[]) => [
        { id: 'back_ps', label: '< Primary Survey', icon: XCircle, x: 0.5, y: 0.5, isActive: false },
        { id: 'needle_decomp', label: 'Needle Decomp', icon: Syringe, x: 0.3, y: 0.3, isActive: activeIds.includes('needle_decomp'), value: 'Emergent' },
        { id: 'chest_tube', label: 'Chest Tube (32F)', icon: Droplet, x: 0.7, y: 0.3, isActive: activeIds.includes('chest_tube'), value: 'Placed' },
    ],
    CIRCULATION_SUB: (activeIds: string[]) => [
        { id: 'back_ps', label: '< Primary Survey', icon: XCircle, x: 0.5, y: 0.5, isActive: false },
        { id: 'fast_scan', label: 'FAST Scan', icon: Stethoscope, x: 0.3, y: 0.3, isActive: activeIds.includes('fast_scan'), value: '+ Fluid' },
        { id: 'fluids', label: '2L Crystalloid', icon: Droplet, x: 0.7, y: 0.3, isActive: activeIds.includes('fluids'), value: 'Running' },
        { id: 'mtp', label: 'MTP (Blood)', icon: Droplet, x: 0.5, y: 0.8, isActive: activeIds.includes('mtp'), value: 'Transfusing' },
    ]
};

export const ErTriageScenario: ScenarioConfig = {
    title: "Trauma Bay 1",
    subtitle: "ATLS Primary Survey Sim",
    systemStatus: "CRITICAL",
    statusColor: "text-red-500",

    getPoints: () => [
        { id: '_state_arrival', label: '', x: 0, y: 0, isActive: false },
        ...LAYOUTS.ARRIVAL()
    ],

    onInteract: (items, index) => {
        const clicked = items[index];
        const currentActiveIds = items.filter(i => i.isActive).map(i => i.id);

        // 1. Start -> Primary Survey
        if (clicked?.id === 'start_triage') {
            return [{ id: '_state_ps', label: '', x: 0, y: 0, isActive: false }, ...LAYOUTS.PRIMARY_SURVEY([])];
        }

        // 2. Primary Survey Navigation
        if (items.some(i => i.id === '_state_ps')) {
            if (clicked?.id === 'airway_menu') return [{ id: '_state_airway', label: '', x: 0, y: 0, isActive: false }, ...LAYOUTS.AIRWAY_SUB(currentActiveIds)];
            if (clicked?.id === 'breathing_menu') return [{ id: '_state_breathing', label: '', x: 0, y: 0, isActive: false }, ...LAYOUTS.BREATHING_SUB(currentActiveIds)];
            if (clicked?.id === 'circulation_menu') return [{ id: '_state_circ', label: '', x: 0, y: 0, isActive: false }, ...LAYOUTS.CIRCULATION_SUB(currentActiveIds)];

            if (clicked?.id === 'disability') {
                const newIds = clicked.isActive ? currentActiveIds.filter(id => id !== 'disability') : [...currentActiveIds, 'disability'];
                return [{ id: '_state_ps', label: '', x: 0, y: 0, isActive: false }, ...LAYOUTS.PRIMARY_SURVEY(newIds)];
            }

            if (clicked?.id === 'dispo') {
                const v = calculateVitals(items);
                if (v.hr > 0 && v.bpSys >= 90 && v.spo2 >= 90) {
                    // Win State: Transfer
                    return [{ id: 'dispo_complete', label: 'CT SCAN / OR', icon: CheckCircle2, x: 0.5, y: 0.5, isActive: true, value: 'Stabilized', color: 'green' }];
                }
            }
        }

        // 3. Sub-menu Interactions
        if (items.some(i => i.id.startsWith('_state_'))) {
            if (clicked?.id === 'back_ps') return [{ id: '_state_ps', label: '', x: 0, y: 0, isActive: false }, ...LAYOUTS.PRIMARY_SURVEY(currentActiveIds)];

            // Toggle logic for interventions
            const subInterventions = ['jaw_thrust', 'et_tube', 'needle_decomp', 'chest_tube', 'fast_scan', 'fluids', 'mtp'];
            if (clicked && subInterventions.includes(clicked.id)) {
                const newActiveIds = clicked.isActive ? currentActiveIds.filter(id => id !== clicked.id) : [...currentActiveIds, clicked.id];
                const stateId = items.find(i => i.id.startsWith('_state_'))?.id || '_state_ps';

                if (stateId === '_state_airway') return [{ id: stateId, label: '', x: 0, y: 0, isActive: false }, ...LAYOUTS.AIRWAY_SUB(newActiveIds)];
                if (stateId === '_state_breathing') return [{ id: stateId, label: '', x: 0, y: 0, isActive: false }, ...LAYOUTS.BREATHING_SUB(newActiveIds)];
                if (stateId === '_state_circ') return [{ id: stateId, label: '', x: 0, y: 0, isActive: false }, ...LAYOUTS.CIRCULATION_SUB(newActiveIds)];
            }
        }

        return items;
    },

    SidebarComponent: ({ items }) => {
        const has = (id: string) => items.some(i => i.id === id && i.isActive);
        const inState = (stateId: string) => items.some(i => i.id === stateId);
        const vitals = useMemo(() => calculateVitals(items), [items]);

        return (
            <div className="h-full flex flex-col bg-zinc-950 font-mono text-zinc-300 relative">
                {/* Vitals Monitor */}
                <div className="bg-black/95 border-b border-white/5 p-4 shadow-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase text-zinc-500 tracking-widest flex items-center gap-1">
                            <Activity className="w-3 h-3 text-emerald-500" /> LifeWatch v4.2
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full animate-pulse", vitals.hr === 0 ? "bg-red-500" : (vitals.hr > 110 ? "bg-amber-500" : "bg-emerald-500"))} />
                            <span className="text-[10px] font-bold text-zinc-400">REMOTE TELEMETRY</span>
                        </div>
                    </div>

                    <div className="relative border border-white/10 rounded bg-zinc-900/50 mb-4 overflow-hidden h-24">
                        <ECGGraph hr={vitals.hr} flatline={vitals.hr === 0} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <VitalDisplay label="HR" value={vitals.hr} unit="BPM" warning={vitals.hr > 110 || vitals.hr === 0} />
                        <VitalDisplay label="BP" value={`${vitals.bpSys}/${vitals.bpDias}`} unit="mmHg" warning={vitals.bpSys < 90} />
                        <VitalDisplay label="SpO2" value={vitals.spo2} unit="%" warning={vitals.spo2 < 90} color="text-cyan-400" />
                        <div className="flex flex-col justify-end">
                            <div className="text-[9px] text-zinc-500 uppercase">Assessment</div>
                            <div className={cn("text-[10px] font-black uppercase leading-tight tracking-tighter", vitals.hr === 0 ? "text-red-600" : (vitals.bpSys < 90 ? "text-amber-500" : "text-emerald-500"))}>
                                {vitals.description}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Protocol Log */}
                <div className="flex-grow p-4 overflow-y-auto space-y-2">
                    <div className="text-[10px] uppercase text-zinc-600 tracking-widest mb-1">Clinical Intervention Log</div>
                    <LogItem label="Trauma Activation" done={true} />
                    <LogItem label="Airway Secured" done={has('et_tube')} active={inState('_state_airway')} />
                    <LogItem label="Breath Sounds Eq." done={has('chest_tube')} active={inState('_state_breathing')} />
                    <LogItem label="Surgical Hemostatic Control" done={has('fast_scan')} active={inState('_state_circ')} />
                    <LogItem label="Volume Resuscitation" done={has('fluids') || has('mtp')} active={inState('_state_circ')} />

                    {vitals.hr === 0 && (
                        <div className="mt-4 p-2 bg-red-950/30 border border-red-500/50 rounded text-red-500 text-[10px] animate-pulse text-center font-bold">
                            WARNING: PHYSIOLOGICAL COLLAPSE
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-white/5 text-[9px] text-zinc-600 flex justify-between uppercase tracking-tighter">
                    <span>ER BAY 1</span>
                    <div className="flex gap-2">
                        <Timer className="w-3 h-3" />
                        <span>T+ 04:12</span>
                    </div>
                </div>
            </div>
        );
    },

    OverlayComponent: () => <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />
};

function VitalDisplay({ label, value, unit, warning, color }: { label: string, value: string | number, unit: string, warning?: boolean, color?: string }) {
    return (
        <div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-tighter">{label}</div>
            <div className={cn("text-2xl font-black tabular-nums tracking-tighter", warning ? "text-red-500" : (color || "text-zinc-100"))}>
                {value}<span className="text-[10px] font-normal ml-0.5 opacity-50">{unit}</span>
            </div>
        </div>
    );
}

function LogItem({ label, done, active }: { label: string, done: boolean, active?: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-2 text-[10px] p-1.5 rounded border transition-all",
            done ? "bg-zinc-900/50 border-zinc-800 text-zinc-300" : "border-transparent text-zinc-600",
            active && !done && "border-amber-500/30 text-amber-500/70"
        )}>
            {done ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-current" />}
            <span className="flex-grow uppercase font-bold tracking-tight">{label}</span>
        </div>
    );
}
