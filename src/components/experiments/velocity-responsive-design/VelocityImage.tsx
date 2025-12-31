"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVelocityState } from "./VelocityContext";
import { ImageIcon, AlertCircle } from "lucide-react";
import { SPRING_CONFIGS } from "./constants";

interface VelocityImageProps {
    src: string;
    alt: string;
}

export const VelocityImage: React.FC<VelocityImageProps> = ({ src, alt }) => {
    const { normalizedVelocity, readingState } = useVelocityState();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const isSkim = readingState === "skim";

    const opacity = 0.8 + (1 - normalizedVelocity) * 0.2;

    return (
        <motion.div
            layout="position"
            initial={false}
            animate={{
                height: isSkim ? "auto" : 0,
                opacity: isSkim ? 1 : 0,
                marginBottom: isSkim ? 80 : 0,
                marginTop: isSkim ? 80 : 0,
                pointerEvents: isSkim ? "auto" : "none"
            }}
            transition={SPRING_CONFIGS.IMAGE_TRANSITION}
            className="relative px-4 sm:px-0 w-full overflow-hidden"
        >
            <motion.div
                className="relative z-10 overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 bg-zinc-900 aspect-video min-h-[300px] flex items-center justify-center"
                style={{
                    transformOrigin: "center center",
                }}
                animate={{
                    opacity: opacity,
                    y: isSkim ? -normalizedVelocity * 20 : 0,
                }}
                transition={SPRING_CONFIGS.IMAGE_MOTION}
            >
                <AnimatePresence mode="wait">
                    {/* Only render image if we are skimming or transitioning */}
                    {(isSkim || normalizedVelocity > 0.1) && !error && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full relative"
                        >
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
                                    <ImageIcon size={48} strokeWidth={1} className="animate-pulse" />
                                </div>
                            )}
                            <motion.img
                                src={src}
                                alt={alt}
                                className="w-full h-full object-cover block"
                                onLoad={() => setLoading(false)}
                                onError={() => setError(true)}
                                transition={{ duration: 0.5 }}
                            />
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-2 text-zinc-600"
                        >
                            <AlertCircle size={40} strokeWidth={1} />
                            <span className="text-xs font-mono uppercase tracking-widest">{alt} (Load Failed)</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                        background: isSkim && !error
                            ? `linear-gradient(to bottom, rgba(0,0,0,${normalizedVelocity * 0.3}), transparent)`
                            : "rgba(0,0,0,0)"
                    }}
                />

                {/* Subtle highlight instead of blur */}
                {normalizedVelocity > 0.4 && !error && (
                    <motion.div
                        className="absolute inset-0 bg-white/5 pointer-events-none mix-blend-overlay"
                        style={{
                            opacity: (normalizedVelocity - 0.4) * 1.5
                        }}
                    />
                )}
            </motion.div>

            <motion.div
                className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-10"
                animate={{
                    opacity: isSkim && !error ? normalizedVelocity * 0.3 : 0
                }}
            />
        </motion.div>
    );
};
