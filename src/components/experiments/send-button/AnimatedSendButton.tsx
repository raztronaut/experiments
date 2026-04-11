"use client";

import { Check, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ============================================================================
// STATE MACHINE
// ============================================================================
// The button has three states that control the animation flow:
// - "idle": Default state, shows the send arrow icon
// - "sending": Triggered on click, arrow flies away
// - "success": Shows checkmark after send completes
type SendButtonState = "idle" | "sending" | "success";

interface AnimatedSendButtonProps {
  /** Whether the button is disabled (grayed out, no interaction) */
  disabled?: boolean;
  /** Callback when send is triggered. If provided, button waits for it to complete. */
  onSend?: () => Promise<void> | void;
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
export function AnimatedSendButton({
  onSend,
  disabled,
}: AnimatedSendButtonProps) {
  const [state, setState] = useState<SendButtonState>("idle");

  const handleClick = async () => {
    // Prevent double-clicks or clicks while animating
    if (state !== "idle" || disabled) {
      return;
    }

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
      aria-label="Send"
      className="relative flex items-center justify-center overflow-hidden rounded-full bg-black p-3 font-medium text-white focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring dark:bg-white dark:text-black"
      disabled={disabled || state !== "idle"}
      onClick={handleClick}
      style={{ width: 44, height: 44 }}
      title="Send"
      // Subtle press effect - only when idle and not disabled
      type="button"
      // Button dimensions - adjust to change button size
      whileTap={state === "idle" && !disabled ? { scale: 0.95 } : undefined}
    >
      {/* AnimatePresence handles exit animations when elements are removed */}
      {/* mode="wait" ensures old element fully exits before new one enters */}
      <AnimatePresence mode="wait">
        {/* ================================================================== */}
        {/* SEND ARROW ICON - Visible in "idle" and "sending" states */}
        {/* ================================================================== */}
        {(state === "idle" || state === "sending") && (
          <motion.div
            animate={
              state === "sending"
                ? {
                    // KEYFRAME ANIMATION for fly-away effect:
                    // The arrays define keyframes at times specified by `times` below

                    // X position: [start, pull-back, fly-right]
                    // - 0: Starting position
                    // - -3: Slight pull back (bottom-left direction)
                    // - 40: Fly off to the right (adjust for faster/slower exit)
                    x: [0, -6, 40],

                    // Y position: [start, pull-back, fly-up]
                    // - 0: Starting position
                    // - 3: Slight pull down (bottom-left direction)
                    // - -40: Fly off upward (matches diagonal of send icon)
                    y: [0, 10, -40],

                    // Opacity fade: [visible, visible, invisible]
                    // Stays visible during pull-back, fades during fly-away
                    opacity: [1, 1, 0],
                  }
                : { x: 0, y: 0 } // Idle state - stay centered
            } // Required for AnimatePresence to track this element
            // Starting position (center of button)
            className="absolute"
            // Animation depends on current state
            exit={{ opacity: 0 }}
            // Fallback exit animation (shouldn't normally trigger due to mode="wait")
            initial={{ x: 0, y: 0 }}
            key="send"
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
              ease: "easeOut",
            }}
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
            animate={{ opacity: 1, filter: "blur(0px)" }} // Required for AnimatePresence to track this element
            className="absolute flex items-center justify-center"
            // Initial state: invisible and blurred
            // ADJUST filter blur value for more/less blur effect
            exit={{ opacity: 0 }}
            // Animate to: fully visible and sharp
            initial={{ opacity: 0, filter: "blur(8px)" }}
            // Exit animation when leaving success state
            key="success"
            transition={{
              // How fast the checkmark fades in
              // ADJUST THIS to make checkmark appear faster/slower
              duration: CHECKMARK_FADE_DURATION,
              ease: "easeOut",
            }}
          >
            {/* White circle background for the checkmark */}
            {/* ADJUST w-6 h-6 to change circle size */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-black">
              {/* Checkmark icon */}
              {/* ADJUST size and strokeWidth to change checkmark appearance */}
              <Check
                className="text-black dark:text-white"
                size={14}
                strokeWidth={4.5}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
