import React from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import { motion, AnimatePresence } from 'framer-motion';
import { PaintingData } from './data';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    painting: PaintingData;
}

export default function InfoModal({ isOpen, onClose, painting }: InfoModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerMove={(e) => e.stopPropagation()}
                        onPointerUp={(e) => e.stopPropagation()}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            onPointerDown={(e) => e.stopPropagation()}
                            onPointerMove={(e) => e.stopPropagation()}
                            onPointerUp={(e) => e.stopPropagation()}
                            className="bg-zinc-900/90 border border-white/10 p-5 rounded-2xl max-w-md w-full shadow-2xl pointer-events-auto relative overflow-hidden flex flex-col gap-5"
                        >
                            {/* Header with Title and Close */}
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-xl font-light text-white tracking-wide">{painting.title}</h2>
                                    <p className="text-base text-white/80 font-medium mt-1">{painting.artist}</p>
                                    <p className="text-sm text-white/50 font-mono mt-0.5">{painting.year}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="p-2 -mr-2 -mt-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white flex-shrink-0"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Image Container */}
                            <div className="rounded-lg overflow-hidden border border-white/5 bg-black/50 aspect-video relative">
                                <img
                                    src={painting.imagePath}
                                    alt={painting.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
