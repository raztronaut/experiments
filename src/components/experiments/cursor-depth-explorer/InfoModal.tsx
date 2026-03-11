import X from "lucide-react/dist/esm/icons/x";
import { AnimatePresence, motion } from "motion/react";
import type { PaintingData } from "./data";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  painting: PaintingData;
}

export default function InfoModal({
  isOpen,
  onClose,
  painting,
}: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          />

          {/* Modal Content */}
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="pointer-events-none fixed inset-0 z-70 flex items-center justify-center p-4"
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div
              className="pointer-events-auto relative flex w-full max-w-md flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 p-5 shadow-2xl"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerMove={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
            >
              {/* Header with Title and Close */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-light text-white text-xl tracking-wide">
                    {painting.title}
                  </h2>
                  <p className="mt-1 font-medium text-base text-white/80">
                    {painting.artist}
                  </p>
                  <p className="mt-0.5 font-mono text-sm text-white/50">
                    {painting.year}
                  </p>
                </div>
                <button
                  aria-label="Close"
                  className="-mt-2 -mr-2 shrink-0 rounded-full bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  onClick={onClose}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden rounded-lg border border-white/5 bg-black/50">
                <img
                  alt={painting.title}
                  className="h-full w-full object-contain"
                  src={painting.imagePath}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
