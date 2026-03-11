"use client";

import { Menu, UserCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import GalleryScene from "./GalleryScene";

export default function RabbitholeChatPreloader() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isInteractable, setIsInteractable] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsInteractable(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      animate={{
        backgroundColor: hasStarted ? "hsl(0, 0%, 9%)" : "hsl(0, 0%, 14%)",
      }}
      className={`relative h-screen w-full overflow-hidden font-sans text-white ${isInteractable && !hasStarted ? "cursor-pointer" : "cursor-default"}`}
      initial={{ backgroundColor: "hsl(0, 0%, 14%)" }}
      onClick={() => isInteractable && !hasStarted && setHasStarted(true)}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Gallery Layer */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-0"
            exit={{
              opacity: 0,
              transition: { duration: 1, ease: "easeInOut" },
            }}
            initial={{ opacity: 0 }}
          >
            <GalleryScene />
            <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-center text-white/40 text-xs">
              Scroll to accelerate
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
        {/* Backdrop Overlay */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-0 bg-black/40"
              exit={{ opacity: 0, transition: { duration: 0.5, delay: 0 } }}
              initial={{ opacity: 0 }}
              transition={{ delay: 5, duration: 1 }}
            />
          )}
        </AnimatePresence>

        {/* Logo Transition */}
        <motion.div
          // Initial delay for appearance
          animate={{
            opacity: 1,
            scale: hasStarted ? 0.6 : 1.5,
            y: hasStarted ? -60 : 0,
          }}
          className="relative z-20"
          initial={{ opacity: 0, scale: 1.5, y: 0 }}
          transition={{
            opacity: { delay: 5, duration: 1 },
            scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <img
            alt="Rabbithole Logo"
            className="h-32 w-32 object-contain"
            src="/experiments/rabbithole-chat-preloader/RHLogo.png"
          />
        </motion.div>

        {/* "Press anywhere" Text */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              animate={{
                opacity: 1,
                x: "-50%",
                transition: { delay: 5.5, duration: 1 },
              }}
              className="absolute top-[90%] left-1/2 z-10 whitespace-nowrap text-sm text-white/50 uppercase tracking-widest"
              exit={{ opacity: 0, x: "-50%", transition: { duration: 0.3 } }}
              initial={{ opacity: 0, x: "-50%" }}
            >
              Press anywhere to continue
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final State Content */}
        {hasStarted && (
          <motion.div
            animate={{ opacity: 1 }}
            className="pointer-events-auto absolute inset-0 flex w-full flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {/* Fake Header */}
            <div className="absolute top-0 left-0 flex w-full items-center justify-between p-6 text-sm text-zinc-400">
              <Menu className="h-5 w-5" />
              <span>Hello, Razi Syed</span>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs">
                  3 searches left
                </span>
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  <span>Profile</span>
                </div>
              </div>
            </div>

            <div className="mt-32 flex w-full max-w-xl flex-col items-center gap-6">
              <h1 className="text-2xl text-zinc-200">Start your rabbithole</h1>

              <div className="relative w-full">
                <input
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300 transition-colors focus:border-zinc-700 focus:outline-hidden"
                  placeholder="Tell me about the Vitruvian Man"
                  type="text"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
