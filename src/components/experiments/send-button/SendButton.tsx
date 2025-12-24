"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Paperclip, Mic } from "lucide-react";

import { containerVariants } from "./variants";
import { useClickOutside } from "./useClickOutside";
import { AnimatedPlaceholder } from "./AnimatedPlaceholder";
import { ExpandedControls } from "./ExpandedControls";
import { AnimatedSendButton } from "./AnimatedSendButton";

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
        if (!inputValue.trim()) return;
        // Simulate sending
        await new Promise((resolve) => setTimeout(resolve, 800));
        setInputValue("");
    };

    return (
        <motion.div
            ref={wrapperRef}
            // OUTER WRAPPER: Handles Size, Background, Shadow. NO CLIPPING.
            className="w-full max-w-3xl bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xl dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.15)] transition-shadow duration-300"
            variants={containerVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
            initial="collapsed"
            style={{ borderRadius: 32 }}
            onClick={handleActivate}
        >
            {/* INNER WRAPPER: Handles Clipping */}
            <div className="w-full h-full overflow-hidden" style={{ borderRadius: 32 }}>
                <div className="flex flex-col items-stretch w-full h-full">
                    {/* Input Row */}
                    <div className="flex items-center gap-2 p-3 rounded-full bg-white dark:bg-zinc-900 max-w-3xl w-full">
                        <button
                            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition dark:text-zinc-400"
                            title="Attach file"
                            type="button"
                            tabIndex={-1}
                        >
                            <Paperclip size={20} />
                        </button>

                        {/* Text Input & Placeholder */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1 border-0 outline-0 rounded-md py-2 text-base bg-transparent w-full font-normal dark:text-white placeholder:text-gray-400"
                                style={{ position: "relative", zIndex: 1 }}
                                onFocus={handleActivate}
                            />
                            <AnimatedPlaceholder
                                placeholders={PLACEHOLDERS}
                                isActive={isActive}
                                hasValue={!!inputValue}
                            />
                        </div>

                        <button
                            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition group dark:text-zinc-400 dark:hover:text-zinc-100"
                            title="Voice input"
                            type="button"
                            tabIndex={-1}
                        >
                            <Mic className="group-hover:fill-zinc-400 dark:group-hover:fill-zinc-700 transition-all" size={20} />
                        </button>
                        <AnimatedSendButton
                            onSend={handleSend}
                            disabled={!inputValue.trim()}
                        />
                    </div>

                    {/* Expanded Controls */}
                    <ExpandedControls
                        isVisible={isExpanded}
                        thinkActive={thinkActive}
                        onThinkToggle={() => setThinkActive((a) => !a)}
                        deepSearchActive={deepSearchActive}
                        onDeepSearchToggle={() => setDeepSearchActive((a) => !a)}
                    />
                </div>
            </div>
        </motion.div>
    );
}

export default SendButton;
