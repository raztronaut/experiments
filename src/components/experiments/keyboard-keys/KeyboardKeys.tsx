"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Key } from "./Key";
import { cn } from "@/lib/utils";

type KeyState = "idle" | "active" | "completed" | "error" | "success"
type SequenceState = "playing" | "success" | "error"

interface KeyConfig {
    label: string
    keyCode: string
    state: KeyState
}

const INITIAL_KEYS: KeyConfig[] = [
    { label: "⌘", keyCode: "Meta", state: "active" },
    { label: "⇧", keyCode: "Shift", state: "idle" },
    { label: "P", keyCode: "p", state: "idle" },
];

const LOCKOUT_THRESHOLD = 17; // After all messages have been shown (5 messages × 3 errors each + 2 offset)
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export default function KeyboardKeys() {
    const [keys, setKeys] = useState<KeyConfig[]>(INITIAL_KEYS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const [sequenceState, setSequenceState] = useState<SequenceState>("playing");
    const [errorCount, setErrorCount] = useState(0);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lockoutIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const resetSequence = useCallback((wasSuccess = false) => {
        setKeys([...INITIAL_KEYS]);
        setCurrentIndex(0);
        setSequenceState("playing");
        setPressedKeys(new Set());
        if (wasSuccess) {
            setErrorCount(0);
        }
    }, []);

    // Start lockout when threshold is reached
    const startLockout = useCallback(() => {
        setIsLockedOut(true);
        setLockoutTimeRemaining(LOCKOUT_DURATION_MS);

        lockoutIntervalRef.current = setInterval(() => {
            setLockoutTimeRemaining(prev => {
                if (prev <= 1000) {
                    // Lockout ended
                    if (lockoutIntervalRef.current) {
                        clearInterval(lockoutIntervalRef.current);
                    }
                    setIsLockedOut(false);
                    setErrorCount(0);
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);
    }, []);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (lockoutIntervalRef.current) {
                clearInterval(lockoutIntervalRef.current);
            }
        };
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore input during lockout or success/error animations
        if (isLockedOut || sequenceState !== "playing") return;

        const key = e.key;

        // Prevent duplicate key events from key repeat
        if (pressedKeys.has(key)) return;
        setPressedKeys(prev => new Set(prev).add(key));

        const expectedKey = keys[currentIndex]?.keyCode;

        // Check if current key matches expected
        if (expectedKey && key.toLowerCase() === expectedKey.toLowerCase()) {
            // Correct key!
            if (currentIndex === keys.length - 1) {
                // All keys pressed correctly - success!
                setSequenceState("success");
                setKeys(prev => prev.map(k => ({ ...k, state: "success" as KeyState })));
                // Reset after delay
                timeoutRef.current = setTimeout(() => resetSequence(true), 2500);
            } else {
                // Mark current as completed, next as active
                setKeys(prev => prev.map((k, i) => {
                    if (i === currentIndex) return { ...k, state: "completed" as KeyState };
                    if (i === currentIndex + 1) return { ...k, state: "active" as KeyState };
                    return k;
                }));
                setCurrentIndex(prev => prev + 1);
            }
        } else if (expectedKey) {
            // Wrong key - error!
            setSequenceState("error");
            setKeys(prev => prev.map(k => ({ ...k, state: "error" as KeyState })));
            setIsShaking(true);
            const newErrorCount = errorCount + 1;
            setErrorCount(newErrorCount);

            // Check if lockout threshold reached
            if (newErrorCount >= LOCKOUT_THRESHOLD) {
                timeoutRef.current = setTimeout(() => {
                    setIsShaking(false);
                    startLockout();
                }, 600);
            } else {
                // Reset after shake animation
                timeoutRef.current = setTimeout(() => {
                    setIsShaking(false);
                    resetSequence(false);
                }, 600);
            }
        }
    }, [currentIndex, keys, pressedKeys, resetSequence, sequenceState, isLockedOut, errorCount, startLockout]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        setPressedKeys(prev => {
            const next = new Set(prev);
            next.delete(e.key);
            return next;
        });
    }, []);

    // Handle clicking on a key (simulates pressing that key)
    const handleKeyClick = useCallback((keyCode: string, keyIndex: number) => {
        // Ignore input during lockout or success/error animations
        if (isLockedOut || sequenceState !== "playing") return;

        const expectedKey = keys[currentIndex]?.keyCode;

        // Check if clicked key matches expected
        if (expectedKey && keyCode.toLowerCase() === expectedKey.toLowerCase() && keyIndex === currentIndex) {
            // Correct key!
            if (currentIndex === keys.length - 1) {
                // All keys pressed correctly - success!
                setSequenceState("success");
                setKeys(prev => prev.map(k => ({ ...k, state: "success" as KeyState })));
                // Reset after delay
                timeoutRef.current = setTimeout(() => resetSequence(true), 2500);
            } else {
                // Mark current as completed, next as active
                setKeys(prev => prev.map((k, i) => {
                    if (i === currentIndex) return { ...k, state: "completed" as KeyState };
                    if (i === currentIndex + 1) return { ...k, state: "active" as KeyState };
                    return k;
                }));
                setCurrentIndex(prev => prev + 1);
            }
        } else if (expectedKey) {
            // Wrong key - error!
            setSequenceState("error");
            setKeys(prev => prev.map(k => ({ ...k, state: "error" as KeyState })));
            setIsShaking(true);
            const newErrorCount = errorCount + 1;
            setErrorCount(newErrorCount);

            // Check if lockout threshold reached
            if (newErrorCount >= LOCKOUT_THRESHOLD) {
                timeoutRef.current = setTimeout(() => {
                    setIsShaking(false);
                    startLockout();
                }, 600);
            } else {
                // Reset after shake animation
                timeoutRef.current = setTimeout(() => {
                    setIsShaking(false);
                    resetSequence(false);
                }, 600);
            }
        }
    }, [currentIndex, keys, resetSequence, sequenceState, isLockedOut, errorCount, startLockout]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const isSuccess = sequenceState === "success";

    // Format time remaining as MM:SS
    const formatTimeRemaining = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Lockout Overlay */}
            {isLockedOut && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-8 animate-fade-in">
                    <div className="flex flex-col items-center gap-4 text-center px-8">
                        <div className="text-6xl mb-4">🤦‍♂️</div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            rethink your choices
                        </h1>
                        <p className="text-lg text-neutral-400">
                            and try again in
                        </p>
                        <div className="text-5xl md:text-6xl font-mono font-bold text-red-500 tabular-nums">
                            {formatTimeRemaining(lockoutTimeRemaining)}
                        </div>
                    </div>
                </div>
            )}
            <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-6 p-8">
                <div className="flex flex-col items-center gap-4">
                    {/* Status text */}
                    <div className="h-6 flex items-center justify-center">
                        {isSuccess ? (
                            <p className="text-sm font-medium uppercase tracking-widest text-green-400 animate-fade-in flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Perfect!
                            </p>
                        ) : (
                            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                                Press the keys in order
                            </p>
                        )}
                    </div>

                    {/* Wrapper for keyboard + confetti */}
                    <div className="relative">
                        {/* Keyboard container */}
                        <div
                            className={cn(
                                "relative flex items-center gap-3 rounded-xl border p-4 shadow-2xl transition-all duration-300",
                                isShaking && "animate-shake",
                                isSuccess
                                    ? "border-green-500/50 bg-green-950/30 shadow-green-500/20"
                                    : "border-neutral-800 bg-neutral-950 shadow-black/50"
                            )}
                        >
                            {/* Success glow effect */}
                            {isSuccess && (
                                <div className="absolute inset-0 rounded-xl bg-green-500/10 animate-pulse-slow z-0" />
                            )}

                            {keys.map((key, index) => (
                                <div key={key.keyCode} className="relative flex items-center gap-3">
                                    {/* Key wrapper with its own confetti */}
                                    <div className="relative">
                                        {/* Confetti burst from this key - renders BEHIND the key */}
                                        {isSuccess && (
                                            <div className="absolute inset-0 z-0 pointer-events-none overflow-visible">
                                                {[...Array(15)].map((_, i) => {
                                                    // Unique seed based on key index + particle index
                                                    const uniqueIndex = index * 15 + i;
                                                    const seed = (uniqueIndex * 7919 + 1) % 100 / 100;
                                                    const seed2 = (uniqueIndex * 6271 + 13) % 100 / 100;
                                                    const seed3 = (uniqueIndex * 4903 + 7) % 100 / 100;

                                                    const angle = (i / 15) * 360 + seed * 40;
                                                    const distance = 50 + seed2 * 80;
                                                    const size = 3 + seed3 * 5;
                                                    const duration = 0.7 + seed * 0.5;
                                                    const delay = seed2 * 0.1;
                                                    const rotation = seed3 * 720 - 360;
                                                    const isRibbon = i % 5 === 0;
                                                    const isRect = i % 3 === 0 && !isRibbon;

                                                    // Color palette - vary by key for visual interest
                                                    const palettes = [
                                                        ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#ffffff'],
                                                        ['#10b981', '#34d399', '#6ee7b7', '#fcd34d', '#e5e7eb'],
                                                        ['#059669', '#10b981', '#34d399', '#f59e0b', '#ffffff'],
                                                    ];
                                                    const colors = palettes[index % 3];
                                                    const color = colors[i % colors.length];

                                                    const rad = (angle * Math.PI) / 180;
                                                    const endX = Math.cos(rad) * distance;
                                                    const endY = Math.sin(rad) * distance;

                                                    return (
                                                        <div
                                                            key={`confetti-${index}-${i}`}
                                                            className="absolute confetti-particle"
                                                            style={{
                                                                left: '50%',
                                                                top: '50%',
                                                                width: isRibbon ? `${size * 0.4}px` : isRect ? `${size * 0.6}px` : `${size}px`,
                                                                height: isRibbon ? `${size * 2.5}px` : isRect ? `${size}px` : `${size}px`,
                                                                borderRadius: isRibbon ? '2px' : isRect ? '1px' : '50%',
                                                                backgroundColor: color,
                                                                '--end-x': `${endX}px`,
                                                                '--end-y': `${endY}px`,
                                                                '--rotation': `${rotation}deg`,
                                                                '--duration': `${duration}s`,
                                                                animationDelay: `${delay}s`,
                                                            } as React.CSSProperties}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* The actual key - renders ON TOP of confetti */}
                                        <div className="relative z-10">
                                            <Key
                                                label={key.label}
                                                state={key.state}
                                                isPressed={pressedKeys.has(key.keyCode) || pressedKeys.has(key.keyCode.toLowerCase())}
                                                onPress={() => handleKeyClick(key.keyCode, index)}
                                            />
                                        </div>
                                    </div>

                                    {index < keys.length - 1 && (
                                        <span className={cn(
                                            "text-xl font-light transition-colors duration-300 relative z-10",
                                            key.state === "success" ? "text-green-400" :
                                                key.state === "error" ? "text-red-400" :
                                                    key.state === "completed" ? "text-green-400" :
                                                        "text-neutral-600"
                                        )}>+</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error streak message */}
                    {errorCount >= 2 && (() => {
                        const messages = [
                            "are you even trying? 🤔",
                            "okay this is getting embarrassing...",
                            "💀",
                            "at this point you're just testing me",
                            "im gonna ban you fr",
                        ];
                        const messageIndex = Math.min(Math.floor((errorCount - 2) / 3), messages.length - 1);
                        return (
                            <p key={messageIndex} className="text-sm font-medium text-red-400/70 animate-fade-in mt-3">
                                {messages[messageIndex]}
                            </p>
                        );
                    })()}
                </div>

                <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 1.5s ease-in-out infinite;
                }
                @keyframes confetti-burst {
                    0% { 
                        transform: translate(-50%, -50%) scale(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        transform: translate(-50%, -50%) scale(1.2) rotate(calc(var(--rotation) * 0.1));
                        opacity: 1;
                    }
                    30% {
                        opacity: 1;
                    }
                    100% { 
                        transform: translate(
                            calc(-50% + var(--end-x)), 
                            calc(-50% + var(--end-y) + 40px)
                        ) scale(0.3) rotate(var(--rotation));
                        opacity: 0;
                    }
                }
                .confetti-particle {
                    animation: confetti-burst var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
            </div>
        </>
    );
}