"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check } from "lucide-react";

// ============================================================================
// STATE MACHINE
// ============================================================================
// The button has three states that control the animation flow:
// - "idle": Default state, shows the send arrow icon
// - "sending": Triggered on click, arrow flies away
// - "success": Shows checkmark after send completes
type SendButtonState = "idle" | "sending" | "success";

interface AnimatedSendButtonProps {
    /** Callback when send is triggered. If provided, button waits for it to complete. */
    onSend?: () => Promise<void> | void;
    /** Whether the button is disabled (grayed out, no interaction) */
    disabled?: boolean;
}

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================
// Adjust these values to change animation timing:

/** How long the arrow fly-away animation takes (in seconds) */
const ARROW_FLY_DURATION = 0.6;

/** How long the checkmark fade-in takes (in seconds) */
const CHECKMARK_FADE_DURATION = 0.3;

/** How long to show the success checkmark before resetting (in milliseconds) */
const SUCCESS_DISPLAY_TIME = 2000;

/** Default delay if no onSend callback provided (in milliseconds) */
const DEFAULT_SEND_DELAY = 600;

/**
 * Animated send button with fly-away arrow and checkmark success state
 * 
 * Animation sequence:
 * 1. Click → Arrow pulls back slightly (bottom-left)
 * 2. Arrow flies away to top-right and fades out
 * 3. Checkmark with white circle fades in with blur effect
 * 4. After SUCCESS_DISPLAY_TIME, resets to idle
 */
export function AnimatedSendButton({ onSend, disabled }: AnimatedSendButtonProps) {
    const [state, setState] = useState<SendButtonState>("idle");

    const handleClick = async () => {
        // Prevent double-clicks or clicks while animating
        if (state !== "idle" || disabled) return;

        // Start the fly-away animation
        setState("sending");

        // Wait for actual send operation, or simulate delay
        if (onSend) {
            await onSend();
        } else {
            await new Promise((resolve) => setTimeout(resolve, DEFAULT_SEND_DELAY));
        }

        // Show success state
        setState("success");

        // Reset to idle after displaying success
        setTimeout(() => {
            setState("idle");
        }, SUCCESS_DISPLAY_TIME);
    };

    return (
        <motion.button
            // ========================================================================
            // BUTTON CONTAINER STYLING
            // ========================================================================
            // - overflow-hidden: Clips the arrow as it flies out of bounds
            // - rounded-full: Circular button shape
            // - Change width/height to resize the button
            className="relative flex items-center justify-center bg-black text-white p-3 rounded-full font-medium overflow-hidden"
            title="Send"
            type="button"
            tabIndex={-1}
            onClick={handleClick}
            disabled={disabled || state !== "idle"}

            // Subtle press effect - only when idle and not disabled
            whileTap={state === "idle" && !disabled ? { scale: 0.95 } : undefined}

            // Button dimensions - adjust to change button size
            style={{ width: 44, height: 44 }}
        >
            {/* AnimatePresence handles exit animations when elements are removed */}
            {/* mode="wait" ensures old element fully exits before new one enters */}
            <AnimatePresence mode="wait">

                {/* ================================================================== */}
                {/* SEND ARROW ICON - Visible in "idle" and "sending" states */}
                {/* ================================================================== */}
                {(state === "idle" || state === "sending") && (
                    <motion.div
                        key="send" // Required for AnimatePresence to track this element

                        // Starting position (center of button)
                        initial={{ x: 0, y: 0 }}

                        // Animation depends on current state
                        animate={state === "sending"
                            ? {
                                // KEYFRAME ANIMATION for fly-away effect:
                                // The arrays define keyframes at times specified by `times` below

                                // X position: [start, pull-back, fly-right]
                                // - 0: Starting position
                                // - -3: Slight pull back (bottom-left direction)
                                // - 40: Fly off to the right (adjust for faster/slower exit)
                                x: [0, -3, 40],

                                // Y position: [start, pull-back, fly-up]
                                // - 0: Starting position  
                                // - 3: Slight pull down (bottom-left direction)
                                // - -40: Fly off upward (matches diagonal of send icon)
                                y: [0, 3, -40],

                                // Opacity fade: [visible, visible, invisible]
                                // Stays visible during pull-back, fades during fly-away
                                opacity: [1, 1, 0]
                            }
                            : { x: 0, y: 0 } // Idle state - stay centered
                        }

                        // Fallback exit animation (shouldn't normally trigger due to mode="wait")
                        exit={{ opacity: 0 }}

                        transition={{
                            // Total duration of the fly-away animation
                            // ADJUST THIS to make arrow fly faster/slower
                            duration: ARROW_FLY_DURATION,

                            // When each keyframe occurs (0 = start, 1 = end)
                            // - 0: Start at position 0
                            // - 0.15: Pull-back happens at 15% of duration (~135ms)
                            // - 1: Fly-away completes at 100%
                            // ADJUST 0.15 to change how long the pull-back pause lasts
                            times: [0, 0.4, 1],

                            // Easing function - "easeOut" starts fast, ends slow
                            // Other options: "easeIn", "easeInOut", "linear", [cubic-bezier]
                            ease: "easeOut"
                        }}

                        className="absolute"
                    >
                        {/* The actual send icon - adjust size prop to change icon size */}
                        <Send size={18} />
                    </motion.div>
                )}

                {/* ================================================================== */}
                {/* SUCCESS CHECKMARK - Visible only in "success" state */}
                {/* ================================================================== */}
                {state === "success" && (
                    <motion.div
                        key="success" // Required for AnimatePresence to track this element
                        className="absolute flex items-center justify-center"

                        // Initial state: invisible and blurred
                        // ADJUST filter blur value for more/less blur effect
                        initial={{ opacity: 0, filter: "blur(8px)" }}

                        // Animate to: fully visible and sharp
                        animate={{ opacity: 1, filter: "blur(0px)" }}

                        // Exit animation when leaving success state
                        exit={{ opacity: 0 }}

                        transition={{
                            // How fast the checkmark fades in
                            // ADJUST THIS to make checkmark appear faster/slower
                            duration: CHECKMARK_FADE_DURATION,
                            ease: "easeOut"
                        }}
                    >
                        {/* White circle background for the checkmark */}
                        {/* ADJUST w-6 h-6 to change circle size */}
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            {/* Checkmark icon */}
                            {/* ADJUST size and strokeWidth to change checkmark appearance */}
                            <Check className="text-black" size={14} strokeWidth={4.5} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
