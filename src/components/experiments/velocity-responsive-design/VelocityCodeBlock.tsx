"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVelocityState } from "./VelocityContext";
import { FileCode, Terminal } from "lucide-react";
import { SPRING_CONFIGS } from "./constants";

interface VelocityCodeBlockProps {
    filename: string;
    language: string;
    code: string;
}

export const VelocityCodeBlock: React.FC<VelocityCodeBlockProps> = ({ filename, language, code }) => {
    const { readingState } = useVelocityState();
    const isSkim = readingState === "skim";

    return (
        <motion.div
            layout
            transition={SPRING_CONFIGS.TRANSITION}
            className={`my-8 rounded-lg overflow-hidden border ${isSkim ? "bg-primary/5 border-primary/20" : "bg-zinc-950 border-white/10"
                }`}
            animate={{
                scale: isSkim ? 0.98 : 1,
                opacity: isSkim ? 0.8 : 1,
            }}
        >
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <FileCode size={14} className="text-primary" />
                    <span className="text-xs font-mono text-muted-foreground">{filename}</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">{language}</span>
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
                {!isSkim ? (
                    <motion.div
                        key="detailed"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="p-4 overflow-x-auto"
                    >
                        <pre className="text-sm font-mono text-zinc-300">
                            <code>{code}</code>
                        </pre>
                    </motion.div>
                ) : (
                    <motion.div
                        key="skim"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex items-center px-4 h-10 gap-3 text-primary/60 italic text-sm relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                        <Terminal size={14} />
                        <span>Implementation details collapsed for speed...</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
