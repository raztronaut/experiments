/**
 * Animation variants for the SendButton component
 * Extracted for maintainability and reusability
 */

/**
 * Container expand/collapse animation
 */
export const containerVariants = {
    collapsed: {
        height: 68,
        transition: { type: "spring" as const, stiffness: 120, damping: 18 },
    },
    expanded: {
        height: 128,
        transition: { type: "spring" as const, stiffness: 120, damping: 18 },
    },
};

/**
 * Placeholder container with staggered children
 */
export const placeholderContainerVariants = {
    initial: {
        clipPath: "inset(0 100% 0 0)",
    },
    animate: (length: number = 20) => ({
        clipPath: "inset(0 0% 0 0)",
        transition: {
            staggerChildren: 0.025,
            clipPath: {
                // Approximate duration to match the staggered text reveal
                // (char count * stagger delay) + buffer
                duration: length * 0.025 + 0.25,
                ease: "linear",
            },
        },
    }),
    exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
};

/**
 * Individual letter animation with blur effect
 */
export const letterVariants = {
    initial: {
        opacity: 0,
        filter: "blur(12px)",
        y: 10,
    },
    animate: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
            opacity: { duration: 0.25 },
            filter: { duration: 0.4 },
            y: { type: "spring" as const, stiffness: 80, damping: 20 },
        },
    },
    exit: {
        opacity: 0,
        filter: "blur(12px)",
        y: -10,
        transition: {
            opacity: { duration: 0.2 },
            filter: { duration: 0.3 },
            y: { type: "spring" as const, stiffness: 80, damping: 20 },
        },
    },
};

/**
 * Expanded controls visibility animation
 */
export const expandedControlsVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        pointerEvents: "none" as const,
        transition: { duration: 0.25 },
    },
    visible: {
        opacity: 1,
        y: 0,
        pointerEvents: "auto" as const,
        transition: { duration: 0.35, delay: 0.08 },
    },
};
