/**
 * Velocity-Responsive Design (VRD) Constants
 */

export const VELOCITY_THRESHOLDS = {
    SKIM_ENTER: 2500,     // Transition to skim mode at 2500 px/s
    SKIM_EXIT: 400,       // Must drop below 400 px/s to trigger exit countdown
    IS_SCROLLING: 10,
    NORMALIZATION_MAX: 3000, // Visual effects scale relative to this peak
};

export const TIMINGS = {
    SKIM_EXIT_DELAY: 2500, // Duration to stay in skim mode after speed drops
    SCROLL_LOCK_DURATION: 250, // Duration to lock velocity tracking during programmatic scrolls
};

export const SPRING_CONFIGS = {
    VELOCITY_SMOOTHING: {
        damping: 50,
        stiffness: 400
    },
    TRANSITION: {
        duration: 0.6,
        type: "spring" as const,
        damping: 30,
        stiffness: 100
    },
    IMAGE_TRANSITION: {
        type: "spring" as const,
        damping: 30,
        stiffness: 150
    },
    IMAGE_MOTION: {
        type: "spring" as const,
        damping: 25,
        stiffness: 120,
        mass: 0.5
    }
};
