"use client";

import { motion } from "framer-motion";
import { Lightbulb, Globe } from "lucide-react";
import { expandedControlsVariants } from "./variants";

interface ExpandedControlsProps {
    /** Whether the controls should be visible */
    isVisible: boolean;
    /** Whether Think mode is active */
    thinkActive: boolean;
    /** Callback when Think is toggled */
    onThinkToggle: () => void;
    /** Whether Deep Search is active */
    deepSearchActive: boolean;
    /** Callback when Deep Search is toggled */
    onDeepSearchToggle: () => void;
}

/**
 * Expanded controls panel with Think and Deep Search toggles
 */
export function ExpandedControls({
    isVisible,
    thinkActive,
    onThinkToggle,
    deepSearchActive,
    onDeepSearchToggle,
}: ExpandedControlsProps) {
    return (
        <motion.div
            className="w-full flex justify-start px-4 items-center text-sm"
            variants={expandedControlsVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            style={{ marginTop: 8 }}
        >
            <div className="flex gap-3 items-center">
                {/* Think Toggle */}
                <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all font-medium group ${thinkActive
                        ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    title="Think"
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onThinkToggle();
                    }}
                >
                    <Lightbulb
                        className="group-hover:fill-yellow-300 transition-all"
                        size={18}
                    />
                    Think
                </button>

                {/* Deep Search Toggle */}
                <motion.button
                    className={`flex items-center px-4 gap-1 py-2 rounded-full transition font-medium whitespace-nowrap overflow-hidden justify-start group ${deepSearchActive
                        ? "bg-blue-600/10 outline outline-blue-600/60 text-blue-950"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    title="Deep Search"
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeepSearchToggle();
                    }}
                    initial={false}
                    animate={{
                        width: deepSearchActive ? 125 : 36,
                        paddingLeft: deepSearchActive ? 8 : 9,
                    }}
                >
                    <div className="flex-1">
                        <Globe
                            className="group-hover:fill-cyan-400 transition-all"
                            size={18}
                        />
                    </div>
                    <motion.span
                        className="pb-[2px]"
                        initial={false}
                        animate={{
                            opacity: deepSearchActive ? 1 : 0,
                        }}
                    >
                        Deep Search
                    </motion.span>
                </motion.button>
            </div>
        </motion.div>
    );
}
