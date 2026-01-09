/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GalleryScene from "./GalleryScene";
import { UserCircle, Menu } from "lucide-react";

export default function RabbitholeChatPreloader() {
    const [hasStarted, setHasStarted] = useState(false);
    const [isInteractable, setIsInteractable] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsInteractable(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            className={`relative w-full h-screen overflow-hidden font-sans text-white ${isInteractable && !hasStarted ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => isInteractable && !hasStarted && setHasStarted(true)}
            initial={{ backgroundColor: "hsl(0, 0%, 14%)" }}
            animate={{ backgroundColor: hasStarted ? "hsl(0, 0%, 9%)" : "hsl(0, 0%, 14%)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
        >
            {/* Gallery Layer */}
            <AnimatePresence>
                {!hasStarted && (
                    <motion.div
                        className="absolute inset-0 z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
                    >
                        <GalleryScene />
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-white/40 text-xs pointer-events-none z-10">
                            Scroll to accelerate
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* UI Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">

                {/* Backdrop Overlay */}
                <AnimatePresence>
                    {!hasStarted && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.5, delay: 0 } }}
                            transition={{ delay: 5, duration: 1 }}
                            className="absolute inset-0 bg-black/40 z-0"
                        />
                    )}
                </AnimatePresence>

                {/* Logo Transition */}
                <motion.div
                    // Initial delay for appearance
                    initial={{ opacity: 0, scale: 1.5, y: 0 }}
                    animate={{
                        opacity: 1,
                        scale: hasStarted ? 0.6 : 1.5,
                        y: hasStarted ? -60 : 0
                    }}
                    transition={{
                        opacity: { delay: 5, duration: 1 },
                        scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                        y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                    }}
                    className="relative z-20"
                >
                    <img
                        src="/experiments/rabbithole-chat-preloader/RHLogo.png"
                        alt="Rabbithole Logo"
                        className="w-32 h-32 object-contain"
                    />
                </motion.div>

                {/* "Press anywhere" Text */}
                <AnimatePresence>
                    {!hasStarted && (
                        <motion.div
                            initial={{ opacity: 0, x: "-50%" }}
                            animate={{ opacity: 1, x: "-50%", transition: { delay: 5.5, duration: 1 } }}
                            exit={{ opacity: 0, x: "-50%", transition: { duration: 0.3 } }}
                            className="absolute top-[90%] left-1/2 text-sm text-white/50 tracking-widest uppercase z-10 whitespace-nowrap"
                        >
                            Press anywhere to continue
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Final State Content */}
                {hasStarted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto w-full"
                    >
                        {/* Fake Header */}
                        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center text-sm text-zinc-400">
                            <Menu className="w-5 h-5" />
                            <span>Hello, Razi Syed</span>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 rounded-full border border-zinc-800 text-xs">3 searches left</span>
                                <div className="flex items-center gap-2">
                                    <UserCircle className="w-5 h-5" />
                                    <span>Profile</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-32 w-full max-w-xl flex flex-col items-center gap-6">
                            <h1 className="text-2xl text-zinc-200">Start your rabbithole</h1>

                            <div className="w-full relative">
                                <input
                                    type="text"
                                    placeholder="Tell me about the Vitruvian Man"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-3 px-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}