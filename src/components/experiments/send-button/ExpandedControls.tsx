"use client";

import { Globe, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import { expandedControlsVariants } from "./variants";

interface ExpandedControlsProps {
  /** Whether Deep Search is active */
  deepSearchActive: boolean;
  /** Whether the controls should be visible */
  isVisible: boolean;
  /** Callback when Deep Search is toggled */
  onDeepSearchToggle: () => void;
  /** Callback when Think is toggled */
  onThinkToggle: () => void;
  /** Whether Think mode is active */
  thinkActive: boolean;
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
      animate={isVisible ? "visible" : "hidden"}
      className="flex w-full items-center justify-start px-4 text-sm"
      initial="hidden"
      style={{ marginTop: 8 }}
      variants={expandedControlsVariants}
    >
      <div className="flex items-center gap-3">
        {/* Think Toggle */}
        <button
          aria-pressed={thinkActive}
          className={`group flex items-center gap-1 rounded-full px-4 py-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            thinkActive
              ? "bg-blue-600/10 text-blue-950 outline-blue-600/60 outline-solid dark:bg-blue-500/20 dark:text-blue-200 dark:outline-blue-500/50"
              : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onThinkToggle();
          }}
          title="Think"
          type="button"
        >
          <Lightbulb
            className="transition-all group-hover:fill-yellow-300"
            size={18}
          />
          Think
        </button>

        {/* Deep Search Toggle */}
        <motion.button
          animate={{
            width: deepSearchActive ? 125 : 36,
            paddingLeft: deepSearchActive ? 8 : 9,
          }}
          aria-pressed={deepSearchActive}
          className={`group flex items-center justify-start gap-1 overflow-hidden whitespace-nowrap rounded-full px-4 py-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            deepSearchActive
              ? "bg-blue-600/10 text-blue-950 outline-blue-600/60 outline-solid dark:bg-blue-500/20 dark:text-blue-200 dark:outline-blue-500/50"
              : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
          initial={false}
          onClick={(e) => {
            e.stopPropagation();
            onDeepSearchToggle();
          }}
          title="Deep Search"
          type="button"
        >
          <div className="flex-1">
            <Globe
              className="transition-all group-hover:fill-cyan-400"
              size={18}
            />
          </div>
          <motion.span
            animate={{
              opacity: deepSearchActive ? 1 : 0,
            }}
            className="pb-[2px]"
            initial={false}
          >
            Deep Search
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}
