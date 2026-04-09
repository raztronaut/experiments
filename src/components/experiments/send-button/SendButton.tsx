"use client";

import { Mic, Paperclip } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { AnimatedPlaceholder } from "./AnimatedPlaceholder";
import { AnimatedSendButton } from "./AnimatedSendButton";
import { ExpandedControls } from "./ExpandedControls";
import { useClickOutside } from "./useClickOutside";
import { containerVariants } from "./variants";

/** Default placeholder suggestions for the input */
const PLACEHOLDERS = [
  "How to center a div without crying",
  "Explain why my code works only on my machine",
  "Start a new project I'll definitely finish this time",
  "Write a polite email to the person who broke the build",
  "How to survive a meeting that could have been an email",
  "Summarize the terms and conditions I definitely read",
];

/**
 * AI Chat Input component with expandable container,
 * animated placeholders, and toggle controls
 */
export function SendButton() {
  const [isActive, setIsActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [thinkActive, setThinkActive] = useState(false);
  const [deepSearchActive, setDeepSearchActive] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isExpanded = isActive || !!inputValue;

  // Collapse when clicking outside (only if no input value)
  const handleClickOutside = useCallback(() => {
    if (!inputValue) {
      setIsActive(false);
    }
  }, [inputValue]);

  useClickOutside(wrapperRef, handleClickOutside);

  const handleActivate = () => setIsActive(true);

  const handleSend = async () => {
    if (!inputValue.trim()) {
      return;
    }
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 800));
    setInputValue("");
  };

  return (
    <motion.div
      animate={isExpanded ? "expanded" : "collapsed"}
      // OUTER WRAPPER: Handles Size, Background, Shadow. NO CLIPPING.
      className="w-full max-w-3xl bg-white text-black shadow-xl transition-shadow duration-300 dark:bg-zinc-900 dark:text-white dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.15)]"
      initial="collapsed"
      onClick={handleActivate}
      ref={wrapperRef}
      style={{ borderRadius: 32 }}
      variants={containerVariants}
    >
      {/* INNER WRAPPER: Handles Clipping */}
      <div
        className="h-full w-full overflow-hidden"
        style={{ borderRadius: 32 }}
      >
        <div className="flex h-full w-full flex-col items-stretch">
          {/* Input Row */}
          <div className="flex w-full max-w-3xl items-center gap-2 rounded-full bg-white p-3 dark:bg-zinc-900">
            <button
              aria-label="Attach file"
              className="rounded-full p-3 transition hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:text-zinc-400 dark:hover:bg-zinc-800"
              title="Attach file"
              type="button"
            >
              <Paperclip size={20} />
            </button>

            {/* Text Input & Placeholder */}
            <div className="relative flex-1">
              <input
                aria-label="Message"
                className="w-full flex-1 rounded-md border-0 bg-transparent py-2 font-normal text-base outline-0 placeholder:text-gray-400 dark:text-white"
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleActivate}
                style={{ position: "relative", zIndex: 1 }}
                type="text"
                value={inputValue}
              />
              <AnimatedPlaceholder
                hasValue={!!inputValue}
                isActive={isActive}
                placeholders={PLACEHOLDERS}
              />
            </div>

            <button
              aria-label="Voice input"
              className="group rounded-full p-3 transition hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Voice input"
              type="button"
            >
              <Mic
                className="transition-all group-hover:fill-zinc-400 dark:group-hover:fill-zinc-700"
                size={20}
              />
            </button>
            <AnimatedSendButton
              disabled={!inputValue.trim()}
              onSend={handleSend}
            />
          </div>

          {/* Expanded Controls */}
          <ExpandedControls
            deepSearchActive={deepSearchActive}
            isVisible={isExpanded}
            onDeepSearchToggle={() => setDeepSearchActive((a) => !a)}
            onThinkToggle={() => setThinkActive((a) => !a)}
            thinkActive={thinkActive}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default SendButton;
